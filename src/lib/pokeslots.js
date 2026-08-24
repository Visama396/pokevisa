// PokéSlots — a slot-machine roguelite inspired by CloverPit (Panik Arcade),
// reskinned with Pokémon: the 7 reel symbols are Pokémon that stand in for
// CloverPit's Lemon/Cherry/Clover/Bell/Diamond/Treasure/Seven, the lucky
// charms are Pokémon held items, and the debt collector is Team Rocket.
//
// Everything that is pure game data/logic lives here so the React component
// (src/components/PokeSlots.jsx) only handles rendering and input:
//   - SYMBOLS / PATTERNS: the two boards you can also see in-game
//   - rollGrid / evaluateGrid: spinning and scoring a pull
//   - economy helpers: quotas, interest, tickets, shop offers, upgrades
//
// Grid layout: 5 columns x 3 rows (15 cells), same as CloverPit's machine.
// Cell index = row * GRID_COLS + col.

export const GRID_COLS = 5;
export const GRID_ROWS = 3;
export const GRID_CELLS = GRID_COLS * GRID_ROWS;

// Slot sprites are self-hosted copies of the PokeAPI sprites (public/slots/)
// so pulls never hit the network — see symbolSprite/shinySymbolSprite below.
const SLOT_SPRITES = "/slots";

// ---------------------------------------------------------------------------
// Symbols board
// ---------------------------------------------------------------------------
// Base values and weights mirror CloverPit's board (weight ≈ probability x10):
// Lemon 2/19.4%, Cherry 2/19.4%, Clover 3/14.9%, Bell 3/14.9%,
// Diamond 5/11.9%, Treasure 5/11.9%, Seven 7/7.5%.
// Each symbol IS a Pokémon (names are the official localizations extracted
// from public/pokedex.json, embedded here so no fetch/hydration is involved):
// Exeggcute (lemon-ish eggs), Cherubi, Sprigatito (clover kitten),
// Chimecho (bell), Carbink (diamond gem), Gholdengo (living treasure),
// Seviper ("SEV"en).
// Base values are hand-tuned for PokéSlots' economy (Exeggcute 4 ... Seviper
// 10) so patterns pay modest coins and quotas are cleared by stacking
// upgrades over multiple rounds. Weights ≈ CloverPit probabilities x10.
export const SYMBOLS = [
  {
    id: "lemon", pokemonId: 102, baseValue: 2, weight: 194, emoji: "🍋",
    names: { en: "Exeggcute", es: "Exeggcute", fr: "Noeunoeuf", de: "Owei", it: "Exeggcute", ja: "タマタマ", ko: "아라리", "zh-hans": "蛋蛋", "zh-hant": "蛋蛋" },
  },
  {
    id: "cherry", pokemonId: 420, baseValue: 2, weight: 194, emoji: "🍒",
    names: { en: "Cherubi", es: "Cherubi", fr: "Ceribou", de: "Kikugi", it: "Cherubi", ja: "チェリンボ", ko: "체리버", "zh-hans": "樱花宝", "zh-hant": "櫻花寶" },
  },
  {
    id: "clover", pokemonId: 906, baseValue: 3, weight: 149, emoji: "🍀",
    names: { en: "Sprigatito", es: "Sprigatito", fr: "Poussacha", de: "Felori", it: "Sprigatito", ja: "ニャオハ", ko: "나오하", "zh-hans": "新叶喵", "zh-hant": "新葉喵" },
  },
  {
    id: "bell", pokemonId: 358, baseValue: 3, weight: 149, emoji: "🔔",
    names: { en: "Chimecho", es: "Chimecho", fr: "Éoko", de: "Palimpalim", it: "Chimecho", ja: "チリーン", ko: "치렁", "zh-hans": "风铃铃", "zh-hant": "風鈴鈴" },
  },
  {
    id: "diamond", pokemonId: 703, baseValue: 5, weight: 119, emoji: "💎",
    names: { en: "Carbink", es: "Carbink", fr: "Strassie", de: "Rocara", it: "Carbink", ja: "メレシー", ko: "멜리시", "zh-hans": "小碎钻", "zh-hant": "小碎鑽" },
  },
  {
    id: "treasure", pokemonId: 1000, baseValue: 5, weight: 119, emoji: "💰",
    names: { en: "Gholdengo", es: "Gholdengo", fr: "Gromago", de: "Monetigo", it: "Gholdengo", ja: "サーフゴー", ko: "타부자고", "zh-hans": "赛富豪", "zh-hant": "賽富豪" },
  },
  {
    id: "seven", pokemonId: 336, baseValue: 7, weight: 75, emoji: "7",
    names: { en: "Seviper", es: "Seviper", fr: "Séviper", de: "Vipitis", it: "Seviper", ja: "ハブネーク", ko: "세비퍼", "zh-hans": "饭匙蛇", "zh-hant": "飯匙蛇" },
  },
];

