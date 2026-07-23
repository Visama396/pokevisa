import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getLanguage, subscribe } from "../stores/language";
import LanguageSelector from "./LanguageSelector";

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

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const TYPE_EMOJI = {
  normal: "⭐", fire: "🔥", water: "💧", electric: "⚡", grass: "🌿",
  ice: "❄️", fighting: "🥊", poison: "☠️", ground: "🌍", flying: "🕊️",
  psychic: "🔮", bug: "🐛", rock: "🪨", ghost: "👻", dragon: "🐉",
  dark: "🌑", steel: "⚙️", fairy: "🧚",
};

const STARTERS = {
  bulbasaur: { id: 1, slug: "bulbasaur", name: "Bulbasaur", types: ["grass", "poison"], hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45, starterMoves: ["tackle", "vine-whip", "razor-leaf", "poison-powder", "leech-seed", "sleep-powder", "sludge", "solar-beam"] },
  charmander: { id: 4, slug: "charmander", name: "Charmander", types: ["fire"], hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, starterMoves: ["scratch", "ember", "fire-spin", "smokescreen", "fire-fang", "flame-burst", "inferno", "fire-blast"] },
  squirtle: { id: 7, slug: "squirtle", name: "Squirtle", types: ["water"], hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43, starterMoves: ["tackle", "water-gun", "bubble", "bite", "withdraw", "water-pulse", "rain-dance", "hydro-pump"] },
};

const FLOOR_NAMES = ["Route 1", "Route 2", "Route 3", "Route 4", "Victory Road", "Pokémon League"];
const MAX_ENERGY = 3;
const DRAW_PER_TURN = 5;

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

function calcDamage(power, atk, def, effectiveness) {
  if (power === 0) return 0;
  const base = ((2 * 5 / 5 + 2) * power * (atk / def)) / 50 + 2;
  const stab = 1.25;
  const random = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor(base * stab * effectiveness * random));
}

function getCardCost(power) {
  if (!power || power === 0) return 0;
  if (power <= 30) return 1;
  if (power <= 60) return 2;
  return 3;
}

function makeCard(moveKey, moveData) {
  const cost = moveData.power ? getCardCost(moveData.power) : 0;
  return {
    id: moveKey + "_" + Math.random().toString(36).slice(2, 8),
    key: moveKey,
    name: moveData.names?.en || moveKey,
    type: moveData.type,
    category: moveData.category,
    power: moveData.power || 0,
    accuracy: moveData.accuracy || 100,
    cost,
    effect: moveData.effect?.en || "",
  };
}

function buildStarterDeck(starterKey) {
  const starter = STARTERS[starterKey];
  return starter.starterMoves.map((m) => makeCard(m, ALL_MOVES[m] || { names: { en: m }, type: "normal", category: "physical", power: 40, accuracy: 100 }));
}

let ALL_MOVES = {};

const ENEMY_TEMPLATES = {
  1: [
    { slug: "pidgey", name: "Pidgey", types: ["normal", "flying"], hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56, moves: ["tackle", "gust", "quick-attack", "sand-attack"] },
    { slug: "rattata", name: "Rattata", types: ["normal"], hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72, moves: ["tackle", "bite", "quick-attack", "hyper-fang"] },
    { slug: "caterpie", name: "Caterpie", types: ["bug"], hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45, moves: ["tackle", "bug-bite", "string-shot", "struggle"] },
    { slug: "weedle", name: "Weedle", types: ["bug", "poison"], hp: 40, atk: 35, def: 30, spa: 20, spd: 20, spe: 50, moves: ["poison-sting", "bug-bite", "string-shot", "struggle"] },
    { slug: "zigzagoon", name: "Zigzagoon", types: ["normal"], hp: 38, atk: 30, def: 41, spa: 30, spd: 41, spe: 60, moves: ["tackle", "tail-whip", "mud-slap", "headbutt"] },
  ],
  2: [
    { slug: "spearow", name: "Spearow", types: ["normal", "flying"], hp: 40, atk: 60, def: 30, spa: 31, spd: 31, spe: 70, moves: ["peck", "leer", "quick-attack", "fury-attack"] },
    { slug: "nidoran-m", name: "Nidoran♂", types: ["poison"], hp: 46, atk: 57, def: 40, spa: 40, spd: 40, spe: 50, moves: ["peck", "leer", "poison-sting", "fury-attack"] },
    { slug: "sandshrew", name: "Sandshrew", types: ["ground"], hp: 50, atk: 75, def: 85, spa: 20, spd: 30, spe: 40, moves: ["scratch", "sand-attack", "mud-slap", "slash"] },
    { slug: "mankey", name: "Mankey", types: ["fighting"], hp: 40, atk: 80, def: 35, spa: 35, spd: 45, spe: 70, moves: ["scratch", "low-kick", "karate-chop", "seismic-toss"] },
    { slug: "machop", name: "Machop", types: ["fighting"], hp: 70, atk: 80, def: 50, spa: 35, spd: 35, spe: 35, moves: ["low-kick", "karate-chop", "seismic-toss", "revenge"] },
  ],
  3: [
    { slug: "pikachu", name: "Pikachu", types: ["electric"], hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90, moves: ["thundershock", "quick-attack", "iron-tail", "thunderbolt"] },
    { slug: "clefairy", name: "Clefairy", types: ["fairy"], hp: 70, atk: 45, def: 48, spa: 60, spd: 65, spe: 35, moves: ["dazzling-gleam", "moonblast", "metronome", "light-screen"] },
    { slug: "gyarados", name: "Gyarados", types: ["water", "flying"], hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81, moves: ["bite", "waterfall", "dragon-rage", "crunch"] },
    { slug: "dragonair", name: "Dragonair", types: ["dragon"], hp: 82, atk: 84, def: 65, spa: 70, spd: 70, spe: 70, moves: ["dragon-rage", "slam", "dragon-breath", "aqua-tail"] },
    { slug: "snorlax", name: "Snorlax", types: ["normal"], hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30, moves: ["tackle", "body-slam", "rest", "earthquake"] },
  ],
  4: [
    { slug: "arcanine", name: "Arcanine", types: ["fire"], hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95, moves: ["ember", "flamethrower", "fire-fang", "extreme-speed"] },
    { slug: "starmie", name: "Starmie", types: ["water", "psychic"], hp: 60, atk: 75, def: 85, spa: 100, spd: 85, spe: 115, moves: ["water-gun", "surf", "psychic", "thunderbolt"] },
    { slug: "alakazam", name: "Alakazam", types: ["psychic"], hp: 55, atk: 50, def: 45, spa: 135, spd: 95, spe: 120, moves: ["psychic", "shadow-ball", "energy-ball", "focus-blast"] },
    { slug: "scizor", name: "Scizor", types: ["bug", "steel"], hp: 70, atk: 130, def: 100, spa: 55, spd: 80, spe: 65, moves: ["bullet-punch", "x-scissor", "iron-head", "swords-dance"] },
  ],
  boss: [
    { slug: "mewtwo", name: "Mewtwo", types: ["psychic"], hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130, moves: ["psychic", "shadow-ball", "aura-sphere", "recover"], isBoss: true },
    { slug: "rayquaza", name: "Rayquaza", types: ["dragon", "flying"], hp: 105, atk: 150, def: 90, spa: 150, spd: 90, spe: 95, moves: ["dragon-claw", "fly", "outrage", "extreme-speed"], isBoss: true },
    { slug: "charizard", name: "Charizard", types: ["fire", "flying"], hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100, moves: ["flamethrower", "air-slash", "dragon-pulse", "solar-beam"], isBoss: true },
  ],
};

