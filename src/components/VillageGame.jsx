import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  VILLAGE_TILES, VILLAGE_WIDTH, VILLAGE_HEIGHT,
  NPC_POSITIONS, VILLAGE_SPAWN, SHOP_ITEMS, villageCanStep,
} from "../lib/village";
import { isWalkable } from "../lib/dungeon";
import {
  getSpeciesName, getMoveName, getMovesAtLevel, getAllMovesAtLevel,
  getEffectiveness, calcDamage, getStabMultiplier, getSpeciesTypes,
  getMoveDataBySlug, buildStoredMove, canLearnTM, getDailyTMs,
} from "../lib/moves";
import { pickNature, getEvolutionOptions, getBaseHp, calcStat } from "../lib/pokedex";
import { getItem, getItemName, getItemIcon, applyHeal, isUsableItem, getTMMoveSlug } from "../lib/items";
import {
  getTeam, getProfile, saveProfile,
  addTeamMember, removeTeamMember, updateTeamMember,
  getFriends, getIncomingFriendRequests, getOutgoingFriendRequests,
  sendFriendRequest, respondToFriendRequest, removeFriend,
  searchAccounts, getFriendsInDungeons, getFriendVillages,
  sendGift, acceptGift, declineGift, getIncomingGifts, getOutgoingGifts,
  normalizeInventory,
} from "../lib/auth";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";
import VillageMap from "./VillageMap";
import LanguageSelector from "./LanguageSelector";
import SpriteImg from "./SpriteImg";
import PkmStatsTooltip from "./PkmStatsTooltip";
import { Tooltip, TooltipTrigger } from "../../components/ui/tooltip";
import { Bubble, BubbleContent } from "../../components/ui/bubble";
import ChangePasswordDialog from "./ChangePasswordDialog";

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Build a full inventory object from the current one plus the fields being
// edited, so writes never clobber banked gold or stored items.
function mergeInventory(existing, patch) {
  return normalizeInventory({ ...(existing || {}), ...patch });
}

// Human-readable summary of a gift's contents, e.g. "2× Oran Berry + 500g"
// or "Pikachu (Sparky)". A gifted club Pokémon shows its species (+ nickname).
function formatGiftContents(items, gold, pokemon, language) {
  const counts = {};
  for (const id of items || []) counts[id] = (counts[id] || 0) + 1;
  const parts = Object.entries(counts).map(([id, n]) => `${n > 1 ? `${n}× ` : ""}${getItemName(id, language)}`);
  if (pokemon) {
    const name = pokemon.nickname || getSpeciesName(pokemon.pokemon_id);
    parts.push(`⚡ ${name}`);
  }
  if (gold > 0) parts.push(`${gold}g`);
  return parts.join(" + ") || "—";
}