export const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));

export function symbolSprite(id) {
  return `${SLOT_SPRITES}/sym-${SYMBOL_BY_ID[id].pokemonId}.png`;
}

// Shiny variant of the HOME render — the Golden charms' icons.
export function shinySymbolSprite(id) {
  return `${SLOT_SPRITES}/sym-shiny-${SYMBOL_BY_ID[id].pokemonId}.png`;
}

// Localized reel-symbol name (falls back to English like t() does).
export function symbolName(id, language) {
  return SYMBOL_BY_ID[id].names[language] || SYMBOL_BY_ID[id].names.en;
}

// ---------------------------------------------------------------------------
// Patterns board
// ---------------------------------------------------------------------------
// The 11 default patterns and their base multipliers are CloverPit's exact
// ones (decoded from the wiki's pattern icons on a 5x3 grid):
//   HOR x1 · VER x1 · DIAG x1 · HOR-L x2 · HOR-XL x3 · ZIG x4 · ZAG x4 ·
//   ABOVE x7 · BELOW x7 · EYE x8 · JACKPOT x10
// Sliding patterns (HOR/HOR-L/VER/DIAG/HOR-XL) match anywhere they fit;
// ZIG/ZAG/ABOVE/BELOW/EYE/JACKPOT are fixed shapes. ABOVE contains ZIG and
// BELOW contains ZAG, which matters for the containment rule below.
export const PATTERN_TYPES = [
  "HOR", "VER", "DIAG", "HOR_L", "HOR_XL",
  "ZIG", "ZAG", "ABOVE", "BELOW", "EYE", "JACKPOT",
];

export const BASE_PATTERN_MULT = {
  HOR: 1, VER: 1, DIAG: 1,
  HOR_L: 2, HOR_XL: 3,
  ZIG: 4, ZAG: 4,
  ABOVE: 7, BELOW: 7,
  EYE: 8, JACKPOT: 10,
};

const cellsOf = (...coords) => coords.map(([r, c]) => r * GRID_COLS + c);

