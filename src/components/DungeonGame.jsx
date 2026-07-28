import { useState, useEffect, useCallback, useRef } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t, getTypeName } from "../stores/translations";
import { supabase } from "../lib/supabase";
import { generateDungeon, isWalkable, moveEnemyToward, TILE } from "../lib/dungeon";
import { getSpeciesName, getRandomMovesForSpecies, getSpeciesType, getSpeciesSpeed, calcExpGain, checkLevelUp } from "../lib/moves";
import { removeTeamMember, updateTeamMember, getTeam, getProfile, saveProfile } from "../lib/auth";
import LanguageSelector from "./LanguageSelector";
import DungeonMap from "./DungeonMap";
import DungeonBattle from "./DungeonBattle";
import CaptureScreen from "./CaptureScreen";

export default function DungeonGame({ roomId, roomCode, playerId, isHost, accountId, accountName, team: initialTeam, onTeamUpdate, onLeave }) {
  const [language, setLanguage] = useState(getLanguage());
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [dungeon, setDungeon] = useState(null);
  const [myPlayer, setMyPlayer] = useState(null);
  const [visitedTiles, setVisitedTiles] = useState(() => new Set());
  const [inBattle, setInBattle] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [captureAttempt, setCaptureAttempt] = useState(null);
  const [team, setTeam] = useState(initialTeam);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [allReady, setAllReady] = useState(false);
  const [error, setError] = useState("");
  const [goldCount, setGoldCount] = useState(0);
  const [enemiesMoved, setEnemiesMoved] = useState(true);
  const [floorNum, setFloorNum] = useState(1);
  const [showStairsChoice, setShowStairsChoice] = useState(false);
  const [showSafeExit, setShowSafeExit] = useState(false);
  const channelRef = useRef(null);
  const stepCountRef = useRef(0);

  useEffect(() => subscribe(setLanguage), []);

  // Load room and players
  useEffect(() => {
    async function loadRoom() {
      const { data: roomData } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomData) setRoom(roomData);

      const { data: playersData } = await supabase
        .from("room_players")
        .select("*")
        .eq("room_id", roomId)
        .order("joined_at");

      if (playersData) {
        setPlayers(playersData);
        const me = playersData.find((p) => p.player_id === playerId);
        if (me) setMyPlayer(me);
      }
    }
    loadRoom();
  }, [roomId, playerId]);

  // Generate dungeon when host starts the game
  const startGame = useCallback(async () => {
    if (!isHost || !room) return;

    const gen = generateDungeon(20, 15, room.dungeon_seed);

    // Update room status
    await supabase.from("rooms").update({ status: "playing" }).eq("id", roomId);

    // Set player positions
    const positions = players.map((p, i) => ({
      id: p.id,
      position_x: gen.spawnX + (i % 3),
      position_y: gen.spawnY + Math.floor(i / 3),
    }));

    for (const pos of positions) {
      await supabase
        .from("room_players")
        .update({ position_x: pos.position_x, position_y: pos.position_y })
        .eq("id", pos.id);
    }

    // Save dungeon state
    await supabase.from("dungeon_state").insert({
      room_id: roomId,
      width: gen.width,
      height: gen.height,
      tiles: gen.tiles,
      enemies: gen.enemies,
      treasures: gen.treasures,
      gold: gen.gold,
    });

    // Broadcast game start
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "game_start",
        payload: {},
      });
    }

    setDungeon(gen);
    setRoom((r) => ({ ...r, status: "playing" }));
  }, [isHost, room, roomId, players]);

  // Shared helper to load dungeon from DB
  const loadDungeonFromDb = useCallback(async () => {
    const { data } = await supabase
      .from("dungeon_state")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    if (data) {
      setDungeon({
        width: data.width,
        height: data.height,
        tiles: data.tiles,
        enemies: data.enemies || [],
        treasures: data.treasures || [],
        gold: data.gold || [],
        spawnX: 1,
        spawnY: 1,
        rooms: [],
        stairsX: data.width - 3,
        stairsY: data.height - 3,
      });
    }
  }, [roomId]);

  // Auto-generate dungeon if host and no dungeon_state exists
  useEffect(() => {
    if (!room || room.status !== "playing" || !isHost || dungeon) return;
    if (players.length === 0) return;

    async function autoStart() {
      try {
        const { data: existing } = await supabase
          .from("dungeon_state")
          .select("id")
          .eq("room_id", roomId)
          .maybeSingle();

        if (existing) {
          await loadDungeonFromDb();
          return;
        }

        const gen = generateDungeon(20, 15, room.dungeon_seed);

        const positions = players.map((p, i) => ({
          id: p.id,
          position_x: gen.spawnX + (i % 3),
          position_y: gen.spawnY + Math.floor(i / 3),
        }));

        for (const pos of positions) {
          await supabase
            .from("room_players")
            .update({ position_x: pos.position_x, position_y: pos.position_y })
            .eq("id", pos.id);
        }

        const { error: insertErr } = await supabase.from("dungeon_state").insert({
          room_id: roomId,
          width: gen.width,
          height: gen.height,
          tiles: gen.tiles,
          enemies: gen.enemies,
          treasures: gen.treasures,
          gold: gen.gold,
        });

        if (insertErr) {
          console.error("Failed to insert dungeon_state:", insertErr);
          return;
        }

        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "game_start",
            payload: {},
          });
        }

        // Update local player position to match what we wrote to DB
        const myPos = positions.find((p) => p.id === myPlayer?.id);
        if (myPos) {
          setMyPlayer((prev) => ({
            ...prev,
            position_x: myPos.position_x,
            position_y: myPos.position_y,
          }));
        }
        setDungeon(gen);
      } catch (err) {
        console.error("autoStart error:", err);
      }
    }
    autoStart();
  }, [room, isHost, players, dungeon, roomId, loadDungeonFromDb, myPlayer]);

  // Supabase Realtime channel
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // Could use for real-time position if needed
      })
      .on("broadcast", { event: "player_move" }, ({ payload }) => {
        if (payload.playerId === playerId) return;
        setPlayers((prev) =>
          prev.map((p) =>
            p.player_id === payload.playerId
              ? { ...p, position_x: payload.x, position_y: payload.y }
              : p
          )
        );
      })
      .on("broadcast", { event: "game_start" }, () => {
        // Reload room and load dungeon from DB
        supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single()
          .then(({ data }) => {
            if (data) setRoom(data);
          });
        loadDungeonFromDb();
      })
      .on("broadcast", { event: "player_left" }, ({ payload }) => {
        setPlayers((prev) => prev.filter((p) => p.player_id !== payload.playerId));
      })
      .on("broadcast", { event: "game_over" }, ({ payload }) => {
        setBattleResult(payload);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          channel.track({
            player_id: playerId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.send({
        type: "broadcast",
        event: "player_left",
        payload: { playerId },
      });
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, loadDungeonFromDb]);

  // Move all enemies 1 step toward player
  const moveEnemies = useCallback(async () => {
    if (!dungeon || !myPlayer) return;

    const px = myPlayer.position_x;
    const py = myPlayer.position_y;
    const occupied = new Set();
    occupied.add(`${px},${py}`);
    for (const e of dungeon.enemies) {
      occupied.add(`${e.x},${e.y}`);
    }

    const newEnemies = dungeon.enemies.map((e) => {
      const dist = Math.abs(e.x - px) + Math.abs(e.y - py);
      if (dist > 8) return e;
      const pos = moveEnemyToward(dungeon.tiles, e.x, e.y, px, py, occupied);
      if (pos) {
        occupied.delete(`${e.x},${e.y}`);
        occupied.add(`${pos.x},${pos.y}`);
        return { ...e, x: pos.x, y: pos.y };
      }
      return e;
    });

    setDungeon((d) => ({ ...d, enemies: newEnemies }));
    await supabase
      .from("dungeon_state")
      .update({ enemies: newEnemies })
      .eq("room_id", roomId);

    setEnemiesMoved(true);
  }, [dungeon, myPlayer, roomId]);

  // Handle player movement
  const handleMove = useCallback(
    async (x, y) => {
      if (!dungeon || inBattle || !myPlayer || !enemiesMoved) return;
      if (!isWalkable(dungeon.tiles, x, y)) return;

      // Update position locally
      setMyPlayer((p) => ({ ...p, position_x: x, position_y: y }));
      setPlayers((prev) =>
        prev.map((p) =>
          p.player_id === playerId
            ? { ...p, position_x: x, position_y: y }
            : p
        )
      );

      // Mark as visited
      setVisitedTiles((prev) => {
        const next = new Set(prev);
        // Mark nearby tiles as visited too
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            next.add(`${x + dx},${y + dy}`);
          }
        }
        return next;
      });

      // Save to DB
      await supabase
        .from("room_players")
        .update({ position_x: x, position_y: y })
        .eq("player_id", playerId)
        .eq("room_id", roomId);

      // Broadcast movement
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "player_move",
          payload: { playerId, x, y },
        });
      }

      // Auto heal 1 HP every 2 steps
      stepCountRef.current += 1;
      if (stepCountRef.current % 2 === 0) {
        setTeam((prev) => {
          let healed = false;
          const next = prev.map((p) => {
            if (!healed && p.hp < p.max_hp) {
              healed = true;
              const newHp = p.hp + 1;
              if (p.id) updateTeamMember(p.id, { hp: newHp });
              setMyPlayer((mp) => ({ ...mp, hp: newHp }));
              return { ...p, hp: newHp };
            }
            return p;
          });
          return next;
        });
      }

      // Enemies take their turn
      setEnemiesMoved(false);
      setTimeout(() => moveEnemies(), 300);

      // Check for gold
      const goldItem = dungeon.gold?.find(
        (g) => g.x === x && g.y === y && !g.collected
      );
      if (goldItem) {
        setGoldCount((prev) => prev + goldItem.amount);
        setDungeon((d) => ({
          ...d,
          gold: d.gold.map((g) =>
            g.x === x && g.y === y ? { ...g, collected: true } : g
          ),
        }));
        await supabase
          .from("dungeon_state")
          .update({
            gold: dungeon.gold.map((g) =>
              g.x === x && g.y === y ? { ...g, collected: true } : g
            ),
          })
          .eq("room_id", roomId);
      }

      // Check for enemy encounter
      const enemy = dungeon.enemies.find((e) => e.x === x && e.y === y);
      if (enemy) {
        setInBattle({ type: "enemy", data: enemy });
        return;
      }

      // Check for treasure
      const treasure = dungeon.treasures.find(
        (t) => t.x === x && t.y === y && !t.opened
      );
      if (treasure) {
        // Open treasure
        setDungeon((d) => ({
          ...d,
          treasures: d.treasures.map((t) =>
            t.x === x && t.y === y ? { ...t, opened: true } : t
          ),
        }));
        await supabase
          .from("dungeon_state")
          .update({
            treasures: dungeon.treasures.map((t) =>
              t.x === x && t.y === y ? { ...t, opened: true } : t
            ),
          })
          .eq("room_id", roomId);
      }

      // Check for stairs
      if (dungeon.tiles[y]?.[x] === TILE.STAIRS) {
        setShowStairsChoice(true);
      }
    },
    [dungeon, inBattle, myPlayer, playerId, roomId, enemiesMoved, moveEnemies]
  );

  // Handle battle end
  const handleBattleEnd = useCallback(
    async (result) => {
      setBattleResult(result);

      // Sync active Pokémon HP from battle
      if (team[activeTeamIndex]) {
        const newHp = result.playerHp || 0;
        setTeam((prev) => {
          const updated = [...prev];
          updated[activeTeamIndex] = { ...updated[activeTeamIndex], hp: newHp };
          return updated;
        });
        setMyPlayer((prev) => prev ? { ...prev, hp: newHp } : prev);
        if (team[activeTeamIndex].id) {
          await updateTeamMember(team[activeTeamIndex].id, { hp: newHp });
        }
      }

      if (result.result === "won") {
        // Gain EXP
        if (inBattle?.type === "enemy" && team[activeTeamIndex]) {
          const expGain = calcExpGain(inBattle.data.level);
          const pkm = team[activeTeamIndex];
          const newExp = (pkm.exp || 0) + expGain;
          const leveledUp = checkLevelUp(pkm.level || 5, newExp);
          let newLevel = pkm.level || 5;
          let newMaxHp = pkm.maxHp;
          if (leveledUp) {
            newLevel = leveledUp;
            newMaxHp = newMaxHp + 3;
          }
          const updatedPkm = { ...pkm, exp: newExp, level: newLevel, maxHp: newMaxHp };
          setTeam((prev) => {
            const updated = [...prev];
            updated[activeTeamIndex] = updatedPkm;
            return updated;
          });
          if (pkm.id) {
            await updateTeamMember(pkm.id, { level: newLevel, maxHp: newMaxHp, exp: newExp });
          }
          if (leveledUp) {
            setMyPlayer((prev) => prev ? { ...prev, level: newLevel } : prev);
          }
        }

        // Remove enemy from dungeon
        if (inBattle?.type === "enemy") {
          const newEnemies = dungeon.enemies.filter(
            (e) => !(e.x === inBattle.data.x && e.y === inBattle.data.y)
          );
          setDungeon((d) => ({ ...d, enemies: newEnemies }));

          await supabase
            .from("dungeon_state")
            .update({ enemies: newEnemies })
            .eq("room_id", roomId);

          // Update player HP in DB
          await supabase
            .from("room_players")
            .update({ hp: result.playerHp })
            .eq("player_id", playerId)
            .eq("room_id", roomId);

          // Check capture chance
          if (result.captureChance && Math.random() < result.captureChance) {
            setTimeout(() => {
              setCaptureAttempt(inBattle.data);
              setInBattle(null);
              setBattleResult(null);
            }, 2000);
            return;
          }
        }
      } else if (result.result === "lost") {
        // Fainted Pokémon - delete from team
        const fainted = team[activeTeamIndex];
        if (fainted?.id) {
          await removeTeamMember(fainted.id);
        }
        const remaining = team.filter((_, i) => i !== activeTeamIndex);

        // Find next alive member
        let nextIndex = -1;
        for (let i = 0; i < remaining.length; i++) {
          if (remaining[i].hp > 0) { nextIndex = i; break; }
        }

        if (nextIndex >= 0) {
          // Swap to next Pokémon - battle continues
          setTeam(remaining);
          if (onTeamUpdate) onTeamUpdate();
          setActiveTeamIndex(nextIndex);
          const nextPokemon = remaining[nextIndex];
          setMyPlayer((p) => ({ ...p, hp: nextPokemon.hp, max_hp: nextPokemon.maxHp }));
          setTimeout(() => setInBattle(null), 2000);
          return;
        } else {
          // Team wipe - game over
          await supabase
            .from("room_players")
            .update({ is_alive: false, hp: 0 })
            .eq("player_id", playerId)
            .eq("room_id", roomId);
          setMyPlayer((p) => ({ ...p, is_alive: false, hp: 0 }));
          setTimeout(() => {
            setInBattle(null);
            setBattleResult({ result: "lost" });
          }, 2000);
          return;
        }
      }

      setTimeout(() => {
        setInBattle(null);
        if (result.result !== "lost") {
          setBattleResult(null);
        }
      }, 2000);
    },
    [inBattle, dungeon, roomId, playerId, accountId, onTeamUpdate, team, activeTeamIndex]
  );

  // Handle leaving
  const leaveRoom = useCallback(async () => {
    // Fully heal all Pokémon before leaving
    for (const p of team) {
      if (p.hp < p.max_hp && p.id) {
        await updateTeamMember(p.id, { hp: p.max_hp });
      }
    }

    // Clear session immediately so component unmounts and useEffect cleanup runs
    if (onLeave) onLeave();

    // Delete player entry
    await supabase
      .from("room_players")
      .delete()
      .eq("player_id", playerId)
      .eq("room_id", roomId);

    // If host is leaving with no other players, delete the entire room
    if (isHost) {
      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      if (!count || count === 0) {
        await supabase.from("rooms").delete().eq("id", roomId);
      }
    }
  }, [playerId, roomId, isHost, onLeave]);

  // Handle capture — only 1 active Pokémon allowed, extras go to storage
  const handleCapture = useCallback(async () => {
    setCaptureAttempt(null);
    if (team.length >= 1) {
      // Send to storage in DB instead
      const profile = await getProfile(accountId);
      const existingStored = profile?.stored_pokemon || [];
      await saveProfile(accountId, {
        stored_pokemon: [...existingStored, {
          pokemon_id: captureAttempt.pokemonId,
          level: captureAttempt.level,
          nickname: null,
        }],
      });
    }
    setTeam((t) => [...t, {}]); // trigger refresh
    if (onTeamUpdate) onTeamUpdate();
  }, [onTeamUpdate, accountId, captureAttempt, team.length]);

  const handleCaptureDecline = useCallback(() => {
    setCaptureAttempt(null);
  }, []);

  // Handle stairs: leave safely
  const handleLeaveSafely = useCallback(async () => {
    setShowStairsChoice(false);
    setShowSafeExit(true);
  }, []);

  // Handle stairs: descend to next floor
  const handleDescend = useCallback(async () => {
    setShowStairsChoice(false);
    const nextFloor = floorNum + 1;
    setFloorNum(nextFloor);
    const newSeed = Date.now();
    const gen = generateDungeon(20, 15, newSeed);

    // Heal active Pokémon partially on descend
    setTeam((prev) => {
      return prev.map((p, i) => {
        if (i === activeTeamIndex) {
          const healAmount = Math.floor(p.maxHp * 0.3);
          return { ...p, hp: Math.min(p.maxHp, p.hp + healAmount) };
        }
        return p;
      });
    });

    setDungeon(gen);
    setVisitedTiles(new Set());
    setEnemiesMoved(true);
    stepCountRef.current = 0;

    // Update DB
    await supabase
      .from("dungeon_state")
      .update({
        width: gen.width,
        height: gen.height,
        tiles: gen.tiles,
        enemies: gen.enemies,
        treasures: gen.treasures,
        gold: gen.gold,
      })
      .eq("room_id", roomId);

    // Move player to spawn
    setMyPlayer((p) => ({ ...p, position_x: gen.spawnX, position_y: gen.spawnY }));
    await supabase
      .from("room_players")
      .update({ position_x: gen.spawnX, position_y: gen.spawnY })
      .eq("player_id", playerId)
      .eq("room_id", roomId);

    // Update room floor
    await supabase.from("rooms").update({ floor: nextFloor }).eq("id", roomId);
  }, [floorNum, roomId, playerId, activeTeamIndex]);

  // Confirm safe exit — save to account and leave
  const handleConfirmExit = useCallback(async () => {
    // Save gold + team to account profile
    const profile = await getProfile(accountId);
    const existingGold = profile?.inventory?.gold || 0;
    const existingItems = profile?.inventory?.items || [];
    const existingStored = profile?.stored_pokemon || [];

    // Collect any captured Pokémon beyond the active one into stored
    const activePkm = team[activeTeamIndex];
    const extraPkm = team.filter((p, i) => i !== activeTeamIndex).map((p) => ({
      pokemon_id: p.pokemonId,
      nickname: p.nickname,
      level: p.level,
      moves: p.moves,
    }));

    await saveProfile(accountId, {
      inventory: {
        gold: existingGold + goldCount,
        items: existingItems,
      },
      stored_pokemon: [...existingStored, ...extraPkm],
    });

    // Heal active Pokémon to full
    if (activePkm?.id) {
      await updateTeamMember(activePkm.id, { hp: activePkm.maxHp });
    }

    setShowSafeExit(false);
    if (onLeave) onLeave();

    await supabase
      .from("room_players")
      .delete()
      .eq("player_id", playerId)
      .eq("room_id", roomId);
  }, [accountId, goldCount, team, activeTeamIndex, playerId, roomId, onLeave]);

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-slate-400 py-20">{t("Loading...", language)}</div>
      </div>
    );
  }

  const otherPlayers = players.filter((p) => p.player_id !== playerId);
  const lobbyPlayers = players;

  // LOBBY SCREEN
  if (room.status === "lobby") {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={leaveRoom}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← {t("Back", language)}
          </button>
          <LanguageSelector />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t("Dungeon Crawler", language)}</h1>
          <p className="text-slate-400">{t("dungeon-lobby-waiting", language)}</p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">{t("Room", language)}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{t("Code", language)}:</span>
              <span className="font-mono text-lg font-bold text-yellow-400 tracking-widest">
                {roomCode}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">
              {t("Players", language)}: {lobbyPlayers.length}/{room.max_players}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {lobbyPlayers.map((p) => (
                <div
                  key={p.player_id}
                  className="flex flex-col items-center p-3 rounded-xl border border-slate-700 bg-slate-800/40"
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.sprite_id}.png`}
                    alt=""
                    className="w-14 h-14"
                  />
                  <span className="text-xs text-slate-200 mt-1">{p.player_name}</span>
                  {p.is_host && (
                    <span className="text-[10px] text-yellow-400">👑 Host</span>
                  )}
                </div>
              ))}
              {Array.from({ length: room.max_players - lobbyPlayers.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 text-slate-600"
                >
                  <span className="text-2xl">?</span>
                  <span className="text-[10px] mt-1">{t("Waiting...", language)}</span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button
              onClick={startGame}
              disabled={lobbyPlayers.length < 1}
              className="w-full rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {t("Start Game", language)}
            </button>
          ) : (
            <p className="text-center text-sm text-slate-400">
              {t("Waiting for host to start...", language)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // GAME OVERLAY (battle result)
  if (battleResult) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center py-16 space-y-4">
          <p className="text-4xl">
            {battleResult.result === "won" ? "🎉" : battleResult.result === "lost" ? "💀" : "🏃"}
          </p>
          <h2 className="text-2xl font-bold text-slate-100">
            {battleResult.result === "won"
              ? t("Victory!", language)
              : battleResult.result === "lost"
              ? t("All Pokémon fainted!", language)
              : battleResult.message || t("Got away safely!", language)}
          </h2>
          {battleResult.result === "lost" && (
            <button
              onClick={leaveRoom}
              className="rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
            >
              {t("Back", language)}
            </button>
          )}
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={leaveRoom}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← {t("Leave", language)}
        </button>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {t("Room", language)}: <span className="font-mono text-yellow-400">{roomCode}</span>
          </span>
          <span>
            {t("Players", language)}: {players.filter((p) => p.is_alive).length}/{players.length}
          </span>
        </div>
        <LanguageSelector />
      </div>

      <div className="flex gap-4 items-start">
        {/* Map */}
        <div className="flex-1">
          {dungeon ? (
            <DungeonMap
              dungeon={dungeon}
              playerX={myPlayer?.position_x || 1}
              playerY={myPlayer?.position_y || 1}
              playerSpriteId={myPlayer?.sprite_id || 25}
              otherPlayers={otherPlayers}
              visitedTiles={visitedTiles}
              onMove={handleMove}
              disabled={!!inBattle || !enemiesMoved}
            />
          ) : (
            <div className="text-center text-slate-400 py-10">
              {t("Generating dungeon...", language)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-3 shrink-0">
          {/* Room code */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase">{t("Room", language)}</p>
            <p className="font-mono text-lg font-bold text-yellow-400 tracking-widest">{roomCode}</p>
          </div>

          {/* Player info */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${myPlayer?.sprite_id || 25}.png`}
                alt=""
                className="w-10 h-10"
              />
              <div>
                <p className="text-sm font-semibold text-slate-200">{getSpeciesName(team[activeTeamIndex]?.pokemonId || myPlayer?.sprite_id || 25)}</p>
                <p className="text-[10px] text-slate-400">Lv.{myPlayer?.level || 5}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${Math.max(0, ((myPlayer?.hp || 100) / (myPlayer?.max_hp || 100)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              HP: {myPlayer?.hp || 100}/{myPlayer?.max_hp || 100}
            </p>
          </div>

          {/* Other players */}
          {otherPlayers.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase">{t("Party", language)}</p>
              {otherPlayers.map((p) => (
                <div key={p.player_id} className="flex items-center gap-2">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.sprite_id}.png`}
                    alt=""
                    className="w-8 h-8"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 truncate">{p.player_name}</p>
                    <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.is_alive ? "bg-green-500" : "bg-red-500"}`}
                        style={{
                          width: `${Math.max(0, ((p.hp || 100) / (p.max_hp || 100)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floor & Gold */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{t("Floor", language)}</span>
              <span className="text-slate-200 font-semibold">{floorNum}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">💰 {t("Gold", language)}</span>
              <span className="text-yellow-400 font-semibold">{goldCount}</span>
            </div>
          </div>

          {/* Controls hint */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
            <p className="text-[10px] text-slate-500 text-center">
              {t("dungeon-controls-hint", language)}
            </p>
          </div>
        </div>
      </div>

      {/* Battle overlay */}
      {inBattle && (() => {
        const activePokemon = team[activeTeamIndex];
        const activeType = activePokemon ? getSpeciesType(activePokemon.pokemonId) : "normal";
        const activeMoves = activePokemon ? activePokemon.moves : [];
        const enemyType = getSpeciesType(inBattle.data.pokemonId);
        return (
          <div key={`battle-${activeTeamIndex}-${inBattle.data.pokemonId}`} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
              <DungeonBattle
                enemy={{ ...inBattle.data, types: [enemyType] }}
                playerPokemon={{
                  name: activePokemon?.nickname || (activePokemon ? getSpeciesName(activePokemon.pokemonId) : "Player"),
                  level: myPlayer?.level || 5,
                  hp: activePokemon?.hp || myPlayer?.hp || 100,
                  maxHp: activePokemon?.maxHp || myPlayer?.max_hp || 100,
                  types: [activeType],
                  spriteId: activePokemon?.pokemonId || myPlayer?.sprite_id || 25,
                }}
                playerMoves={activeMoves}
                language={language}
                onEnd={handleBattleEnd}
              />
            </div>
          </div>
        );
      })()}

      {/* Capture overlay */}
      {captureAttempt && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <CaptureScreen
              enemy={captureAttempt}
              playerLevel={myPlayer?.level || 5}
              team={team}
              accountId={accountId}
              onCapture={handleCapture}
              onDecline={handleCaptureDecline}
            />
          </div>
        </div>
      )}

      {/* Stairs choice overlay */}
      {showStairsChoice && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4 text-center">
            <p className="text-3xl">🔽</p>
            <h2 className="text-xl font-bold text-slate-100">{t("dungeon-stairs-title", language)}</h2>
            <p className="text-sm text-slate-400">{t("dungeon-stairs-desc", language)}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDescend}
                className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                {t("dungeon-descend", language)}
              </button>
              <button
                onClick={handleLeaveSafely}
                className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
              >
                {t("dungeon-leave-safely", language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe exit overlay */}
      {showSafeExit && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4 text-center">
            <p className="text-3xl">🏆</p>
            <h2 className="text-xl font-bold text-slate-100">{t("dungeon-exit-title", language)}</h2>
            <div className="text-sm text-slate-300 space-y-2">
              <p>💰 {t("Gold", language)}: <span className="text-yellow-400 font-bold">{goldCount}</span></p>
              <p>{t("dungeon-exit-saved", language)}</p>
            </div>
            <button
              onClick={handleConfirmExit}
              className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              {t("Confirm", language)}
            </button>
          </div>
        </div>
      )}

      {/* Enemies moving indicator */}
      {!enemiesMoved && !inBattle && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-slate-800/90 px-4 py-2 text-xs text-slate-300 border border-slate-700">
          {t("dungeon-enemies-moving", language)}
        </div>
      )}
    </div>
  );
}