function generateEnemies(floor) {
  const templates = ENEMY_TEMPLATES[floor] || ENEMY_TEMPLATES[1];
  const numEnemies = floor <= 2 ? 1 : Math.random() < 0.4 ? 2 : 1;
  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const scaling = 1 + (floor - 1) * 0.15;
    enemies.push({
      ...template,
      id: "enemy_" + Math.random().toString(36).slice(2, 8),
      maxHp: Math.floor(template.hp * scaling),
      currentHp: Math.floor(template.hp * scaling),
      deck: template.moves.map((m) => makeCard(m, ALL_MOVES[m] || { names: { en: m }, type: "normal", category: "physical", power: 40, accuracy: 100 })),
      intent: null,
    });
  }
  return enemies;
}

function generateBoss(floor) {
  const templates = ENEMY_TEMPLATES.boss;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const scaling = 1 + (floor - 1) * 0.1;
  return {
    ...template,
    id: "boss_" + Math.random().toString(36).slice(2, 8),
    maxHp: Math.floor(template.hp * scaling * 1.5),
    currentHp: Math.floor(template.hp * scaling * 1.5),
    deck: template.moves.map((m) => makeCard(m, ALL_MOVES[m] || { names: { en: m }, type: "normal", category: "physical", power: 40, accuracy: 100 })),
    intent: null,
  };
}

function generateRewardCards(floor) {
  const allMoveKeys = Object.keys(ALL_MOVES);
  const damaging = allMoveKeys.filter((k) => ALL_MOVES[k].power && ALL_MOVES[k].power > 0);
  const numCards = 3;
  const rewards = [];
  const used = new Set();
  for (let i = 0; i < numCards; i++) {
    let key;
    let attempts = 0;
    do {
      key = damaging[Math.floor(Math.random() * damaging.length)];
      attempts++;
    } while (used.has(key) && attempts < 50);
    used.add(key);
    const move = ALL_MOVES[key];
    rewards.push(makeCard(key, move));
  }
  return rewards;
}

function generateShopCards(floor) {
  const allMoveKeys = Object.keys(ALL_MOVES);
  const damaging = allMoveKeys.filter((k) => ALL_MOVES[k].power && ALL_MOVES[k].power > 20);
  const cards = [];
  const used = new Set();
  for (let i = 0; i < 4; i++) {
    let key;
    let attempts = 0;
    do {
      key = damaging[Math.floor(Math.random() * damaging.length)];
      attempts++;
    } while (used.has(key) && attempts < 50);
    used.add(key);
    const move = ALL_MOVES[key];
    const card = makeCard(key, move);
    card.price = 30 + card.cost * 20 + Math.floor(Math.random() * 20);
    cards.push(card);
  }
  return cards;
}