function buildPatternInstances() {
  const list = [];
  // HOR — any 3 consecutive cells in a row
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c <= GRID_COLS - 3; c++)
      list.push({ type: "HOR", mult: 1, cells: cellsOf([r, c], [r, c + 1], [r, c + 2]) });
  // VER — any full column (3 cells)
  for (let c = 0; c < GRID_COLS; c++)
    list.push({ type: "VER", mult: 1, cells: cellsOf([0, c], [1, c], [2, c]) });
  // DIAG — any 3-cell diagonal, both directions
  for (let c = 0; c <= GRID_COLS - 3; c++) {
    list.push({ type: "DIAG", mult: 1, cells: cellsOf([0, c], [1, c + 1], [2, c + 2]) });
    list.push({ type: "DIAG", mult: 1, cells: cellsOf([2, c], [1, c + 1], [0, c + 2]) });
  }
  // HOR-L — any 4 consecutive cells in a row
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c <= GRID_COLS - 4; c++)
      list.push({ type: "HOR_L", mult: 2, cells: cellsOf([r, c], [r, c + 1], [r, c + 2], [r, c + 3]) });
  // HOR-XL — a full row of 5
  for (let r = 0; r < GRID_ROWS; r++)
    list.push({ type: "HOR_XL", mult: 3, cells: cellsOf([r, 0], [r, 1], [r, 2], [r, 3], [r, 4]) });
  // Fixed shapes (as decoded from the game's pattern icons):
  const ZIG_CELLS = cellsOf([0, 2], [1, 1], [1, 3], [2, 0], [2, 4]);          // ..#.. / .#.#. / #...#
  const ZAG_CELLS = cellsOf([0, 0], [0, 4], [1, 1], [1, 3], [2, 2]);          // #...# / .#.#. / ..#..
  const BOTTOM_ROW = cellsOf([2, 0], [2, 1], [2, 2], [2, 3], [2, 4]);
  const TOP_ROW = cellsOf([0, 0], [0, 1], [0, 2], [0, 3], [0, 4]);
  list.push({ type: "ZIG", mult: 4, cells: ZIG_CELLS });
  list.push({ type: "ZAG", mult: 4, cells: ZAG_CELLS });
  list.push({ type: "ABOVE", mult: 7, cells: [...ZIG_CELLS, ...BOTTOM_ROW] }); // ..#.. / .#.#. / #####
  list.push({ type: "BELOW", mult: 7, cells: [...TOP_ROW, ...ZAG_CELLS] });    // ##### / .#.#. / ..#..
  list.push({
    type: "EYE", mult: 8,
    cells: cellsOf([0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3]),
  });                                                                          // .###. / ##.## / .###.
  list.push({
    type: "JACKPOT", mult: 10,
    cells: Array.from({ length: GRID_CELLS }, (_, i) => i),
  });
  return list;
}

export const PATTERN_INSTANCES = buildPatternInstances();

// Canonical icon per pattern type for the Patterns Board UI (mirrors the
// in-game icons): one representative placement of each shape.
export const PATTERN_ICONS = Object.fromEntries(
  PATTERN_TYPES.map((type) => [type, PATTERN_INSTANCES.find((p) => p.type === type).cells])
);

// ---------------------------------------------------------------------------
// Run state factory + derived values
// ---------------------------------------------------------------------------

// Deterministic face shown on the machine before the first pull. A random
// starter grid can't be used here: SSR and client hydration would each roll
// their own grid and React would flag an attribute mismatch. This fixed
// arrangement is a harmless near-miss tease (two sevens, no pattern).
const STARTER_GRID = [
  "lemon", "cherry", "clover", "bell", "diamond",
  "lemon", "cherry", "clover", "seven", "seven",
  "diamond", "bell", "bell", "cherry", "treasure",
];

export function createRunState() {
  return {
    coins: START_COINS,
    debt: START_DEBT,
    tickets: 0,
    round: 1, // round WITHIN the current quota (1..ROUNDS_PER_QUOTA), resets each cycle
    // Total rounds played across all quotas — not shown directly, but charms
    // can key effects off it (e.g. "every N rounds").
    totalRounds: 0,
    cycle: 1, // which quota you're on (quota grows per cycle)
    roundsLeft: ROUNDS_PER_QUOTA, // rounds remaining to clear the current quota
    // Every round starts at the pull-choice state (awaitingChoice): buy 3 or
    // 7 pulls from the "Pulls left" status card before touching the lever.
    pullsLeft: 0,
    // Coins already deposited toward the CURRENT quota. Partial ATM payments
    // accumulate here (and shrink the debt) until the quota is crossed, so a
    // quota can be cleared with several smaller deposits — reset each cycle.
    quotaPaid: 0,
    lastMode: null, // 3 | 7 — set when the current round's pulls are picked
    awaitingChoice: true,
    // Pending Luck for the next spin (Amulet Coin / Spell Tag). Consumed by
    // rollGrid() and reset after every pull — an invisible board modifier.
    luck: 0,
    // Cleanse Tag stacks: every symbol's coin value rises by this amount
    // (one stack on purchase, one more per pull that lands 5+ patterns).
    cleanseStacks: 0,
    // Golden charm / Griseous Orb growth: permanent per-run bumps to symbol
    // values and pattern multipliers earned by scoring modified cells.
    goldenLevels: {},
    chainLevels: {},
    // Cell indices carrying the Golden/Chain modifiers on the CURRENT grid
    // (re-rolled every pull by rollModifiers; used for scoring and rendering).
    goldenCells: [],
    chainCells: [],
    // Shop rerolls bought this cycle; drives the escalating rerollCost().
    rerolls: 0,
    grid: [...STARTER_GRID],
    charms: [],
    upgrades: emptyUpgrades(),
    shop: null, // offers generated lazily by the component
    stats: { totalEarned: 0, biggestWin: 0, pullsUsed: 0, jackpots: 0 },
  };
}

