import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  VILLAGE_TILES, VILLAGE_WIDTH, VILLAGE_HEIGHT,
  NPC_POSITIONS, VILLAGE_SPAWN, SHOP_ITEMS,
} from "../lib/village";
import { isWalkable } from "../lib/dungeon";
import {
  getSpeciesName, getMoveName, getMovesAtLevel,
  getEffectiveness, calcDamage, getStabMultiplier, getSpeciesTypes,
} from "../lib/moves";
import {
  getTeam, getProfile, saveProfile,
  addTeamMember, removeTeamMember, updateTeamMember,
} from "../lib/auth";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";
import VillageMap from "./VillageMap";
import LanguageSelector from "./LanguageSelector";
import { Bubble, BubbleContent } from "../../components/ui/bubble";

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export default function VillageGame({
  session, accountId, accountName, team, onTeamUpdate,
  onJoin, onStartDungeon, onLogout,
}) {
  const [language, setLanguage] = useState(getLanguage());
  const channelRef = useRef(null);

  useEffect(() => subscribe(setLanguage), []);
  const [players, setPlayers] = useState([]);
  const [myPlayer, setMyPlayer] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // NPC interaction state
  const [activeNPC, setActiveNPC] = useState(null);
  const [storageSelectedItem, setStorageSelectedItem] = useState(null);
  const [bankDeposit, setBankDeposit] = useState("");
  const [bankWithdraw, setBankWithdraw] = useState("");
  const [showQuizResetConfirm, setShowQuizResetConfirm] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  const showSetup = !session;

  useEffect(() => {
    if (!accountId) return;
    getProfile(accountId).then(setProfile);
  }, [accountId]);

  // Auto-join or create a village room when not in a session
  useEffect(() => {
    if (session || isConnecting) return;
    autoJoin();
  }, [session]);

  // Sync player avatar sprite when the active team member changes
  // (runs on mount and whenever team or myPlayer updates — covers both initial
  // load after quiz reset, and in-place team changes like Club Wigglytuff swap)
  useEffect(() => {
    if (!team?.[0] || !myPlayer?.id) return;
    const newSpriteId = team[0].pokemonId || team[0].pokemon_id || 25;
    if (myPlayer.sprite_id === newSpriteId) return;
    supabase
      .from("room_players")
      .update({ sprite_id: newSpriteId })
      .eq("id", myPlayer.id)
      .then(() => {
        setMyPlayer((prev) => ({ ...prev, sprite_id: newSpriteId }));
      });
  }, [team?.[0]?.pokemonId ?? team?.[0]?.pokemon_id, myPlayer?.id]);

  async function autoJoin() {
    setIsConnecting(true);
    setError("");

    try {
      const { data: existing } = await supabase
        .from("room_players")
        .select("room_id")
        .eq("player_id", accountId)
        .limit(1);

      if (existing && existing.length > 0) {
        const { data: rm } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", existing[0].room_id)
          .single();
        if (rm && rm.status === "lobby") {
          await doJoinExistingRoom(rm);
          setIsConnecting(false);
          return;
        }
        if (rm && rm.status === "playing") {
          if (onJoin) onJoin({ roomId: rm.id, roomCode: rm.code, playerId: accountId, isHost: rm.host_id === accountId });
          if (onStartDungeon) onStartDungeon();
          setIsConnecting(false);
          return;
        }
      }

      const { data: rooms } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "lobby")
        .order("created_at", { ascending: false })
        .limit(10);

      let joined = false;
      for (const candidate of rooms || []) {
        const { count } = await supabase
          .from("room_players")
          .select("*", { count: "exact", head: true })
          .eq("room_id", candidate.id);

        if (count < candidate.max_players) {
          await doJoinExistingRoom(candidate);
          joined = true;
          break;
        }
      }

      if (!joined) {
        await doCreateRoom();
      }
    } catch (err) {
      console.error("Auto-join failed:", err);
      setError("Could not connect. Try again.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function doCreateRoom() {
    const code = generateRoomCode();
    const seed = Math.floor(Math.random() * 999999);

    const { data: roomData, error: roomErr } = await supabase
      .from("rooms")
      .insert({ code, host_id: accountId, dungeon_seed: seed, max_players: 4, status: "lobby" })
      .select()
      .single();

    if (roomErr) { setError(roomErr.message); return; }

    const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;

    const { data: playerData, error: playerErr } = await supabase
      .from("room_players")
      .insert({
        room_id: roomData.id, player_id: accountId, player_name: accountName,
        is_host: true, sprite_id: spriteId, level: team[0]?.level || 5,
        hp: team[0]?.hp || 100, max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
        position_x: VILLAGE_SPAWN.x, position_y: VILLAGE_SPAWN.y,
      })
      .select()
      .single();

    if (playerErr) { setError(playerErr.message); return; }

    setRoom(roomData);
    setRoomCode(code);
    setPlayers([playerData]);
    setMyPlayer(playerData);
    if (onJoin) onJoin({ roomId: roomData.id, roomCode: code, playerId: accountId, isHost: true });
  }

  async function doJoinExistingRoom(roomData) {
    const { data: existing } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomData.id)
      .eq("player_id", accountId);

    let playerData;
    if (existing && existing.length > 0) {
      playerData = existing[0];
      await supabase
        .from("room_players")
        .update({ position_x: VILLAGE_SPAWN.x, position_y: VILLAGE_SPAWN.y })
        .eq("id", playerData.id);
      playerData.position_x = VILLAGE_SPAWN.x;
      playerData.position_y = VILLAGE_SPAWN.y;
    } else {
      const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;
      const { data: pd, error: pe } = await supabase
        .from("room_players")
        .insert({
          room_id: roomData.id, player_id: accountId, player_name: accountName,
          is_host: false, sprite_id: spriteId, level: team[0]?.level || 5,
          hp: team[0]?.hp || 100, max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
          position_x: VILLAGE_SPAWN.x, position_y: VILLAGE_SPAWN.y,
        })
        .select()
        .single();
      if (pe) { setError(pe.message); return; }
      playerData = pd;
    }

    setRoom(roomData);
    setRoomCode(roomData.code);
    if (onJoin) onJoin({ roomId: roomData.id, roomCode: roomData.code, playerId: accountId, isHost: roomData.host_id === accountId });
  }

  function handleLogout() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (onLogout) onLogout();
  }

  // ─── Room creation / joining (same as DungeonLobby) ───

  async function createRoom() {
    setError("");
    const code = generateRoomCode();
    const seed = Math.floor(Math.random() * 999999);

    const { data: roomData, error: roomErr } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: accountId,
        dungeon_seed: seed,
        max_players: 4,
        status: "lobby",
      })
      .select()
      .single();

    if (roomErr) { setError(roomErr.message); return; }

    const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;

    const { data: playerData, error: playerErr } = await supabase
      .from("room_players")
      .insert({
        room_id: roomData.id,
        player_id: accountId,
        player_name: accountName,
        is_host: true,
        sprite_id: spriteId,
        level: team[0]?.level || 5,
        hp: team[0]?.hp || 100,
        max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
        position_x: VILLAGE_SPAWN.x,
        position_y: VILLAGE_SPAWN.y,
      })
      .select()
      .single();

    if (playerErr) { setError(playerErr.message); return; }

    setRoom(roomData);
    setRoomCode(code);
    setPlayers([playerData]);
    setMyPlayer(playerData);
    if (onJoin) onJoin({ roomId: roomData.id, roomCode: code, playerId: accountId, isHost: true });
  }

  async function joinRoom() {
    setError("");
    const code = roomCode.toUpperCase().trim();
    if (!code || code.length < 4) { setError("Enter a room code"); return; }

    const { data: roomData, error: roomErr } = await supabase
      .from("rooms")
      .select("*")
      .filter("code", "ilike", code)
      .single();

    if (roomErr || !roomData) { setError("Room not found"); return; }
    if (roomData.status !== "lobby") { setError("Game already started"); return; }

    const { count } = await supabase
      .from("room_players")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomData.id);

    if (count >= roomData.max_players) { setError("Room is full"); return; }

    const { data: existing } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomData.id)
      .eq("player_id", accountId);

    let playerData;
    if (existing && existing.length > 0) {
      playerData = existing[0];
    } else {
      const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;
      const { data: pd, error: pe } = await supabase
        .from("room_players")
        .insert({
          room_id: roomData.id,
          player_id: accountId,
          player_name: accountName,
          is_host: false,
          sprite_id: spriteId,
          level: team[0]?.level || 5,
          hp: team[0]?.hp || 100,
          max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
          position_x: VILLAGE_SPAWN.x,
          position_y: VILLAGE_SPAWN.y,
        })
        .select()
        .single();
      if (pe) { setError(pe.message); return; }
      playerData = pd;
    }

    setRoom(roomData);
    setRoomCode(code);
    if (onJoin) onJoin({ roomId: roomData.id, roomCode: code, playerId: accountId, isHost: false });
  }

  // ─── Subscribe to room channel (when session exists) ───

  useEffect(() => {
    if (!session) return;

    const channel = supabase.channel(`room:${session.roomId}`, {
      broadcast: { self: true },
    });

    channel
      .on("broadcast", { event: "player_move" }, ({ payload }) => {
        if (payload.playerId === session.playerId) return;
        setPlayers((prev) =>
          prev.map((p) =>
            p.player_id === payload.playerId
              ? { ...p, position_x: payload.x, position_y: payload.y }
              : p
          )
        );
      })
      .on("broadcast", { event: "player_joined" }, () => {
        supabase
          .from("room_players")
          .select("*")
          .eq("room_id", session.roomId)
          .order("joined_at")
          .then(({ data }) => {
            if (data) {
              setPlayers(data);
              const me = data.find((p) => p.player_id === session.playerId);
              if (me) setMyPlayer(me);
            }
          });
      })
      .on("broadcast", { event: "game_start" }, () => {
        if (!session?.isHost && onStartDungeon) onStartDungeon();
      })
      .on("broadcast", { event: "player_left" }, ({ payload }) => {
        setPlayers((prev) => prev.filter((p) => p.player_id !== payload.playerId));
      })
      .on("broadcast", { event: "chat_message" }, ({ payload }) => {
        setMessages((prev) => [...prev, { id: Date.now(), playerName: payload.playerName, text: payload.text }]);
      })
      // Presence sync: detect abrupt disconnects (tab close, network drop)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set(
          Object.values(state).flatMap((p) => p.map((p2) => p2.player_id))
        );
        setPlayers((prev) => prev.filter((p) => onlineIds.has(p.player_id)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "player_joined",
            payload: { playerId: session.playerId },
          });
          channel.track({
            player_id: session.playerId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.send({
        type: "broadcast",
        event: "player_left",
        payload: { playerId: session.playerId },
      });
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load room data when session is set
  useEffect(() => {
    if (!session) return;
    loadRoomData();
  }, [session]);

  async function loadRoomData() {
    if (!session) return;
    const [roomData, playersData] = await Promise.all([
      supabase.from("rooms").select("*").eq("id", session.roomId).single(),
      supabase.from("room_players").select("*").eq("room_id", session.roomId).order("joined_at"),
    ]);
    if (roomData.data) setRoom(roomData.data);
    if (playersData.data) {
      setPlayers(playersData.data);
      const me = playersData.data.find((p) => p.player_id === session.playerId);
      if (me) setMyPlayer(me);
    }
  }

  // ─── Movement ───

  async function moveTo(x, y) {
    if (!session || !myPlayer) return;
    if (!isWalkable(VILLAGE_TILES, x, y)) return;
    if (Math.abs(x - myPlayer.position_x) > 1 || Math.abs(y - myPlayer.position_y) > 1) return;

    const tileNPCs = NPC_POSITIONS.find((n) => n.x === x && n.y === y);
    if (tileNPCs) return;

    setMyPlayer((p) => ({ ...p, position_x: x, position_y: y }));
    setPlayers((prev) =>
      prev.map((p) =>
        p.player_id === session.playerId
          ? { ...p, position_x: x, position_y: y }
          : p
      )
    );

    await supabase
      .from("room_players")
      .update({ position_x: x, position_y: y })
      .eq("player_id", session.playerId)
      .eq("room_id", session.roomId);

    channelRef.current?.send({
      type: "broadcast",
      event: "player_move",
      payload: { playerId: session.playerId, x, y },
    });
  }

  // ─── NPC interactions ───

  function handleInteractNPC(npc) {
    setActiveNPC(npc);
  }

  function closeNPC() {
    setActiveNPC(null);
    setStorageSelectedItem(null);
    setBankDeposit("");
    setBankWithdraw("");
    setShowQuizResetConfirm(false);
  }

  // Storage
  async function handleUseStorageItem(itemId, pkm) {
    const shopItem = SHOP_ITEMS.find((s) => s.id === itemId);
    if (!shopItem) return;

    if (shopItem.effect.heal === "full") {
      const maxHp = pkm.maxHp || pkm.max_hp || 100;
      await updateTeamMember(pkm.id, { hp: maxHp });
    } else if (shopItem.effect.heal) {
      const maxHp = pkm.maxHp || pkm.max_hp || 100;
      const newHp = Math.min(maxHp, (pkm.hp || 0) + shopItem.effect.heal);
      await updateTeamMember(pkm.id, { hp: newHp });
    } else if (shopItem.effect.revive) {
      await updateTeamMember(pkm.id, { hp: Math.floor((pkm.maxHp || pkm.max_hp || 100) * shopItem.effect.healRatio) });
    }

    const items = profile?.inventory?.items || [];
    const idx = items.indexOf(itemId);
    if (idx === -1) return;
    const newItems = [...items];
    newItems.splice(idx, 1);
    await saveProfile(accountId, { inventory: { gold: profile?.inventory?.gold || 0, items: newItems } });
    setProfile((p) => p ? { ...p, inventory: { gold: p.inventory?.gold || 0, items: newItems } } : p);
    setStorageSelectedItem(null);
    loadTeam();
  }

  // Bank
  async function handleBankDeposit() {
    const amount = parseInt(bankDeposit, 10);
    if (!amount || amount <= 0) return;
    const currentGold = profile?.inventory?.gold || 0;
    if (amount > currentGold) { setError("Not enough gold!"); setTimeout(() => setError(""), 2000); return; }
    const newGold = currentGold - amount;
    const bankGold = (profile?.bank_gold || 0) + amount;
    await saveProfile(accountId, { inventory: { gold: newGold, items: profile?.inventory?.items || [] }, bank_gold: bankGold });
    setProfile((p) => p ? { ...p, inventory: { ...p.inventory, gold: newGold }, bank_gold: bankGold } : p);
    setBankDeposit("");
  }

  async function handleBankWithdraw() {
    const amount = parseInt(bankWithdraw, 10);
    if (!amount || amount <= 0) return;
    const bankGold = profile?.bank_gold || 0;
    if (amount > bankGold) { setError("Not enough in bank!"); setTimeout(() => setError(""), 2000); return; }
    const currentGold = (profile?.inventory?.gold || 0) + amount;
    const newBankGold = bankGold - amount;
    await saveProfile(accountId, { inventory: { gold: currentGold, items: profile?.inventory?.items || [] }, bank_gold: newBankGold });
    setProfile((p) => p ? { ...p, inventory: { ...p.inventory, gold: currentGold }, bank_gold: newBankGold } : p);
    setBankWithdraw("");
  }

  // Club Wigglytuff — swap active partner from the club pool
  async function handleMakeActive(storedPkm) {
    // Collect current team members to move to club
    const existingStored = profile?.stored_pokemon || [];
    const membersToStore = team.filter((m) => m.id).map((m) => ({
      pokemon_id: m.pokemonId || m.pokemon_id,
      level: m.level || 5,
      nickname: m.nickname || null,
      moves: m.moves || [],
      hp: m.hp,
      max_hp: m.maxHp || m.max_hp,
    }));
    // Remove current team from DB
    for (const member of team) {
      if (member.id) await removeTeamMember(member.id);
    }
    // Add selected club Pokémon to team
    await addTeamMember(accountId, {
      pokemon_id: storedPkm.pokemon_id,
      nickname: storedPkm.nickname || getSpeciesName(storedPkm.pokemon_id),
      level: storedPkm.level || 5,
      hp: storedPkm.hp || 100,
      max_hp: storedPkm.max_hp || 100,
      nature: storedPkm.nature || null,
      moves: storedPkm.moves || [],
      slot: 0,
      is_starter: false,
    });
    // Update club: add old team members, remove the one that became active
    const remaining = existingStored.filter((p) => p !== storedPkm);
    await saveProfile(accountId, { stored_pokemon: [...remaining, ...membersToStore] });
    loadTeam();
  }

  // Quiz Reset
  async function handleQuizReset() {
    await saveProfile(accountId, { starter_id: null, quiz_result: null });
    const teamMembers = await getTeam(accountId);
    for (const member of teamMembers) {
      if (member.is_starter) {
        await removeTeamMember(member.id);
      }
    }
    setShowQuizResetConfirm(false);
    setActiveNPC(null);
    if (onTeamUpdate) onTeamUpdate();
  }

  // Shop
  async function handleBuyItem(item) {
    if (!profile) return;
    const gold = profile.inventory?.gold || 0;
    if (gold < item.price) { setError("Not enough gold!"); setTimeout(() => setError(""), 2000); return; }

    const newGold = gold - item.price;
    const items = [...(profile.inventory?.items || []), item.id];

    await saveProfile(accountId, {
      inventory: { gold: newGold, items },
    });
    setProfile((p) => p ? { ...p, inventory: { gold: newGold, items } } : p);
    loadTeam();
  }

  async function loadTeam() {
    if (onTeamUpdate) onTeamUpdate();
    const tm = await getTeam(accountId);
    // team is updated via onTeamUpdate
    const prof = await getProfile(accountId);
    if (prof) setProfile(prof);
  }

  // Move changer
  const [moveChangerPkm, setMoveChangerPkm] = useState(null);
  const [moveChangerSlot, setMoveChangerSlot] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);

  function openMoveChanger(pkm) {
    setMoveChangerPkm(pkm);
    setMoveChangerSlot(null);
    const pkmLevel = pkm.level || 5;
    const allMoves = getMovesAtLevel(pkm.pokemonId || pkm.pokemon_id, pkmLevel);
    const knownNames = new Set((pkm.moves || []).map((m) => m.name || m));
    setAvailableMoves(allMoves.filter((m) => !knownNames.has(m)));
  }

  async function handleChangeMove() {
    if (!moveChangerPkm || moveChangerSlot === null) return;
    const newMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    if (!newMove) return;

    const newMoves = [...(moveChangerPkm.moves || [])];
    newMoves[moveChangerSlot] = { name: newMove };

    await updateTeamMember(moveChangerPkm.id, { moves: newMoves });
    setMoveChangerPkm(null);
    setMoveChangerSlot(null);
    setActiveNPC(null);
    loadTeam();
  }

  // Name rater
  const [renamePkm, setRenamePkm] = useState(null);
  const [newNickname, setNewNickname] = useState("");

  async function handleRename() {
    if (!renamePkm) return;
    const name = newNickname.trim();
    if (!name || name.length > 20) return;
    await updateTeamMember(renamePkm.id, { nickname: name });
    setRenamePkm(null);
    setNewNickname("");
    setActiveNPC(null);
    loadTeam();
  }

  // Chat
  async function sendChat() {
    if (!chatInput.trim() || !channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "chat_message",
      payload: { playerName: accountName, text: chatInput.trim() },
    });
    setChatInput("");
  }

  // Adventure
  async function handleStartAdventure() {
    if (!session || !session.isHost) {
      setError("Only the host can start an adventure!");
      setTimeout(() => setError(""), 2000);
      return;
    }
    if (team.length === 0) {
      setError("You need at least one Pokémon!");
      setTimeout(() => setError(""), 2000);
      return;
    }

    // Broadcast so non-host clients know to transition
    channelRef.current?.send({
      type: "broadcast",
      event: "game_start",
      payload: {},
    });

    if (onStartDungeon) onStartDungeon();
  }

  // ─── Rendering ───

  // Connecting / setup screen (no session yet)
  if (showSetup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-4">
        <div className="max-w-sm w-full space-y-6 text-center">
          <h1 className="text-3xl font-bold text-stone-100">PokéVisa</h1>
          {isConnecting ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-stone-400 text-sm">Connecting...</p>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-4 py-2">{error}</p>
              <button
                onClick={autoJoin}
                className="rounded-xl bg-stone-700 px-6 py-2 text-sm text-stone-300 hover:bg-stone-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : null}
          <div className="flex justify-center gap-4 pt-4">
            <LanguageSelector />
            <button onClick={handleLogout} className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Village screen (in room) ───

  const otherPlayers = players.filter((p) => p.player_id !== session.playerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-stone-100">PokéVisa</h1>
            <span className="text-[10px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded">
              {roomCode}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>👥 {players.length}</span>
            <span>💰 {profile?.inventory?.gold || 0}</span>
            <LanguageSelector />
          </div>
        </div>

        {/* Map */}
        <VillageMap
          playerX={myPlayer?.position_x || VILLAGE_SPAWN.x}
          playerY={myPlayer?.position_y || VILLAGE_SPAWN.y}
          playerSpriteId={myPlayer?.sprite_id || 25}
          otherPlayers={otherPlayers}
          onMove={moveTo}
          onInteractNPC={handleInteractNPC}
        />

        {/* NPC labels */}
        <div className="flex flex-wrap gap-2 justify-center">
          {NPC_POSITIONS.map((npc) => (
            <button
              key={npc.id}
              onClick={() => {
                const dx = Math.abs(npc.x - (myPlayer?.position_x || 0));
                const dy = Math.abs(npc.y - (myPlayer?.position_y || 0));
                if (dx <= 1 && dy <= 1) {
                  setActiveNPC(npc);
                } else {
                  setError("Walk closer to interact");
                  setTimeout(() => setError(""), 1500);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-stone-800/60 border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-700/60 transition-colors"
            >
              <img src={`${SPRITE_URL}/${npc.spriteId}.png`} alt="" className="w-5 h-5" />
              {npc.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-xs text-red-400">{error}</p>
        )}

        {/* Player list */}
        <div className="flex flex-wrap gap-2 justify-center">
          {players.map((p) => (
            <div
              key={p.player_id}
              className="flex items-center gap-1.5 rounded-xl bg-stone-800/40 border border-stone-700/50 px-2.5 py-1"
            >
              <img src={`${SPRITE_URL}/${p.sprite_id || 25}.png`} alt="" className="w-5 h-5" />
              <span className="text-[10px] text-stone-400">{p.player_name}</span>
            </div>
          ))}
        </div>

        {/* Team view */}
        <div className="flex flex-wrap gap-2 justify-center">
          {team.map((pkm, i) => (
            <div
              key={pkm.id || i}
              className="flex items-center gap-1.5 rounded-xl bg-stone-800/40 border border-stone-700/50 px-2.5 py-1"
            >
              <img
                src={`${SPRITE_URL}/${pkm.pokemonId || pkm.pokemon_id || 25}.png`}
                alt=""
                className="w-5 h-5"
              />
              <div className="text-[10px] text-stone-400">
                <span className="text-stone-300">{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</span>
                <span className="ml-1 text-stone-500">Lv.{pkm.level || 5}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── NPC Modals ─── */}
      {activeNPC && activeNPC.id === "mart" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/352.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">Shop</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <p className="text-xs text-stone-400">💰 {profile?.inventory?.gold || 0} gold</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {SHOP_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-stone-700/40 p-3"
                >
                  <div>
                    <p className="text-sm text-stone-200 font-medium">{item.name}</p>
                    <p className="text-[10px] text-stone-400">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={(profile?.inventory?.gold || 0) < item.price}
                    className="rounded-lg bg-green-800 px-3 py-1.5 text-xs text-green-200 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {item.price}g
                  </button>
                </div>
              ))}
            </div>
            {team.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-stone-500">Use an item on your Pokémon:</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={async () => {
                      const items = profile?.inventory?.items || [];
                      if (items.length === 0) { setError("No items!"); setTimeout(() => setError(""), 1500); return; }
                      const itemId = items[0];
                      const shopItem = SHOP_ITEMS.find((s) => s.id === itemId);
                      if (!shopItem) return;
                      if (shopItem.effect.heal === "full") {
                        const maxHp = pkm.maxHp || pkm.max_hp || 100;
                        await updateTeamMember(pkm.id, { hp: maxHp });
                      } else if (shopItem.effect.heal) {
                        const maxHp = pkm.maxHp || pkm.max_hp || 100;
                        const newHp = Math.min(maxHp, (pkm.hp || 0) + shopItem.effect.heal);
                        await updateTeamMember(pkm.id, { hp: newHp });
                      } else if (shopItem.effect.revive) {
                        await updateTeamMember(pkm.id, { hp: Math.floor((pkm.maxHp || pkm.max_hp || 100) * shopItem.effect.healRatio) });
                      }
                      const newItems = items.slice(1);
                      await saveProfile(accountId, { inventory: { gold: profile?.inventory?.gold || 0, items: newItems } });
                      setProfile((p) => p ? { ...p, inventory: { gold: p.inventory?.gold || 0, items: newItems } } : p);
                      loadTeam();
                    }}
                    className="w-full rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 text-left flex items-center gap-2"
                  >
                    <img src={`${SPRITE_URL}/${pkm.pokemonId || pkm.pokemon_id || 25}.png`} alt="" className="w-5 h-5" />
                    <span>{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</span>
                    <span className="ml-auto text-stone-500">HP {pkm.hp || 0}/{pkm.maxHp || pkm.max_hp || 100}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Bank (Persian) ─── */}
      {activeNPC && activeNPC.id === "bank" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/53.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">Bank</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-stone-700/40 p-3">
                <p className="text-[10px] text-stone-400">Pocket</p>
                <p className="text-yellow-400 font-bold">💰 {profile?.inventory?.gold || 0}</p>
              </div>
              <div className="rounded-xl bg-stone-700/40 p-3">
                <p className="text-[10px] text-stone-400">Bank</p>
                <p className="text-blue-400 font-bold">🏦 {profile?.bank_gold || 0}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={bankDeposit}
                  onChange={(e) => setBankDeposit(e.target.value)}
                  placeholder="Deposit amount"
                  className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500"
                />
                <button
                  onClick={handleBankDeposit}
                  disabled={!bankDeposit || parseInt(bankDeposit) <= 0 || parseInt(bankDeposit) > (profile?.inventory?.gold || 0)}
                  className="rounded-lg bg-green-800 px-3 py-2 text-xs text-green-200 hover:bg-green-700 disabled:opacity-40 transition-colors"
                >
                  Deposit
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={bankWithdraw}
                  onChange={(e) => setBankWithdraw(e.target.value)}
                  placeholder="Withdraw amount"
                  className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500"
                />
                <button
                  onClick={handleBankWithdraw}
                  disabled={!bankWithdraw || parseInt(bankWithdraw) <= 0 || parseInt(bankWithdraw) > (profile?.bank_gold || 0)}
                  className="rounded-lg bg-blue-800 px-3 py-2 text-xs text-blue-200 hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
            <p className="text-[10px] text-stone-500 text-center">Gold in the bank is safe if you die in a dungeon.</p>
          </div>
        </div>
      )}

      {activeNPC && activeNPC.id === "moves" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-100">Move Changer</h2>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            {!moveChangerPkm ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">Choose a Pokémon to change its moves:</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={() => openMoveChanger(pkm)}
                    className="w-full rounded-xl bg-stone-700/40 p-3 flex items-center gap-2 hover:bg-stone-600/40 transition-colors"
                  >
                    <img src={`${SPRITE_URL}/${pkm.pokemonId || pkm.pokemon_id || 25}.png`} alt="" className="w-8 h-8" />
                    <div className="text-left">
                      <p className="text-sm text-stone-200">{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</p>
                      <p className="text-[10px] text-stone-400">Lv.{pkm.level || 5}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">
                  Replace a move for {moveChangerPkm.nickname || getSpeciesName(moveChangerPkm.pokemonId || moveChangerPkm.pokemon_id)}:
                </p>
                {(moveChangerPkm.moves || []).map((move, si) => (
                  <button
                    key={si}
                    onClick={() => setMoveChangerSlot(si)}
                    className={`w-full rounded-xl p-3 text-left flex items-center gap-2 transition-colors ${
                      moveChangerSlot === si
                        ? "bg-green-800/40 ring-1 ring-green-600"
                        : "bg-stone-700/40 hover:bg-stone-600/40"
                    }`}
                  >
                    <span className="text-sm text-stone-200">{getMoveName(move, language)}</span>
                    {moveChangerSlot === si && availableMoves.length > 0 && (
                      <span className="ml-auto text-xs text-green-400">
                        Replace with: {getMoveName(availableMoves[0], language)}
                      </span>
                    )}
                  </button>
                ))}
                {moveChangerSlot !== null && (
                  <button
                    onClick={handleChangeMove}
                    disabled={availableMoves.length === 0}
                    className="w-full rounded-xl bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-40 transition-colors"
                  >
                    Confirm
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeNPC && activeNPC.id === "name" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-100">Name Rater</h2>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            {!renamePkm ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">Choose a Pokémon to rename:</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={() => { setRenamePkm(pkm); setNewNickname(pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)); }}
                    className="w-full rounded-xl bg-stone-700/40 p-3 flex items-center gap-2 hover:bg-stone-600/40 transition-colors"
                  >
                    <img src={`${SPRITE_URL}/${pkm.pokemonId || pkm.pokemon_id || 25}.png`} alt="" className="w-8 h-8" />
                    <div className="text-left">
                      <p className="text-sm text-stone-200">{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</p>
                      <p className="text-[10px] text-stone-400">Lv.{pkm.level || 5}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">New nickname:</p>
                <input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl bg-stone-700/60 border border-stone-600 px-4 py-2.5 text-sm text-stone-100 text-center"
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
                />
                <button
                  onClick={handleRename}
                  disabled={!newNickname.trim()}
                  className="w-full rounded-xl bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-40 transition-colors"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Chat toggle button ─── */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-stone-700 px-4 py-2 text-xs text-stone-300 shadow-lg hover:bg-stone-600 transition-colors"
      >
        {chatOpen ? "Close" : "Chat"}
      </button>

      {/* ─── Chat panel ─── */}
      {chatOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-72 rounded-xl border border-stone-700 bg-stone-800/95 backdrop-blur shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-700 px-3 py-2">
            <span className="text-xs font-semibold text-stone-300">Chat</span>
            <button onClick={() => setChatOpen(false)} className="text-stone-500 hover:text-stone-300 text-sm">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-60 px-3 py-2 space-y-1.5">
            {messages.length === 0 && (
              <p className="text-[10px] text-stone-500 text-center">No messages yet</p>
            )}
            {messages.map((msg) => {
              const isOwn = msg.playerName === accountName;
              return (
                <Bubble key={msg.id} variant={isOwn ? "dungeon-player" : "dungeon-enemy"} align={isOwn ? "end" : "start"}>
                  <span className="text-[10px] text-stone-500 px-1">{msg.playerName}</span>
                  <BubbleContent>{msg.text}</BubbleContent>
                </Bubble>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendChat(); }}
            className="flex gap-1.5 border-t border-stone-700 p-2"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={200}
              className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-2.5 py-1.5 text-xs text-stone-100 placeholder:text-stone-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* ─── Kangaskhan Storage ─── */}
      {activeNPC && activeNPC.id === "storage" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/115.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">Kangaskhan Storage</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>

            {!storageSelectedItem ? (
              <>
                <p className="text-xs text-stone-400">
                  Items in storage: <span className="text-stone-200 font-semibold">{(profile?.inventory?.items || []).length}</span>
                </p>
                {(profile?.inventory?.items || []).length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-4">No items in storage. Find some in dungeons!</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(() => {
                      // Group items by type with counts
                      const counts = {};
                      for (const id of profile.inventory.items) {
                        counts[id] = (counts[id] || 0) + 1;
                      }
                      return Object.entries(counts).map(([itemId, count]) => {
                        const shopItem = SHOP_ITEMS.find((s) => s.id === itemId);
                        if (!shopItem) return null;
                        return (
                          <div
                            key={itemId}
                            className="flex items-center justify-between rounded-xl bg-stone-700/40 p-3"
                          >
                            <div>
                              <p className="text-sm text-stone-200 font-medium">{shopItem.name}</p>
                              <p className="text-[10px] text-stone-400">{shopItem.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500">×{count}</span>
                              <button
                                onClick={() => setStorageSelectedItem(itemId)}
                                className="rounded-lg bg-blue-800 px-2.5 py-1.5 text-xs text-blue-200 hover:bg-blue-700 transition-colors"
                              >
                                Use
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">Choose a Pokémon to use this item on:</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={() => handleUseStorageItem(storageSelectedItem, pkm)}
                    className="w-full rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 text-left flex items-center gap-2"
                  >
                    <img src={`${SPRITE_URL}/${pkm.pokemonId || pkm.pokemon_id || 25}.png`} alt="" className="w-5 h-5" />
                    <span>{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</span>
                    <span className="ml-auto text-stone-500">HP {pkm.hp || 0}/{pkm.maxHp || pkm.max_hp || 100}</span>
                  </button>
                ))}
                <button
                  onClick={() => setStorageSelectedItem(null)}
                  className="w-full rounded-lg bg-stone-700 px-3 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Club Wigglytuff ─── */}
      {activeNPC && activeNPC.id === "club" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/40.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">Club Wigglytuff</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <p className="text-xs text-stone-400">
              Wild Pokémon that want to join you wait here — they're safe even if you faint in a dungeon. Choose one to adventure with.
            </p>

            {/* Current active partner */}
            {team[0] && (
              <div className="rounded-xl bg-stone-700/60 border border-stone-600 p-3 flex items-center gap-3">
                <img src={`${SPRITE_URL}/${team[0].pokemonId || team[0].pokemon_id || 25}.png`} alt="" className="w-8 h-8" />
                <div>
                  <p className="text-sm text-stone-200 font-semibold">{team[0].nickname || getSpeciesName(team[0].pokemonId || team[0].pokemon_id)}</p>
                  <p className="text-[10px] text-stone-400">Active partner · Lv.{team[0].level || 5}</p>
                </div>
              </div>
            )}

            {/* Club pool */}
            <p className="text-xs text-stone-500">Club members ({profile?.stored_pokemon?.length || 0})</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(profile?.stored_pokemon || []).length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">No one here yet. Catch some wild Pokémon in dungeons!</p>
              ) : (
                (profile?.stored_pokemon || []).map((pkm, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-stone-700/40 p-3">
                    <div className="flex items-center gap-2">
                      <img src={`${SPRITE_URL}/${pkm.pokemon_id}.png`} alt="" className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-stone-200">{getSpeciesName(pkm.pokemon_id)}</p>
                        <p className="text-[10px] text-stone-500">Lv.{pkm.level || 5}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMakeActive(pkm)}
                      className="rounded-lg bg-green-800 px-2.5 py-1.5 text-xs text-green-200 hover:bg-green-700 transition-colors"
                    >
                      Make Active
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Quiz Reset (Xatu) ─── */}
      {activeNPC && activeNPC.id === "quiz-reset" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={`${SPRITE_URL}/178.png`} alt="" className="w-8 h-8" />
              <h2 className="text-lg font-bold text-stone-100">Quiz Reset</h2>
            </div>
            {!showQuizResetConfirm ? (
              <>
                <p className="text-sm text-stone-300">
                  Xatu can erase your memory of the starter quiz, letting you choose a new partner.
                </p>
                <p className="text-xs text-amber-400">
                  Your starter Pokémon will be released. Other Pokémon and items are safe.
                </p>
                <button
                  onClick={() => setShowQuizResetConfirm(true)}
                  className="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-700 transition-colors"
                >
                  Reset Quiz
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-amber-400 font-semibold">Are you sure?</p>
                <p className="text-xs text-stone-400">This will delete your starter Pokémon. This cannot be undone.</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleQuizReset}
                    className="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-700 transition-colors"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowQuizResetConfirm(false)}
                    className="w-full rounded-xl bg-stone-700 px-4 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeNPC && activeNPC.id === "adventure" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4 text-center">
            <p className="text-4xl">🗺️</p>
            <h2 className="text-xl font-bold text-stone-100">Start Adventure</h2>
            <p className="text-sm text-stone-400">
              Enter the dungeon to find treasure and battle wild Pokémon!
            </p>
            {players.length === 1 ? (
              <p className="text-xs text-amber-400">Going solo? Brave!</p>
            ) : (
              <p className="text-xs text-stone-400">{players.length} players ready</p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { closeNPC(); handleStartAdventure(); }}
                className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Enter Dungeon {session?.isHost ? "(as Host)" : "(wait for host)"}
              </button>
              <button
                onClick={closeNPC}
                className="w-full rounded-xl bg-stone-700 px-4 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
              >
                Not yet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