// Grouped item list for Kangaskhan Storage. `action(itemId, count)` renders
// the per-row buttons (Use/Store/Send for carried, Withdraw for stored).
function StorageItemGroup({ items, label, action, language }) {
  const counts = {};
  for (const id of items || []) counts[id] = (counts[id] || 0) + 1;
  const entries = Object.entries(counts);
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wide text-stone-500">{label}</p>
      {entries.length === 0 ? (
        <p className="text-[10px] text-stone-500 text-center py-2">Nothing here yet.</p>
      ) : (
        entries.map(([itemId, count]) => {
          // TMs are dynamic (tm-<move>) so they aren't in SHOP_ITEMS — resolve
          // every id through getItem to render carried and stored TMs too.
          const item = getItem(itemId);
          if (!item) return null;
          return (
            <div key={itemId} className="flex items-center justify-between rounded-xl bg-stone-700/40 p-3">
              <div className="min-w-0">
                <p className="text-sm text-stone-200 font-medium">{getItemIcon(itemId)} {getItemName(itemId, language)}</p>
                <p className="text-[10px] text-stone-400 truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">×{count}</span>
                {action(itemId, count)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function VillageGame({
  session, accountId, accountName, team, onTeamUpdate,
  onJoin, onStartDungeon, onLogout,
}) {
  const [language, setLanguage] = useState(getLanguage());
  const channelRef = useRef(null);
  const playersRef = useRef([]);
  const offlineCleanupRef = useRef(null);

  // Realtime presence is the source of truth for who is genuinely connected to
  // this room — it rides the live websocket, which closes the moment a tab
  // closes or the network drops. Stale room_players rows can linger in the DB
  // (pagehide cleanup is unreliable), so the rendered list is always reconciled
  // against presence to keep disconnected players' sprites off the map.
  function getOnlineIds() {
    const state = channelRef.current?.presenceState() || {};
    const ids = new Set(Object.values(state).flatMap((p) => p.map((p2) => p2.player_id)));
    ids.add(session.playerId);
    return ids;
  }

  function reconcileWithPresence(playerList) {
    if (!session) return playerList;
    const onlineIds = getOnlineIds();
    return playerList.filter((p) => onlineIds.has(p.player_id));
  }

  // Remove disconnected players from lobby AND playing rooms. Any connected
  // client can run it; the DB trigger (migration 013) then garbage-collects the
  // now-empty rooms, and rooms that were already orphaned get deleted too.
  // Connected players keep last_seen fresh via the heartbeat (village and
  // dungeon), so only genuinely dead connections are swept.
  async function sweepStaleRooms() {
    try {
      await supabase.rpc("cleanup_stale_rooms", { min_age_seconds: 120 });
    } catch (err) {
      // Non-fatal: presence-based cleanup still covers live rooms.
    }
  }

  useEffect(() => subscribe(setLanguage), []);
  const [players, setPlayers] = useState([]);
  useEffect(() => { playersRef.current = players; }, [players]);
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

  // Adventure (dungeon modes): which action is running + friends' active dungeons
  const [actionBusy, setActionBusy] = useState(null);
  const [friendDungeons, setFriendDungeons] = useState([]);

  // Friends (social) panel state
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [friendsTab, setFriendsTab] = useState("friends"); // friends | requests | add
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendBusy, setFriendBusy] = useState(false);
  // Map of friendId -> { roomId, code } for friends currently in a village
  // (lobby room), so we can offer "join their village".
  const [friendVillages, setFriendVillages] = useState({});

  // Kangaskhan Storage "send item to a friend" flow state
  const [storageSendItem, setStorageSendItem] = useState(null);
  const [storageSendFriend, setStorageSendFriend] = useState(null);
  // Which bucket the item being sent comes from: "items" (carried) or "storage".
  const [storageSendSource, setStorageSendSource] = useState("items");

  // Club Wigglytuff "send a club Pokémon to a friend" flow state — the Pokémon
  // goes into escrow like items/gold and returns here if the friend declines.
  const [clubSendPkm, setClubSendPkm] = useState(null);

  // Gifts (async item/gold transfers): escrow bell + panel state.
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [incomingGifts, setIncomingGifts] = useState([]);
  const [outgoingGifts, setOutgoingGifts] = useState([]);
  const [giftBusy, setGiftBusy] = useState(false);
  // Bank (Persian) "send gold" flow: amount, source bucket, target friend.
  const [bankSendGold, setBankSendGold] = useState("");
  const [bankSendSource, setBankSendSource] = useState("bank");
  const [bankSendFriend, setBankSendFriend] = useState(null);

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
        // Tell everyone in the room so their maps show the new sprite too.
        channelRef.current?.send({
          type: "broadcast",
          event: "player_update",
          payload: { playerId: myPlayer.player_id, sprite_id: newSpriteId },
        });
      });
  }, [team?.[0]?.pokemonId ?? team?.[0]?.pokemon_id, myPlayer?.id]);

  async function autoJoin() {
    setIsConnecting(true);
    setError("");

    // Clean up disconnected players before scanning for a room to join, so a
    // village that only contains ghosts isn't picked up (or seen as full).
    await sweepStaleRooms();

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
              setPlayers(reconcileWithPresence(data));
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
        setMessages((prev) =>
          prev.some((m) => m.id === payload.messageId)
            ? prev
            : [...prev, { id: payload.messageId, playerName: payload.playerName, text: payload.text }]
        );
      })
      .on("broadcast", { event: "player_update" }, ({ payload }) => {
        // Another player changed their active partner — refresh their avatar
        // (e.g. after a quiz reset or Club Wigglytuff swap).
        setPlayers((prev) =>
          prev.map((p) =>
            p.player_id === payload.playerId
              ? { ...p, sprite_id: payload.sprite_id ?? p.sprite_id }
              : p
          )
        );
      })
      // Presence sync: detect abrupt disconnects (tab close, network drop).
      // Filter them from the local list and, after a grace period, remove them
      // from room_players so stale players don't get carried into the dungeon.
      .on("presence", { event: "sync" }, () => {
        const onlineIds = getOnlineIds();
        // Never treat ourselves as offline while connected.
        onlineIds.add(session.playerId);
        setPlayers((prev) => prev.filter((p) => onlineIds.has(p.player_id)));

        const offline = playersRef.current.filter(
          (p) => p.player_id !== session.playerId && !onlineIds.has(p.player_id)
        );
        if (offline.length > 0) {
          // Grace delay so the brief village->dungeon presence gap doesn't
          // delete players who are actively transitioning.
          if (offlineCleanupRef.current) clearTimeout(offlineCleanupRef.current);
          offlineCleanupRef.current = setTimeout(() => {
            supabase
              .from("room_players")
              .delete()
              .in("player_id", offline.map((p) => p.player_id))
              .eq("room_id", session.roomId);
          }, 8000);
        } else if (offlineCleanupRef.current) {
          clearTimeout(offlineCleanupRef.current);
          offlineCleanupRef.current = null;
        }
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
      // Use httpSend (REST) here: this cleanup also runs after handleLogout
      // removed the channel, when the realtime socket can't deliver a broadcast.
      channel.httpSend("player_left", { playerId: session.playerId });
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
      // Presence is the source of truth for who is truly connected, so a stale
      // row (closed tab) is filtered out instead of rendering a ghost sprite.
      setPlayers(reconcileWithPresence(playersData.data));
      const me = playersData.data.find((p) => p.player_id === session.playerId);
      if (me) setMyPlayer(me);
    }
  }

  // ─── Movement ───

  async function moveTo(x, y) {
    if (!session || !myPlayer) return;
    if (!isWalkable(VILLAGE_TILES, x, y)) return;
    if (Math.abs(x - myPlayer.position_x) > 1 || Math.abs(y - myPlayer.position_y) > 1) return;
    // Stairs are the only way between the ground level and the raised halls.
    if (!villageCanStep(myPlayer.position_x, myPlayer.position_y, x, y)) return;

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
      .update({ position_x: x, position_y: y, last_seen: new Date().toISOString() })
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
    setStorageSendItem(null);
    setStorageSendFriend(null);
    setTmTeaching(null);
    setBankDeposit("");
    setBankWithdraw("");
    setShowQuizResetConfirm(false);
    setClubSendPkm(null);
    setRenamePkm(null);
    setNewNickname("");
  }

  // Storage
  async function handleUseStorageItem(itemId, pkm) {
    const item = getItem(itemId);
    if (!item) return;
    // TMs teach their move instead of healing — route to the teach flow.
    if (item.effect?.tm) {
      await handleTeachTM(itemId, pkm);
      return;
    }
    const effect = item.effect || {};
    let used = false;

    // Healing berries restore HP. Statuses only exist mid-dungeon (in-memory),
    // so cure/Awaken berries can't be used here — the item is kept instead.
    if (effect.heal) {
      const newHp = applyHeal(effect, pkm);
      if (newHp > (pkm.hp || 0)) {
        await updateTeamMember(pkm.id, { hp: newHp });
        used = true;
      }
    }

    if (effect.restorePP) {
      const moves = (pkm.moves || []).map((m) => ({ ...m, ppUsed: 0 }));
      await updateTeamMember(pkm.id, { moves });
      used = true;
    }

    if (!used) {
      setError("It had no effect...");
      setTimeout(() => setError(""), 2500);
      return;
    }

    const items = profile?.inventory?.items || [];
    const idx = items.indexOf(itemId);
    if (idx === -1) return;
    const newItems = [...items];
    newItems.splice(idx, 1);
    const inv = mergeInventory(profile?.inventory, { items: newItems });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
    setStorageSelectedItem(null);
    loadTeam();
  }

  // Send one item to a friend as a pending gift (escrow) instead of putting it
  // straight into their bag. The item comes from the carried bag or storage
  // (storageSendSource); the friend accepts or declines to take delivery. A
  // decline refunds it to this same bucket.
  async function handleSendItemToFriend(friendId) {
    if (!storageSendItem || !friendId) return;
    const source = storageSendSource === "storage" ? "storage" : "items";
    const bucket = profile?.inventory?.[source] || [];
    const idx = bucket.indexOf(storageSendItem);
    if (idx === -1) return;
    const newBucket = [...bucket];
    newBucket.splice(idx, 1);
    const res = await sendGift({
      senderId: accountId, receiverId: friendId,
      items: [storageSendItem], sourceItems: source,
    });
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); return; }
    const inv = mergeInventory(profile?.inventory, { [source]: newBucket });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
    setStorageSendItem(null);
    setStorageSendFriend(null);
    loadGifts();
  }

  // Send gold to a friend as a pending gift. The gold leaves the pocket or the
  // bank immediately (bankSendSource); if the friend declines it comes back to
  // the same bucket.
  async function handleSendGoldToFriend(friendId) {
    const amount = parseInt(bankSendGold, 10);
    if (!friendId || !amount || amount <= 0) return;
    const source = bankSendSource === "bank" ? "bank" : "pocket";
    const goldKey = source === "bank" ? "banked_gold" : "gold";
    const current = profile?.inventory?.[goldKey] || 0;
    if (amount > current) { setError("Not enough gold!"); setTimeout(() => setError(""), 2000); return; }
    const res = await sendGift({
      senderId: accountId, receiverId: friendId,
      gold: amount, sourceGold: source,
    });
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); return; }
    const inv = mergeInventory(profile?.inventory, { [goldKey]: current - amount });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
    setBankSendGold("");
    setBankSendFriend(null);
    loadGifts();
  }

  // Send one club Pokémon to a friend as a pending gift. The Pokémon leaves the
  // club (stored_pokemon) immediately; if the friend declines it comes back.
  async function handleSendPkmToFriend(friendId) {
    if (!clubSendPkm || !friendId) return;
    const stored = profile?.stored_pokemon || [];
    const idx = stored.indexOf(clubSendPkm);
    if (idx === -1) return;
    const newStored = [...stored];
    newStored.splice(idx, 1);
    const res = await sendGift({
      senderId: accountId, receiverId: friendId,
      pokemon: clubSendPkm,
    });
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); return; }
    await saveProfile(accountId, { stored_pokemon: newStored });
    setProfile((p) => p ? { ...p, stored_pokemon: newStored } : p);
    setClubSendPkm(null);
    loadGifts();
  }

  // Kangaskhan Storage: move one carried item into storage (safe from wipes).
  async function handleStoreItem(itemId) {
    const items = profile?.inventory?.items || [];
    const idx = items.indexOf(itemId);
    if (idx === -1) return;
    const newItems = [...items];
    newItems.splice(idx, 1);
    const storage = profile?.inventory?.storage || [];
    const inv = mergeInventory(profile?.inventory, { items: newItems, storage: [...storage, itemId] });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
  }

  // Kangaskhan Storage: move every carried item into storage in one go.
  async function handleStoreAllItems() {
    const items = profile?.inventory?.items || [];
    if (items.length === 0) return;
    const storage = profile?.inventory?.storage || [];
    const inv = mergeInventory(profile?.inventory, { items: [], storage: [...storage, ...items] });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
  }

  // Kangaskhan Storage: move one stored item back into the carried bag.
  async function handleWithdrawItem(itemId) {
    const storage = profile?.inventory?.storage || [];
    const idx = storage.indexOf(itemId);
    if (idx === -1) return;
    const newStorage = [...storage];
    newStorage.splice(idx, 1);
    const items = profile?.inventory?.items || [];
    const inv = mergeInventory(profile?.inventory, { items: [...items, itemId], storage: newStorage });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
  }

  // Bank (Persian) — shared deposit/withdraw logic; "all" uses the whole pocket/bank balance
  async function handleBankTransfer(amount, direction) {
    const currentGold = profile?.inventory?.gold || 0;
    const bankGold = profile?.inventory?.banked_gold || 0;
    let newGold, newBankGold;
    if (direction === "deposit") {
      if (amount > currentGold) { setError("Not enough gold!"); setTimeout(() => setError(""), 2000); return; }
      newGold = currentGold - amount;
      newBankGold = bankGold + amount;
    } else {
      if (amount > bankGold) { setError("Not enough in bank!"); setTimeout(() => setError(""), 2000); return; }
      newGold = currentGold + amount;
      newBankGold = bankGold - amount;
    }
    const inv = mergeInventory(profile?.inventory, { gold: newGold, banked_gold: newBankGold });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
    if (direction === "deposit") setBankDeposit(""); else setBankWithdraw("");
  }

  async function handleBankDeposit() {
    const amount = parseInt(bankDeposit, 10);
    if (!amount || amount <= 0) return;
    await handleBankTransfer(amount, "deposit");
  }

  async function handleBankWithdraw() {
    const amount = parseInt(bankWithdraw, 10);
    if (!amount || amount <= 0) return;
    await handleBankTransfer(amount, "withdraw");
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
      nature: m.nature && m.nature !== "_" ? m.nature : null,
    }));
    // Remove current team from DB
    for (const member of team) {
      if (member.id) await removeTeamMember(member.id);
    }
    // Add selected club Pokémon to team. The nature column is NOT NULL, so we
    // must supply a valid value — camp Pokémon stored without one (captures)
    // fall back to a deterministic nature instead of null.
    const nature = storedPkm.nature && storedPkm.nature !== "_"
      ? storedPkm.nature
      : pickNature(`${accountId}-${storedPkm.pokemon_id}-active`);
    // Recruited Pokémon keep the moves they knew when captured (dungeon captures
    // now save them). Entries captured before that fix have no moves, so derive
    // the level-up moveset as a fallback instead of recruiting them empty.
    const moves = (storedPkm.moves && storedPkm.moves.length > 0)
      ? storedPkm.moves
      : await getMovesAtLevel(storedPkm.pokemon_id, storedPkm.level || 5);
    await addTeamMember(accountId, {
      pokemon_id: storedPkm.pokemon_id,
      nickname: storedPkm.nickname || getSpeciesName(storedPkm.pokemon_id),
      level: storedPkm.level || 5,
      hp: storedPkm.hp || 100,
      max_hp: storedPkm.max_hp || 100,
      nature,
      moves,
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

  // Shop. Payment draws on pocket gold first and takes any shortfall from the
  // bank (banked gold), so a player with money in Persian's bank can shop even
  // when their pocket is empty.
  async function handleBuyItem(item) {
    if (!profile) return;
    const gold = profile.inventory?.gold || 0;
    const banked = profile.inventory?.banked_gold || 0;
    if (gold + banked < item.price) { setError("Not enough gold!"); setTimeout(() => setError(""), 2000); return; }

    let newGold = gold - item.price;
    let newBanked = banked;
    if (newGold < 0) {
      newBanked += newGold;
      newGold = 0;
    }
    const items = [...(profile.inventory?.items || []), item.id];
    const inv = mergeInventory(profile.inventory, { gold: newGold, banked_gold: newBanked, items });

    await saveProfile(accountId, {
      inventory: inv,
    });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
    loadTeam();
  }

  async function loadTeam() {
    if (onTeamUpdate) onTeamUpdate();
    const tm = await getTeam(accountId);
    // team is updated via onTeamUpdate
    const prof = await getProfile(accountId);
    if (prof) setProfile(prof);
  }

  // ─── Friends (social system) ───
  // Loads accepted friends, pending requests (both directions) and any friends
  // currently inside a playing dungeon. Used by the friends panel and by the
  // Hariyama "join a friend" flow.
  async function loadFriends() {
    if (!accountId) return;
    const [f, inc, out, dungeons, villages] = await Promise.all([
      getFriends(accountId),
      getIncomingFriendRequests(accountId),
      getOutgoingFriendRequests(accountId),
      getFriendsInDungeons(accountId),
      getFriendVillages(accountId),
    ]);
    setFriends(f);
    setIncomingRequests(inc);
    setOutgoingRequests(out);
    setFriendDungeons(dungeons);
    setFriendVillages(villages);
  }

  useEffect(() => {
    loadFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  // Tab close cleanup: remove this player from their village room so an
  // abandoned lobby can be garbage-collected by the DB trigger (see migration
  // 010). Keepalive fetch fires reliably enough on pagehide for this.
  useEffect(() => {
    if (!session || !accountId) return;
    const url = `${import.meta.env.PUBLIC_SUPABASE_URL}/rest/v1/room_players?room_id=eq.${session.roomId}&player_id=eq.${accountId}`;
    const cleanup = () => {
      fetch(url, {
        method: "DELETE",
        keepalive: true,
        headers: {
          apikey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }).catch(() => {});
    };
    window.addEventListener("pagehide", cleanup);
    return () => window.removeEventListener("pagehide", cleanup);
  }, [session, accountId]);

  // Heartbeat: keep our room_players.last_seen fresh while connected so
  // cleanup_stale_rooms can tell a dead connection from a live one.
  // Background tabs throttle timers (worst case ~1/min), so the sweep threshold
  // of 120s is safely wider than any drift a connected player can produce.
  useEffect(() => {
    if (!session || !accountId) return;
    const beat = () => {
      // postgrest-js builders are thenable but have no .catch — pass the
      // rejection handler to .then instead so failures are silently ignored.
      supabase
        .from("room_players")
        .update({ last_seen: new Date().toISOString() })
        .eq("player_id", session.playerId)
        .eq("room_id", session.roomId)
        .then(
          () => {},
          () => {}
        );
    };
    beat();
    const id = setInterval(beat, 10000);
    return () => clearInterval(id);
  }, [session, accountId]);

  // Periodic stale-room sweep. Any connected client can clean up lobby and
  // playing rooms that lost players without cleanup (closed tab, crash).
  // Combined with the join-time sweep in autoJoin, disconnected players and
  // abandoned rooms stop showing up quickly.
  useEffect(() => {
    if (!accountId) return;
    sweepStaleRooms();
    const id = setInterval(sweepStaleRooms, 30000);
    return () => clearInterval(id);
  }, [accountId]);

  // Live refresh: friends' dungeon status changes as they start/finish rooms.
  useEffect(() => {
    if (!accountId) return;
    const id = setInterval(() => {
      getFriendsInDungeons(accountId).then(setFriendDungeons);
    }, 8000);
    return () => clearInterval(id);
  }, [accountId]);

  function closeFriends() {
    setFriendsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  async function handleSearch() {
    if (searchQuery.trim().length < 2) return;
    const results = await searchAccounts(searchQuery);
    setSearchResults(results);
  }

  async function handleSendRequest(targetId) {
    if (friendBusy) return;
    setFriendBusy(true);
    const res = await sendFriendRequest(accountId, targetId);
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); }
    setFriendBusy(false);
    await loadFriends();
  }

  async function handleRespond(requesterId, accept) {
    if (friendBusy) return;
    setFriendBusy(true);
    const res = await respondToFriendRequest(requesterId, accountId, accept);
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); }
    setFriendBusy(false);
    await loadFriends();
  }

  async function handleRemoveFriend(friendId) {
    const res = await removeFriend(accountId, friendId);
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); }
    await loadFriends();
  }

  // ─── Gifts (async item/gold transfers) ───
  // Loads pending gifts sent to me plus the history of gifts I sent, so the
  // bell count and the gifts panel stay accurate. The bell count also polls so
  // gifts from friends appear while the village is open.
  async function loadGifts() {
    if (!accountId) return;
    const [inc, out] = await Promise.all([
      getIncomingGifts(accountId),
      getOutgoingGifts(accountId),
    ]);
    setIncomingGifts(inc);
    setOutgoingGifts(out);
  }

  useEffect(() => {
    loadGifts();
    const id = setInterval(() => {
      getIncomingGifts(accountId).then(setIncomingGifts);
    }, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  // Accept delivers the gift (items → Kangaskhan Storage, gold → bank); decline
  // refunds the sender. acceptGift/declineGift claim the row atomically, so a
  // double-tap can't double-deliver or double-refund.
  async function handleGiftResponse(giftId, accept) {
    if (giftBusy) return;
    setGiftBusy(true);
    const res = accept ? await acceptGift(giftId) : await declineGift(giftId);
    if (res.error) { setError(res.error); setTimeout(() => setError(""), 2500); }
    setGiftBusy(false);
    await loadGifts();
    // Accepting changes my own storage/bank, so refresh the profile display.
    if (accept) loadTeam();
  }

  // Move changer (Hypno tutor) — shows every move the Pokémon can learn by
  // its current level and lets the player assign one. Persisted to player_team
  // so the taught moves survive across devices/sessions.
  const [moveChangerPkm, setMoveChangerPkm] = useState(null);
  const [moveChangerSlot, setMoveChangerSlot] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [selectedMove, setSelectedMove] = useState(null);

  async function openMoveChanger(pkm) {
    setMoveChangerPkm(pkm);
    setMoveChangerSlot(null);
    setSelectedMove(null);
    const pkmLevel = pkm.level || 5;
    const allMoves = await getAllMovesAtLevel(pkm.pokemonId || pkm.pokemon_id, pkmLevel);
    setAvailableMoves(allMoves);
  }

  async function handleChangeMove() {
    if (!moveChangerPkm || !selectedMove) return;
    // Store the full move data (not just the name) so battles can use its type,
    // power and accuracy. The display-only `level` field is dropped.
    const move = {
      name: selectedMove.name,
      type: selectedMove.type,
      category: selectedMove.category,
      power: selectedMove.power,
      accuracy: selectedMove.accuracy,
    };
    const currentMoves = moveChangerPkm.moves || [];
    const newMoves = currentMoves.length < 4
      ? [...currentMoves, move]
      : currentMoves.map((m, i) => (i === moveChangerSlot ? move : m));

    await updateTeamMember(moveChangerPkm.id, { moves: newMoves });
    setMoveChangerPkm(null);
    setMoveChangerSlot(null);
    setSelectedMove(null);
    setActiveNPC(null);
    loadTeam();
  }

  // ─── Daily TMs ───
  // Every day the Mart rotates in the same 5 TMs for all players (date-seeded
  // like PokéWordle's daily Pokémon). They're sold in the shop's "Today's TMs"
  // section, buyable any number of times while supplies — er, prices — hold.
  const [dailyTMs, setDailyTMs] = useState([]);

  useEffect(() => {
    getDailyTMs().then(setDailyTMs);
  }, []);

  // ─── TM teaching (village) ───
  // Using a TM from Kangaskhan Storage teaches its move to the chosen Pokémon
  // if the species is TM-compatible (pokedex moves.tm). With fewer than 4 moves
  // it appends directly; at 4 moves the player picks which one to forget.
  const [tmTeaching, setTmTeaching] = useState(null); // { itemId, pkm, storedMove, slug }

  async function handleTeachTM(itemId, pkm) {
    const slug = getTMMoveSlug(itemId);
    if (!slug) return;
    const pokemonId = pkm.pokemonId || pkm.pokemon_id;
    if (!canLearnTM(pokemonId, slug)) {
      setError(`${getSpeciesName(pokemonId)} ${t("can't learn this TM.", language)}`);
      setTimeout(() => setError(""), 2500);
      return;
    }
    if ((pkm.moves || []).some((m) => (m.name || m) === slug)) {
      setError(t("It already knows that move.", language));
      setTimeout(() => setError(""), 2500);
      return;
    }
    const moveData = await getMoveDataBySlug(slug);
    if (!moveData) {
      setError("Invalid TM.");
      setTimeout(() => setError(""), 2500);
      return;
    }
    const storedMove = buildStoredMove(moveData);
    if ((pkm.moves || []).length < 4) {
      await updateTeamMember(pkm.id, { moves: [...(pkm.moves || []), storedMove] });
      await consumeItem(itemId);
      setStorageSelectedItem(null);
      loadTeam();
    } else {
      setTmTeaching({ itemId, pkm, storedMove, slug });
    }
  }

  // The player picked which current move to forget for the TM move.
  async function handleTMDropReplace(slot) {
    if (!tmTeaching) return;
    const { itemId, pkm, storedMove } = tmTeaching;
    const currentMoves = pkm.moves || [];
    const newMoves = currentMoves.map((m, i) => (i === slot ? storedMove : m));
    await updateTeamMember(pkm.id, { moves: newMoves });
    await consumeItem(itemId);
    setTmTeaching(null);
    setStorageSelectedItem(null);
    loadTeam();
  }

  // Remove a single consumed item from the carried inventory and persist it.
  async function consumeItem(itemId) {
    const items = profile?.inventory?.items || [];
    const idx = items.indexOf(itemId);
    if (idx === -1) return;
    const newItems = [...items];
    newItems.splice(idx, 1);
    const inv = mergeInventory(profile?.inventory, { items: newItems });
    await saveProfile(accountId, { inventory: inv });
    setProfile((p) => p ? { ...p, inventory: inv } : p);
  }

  // Name a club Pokémon (Club Wigglytuff handles renaming now).
  const [renamePkm, setRenamePkm] = useState(null);
  const [newNickname, setNewNickname] = useState("");

  async function handleRename() {
    if (!renamePkm) return;
    const name = newNickname.trim();
    if (!name || name.length > 20) return;
    // Update the matching stored_pokemon entry in place (identity-preserving
    // filter so clubSendPkm/renamePkm references stay valid).
    const stored = profile?.stored_pokemon || [];
    const newStored = stored.map((p) => p === renamePkm ? { ...p, nickname: name } : p);
    await saveProfile(accountId, { stored_pokemon: newStored });
    setProfile((p) => p ? { ...p, stored_pokemon: newStored } : p);
    setRenamePkm(null);
    setNewNickname("");
  }

  // ─── Pokémon Evolver (Whiscash) ───
  // Team + club Pokémon that reached a level-up evolution. Loading the options
  // needs pokedex.json (async), so candidates are gathered when the modal opens.
  const [evolvable, setEvolvable] = useState([]);
  const [evolveLoading, setEvolveLoading] = useState(false);

  useEffect(() => {
    if (activeNPC?.id !== "evolve") return;
    let cancelled = false;
    setEvolveLoading(true);
    (async () => {
      // Owned evolution items (stones) come from Kangaskhan Storage or the
      // carried bag — only item evolutions the player can actually pay for
      // are offered.
      const owned = new Set([
        ...(profile?.inventory?.storage || []),
        ...(profile?.inventory?.items || []),
      ]);
      const buildOptions = async (p) => {
        const all = await getEvolutionOptions(p.pokemonId || p.pokemon_id, p.level || 5);
        return all.filter((o) => !o.item || owned.has(o.item));
      };
      const list = [];
      for (const p of team) {
        const options = await buildOptions(p);
        if (options.length) list.push({ kind: "team", pkm: p, options });
      }
      for (const p of profile?.stored_pokemon || []) {
        const options = await buildOptions(p);
        if (options.length) list.push({ kind: "club", pkm: p, options });
      }
      if (!cancelled) setEvolvable(list);
      if (!cancelled) setEvolveLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNPC?.id]);

  // Apply an evolution to a team or club Pokémon: swap the species, recompute
  // max HP at the same level, keep HP proportionally, and update the default
  // nickname to the new species unless the player gave it a custom one. Item
  // evolutions consume the required stone from storage (or the carried bag).
  async function handleEvolve(item, target) {
    const pkm = item.pkm;
    const level = pkm.level || 5;
    const newMax = calcStat(getBaseHp(target.id), level, true);
    const oldMax = pkm.max_hp || pkm.maxHp || newMax;
    const newHp = Math.max(1, Math.round(((pkm.hp || oldMax) / oldMax) * newMax));
    const custom = pkm.nickname && pkm.nickname !== getSpeciesName(pkm.pokemonId || pkm.pokemon_id);
    const nickname = custom ? pkm.nickname : getSpeciesName(target.id);
    if (target.item) {
      // Consume one stone from storage first, falling back to the carried bag.
      const storage = profile?.inventory?.storage || [];
      const carried = profile?.inventory?.items || [];
      let inv;
      if (storage.includes(target.item)) {
        const newStorage = [...storage];
        newStorage.splice(newStorage.indexOf(target.item), 1);
        inv = mergeInventory(profile?.inventory, { storage: newStorage });
      } else if (carried.includes(target.item)) {
        const newCarried = [...carried];
        newCarried.splice(newCarried.indexOf(target.item), 1);
        inv = mergeInventory(profile?.inventory, { items: newCarried });
      }
      if (inv) {
        await saveProfile(accountId, { inventory: inv });
        setProfile((p) => p ? { ...p, inventory: inv } : p);
      }
    }
    if (item.kind === "team") {
      await updateTeamMember(pkm.id, { pokemon_id: target.id, max_hp: newMax, hp: newHp, nickname });
    } else {
      const stored = profile?.stored_pokemon || [];
      const newStored = stored.map((s) => s === pkm ? { ...s, pokemon_id: target.id, max_hp: newMax, hp: newHp, nickname } : s);
      await saveProfile(accountId, { stored_pokemon: newStored });
      setProfile((p) => p ? { ...p, stored_pokemon: newStored } : p);
    }
    setActiveNPC(null);
    loadTeam();
  }

  // Chat
  async function sendChat() {
    const text = chatInput.trim();
    if (!text || !channelRef.current) return;
    // Optimistically show our own message. The realtime backend does not echo
    // broadcasts back to the sender, so we append locally and dedupe incoming
    // messages by a client-generated id.
    const messageId = `${accountId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setMessages((prev) => [...prev, { id: messageId, playerName: accountName, text }]);
    await channelRef.current.send({
      type: "broadcast",
      event: "chat_message",
      payload: { messageId, playerName: accountName, text },
    });
    setChatInput("");
  }

  // ─── Adventure (dungeon modes) ───
  // Each player adventures on their own. A dungeon room is created on the fly
  // (host), joined by code as a coop friend, or joined at random as an invader.

  function requireTeam() {
    if (team.length === 0) {
      setError("You need at least one Pokémon!");
      setTimeout(() => setError(""), 2000);
      return false;
    }
    return true;
  }

  // Fetch the dungeon spawn so late joiners appear on a safe tile.
  async function getDungeonSpawn(roomId) {
    const { data } = await supabase
      .from("dungeon_state")
      .select("spawn_x, spawn_y")
      .eq("room_id", roomId)
      .maybeSingle();
    return { x: data?.spawn_x ?? 1, y: data?.spawn_y ?? 1 };
  }

  // "Go to a dungeon": host a brand-new solo dungeon room.
  async function startSoloDungeon() {
    if (!requireTeam()) return;
    setActionBusy("solo");
    setError("");
    try {
      const code = generateRoomCode();
      const seed = Math.floor(Math.random() * 999999);

      // Leave any previous room so reconnect always routes back to this dungeon.
      await supabase.from("room_players").delete().eq("player_id", accountId);

      const { data: roomData, error: roomErr } = await supabase
        .from("rooms")
        .insert({
          code,
          host_id: accountId,
          dungeon_seed: seed,
          max_players: 4,
          status: "playing",
          floor: 1,
        })
        .select()
        .single();

      if (roomErr) { setError(roomErr.message); return; }

      const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;
      const { error: playerErr } = await supabase.from("room_players").insert({
        room_id: roomData.id,
        player_id: accountId,
        player_name: accountName,
        is_host: true,
        is_invader: false,
        sprite_id: spriteId,
        level: team[0]?.level || 5,
        hp: team[0]?.hp || 100,
        max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
        position_x: 1,
        position_y: 1,
      });

      if (playerErr) { setError(playerErr.message); return; }

      closeNPC();
      if (onJoin) onJoin({ roomId: roomData.id, roomCode: code, playerId: accountId, isHost: true });
      if (onStartDungeon) onStartDungeon();
    } catch (err) {
      console.error("Solo dungeon error:", err);
      setError(err.message || "Could not start dungeon");
    } finally {
      setActionBusy(null);
    }
  }

  // "Invade a dungeon": join a random running dungeon as an invader (PvP on).
  async function invadeDungeon() {
    if (!requireTeam()) return;
    setActionBusy("invade");
    setError("");
    try {
      const { data: openRooms } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "playing")
        .order("created_at", { ascending: false })
        .limit(10);

      const candidates = [];
      for (const r of openRooms || []) {
        const { count } = await supabase
          .from("room_players")
          .select("*", { count: "exact", head: true })
          .eq("room_id", r.id);
        if (count < r.max_players) candidates.push(r);
      }

      if (candidates.length === 0) {
        setError(t("No rooms available. Create one instead!", language));
        return;
      }

      const room = candidates[Math.floor(Math.random() * candidates.length)];

      const { data: existing } = await supabase
        .from("room_players")
        .select("id")
        .eq("room_id", room.id)
        .eq("player_id", accountId)
        .maybeSingle();
      if (existing) {
        setError(t("You're already in that dungeon!", language));
        return;
      }

      // Leave any previous room so reconnect routes back to this dungeon.
      await supabase.from("room_players").delete().eq("player_id", accountId);

      const spawn = await getDungeonSpawn(room.id);
      const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;
      const { error: playerErr } = await supabase.from("room_players").insert({
        room_id: room.id,
        player_id: accountId,
        player_name: accountName,
        is_host: false,
        is_invader: true,
        sprite_id: spriteId,
        level: team[0]?.level || 5,
        hp: team[0]?.hp || 100,
        max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
        position_x: spawn.x,
        position_y: spawn.y,
      });

      if (playerErr) { setError(playerErr.message); return; }

      closeNPC();
      if (onJoin) onJoin({ roomId: room.id, roomCode: room.code, playerId: accountId, isHost: false });
      if (onStartDungeon) onStartDungeon();
    } catch (err) {
      console.error("Invade dungeon error:", err);
      setError(err.message || "Could not invade dungeon");
    } finally {
      setActionBusy(null);
    }
  }

  // Join any playing dungeon by its code (coop, no PvP vs the host). Used both
  // by the old code-entry path and by the "join a friend's dungeon" buttons.
  async function joinRoomByCode(code) {
    if (!code || code.length < 4) {
      setError(t("Enter room code", language));
      return;
    }
    if (!requireTeam()) return;
    setActionBusy("friend");
    setError("");
    try {
      const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .ilike("code", code)
        .maybeSingle();

      if (!room) {
        setError(t("Room not found", language));
        return;
      }
      if (room.status !== "playing") {
        setError(t("Game not started yet", language));
        return;
      }

      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id);
      if (count >= room.max_players) {
        setError(t("Room is full", language));
        return;
      }

      const { data: existing } = await supabase
        .from("room_players")
        .select("id")
        .eq("room_id", room.id)
        .eq("player_id", accountId)
        .maybeSingle();
      if (existing) {
        setError(t("You're already in that dungeon!", language));
        return;
      }

      // Leave any previous room so reconnect routes back to this dungeon.
      await supabase.from("room_players").delete().eq("player_id", accountId);

      const spawn = await getDungeonSpawn(room.id);
      const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;
      const { error: playerErr } = await supabase.from("room_players").insert({
        room_id: room.id,
        player_id: accountId,
        player_name: accountName,
        is_host: false,
        is_invader: false,
        sprite_id: spriteId,
        level: team[0]?.level || 5,
        hp: team[0]?.hp || 100,
        max_hp: team[0]?.maxHp || team[0]?.max_hp || 100,
        position_x: spawn.x,
        position_y: spawn.y,
      });

      if (playerErr) { setError(playerErr.message); return; }

      closeNPC();
      if (onJoin) onJoin({ roomId: room.id, roomCode: room.code, playerId: accountId, isHost: false });
      if (onStartDungeon) onStartDungeon();
    } catch (err) {
      console.error("Join friend dungeon error:", err);
      setError(err.message || "Could not join dungeon");
    } finally {
      setActionBusy(null);
    }
  }

  // Join a specific friend's active dungeon (Hariyama adventure menu).
  async function joinFriendRoom(code) {
    closeFriends();
    await joinRoomByCode(code);
  }

  // Move this player into a friend's village. Leaves the current room (their
  // row is deleted, which lets the DB trigger clean up an emptied lobby) and
  // spawns them in the friend's village room.
  async function joinFriendVillage(friendId) {
    const info = friendVillages[friendId];
    if (!info || !requireTeam()) return;
    if (info.roomId === session?.roomId) { closeFriends(); return; }
    setActionBusy("friend");
    setError("");
    try {
      const { data: roomData } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", info.roomId)
        .single();
      if (!roomData || roomData.status !== "lobby") {
        setError("That village is gone or already in a dungeon");
        return;
      }
      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomData.id);
      if (count >= roomData.max_players) {
        setError("That village is full");
        return;
      }

      // Leave any previous room (auto-cleans the old village if it becomes empty).
      await supabase.from("room_players").delete().eq("player_id", accountId);

      const spriteId = team[0]?.pokemonId || team[0]?.pokemon_id || 25;
      const { error: playerErr } = await supabase.from("room_players").insert({
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
      });
      if (playerErr) { setError(playerErr.message); return; }

      setRoom(roomData);
      setRoomCode(roomData.code);
      closeFriends();
      // Changing session re-runs the room channel effect, switching this client
      // to the friend's village realtime channel.
      if (onJoin) onJoin({ roomId: roomData.id, roomCode: roomData.code, playerId: accountId, isHost: false });
    } catch (err) {
      console.error("Join friend village error:", err);
      setError(err.message || "Could not join village");
    } finally {
      setActionBusy(null);
    }
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
            {/* Logout — clears the room channel and returns to the auth screen */}
            <button onClick={handleLogout} className="text-stone-500 hover:text-stone-300 transition-colors">
              {t("Logout", language)}
            </button>
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

        {/* NPC labels — click a badge to interact from anywhere (faster than walking up) */}
        <div className="flex flex-wrap gap-2 justify-center">
          {NPC_POSITIONS.map((npc) => (
            <button
              key={npc.id}
              onClick={() => setActiveNPC(npc)}
              className="flex items-center gap-1.5 rounded-xl bg-stone-800/60 border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-700/60 transition-colors"
            >
              <SpriteImg id={npc.spriteId} size={28} />
              {t(npc.label, language)}
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
              className="flex items-center gap-1.5 rounded-xl bg-stone-800/40 border border-stone-700/50 px-3 py-1.5"
            >
              <SpriteImg id={p.sprite_id || 25} size={28} />
              <span className="text-xs text-stone-300">{p.player_name}</span>
            </div>
          ))}
        </div>

        {/* Team view — hover a badge to see stats + moves */}
        <div className="flex flex-wrap gap-2 justify-center">
          {team.map((pkm, i) => (
            <Tooltip key={pkm.id || i}>
              <TooltipTrigger
                render={
                  <div className="flex items-center gap-1.5 rounded-xl bg-stone-800/40 border border-stone-700/50 px-2.5 py-1 cursor-default">
                    <SpriteImg id={pkm.pokemonId || pkm.pokemon_id || 25} size={40} />
                    <div className="text-[10px] text-stone-400">
                      <span className="text-stone-300">{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</span>
                      <span className="ml-1 text-stone-500">Lv.{pkm.level || 5}</span>
                    </div>
                  </div>
                }
              />
              <PkmStatsTooltip pkm={pkm} />
            </Tooltip>
          ))}
        </div>
      </div>

      {/* ─── NPC Modals ─── */}
      {activeNPC && activeNPC.id === "mart" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/352.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">{t("Shop", language)}</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <p className="text-xs text-stone-400">💰 {profile?.inventory?.gold || 0} {t("gold", language)} · 🏦 {profile?.inventory?.banked_gold || 0} {t("banked", language)}</p>
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
                    disabled={((profile?.inventory?.gold || 0) + (profile?.inventory?.banked_gold || 0)) < item.price}
                    className="rounded-lg bg-green-800 px-3 py-1.5 text-xs text-green-200 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {item.price}g
                  </button>
                </div>
              ))}
            </div>

            {/* Today's TMs — the same 5 TMs rotate daily for every player. */}
            {dailyTMs.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-stone-500">
                  📼 {t("Today's TMs", language)}
                </p>
                {dailyTMs.map((slug) => {
                  const tmItem = getItem(`tm-${slug}`);
                  if (!tmItem) return null;
                  const tmId = tmItem.id;
                  return (
                    <div
                      key={tmId}
                      className="flex items-center justify-between rounded-xl bg-stone-700/40 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-stone-200 font-medium truncate">{getItemName(tmId, language)}</p>
                        <p className="text-[10px] text-stone-400">{t("Teaches a move to a compatible Pokémon", language)}</p>
                      </div>
                      <button
                        onClick={() => handleBuyItem(tmItem)}
                        disabled={((profile?.inventory?.gold || 0) + (profile?.inventory?.banked_gold || 0)) < tmItem.price}
                        className="rounded-lg bg-green-800 px-3 py-1.5 text-xs text-green-200 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        {tmItem.price}g
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {team.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-stone-500">{t("Use an item on your Pokémon:", language)}</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={async () => {
                      const items = profile?.inventory?.items || [];
                      if (items.length === 0) { setError(t("No items!", language)); setTimeout(() => setError(""), 1500); return; }
                      // Quick-use applies the first usable healing item
                      // (berry/elixir). TMs are excluded — they need the
                      // teach flow from Kangaskhan Storage, not a one-click use.
                      const itemId = items.find((id) => {
                        const it = getItem(id);
                        return it && isUsableItem(id) && !it.effect?.tm;
                      });
                      if (!itemId) { setError(t("No usable items!", language)); setTimeout(() => setError(""), 1500); return; }
                      const shopItem = SHOP_ITEMS.find((s) => s.id === itemId);
                      if (!shopItem) return;
                      const effect = shopItem.effect || {};
                      let used = false;
                      if (effect.heal) {
                        const newHp = applyHeal(effect, pkm);
                        if (newHp > (pkm.hp || 0)) {
                          await updateTeamMember(pkm.id, { hp: newHp });
                          used = true;
                        }
                      }
                      if (effect.restorePP) {
                        const moves = (pkm.moves || []).map((m) => ({ ...m, ppUsed: 0 }));
                        await updateTeamMember(pkm.id, { moves });
                        used = true;
                      }
                      if (!used) { setError(t("It had no effect...", language)); setTimeout(() => setError(""), 1500); return; }
                      const newItems = items.filter((id) => id !== itemId);
                      const inv = mergeInventory(profile?.inventory, { items: newItems });
                      await saveProfile(accountId, { inventory: inv });
                      setProfile((p) => p ? { ...p, inventory: inv } : p);
                      loadTeam();
                    }}
                    className="w-full rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 text-left flex items-center gap-2"
                  >
                    <SpriteImg id={pkm.pokemonId || pkm.pokemon_id || 25} size={28} />
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
          <div className="max-w-lg w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/53.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">{t("Bank", language)}</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-stone-700/40 p-3">
                <p className="text-[10px] text-stone-400">{t("Pocket", language)}</p>
                <p className="text-yellow-400 font-bold">💰 {profile?.inventory?.gold || 0}</p>
              </div>
              <div className="rounded-xl bg-stone-700/40 p-3">
                <p className="text-[10px] text-stone-400">{t("Bank", language)}</p>
                <p className="text-blue-400 font-bold">🏦 {profile?.inventory?.banked_gold || 0}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={bankDeposit}
                  onChange={(e) => setBankDeposit(e.target.value)}
                  placeholder={t("Deposit amount", language)}
                  className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500"
                />
                <button
                  onClick={handleBankDeposit}
                  disabled={!bankDeposit || parseInt(bankDeposit) <= 0 || parseInt(bankDeposit) > (profile?.inventory?.gold || 0)}
                  className="rounded-lg bg-green-800 px-3 py-2 text-xs text-green-200 hover:bg-green-700 disabled:opacity-40 transition-colors"
                >
                  {t("Deposit", language)}
                </button>
                <button
                  onClick={() => handleBankTransfer(profile?.inventory?.gold || 0, "deposit")}
                  disabled={(profile?.inventory?.gold || 0) <= 0}
                  className="rounded-lg bg-green-900/70 px-3 py-2 text-xs text-green-300 hover:bg-green-800 disabled:opacity-40 transition-colors"
                  title={t("Deposit all pocket gold", language)}
                >
                  {t("All", language)}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={bankWithdraw}
                  onChange={(e) => setBankWithdraw(e.target.value)}
                  placeholder={t("Withdraw amount", language)}
                  className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500"
                />
                <button
                  onClick={handleBankWithdraw}
                  disabled={!bankWithdraw || parseInt(bankWithdraw) <= 0 || parseInt(bankWithdraw) > (profile?.inventory?.banked_gold || 0)}
                  className="rounded-lg bg-blue-800 px-3 py-2 text-xs text-blue-200 hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  {t("Withdraw", language)}
                </button>
                <button
                  onClick={() => handleBankTransfer(profile?.inventory?.banked_gold || 0, "withdraw")}
                  disabled={(profile?.inventory?.banked_gold || 0) <= 0}
                  className="rounded-lg bg-blue-900/70 px-3 py-2 text-xs text-blue-300 hover:bg-blue-800 disabled:opacity-40 transition-colors"
                  title={t("Withdraw all bank gold", language)}
                >
                  {t("All", language)}
                </button>
              </div>
            </div>
            {/* Send gold to a friend as a pending gift (escrow) */}
            <div className="border-t border-stone-700 pt-3 space-y-2">
              <p className="text-xs text-stone-400">{t("gift-send-gold", language)}</p>
              <p className="text-[10px] text-stone-500">{t("gift-send-hint", language)}</p>
              <div className="flex gap-1.5">
                {["bank", "pocket"].map((src) => (
                  <button
                    key={src}
                    onClick={() => setBankSendSource(src)}
                    className={`flex-1 rounded-lg px-2 py-1 text-[10px] uppercase tracking-wide transition-colors ${
                      bankSendSource === src
                        ? "bg-stone-500 text-stone-100"
                        : "bg-stone-700 text-stone-400 hover:bg-stone-600"
                    }`}
                  >
                    {src === "bank" ? `${t("Bank", language)} (${profile?.inventory?.banked_gold || 0})` : `${t("Pocket", language)} (${profile?.inventory?.gold || 0})`}
                  </button>
                ))}
              </div>
              {bankSendFriend ? (
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={bankSendGold}
                    onChange={(e) => setBankSendGold(e.target.value)}
                    placeholder={t("Amount", language)}
                    className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500"
                  />
                  <button
                    onClick={() => handleSendGoldToFriend(bankSendFriend.id)}
                    disabled={!bankSendGold || parseInt(bankSendGold) <= 0}
                    className="rounded-lg bg-emerald-800 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    {t("Send to", language)} {bankSendFriend.display_name || bankSendFriend.username}
                  </button>
                  <button onClick={() => setBankSendFriend(null)} className="text-stone-500 hover:text-stone-300 text-sm">&times;</button>
                </div>
              ) : friends.length === 0 ? (
                <p className="text-[10px] text-stone-500 text-center py-1">{t("gift-no-friends", language)}</p>
              ) : (
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
                  {friends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setBankSendFriend(f)}
                      className="rounded-lg bg-stone-700/40 px-2 py-1 text-[10px] text-stone-300 hover:bg-stone-600/40 text-left"
                    >
                      {f.display_name || f.username}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-stone-500 text-center">{t("Gold in the bank is safe if you die in a dungeon.", language)}</p>
          </div>
        </div>
      )}

      {activeNPC && activeNPC.id === "moves" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-100">{t("Move Changer", language)}</h2>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            {!moveChangerPkm ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">{t("Choose a Pokémon to change its moves:", language)}</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={() => openMoveChanger(pkm)}
                    className="w-full rounded-xl bg-stone-700/40 p-3 flex items-center gap-2 hover:bg-stone-600/40 transition-colors"
                  >
                    <SpriteImg id={pkm.pokemonId || pkm.pokemon_id || 25} size={34} />
                    <div className="text-left">
                      <p className="text-sm text-stone-200">{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</p>
                      <p className="text-[10px] text-stone-400">{t("Lv.", language)}{pkm.level || 5}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SpriteImg id={moveChangerPkm.pokemonId || moveChangerPkm.pokemon_id || 25} size={30} />
                  <p className="text-sm text-stone-200 font-semibold">
                    {moveChangerPkm.nickname || getSpeciesName(moveChangerPkm.pokemonId || moveChangerPkm.pokemon_id)}
                    <span className="text-stone-400 font-normal"> · {t("Lv.", language)}{moveChangerPkm.level || 5}</span>
                  </p>
                </div>

                {/* Current moves — pick one to replace when the set is full */}
                <div className="space-y-1.5">
                  <p className="text-xs text-stone-400">{t("Current moves:", language)}</p>
                  {(moveChangerPkm.moves || []).map((move, si) => (
                    <button
                      key={si}
                      onClick={() => setMoveChangerSlot(si)}
                      className={`w-full rounded-xl p-2.5 text-left flex items-center gap-2 transition-colors ${
                        moveChangerSlot === si
                          ? "bg-green-800/40 ring-1 ring-green-600"
                          : "bg-stone-700/40 hover:bg-stone-600/40"
                      }`}
                    >
                      <span className="text-sm text-stone-200">{getMoveName(move, language)}</span>
                      {moveChangerSlot === si && (
                        <span className="ml-auto text-[10px] text-green-400">{t("replace", language)}</span>
                      )}
                    </button>
                  ))}
                  {(moveChangerPkm.moves || []).length === 0 && (
                    <p className="text-[10px] text-amber-400">{t("No moves — pick one below to learn it.", language)}</p>
                  )}
                </div>

                {/* All moves learnable by level — known ones are disabled */}
                <div className="space-y-1.5">
                  <p className="text-xs text-stone-400">
                    {t("Moves by Level", language)} ({availableMoves.length})
                  </p>
                  {availableMoves.length === 0 ? (
                    <p className="text-xs text-stone-500">{t("No level-up moves available.", language)}</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {availableMoves.map((m) => {
                        const known = (moveChangerPkm.moves || []).some((k) => (k.name || k) === m.name);
                        const selected = selectedMove?.name === m.name;
                        return (
                          <button
                            key={m.name}
                            onClick={() => !known && setSelectedMove(m)}
                            disabled={known}
                            className={`w-full rounded-xl p-2.5 text-left flex items-center gap-2 transition-colors ${
                              selected
                                ? "bg-green-800/50 ring-1 ring-green-600"
                                : known
                                  ? "bg-stone-800/60 opacity-50 cursor-not-allowed"
                                  : "bg-stone-700/40 hover:bg-stone-600/40"
                            }`}
                          >
                            <span className={`text-sm ${known ? "text-stone-500 line-through" : "text-stone-200"}`}>
                              {getMoveName(m, language)}
                            </span>
                            <span className="ml-auto flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-stone-400 capitalize">{m.type}</span>
                              {m.power > 0 && <span className="text-[10px] text-stone-400">{m.power}</span>}
                              <span className="text-[10px] text-stone-500">Lv.{m.level}</span>
                              {known && <span className="text-[10px] text-stone-500">{t("learned", language)}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleChangeMove}
                  disabled={!selectedMove || ((moveChangerPkm.moves || []).length >= 4 && moveChangerSlot === null)}
                  className="w-full rounded-xl bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-40 transition-colors"
                >
                  Confirm
                </button>
                {(moveChangerPkm.moves || []).length >= 4 && moveChangerSlot === null && (
                  <p className="text-[10px] text-amber-400">{t("Select a current move to replace.", language)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Sage (Whiscash) — evolution helper, replaces the old Name Rater. ─── */}
      {activeNPC && activeNPC.id === "evolve" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/340.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">{t("Sage", language)}</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <p className="text-xs text-stone-400">
              {t("Whiscash is a wise old sage who has seen countless evolutions. He can help a Pokémon that reached the right level evolve — from your team or the club!", language)}
            </p>
            {evolveLoading ? (
              <p className="text-xs text-stone-500 text-center py-4">{t("Checking...", language)}</p>
            ) : evolvable.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-4">{t("No Pokémon can evolve yet. Keep leveling up in dungeons!", language)}</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {evolvable.map((item, i) => {
                  const pkm = item.pkm;
                  const id = pkm.pokemonId || pkm.pokemon_id;
                  return (
                    <div key={`${item.kind}-${pkm.id || i}-${id}`} className="rounded-xl bg-stone-700/40 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <SpriteImg id={id} size={30} />
                        <span className="text-sm text-stone-200">{pkm.nickname || getSpeciesName(id)}</span>
                        <span className="ml-auto text-[10px] text-stone-500">{t("Lv.", language)}{pkm.level || 5}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleEvolve(item, opt)}
                            className="flex-1 min-w-[8rem] rounded-lg bg-purple-800 px-2 py-1.5 text-xs text-purple-200 hover:bg-purple-700 transition-colors"
                          >
                            {t("Evolve", language)} → {getSpeciesName(opt.id)}
                            {opt.item && (
                              <span className="block text-[10px] text-purple-300/80">
                                {getItemIcon(opt.item)} {getItemName(opt.item, language)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
        {chatOpen ? t("Close", language) : t("Chat", language)}
      </button>

      {/* ─── Friends toggle button ─── */}
      <button
        onClick={() => { setFriendsOpen((o) => !o); if (!friendsOpen) loadFriends(); }}
        className="fixed bottom-4 right-24 z-50 rounded-full bg-slate-700 px-4 py-2 text-xs text-slate-300 shadow-lg hover:bg-slate-600 transition-colors"
      >
        {friendsOpen ? t("Close", language) : t("Friends", language)}
      </button>

      {/* ─── Friends panel ─── */}
      {friendsOpen && (
        <div className="fixed bottom-16 right-24 z-50 w-80 rounded-xl border border-slate-700 bg-slate-800/95 backdrop-blur shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
            <span className="text-xs font-semibold text-slate-300">{t("Friends", language)}</span>
            <button onClick={closeFriends} className="text-slate-500 hover:text-slate-300 text-sm">&times;</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700 text-[10px]">
            {(["friends", "requests", "add"]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFriendsTab(tab)}
                className={`flex-1 py-2 font-semibold uppercase tracking-wider transition-colors ${
                  friendsTab === tab ? "text-slate-100 bg-slate-700/50" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "friends" ? `${t("Friends", language)} (${friends.length})` : tab === "requests" ? `${t("Requests", language)} (${incomingRequests.length})` : t("Add", language)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto max-h-64 px-3 py-2 space-y-1.5">
            {friendsTab === "friends" && (
              friends.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-4">
                  {t("No friends yet. Add friends to see who's exploring and join their dungeons!", language)}
                </p>
              ) : (
                friends.map((f) => {
                  const village = friendVillages[f.id];
                  const isCurrentVillage = village && village.roomId === session?.roomId;
                  const inDungeon = friendDungeons.some((d) => d.friends.some((fd) => fd.id === f.id));
                  return (
                    <div key={f.id} className="flex items-center gap-2 rounded-lg bg-slate-700/40 px-3 py-2">
                      <span className="text-sm text-slate-200 font-medium truncate flex-1">
                        {f.display_name || f.username}
                      </span>
                      {village && !isCurrentVillage ? (
                        <button
                          onClick={() => joinFriendVillage(f.id)}
                          disabled={friendBusy || actionBusy !== null}
                          className="rounded-lg bg-blue-800 px-2 py-1 text-[10px] text-blue-200 hover:bg-blue-700 disabled:opacity-40 transition-colors"
                        >
                          {t("Join village", language)}
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-600">
                          {isCurrentVillage ? t("Same village", language) : inDungeon ? t("In dungeon", language) : t("Offline", language)}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveFriend(f.id)}
                        className="rounded-lg bg-red-900/60 px-2 py-1 text-[10px] text-red-300 hover:bg-red-800/60 transition-colors"
                      >
                        {t("Remove", language)}
                      </button>
                    </div>
                  );
                })
              )
            )}

            {friendsTab === "requests" && (
              <>
                {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">{t("No pending requests.", language)}</p>
                ) : (
                  <>
                    {incomingRequests.map((r) => (
                      <div key={r.id} className="rounded-lg bg-slate-700/40 px-3 py-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-200 font-medium truncate flex-1">
                            {r.display_name || r.username}
                          </span>
                          <span className="text-[9px] text-slate-500">{t("wants to be friends", language)}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleRespond(r.id, true)}
                            disabled={friendBusy}
                            className="flex-1 rounded-lg bg-green-800 px-2 py-1 text-[10px] text-green-200 hover:bg-green-700 disabled:opacity-40"
                          >
                            {t("Accept", language)}
                          </button>
                          <button
                            onClick={() => handleRespond(r.id, false)}
                            disabled={friendBusy}
                            className="flex-1 rounded-lg bg-stone-700 px-2 py-1 text-[10px] text-stone-400 hover:bg-stone-600 disabled:opacity-40"
                          >
                            {t("Decline", language)}
                          </button>
                        </div>
                      </div>
                    ))}
                    {outgoingRequests.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 rounded-lg bg-slate-700/40 px-3 py-2">
                        <span className="text-xs text-slate-400 truncate flex-1">
                          {r.display_name || r.username} <span className="text-slate-600">{t("(request sent)", language)}</span>
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {friendsTab === "add" && (
              <div className="space-y-1.5">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                  className="flex gap-1.5"
                >
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("Search by username...", language)}
                    className="flex-1 rounded-lg bg-slate-700/60 border border-slate-600 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={searchQuery.trim().length < 2}
                    className="rounded-lg bg-blue-800 px-2.5 py-1.5 text-[10px] text-blue-200 hover:bg-blue-700 disabled:opacity-40"
                  >
                    {t("Search", language)}
                  </button>
                </form>
                {searchResults.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-3">
                    {searchQuery.trim().length >= 2 ? t("No accounts found.", language) : t("Type at least 2 characters to search.", language)}
                  </p>
                ) : (
                  searchResults.map((a) => {
                    const alreadyFriend = friends.some((f) => f.id === a.id);
                    const requestSent = outgoingRequests.some((r) => r.id === a.id);
                    const isSelf = a.id === accountId;
                    return (
                      <div key={a.id} className="flex items-center gap-2 rounded-lg bg-slate-700/40 px-3 py-2">
                        <span className="text-xs text-slate-200 font-medium truncate flex-1">
                          {a.display_name || a.username}
                        </span>
                        <button
                          onClick={() => handleSendRequest(a.id)}
                          disabled={friendBusy || alreadyFriend || requestSent || isSelf}
                          className="rounded-lg bg-green-800 px-2 py-1 text-[10px] text-green-200 hover:bg-green-700 disabled:opacity-40"
                        >
                          {isSelf ? t("You", language) : alreadyFriend ? t("Friends", language) : requestSent ? t("Sent", language) : t("Add", language)}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Gifts toggle button ─── */}
      <button
        onClick={() => { setGiftsOpen((o) => !o); if (!giftsOpen) loadGifts(); }}
        className="fixed bottom-4 right-44 z-50 rounded-full bg-emerald-700 px-4 py-2 text-xs text-emerald-200 shadow-lg hover:bg-emerald-600 transition-colors"
      >
        🎁 {incomingGifts.length > 0 ? `${t("gifts", language)} (${incomingGifts.length})` : t("gifts", language)}
      </button>

      {/* ─── Gifts panel (incoming accept/decline, outgoing status) ─── */}
      {giftsOpen && (
        <div className="fixed bottom-16 right-44 z-50 w-80 rounded-xl border border-emerald-800 bg-stone-800/95 backdrop-blur shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-emerald-900 px-3 py-2">
            <span className="text-xs font-semibold text-emerald-300">{t("gifts", language)}</span>
            <button onClick={() => setGiftsOpen(false)} className="text-stone-500 hover:text-stone-300 text-sm">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64 px-3 py-2 space-y-1.5">
            {incomingGifts.length === 0 && outgoingGifts.length === 0 ? (
              <p className="text-[10px] text-stone-500 text-center py-4">{t("gift-empty", language)}</p>
            ) : (
              <>
                {incomingGifts.map((g) => (
                  <div key={g.id} className="rounded-lg bg-stone-700/40 px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-200 font-medium truncate flex-1">
                        {g.sender?.display_name || g.sender?.username || "?"}
                      </span>
                      <span className="text-[9px] text-stone-500">{t("gift-sent-you", language)}</span>
                    </div>
                    <p className="text-[10px] text-stone-400">{formatGiftContents(g.items, g.gold, g.pokemon, language)}</p>
                    {g.note && <p className="text-[10px] text-stone-500 italic">"{g.note}"</p>}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleGiftResponse(g.id, true)}
                        disabled={giftBusy}
                        className="flex-1 rounded-lg bg-green-800 px-2 py-1 text-[10px] text-green-200 hover:bg-green-700 disabled:opacity-40"
                      >
                        {t("Accept", language)}
                      </button>
                      <button
                        onClick={() => handleGiftResponse(g.id, false)}
                        disabled={giftBusy}
                        className="flex-1 rounded-lg bg-stone-700 px-2 py-1 text-[10px] text-stone-400 hover:bg-stone-600 disabled:opacity-40"
                      >
                        {t("Decline", language)}
                      </button>
                    </div>
                  </div>
                ))}
                {outgoingGifts.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 rounded-lg bg-stone-700/40 px-3 py-2">
                    <span className="text-xs text-stone-400 truncate flex-1">
                      {g.receiver?.display_name || g.receiver?.username || "?"} — {formatGiftContents(g.items, g.gold, g.pokemon, language)}
                    </span>
                    <span className={`text-[9px] ${
                      g.status === "accepted" ? "text-green-400"
                        : g.status === "declined" ? "text-red-400" : "text-yellow-400"
                    }`}>
                      {g.status === "accepted" ? t("Accepted", language) : g.status === "declined" ? t("Declined", language) : t("Pending", language)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Chat panel ─── */}
      {chatOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-72 rounded-xl border border-stone-700 bg-stone-800/95 backdrop-blur shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-700 px-3 py-2">
            <span className="text-xs font-semibold text-stone-300">{t("Chat", language)}</span>
            <button onClick={() => setChatOpen(false)} className="text-stone-500 hover:text-stone-300 text-sm">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-60 px-3 py-2 space-y-1.5">
            {messages.length === 0 && (
              <p className="text-[10px] text-stone-500 text-center">{t("No messages yet", language)}</p>
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
              placeholder={t("Type a message...", language)}
              maxLength={200}
              className="flex-1 min-w-0 rounded-lg bg-stone-700/60 border border-stone-600 px-2.5 py-1.5 text-xs text-stone-100 placeholder:text-stone-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              {t("Send", language)}
            </button>
          </form>
        </div>
      )}

      {/* ─── Kangaskhan Storage ─── */}
      {activeNPC && activeNPC.id === "storage" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/115.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">{t("Kangaskhan Storage", language)}</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>

            {!storageSelectedItem && !storageSendItem ? (
              <>
                <p className="text-xs text-stone-400">
                  {t("Items you carry can be lost if you faint in a dungeon. Store them to keep them safe!", language)}
                </p>
                {(profile?.inventory?.items || []).length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleStoreAllItems}
                      className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-700 transition-colors"
                    >
                      {t("Store All", language)}
                    </button>
                  </div>
                )}
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  <StorageItemGroup
                    items={profile?.inventory?.items}
                    label={`${t("Carried", language)} (${(profile?.inventory?.items || []).length})`}
                    language={language}
                    action={(itemId) => (
                      <>
                        <button
                          onClick={() => setStorageSelectedItem(itemId)}
                          className="rounded-lg bg-blue-800 px-2.5 py-1.5 text-xs text-blue-200 hover:bg-blue-700 transition-colors"
                        >
                          {t("Use", language)}
                        </button>
                        <button
                          onClick={() => handleStoreItem(itemId)}
                          className="rounded-lg bg-amber-800 px-2.5 py-1.5 text-xs text-amber-200 hover:bg-amber-700 transition-colors"
                        >
                          {t("Store", language)}
                        </button>
                        <button
                          onClick={() => { setStorageSendItem(itemId); setStorageSendSource("items"); setStorageSendFriend(null); }}
                          className="rounded-lg bg-green-800 px-2.5 py-1.5 text-xs text-green-200 hover:bg-green-700 transition-colors"
                        >
                          {t("Send", language)}
                        </button>
                      </>
                    )}
                  />
                  <StorageItemGroup
                    items={profile?.inventory?.storage}
                    label={`${t("Stored", language)} (${(profile?.inventory?.storage || []).length})`}
                    language={language}
                    action={(itemId) => (
                      <>
                        <button
                          onClick={() => handleWithdrawItem(itemId)}
                          className="rounded-lg bg-slate-600 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-500 transition-colors"
                        >
                          {t("Withdraw", language)}
                        </button>
                        <button
                          onClick={() => { setStorageSendItem(itemId); setStorageSendSource("storage"); setStorageSendFriend(null); }}
                          className="rounded-lg bg-green-800 px-2.5 py-1.5 text-xs text-green-200 hover:bg-green-700 transition-colors"
                        >
                          {t("Send", language)}
                        </button>
                      </>
                    )}
                  />
                </div>
              </>
            ) : tmTeaching ? (
              // TM with a full moveset: pick which current move to forget.
              <div className="space-y-2">
                <p className="text-xs text-stone-400">
                  {getItemName(tmTeaching.itemId, language)} — {t("pick a move to forget:", language)}
                </p>
                <p className="text-xs text-stone-300">
                  {tmTeaching.pkm.nickname || getSpeciesName(tmTeaching.pkm.pokemonId || tmTeaching.pkm.pokemon_id)}:
                </p>
                {(tmTeaching.pkm.moves || []).map((move, si) => (
                  <button
                    key={si}
                    onClick={() => handleTMDropReplace(si)}
                    className="w-full rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 text-left flex items-center gap-2"
                  >
                    <span>{getMoveName(move, language)}</span>
                    <span className="ml-auto text-[10px] text-green-400">
                      → {getMoveName({ name: tmTeaching.slug }, language)}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setTmTeaching(null)}
                  className="w-full rounded-lg bg-stone-700 px-3 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                >
                  {t("Back", language)}
                </button>
              </div>
            ) : storageSendItem ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">{t("gift-send-this", language)}</p>
                <p className="text-sm text-stone-200 font-medium">
                  {getItemName(storageSendItem, language)}
                </p>
                <p className="text-[10px] text-stone-500">
                  {storageSendSource === "storage"
                    ? t("From Kangaskhan Storage — returns here if declined.", language)
                    : t("From your carried items — returns to your bag if declined.", language)}
                </p>
                {friends.length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-4">{t("gift-no-friends", language)}</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {friends.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleSendItemToFriend(f.id)}
                        className="w-full flex items-center gap-2 rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 transition-colors"
                      >
                        <span className="text-sm">{f.display_name || f.username}</span>
                        <span className="ml-auto text-[10px] text-stone-500">{f.username}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setStorageSendItem(null)}
                  className="w-full rounded-lg bg-stone-700 px-3 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                >
                  {t("Back", language)}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">{t("Choose a Pokémon to use this item on:", language)}</p>
                {team.map((pkm, i) => (
                  <button
                    key={pkm.id || i}
                    onClick={() => handleUseStorageItem(storageSelectedItem, pkm)}
                    className="w-full rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 text-left flex items-center gap-2"
                  >
                    <SpriteImg id={pkm.pokemonId || pkm.pokemon_id || 25} size={28} />
                    <span>{pkm.nickname || getSpeciesName(pkm.pokemonId || pkm.pokemon_id)}</span>
                    <span className="ml-auto text-stone-500">HP {pkm.hp || 0}/{pkm.maxHp || pkm.max_hp || 100}</span>
                  </button>
                ))}
                <button
                  onClick={() => setStorageSelectedItem(null)}
                  className="w-full rounded-lg bg-stone-700 px-3 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                >
                  {t("Back", language)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Club Wigglytuff ─── */}
      {activeNPC && activeNPC.id === "club" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${SPRITE_URL}/40.png`} alt="" className="w-6 h-6" />
                <h2 className="text-lg font-bold text-stone-100">{t("Club Wigglytuff", language)}</h2>
              </div>
              <button onClick={closeNPC} className="text-stone-500 hover:text-stone-300 text-lg">&times;</button>
            </div>
            <p className="text-xs text-stone-400">
              {t("Wild Pokémon that want to join you wait here — they're safe even if you faint in a dungeon. Choose one to adventure with.", language)}
            </p>

            {/* Current active partner */}
            {team[0] && (
              <div className="rounded-xl bg-stone-700/60 border border-stone-600 p-3 flex items-center gap-3">
                <SpriteImg id={team[0].pokemonId || team[0].pokemon_id || 25} size={40} />
                <div>
                  <p className="text-sm text-stone-200 font-semibold">{team[0].nickname || getSpeciesName(team[0].pokemonId || team[0].pokemon_id)}</p>
                  <p className="text-[10px] text-stone-400">{t("Active partner", language)} · {t("Lv.", language)}{team[0].level || 5}</p>
                </div>
              </div>
            )}

            {/* Club pool */}
            {clubSendPkm ? (
              // Sending a club Pokémon to a friend — pick who gets it.
              <div className="space-y-2">
                <p className="text-xs text-stone-400">{t("gift-send-pkm", language)}</p>
                <p className="text-sm text-stone-200 font-medium">
                  ⚡ {clubSendPkm.nickname || getSpeciesName(clubSendPkm.pokemon_id)} ({t("Lv.", language)}{clubSendPkm.level || 5})
                </p>
                <p className="text-[10px] text-stone-500">{t("gift-send-pkm-hint", language)}</p>
                {friends.length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-4">{t("gift-no-friends", language)}</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {friends.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleSendPkmToFriend(f.id)}
                        className="w-full flex items-center gap-2 rounded-lg bg-stone-700/40 px-3 py-2 text-xs text-stone-300 hover:bg-stone-600/40 transition-colors"
                      >
                        <span className="text-sm">{f.display_name || f.username}</span>
                        <span className="ml-auto text-[10px] text-stone-500">{f.username}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setClubSendPkm(null)}
                  className="w-full rounded-lg bg-stone-700 px-3 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                >
                  {t("Back", language)}
                </button>
              </div>
            ) : renamePkm ? (
              // Naming a club Pokémon — input + confirm.
              <div className="space-y-3">
                <p className="text-sm text-stone-200 font-medium">
                  ⚡ {renamePkm.nickname || getSpeciesName(renamePkm.pokemon_id)} ({t("Lv.", language)}{renamePkm.level || 5})
                </p>
                <p className="text-xs text-stone-400">{t("New nickname:", language)}</p>
                <input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl bg-stone-700/60 border border-stone-600 px-4 py-2.5 text-sm text-stone-100 text-center"
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setRenamePkm(null)}
                    className="flex-1 rounded-lg bg-stone-700 px-4 py-2 text-sm text-stone-400 hover:bg-stone-600 transition-colors"
                  >
                    {t("Back", language)}
                  </button>
                  <button
                    onClick={handleRename}
                    disabled={!newNickname.trim()}
                    className="flex-1 rounded-xl bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-40 transition-colors"
                  >
                    {t("Confirm", language)}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-stone-500">{t("Club members", language)} ({profile?.stored_pokemon?.length || 0})</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(profile?.stored_pokemon || []).length === 0 ? (
                    <p className="text-xs text-stone-500 text-center py-4">{t("No one here yet. Catch some wild Pokémon in dungeons!", language)}</p>
                  ) : (
                    (profile?.stored_pokemon || []).map((pkm, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-stone-700/40 p-3 gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <SpriteImg id={pkm.pokemon_id} size={34} />
                          <div className="min-w-0">
                            <p className="text-sm text-stone-200 truncate">{pkm.nickname || getSpeciesName(pkm.pokemon_id)}</p>
                            <p className="text-[10px] text-stone-500">{t("Lv.", language)}{pkm.level || 5}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          <button
                            onClick={() => handleMakeActive(pkm)}
                            className="rounded-lg bg-green-800 px-2.5 py-1.5 text-xs text-green-200 hover:bg-green-700 transition-colors"
                          >
                            {t("Make Active", language)}
                          </button>
                          <button
                            onClick={() => { setRenamePkm(pkm); setNewNickname(pkm.nickname || getSpeciesName(pkm.pokemon_id)); }}
                            className="rounded-lg bg-blue-800 px-2.5 py-1.5 text-xs text-blue-200 hover:bg-blue-700 transition-colors"
                          >
                            {t("Rename", language)}
                          </button>
                          <button
                            onClick={() => setClubSendPkm(pkm)}
                            className="rounded-lg bg-emerald-800 px-2.5 py-1.5 text-xs text-emerald-200 hover:bg-emerald-700 transition-colors"
                          >
                            {t("Send", language)}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Account Reset (Xatu) ─── */}
      {activeNPC && activeNPC.id === "quiz-reset" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={`${SPRITE_URL}/178.png`} alt="" className="w-8 h-8" />
              <h2 className="text-lg font-bold text-stone-100">{t("Account Reset", language)}</h2>
            </div>
            {!showQuizResetConfirm ? (
              <>
                <p className="text-sm text-stone-300">
                  {t("Xatu can erase your memory of the starter quiz, letting you choose a new partner.", language)}
                </p>
                <p className="text-xs text-amber-400">
                  {t("Your starter Pokémon will be released. Other Pokémon and items are safe.", language)}
                </p>
                <button
                  onClick={() => setShowQuizResetConfirm(true)}
                  className="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-700 transition-colors"
                >
                  {t("Reset Account", language)}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-amber-400 font-semibold">{t("Are you sure?", language)}</p>
                <p className="text-xs text-stone-400">{t("This will delete your starter Pokémon. This cannot be undone.", language)}</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleQuizReset}
                    className="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-700 transition-colors"
                  >
                    {t("Yes, Reset Everything", language)}
                  </button>
                  <button
                    onClick={() => setShowQuizResetConfirm(false)}
                    className="w-full rounded-xl bg-stone-700 px-4 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
                  >
                    {t("Cancel", language)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeNPC && activeNPC.id === "password" && (
        <ChangePasswordDialog accountId={accountId} onClose={closeNPC} />
      )}

      {activeNPC && activeNPC.id === "adventure" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-stone-700 bg-stone-800 p-6 space-y-4 text-center">
            <p className="text-4xl">🗺️</p>
            <h2 className="text-xl font-bold text-stone-100">{t("Dungeon Crawler", language)}</h2>
            <p className="text-sm text-stone-400">
              {t("Explore alone, join a friend, or invade someone else's dungeon!", language) || "Explore alone, join a friend, or invade someone else's dungeon!"}
            </p>
            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 rounded-xl px-4 py-2">{error}</p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={startSoloDungeon}
                disabled={actionBusy !== null || team.length === 0}
                className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {actionBusy === "solo" ? t("Starting...", language) : t("Go to a dungeon", language)}
              </button>
              <button
                onClick={invadeDungeon}
                disabled={actionBusy !== null || team.length === 0}
                className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionBusy === "invade" ? t("Invading...", language) : t("Invade a dungeon", language)}
              </button>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 text-left">
                  {t("Friends in dungeons", language)}
                </p>
                {friendDungeons.length === 0 ? (
                  <p className="text-xs text-stone-500 rounded-xl bg-stone-700/40 px-4 py-3">
                    {t("No friends are exploring right now. Ask them to start a dungeon, then come back!", language)}
                  </p>
                ) : (
                  friendDungeons.map((d) => (
                    <button
                      key={d.roomId}
                      onClick={() => joinFriendRoom(d.code)}
                      disabled={actionBusy !== null || team.length === 0}
                      className="w-full rounded-xl bg-blue-800 px-4 py-3 text-left text-sm text-blue-100 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <span className="block font-semibold">
                        {d.friends.map((f) => f.display_name || f.player_name).join(", ")}
                      </span>
                      <span className="text-[10px] text-blue-300">
                        {t("Room", language)} {d.code} · {t("Floor", language)} {d.floor}
                      </span>
                    </button>
                  ))
                )}
                <button
                  onClick={loadFriends}
                  disabled={actionBusy !== null}
                  className="w-full rounded-xl bg-stone-700/60 px-4 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors disabled:opacity-50"
                >
                  {t("Refresh", language)}
                </button>
              </div>
              <button
                onClick={closeNPC}
                className="w-full rounded-xl bg-stone-700 px-4 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
              >
                {t("Cancel", language)}
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
