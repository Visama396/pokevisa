import { useState, useEffect, useCallback, useRef } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t, getTypeName } from "../stores/translations";
import { supabase } from "../lib/supabase";
import { generateDungeon, isWalkable, moveEnemyToward, getVisibleTiles, TILE } from "../lib/dungeon";
import { getSpeciesName, getRandomMovesForSpecies, getSpeciesType, getSpeciesTypes, getSpeciesSpeed, getMovesAtLevel, getMoveName, calcExpGain, checkLevelUp, getEffectiveness, calcDamage, getStabMultiplier, getRandomWildPokemon } from "../lib/moves";
import { ensureLoaded, computeStats, pickNature } from "../lib/pokedex";
import { removeTeamMember, updateTeamMember, getTeam, getProfile, saveProfile } from "../lib/auth";
import LanguageSelector from "./LanguageSelector";
import DungeonMap from "./DungeonMap";
import CaptureScreen from "./CaptureScreen";

const LOG_MAX = 30;

export default function DungeonGame({ roomId, roomCode, playerId, isHost, accountId, accountName, team: initialTeam, onTeamUpdate, onLeave }) {
  const [language, setLanguage] = useState(getLanguage());
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [dungeon, setDungeon] = useState(null);
  const [myPlayer, setMyPlayer] = useState(null);
  const [visitedTiles, setVisitedTiles] = useState(() => new Set());
  const [battleResult, setBattleResult] = useState(null);
  const [captureAttempt, setCaptureAttempt] = useState(null);
  // When a level-up unlocks a new move and the Pokémon already knows 4, the
  // player picks which move to forget (or declines). Null when not prompted.
  const [pendingMoveLearn, setPendingMoveLearn] = useState(null);
  const pendingMoveLearnRef = useRef(null);
  const [team, setTeam] = useState(initialTeam);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [allReady, setAllReady] = useState(false);
  const [error, setError] = useState("");
  const [goldCount, setGoldCount] = useState(0);
  const [dungeonItems, setDungeonItems] = useState([]);
  const [enemiesMoved, setEnemiesMoved] = useState(true);
  const [floorNum, setFloorNum] = useState(1);
  const [showStairsChoice, setShowStairsChoice] = useState(false);
  const [showSafeExit, setShowSafeExit] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [damagePopups, setDamagePopups] = useState([]);
  const [pokedexReady, setPokedexReady] = useState(false);
  const [moveData, setMoveData] = useState(null);
  const channelRef = useRef(null);
  const stepCountRef = useRef(0);
  const lastMoveRef = useRef(null);
  const turnLockRef = useRef(false);
  const enemyTurnRef = useRef(async () => {});
  const [turnPlayerId, setTurnPlayerId] = useState(null);
  const turnPlayerIdRef = useRef(null);
  useEffect(() => { turnPlayerIdRef.current = turnPlayerId; }, [turnPlayerId]);
  const actedThisRoundRef = useRef(false);
  const turnIndexRef = useRef(0);
  const advanceTurnRef = useRef(async () => {});
  const teamRef = useRef(initialTeam);
  const activeTeamIndexRef = useRef(0);
  const playersRef = useRef([]);
  const offlineCleanupRef = useRef(null);

  const activePokemon = team[activeTeamIndex];

  // If the original host disconnected, the first remaining player takes over
  // turn coordination so invaders / friends can keep playing a stale room.
  const isTurnHost = isHost || (!!room && players.length > 0 && !players.some((p) => p.player_id === room.host_id));
  const effectiveHostRef = useRef(isTurnHost);
  useEffect(() => { effectiveHostRef.current = isTurnHost; }, [isTurnHost]);

  function addLog(msg, side) {
    setBattleLog((prev) => [...prev, { text: msg, side }].slice(-LOG_MAX));
  }

  function showDamagePopup(x, y, damage) {
    const key = Date.now() + Math.random();
    setDamagePopups((prev) => [...prev, { x, y, damage, key }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.key !== key));
    }, 1200);
  }

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

    const gen = generateDungeon(20, 15, room.dungeon_seed, 1);
    gen.enemies = await enrichEnemies(gen.enemies);

    await supabase.from("rooms").update({ status: "playing" }).eq("id", roomId);

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

    await supabase.from("dungeon_state").insert({
      room_id: roomId,
      width: gen.width,
      height: gen.height,
      tiles: gen.tiles,
      enemies: gen.enemies,
      treasures: gen.treasures,
      gold: gen.gold,
      spawn_x: gen.spawnX,
      spawn_y: gen.spawnY,
    });

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

  const loadDungeonFromDb = useCallback(async () => {
    const { data } = await supabase
      .from("dungeon_state")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    if (data) {
      let enemies = data.enemies || [];
      if (enemies.some(e => e.atk === undefined) && pokedexReady) {
        enemies = await enrichEnemies(enemies);
      }
      setDungeon({
        width: data.width,
        height: data.height,
        tiles: data.tiles,
        enemies,
        treasures: data.treasures || [],
        gold: data.gold || [],
        spawnX: data.spawn_x ?? 1,
        spawnY: data.spawn_y ?? 1,
        rooms: [],
        stairsX: data.width - 3,
        stairsY: data.height - 3,
      });
    }
  }, [roomId]);

  useEffect(() => {
    ensureLoaded().then(() => setPokedexReady(true));
    fetch("/moves.json").then(r => r.json()).then(setMoveData).catch(() => {});
  }, []);

  async function enrichPokemon(p) {
    const pokemonId = p.pokemonId ?? p.pokemon_id;
    if (!pokemonId) return p;
    const nature = (p.nature && p.nature !== '_') ? p.nature : pickNature(p.id || `${pokemonId}-${p.x||0}-${p.y||0}`);
    const currentHp = p.hp;
    const stats = await computeStats(pokemonId, p.level, nature);
    if (p.moves && p.moves.length > 0) {
      return { ...p, ...stats, hp: currentHp, maxHp: stats.maxHp };
    }
    const moves = await getMovesAtLevel(pokemonId, p.level);
    return { ...p, ...stats, hp: currentHp, maxHp: stats.maxHp, moves };
  }

  async function enrichEnemies(enemies) {
    return Promise.all(enemies.map(enrichPokemon));
  }

  // Enrich team from DB (backward compat)
  useEffect(() => {
    if (!pokedexReady || team.length === 0) return;
    if (team.some(p => p.atk === undefined)) {
      Promise.all(team.map(enrichPokemon)).then(enriched => setTeam(enriched));
    }
  }, [pokedexReady]);

  // Generate the dungeon for this room when it first enters "playing".
  // Any player can do this: the host normally creates it, but if the host is
  // gone (stale room), an invader or friend joining by code can take over.
  useEffect(() => {
    if (!room || room.status !== "playing" || dungeon) return;

    if (players.length === 0) return;

    async function ensureDungeon() {
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

        const gen = generateDungeon(20, 15, room.dungeon_seed, 1);
        gen.enemies = await enrichEnemies(gen.enemies);

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
          spawn_x: gen.spawnX,
          spawn_y: gen.spawnY,
        });

        // If two clients race to create the dungeon, the loser's insert fails on
        // the unique room_id constraint — the postgres_changes INSERT handler
        // then loads the winning dungeon.
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
        console.error("ensureDungeon error:", err);
      }
    }
    ensureDungeon();
  }, [room, players, dungeon, roomId, loadDungeonFromDb, myPlayer]);

  // Late joiners (invaders / friends joining by code) can enter with a stale
  // position (e.g. the village spawn or a wall tile). Once the dungeon loads,
  // place them on a free walkable tile near the spawn point.
  useEffect(() => {
    if (!dungeon || !myPlayer) return;
    if (isWalkable(dungeon.tiles, myPlayer.position_x, myPlayer.position_y)) return;

    const occupied = new Set(
      players
        .filter((p) => p.player_id !== playerId)
        .map((p) => `${p.position_x},${p.position_y}`)
    );
    const sx = dungeon.spawnX ?? 1;
    const sy = dungeon.spawnY ?? 1;
    const idx = players.findIndex((p) => p.player_id === playerId);
    let px = sx + (idx % 3);
    let py = sy + Math.floor(idx / 3);

    // Walk outward from the spawn in expanding rings until we find a free tile.
    outer: for (let ring = 0; ring < 8; ring++) {
      for (let dy = -ring; dy <= ring; dy++) {
        for (let dx = -ring; dx <= ring; dx++) {
          if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue;
          const tx = sx + dx;
          const ty = sy + dy;
          if (ty < 0 || tx < 0 || ty >= dungeon.tiles.length || tx >= dungeon.tiles[0].length) continue;
          if (!isWalkable(dungeon.tiles, tx, ty)) continue;
          if (occupied.has(`${tx},${ty}`)) continue;
          px = tx;
          py = ty;
          break outer;
        }
      }
    }

    setMyPlayer((p) => ({ ...p, position_x: px, position_y: py }));
    setPlayers((prev) =>
      prev.map((p) => (p.player_id === playerId ? { ...p, position_x: px, position_y: py } : p))
    );
    supabase
      .from("room_players")
      .update({ position_x: px, position_y: py })
      .eq("player_id", playerId)
      .eq("room_id", roomId);
    channelRef.current?.send({
      type: "broadcast",
      event: "player_move",
      payload: { playerId, x: px, y: py },
    });
  }, [dungeon, myPlayer, playerId, players, roomId]);

  // Start turn system when dungeon first loads on the turn host
  useEffect(() => {
    if (!dungeon || turnPlayerId || !isTurnHost || players.length === 0) return;
    if (!channelRef.current) return;

    turnIndexRef.current = 0;
    actedThisRoundRef.current = false;
    const first = players[0];
    setTurnPlayerId(first.player_id);
    channelRef.current.send({
      type: "broadcast",
      event: "turn_advance",
      payload: { playerId: first.player_id },
    });
  }, [dungeon, isTurnHost, players, turnPlayerId]);

  // If the current turn player disconnects or faints, advance to next
  useEffect(() => {
    if (!isTurnHost || !turnPlayerId || players.length === 0) return;
    const current = players.find((p) => p.player_id === turnPlayerId);
    if (!current || current.is_alive === false) {
      advanceTurnRef.current();
    }
  }, [players, turnPlayerId, isTurnHost]);

  useEffect(() => { teamRef.current = team; }, [team]);
  useEffect(() => { activeTeamIndexRef.current = activeTeamIndex; }, [activeTeamIndex]);
  useEffect(() => { playersRef.current = players; }, [players]);

  // Supabase Realtime channel
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`);

    channel
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
      .on("broadcast", { event: "player_joined" }, () => {
        supabase
          .from("room_players")
          .select("*")
          .eq("room_id", roomId)
          .order("joined_at")
          .then(({ data }) => {
            if (data) {
              setPlayers(data);
              const me = data.find((p) => p.player_id === playerId);
              if (me) setMyPlayer(me);
              // Late joiners (invaders / friends) missed earlier turn_advance
              // broadcasts — resync the current turn so they can act.
              if (effectiveHostRef.current && turnPlayerIdRef.current) {
                channelRef.current?.send({
                  type: "broadcast",
                  event: "turn_advance",
                  payload: { playerId: turnPlayerIdRef.current, resync: true },
                });
              }
            }
          });
      })
      .on("broadcast", { event: "enemy_update" }, ({ payload }) => {
        setDungeon((prev) => prev ? { ...prev, enemies: payload.enemies } : prev);
      })
      .on("broadcast", { event: "player_left" }, ({ payload }) => {
        setPlayers((prev) => prev.filter((p) => p.player_id !== payload.playerId));
      })
      // Presence sync: detect abrupt disconnects (tab close, network drop).
      // Drop offline players from the turn rotation locally and, after a grace
      // period, remove them from room_players so they don't block the next start.
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set(
          Object.values(state).flatMap((p) => p.map((p2) => p2.player_id))
        );
        // Never treat ourselves as offline while connected.
        onlineIds.add(playerId);

        setPlayers((prev) => prev.filter((p) => onlineIds.has(p.player_id)));

        const offline = playersRef.current.filter(
          (p) => p.player_id !== playerId && !onlineIds.has(p.player_id)
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
              .eq("room_id", roomId);
          }, 8000);
        } else if (offlineCleanupRef.current) {
          clearTimeout(offlineCleanupRef.current);
          offlineCleanupRef.current = null;
        }
      })
      .on("broadcast", { event: "pvp_damage" }, async ({ payload }) => {
        if (payload.targetPlayerId !== playerId) return;
        let currentTeam = [...teamRef.current];
        let currentIndex = activeTeamIndexRef.current;
        if (!currentTeam[currentIndex]) return;
        const newHp = Math.max(0, (currentTeam[currentIndex].hp || 100) - payload.damage);
        currentTeam[currentIndex] = { ...currentTeam[currentIndex], hp: newHp };
        let wiped = false;
        if (newHp <= 0) {
          const name = currentTeam[currentIndex]?.nickname || getSpeciesName(currentTeam[currentIndex]?.pokemonId);
          addLog(`${name} ${t("fainted", language)} ${t("from", language)} ${payload.attackerName || t("opponent", language)}!`, "enemy");
          const faintedId = currentTeam[currentIndex]?.id;
          let found = false;
          for (let i = 0; i < currentTeam.length; i++) {
            if (i !== currentIndex && currentTeam[i].hp > 0) { currentIndex = i; found = true; break; }
          }
          // Only remove from DB if there's another alive member to switch to.
          // Keeping the last mon in the DB (with 0 HP) prevents loadAccountData
          // from seeing an empty team and incorrectly resetting the starter
          // profile — same guard as the enemy-wipe path.
          if (found) {
            if (faintedId) await removeTeamMember(faintedId);
          } else {
            wiped = true;
            setBattleResult({ result: "lost" });
          }
        } else {
          addLog(`${payload.attackerName || t("Opponent", language)} ${t("used", language)} ${payload.moveName || "attack"}! ${payload.damage} ${t("dmg", language)}`, "enemy");
        }
        setTeam(currentTeam);
        setActiveTeamIndex(currentIndex);
        if (currentTeam[currentIndex]) {
          setMyPlayer((p) => ({ ...p, hp: currentTeam[currentIndex].hp }));
        }
        if (currentTeam[currentIndex]?.id) await updateTeamMember(currentTeam[currentIndex].id, { hp: currentTeam[currentIndex].hp });
        await supabase.from("room_players")
          .update({ hp: currentTeam[currentIndex]?.hp || 0, is_alive: !wiped })
          .eq("player_id", playerId).eq("room_id", roomId);
        // Tell the turn host we fainted so it skips us in the rotation.
        if (wiped) {
          channelRef.current?.send({ type: "broadcast", event: "player_ko", payload: { playerId } });
        }
      })
      .on("broadcast", { event: "player_ko" }, ({ payload }) => {
        setPlayers((prev) =>
          prev.map((p) => (p.player_id === payload.playerId ? { ...p, is_alive: false } : p))
        );
      })
      .on("broadcast", { event: "player_update" }, ({ payload }) => {
        // Another player changed their active partner (quiz reset / club swap) —
        // refresh their sprite in the party sidebar and on the map.
        setPlayers((prev) =>
          prev.map((p) =>
            p.player_id === payload.playerId
              ? { ...p, sprite_id: payload.sprite_id ?? p.sprite_id }
              : p
          )
        );
      })
      .on("broadcast", { event: "turn_advance" }, ({ payload }) => {
        setTurnPlayerId(payload.playerId);
        // Resyncs (re-broadcast of the current turn to a late joiner) only set
        // the turn — they must not reset lock state, otherwise the acting
        // player could act twice in one round.
        if (payload.resync) return;
        turnLockRef.current = false;
        setEnemiesMoved(true);
        actedThisRoundRef.current = false;
      })
      .on("broadcast", { event: "turn_acted" }, async () => {
        if (!effectiveHostRef.current) return;
        await advanceTurnRef.current();
      })
      .on("broadcast", { event: "enemy_turn_done" }, ({ payload }) => {
        setDungeon((prev) => prev ? { ...prev, enemies: payload.enemies } : prev);
        turnLockRef.current = false;
        setEnemiesMoved(true);
      })
      .on("broadcast", { event: "game_over" }, ({ payload }) => {
        setBattleResult(payload);
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "dungeon_state",
        filter: `room_id=eq.${roomId}`,
      }, () => { loadDungeonFromDb(); })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "player_joined",
            payload: { playerId },
          });
          channel.track({
            player_id: playerId,
            online_at: new Date().toISOString(),
          });
          loadDungeonFromDb();
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

  // Process enemy turn: movement + attacks
  const enemyTurn = useCallback(async () => {
    if (!dungeon || !myPlayer) return;

    const px = myPlayer.position_x;
    const py = myPlayer.position_y;
    const newEnemies = dungeon.enemies.map((e) => ({ ...e }));
    const logEntries = [];
    const occupied = new Set(newEnemies.map((e) => `${e.x},${e.y}`));
    let currentTeam = [...team];
    let currentIndex = activeTeamIndex;
    let wiped = false;

    for (const e of newEnemies) {
      if (wiped) break;
      if (currentTeam[currentIndex]?.hp <= 0) { wiped = true; break; }

      const visible = getVisibleTiles(dungeon.tiles, e.x, e.y, 8);
      if (!visible.has(`${px},${py}`)) continue;

      const isAdjacent = Math.abs(e.x - px) <= 1 && Math.abs(e.y - py) <= 1 && (Math.abs(e.x - px) + Math.abs(e.y - py) > 0);

      if (isAdjacent) {
        const enemyMoves = e.moves || getRandomMovesForSpecies(e.pokemonId, 3);
        const move = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
        const atkStat = move.category === "physical" ? (e.atk || 10 + e.level * 3) : (e.spa || 10 + e.level * 3);
        const defStat = move.category === "physical" ? (currentTeam[currentIndex]?.def || 8 + (currentTeam[currentIndex]?.level || 5) * 2) : (currentTeam[currentIndex]?.spd || 8 + (currentTeam[currentIndex]?.level || 5) * 2);
        const defenderTypes = currentTeam[currentIndex]?.types || getSpeciesTypes(currentTeam[currentIndex]?.pokemonId || 25);
        const eff = getEffectiveness(move.type, defenderTypes);
        const stab = getStabMultiplier(move.type, e.types || getSpeciesTypes(e.pokemonId));
        const dmg = calcDamage(move, atkStat, defStat, eff, e.level, stab);

        showDamagePopup(px, py, dmg);
        logEntries.push({ text: `Wild ${getSpeciesName(e.pokemonId)} used ${getMoveName(move, language, moveData)}! ${dmg} dmg`, side: "enemy" });

        const newHp = Math.max(0, (currentTeam[currentIndex]?.hp || 100) - dmg);
        currentTeam[currentIndex] = { ...currentTeam[currentIndex], hp: newHp };

        if (newHp <= 0) {
          const name = currentTeam[currentIndex]?.nickname || getSpeciesName(currentTeam[currentIndex]?.pokemonId);
          logEntries.push({ text: `${name} fainted!`, side: "enemy" });

          if (currentTeam[currentIndex]?.id) {
            await removeTeamMember(currentTeam[currentIndex].id);
          }

          let found = false;
          for (let i = 0; i < currentTeam.length; i++) {
            if (i !== currentIndex && currentTeam[i].hp > 0) {
              currentIndex = i;
              found = true;
              break;
            }
          }

          if (!found) {
            wiped = true;
            logEntries.push({ text: "All Pokémon fainted!", side: "enemy" });
          }
        }
      } else {
        occupied.delete(`${e.x},${e.y}`);
        const pos = moveEnemyToward(dungeon.tiles, e.x, e.y, px, py, occupied);
        if (pos) {
          e.x = pos.x;
          e.y = pos.y;
          occupied.add(`${pos.x},${pos.y}`);
        } else {
          occupied.add(`${e.x},${e.y}`);
        }
      }
    }

    setTeam(currentTeam);
    setActiveTeamIndex(currentIndex);
    setDungeon((d) => ({ ...d, enemies: newEnemies }));
    setBattleLog((prev) => [...prev, ...logEntries].slice(-LOG_MAX));

    if (currentTeam[currentIndex]) {
      setMyPlayer((p) => ({ ...p, hp: currentTeam[currentIndex].hp, max_hp: currentTeam[currentIndex].maxHp ?? currentTeam[currentIndex].max_hp ?? p.max_hp ?? 1 }));
    }

    if (wiped) {
      setBattleResult({ result: "lost" });
    }

    await supabase
      .from("dungeon_state")
      .update({ enemies: newEnemies })
      .eq("room_id", roomId);

    channelRef.current?.send({
      type: "broadcast",
      event: "enemy_update",
      payload: { enemies: newEnemies },
    });

    if (currentTeam[currentIndex]?.id) {
      await updateTeamMember(currentTeam[currentIndex].id, { hp: currentTeam[currentIndex].hp });
    }
    await supabase
      .from("room_players")
      .update({ hp: currentTeam[currentIndex]?.hp || 0 })
      .eq("player_id", playerId)
      .eq("room_id", roomId);

    setEnemiesMoved(true);
    turnLockRef.current = false;
  }, [dungeon, myPlayer, team, activeTeamIndex, roomId]);

  enemyTurnRef.current = enemyTurn;

  // --- Turn coordination (async functions, not useCallback — called via refs) ---

  async function advanceTurn() {
    if (!isTurnHost || players.length === 0) return;
    turnIndexRef.current += 1;

    if (turnIndexRef.current >= players.length) {
      turnIndexRef.current = 0;
      turnLockRef.current = true;
      setEnemiesMoved(false);
      await doEnemyTurn();
      return;
    }

    // Skip players who fainted (e.g. KO'd by an invader) so the round isn't blocked.
    while (
      turnIndexRef.current < players.length &&
      players[turnIndexRef.current].is_alive === false
    ) {
      turnIndexRef.current += 1;
    }
    if (turnIndexRef.current >= players.length) {
      turnIndexRef.current = 0;
      turnLockRef.current = true;
      setEnemiesMoved(false);
      await doEnemyTurn();
      return;
    }

    const next = players[turnIndexRef.current];
    actedThisRoundRef.current = false;
    setTurnPlayerId(next.player_id);
    channelRef.current?.send({
      type: "broadcast",
      event: "turn_advance",
      payload: { playerId: next.player_id },
    });
  }
  advanceTurnRef.current = advanceTurn;

  // Host moves all enemies toward the nearest player and broadcasts positions
  async function doEnemyTurn() {
    if (!dungeon) return;

    const newEnemies = dungeon.enemies.map((e) => ({ ...e }));
    const occupied = new Set(newEnemies.map((e) => `${e.x},${e.y}`));
    for (const p of players) {
      if (p.is_alive !== false) occupied.add(`${p.position_x},${p.position_y}`);
    }

    // Track which enemies were adjacent to a player before movement.
    // Only these enemies should attack in processEnemyAttacks.
    // Enemies that move to become adjacent will wait for the next enemy turn.
    const adjacentBefore = new Set();
    for (const e of newEnemies) {
      for (const p of players) {
        if (p.is_alive === false) continue;
        if (Math.abs(e.x - p.position_x) <= 1 && Math.abs(e.y - p.position_y) <= 1) {
          adjacentBefore.add(`${e.x},${e.y}`);
        }
      }
    }

    for (const e of newEnemies) {
      let nearest = null;
      let nearestDist = Infinity;
      for (const p of players) {
        if (p.is_alive === false) continue;
        const d = Math.abs(e.x - p.position_x) + Math.abs(e.y - p.position_y);
        if (d < nearestDist) { nearestDist = d; nearest = p; }
      }
      if (!nearest) continue;
      const visible = getVisibleTiles(dungeon.tiles, e.x, e.y, 8);
      if (!visible.has(`${nearest.position_x},${nearest.position_y}`)) continue;

      if (Math.abs(e.x - nearest.position_x) <= 1 && Math.abs(e.y - nearest.position_y) <= 1) continue;

      occupied.delete(`${e.x},${e.y}`);
      const pos = moveEnemyToward(dungeon.tiles, e.x, e.y, nearest.position_x, nearest.position_y, occupied);
      if (pos) { e.x = pos.x; e.y = pos.y; occupied.add(`${pos.x},${pos.y}`); }
      else { occupied.add(`${e.x},${e.y}`); }
    }

    await supabase.from("dungeon_state").update({ enemies: newEnemies }).eq("room_id", roomId);

    channelRef.current?.send({
      type: "broadcast",
      event: "enemy_turn_done",
      payload: { enemies: newEnemies },
    });

    setDungeon((d) => d ? { ...d, enemies: newEnemies } : d);
    setTimeout(() => processEnemyAttacks(newEnemies, adjacentBefore), 150);
  }

  // Per-client: enemies adjacent to the local player attack
  async function processEnemyAttacks(enemies, adjacentBefore) {
    if (!myPlayer || !dungeon) { finishTurn(); return; }

    const px = myPlayer.position_x;
    const py = myPlayer.position_y;
    const logEntries = [];
    let currentTeam = [...team];
    let currentIndex = activeTeamIndex;
    let wiped = false;

    for (const e of enemies) {
      if (wiped) break;
      if (currentTeam[currentIndex]?.hp <= 0) { wiped = true; break; }
      if (Math.abs(e.x - px) > 1 || Math.abs(e.y - py) > 1) continue;
      // Skip enemies that moved into range this turn — they only move, not attack
      if (adjacentBefore && !adjacentBefore.has(`${e.x},${e.y}`)) continue;

      const enemyMoves = e.moves || getRandomMovesForSpecies(e.pokemonId, 3);
      const move = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
      const defStat = move.category === "physical"
        ? (currentTeam[currentIndex]?.def || 8 + (currentTeam[currentIndex]?.level || 5) * 2)
        : (currentTeam[currentIndex]?.spd || 8 + (currentTeam[currentIndex]?.level || 5) * 2);
      const defenderTypes = currentTeam[currentIndex]?.types || getSpeciesTypes(currentTeam[currentIndex]?.pokemonId || 25);
      const eff = getEffectiveness(move.type, defenderTypes);
      const stab = getStabMultiplier(move.type, e.types || getSpeciesTypes(e.pokemonId));
      const dmg = calcDamage(move, e.atk || 10 + e.level * 3, defStat, eff, e.level, stab);

      showDamagePopup(px, py, dmg);
      logEntries.push({ text: `Wild ${getSpeciesName(e.pokemonId)} used ${getMoveName(move, language, moveData)}! ${dmg} dmg`, side: "enemy" });

      const newHp = Math.max(0, (currentTeam[currentIndex]?.hp || 100) - dmg);
      currentTeam[currentIndex] = { ...currentTeam[currentIndex], hp: newHp };

      if (newHp <= 0) {
        const name = currentTeam[currentIndex]?.nickname || getSpeciesName(currentTeam[currentIndex]?.pokemonId);
        logEntries.push({ text: `${name} fainted!`, side: "enemy" });
        const faintedId = currentTeam[currentIndex]?.id;
        let found = false;
        for (let i = 0; i < currentTeam.length; i++) {
          if (i !== currentIndex && currentTeam[i].hp > 0) { currentIndex = i; found = true; break; }
        }
        // Only remove from DB if there's another alive member to switch to.
        // Keeping the last mon in the DB (with 0 HP) prevents loadAccountData
        // from seeing an empty team and incorrectly resetting the starter profile.
        if (found) {
          if (faintedId) await removeTeamMember(faintedId);
        } else {
          wiped = true;
          logEntries.push({ text: "All Pokémon fainted!", side: "enemy" });
        }
      }
    }

    setTeam(currentTeam);
    setActiveTeamIndex(currentIndex);
    setBattleLog((prev) => [...prev, ...logEntries].slice(-LOG_MAX));
    if (currentTeam[currentIndex]) {
      setMyPlayer((p) => ({ ...p, hp: currentTeam[currentIndex].hp, max_hp: currentTeam[currentIndex].maxHp ?? currentTeam[currentIndex].max_hp ?? p.max_hp ?? 1 }));
    }
    if (wiped) { setBattleResult({ result: "lost" }); }
    if (currentTeam[currentIndex]?.id) await updateTeamMember(currentTeam[currentIndex].id, { hp: currentTeam[currentIndex].hp });
    await supabase.from("room_players")
      .update({ hp: currentTeam[currentIndex]?.hp || 0, is_alive: !wiped })
      .eq("player_id", playerId).eq("room_id", roomId);
    // Tell the turn host we fainted so it skips us in the rotation.
    if (wiped) {
      channelRef.current?.send({ type: "broadcast", event: "player_ko", payload: { playerId } });
    }
    finishTurn();
  }

  function finishTurn() {
    setEnemiesMoved(true);
    turnLockRef.current = false;
    if (isTurnHost && players.length > 0) {
      turnIndexRef.current = 0;
      actedThisRoundRef.current = false;
      const firstAlive = players.find((p) => p.is_alive !== false);
      if (!firstAlive) return;
      setTurnPlayerId(firstAlive.player_id);
      channelRef.current?.send({
        type: "broadcast",
        event: "turn_advance",
        payload: { playerId: firstAlive.player_id },
      });
    }
  }

  // Handle tile click: move or attack
  const handleTileClick = useCallback(
    async (x, y) => {
      if (!dungeon || !myPlayer || !enemiesMoved || turnLockRef.current) return;
      if (turnPlayerId !== playerId || actedThisRoundRef.current) return;

      const px = myPlayer.position_x;
      const py = myPlayer.position_y;
      const isAdjacent = Math.abs(x - px) <= 1 && Math.abs(y - py) <= 1 && (x !== px || y !== py);
      if (!isAdjacent) return;

      const isWalkableTile = isWalkable(dungeon.tiles, x, y);
      const enemyHere = dungeon.enemies.find((e) => e.x === x && e.y === y);
      const playerHere = players.find(
        (p) => p.player_id !== playerId && p.position_x === x && p.position_y === y
      );

      if (!isWalkableTile) return;

      // If a move is selected (attack mode)
      if (selectedMove) {
        const dealt = await processAttack(x, y, selectedMove, enemyHere, playerHere);
        setSelectedMove(null);
        // Friendly fire is blocked and doesn't consume the turn.
        if (!dealt) return;
        turnLockRef.current = true;
        setEnemiesMoved(false);
        actedThisRoundRef.current = true;
        channelRef.current?.send({ type: "broadcast", event: "turn_acted", payload: { playerId } });
        if (isTurnHost) advanceTurnRef.current();
        return;
      }

      // If tile is occupied, use last move to attack
      if (enemyHere || playerHere) {
        const move = lastMoveRef.current || team[activeTeamIndex]?.moves?.[0];
        if (move) {
          const dealt = await processAttack(x, y, move, enemyHere, playerHere);
          // Friendly fire is blocked and doesn't consume the turn.
          if (!dealt) return;
        }
        turnLockRef.current = true;
        setEnemiesMoved(false);
        actedThisRoundRef.current = true;
        channelRef.current?.send({ type: "broadcast", event: "turn_acted", payload: { playerId } });
        if (isTurnHost) advanceTurnRef.current();
        return;
      }

      // Move to empty tile
      turnLockRef.current = true;
      setEnemiesMoved(false);

      setMyPlayer((p) => ({ ...p, position_x: x, position_y: y }));
      setPlayers((prev) =>
        prev.map((p) =>
          p.player_id === playerId ? { ...p, position_x: x, position_y: y } : p
        )
      );

      setVisitedTiles((prev) => {
        const next = new Set(prev);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            next.add(`${x + dx},${y + dy}`);
          }
        }
        return next;
      });

      await supabase
        .from("room_players")
        .update({ position_x: x, position_y: y })
        .eq("player_id", playerId)
        .eq("room_id", roomId);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "player_move",
          payload: { playerId, x, y },
        });
      }

      stepCountRef.current += 1;

      // Spawn a new enemy at the stairs every 4 steps (max 5 on floor)
      if (stepCountRef.current % 4 === 0 && dungeon) {
        const currentEnemies = dungeon.enemies.length;
        if (currentEnemies < 5) {
          const sx = dungeon.stairsX;
          const sy = dungeon.stairsY;
          const occupied = new Set(dungeon.enemies.map((e) => `${e.x},${e.y}`));
          if (!occupied.has(`${sx},${sy}`)) {
            const wildLevel = floorNum + 1 + Math.floor(Math.random() * 4);
            const pokemonId = getRandomWildPokemon(wildLevel);
            const spawn = { x: sx, y: sy, pokemonId, level: wildLevel };
            try {
              const nature = pickNature(`${pokemonId}-${Date.now()}`);
              const stats = await computeStats(pokemonId, wildLevel, nature);
              const moves = await getMovesAtLevel(pokemonId, wildLevel);
              // Enemy HP comes from the Pokémon's base stats via computeStats, not a random value.
              const enriched = { ...spawn, ...stats, moves, hp: stats.maxHp, maxHp: stats.maxHp };
              setDungeon((d) => d ? { ...d, enemies: [...d.enemies, enriched] } : d);
              const newEnemies = [...dungeon.enemies, enriched];
              await supabase.from("dungeon_state").update({ enemies: newEnemies }).eq("room_id", roomId);
              channelRef.current?.send({ type: "broadcast", event: "enemies_updated", payload: { enemies: newEnemies } });
            } catch (_) { /* spawn silently fails */ }
          }
        }
      }

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

      const goldItem = dungeon.gold?.find((g) => g.x === x && g.y === y && !g.collected);
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

      const treasure = dungeon.treasures.find((t) => t.x === x && t.y === y && !t.opened);
      if (treasure) {
        setDungeonItems((prev) => [...prev, treasure.item]);
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

      if (dungeon.tiles[y]?.[x] === TILE.STAIRS) {
        if (floorNum >= 100) {
          addLog("You conquered the dungeon!", "player");
          setBattleResult({ result: "won", message: "Dungeon conquered!" });
          setEnemiesMoved(true);
          turnLockRef.current = false;
          return;
        }
        setShowStairsChoice(true);
      }

      actedThisRoundRef.current = true;
      channelRef.current?.send({ type: "broadcast", event: "turn_acted", payload: { playerId } });
      if (isTurnHost) advanceTurnRef.current();
    },
    [dungeon, myPlayer, playerId, roomId, enemiesMoved, enemyTurn, selectedMove, team, activeTeamIndex, players, turnPlayerId, isTurnHost, floorNum]
  );

  // Process an attack on a tile. Returns true if the attack dealt damage
  // (turn consumed), false when it was blocked (friendly fire vs a coop ally).
  async function processAttack(x, y, move, enemyHere, playerHere) {
    lastMoveRef.current = move;

    if (enemyHere) {
      const atkStat = move.category === "physical" ? (activePokemon?.atk || 10 + (activePokemon?.level || 5) * 3) : (activePokemon?.spa || 10 + (activePokemon?.level || 5) * 3);
      const defStat = move.category === "physical" ? (enemyHere.def || 8 + enemyHere.level * 2) : (enemyHere.spd || 8 + enemyHere.level * 2);
      const defenderTypes = enemyHere.types || getSpeciesTypes(enemyHere.pokemonId);
      const eff = getEffectiveness(move.type, defenderTypes);
      const stab = getStabMultiplier(move.type, activePokemon?.types || getSpeciesTypes(activePokemon?.pokemonId || 25));
      const dmg = calcDamage(move, atkStat, defStat, eff, activePokemon?.level || 5, stab);

      let effText = "";
      if (eff > 1) effText = ` ${t("Super effective!", language)}`;
      else if (eff < 1 && eff > 0) effText = ` ${t("Not very effective...", language)}`;
      else if (eff === 0) effText = ` ${t("No effect!", language)}`;

      showDamagePopup(x, y, dmg);
      addLog(`${t("You used", language)} ${getMoveName(move, language, moveData)}! ${dmg} ${t("dmg", language)}${effText}`, "player");

      const newEnemies = dungeon.enemies.map((e) => {
        if (e.x === x && e.y === y) {
          const newHp = e.hp - dmg;
          if (newHp <= 0) {
            handleEnemyDefeated(e);
            return null;
          }
          return { ...e, hp: newHp };
        }
        return e;
      }).filter(Boolean);

      setDungeon((d) => ({ ...d, enemies: newEnemies }));
      await supabase
        .from("dungeon_state")
        .update({ enemies: newEnemies })
        .eq("room_id", roomId);

      channelRef.current?.send({
        type: "broadcast",
        event: "enemy_update",
        payload: { enemies: newEnemies },
      });

      return true;

    } else if (playerHere) {
      // PvP rule: damage is allowed iff at least one of the two combatants is
      // an invader. Hosts and friends who joined by code (coop) can't hurt each
      // other; invaders can hurt everyone and be hurt by everyone.
      const canHurt = myPlayer?.is_invader === true || playerHere.is_invader === true;
      if (!canHurt) {
        addLog(`${t("Can't attack your allies!", language)}`, "player");
        return false;
      }

      const atkStat = move.category === "physical"
        ? (activePokemon?.atk || 10 + (activePokemon?.level || 5) * 3)
        : (activePokemon?.spa || 10 + (activePokemon?.level || 5) * 3);
      const defStat = move.category === "physical"
        ? (playerHere.def || 8 + (playerHere.level || 5) * 2)
        : (playerHere.spd || 8 + (playerHere.level || 5) * 2);
      const defenderTypes = getSpeciesTypes(playerHere.sprite_id || 25);
      const eff = getEffectiveness(move.type, defenderTypes);
      const stab = getStabMultiplier(move.type, activePokemon?.types || getSpeciesTypes(activePokemon?.pokemonId || 25));
      const dmg = calcDamage(move, atkStat, defStat, eff, activePokemon?.level || 5, stab);

      let effText = "";
      if (eff > 1) effText = ` ${t("Super effective!", language)}`;
      else if (eff < 1 && eff > 0) effText = ` ${t("Not very effective...", language)}`;
      else if (eff === 0) effText = ` ${t("No effect!", language)}`;

      showDamagePopup(x, y, dmg);
      addLog(`${t("You used", language)} ${getMoveName(move, language, moveData)}! ${dmg} ${t("dmg", language)} ${t("to", language)} ${playerHere.player_name}${effText}`, "player");

      channelRef.current?.send({
        type: "broadcast",
        event: "pvp_damage",
        payload: { targetPlayerId: playerHere.player_id, attackerPlayerId: playerId, damage: dmg, moveName: move.name, eff, attackerName: myPlayer?.player_name },
      });
      return true;

    } else {
      addLog(`${t("You used", language)} ${move.name}! ${t("No effect!", language)}`, "player");
      return true;
    }
  }

  // Handle enemy defeated: award EXP, level up (persisted via player_team.exp),
  // and offer new moves when the Pokémon already knows 4.
  async function handleEnemyDefeated(enemy) {
    const pkm = activePokemon;
    let needsMoveChoice = false;
    let levelForCapture = 5;
    if (pkm) {
      const expGain = calcExpGain(enemy.level);
      const newExp = (pkm.exp || 0) + expGain;
      let newLevel = pkm.level || 5;
      // checkLevelUp returns a single level; loop to support multi-level-ups.
      let next = checkLevelUp(newLevel, newExp);
      while (next) { newLevel = next; next = checkLevelUp(newLevel, newExp); }
      levelForCapture = newLevel;
      const leveledUp = newLevel > (pkm.level || 5);
      const pokemonId = pkm.pokemonId ?? pkm.pokemon_id;
      const [newStats, movesAtNew] = await Promise.all([
        computeStats(pokemonId, newLevel, pkm.nature),
        getMovesAtLevel(pokemonId, newLevel),
      ]);
      const knownNames = new Set((pkm.moves || []).map((m) => m.name));
      const newMove = movesAtNew.find((m) => !knownNames.has(m.name));
      // Only ask the player when the pool is full and a new move just unlocked.
      // Skip the prompt if one is already waiting (e.g. another kill landed).
      needsMoveChoice = Boolean(newMove) && (pkm.moves || []).length >= 4 && !pendingMoveLearnRef.current;
      const moves = needsMoveChoice
        ? (pkm.moves || [])
        : newMove
          ? [...(pkm.moves || []), newMove].slice(0, 4)
          : (pkm.moves || []);
      const updatedPkm = { ...pkm, ...newStats, level: newLevel, exp: newExp, moves, hp: Math.max(pkm.hp, newStats.maxHp) };
      setTeam((prev) => {
        const updated = [...prev];
        updated[activeTeamIndex] = updatedPkm;
        return updated;
      });
      if (pkm.id) {
        // Persist everything except moves when waiting on the choice, so a
        // stale moves write can't clobber the player's decision.
        const toPersist = { level: newLevel, max_hp: newStats.maxHp, hp: updatedPkm.hp, exp: newExp };
        if (!needsMoveChoice) toPersist.moves = moves;
        await updateTeamMember(pkm.id, toPersist);
      }
      if (leveledUp) {
        setMyPlayer((p) => (p ? { ...p, level: newLevel } : p));
      }
      if (needsMoveChoice) {
        pendingMoveLearnRef.current = { pkm: updatedPkm, newMove, teamIndex: activeTeamIndex, enemy };
        setPendingMoveLearn(pendingMoveLearnRef.current);
      }
    }

    addLog(`${getSpeciesName(enemy.pokemonId)} ${t("Enemy fainted!", language)}`, "player");

    // Capture chance — wait for the move choice so the overlays don't stack.
    if (!needsMoveChoice) {
      maybeTriggerCapture(enemy, levelForCapture);
    }
  }

  // Roll the capture chance after a kill (or after the move-choice resolves).
  function maybeTriggerCapture(enemy, level) {
    const chance = Math.min(0.5, Math.max(0.1, 0.15 + ((level || 5) - enemy.level) * 0.03));
    if (Math.random() < chance) {
      setTimeout(() => setCaptureAttempt(enemy), 500);
    }
  }

  // The player decided: choice = slot index to forget (keep the new move), or
  // null to decline the new move and keep the current set.
  async function handleMoveLearnChoice(choice) {
    const pending = pendingMoveLearnRef.current;
    if (!pending) return;
    const { pkm, newMove, teamIndex, enemy } = pending;
    let finalMoves = pkm.moves || [];
    if (choice !== null) {
      finalMoves = finalMoves.map((m, i) => (i === choice ? newMove : m));
    }
    const updated = { ...pkm, moves: finalMoves };
    setTeam((prev) => {
      const arr = [...prev];
      arr[teamIndex] = updated;
      return arr;
    });
    if (pkm.id) await updateTeamMember(pkm.id, { moves: finalMoves });
    pendingMoveLearnRef.current = null;
    setPendingMoveLearn(null);
    maybeTriggerCapture(enemy, pkm.level || 5);
  }

  // Return to village (does not delete room_players — Dungeon.jsx handles that)
  const returnToVillage = useCallback(async () => {
    for (const p of team) {
      const maxHp = p.maxHp ?? p.max_hp ?? 1;
      if (p.hp < maxHp && p.id) {
        await updateTeamMember(p.id, { hp: maxHp });
      }
    }

    if (onLeave) onLeave();
  }, [onLeave, team]);

  // Capture handlers
  const handleCapture = useCallback(async () => {
    setCaptureAttempt(null);
    const profile = await getProfile(accountId);
    const existingStored = profile?.stored_pokemon || [];
    // Persist the wild Pokémon with the moves it knew, its HP/max HP and nature
    // so it keeps them when the player later makes it active via Club Wigglytuff
    // (a stored entry without moves would be recruited with an empty moveset).
    await saveProfile(accountId, {
      stored_pokemon: [...existingStored, {
        pokemon_id: captureAttempt.pokemonId,
        level: captureAttempt.level,
        nickname: null,
        moves: captureAttempt.moves || [],
        hp: captureAttempt.hp,
        max_hp: captureAttempt.maxHp,
        nature: captureAttempt.nature || null,
      }],
    });
    if (onTeamUpdate) onTeamUpdate();
  }, [onTeamUpdate, accountId, captureAttempt]);

  const handleCaptureDecline = useCallback(() => {
    setCaptureAttempt(null);
  }, []);

  // Stairs handlers
  const handleLeaveSafely = useCallback(async () => {
    setShowStairsChoice(false);
    setShowSafeExit(true);
  }, []);

  const handleDescend = useCallback(async () => {
    setShowStairsChoice(false);
    const nextFloor = floorNum + 1;
    setFloorNum(nextFloor);
    const newSeed = Date.now();
    const gen = generateDungeon(20, 15, newSeed, nextFloor);
    gen.enemies = await enrichEnemies(gen.enemies);

    setTeam((prev) => {
      return prev.map((p, i) => {
        if (i === activeTeamIndex) {
          const maxHp = p.maxHp ?? p.max_hp ?? 1;
          const healAmount = Math.floor(maxHp * 0.3);
          return { ...p, hp: Math.min(maxHp, p.hp + healAmount) };
        }
        return p;
      });
    });

    setDungeon(gen);
    setVisitedTiles(new Set());
    setEnemiesMoved(true);
    setSelectedMove(null);
    setBattleLog([]);
    setDamagePopups([]);
    stepCountRef.current = 0;

    await supabase
      .from("dungeon_state")
      .update({
        width: gen.width,
        height: gen.height,
        tiles: gen.tiles,
        enemies: gen.enemies,
        treasures: gen.treasures,
        gold: gen.gold,
        spawn_x: gen.spawnX,
        spawn_y: gen.spawnY,
      })
      .eq("room_id", roomId);

    setMyPlayer((p) => ({ ...p, position_x: gen.spawnX, position_y: gen.spawnY }));
    await supabase
      .from("room_players")
      .update({ position_x: gen.spawnX, position_y: gen.spawnY })
      .eq("player_id", playerId)
      .eq("room_id", roomId);

    await supabase.from("rooms").update({ floor: nextFloor }).eq("id", roomId);
  }, [floorNum, roomId, playerId, activeTeamIndex]);

  const handleConfirmExit = useCallback(async () => {
    const profile = await getProfile(accountId);
    const existingGold = profile?.inventory?.gold || 0;
    const existingItems = profile?.inventory?.items || [];
    const existingStored = profile?.stored_pokemon || [];

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
        banked_gold: profile?.inventory?.banked_gold || 0,
        items: [...existingItems, ...dungeonItems],
        storage: profile?.inventory?.storage || [],
      },
      stored_pokemon: [...existingStored, ...extraPkm],
    });

    if (activePkm?.id) {
      await updateTeamMember(activePkm.id, { hp: activePkm.maxHp });
    }

    setShowSafeExit(false);
    if (onLeave) onLeave();
  }, [accountId, goldCount, dungeonItems, team, activeTeamIndex, playerId, roomId, onLeave]);

  const leaveRoom = useCallback(async () => {
    // Save gold + items to profile, heal team, return to village
    const profile = await getProfile(accountId);
    const existingGold = profile?.inventory?.gold || 0;
    const existingItems = profile?.inventory?.items || [];
    const existingStored = profile?.stored_pokemon || [];

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
        banked_gold: profile?.inventory?.banked_gold || 0,
        items: [...existingItems, ...dungeonItems],
        storage: profile?.inventory?.storage || [],
      },
      stored_pokemon: [...existingStored, ...extraPkm],
    });

    if (activePkm?.id) {
      await updateTeamMember(activePkm.id, { hp: activePkm.maxHp });
    }

    if (onLeave) onLeave();
  }, [accountId, goldCount, dungeonItems, team, activeTeamIndex, onLeave]);

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
            onClick={returnToVillage}
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

  // GAME OVER OVERLAY
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
              onClick={returnToVillage}
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
              onMove={handleTileClick}
              disabled={!enemiesMoved || turnLockRef.current}
              targeting={selectedMove}
              damagePopups={damagePopups}
              rooms={dungeon.rooms}
            />
          ) : (
            <div className="text-center text-slate-400 py-10">
              {t("Generating dungeon...", language)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-3 shrink-0">
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase">{t("Room", language)}</p>
            <p className="font-mono text-lg font-bold text-yellow-400 tracking-widest">{roomCode}</p>
          </div>

          {/* Player Pokémon card */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${activePokemon?.pokemonId || myPlayer?.sprite_id || 25}.png`}
                alt=""
                className="w-10 h-10"
              />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {activePokemon?.nickname || getSpeciesName(activePokemon?.pokemonId || myPlayer?.sprite_id || 25)}
                </p>
                <p className="text-[10px] text-slate-400">Lv.{activePokemon?.level || myPlayer?.level || 5}{activePokemon?.nature ? ` · ${activePokemon.nature}` : ''}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(0, ((activePokemon?.hp ?? myPlayer?.hp ?? 0) / (activePokemon?.maxHp ?? activePokemon?.max_hp ?? myPlayer?.max_hp ?? 1)) * 100)}%`,
                  backgroundColor: ((activePokemon?.hp ?? myPlayer?.hp ?? 0) / (activePokemon?.maxHp ?? activePokemon?.max_hp ?? myPlayer?.max_hp ?? 1)) > 0.5 ? "#22c55e" : ((activePokemon?.hp ?? myPlayer?.hp ?? 0) / (activePokemon?.maxHp ?? activePokemon?.max_hp ?? myPlayer?.max_hp ?? 1)) > 0.2 ? "#eab308" : "#ef4444",
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              HP: {activePokemon?.hp ?? myPlayer?.hp ?? 0}/{activePokemon?.maxHp ?? activePokemon?.max_hp ?? myPlayer?.max_hp ?? 0}
            </p>

            {/* EXP bar — progress toward the next level */}
            {(() => {
              const exp = activePokemon?.exp || 0;
              const level = activePokemon?.level || myPlayer?.level || 5;
              const threshold = level * 20 + 30;
              const pct = Math.min(100, (exp / threshold) * 100);
              return (
                <div className="space-y-0.5">
                  <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: "#3b82f6" }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 text-center">
                    {t("EXP", language) || "EXP"} {exp}/{threshold}
                  </p>
                </div>
              );
            })()}

            {/* Move buttons */}
            {activePokemon?.moves?.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase">{t("Moves", language) || "Moves"}</p>
                <div className="grid grid-cols-2 gap-1">
                  {activePokemon.moves.map((move) => (
                    <button
                      key={move.name}
                      onClick={() => setSelectedMove(selectedMove?.name === move.name ? null : move)}
                      className={`rounded-lg px-2 py-1.5 text-[11px] font-medium text-left transition-all ${
                        selectedMove?.name === move.name
                          ? "bg-red-700/60 text-red-200 ring-1 ring-red-500"
                          : "bg-slate-700/60 text-slate-200 hover:bg-slate-600/60"
                      }`}
                    >
                      <span className="block truncate">{getMoveName(move, language, moveData)}</span>
                      <span className="block text-[9px] text-slate-400">{move.power}</span>
                    </button>
                  ))}
                </div>
                {selectedMove && (
                  <p className="text-[10px] text-red-400 text-center animate-pulse">
                    {t("Select a tile to attack!", language) || "Select a tile to attack!"}
                  </p>
                )}
              </div>
            )}
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
                    <p className="text-xs text-slate-200 truncate">
                      {p.player_name}
                      {p.is_invader && (
                        <span className="ml-1 text-red-400" title="Invader">⚔️</span>
                      )}
                    </p>
                    <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.is_alive ? "bg-green-500" : "bg-red-500"}`}
                        style={{
                          width: `${Math.max(0, ((p.hp ?? 0) / (p.max_hp ?? 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floor & Gold & Items */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{t("Floor", language)}</span>
              <span className="text-slate-200 font-semibold">{floorNum}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">💰 {t("Gold", language)}</span>
              <span className="text-yellow-400 font-semibold">{goldCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">📦 Items</span>
              <span className="text-blue-400 font-semibold">{dungeonItems.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle log */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 max-h-32 overflow-y-auto">
        {battleLog.length === 0 ? (
          <p className="text-xs text-slate-500 text-center italic">
            {t("Select a move or move to an adjacent tile", language) || "Select a move or move to an adjacent tile"}
          </p>
        ) : (
          <div className="space-y-1">
            {battleLog.map((entry, i) => (
              <p
                key={i}
                className={`text-xs leading-relaxed ${
                  entry.side === "player" ? "text-blue-300" : "text-red-300"
                }`}
              >
                {entry.text}
              </p>
            ))}
          </div>
        )}
      </div>

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

      {/* Move learning overlay — choose which move to forget (or decline) */}
      {pendingMoveLearn && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border border-slate-700 bg-slate-800 p-6 space-y-4 text-center">
            <p className="text-3xl">✨</p>
            <h2 className="text-xl font-bold text-slate-100">Learn a new move?</h2>
            <p className="text-sm text-slate-300">
              <span className="text-yellow-400 font-semibold">{getMoveName(pendingMoveLearn.newMove, language, moveData)}</span>{' '}
              {t("is trying to be learned!", language) || "wants to be learned!"}
            </p>
            <p className="text-xs text-slate-400">
              Your Pokémon already knows 4 moves. Forget one to learn it?
            </p>
            <div className="space-y-1.5">
              {(pendingMoveLearn.pkm.moves || []).map((move, i) => (
                <button
                  key={i}
                  onClick={() => handleMoveLearnChoice(i)}
                  className="w-full flex items-center gap-2 rounded-xl bg-slate-700/60 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600/60 transition-colors"
                >
                  <span className="text-[9px] uppercase text-slate-500">{move.type || "normal"}</span>
                  <span className="truncate">{getMoveName(move, language, moveData)}</span>
                  <span className="ml-auto text-slate-400">{move.power > 0 ? move.power : "—"}</span>
                </button>
              ))}
              <button
                onClick={() => handleMoveLearnChoice(null)}
                className="w-full rounded-xl bg-stone-700 px-4 py-2 text-xs text-stone-400 hover:bg-stone-600 transition-colors"
              >
                Don't learn {getMoveName(pendingMoveLearn.newMove, language, moveData)}
              </button>
            </div>
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
              {dungeonItems.length > 0 && (
                <p>📦 Items collected: <span className="text-blue-400 font-bold">{dungeonItems.length}</span></p>
              )}
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
      {!enemiesMoved && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-slate-800/90 px-4 py-2 text-xs text-slate-300 border border-slate-700">
          {t("dungeon-enemies-moving", language)}
        </div>
      )}
    </div>
  );
}