function pickIntent(enemy) {
  const attacks = enemy.deck.filter((c) => c.power > 0);
  if (attacks.length === 0) return { type: "unknown", card: enemy.deck[0] };
  const card = attacks[Math.floor(Math.random() * attacks.length)];
  return { type: "attack", card };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const INITIAL_STATE = {
  screen: "title",
  floor: 0,
  playerHp: 0,
  playerMaxHp: 0,
  playerAtk: 0,
  playerDef: 0,
  playerSpa: 0,
  playerSpe: 0,
  playerTypes: [],
  playerPokemon: null,
  deck: [],
  hand: [],
  drawPile: [],
  discardPile: [],
  energy: MAX_ENERGY,
  gold: 50,
  potions: [],
  enemies: [],
  turn: 0,
  battleLog: [],
  selectedCard: null,
  targetEnemy: null,
  rewardCards: [],
  shopCards: [],
  shopRemovePrice: 75,
  gameOver: false,
  victory: false,
  animating: false,
  showCardDetail: null,
  enemyIntents: {},
  playerBuffs: { atk: 0, def: 0 },
  enemyBuffs: {},
  lastBattleWasBoss: false,
};

export default function Pokeroguelite() {
  const [language, setLanguage] = useState(getLanguage());
  const [state, setState] = useState(() => ({ ...INITIAL_STATE }));
  const [moveData, setMoveData] = useState({});
  const [pokedex, setPokedex] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => subscribe(setLanguage), []);

  useEffect(() => {
    Promise.all([
      fetch("/moves.json").then((r) => r.json()),
      fetch("/pokedex.json").then((r) => r.json()),
    ]).then(([moves, dex]) => {
      ALL_MOVES = moves;
      setMoveData(moves);
      setPokedex(dex);
    });
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [state.battleLog]);

  const update = useCallback((fn) => {
    setState((prev) => {
      const next = typeof fn === "function" ? fn(prev) : { ...prev, ...fn };
      return next;
    });
  }, []);

  function startGame(starterKey) {
    const starter = STARTERS[starterKey];
    const dexEntry = Object.values(ENEMY_TEMPLATES).flat().find((e) => e.slug === starter.slug) || {};
    const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${starter.id}.png`;
    const deck = buildStarterDeck(starterKey);
    const maxHp = starter.hp + 10;
    update({
      screen: "map",
      floor: 0,
      playerHp: maxHp,
      playerMaxHp: maxHp,
      playerAtk: starter.atk,
      playerDef: starter.def,
      playerSpa: starter.spa,
      playerSpe: starter.spe,
      playerTypes: starter.types,
      playerPokemon: { ...starter, sprite },
      deck,
      hand: [],
      drawPile: [],
      discardPile: [],
      energy: MAX_ENERGY,
      gold: 50,
      potions: ["potion"],
      enemies: [],
      turn: 0,
      battleLog: [],
      selectedCard: null,
      targetEnemy: null,
      rewardCards: [],
      shopCards: [],
      gameOver: false,
      victory: false,
      animating: false,
      showCardDetail: null,
      enemyIntents: {},
      playerBuffs: { atk: 0, def: 0 },
      enemyBuffs: {},
      lastBattleWasBoss: false,
    });
  }

  function startBattle(isElite = false, isBoss = false) {
    let enemies;
    let lastBattleWasBoss = isBoss;
    if (isBoss) {
      enemies = [generateBoss(state.floor + 1)];
    } else if (isElite) {
      const pool = ENEMY_TEMPLATES[Math.min(state.floor + 1, 4)] || ENEMY_TEMPLATES[4];
      const template = pool[Math.floor(Math.random() * pool.length)];
      const scaling = 1 + state.floor * 0.2;
      enemies = [{
        ...template,
        id: "elite_" + Math.random().toString(36).slice(2, 8),
        maxHp: Math.floor(template.hp * scaling * 1.3),
        currentHp: Math.floor(template.hp * scaling * 1.3),
        deck: template.moves.map((m) => makeCard(m, ALL_MOVES[m] || { names: { en: m }, type: "normal", category: "physical", power: 40, accuracy: 100 })),
        intent: null,
        isElite: true,
      }];
    } else {
      enemies = generateEnemies(state.floor + 1);
    }

    enemies.forEach((e) => { e.intent = pickIntent(e); });

    const shuffled = shuffleArray(state.deck);
    const drawPile = shuffled;
    const hand = drawPile.splice(0, DRAW_PER_TURN);

    update({
      screen: "battle",
      enemies,
      deck: state.deck,
      hand,
      drawPile,
      discardPile: [],
      energy: MAX_ENERGY,
      turn: 1,
      battleLog: ["Battle start!"],
      selectedCard: null,
      targetEnemy: null,
      enemyIntents: {},
      playerBuffs: { atk: 0, def: 0 },
      enemyBuffs: {},
      lastBattleWasBoss,
    });
  }

  function drawCards(num) {
    update((prev) => {
      let drawPile = [...prev.drawPile];
      let discardPile = [...prev.discardPile];
      let hand = [...prev.hand];

      for (let i = 0; i < num; i++) {
        if (drawPile.length === 0) {
          if (discardPile.length === 0) break;
          drawPile = shuffleArray(discardPile);
          discardPile = [];
        }
        hand.push(drawPile.shift());
      }

      return { drawPile, discardPile, hand };
    });
  }

  function playCard(cardIndex, targetId) {
    update((prev) => {
      if (prev.animating) return prev;
      const card = prev.hand[cardIndex];
      if (!card || card.cost > prev.energy) return prev;

      const target = prev.enemies.find((e) => e.id === targetId);
      if (!target || target.currentHp <= 0) return prev;

      const newEnergy = prev.energy - card.cost;
      const newHand = prev.hand.filter((_, i) => i !== cardIndex);
      const newDiscard = [...prev.discardPile, card];

      let newEnemies = [...prev.enemies];
      let log = [...prev.battleLog];
      let playerHp = prev.playerHp;
      let newPlayerBuffs = { ...prev.playerBuffs };

      if (card.category === "status") {
        const lowerName = card.name.toLowerCase();
        if (lowerName.includes("swords dance") || lowerName.includes("bulk up")) {
          newPlayerBuffs.atk += 1;
          log.push(`⬆ ${card.name}! Attack raised!`);
        } else if (lowerName.includes("shell armor") || lowerName.includes("acid armor")) {
          newPlayerBuffs.def += 1;
          log.push(`⬆ ${card.name}! Defense raised!`);
        } else if (lowerName.includes("leech seed")) {
          const heal = Math.floor(target.maxHp * 0.08);
          const idx = newEnemies.findIndex((e) => e.id === targetId);
          newEnemies[idx] = { ...target, currentHp: Math.max(0, target.currentHp - heal) };
          playerHp = Math.min(prev.playerMaxHp, playerHp + heal);
          log.push(`🌱 ${card.name} drains ${heal} HP!`);
        } else if (lowerName.includes("recover") || lowerName.includes("rest")) {
          const heal = Math.floor(prev.playerMaxHp * 0.3);
          playerHp = Math.min(prev.playerMaxHp, playerHp + heal);
          log.push(`💚 ${card.name} heals ${heal} HP!`);
        } else if (lowerName.includes("heal") || lowerName.includes("synthesis") || lowerName.includes("morning sun")) {
          const heal = Math.floor(prev.playerMaxHp * 0.25);
          playerHp = Math.min(prev.playerMaxHp, playerHp + heal);
          log.push(`💚 ${card.name} heals ${heal} HP!`);
        } else if (lowerName.includes("light screen") || lowerName.includes("reflect")) {
          newPlayerBuffs.def += 1;
          log.push(`🛡 ${card.name} Defense raised!`);
        } else if (lowerName.includes("tail whip") || lowerName.includes("leer")) {
          const newBuffs = { ...prev.enemyBuffs };
          newBuffs[targetId] = (newBuffs[targetId] || 0) - 1;
          log.push(`⬇ ${card.name} on ${target.name}! Defense lowered!`);
          return {
            ...prev,
            energy: newEnergy,
            hand: newHand,
            discardPile: newDiscard,
            battleLog: log,
            enemyBuffs: newBuffs,
            selectedCard: null,
          };
        } else {
          log.push(`✨ ${card.name} used!`);
        }
      } else {
        const atkStat = card.category === "physical" ? prev.playerAtk + newPlayerBuffs.atk * 15 : prev.playerSpa + newPlayerBuffs.atk * 15;
        const defStat = card.category === "physical" ? target.def : target.spd;
        const effectiveness = getEffectiveness(card.type, target.types);
        const dmg = calcDamage(card.power, atkStat, defStat, effectiveness);

        const idx = newEnemies.findIndex((e) => e.id === targetId);
        const newHp = Math.max(0, target.currentHp - dmg);
        newEnemies[idx] = { ...target, currentHp: newHp };

        let effText = "";
        if (effectiveness > 1) effText = " Super effective!";
        else if (effectiveness < 1 && effectiveness > 0) effText = " Not very effective...";
        else if (effectiveness === 0) effText = " No effect!";

        log.push(`${card.name} deals ${dmg} damage to ${target.name}!${effText}`);

        if (card.key.includes("absorb") || card.key.includes("drain") || card.key.includes("giga-drain") || card.key.includes("mega-drain")) {
          const heal = Math.floor(dmg / 2);
          playerHp = Math.min(prev.playerMaxHp, playerHp + heal);
          log.push(`  Drains ${heal} HP!`);
        }
      }

      const aliveEnemies = newEnemies.filter((e) => e.currentHp > 0);
      const isBossDefeated = aliveEnemies.length === 0 && prev.lastBattleWasBoss;

      return {
        ...prev,
        energy: newEnergy,
        hand: newHand,
        discardPile: newDiscard,
        enemies: newEnemies,
        battleLog: log,
        playerHp,
        playerBuffs: newPlayerBuffs,
        selectedCard: null,
        targetEnemy: aliveEnemies.length > 0 ? null : prev.targetEnemy,
        screen: aliveEnemies.length === 0 ? (isBossDefeated ? "victory" : "reward") : prev.screen,
      };
    });
  }

  function endTurn() {
    update((prev) => {
      if (prev.animating) return prev;
      let log = [...prev.battleLog];
      let playerHp = prev.playerHp;
      let newEnemies = [...prev.enemies];
      let newEnemyBuffs = { ...prev.enemyBuffs };

      log.push("--- Enemy Turn ---");

      for (const enemy of newEnemies) {
        if (enemy.currentHp <= 0) continue;
        if (!enemy.intent || !enemy.intent.card) continue;

        const intentCard = enemy.intent.card;
        if (intentCard.power > 0) {
          const atkStat = intentCard.category === "physical" ? enemy.atk : enemy.spa;
          const defStat = intentCard.category === "physical" ? prev.playerDef + prev.playerBuffs.def * 15 : prev.playerDef + prev.playerBuffs.def * 15;
          const effectiveness = getEffectiveness(intentCard.type, prev.playerTypes);
          const dmg = calcDamage(intentCard.power, atkStat, defStat, effectiveness);
          playerHp = Math.max(0, playerHp - dmg);
          let effText = "";
          if (effectiveness > 1) effText = " Super effective!";
          else if (effectiveness < 1 && effectiveness > 0) effText = " Not very effective...";
          log.push(`${enemy.name} uses ${intentCard.name} for ${dmg} damage!${effText}`);
        } else {
          const lowerName = intentCard.name.toLowerCase();
          if (lowerName.includes("leer") || lowerName.includes("tail-whip")) {
            log.push(`${enemy.name} uses ${intentCard.name}! Your defense lowered!`);
          } else if (lowerName.includes("recover") || lowerName.includes("rest")) {
            const heal = Math.floor(enemy.maxHp * 0.2);
            const idx = newEnemies.findIndex((e) => e.id === enemy.id);
            newEnemies[idx] = { ...enemy, currentHp: Math.min(enemy.maxHp, enemy.currentHp + heal) };
            log.push(`${enemy.name} heals ${heal} HP!`);
          } else {
            log.push(`${enemy.name} uses ${intentCard.name}!`);
          }
        }

        if (playerHp <= 0) break;
      }

      if (playerHp <= 0) {
        return { ...prev, playerHp: 0, battleLog: [...log, "You fainted!"], screen: "gameover" };
      }

      newEnemies.forEach((e) => {
        if (e.currentHp > 0) {
          e.intent = pickIntent(e);
        }
      });

      const newDrawPile = [...prev.drawPile];
      const newDiscardPile = [...prev.discardPile, ...prev.hand];
      const hand = newDrawPile.splice(0, DRAW_PER_TURN);

      log.push("--- Your Turn ---");

      return {
        ...prev,
        playerHp,
        enemies: newEnemies,
        enemyBuffs: newEnemyBuffs,
        drawPile: newDrawPile,
        discardPile: newDiscardPile,
        hand,
        energy: MAX_ENERGY,
        turn: prev.turn + 1,
        battleLog: log,
      };
    });
  }

  function selectReward(card) {
    update((prev) => ({
      deck: [...prev.deck, card],
      screen: "map",
    }));
  }

  function skipReward() {
    update({ screen: "map" });
  }

  function enterShop() {
    const cards = generateShopCards(state.floor);
    update({ screen: "shop", shopCards: cards, shopRemovePrice: 75 });
  }

  function buyCard(index) {
    update((prev) => {
      const card = prev.shopCards[index];
      if (!card || prev.gold < card.price) return prev;
      return {
        gold: prev.gold - card.price,
        deck: [...prev.deck, makeCard(card.key, ALL_MOVES[card.key])],
        shopCards: prev.shopCards.filter((_, i) => i !== index),
      };
    });
  }

  function removeCard() {
    update((prev) => {
      if (prev.gold < prev.shopRemovePrice || prev.deck.length <= 5) return prev;
      const idx = Math.floor(Math.random() * prev.deck.length);
      return {
        gold: prev.gold - prev.shopRemovePrice,
        deck: prev.deck.filter((_, i) => i !== idx),
        shopRemovePrice: prev.shopRemovePrice + 25,
      };
    });
  }

  function healAtRest() {
    update((prev) => {
      const heal = Math.floor(prev.playerMaxHp * 0.3);
      return {
        playerHp: Math.min(prev.playerMaxHp, prev.playerHp + heal),
        screen: "map",
      };
    });
  }

  function advanceFloor() {
    update((prev) => {
      const nextFloor = prev.floor + 1;
      if (nextFloor >= 5) {
        return { floor: nextFloor, screen: "map" };
      }
      return { floor: nextFloor, screen: "map" };
    });
  }

  function chooseNodeType(type) {
    if (type === "battle") startBattle();
    else if (type === "elite") startBattle(true);
    else if (type === "boss") startBattle(false, true);
    else if (type === "rest") update({ screen: "rest" });
    else if (type === "shop") enterShop();
  }

  function usePotion() {
    update((prev) => {
      if (prev.potions.length === 0) return prev;
      const heal = Math.floor(prev.playerMaxHp * 0.3);
      const newPotions = prev.potions.slice(1);
      return {
        playerHp: Math.min(prev.playerMaxHp, prev.playerHp + heal),
        potions: newPotions,
        battleLog: [...prev.battleLog, `🧪 Used potion! Healed ${heal} HP!`],
      };
    });
  }

  const spriteUrl = useMemo(() => {
    if (!state.playerPokemon) return "";
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${state.playerPokemon.id}.png`;
  }, [state.playerPokemon]);

  const enemySpriteUrl = useCallback((slug, id) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  }, []);

  function getEnemySprite(enemy) {
    const dexEntry = pokedex.find((p) => p.slug === enemy.slug);
    if (dexEntry) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexEntry.id}.png`;
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/0.png`;
  }

  function HpBar({ current, max, color = "bg-green-500" }) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    let barColor = color;
    if (pct < 25) barColor = "bg-red-500";
    else if (pct < 50) barColor = "bg-yellow-500";
    return (
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  function TypeBadge({ type }) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: TYPE_COLORS[type] || "#68A090" }}>
        {TYPE_EMOJI[type] || ""} {type}
      </span>
    );
  }

  function Card({ card, onClick, small = false, affordable = true }) {
    return (
      <div
        onClick={onClick}
        className={`
          relative flex flex-col items-center justify-between rounded-xl border-2 cursor-pointer
          transition-all duration-200 hover:scale-105 hover:-translate-y-1
          ${affordable ? "border-slate-500 hover:border-yellow-400 bg-slate-800" : "border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed"}
          ${small ? "w-20 h-28 p-1" : "w-28 h-40 p-2"}
        `}
      >
        <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-slate-900 border-2 border-yellow-400 flex items-center justify-center text-xs font-bold text-yellow-400">
          {card.cost}
        </div>
        <div className="text-center mt-1">
          <div className={`${small ? "text-[10px]" : "text-xs"} font-bold text-white leading-tight`}>{card.name}</div>
          <div className={`${small ? "text-[8px]" : "text-[10px]"} text-slate-400 uppercase`}>{card.type}</div>
        </div>
        <div className="text-center">
          <div className="text-lg">{TYPE_EMOJI[card.type] || "⭐"}</div>
          {card.power > 0 && <div className={`${small ? "text-[10px]" : "text-xs"} text-slate-300`}>Power: {card.power}</div>}
          {card.category === "status" && <div className={`${small ? "text-[10px]" : "text-xs"} text-slate-300`}>Status</div>}
        </div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: TYPE_COLORS[card.type] || "#68A090" }} />
      </div>
    );
  }

  if (state.screen === "title") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 mb-2">
            Pokéroguelite
          </h1>
          <p className="text-slate-400 text-lg">A Pokémon Deckbuilder</p>
          <p className="text-slate-500 text-sm mt-1">Inspired by Slay the Spire</p>
        </div>

        <div className="mb-8 text-slate-300 text-center max-w-md">
          <p className="mb-2">Build your deck. Battle wild Pokémon. Climb the routes.</p>
          <p className="text-sm text-slate-500">Choose your starter to begin your run!</p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {Object.entries(STARTERS).map(([key, starter]) => (
            <button
              key={key}
              onClick={() => startGame(key)}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-slate-600 hover:border-yellow-400 bg-slate-800 hover:bg-slate-700 transition-all duration-200 hover:scale-105 w-36"
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${starter.id}.png`}
                alt={starter.name}
                className="w-20 h-20"
              />
              <span className="text-white font-bold mt-2">{starter.name}</span>
              <div className="flex gap-1 mt-1">
                {starter.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-1">HP: {starter.hp}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state.screen === "map") {
    const floorIndex = state.floor;
    const isLastFloor = floorIndex >= 5;

    const nodeTypes = [];
    if (floorIndex < 5) {
      const pool = [];
      pool.push({ type: "battle", label: "Battle", emoji: "⚔️" });
      pool.push({ type: "battle", label: "Battle", emoji: "⚔️" });
      if (floorIndex > 0) pool.push({ type: "elite", label: "Elite", emoji: "💀" });
      if (floorIndex > 1) pool.push({ type: "shop", label: "Shop", emoji: "🛒" });
      if (floorIndex > 0 && floorIndex < 4) pool.push({ type: "rest", label: "Rest", emoji: "🏕️" });
      if (floorIndex === 4) pool.push({ type: "boss", label: "BOSS", emoji: "👑" });
      const shuffled = shuffleArray(pool);
      nodeTypes.push(...shuffled.slice(0, 3));
      if (floorIndex === 4) nodeTypes.push({ type: "boss", label: "BOSS", emoji: "👑" });
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              {state.playerPokemon && (
                <img src={spriteUrl} alt={state.playerPokemon.name} className="w-12 h-12" />
              )}
              <div>
                <div className="text-white font-bold">{state.playerPokemon?.name}</div>
                <div className="flex items-center gap-2">
                  <HpBar current={state.playerHp} max={state.playerMaxHp} />
                  <span className="text-xs text-slate-300">{state.playerHp}/{state.playerMaxHp}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-yellow-400">💰 {state.gold}</span>
              <span className="text-red-400">🧪 ×{state.potions.length}</span>
              <span className="text-slate-400">🃏 {state.deck.length}</span>
            </div>
          </div>

          {/* Floor progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {FLOOR_NAMES.map((name, i) => (
                <div key={i} className={`text-xs text-center flex-1 ${i <= floorIndex ? "text-yellow-400" : "text-slate-600"}`}>
                  <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-bold ${i < floorIndex ? "bg-yellow-400 text-slate-900" : i === floorIndex ? "bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400" : "bg-slate-700 text-slate-500"}`}>
                    {i < floorIndex ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:block">{name}</span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-slate-700 rounded-full mx-4">
              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(floorIndex / 5) * 100}%` }} />
            </div>
          </div>

          {/* Current floor info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">{FLOOR_NAMES[floorIndex] || "Unknown Route"}</h2>
            <p className="text-slate-400 text-sm mt-1">Choose your path</p>
          </div>

          {/* Node choices */}
          {!isLastFloor ? (
            <div className="flex gap-4 justify-center flex-wrap">
              {nodeTypes.map((node, i) => (
                <button
                  key={i}
                  onClick={() => chooseNodeType(node.type)}
                  className={`
                    flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-105 w-36
                    ${node.type === "boss" ? "border-red-500 bg-red-900/30 hover:bg-red-900/50" :
                      node.type === "elite" ? "border-orange-500 bg-orange-900/30 hover:bg-orange-900/50" :
                      node.type === "shop" ? "border-green-500 bg-green-900/30 hover:bg-green-900/50" :
                      node.type === "rest" ? "border-blue-500 bg-blue-900/30 hover:bg-blue-900/50" :
                      "border-slate-500 bg-slate-800 hover:bg-slate-700"}
                  `}
                >
                  <span className="text-4xl mb-2">{node.emoji}</span>
                  <span className={`font-bold ${node.type === "boss" ? "text-red-400" : node.type === "elite" ? "text-orange-400" : "text-white"}`}>
                    {node.label}
                  </span>
                  {node.type === "battle" && <span className="text-xs text-slate-400 mt-1">Wild Pokémon</span>}
                  {node.type === "elite" && <span className="text-xs text-orange-400/70 mt-1">Strong foe</span>}
                  {node.type === "shop" && <span className="text-xs text-green-400/70 mt-1">Buy & sell</span>}
                  {node.type === "rest" && <span className="text-xs text-blue-400/70 mt-1">Heal up</span>}
                  {node.type === "boss" && <span className="text-xs text-red-400/70 mt-1">Legendary!</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-400 mb-4">You've completed all routes! Time for the Pokémon League!</p>
              <button
                onClick={() => chooseNodeType("boss")}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-all"
              >
                👑 Face the Champion!
              </button>
            </div>
          )}

          {/* Deck view */}
          <div className="mt-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-bold mb-3">Your Deck ({state.deck.length} cards)</h3>
            <div className="flex flex-wrap gap-2">
              {state.deck.map((card, i) => (
                <Card key={card.id} card={card} small />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "battle") {
    const aliveEnemies = state.enemies.filter((e) => e.currentHp > 0);
    const currentTarget = state.targetEnemy || (aliveEnemies.length === 1 ? aliveEnemies[0]?.id : null);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 bg-slate-800/80 backdrop-blur rounded-xl p-3 border border-slate-700">
            <div className="flex items-center gap-3">
              {state.playerPokemon && (
                <img src={spriteUrl} alt={state.playerPokemon.name} className="w-10 h-10" />
              )}
              <div>
                <div className="text-white font-bold text-sm">{state.playerPokemon?.name}</div>
                <div className="flex items-center gap-2">
                  <HpBar current={state.playerHp} max={state.playerMaxHp} />
                  <span className="text-xs text-slate-300">{state.playerHp}/{state.playerMaxHp}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: MAX_ENERGY }).map((_, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < state.energy ? "bg-yellow-400 text-slate-900" : "bg-slate-700 text-slate-500"}`}>
                    ⚡
                  </div>
                ))}
              </div>
              {state.potions.length > 0 && (
                <button onClick={usePotion} className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
                  🧪 Heal
                </button>
              )}
            </div>
          </div>

          {/* Battle field */}
          <div className="mb-4">
            <div className="flex justify-center gap-6 flex-wrap">
              {state.enemies.map((enemy) => {
                const isDead = enemy.currentHp <= 0;
                const isSelected = currentTarget === enemy.id;
                return (
                  <div
                    key={enemy.id}
                    onClick={() => { if (!isDead && state.selectedCard !== null) update({ targetEnemy: enemy.id }); }}
                    className={`
                      relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 w-44
                      ${isDead ? "opacity-30 border-slate-700 bg-slate-900" :
                        isSelected ? "border-yellow-400 bg-slate-700" :
                        "border-slate-600 bg-slate-800 hover:border-slate-400 cursor-pointer"}
                    `}
                  >
                    {/* Intent */}
                    {!isDead && enemy.intent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-600 rounded-full px-2 py-0.5 text-xs">
                        {enemy.intent.card?.power > 0 ? (
                          <span className="text-red-400">⚔️ {enemy.intent.card.name}</span>
                        ) : (
                          <span className="text-blue-400">✨ {enemy.intent.card?.name}</span>
                        )}
                      </div>
                    )}

                    <img src={getEnemySprite(enemy)} alt={enemy.name} className={`w-20 h-20 ${isDead ? "grayscale" : ""}`} />
                    <div className="text-white font-bold text-sm mt-1">{enemy.name}</div>
                    {enemy.isElite && <span className="text-orange-400 text-xs font-bold">ELITE</span>}
                    {enemy.isBoss && <span className="text-red-400 text-xs font-bold">BOSS</span>}
                    <div className="flex gap-1 mt-1">
                      {enemy.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </div>
                    <div className="w-full mt-2">
                      <HpBar current={enemy.currentHp} max={enemy.maxHp} />
                      <div className="text-xs text-slate-400 text-center mt-0.5">{enemy.currentHp}/{enemy.maxHp}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Battle log */}
          <div ref={logEndRef} className="mb-4 h-24 overflow-y-auto bg-slate-900/80 rounded-xl p-3 border border-slate-700 text-xs font-mono">
            {state.battleLog.map((msg, i) => (
              <div key={i} className={`py-0.5 ${msg.startsWith("---") ? "text-yellow-400 font-bold mt-1" : "text-slate-400"}`}>
                {msg}
              </div>
            ))}
          </div>

          {/* Selected card indicator */}
          {state.selectedCard !== null && (
            <div className="text-center mb-2 text-sm text-yellow-400">
              Click an enemy to play <strong>{state.hand[state.selectedCard]?.name}</strong>
              <button onClick={() => update({ selectedCard: null })} className="ml-2 text-slate-400 hover:text-white">[Cancel]</button>
            </div>
          )}

          {/* Player hand */}
          <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Hand ({state.hand.length})</span>
              <button
                onClick={endTurn}
                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-sm rounded-lg transition-colors"
              >
                End Turn ⏭️
              </button>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {state.hand.map((card, i) => (
                <Card
                  key={card.id}
                  card={card}
                  small={state.hand.length > 5}
                  affordable={card.cost <= state.energy}
                  onClick={() => {
                    if (card.cost > state.energy) return;
                    if (aliveEnemies.length === 1) {
                      playCard(i, aliveEnemies[0].id);
                    } else {
                      update({ selectedCard: i, targetEnemy: null });
                    }
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Draw: {state.drawPile.length}</span>
              <span>Discard: {state.discardPile.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "reward") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">Victory!</h2>
          <p className="text-slate-400 text-center mb-6">Choose a card to add to your deck</p>

          <div className="flex gap-4 justify-center flex-wrap mb-6">
            {state.rewardCards.map((card, i) => (
              <div key={card.id} className="flex flex-col items-center">
                <Card card={card} onClick={() => selectReward(card)} />
                <div className="text-xs text-slate-400 mt-1 max-w-[120px] text-center">{card.effect}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={skipReward} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Skip Reward
            </button>
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => { advanceFloor(); }} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-colors">
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "rest") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
          <span className="text-5xl">🏕️</span>
          <h2 className="text-2xl font-bold text-blue-400 mt-4 mb-2">Rest Site</h2>
          <p className="text-slate-400 mb-6">Take a moment to recover your strength.</p>

          <div className="space-y-3">
            <button
              onClick={healAtRest}
              className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-2xl">💚</span>
              <div className="text-left">
                <div>Rest</div>
                <div className="text-xs font-normal text-green-200">Heal 30% HP ({Math.floor(state.playerMaxHp * 0.3)} HP)</div>
              </div>
            </button>
            <button
              onClick={() => update({ screen: "map" })}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.screen === "shop") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-5xl">🛒</span>
            <h2 className="text-2xl font-bold text-green-400 mt-2">Poké Mart</h2>
            <p className="text-slate-400 text-sm">Gold: 💰 {state.gold}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Cards for Sale</h3>
            <div className="flex gap-4 flex-wrap justify-center">
              {state.shopCards.map((card, i) => (
                <div key={card.id} className="flex flex-col items-center">
                  <Card
                    card={card}
                    affordable={state.gold >= card.price}
                    onClick={() => buyCard(i)}
                  />
                  <div className="text-yellow-400 text-xs font-bold mt-1">💰 {card.price}</div>
                </div>
              ))}
              {state.shopCards.length === 0 && <p className="text-slate-500">Sold out!</p>}
            </div>
          </div>

          <div className="mb-6 text-center">
            <button
              onClick={removeCard}
              disabled={state.gold < state.shopRemovePrice || state.deck.length <= 5}
              className={`px-6 py-3 rounded-xl font-bold transition-colors ${state.gold >= state.shopRemovePrice && state.deck.length > 5 ? "bg-red-700 hover:bg-red-600 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
            >
              🗑️ Remove a Card (💰 {state.shopRemovePrice})
            </button>
          </div>

          <div className="text-center">
            <button onClick={() => update({ screen: "map" })} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Leave Shop
            </button>
          </div>

          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-bold mb-3">Your Deck ({state.deck.length} cards)</h3>
            <div className="flex flex-wrap gap-2">
              {state.deck.map((card) => (
                <Card key={card.id} card={card} small />
              ))}
            </div>
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
          <h2 className="text-2xl font-bold text-red-400 mt-4 mb-2">Game Over</h2>
          <p className="text-slate-400 mb-2">Your run has ended on {FLOOR_NAMES[state.floor] || "Route " + (state.floor + 1)}.</p>
          <div className="text-slate-500 text-sm mb-6">
            <p>Deck size: {state.deck.length} cards</p>
            <p>Gold earned: {state.gold}</p>
          </div>
          <button
            onClick={() => update({ ...INITIAL_STATE })}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state.screen === "victory") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-yellow-500 text-center">
          <span className="text-5xl">🏆</span>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mt-4 mb-2">
            Champion!
          </h2>
          <p className="text-slate-300 mb-4">You conquered the Pokémon League!</p>
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-sm">
            <div className="flex items-center justify-center gap-3 mb-2">
              {state.playerPokemon && (
                <img src={spriteUrl} alt={state.playerPokemon.name} className="w-16 h-16" />
              )}
              <div className="text-left">
                <div className="text-white font-bold">{state.playerPokemon?.name}</div>
                <div className="text-green-400">HP: {state.playerHp}/{state.playerMaxHp}</div>
              </div>
            </div>
            <div className="text-slate-400 mt-2 space-y-1">
              <p>Final Deck: {state.deck.length} cards</p>
              <p>Gold Remaining: 💰 {state.gold}</p>
              <p>Floors Cleared: {state.floor + 1}</p>
            </div>
          </div>
          <button
            onClick={() => update({ ...INITIAL_STATE })}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-bold rounded-xl transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