export const START_COINS = 70;
export const START_DEBT = 50000;
export const INTEREST_RATE = 0.08;
export const MAX_CHARMS = 8;

// Rerolling the Rotom Phone's offers costs COINS (not tickets) and the price
// doubles with every reroll inside the current quota cycle — it resets back to
// the base cost when a quota is cleared, together with the shop itself.
export const REROLL_BASE_COST = 3;
export const REROLL_COST_GROWTH = 2;
export function rerollCost(state) {
  return REROLL_BASE_COST * Math.pow(REROLL_COST_GROWTH, state.rerolls || 0);
}

// ---------------------------------------------------------------------------
// Rounds & quotas
// ---------------------------------------------------------------------------
// A QUOTA spans ROUNDS_PER_QUOTA rounds. Each round the player buys 3 or 7
// pulls — entry costs a share of the CURRENT quota (3 pulls = 5%, 7 = 10%;
// see roundCost) and earns 4 / 2 tickets. Patterns pay coins only; tickets
// also come from clearing a quota early (see quotaClearBonus).
// Missing the last round's deadline is game over (Focus Band halves once).
export const ROUNDS_PER_QUOTA = 3;

// Entry costs are part of the mode: 3 pulls cost 5% of the quota, 7 pulls
// cost 10% (a fat-spin premium). There is NO credit anymore: a pick the
// player can't cover with coins can still be entered by spending tickets
// instead (see ROUND_TICKET_COSTS, no rewards earned that way), and someone
// who can't pay either loses the run on the spot (checked by PokeSlots.jsx
// whenever the pull picker opens).
export const ROUND_MODES = {
  3: { pulls: 3, costPct: 0.03, tickets: 8 },
  7: { pulls: 7, costPct: 0.065, tickets: 3 },
};

// Ticket price of a round when the player can't (or won't) pay its coin fee.
// Paying with tickets does NOT earn the mode's ticket reward.
export const ROUND_TICKET_COSTS = { 3: 1, 7: 2 };

// Reward table for clearing a quota early — see quotaClearBonus below.

function emptyUpgrades() {
  return {
    global: 0,
    symbol: Object.fromEntries(SYMBOLS.map((s) => [s.id, 0])),
    pattern: Object.fromEntries(PATTERN_TYPES.map((p) => [p, 0])),
  };
}

// The installment due within ROUNDS_PER_QUOTA rounds. Escalates geometrically
// per CYCLE and without limit — overpaying shrinks the principal, which
// shrinks the interest charged at each deadline. Clearing the whole debt is
// still how you escape.
export function quotaForCycle(cycle) {
  const raw = 100 * Math.pow(1.32, cycle - 1);
  return Math.max(5, Math.round(raw / 5) * 5);
}

export function currentQuota(state) {
  return quotaForCycle(state.cycle);
}

// Entry price of a round mode: a share of the CURRENT quota (3 pulls = 5%,
// 7 = 10%), so the fee scales with the debt you're chipping away at.
// Used by the pull picker (PokeSlots.jsx chooseRoundMode), the ATM's MAX
// clamp and the help text.
export function roundCost(state, mode) {
  const pct = ROUND_MODES[mode]?.costPct ?? 0;
  return Math.max(1, Math.ceil(currentQuota(state) * pct));
}

