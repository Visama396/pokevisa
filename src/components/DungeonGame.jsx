import { useState, useEffect, useCallback, useRef } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t, getTypeName } from "../stores/translations";
import { supabase } from "../lib/supabase";
import { generateDungeon, isWalkable, moveEnemyToward, getVisibleTiles, TILE } from "../lib/dungeon";
import { getSpeciesName, getRandomMovesForSpecies, getSpeciesType, getSpeciesTypes, getSpeciesSpeed, getMovesAtLevel, getMoveName, calcExpGain, checkLevelUp, getEffectiveness, calcDamage, getStabMultiplier } from "../lib/moves";
import { ensureLoaded, computeStats } from "../lib/pokedex";
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
  const [team, setTeam] = useState(initialTeam);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [allReady, setAllReady] = useState(false);
  const [error, setError] = useState("");
  const [goldCount, setGoldCount] = useState(0);
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

  const activePokemon = team[activeTeamIndex];

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
        spawnX: 1,
        spawnY: 1,
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
    const stats = await computeStats(p.pokemonId, p.level);
    if (p.moves && p.moves.length > 0) {
      return { ...p, ...stats };
    }
    const moves = await getMovesAtLevel(p.pokemonId, p.level);
    return { ...p, ...stats, moves };
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
      .on("presence", { event: "sync" }, () => {})
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
      setMyPlayer((p) => ({ ...p, hp: currentTeam[currentIndex].hp, max_hp: currentTeam[currentIndex].maxHp }));
    }

    if (wiped) {
      setBattleResult({ result: "lost" });
    }

    await supabase
      .from("dungeon_state")
      .update({ enemies: newEnemies })
      .eq("room_id", roomId);

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

  // Handle tile click: move or attack
  const handleTileClick = useCallback(
    async (x, y) => {
      if (!dungeon || !myPlayer || !enemiesMoved || turnLockRef.current) return;

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
        turnLockRef.current = true;
        setEnemiesMoved(false);
        await processAttack(x, y, selectedMove, enemyHere);
        setSelectedMove(null);
        return;
      }

      // If tile is occupied, use last move to attack
      if (enemyHere || playerHere) {
        const move = lastMoveRef.current || team[activeTeamIndex]?.moves?.[0];
        if (move) {
          turnLockRef.current = true;
          setEnemiesMoved(false);
          await processAttack(x, y, move, enemyHere);
        }
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

      setTimeout(() => enemyTurnRef.current(), 300);
    },
    [dungeon, myPlayer, playerId, roomId, enemiesMoved, enemyTurn, selectedMove, team, activeTeamIndex, players]
  );

  // Process an attack on a tile
  async function processAttack(x, y, move, enemyHere) {
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

    } else {
      addLog(`${t("You used", language)} ${move.name}! ${t("No effect!", language)}`, "player");
    }

    setTimeout(() => enemyTurnRef.current(), 300);
  }

  // Handle enemy defeated
  async function handleEnemyDefeated(enemy) {
    const pkm = activePokemon;
    if (pkm) {
      const expGain = calcExpGain(enemy.level);
      const newExp = (pkm.exp || 0) + expGain;
      const leveledUp = checkLevelUp(pkm.level || 5, newExp);
      let newLevel = pkm.level || 5;
      if (leveledUp) {
        newLevel = leveledUp;
      }
      const [newStats, newMoves] = await Promise.all([
        computeStats(pkm.pokemonId, newLevel),
        getMovesAtLevel(pkm.pokemonId, newLevel),
      ]);
      const updatedPkm = { ...pkm, ...newStats, moves: newMoves, exp: newExp, hp: Math.max(pkm.hp, newStats.maxHp) };
      setTeam((prev) => {
        const updated = [...prev];
        updated[activeTeamIndex] = updatedPkm;
        return updated;
      });
      if (pkm.id) {
        await updateTeamMember(pkm.id, { level: newLevel, maxHp: newStats.maxHp, hp: Math.max(pkm.hp, newStats.maxHp), exp: newExp, moves: newMoves });
      }
      if (leveledUp) {
        setMyPlayer((p) => (p ? { ...p, level: newLevel } : p));
      }
    }

    addLog(`${getSpeciesName(enemy.pokemonId)} ${t("Enemy fainted!", language)}`, "player");

    // Capture chance
    const chance = Math.min(0.5, Math.max(0.1, 0.15 + ((activePokemon?.level || 5) - enemy.level) * 0.03));
    if (Math.random() < chance) {
      setTimeout(() => setCaptureAttempt(enemy), 500);
    }
  }

  // Leave room
  const leaveRoom = useCallback(async () => {
    for (const p of team) {
      if (p.hp < p.max_hp && p.id) {
        await updateTeamMember(p.id, { hp: p.max_hp });
      }
    }

    if (onLeave) onLeave();

    await supabase
      .from("room_players")
      .delete()
      .eq("player_id", playerId)
      .eq("room_id", roomId);

    if (isHost) {
      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      if (!count || count === 0) {
        await supabase.from("rooms").delete().eq("id", roomId);
      }
    }
  }, [playerId, roomId, isHost, onLeave, team]);

  // Capture handlers
  const handleCapture = useCallback(async () => {
    setCaptureAttempt(null);
    if (team.length >= 1) {
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
    setTeam((t) => [...t, {}]);
    if (onTeamUpdate) onTeamUpdate();
  }, [onTeamUpdate, accountId, captureAttempt, team.length]);

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
          const healAmount = Math.floor(p.maxHp * 0.3);
          return { ...p, hp: Math.min(p.maxHp, p.hp + healAmount) };
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
        items: existingItems,
      },
      stored_pokemon: [...existingStored, ...extraPkm],
    });

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
              onMove={handleTileClick}
              disabled={!enemiesMoved || turnLockRef.current}
              targeting={selectedMove}
              damagePopups={damagePopups}
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
                <p className="text-[10px] text-slate-400">Lv.{activePokemon?.level || myPlayer?.level || 5}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(0, ((activePokemon?.hp || myPlayer?.hp || 100) / (activePokemon?.maxHp || activePokemon?.max_hp || myPlayer?.max_hp || 100)) * 100)}%`,
                  backgroundColor: ((activePokemon?.hp || 100) / (activePokemon?.maxHp || 100)) > 0.5 ? "#22c55e" : ((activePokemon?.hp || 100) / (activePokemon?.maxHp || 100)) > 0.2 ? "#eab308" : "#ef4444",
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              HP: {activePokemon?.hp || myPlayer?.hp || 100}/{activePokemon?.maxHp || activePokemon?.max_hp || myPlayer?.max_hp || 100}
            </p>

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
      {!enemiesMoved && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-slate-800/90 px-4 py-2 text-xs text-slate-300 border border-slate-700">
          {t("dungeon-enemies-moving", language)}
        </div>
      )}
    </div>
  );
}
