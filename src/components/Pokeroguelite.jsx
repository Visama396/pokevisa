import { useState, useEffect, useCallback, useRef } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t, getTypeName, getStatLabel } from "../stores/translations";
import HomeButton from "./HomeButton";
import PokeTypeBadge from "./PokeTypeBadge";
import LanguageSelector from "./LanguageSelector";
import { calcStat } from "../lib/pokedex";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../components/ui/tooltip";
import { BubbleGroup, Bubble, BubbleContent } from "../../components/ui/bubble";

const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};



const STARTERS = {
  bulbasaur: { id: 1, slug: "bulbasaur", name: "Bulbasaur", types: ["grass", "poison"], hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
  charmander: { id: 4, slug: "charmander", name: "Charmander", types: ["fire"], hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
  squirtle: { id: 7, slug: "squirtle", name: "Squirtle", types: ["water"], hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
};

const FLOOR_NAMES = ["Route 1", "Route 2", "Route 3", "Route 4", "Victory Road", "Pokémon League"];

const ITEMS = [
  { id: "protein", name: "Protein", desc: "Permanently raises Attack by 5", stat: "atk", boost: 5 },
  { id: "iron", name: "Iron", desc: "Permanently raises Defense by 5", stat: "def", boost: 5 },
  { id: "calcium", name: "Calcium", desc: "Permanently raises Sp.Atk by 5", stat: "spa", boost: 5 },
  { id: "zinc", name: "Zinc", desc: "Permanently raises Sp.Def by 5", stat: "spd", boost: 5 },
  { id: "carbos", name: "Carbos", desc: "Permanently raises Speed by 5", stat: "spe", boost: 5 },
  { id: "hp-up", name: "HP Up", desc: "Permanently raises Max HP by 10", stat: "hp", boost: 10 },
  { id: "rare-candy", name: "Rare Candy", desc: "Fully restores a Pokémon's HP", stat: "heal", boost: 999 },
  { id: "revive", name: "Revive", desc: "Revives a fainted Pokémon with 50% HP", stat: "revive", boost: 0.5 },
];

const TRAINER_NAMES = [
  "Youngster Joey", "Lass Sarah", "Bug Catcher Don", "Hiker Dan",
  "Fisherman Will", "Picnicker Lily", "Camper Sam", "Schoolkid Max",
];

const GRUNT_TEAMS = [
  { name: "Team Rocket Grunt", dialogue: "Prepare for trouble!", types: ["dark", "poison"] },
  { name: "Team Magma Grunt", dialogue: "Our cause is just!", types: ["ground", "fire"] },
  { name: "Team Aqua Grunt", dialogue: "The sea calls!", types: ["water", "ice"] },
  { name: "Team Galactic Grunt", dialogue: "Embrace the new world!", types: ["psychic", "steel"] },
];

const GYM_LEADERS = [
  { name: "Brock", type: "rock", floor: 0 },
  { name: "Misty", type: "water", floor: 1 },
  { name: "Lt. Surge", type: "electric", floor: 2 },
  { name: "Erika", type: "grass", floor: 3 },
  { name: "Koga", type: "poison", floor: 4 },
  { name: "Giovanni", type: "ground", floor: 5 },
];

const NODE_TYPES = ["encounter", "trainer", "grunt", "item", "move-change", "move-upgrade", "pokemon-center", "poke-trader"];

function isPokemonAvailable(dexEntry, teamLevel) {
  if (dexEntry.legendary || dexEntry.mythical) return false;
  const chart = dexEntry.evolutionChart;
  if (!chart) return true;
  const myEntry = chart.find(m => m.name === dexEntry.slug);
  if (!myEntry || myEntry.stage <= 1) return true;
  const preEntry = chart.find(m => m.stage === myEntry.stage - 1);
  if (preEntry && preEntry.evolvesTo) {
    const myEvo = preEntry.evolvesTo.find(e => e.id === dexEntry.id || e.name === dexEntry.slug);
    if (myEvo) {
      const levelUpConds = (myEvo.conditions || []).filter(c =>
        c.trigger === "level-up" && c.minLevel !== null
      );
      if (levelUpConds.length > 0) {
        return Math.min(...levelUpConds.map(c => c.minLevel)) <= teamLevel;
      }
      return true;
    }
  }
  return true;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let LEVEL_EVOLUTIONS = {};
let CONDITIONAL_EVOLUTIONS = {};

function buildEvolutionData() {
  const levelEvo = {};
  const condEvo = {};
  for (const d of POKEDEX) {
    const chart = d.evolutionChart;
    if (!chart) continue;
    const myEntry = chart.find(m => m.name === d.slug);
    if (!myEntry || !myEntry.evolvesTo) continue;
    const withLevelUp = myEntry.evolvesTo.filter(e =>
      (e.conditions || []).some(c =>
        c.trigger === "level-up" && c.minLevel !== null
      )
    );
    if (withLevelUp.length === 1) {
      const target = getDexEntry(withLevelUp[0].name);
      if (target) {
        const minLevel = Math.min(
          ...(withLevelUp[0].conditions || [])
            .filter(c =>
              c.trigger === "level-up" && c.minLevel !== null
            )
            .map(c => c.minLevel)
        );
        levelEvo[d.slug] = { ...target, minLevel };
      }
    } else if (withLevelUp.length > 1 || myEntry.evolvesTo.length > 0) {
      const targets = myEntry.evolvesTo
        .map(e => getDexEntry(e.name))
        .filter(Boolean);
      if (targets.length > 0) {
        condEvo[d.slug] = targets;
      }
    }
  }
  return { levelEvo, condEvo };
}

function getDexEntry(slug) {
  return POKEDEX.find(d => d.slug === slug);
}

function getMoveName(move, language) {
  if (!move) return "";
  const m = ALL_MOVES[move.key];
  return m?.names?.[language] || m?.names?.en || move.name || move.key;
}

function getPokemonName(pkm, language) {
  if (!pkm) return "";
  const entry = POKEDEX[pkm.id];
  return entry?.names?.[language] || entry?.names?.en || pkm.name || "";
}

function getTeamLevel(team) {
  if (team.length === 0) return 5;
  return Math.max(...team.map(p => p.level || 5));
}

function getRandomPokemon(teamLevel = 5, excludeIds = new Set(), types = null) {
  let pool = POKEDEX.filter(d => isPokemonAvailable(d, teamLevel) && !excludeIds.has(d.id));
  if (pool.length === 0) pool = POKEDEX.filter(d => !d.legendary && !d.mythical && !excludeIds.has(d.id));
  if (pool.length === 0) pool = POKEDEX.filter(d => !excludeIds.has(d.id));
  if (types) {
    const typed = pool.filter(d => d.types.some(t => types.includes(t)));
    if (typed.length > 0) pool = typed;
  }
  if (pool.length === 0) pool = POKEDEX.filter(d => !d.legendary && !d.mythical);
  if (pool.length === 0) pool = POKEDEX;
  const dexEntry = pool[Math.floor(Math.random() * pool.length)];
  return createPokemon(dexEntry, teamLevel);
}

function generateThemedTeam(teamLevel, count, types) {
  const pool = POKEDEX.filter(d => isPokemonAvailable(d, teamLevel) && d.types.some(t => types.includes(t)));
  const shuffled = shuffleArray(pool);
  const team = [];
  for (let i = 0; i < count; i++) {
    team.push(createPokemon(shuffled[i % shuffled.length], teamLevel));
  }
  return team;
}

function generateRandomTeam(teamLevel, count = 1) {
  const pool = POKEDEX.filter(d => isPokemonAvailable(d, teamLevel));
  const shuffled = shuffleArray(pool);
  const team = [];
  for (let i = 0; i < count; i++) {
    team.push(createPokemon(shuffled[i % shuffled.length], teamLevel));
  }
  return team;
}

function getEffectiveness(moveType, defenderTypes) {
  let mult = 1;
  for (const defType of defenderTypes) {
    const chart = TYPE_CHART[moveType];
    if (chart && chart[defType] !== undefined) {
      mult *= chart[defType];
    }
  }
  return mult;
}

function calcDamage(power, atk, def, effectiveness, level = 5) {
  if (power === 0) return 0;
  const base = ((2 * level / 5 + 2) * power * (atk / def)) / 50 + 2;
  const stab = 1.25;
  const random = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor(base * stab * effectiveness * random));
}

let ALL_MOVES = {};
let POKEDEX = [];

function moveDataFromSlug(slug) {
  const m = ALL_MOVES[slug];
  if (!m) return null;
  return {
    key: slug, name: m.names?.en || slug, type: m.type, category: m.category,
    power: m.power || 0, accuracy: m.accuracy || 100,
  };
}

function getLevelUpMove(dexEntry) {
  const levelUp = dexEntry?.moves?.levelUp;
  if (!levelUp || levelUp.length === 0) return null;
  const attacking = levelUp.filter(entry => {
    const m = ALL_MOVES[entry.name];
    return m && m.power && m.power > 0;
  });
  if (attacking.length === 0) return null;
  const entry = attacking[Math.floor(Math.random() * attacking.length)];
  return moveDataFromSlug(entry.name);
}

function getLearnableMove(dexEntry) {
  const pool = [];
  const levelUp = dexEntry?.moves?.levelUp || [];
  const tm = dexEntry?.moves?.tm || [];
  for (const l of levelUp) {
    const md = moveDataFromSlug(l.name);
    if (md && md.power > 0) pool.push(md);
  }
  for (const t of tm) {
    const md = moveDataFromSlug(t);
    if (md && md.power > 0) pool.push(md);
  }
  if (pool.length === 0) {
    const allAttacks = Object.entries(ALL_MOVES).filter(([_, mv]) => mv.power > 0);
    if (allAttacks.length === 0) return null;
    const [key, mv] = allAttacks[Math.floor(Math.random() * allAttacks.length)];
    return { key, name: mv.names?.en || key, type: mv.type, category: mv.category, power: mv.power, accuracy: mv.accuracy || 100 };
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function createPokemon(dexEntry, level = 5) {
  const baseHp = dexEntry.baseStats.find(s => s.name === "hp")?.value || 50;
  const baseAtk = dexEntry.baseStats.find(s => s.name === "attack")?.value || 50;
  const baseDef = dexEntry.baseStats.find(s => s.name === "defense")?.value || 50;
  const baseSpa = dexEntry.baseStats.find(s => s.name === "special-attack")?.value || 50;
  const baseSpd = dexEntry.baseStats.find(s => s.name === "special-defense")?.value || 50;
  const baseSpe = dexEntry.baseStats.find(s => s.name === "speed")?.value || 50;
  const hp = calcStat(baseHp, level, true);
  return {
    id: Math.random().toString(36).slice(2, 8),
    slug: dexEntry.slug,
    name: dexEntry.names?.en || dexEntry.slug,
    types: dexEntry.types,
    level,
    hp, maxHp: hp,
    atk: calcStat(baseAtk, level),
    def: calcStat(baseDef, level),
    spa: calcStat(baseSpa, level),
    spd: calcStat(baseSpd, level),
    spe: calcStat(baseSpe, level),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexEntry.id}.png`,
    moves: [getLevelUpMove(dexEntry)].filter(Boolean),
    fainted: false,
  };
}

function generateMap(floor) {
  const numRows = 8;
  const map = [];
  for (let r = 0; r < numRows; r++) {
    const numNodes = 2 + (Math.random() < 0.4 ? 1 : 0);
    const row = [];
    const available = shuffleArray(NODE_TYPES);
    for (let n = 0; n < numNodes; n++) {
      let type;
      if (floor === 0 && r === 0 && n === 0) {
        type = "encounter";
      } else {
        type = available[n % available.length];
      }
      row.push({ type, id: `n${r}_${n}` });
    }
    map.push(row);
  }
  map.push([{ type: "boss", id: `boss_${floor}`, isBoss: true }]);
  return map;
}

function initBattle(prev, enemyTeam, isBoss = false) {
  const playerTeam = prev.team
    .filter(p => !p.fainted)
    .map(p => ({ ...p, hp: p.hp }));
  if (playerTeam.length === 0) return prev;
  const eTeam = enemyTeam.map(p => ({ ...p, hp: p.maxHp }));
  return {
    ...prev,
    screen: "battle",
    battlePlayerTeam: playerTeam,
    battleEnemyTeam: eTeam,
    battleActivePlayer: 0,
    battleActiveEnemy: 0,
    battleLog: [{ text: `A wild battle begins!`, side: "enemy" }],
    battleFinished: false,
    battleResult: null,
    battleTurn: 1,
    battleSpeed: 1000,
    isBossBattle: isBoss,
  };
}

function executeAttack(attacker, defender, log, side, language) {
  const validMoves = attacker.moves.filter(m => m.power && m.power > 0);
  if (validMoves.length === 0) {
    log.push({ text: `${getPokemonName(attacker, language)} ${t("has no moves!", language)}`, side });
    return;
  }
  const move = validMoves[Math.floor(Math.random() * validMoves.length)];
  const atkStat = move.category === "physical" ? attacker.atk : attacker.spa;
  const defStat = move.category === "physical" ? defender.def : defender.spd;
  const effectiveness = getEffectiveness(move.type, defender.types);
  const dmg = calcDamage(move.power, atkStat, defStat, effectiveness, attacker.level || 5);
  defender.hp = Math.max(0, defender.hp - dmg);

  let effText = "";
  if (effectiveness > 1) effText = ` ${t("Super effective!", language)}`;
  else if (effectiveness < 1 && effectiveness > 0) effText = ` ${t("Not very effective...", language)}`;
  else if (effectiveness === 0) effText = ` ${t("No effect!", language)}`;

  const moveName = getMoveName(move, language);
  log.push({ text: `${getPokemonName(attacker, language)} ${t("used", language)} ${moveName}! ${dmg} ${t("dmg", language)}${effText}`, side });
}

function findNextPokemon(team, currentIdx) {
  for (let i = currentIdx + 1; i < team.length; i++) {
    if (team[i].hp > 0) return i;
  }
  for (let i = 0; i < currentIdx; i++) {
    if (team[i].hp > 0) return i;
  }
  return null;
}

const INITIAL_STATE = {
  screen: "title",
  floor: 0,
  team: [],
  map: [],
  mapRow: 0,
  mapNodeIndex: -1,
  playerName: "Red",

  battlePlayerTeam: [],
  battleEnemyTeam: [],
  battleActivePlayer: 0,
  battleActiveEnemy: 0,
  battleLog: [],
  battleFinished: false,
  battleResult: null,
  battleTurn: 1,
  battleSpeed: 800,
  isBossBattle: false,

  encounterChoices: [],
  currentItem: null,
  currentItemPokemonIndex: -1,
  moveChangePokemonIndex: -1,
  moveChangeMoveIndex: -1,
  moveChangeNewMove: null,
  moveUpgradePokemonIndex: -1,
  moveUpgradeMoveIndex: -1,
  moveUpgradeNewPower: 0,
  tradePokemonIndex: -1,
  tradeNewPokemon: null,
  battleRewardChoice: null,

  rewardOptions: [],
  discardCandidate: null,
  pendingEvolutions: [],
  evolutionChoicePokemonIndex: -1,
  evolutionChoiceOptions: [],
  pendingEvolutionAdvance: null,
};

export default function Pokeroguelite() {
  const [language, setLanguage] = useState("en");
  const [state, setState] = useState(() => ({ ...INITIAL_STATE }));
  const [dataLoaded, setDataLoaded] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    setLanguage(getLanguage());
    return subscribe(setLanguage);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/moves.json").then(r => r.json()),
      fetch("/pokedex.json").then(r => r.json()),
    ]).then(([moves, dex]) => {
      ALL_MOVES = moves;
      POKEDEX = dex;
      const { levelEvo, condEvo } = buildEvolutionData();
      LEVEL_EVOLUTIONS = levelEvo;
      CONDITIONAL_EVOLUTIONS = condEvo;
      setDataLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [state.battleLog]);

  const update = useCallback((fn) => {
    setState(prev => {
      const next = typeof fn === "function" ? fn(prev) : { ...prev, ...fn };
      return next;
    });
  }, []);

  useEffect(() => {
    if (state.screen !== "battle" || state.battleFinished || !dataLoaded) return;
    const timer = setTimeout(() => {
      setState(prev => {
        if (prev.screen !== "battle" || prev.battleFinished) return prev;
        return simulateBattleTurn(prev, language);
      });
    }, state.battleSpeed);
    return () => clearTimeout(timer);
  }, [state.screen, state.battleFinished, state.battleTurn, dataLoaded, state.battleSpeed, language]);

  function simulateBattleTurn(prev, language) {
    const pTeam = prev.battlePlayerTeam.map(p => ({ ...p }));
    const eTeam = prev.battleEnemyTeam.map(e => ({ ...e }));
    let pIdx = prev.battleActivePlayer;
    let eIdx = prev.battleActiveEnemy;
    const log = [...prev.battleLog];

    const playerPkm = pTeam[pIdx];
    const enemyPkm = eTeam[eIdx];

    if (!playerPkm || !enemyPkm || playerPkm.hp <= 0 || enemyPkm.hp <= 0) {
      return prev;
    }

    const turnNum = prev.battleTurn;
    log.push({ text: `--- ${t("Turn", language)} ${turnNum} ---`, side: null });

    const playerFirst = playerPkm.spe >= enemyPkm.spe;

    if (playerFirst) {
      executeAttack(playerPkm, enemyPkm, log, "player", language);
      if (enemyPkm.hp <= 0) {
        log.push({ text: `${getPokemonName(enemyPkm, language)} ${t("fainted!", language)}`, side: "player" });
        const nextE = findNextPokemon(eTeam, eIdx);
        if (nextE !== null) {
          eIdx = nextE;
          log.push({ text: `${getPokemonName(eTeam[eIdx], language)} ${t("enters!", language)}`, side: "enemy" });
        } else {
          return {
            ...prev,
            battlePlayerTeam: pTeam,
            battleEnemyTeam: eTeam,
            battleActivePlayer: pIdx,
            battleActiveEnemy: eIdx,
            battleLog: log,
            battleFinished: true,
            battleResult: "win",
            battleTurn: turnNum + 1,
          };
        }
      } else {
        executeAttack(enemyPkm, playerPkm, log, "enemy", language);
        if (playerPkm.hp <= 0) {
          log.push({ text: `${getPokemonName(playerPkm, language)} ${t("fainted!", language)}`, side: "enemy" });
          playerPkm.fainted = true;
          const nextP = findNextPokemon(pTeam, pIdx);
          if (nextP !== null) {
            pIdx = nextP;
            log.push({ text: `${getPokemonName(pTeam[pIdx], language)} ${t("enters!", language)}`, side: "player" });
          } else {
            return {
              ...prev,
              battlePlayerTeam: pTeam,
              battleEnemyTeam: eTeam,
              battleActivePlayer: pIdx,
              battleActiveEnemy: eIdx,
              battleLog: log,
              battleFinished: true,
              battleResult: "lose",
              battleTurn: turnNum + 1,
            };
          }
        }
      }
    } else {
      executeAttack(enemyPkm, playerPkm, log, "enemy", language);
      if (playerPkm.hp <= 0) {
        log.push({ text: `${getPokemonName(playerPkm, language)} ${t("fainted!", language)}`, side: "enemy" });
        playerPkm.fainted = true;
        const nextP = findNextPokemon(pTeam, pIdx);
        if (nextP !== null) {
          pIdx = nextP;
          log.push({ text: `${getPokemonName(pTeam[pIdx], language)} ${t("enters!", language)}`, side: "player" });
        } else {
          return {
            ...prev,
            battlePlayerTeam: pTeam,
            battleEnemyTeam: eTeam,
            battleActivePlayer: pIdx,
            battleActiveEnemy: eIdx,
            battleLog: log,
            battleFinished: true,
            battleResult: "lose",
            battleTurn: turnNum + 1,
          };
        }
      } else {
        executeAttack(playerPkm, enemyPkm, log, "player", language);
        if (enemyPkm.hp <= 0) {
          log.push({ text: `${getPokemonName(enemyPkm, language)} ${t("fainted!", language)}`, side: "player" });
          const nextE = findNextPokemon(eTeam, eIdx);
          if (nextE !== null) {
            eIdx = nextE;
            log.push({ text: `${getPokemonName(eTeam[eIdx], language)} ${t("enters!", language)}`, side: "enemy" });
          } else {
            return {
              ...prev,
              battlePlayerTeam: pTeam,
              battleEnemyTeam: eTeam,
              battleActivePlayer: pIdx,
              battleActiveEnemy: eIdx,
              battleLog: log,
              battleFinished: true,
              battleResult: "win",
              battleTurn: turnNum + 1,
            };
          }
        }
      }
    }

    return {
      ...prev,
      battlePlayerTeam: pTeam,
      battleEnemyTeam: eTeam,
      battleActivePlayer: pIdx,
      battleActiveEnemy: eIdx,
      battleLog: log,
      battleTurn: turnNum + 1,
    };
  }

  function startGame(starterKey) {
    const starter = STARTERS[starterKey];
    const dexEntry = POKEDEX.find(d => d.slug === starterKey);
    const level = 5;
    const hp = calcStat(starter.hp, level, true);
    const pkm = {
      id: Math.random().toString(36).slice(2, 8),
      slug: starter.slug,
      name: starter.name,
      types: starter.types,
      level,
      hp, maxHp: hp,
      atk: calcStat(starter.atk, level),
      def: calcStat(starter.def, level),
      spa: calcStat(starter.spa, level),
      spd: calcStat(starter.spd, level),
      spe: calcStat(starter.spe, level),
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(dexEntry || POKEDEX.find(d => d.id === starter.id))?.id || starter.id}.png`,
      moves: [getLevelUpMove(dexEntry || POKEDEX.find(d => d.id === starter.id))].filter(Boolean),
      fainted: false,
    };
    const map = generateMap(0);
    update({
      screen: "map",
      floor: 0,
      team: [pkm],
      map, mapRow: 0, mapNodeIndex: -1,
      ...INITIAL_STATE,
      screen: "map", floor: 0, team: [pkm], map, mapRow: 0,
    });
  }

  function selectNode(rowIndex, nodeIndex) {
    const node = state.map[rowIndex]?.[nodeIndex];
    if (!node) return;

    update((prev) => {
      const teamLevel = getTeamLevel(prev.team);
      switch (node.type) {
        case "encounter": {
          const choices = [];
          const used = new Set();
          for (let i = 0; i < 3; i++) {
            let pkm;
            let tries = 0;
            do {
              pkm = getRandomPokemon(teamLevel, used);
              tries++;
            } while (tries < 20 && choices.some(c => c.slug === pkm.slug));
            used.add(pkm.slug);
            choices.push(pkm);
          }
          return { ...prev, screen: "encounter", encounterChoices: choices, mapRow: rowIndex, mapNodeIndex: nodeIndex };
        }
        case "trainer": {
          const name = TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)];
          const count = prev.floor >= 2 && Math.random() < 0.4 ? 2 : 1;
          const enemyTeam = generateRandomTeam(teamLevel, count);
          return initBattle({ ...prev, trainerName: name, isBossBattle: false }, enemyTeam, false);
        }
        case "grunt": {
          const grunt = GRUNT_TEAMS[Math.floor(Math.random() * GRUNT_TEAMS.length)];
          const count = prev.floor >= 3 && Math.random() < 0.4 ? 2 : 1;
          const enemyTeam = generateThemedTeam(teamLevel, count, grunt.types);
          return initBattle({ ...prev, trainerName: grunt.name, dialogue: grunt.dialogue, isBossBattle: false }, enemyTeam, false);
        }
        case "item": {
          const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
          return { ...prev, screen: "item", currentItem: item, currentItemPokemonIndex: -1, mapRow: rowIndex, mapNodeIndex: nodeIndex };
        }
        case "move-change": {
          return { ...prev, screen: "move-change", moveChangePokemonIndex: -1, moveChangeMoveIndex: -1, moveChangeNewMove: null, mapRow: rowIndex, mapNodeIndex: nodeIndex };
        }
        case "move-upgrade": {
          return { ...prev, screen: "move-upgrade", moveUpgradePokemonIndex: -1, moveUpgradeMoveIndex: -1, moveUpgradeNewPower: 0, mapRow: rowIndex, mapNodeIndex: nodeIndex };
        }
        case "pokemon-center": {
          const healedTeam = prev.team.map(p => ({ ...p, hp: p.maxHp, fainted: false }));
          return { ...prev, screen: "pokemon-center", team: healedTeam, mapRow: rowIndex, mapNodeIndex: nodeIndex };
        }
        case "poke-trader": {
          return { ...prev, screen: "poke-trader", tradeNewPokemon: null, tradePokemonIndex: -1, mapRow: rowIndex, mapNodeIndex: nodeIndex };
        }
        case "boss": {
          const gymLeader = GYM_LEADERS[prev.floor] || GYM_LEADERS[0];
          const bossTeam = generateThemedTeam(teamLevel, 2 + Math.min(prev.floor, 2), [gymLeader.type]);
          return initBattle({ ...prev, trainerName: gymLeader.name, isBossBattle: true }, bossTeam, true);
        }
        default:
          return prev;
      }
    });
  }

  function selectEncounterPokemon(index) {
    const chosen = state.encounterChoices[index];
    if (!chosen) return;
    if (state.team.length >= 6) {
      update((prev) => ({
        ...prev,
        discardCandidate: { ...chosen },
        screen: "discard-pokemon",
      }));
      return;
    }
    update((prev) => {
      let newTeam = [...prev.team, { ...chosen }];
      const addedIndex = newTeam.length - 1;
      const condOptions = CONDITIONAL_EVOLUTIONS[chosen.slug];
      if (condOptions && condOptions.length > 0 && !newTeam.some((p, i) => i !== addedIndex && hasPendingLevelEvolution(p))) {
        return {
          ...prev,
          team: newTeam,
          evolutionChoicePokemonIndex: addedIndex,
          evolutionChoiceOptions: condOptions.map(d => ({
            slug: d.slug,
            name: d.names?.en || d.slug,
            sprite: d.sprite,
            types: d.types,
          })),
          screen: "evolution-choice",
        };
      }
      return advanceRow(prev, { team: newTeam });
    });
  }

  function skipEncounter() {
    update((prev) => advanceRow(prev));
  }

  function discardPokemon(index) {
    update((prev) => {
      const chosen = prev.discardCandidate;
      if (!chosen) return advanceRow(prev);
      const newTeam = prev.team.filter((_, i) => i !== index);
      newTeam.push({ ...chosen });
      const addedIndex = newTeam.length - 1;
      const condOptions = CONDITIONAL_EVOLUTIONS[chosen.slug];
      if (condOptions && condOptions.length > 0 && !newTeam.some((p, i) => i !== addedIndex && hasPendingLevelEvolution(p))) {
        return {
          ...prev,
          team: newTeam,
          discardCandidate: null,
          evolutionChoicePokemonIndex: addedIndex,
          evolutionChoiceOptions: condOptions.map(d => ({
            slug: d.slug,
            name: d.names?.en || d.slug,
            sprite: d.sprite,
            types: d.types,
          })),
          screen: "evolution-choice",
        };
      }
      const next = advanceRow(prev, { team: newTeam });
      return { ...next, discardCandidate: null };
    });
  }

  function applyItem(pokemonIndex) {
    update((prev) => {
      const item = prev.currentItem;
      if (!item || pokemonIndex < 0 || pokemonIndex >= prev.team.length) return prev;
      const newTeam = prev.team.map((p, i) => {
        if (i !== pokemonIndex) return p;
        const updated = { ...p };
        if (item.stat === "heal") {
          updated.hp = updated.maxHp;
        } else if (item.stat === "revive") {
          if (!p.fainted) return p;
          updated.fainted = false;
          updated.hp = Math.floor(updated.maxHp * item.boost);
        } else if (item.stat === "hp") {
          updated.maxHp += item.boost;
          updated.hp += item.boost;
        } else {
          updated[item.stat] += item.boost;
        }
        return updated;
      });
      return advanceRow(prev, { team: newTeam });
    });
  }

  function selectMoveChangePokemon(pokemonIndex) {
    update((prev) => {
      const pkm = prev.team[pokemonIndex];
      if (!pkm) return prev;
      return { ...prev, moveChangePokemonIndex: pokemonIndex };
    });
  }

  function selectMoveChangeMove(moveIndex) {
    update((prev) => {
      const pkm = prev.team[prev.moveChangePokemonIndex];
      if (!pkm || moveIndex < 0 || moveIndex >= pkm.moves.length) return prev;
      const dexEntry = POKEDEX.find(d => d.slug === pkm.slug);
      const newMove = getLearnableMove(dexEntry);
      if (!newMove) return prev;
      const newTeam = prev.team.map((p, i) => {
        if (i !== prev.moveChangePokemonIndex) return p;
        const newMoves = p.moves.map((m, j) => j === moveIndex ? newMove : m);
        return { ...p, moves: newMoves };
      });
      return advanceRow(prev, { team: newTeam });
    });
  }

  function selectMoveUpgradePokemon(pokemonIndex) {
    update((prev) => {
      const pkm = prev.team[pokemonIndex];
      if (!pkm) return prev;
      return { ...prev, moveUpgradePokemonIndex: pokemonIndex };
    });
  }

  function selectMoveUpgradeMove(moveIndex) {
    update((prev) => {
      const pkm = prev.team[prev.moveUpgradePokemonIndex];
      if (!pkm || moveIndex < 0 || moveIndex >= pkm.moves.length) return prev;
      const newTeam = prev.team.map((p, i) => {
        if (i !== prev.moveUpgradePokemonIndex) return p;
        const newMoves = p.moves.map((m, j) => {
          if (j !== moveIndex) return m;
          return { ...m, power: Math.floor((m.power || 10) * 1.4) };
        });
        return { ...p, moves: newMoves };
      });
      return advanceRow(prev, { team: newTeam });
    });
  }

  function doTrade(pokemonIndex) {
    update((prev) => {
      if (prev.tradeNewPokemon === null) {
        const randomPkm = getRandomPokemon(getTeamLevel(prev.team));
        if (pokemonIndex < 0 || pokemonIndex >= prev.team.length) return prev;
        const newPokemon = { ...randomPkm, id: Math.random().toString(36).slice(2, 8) };
        const newTeam = prev.team.map((p, i) => i === pokemonIndex ? newPokemon : p);
        const condOptions = CONDITIONAL_EVOLUTIONS[newPokemon.slug];
        if (condOptions && condOptions.length > 0 && !newTeam.some((p, i) => i !== pokemonIndex && hasPendingLevelEvolution(p))) {
          return {
            ...prev,
            team: newTeam,
            evolutionChoicePokemonIndex: pokemonIndex,
            evolutionChoiceOptions: condOptions.map(d => ({
              slug: d.slug,
              name: d.names?.en || d.slug,
              sprite: d.sprite,
              types: d.types,
            })),
            screen: "evolution-choice",
          };
        }
        return advanceRow(prev, { team: newTeam });
      }
      return prev;
    });
  }

  function skipTrade() {
    update((prev) => advanceRow(prev));
  }

  function moveTeamMember(fromIndex, toIndex) {
    update((prev) => {
      const newTeam = [...prev.team];
      const [moved] = newTeam.splice(fromIndex, 1);
      newTeam.splice(toIndex, 0, moved);
      return { ...prev, team: newTeam };
    });
  }

  function selectEvolution(optionSlug) {
    update((prev) => {
      const idx = prev.evolutionChoicePokemonIndex;
      if (idx < 0 || idx >= prev.team.length) return prev;
      const newDex = getDexEntry(optionSlug);
      if (!newDex) return prev;
      const pkm = prev.team[idx];
      const newPkm = evolveToPokemon(pkm, newDex, pkm.level || 5);
      const newTeam = prev.team.map((p, i) => i === idx ? newPkm : p);

      const remainingTriggers = findConditionalEvolutionTriggers(newTeam, new Set([idx]));
      if (remainingTriggers.length > 0) {
        return {
          ...prev,
          team: newTeam,
          evolutionChoicePokemonIndex: remainingTriggers[0].index,
          evolutionChoiceOptions: remainingTriggers[0].options.map(d => ({
            slug: d.slug,
            name: d.names?.en || d.slug,
            sprite: d.sprite,
            types: d.types,
          })),
        };
      }

      if (prev.pendingEvolutionAdvance) {
        return advanceRow({ ...prev, team: newTeam }, prev.pendingEvolutionAdvance);
      }
      return { ...prev, team: newTeam, screen: "map", evolutionChoicePokemonIndex: -1, evolutionChoiceOptions: [], pendingEvolutionAdvance: null };
    });
  }

  function dismissEvolution() {
    update((prev) => {
      const remainingTriggers = findConditionalEvolutionTriggers(prev.team, new Set([prev.evolutionChoicePokemonIndex]));
      if (remainingTriggers.length > 0) {
        return {
          ...prev,
          evolutionChoicePokemonIndex: remainingTriggers[0].index,
          evolutionChoiceOptions: remainingTriggers[0].options.map(d => ({
            slug: d.slug,
            name: d.names?.en || d.slug,
            sprite: d.sprite,
            types: d.types,
          })),
        };
      }
      if (prev.pendingEvolutionAdvance) {
        return advanceRow(prev, prev.pendingEvolutionAdvance);
      }
      return { ...prev, screen: "map", evolutionChoicePokemonIndex: -1, evolutionChoiceOptions: [], pendingEvolutionAdvance: null };
    });
  }

  function levelUpPokemon(pkm) {
    const newLevel = (pkm.level || 5) + 1;
    const dexEntry = getDexEntry(pkm.slug);
    if (!dexEntry) return { pkm: { ...pkm, level: newLevel }, evolved: false, evolutions: [] };
    const baseHp = dexEntry.baseStats.find(s => s.name === "hp")?.value;
    const baseAtk = dexEntry.baseStats.find(s => s.name === "attack")?.value;
    const baseDef = dexEntry.baseStats.find(s => s.name === "defense")?.value;
    const baseSpa = dexEntry.baseStats.find(s => s.name === "special-attack")?.value;
    const baseSpd = dexEntry.baseStats.find(s => s.name === "special-defense")?.value;
    const baseSpe = dexEntry.baseStats.find(s => s.name === "speed")?.value;
    const newMaxHp = calcStat(baseHp, newLevel, true);
    const hpGain = newMaxHp - pkm.maxHp;
    const leveled = {
      ...pkm,
      level: newLevel,
      maxHp: newMaxHp,
      hp: Math.min(newMaxHp, Math.max(0, pkm.hp) + Math.max(0, hpGain)),
      atk: calcStat(baseAtk, newLevel),
      def: calcStat(baseDef, newLevel),
      spa: calcStat(baseSpa, newLevel),
      spd: calcStat(baseSpd, newLevel),
      spe: calcStat(baseSpe, newLevel),
    };
    const evoEntry = LEVEL_EVOLUTIONS[leveled.slug];
    if (evoEntry) {
      const minLevel = evoEntry.minLevel || 22;
      if (newLevel >= minLevel) {
        const newDex = evoEntry;
        const eBaseHp = newDex.baseStats.find(s => s.name === "hp")?.value;
        const eBaseAtk = newDex.baseStats.find(s => s.name === "attack")?.value;
        const eBaseDef = newDex.baseStats.find(s => s.name === "defense")?.value;
        const eBaseSpa = newDex.baseStats.find(s => s.name === "special-attack")?.value;
        const eBaseSpd = newDex.baseStats.find(s => s.name === "special-defense")?.value;
        const eBaseSpe = newDex.baseStats.find(s => s.name === "speed")?.value;
        const eMaxHp = calcStat(eBaseHp, newLevel, true);
        return {
          pkm: {
            ...leveled,
            slug: newDex.slug,
            name: newDex.names?.en || newDex.slug,
            types: newDex.types,
            sprite: newDex.sprite,
            maxHp: eMaxHp,
            hp: eMaxHp,
            atk: calcStat(eBaseAtk, newLevel),
            def: calcStat(eBaseDef, newLevel),
            spa: calcStat(eBaseSpa, newLevel),
            spd: calcStat(eBaseSpd, newLevel),
            spe: calcStat(eBaseSpe, newLevel),
          },
          evolved: true,
        };
      }
    }
    return { pkm: leveled, evolved: false };
  }

  function evolveToPokemon(pkm, newDex, newLevel) {
    const eBaseHp = newDex.baseStats.find(s => s.name === "hp")?.value;
    const eBaseAtk = newDex.baseStats.find(s => s.name === "attack")?.value;
    const eBaseDef = newDex.baseStats.find(s => s.name === "defense")?.value;
    const eBaseSpa = newDex.baseStats.find(s => s.name === "special-attack")?.value;
    const eBaseSpd = newDex.baseStats.find(s => s.name === "special-defense")?.value;
    const eBaseSpe = newDex.baseStats.find(s => s.name === "speed")?.value;
    const eMaxHp = calcStat(eBaseHp, newLevel, true);
    return {
      ...pkm,
      slug: newDex.slug,
      name: newDex.names?.en || newDex.slug,
      types: newDex.types,
      sprite: newDex.sprite,
      maxHp: eMaxHp,
      hp: eMaxHp,
      atk: calcStat(eBaseAtk, newLevel),
      def: calcStat(eBaseDef, newLevel),
      spa: calcStat(eBaseSpa, newLevel),
      spd: calcStat(eBaseSpd, newLevel),
      spe: calcStat(eBaseSpe, newLevel),
    };
  }

  function hasPendingLevelEvolution(pkm) {
    const evoEntry = LEVEL_EVOLUTIONS[pkm.slug];
    if (!evoEntry) return false;
    return (pkm.level || 5) < (evoEntry.minLevel || 22);
  }

  function findConditionalEvolutionTriggers(team, excludeIndices = new Set()) {
    // Don't trigger conditional evolutions if any teammate still has a pending level evolution
    if (team.some((p, i) => !excludeIndices.has(i) && hasPendingLevelEvolution(p))) {
      return [];
    }
    const triggers = [];
    for (let i = 0; i < team.length; i++) {
      if (excludeIndices.has(i)) continue;
      const options = CONDITIONAL_EVOLUTIONS[team[i].slug];
      if (options && options.length > 0) {
        triggers.push({ index: i, pkm: team[i], options });
      }
    }
    return triggers;
  }

  function advanceRow(prev, extra = {}) {
    const teamToLevel = extra.team || prev.team;
    const leveledTeam = teamToLevel.map(p => levelUpPokemon(p).pkm);
    const triggers = findConditionalEvolutionTriggers(leveledTeam);
    if (triggers.length > 0) {
      const { team: _t, ...extraWithoutTeam } = extra;
      return {
        ...prev,
        team: leveledTeam,
        evolutionChoicePokemonIndex: triggers[0].index,
        evolutionChoiceOptions: triggers[0].options.map(d => ({
          slug: d.slug,
          name: d.names?.en || d.slug,
          sprite: d.sprite,
          types: d.types,
        })),
        pendingEvolutionAdvance: extraWithoutTeam,
        screen: "evolution-choice",
      };
    }
    const nextMapRow = prev.mapRow + 1;
    if (nextMapRow >= prev.map.length) {
      const nextFloor = prev.floor + 1;
      if (nextFloor >= FLOOR_NAMES.length) {
        return { ...prev, ...extra, team: leveledTeam, screen: "victory" };
      }
      const newMap = generateMap(nextFloor);
      return { ...prev, team: leveledTeam, floor: nextFloor, map: newMap, mapRow: 0, mapNodeIndex: -1, screen: "map" };
    }
    return { ...prev, ...extra, team: leveledTeam, mapRow: nextMapRow, mapNodeIndex: -1, screen: "map" };
  }

  function continueAfterBattle() {
    update((prev) => {
      let freshTeam = prev.team.map(p => {
        const battlePkm = prev.battlePlayerTeam.find(bp => bp.id === p.id);
        return battlePkm ? { ...p, hp: battlePkm.hp, fainted: battlePkm.hp <= 0 } : p;
      });
      if (prev.battleResult === "lose") {
        return { ...prev, team: freshTeam, screen: "gameover" };
      }
      freshTeam = freshTeam.map(p => levelUpPokemon(p).pkm);
      const triggers = findConditionalEvolutionTriggers(freshTeam);
      if (triggers.length > 0) {
        return {
          ...prev,
          team: freshTeam,
          evolutionChoicePokemonIndex: triggers[0].index,
          evolutionChoiceOptions: triggers[0].options.map(d => ({
            slug: d.slug,
            name: d.names?.en || d.slug,
            sprite: d.sprite,
            types: d.types,
          })),
          pendingEvolutionAdvance: {},
          screen: "evolution-choice",
        };
      }
      return advanceRow(prev, { team: freshTeam });
    });
  }

  const activePlayerPkm = state.battlePlayerTeam[state.battleActivePlayer];
  const activeEnemyPkm = state.battleEnemyTeam[state.battleActiveEnemy];

  function HpBar({ current, max }) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    let barColor = "bg-green-500";
    if (pct < 25) barColor = "bg-red-500";
    else if (pct < 50) barColor = "bg-yellow-500";
    return (
      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white text-2xl">
        Loading Pokédex...
      </div>
    );
  }

  if (state.screen === "title") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="absolute top-4 left-4">
          <HomeButton />
        </div>
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 mb-2">
            Pokelite
          </h1>
          <p className="text-slate-400 text-lg">{t("A Roguelite Pokémon Journey", language)}</p>
          <p className="text-slate-500 text-sm mt-1">{t("Inspired by Slay the Spire", language)}</p>
        </div>

        <div className="mb-8 text-slate-300 text-center max-w-md">
          <p className="mb-2">{t("Build your team. Battle trainers. Conquer the Gym Leaders.", language)}</p>
          <p className="text-sm text-slate-500">{t("Choose your starter to begin your run!", language)}</p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {Object.entries(STARTERS).map(([key, starter]) => {
            const dexEntry = POKEDEX.find(d => d.slug === key);
            return (
              <button
                key={key}
                onClick={() => startGame(key)}
                className="flex flex-col items-center p-4 rounded-2xl border-2 border-slate-600 hover:border-yellow-400 bg-slate-800 hover:bg-slate-700 transition-all duration-200 hover:scale-105 w-36"
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starter.id}.png`}
                  alt={starter.name}
                  className="w-28 h-28"
                />
                <span className="text-white font-bold">{starter.name}</span>
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                  {starter.types.map((t) => <PokeTypeBadge key={t} type={t} language={language} />)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Lv.5 · HP: {starter.hp}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (state.screen === "map") {
    const { map, mapRow, team, floor } = state;
    const currentRow = map[mapRow];
    const isLastFloor = floor >= FLOOR_NAMES.length;
    const gymLeader = GYM_LEADERS[floor];

    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-4 bg-slate-800/80 backdrop-blur rounded-xl p-3 border border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <HomeButton />
              <div className="text-white font-bold">{FLOOR_NAMES[floor] || "Unknown"}</div>
            </div>
            {team.length > 0 && (
              <div className="flex gap-1">
                {team.map((pkm, i) => (
                  <div key={pkm.id} className={`text-center ${i === 0 ? "ring-2 ring-yellow-400 rounded-lg" : ""} p-1 ${pkm.hp <= 0 ? "opacity-40" : ""}`}>
                    <img src={pkm.sprite} alt={pkm.name} className="w-8 h-8 mx-auto" />
                    <div className="text-xs text-slate-400">{pkm.name.slice(0, 6)}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${pkm.hp <= 0 ? "bg-red-800" : pkm.hp / pkm.maxHp < 0.3 ? "bg-red-500" : "bg-green-500"} rounded-full`} style={{ width: `${Math.max(0, (pkm.hp / pkm.maxHp) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white mb-1">{FLOOR_NAMES[floor] || "Route Unknown"}</h2>
            <p className="text-slate-400 text-sm">{t("Choose your path", language)}</p>
          </div>

          <div className="flex flex-col items-center gap-4 mb-8">
            {map.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-4 justify-center">
                {row.map((node, nIdx) => {
                  const isCurrentRow = rIdx === mapRow;
                  const isPastRow = rIdx < mapRow;
                  let emoji, label, color;
                  switch (node.type) {
                    case "encounter": emoji = "🌿"; label = t("Wild Pokémon", language); color = "border-green-500 bg-green-900/30"; break;
                    case "trainer": emoji = "⚔️"; label = t("Trainer", language); color = "border-orange-500 bg-orange-900/30"; break;
                    case "grunt": emoji = "🔴"; label = t("Team Rocket", language); color = "border-red-500 bg-red-900/30"; break;
                    case "item": emoji = "📦"; label = t("Item", language); color = "border-blue-500 bg-blue-900/30"; break;
                    case "move-change": emoji = "🔄"; label = t("Change Move", language); color = "border-purple-500 bg-purple-900/30"; break;
                    case "move-upgrade": emoji = "⬆️"; label = t("Upgrade Move", language); color = "border-cyan-500 bg-cyan-900/30"; break;
                    case "pokemon-center": emoji = "💚"; label = t("Pokémon Center", language); color = "border-pink-500 bg-pink-900/30"; break;
                    case "poke-trader": emoji = "🔄"; label = t("Poké Trader", language); color = "border-yellow-500 bg-yellow-900/30"; break;
                    case "boss": emoji = "👑"; label = floor >= 5 ? t("Champion", language) : t("Gym Leader", language); color = "border-red-500 bg-red-900/50"; break;
                    default: emoji = "❓"; label = "?"; color = "border-slate-500 bg-slate-800";
                  }
                  return (
                    <button
                      key={node.id}
                      onClick={() => isCurrentRow ? selectNode(rIdx, nIdx) : null}
                      disabled={isPastRow}
                      className={`
                        flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 w-32
                        ${isPastRow ? "border-slate-700 bg-slate-900/50 opacity-40 cursor-not-allowed" :
                          isCurrentRow ? `${color} hover:scale-105 cursor-pointer` :
                          "border-slate-700 bg-slate-900/50 opacity-60 cursor-not-allowed"}
                      `}
                    >
                      <span className="text-3xl mb-1">{emoji}</span>
                      <span className="text-xs font-bold text-white">{label}</span>
                      {node.isBoss && gymLeader && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-red-300">{gymLeader.name}</span>
                          <PokeTypeBadge type={gymLeader.type} language={language} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          </div>

          <TooltipProvider>
          <div className="flex-shrink-0 bg-slate-800/50 rounded-xl p-4 border border-slate-700 mt-4">
            <h3 className="text-white font-bold mb-3">{t("Your Team", language)} ({team.length}/6)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {team.map((pkm, i) => (
                <Tooltip key={pkm.id}>
                  <TooltipTrigger asChild>
                    <div className={`bg-slate-900/50 rounded-xl p-2 border ${pkm.hp <= 0 ? "border-red-900 opacity-60" : "border-slate-600"} cursor-help`}>
                      <div className="flex items-center gap-2">
                        <img src={pkm.sprite} alt={pkm.name} className="w-10 h-10" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-bold truncate">{pkm.name} <span className="text-[10px] text-slate-500 font-normal">Lv.{pkm.level || 5}</span></div>
                          <HpBar current={pkm.hp} max={pkm.maxHp} />
                          <div className="text-xs text-slate-400">{Math.max(0, pkm.hp)}/{pkm.maxHp}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {pkm.types.map(t => <PokeTypeBadge key={t} type={t} language={language} />)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {i > 0 && <button onClick={(e) => { e.stopPropagation(); moveTeamMember(i, i - 1); }} className="text-xs px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300" title="Move up">↑</button>}
                        {i < team.length - 1 && <button onClick={(e) => { e.stopPropagation(); moveTeamMember(i, i + 1); }} className="text-xs px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300" title="Move down">↓</button>}
                        {i === 0 && <span className="text-[10px] text-yellow-500 font-bold px-1">LEAD</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pkm.moves.map(m => (
                          <span key={m.key} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            <span className="text-[9px] uppercase opacity-60 mr-0.5">{getTypeName(m.type, language)}</span>
                            {getMoveName(m, language)} <span className="opacity-50">({m.power || "—"})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-xs">
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-sm mb-1">{t("Stats", language)}</div>
                      <div>HP: {pkm.hp}/{pkm.maxHp}</div>
                      <div>{getStatLabel("attack", language)}: {pkm.atk}</div>
                      <div>{getStatLabel("defense", language)}: {pkm.def}</div>
                      <div>{getStatLabel("special-attack", language)}: {pkm.spa}</div>
                      <div>{getStatLabel("special-defense", language)}: {pkm.spd}</div>
                      <div>{getStatLabel("speed", language)}: {pkm.spe}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  if (state.screen === "battle") {
    const isWin = state.battleResult === "win";
    const isLose = state.battleResult === "lose";

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
          {state.trainerName && (
            <div className="text-center text-yellow-400 font-bold text-lg mb-2">
              {state.isBossBattle ? "👑 " : ""}{state.trainerName} {t("wants to battle!", language)}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center gap-4">
            {activeEnemyPkm && (
              <div className="bg-slate-800/80 rounded-xl p-4 border border-red-800">
                <div className="flex items-center gap-3">
                  <img src={activeEnemyPkm.sprite} alt={activeEnemyPkm.name} className="w-16 h-16" />
                  <div className="flex-1">
                    <div className="text-white font-bold">{activeEnemyPkm.name} <span className="text-xs text-slate-500 font-normal">Lv.{activeEnemyPkm.level || 5}</span></div>
                    <div className="flex gap-1 mt-0.5">
                      {activeEnemyPkm.types.map(t => <PokeTypeBadge key={t} type={t} language={language} />)}
                    </div>
                    <HpBar current={Math.max(0, activeEnemyPkm.hp)} max={activeEnemyPkm.maxHp} />
                    <div className="text-xs text-slate-400">{Math.max(0, activeEnemyPkm.hp)}/{activeEnemyPkm.maxHp}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-3xl">⚡ {t("VS", language)} ⚡</div>

            {activePlayerPkm && (
              <div className="bg-slate-800/80 rounded-xl p-4 border border-green-800">
                <div className="flex items-center gap-3">
                  <img src={activePlayerPkm.sprite} alt={activePlayerPkm.name} className="w-16 h-16" />
                  <div className="flex-1">
                    <div className="text-white font-bold">{activePlayerPkm.name} <span className="text-xs text-slate-500 font-normal">Lv.{activePlayerPkm.level || 5}</span></div>
                    <div className="flex gap-1 mt-0.5">
                      {activePlayerPkm.types.map(t => <PokeTypeBadge key={t} type={t} language={language} />)}
                    </div>
                    <HpBar current={Math.max(0, activePlayerPkm.hp)} max={activePlayerPkm.maxHp} />
                    <div className="text-xs text-slate-400">{Math.max(0, activePlayerPkm.hp)}/{activePlayerPkm.maxHp}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {activePlayerPkm.moves.map(m => (
                    <span key={m.key} className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                      <span className="text-[10px] uppercase opacity-60 mr-1">{getTypeName(m.type, language)}</span>
                      {getMoveName(m, language)} ({m.power})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div ref={logEndRef} className="mt-4 h-40 overflow-y-auto bg-slate-900/80 rounded-xl p-3 border border-slate-700">
            <BubbleGroup>
              {state.battleLog.map((entry, i) => {
                const isTurn = entry.text ? entry.text.startsWith("---") : entry.startsWith("---");
                const msg = entry.text || entry;
                const side = entry.side || null;
                const align = isTurn ? "center" : side === "player" ? "end" : side === "enemy" ? "start" : "start";
                return (
                  <Bubble key={i} variant={isTurn ? "pokelite-turn" : side === "player" ? "dungeon-player" : side === "enemy" ? "dungeon-enemy" : "pokelite"} align={align}>
                    <BubbleContent className={isTurn ? "text-yellow-400 font-bold text-center text-xs" : "text-slate-200 text-xs"}>
                      {msg}
                    </BubbleContent>
                  </Bubble>
                );
              })}
            </BubbleGroup>
            {!state.battleFinished && <div className="text-slate-500 animate-pulse mt-2 text-xs">⚡ Battling...</div>}
          </div>

          {state.battleFinished && (
            <div className="mt-4 text-center">
              {state.battleResult === "win" ? (
                <div>
                  <div className="text-3xl text-green-400 font-bold mb-3">{t("Victory!", language)}</div>
                  <button onClick={continueAfterBattle} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all">
                    {t("Continue", language)}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-3xl text-red-400 font-bold mb-3">{t("All Pokémon fainted!", language)}</div>
                  <button onClick={continueAfterBattle} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">
                    {t("Game Over", language)}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.screen === "encounter") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-green-400 text-center mb-2">🌿 {t("Wild Pokémon", language)}!</h2>
          <p className="text-slate-400 text-center mb-6">{t("Choose a Pokémon to add to your team", language)}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {state.encounterChoices.map((pkm, i) => (
              <button key={i} onClick={() => selectEncounterPokemon(i)} className="flex flex-col items-center p-4 rounded-2xl border-2 border-green-700 hover:border-green-400 bg-slate-900 hover:bg-slate-700 transition-all duration-200 hover:scale-105 w-36">
                <img src={pkm.sprite} alt={pkm.name} className="w-16 h-16" />
                <span className="text-white font-bold mt-2">{pkm.name}</span>
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                  {pkm.types.map(t => <PokeTypeBadge key={t} type={t} language={language} />)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Lv.{pkm.level || 5} · HP: {pkm.maxHp}</div>
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={skipEncounter} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Skip", language)}</button>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "discard-pokemon") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-green-400 text-center mb-2">🌿 {t("Wild Pokémon", language)}!</h2>
          <p className="text-slate-400 text-center mb-2">{t("Your team is full!", language)}</p>
          <p className="text-slate-500 text-center text-sm mb-6">{t("Choose a Pokémon to release:", language)}</p>
          <div className="grid grid-cols-2 gap-3">
            {state.team.map((pkm, i) => (
              <button key={pkm.id} onClick={() => discardPokemon(i)} className="flex items-center gap-3 p-3 rounded-xl border border-red-700/50 bg-slate-900 hover:bg-red-900/30 hover:border-red-500 transition-all">
                <img src={pkm.sprite} alt={pkm.name} className="w-10 h-10" />
                <div className="text-left">
                  <div className="text-white font-bold text-sm truncate">{pkm.name}</div>
                  <div className="text-xs text-slate-400">{getTypeName(pkm.types[0], language)} · Lv.{pkm.level || 5}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={skipEncounter} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Skip", language)}</button>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "item") {
    const item = state.currentItem;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-blue-400 text-center mb-2">📦 {t("Found an Item!", language)}</h2>
          <p className="text-blue-300 text-center text-lg font-bold mb-1">{item?.name}</p>
          <p className="text-slate-400 text-center mb-6">{item?.desc}</p>
          <p className="text-slate-500 text-center text-sm mb-4">{t("Choose a Pokémon to give it to:", language)}</p>
          <div className="grid grid-cols-2 gap-3">
            {state.team.map((pkm, i) => (
              <button key={pkm.id} onClick={() => applyItem(i)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-700 transition-all">
                <img src={pkm.sprite} alt={pkm.name} className="w-10 h-10" />
                <div className="text-left">
                  <div className="text-white font-bold">{pkm.name}</div>
                  <div className="text-xs text-slate-400">{Math.max(0, pkm.hp)}/{pkm.maxHp} {t("HP", language)}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={() => update((prev) => advanceRow(prev))} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Skip", language)}</button>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "move-change") {
    const { team, moveChangePokemonIndex } = state;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-purple-400 text-center mb-2">🔄 {t("Change a Move", language)}</h2>
          {moveChangePokemonIndex < 0 ? (
            <>
              <p className="text-slate-400 text-center mb-4">{t("Choose a Pokémon to change a move:", language)}</p>
              <div className="grid grid-cols-2 gap-3">
                {team.map((pkm, i) => (
                  <button key={pkm.id} onClick={() => selectMoveChangePokemon(i)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-700 transition-all">
                    <img src={pkm.sprite} alt={pkm.name} className="w-10 h-10" />
                    <div className="text-left">
                      <div className="text-white font-bold">{pkm.name}</div>
                      <div className="text-xs text-slate-400">{pkm.moves.length} {t("Moves", language)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-center mb-4">{t("Choose a move to replace:", language)}</p>
              <div className="grid grid-cols-2 gap-3">
                {team[moveChangePokemonIndex]?.moves.map((m, i) => (
                  <button key={m.key} onClick={() => selectMoveChangeMove(i)} className="p-3 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-700 transition-all">
                    <div className="text-white font-bold">{getMoveName(m, language)}</div>
                    <div className="text-xs text-slate-400">{getTypeName(m.type, language)} · {t("Power", language)}: {m.power}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="text-center mt-6">
            {moveChangePokemonIndex >= 0 ? (
              <button onClick={() => update((prev) => ({ ...prev, moveChangePokemonIndex: -1 }))} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Back", language)}</button>
            ) : (
              <button onClick={() => update((prev) => advanceRow(prev))} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Cancel", language)}</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "move-upgrade") {
    const { team, moveUpgradePokemonIndex } = state;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2">⬆️ {t("Upgrade a Move", language)}</h2>
          {moveUpgradePokemonIndex < 0 ? (
            <>
              <p className="text-slate-400 text-center mb-4">{t("Choose a Pokémon to upgrade a move:", language)}</p>
              <div className="grid grid-cols-2 gap-3">
                {team.map((pkm, i) => (
                  <button key={pkm.id} onClick={() => selectMoveUpgradePokemon(i)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-700 transition-all">
                    <img src={pkm.sprite} alt={pkm.name} className="w-10 h-10" />
                    <div className="text-left">
                      <div className="text-white font-bold">{pkm.name}</div>
                      <div className="text-xs text-slate-400">{pkm.moves.length} {t("Moves", language)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-center mb-4">{t("Choose a move to upgrade:", language)}</p>
              <div className="grid grid-cols-2 gap-3">
                {team[moveUpgradePokemonIndex]?.moves.map((m, i) => (
                  <button key={m.key} onClick={() => selectMoveUpgradeMove(i)} className="p-3 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-700 transition-all">
                    <div className="text-white font-bold">{getMoveName(m, language)}</div>
                    <div className="text-xs text-slate-400">{t("Power", language)}: {m.power} → {Math.floor((m.power || 10) * 1.4)}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="text-center mt-6">
            {moveUpgradePokemonIndex >= 0 ? (
              <button onClick={() => update((prev) => ({ ...prev, moveUpgradePokemonIndex: -1 }))} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Back", language)}</button>
            ) : (
              <button onClick={() => update((prev) => advanceRow(prev))} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Cancel", language)}</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "pokemon-center") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-pink-700 text-center">
          <span className="text-5xl">💚</span>
          <h2 className="text-2xl font-bold text-pink-400 mt-4 mb-2">{t("Pokémon Center", language)}</h2>
          <p className="text-slate-400 mb-6">{t("Your Pokémon have been fully healed!", language)}</p>
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
            {state.team.map(pkm => (
              <div key={pkm.id} className="flex items-center gap-3 mb-2 last:mb-0">
                <img src={pkm.sprite} alt={pkm.name} className="w-8 h-8" />
                <span className="text-white font-bold">{pkm.name}</span>
                <span className="text-green-400 ml-auto">{t("HP", language)} {Math.max(0, pkm.hp)}/{pkm.maxHp}</span>
              </div>
            ))}
          </div>
          <button onClick={() => update((prev) => advanceRow(prev))} className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all">{t("Continue", language)}</button>
        </div>
      </div>
    );
  }

  if (state.screen === "poke-trader") {
    const { team } = state;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800 rounded-2xl p-6 border border-yellow-700">
          <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">🔄 {t("Poké Trader", language)}</h2>
          <p className="text-slate-400 text-center mb-4">{t("Choose a Pokémon to trade away:", language)}</p>
          <div className="grid grid-cols-2 gap-3">
            {team.map((pkm, i) => (
              <button key={pkm.id} onClick={() => doTrade(i)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-600 bg-slate-900 hover:bg-slate-700 transition-all">
                <img src={pkm.sprite} alt={pkm.name} className="w-10 h-10" />
                <div className="text-left">
                  <div className="text-white font-bold">{pkm.name}</div>
                  <div className="text-xs text-slate-400">{pkm.hp}/{pkm.maxHp} {t("HP", language)}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={skipTrade} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">{t("Decline Trade", language)}</button>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-red-800 text-center">
          <span className="text-5xl">💀</span>
          <h2 className="text-2xl font-bold text-red-400 mt-4 mb-2">{t("Game Over", language)}</h2>
          <p className="text-slate-400 mb-2">{t("Your run ended on", language)} {FLOOR_NAMES[state.floor] || "Route " + (state.floor + 1)}.</p>
          <div className="text-slate-500 text-sm mb-6">
            <p>{t("Team size", language)}: {state.team.length} {t("Pokémon", language)}</p>
          </div>
          <button onClick={() => update({ ...INITIAL_STATE, screen: "title" })} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-colors">{t("Try Again", language)}</button>
        </div>
      </div>
    );
  }

  if (state.screen === "victory") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-yellow-500 text-center">
          <span className="text-5xl">🏆</span>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mt-4 mb-2">{t("Champion", language)}!</h2>
          <p className="text-slate-300 mb-4">{t("You conquered the Pokémon League!", language)}</p>
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-sm">
            <div className="text-slate-400 space-y-1">
              <p>{t("Final Team", language)}: {state.team.length} {t("Pokémon", language)}</p>
              <p>{t("Floors Cleared", language)}: {state.floor + 1}</p>
            </div>
          </div>
          <button onClick={() => update({ ...INITIAL_STATE, screen: "title" })} className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-bold rounded-xl transition-all">{t("Play Again", language)}</button>
        </div>
      </div>
    );
  }

  if (state.screen === "evolution-choice") {
    const evoPkm = state.team[state.evolutionChoicePokemonIndex];
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-6 border border-purple-700 text-center">
          <span className="text-5xl">✨</span>
          <h2 className="text-2xl font-bold text-purple-400 mt-4 mb-2">Evolution!</h2>
          {evoPkm && (
            <div className="mb-6">
              <img src={evoPkm.sprite} alt={evoPkm.name} className="w-20 h-20 mx-auto" />
              <p className="text-white text-lg font-bold mt-2">{evoPkm.name}</p>
              <p className="text-slate-400 text-sm">Lv.{evoPkm.level || 5}</p>
              <p className="text-yellow-300 text-sm mt-2">Choose an evolution:</p>
            </div>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            {state.evolutionChoiceOptions.map((opt) => (
              <button
                key={opt.slug}
                onClick={() => selectEvolution(opt.slug)}
                className="flex flex-col items-center p-4 rounded-2xl border-2 border-purple-600 hover:border-purple-400 bg-slate-900 hover:bg-slate-700 transition-all duration-200 hover:scale-105 w-32"
              >
                <img src={opt.sprite} alt={opt.name} className="w-16 h-16" />
                <span className="text-white font-bold mt-2 text-sm">{opt.name}</span>
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                  {opt.types.map(t => <PokeTypeBadge key={t} type={t} language={language} />)}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <button onClick={dismissEvolution} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Skip Evolution
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