// Early-clear bonus: clearing a quota while rounds are still left pays 7% of
// the current quota plus tickets — a flat 4 and one extra per remaining
// round. Paying right on the deadline (0 rounds left) is not early and earns
// nothing extra. Lucky Egg's ticketMult is applied by the caller.
export const QUOTA_CLEAR_BONUS_PCT = 0.07;
export const QUOTA_CLEAR_BASE_TICKETS = 4;
export function quotaClearBonus(state) {
  if ((state.roundsLeft || 0) <= 0) return { coins: 0, tickets: 0 };
  return {
    coins: Math.floor(currentQuota(state) * QUOTA_CLEAR_BONUS_PCT),
    tickets: QUOTA_CLEAR_BASE_TICKETS + state.roundsLeft,
  };
}

// Coin ceiling for the ATM's MAX shortcut (and its default slider value):
//   - with enough coins, exactly enough to finish the CURRENT quota —
//     dumping the whole balance would just sit there past the quota;
//   - otherwise everything EXCEPT one more round's entry fee, keeping the
//     priciest mode that still leaves some coins in hand (7-pull if it
//     fits strictly, else 3-pull, else nothing to reserve). Depositing
//     your last coin would lock you out of spinning until the deadline.
export function atmMaxDeposit(state) {
  const coins = state.coins;
  const remaining = Math.max(0, currentQuota(state) - (state.quotaPaid || 0));
  if (coins >= remaining) return Math.min(remaining, state.debt);
  const costs = Object.keys(ROUND_MODES)
    .map(Number)
    .map((mode) => roundCost(state, mode))
    .sort((a, b) => b - a);
  const reserve = costs.find((cost) => cost < coins) || 0;
  return coins - reserve;
}

// Interest charged on whatever debt remains after a deadline payment.
export function interestForDebt(debt) {
  return Math.ceil(debt * INTEREST_RATE);
}

// ---------------------------------------------------------------------------
// Charms — Pokémon held items standing in for CloverPit's lucky charms
// ---------------------------------------------------------------------------
// Passive effects read by symbolValue/patternMult/rollWeights/resolvePull.
// focus-band is the exception: it is consumed to survive one missed deadline.
// `cost` is the FIXED ticket price in the Rotom Phone shop; `file` is a
// PokeAPI item sprite; `emoji` is the fallback if it 404s.
export const CHARMS = {
  "silk-scarf": {
    cost: 2, file: "silk-scarf.png", emoji: "🧣",
    bonusValues: { lemon: 1, cherry: 1 },
  },
  "lucky-egg": {
    cost: 5, file: "lucky-egg.png", emoji: "🥚",
    ticketMult: 2, // doubles the tickets from clearing a quota
  },
  "choice-specs": {
    cost: 6, file: "choice-specs.png", emoji: "🕶️",
    patternBonus: { DIAG: 2, ZIG: 2, ZAG: 2 },
  },
  "muscle-band": {
    cost: 6, file: "muscle-band.png", emoji: "💪",
    patternBonus: { HOR: 2, HOR_L: 2, HOR_XL: 2 },
  },
  "focus-band": {
    cost: 7, file: "focus-band.png", emoji: "🎗️",
    focusBand: true,
  },
  "luck-incense": {
    cost: 5, file: "luck-incense.png", emoji: "🪔",
    payoutMult: 1.3,
  },
  "wide-lens": {
    cost: 7, file: "wide-lens.png", emoji: "🔍",
    // Carbink / Gholdengo / Seviper drop ~60% more often
    symbolWeightMult: { diamond: 1.6, treasure: 1.6, seven: 1.6 },
  },
  "metal-coat": {
    cost: 6, file: "metal-coat.png", emoji: "🧲",
    bonusValues: { bell: 2, diamond: 2 },
  },
  "amulet-coin": {
    cost: 1, file: "amulet-coin.png", emoji: "🪙",
    amuletCoin: true, // 10% chance per pull: refund the pull + Luck for it
  },
  "super-repel": {
    cost: 6, file: "super-repel.png", emoji: "🚫",
    removeSymbols: ["lemon"], // Exeggcute stops appearing entirely
  },
  "magnet": {
    cost: 2, file: "magnet.png", emoji: "🧲",
    magnet: true, // nudges one cell toward the grid's majority symbol
  },
  "gold-bottle-cap": {
    cost: 8, file: "gold-bottle-cap.png", emoji: "🧴",
    bonusValues: { seven: 4 },
  },
  "big-mushroom": {
    cost: 4, file: "big-mushroom.png", emoji: "🍄",
    // Exeggcute / Cherubi / Sprigatito drop ~50% more often
    symbolWeightMult: { lemon: 1.5, cherry: 1.5, clover: 1.5 },
  },
  "pokedoll": {
    cost: 4, file: "poke-doll.png", emoji: "🧸",
    pokedoll: true, // 3+ patterns in one pull pays out the current interest
  },
  "cleanse-tag": {
    cost: 3, file: "cleanse-tag.png", emoji: "🏷️",
    cleanseTag: true, // every symbol is worth +1; +1 more per 5-pattern pull
  },
  "spell-tag": {
    cost: 3, file: "spell-tag.png", emoji: "👻",
    spellTag: true, // +7 Luck on the last pull of each round
  },
  // Golden charms: each spin, cells of their symbol may turn GOLDEN. Scoring
  // a pattern with a golden cell permanently raises that symbol's base value.
  // Their icon is the symbol's shiny Pokémon HOME render (`sprite` field).
  "golden-lemon": { cost: 1, sprite: shinySymbolSprite("lemon"), emoji: "✨🍋", goldenSymbol: "lemon" },
  "golden-cherry": { cost: 1, sprite: shinySymbolSprite("cherry"), emoji: "✨🍒", goldenSymbol: "cherry" },
  "golden-clover": { cost: 2, sprite: shinySymbolSprite("clover"), emoji: "✨🍀", goldenSymbol: "clover" },
  "golden-bell": { cost: 2, sprite: shinySymbolSprite("bell"), emoji: "✨🔔", goldenSymbol: "bell" },
  "golden-diamond": { cost: 3, sprite: shinySymbolSprite("diamond"), emoji: "✨💎", goldenSymbol: "diamond" },
  "golden-treasure": { cost: 3, sprite: shinySymbolSprite("treasure"), emoji: "✨💰", goldenSymbol: "treasure" },
  "golden-seven": { cost: 4, sprite: shinySymbolSprite("seven"), emoji: "✨7️⃣", goldenSymbol: "seven" },
  // Griseous Orb: rares may turn CHAINED; scoring a pattern with a chained
  // cell permanently raises that pattern type's multiplier.
  "griseous-orb": {
    cost: 4, file: "griseous-orb.png", emoji: "🔮",
    chainSymbols: ["diamond", "treasure", "seven"],
  },
};

// Modifier chances per cell, rolled every spin (see rollModifiers).
export const GOLDEN_CHANCE = 0.2;
export const CHAIN_CHANCE = 0.12;

// Roll the Golden/Chain modifiers for a freshly landed grid: returns the
// indices of the cells carrying each modifier (stored on the run state so
// both scoring and rendering read the same flags).
export function rollModifiers(state, grid) {
  const goldenOf = {};
  for (const c of state.charms) {
    const sym = CHARMS[c].goldenSymbol;
    if (sym) goldenOf[sym] = true;
  }
  const chainSyms = new Set();
  for (const c of state.charms) for (const s of CHARMS[c].chainSymbols || []) chainSyms.add(s);
  const golden = [];
  const chain = [];
  for (let i = 0; i < grid.length; i++) {
    if (goldenOf[grid[i]] && Math.random() < GOLDEN_CHANCE) golden.push(i);
    if (chainSyms.has(grid[i]) && Math.random() < CHAIN_CHANCE) chain.push(i);
  }
  return { golden, chain };
}

// Amulet Coin trigger: chance and Luck granted to that spin when it fires.
export const AMULET_COIN_CHANCE = 0.1;
export const AMULET_COIN_LUCK = 4;
// Spell Tag: Luck granted to the last pull of a round.
export const SPELL_TAG_LUCK = 7;

// Interest the ATM pays on the CURRENT deposit (quotaPaid) after every round;
// Pokédoll pays out the same amount whenever 3+ patterns hit in one pull.
export const DEPOSIT_INTEREST_RATE = 0.07;
export function depositInterest(state) {
  return Math.floor((state.quotaPaid || 0) * DEPOSIT_INTEREST_RATE);
}

export const CHARM_IDS = Object.keys(CHARMS);

// Current coin value of a symbol, including upgrades, charm bonuses, the
// Cleanse Tag's all-symbol bonus and Golden charm growth.
export function symbolValue(state, symId) {
  let value = SYMBOL_BY_ID[symId].baseValue + (state.upgrades.symbol[symId] || 0) + (state.cleanseStacks || 0) + (state.goldenLevels?.[symId] || 0);
  for (const charmId of state.charms) {
    const bonus = CHARMS[charmId].bonusValues?.[symId];
    if (bonus) value += bonus;
  }
  return value;
}

// Current multiplier of a pattern type, including upgrades, charm bonuses and
// Griseous Orb chain growth.
export function patternMult(state, type) {
  let mult = BASE_PATTERN_MULT[type] + (state.upgrades.pattern[type] || 0) + (state.chainLevels?.[type] || 0);
  for (const charmId of state.charms) {
    const bonus = CHARMS[charmId].patternBonus?.[type];
    if (bonus) mult += bonus;
  }
  return mult;
}

// Drop weights for a spin, after Repel (removal) and the charms' per-symbol
// weight multipliers (Wide Lens boosts the rares, Big Mushroom the commons).
export function rollWeights(state) {
  const removed = new Set(state.charms.flatMap((c) => CHARMS[c].removeSymbols || []));
  return SYMBOLS.map((s) => {
    if (removed.has(s.id)) return 0;
    let weight = s.weight;
    for (const c of state.charms) {
      const mult = CHARMS[c].symbolWeightMult?.[s.id];
      if (mult) weight *= mult;
    }
    return weight;
  });
}

function weightedPick(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return SYMBOLS[i].id;
  }
  return SYMBOLS[SYMBOLS.length - 1].id; // numeric edge case
}

export function rollGrid(state) {
  const weights = rollWeights(state);
  const grid = Array.from({ length: GRID_CELLS }, () => weightedPick(weights));
  // Luck (Amulet Coin / Spell Tag): guarantees that many cells show ONE
  // randomly chosen symbol. Positions stay random, so high Luck stacks the
  // board without promising an aligned pattern.
  const luck = Math.min(Math.floor(state.luck || 0), GRID_CELLS);
  if (luck > 0) {
    const symId = weightedPick(weights);
    const idxs = grid.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    for (const i of idxs.slice(0, luck)) grid[i] = symId;
  }
  // Magnet charm: convert one off-symbol cell to the grid's majority symbol,
  // nudging half-finished patterns toward completion.
  if (state.charms.some((c) => CHARMS[c].magnet)) {
    const counts = {};
    for (const sym of grid) counts[sym] = (counts[sym] || 0) + 1;
    const majority = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const offIdx = grid.map((sym, i) => (sym === majority ? -1 : i)).filter((i) => i >= 0);
    if (offIdx.length > 0 && counts[majority] > 1) {
      grid[offIdx[Math.floor(Math.random() * offIdx.length)]] = majority;
    }
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
// A pattern instance scores when every cell shows the same symbol. Following
// CloverPit's rule, smaller matched patterns are swallowed by larger matched
// patterns that contain them (HOR never pays inside a HOR-XL, ZIG never pays
// inside ABOVE...) — except JACKPOT, which pays alongside everything else.
//
// Payout per scored instance = symbol value x cell count x pattern multiplier,
// then global multipliers from Amulet Coin / Luck Incense apply to the total.
export function evaluateGrid(state, grid) {
  const matched = [];
  for (const inst of PATTERN_INSTANCES) {
    const sym = grid[inst.cells[0]];
    if (inst.cells.every((cell) => grid[cell] === sym)) {
      matched.push({ ...inst, symbol: sym });
    }
  }
  // Largest patterns first: a pattern is swallowed by an already-scored
  // larger one that contains it (HOR inside HOR-XL, ZIG inside ABOVE, ...).
  // JACKPOT ignores the rule in both directions: it always scores and never
  // suppresses the smaller patterns underneath it.
  matched.sort((a, b) => b.cells.length - a.cells.length);

  const scoredAreas = [];
  const scored = [];
  for (const m of matched) {
    if (m.type !== "JACKPOT") {
      const contained = scoredAreas.some((area) =>
        m.cells.every((cell) => area.has(cell))
      );
      if (contained) continue;
    }
    scored.push(m);
    if (m.type !== "JACKPOT") scoredAreas.push(new Set(m.cells));
  }

  let raw = 0;
  for (const m of scored) {
    raw += symbolValue(state, m.symbol) * m.cells.length * patternMult(state, m.type);
  }
  // Global Symbols Multiplier (repeatable shop upgrade, x1.5 each level)
  // stacked with Luck Incense.
  let payoutMult = Math.pow(1.5, state.upgrades.global || 0);
  for (const charmId of state.charms) {
    if (CHARMS[charmId].payoutMult) payoutMult *= CHARMS[charmId].payoutMult;
  }
  const payout = Math.floor(raw * payoutMult);

  const jackpot = scored.some((m) => m.type === "JACKPOT");
  return { scored, payout, jackpot };
}

// ---------------------------------------------------------------------------
// Shop — Rotom Phone store (charms + repeatable permanent upgrades)
// ---------------------------------------------------------------------------
// Offers mix unowned charms with stackable upgrades: "+1 symbol value" and
// "+1 pattern multiplier". Prices scale with the purchase count (upgrades)
// and with the current round (everything), like CloverPit's escalating store.

export function upgradeCost(kind, count) {
  const base = kind === "symbol" ? 5 : kind === "pattern" ? 6 : 8;
  const growth = kind === "global" ? 1.6 : 1.6;
  return Math.ceil(base * Math.pow(growth, count));
}

export function charmCost(charmId) {
  return CHARMS[charmId].cost;
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length > 0) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

// An offer is either { kind: "charm", id, cost } or
// { kind: "upgrade", target: "symbol:<id>" | "pattern:<TYPE>" | "global", cost }.
export function generateShopOffers(state) {
  const unowned = CHARM_IDS.filter((id) => !state.charms.includes(id));
  const charmOffers = pickRandom(unowned, 1).map((id) => ({
    kind: "charm",
    id,
    cost: charmCost(id),
  }));
  // The Symbols Multiplier is the machine's core dial, so it is ALWAYS in
  // stock next to two rotating upgrades.
  const globalOffer = {
    kind: "upgrade",
    target: "global",
    cost: upgradeCost("global", state.upgrades.global || 0),
  };
  const others = [];
  for (const sym of SYMBOLS) {
    others.push({
      kind: "upgrade",
      target: `symbol:${sym.id}`,
      cost: upgradeCost("symbol", state.upgrades.symbol[sym.id]),
    });
  }
  for (const type of PATTERN_TYPES) {
    others.push({
      kind: "upgrade",
      target: `pattern:${type}`,
      cost: upgradeCost("pattern", state.upgrades.pattern[type]),
    });
  }
  const upgradeOffers = [globalOffer, ...pickRandom(others, 2).map((o) => ({ ...o }))];
  return [...charmOffers, ...upgradeOffers];
}

export function rerollShop(state) {
  return generateShopOffers(state);
}
