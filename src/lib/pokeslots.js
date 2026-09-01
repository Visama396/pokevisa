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
  // Ditto: wildcard symbol that counts as any other symbol in pattern matching
  // (max 1 per pattern). baseValue 0 → hidden from the symbols chart.
  {
    id: "ditto", pokemonId: 132, baseValue: 0, weight: 20, emoji: "🫠", hideInChart: true,
    names: { en: "Ditto", es: "Ditto", fr: "Métamorph", de: "Ditto", it: "Ditto", ja: "メタモン", ko: "메타몽", "zh-hans": "百变怪", "zh-hant": "百變怪" },
  },
  // Giratina: danger symbol. Appears only after clearing Quota 666 (cycle 4+).
  // HOR or DIAG of Giratinas = instant loss. Max 3 per pull. baseValue 0.
  {
    id: "giratina", pokemonId: 487, baseValue: 0, weight: 10, emoji: "👻", hideInChart: true,
    names: { en: "Giratina", es: "Giratina", fr: "Giratina", de: "Giratina", it: "Giratina", ja: "ギラティナ", ko: "기라티나", "zh-hans": "骑拉帝纳", "zh-hant": "騎拉帝納" },
  },
];

export const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));

export function symbolSprite(id) {
  return `${SLOT_SPRITES}/sym-${SYMBOL_BY_ID[id].pokemonId}.png`;
}

// Shiny variant of the HOME render — the Shiny charms' icons.
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
    tickets: START_TICKETS,
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
    // Lifetime deposit total across ALL quotas — never resets. It is the base
    // for the 7% interest paid after every round (see depositInterest).
    deposited: 0,
    // How many debts were fully paid off this run — drives the escalated next
    // debt (nextDebt) and the +1 charm slot per debt (charmSlots).
    debtsCleared: 0,
    lastMode: null, // 3 | 7 — set when the current round's pulls are picked
    awaitingChoice: true,
    // Pending Luck for the next spin (Amulet Coin / Spell Tag). Consumed by
    // rollGrid() and reset after every pull — an invisible board modifier.
    luck: 0,
    // Cleanse Tag stacks: every symbol's coin value rises by this amount
    // (one stack on purchase, one more per pull that lands 5+ patterns).
    cleanseStacks: 0,
    // Shiny charm / Griseous Orb growth: permanent per-run bumps to symbol
    // values and pattern multipliers earned by scoring modified cells.
    goldenLevels: {},
    chainLevels: {},
    // Cell indices carrying the Shiny/Chain modifiers on the CURRENT grid
    // (re-rolled every pull by rollModifiers; used for scoring and rendering).
    goldenCells: [],
    chainCells: [],
    // Shop rerolls bought this RUN (never resets); drives rerollCost().
    rerolls: 0,
    // Permanent per-run symbol boosts expressed in whole base values — Black
    // Sludge feeds them whenever a charm is discarded, Parcel feeds them on a
    // random empty pull (both applied by discardCharm / PokeSlots.jsx).
    permLevels: {},
    // Pull-to-pull memory for the guarantee/comeback charms:
    // lastPullEmpty — Star Piece: previous pull hit no pattern at all
    // emptyStreak / metronomeFires — Metronome: consecutive empty pulls and
    //   how many times it already fired on this streak (+2 Luck per fire)
    // bigDrought — Deep Sea Tooth: pulls since the last 5+ cell pattern
    lastPullEmpty: false,
    emptyStreak: 0,
    metronomeFires: 0,
    bigDrought: 0,
    // Bright Powder counts charm activations within the current round and
    // pays Luck +7 once it reaches 5 (reset when a new round is bought).
    itemTriggers: 0,
    brightPowderFired: false,
    // Lucky Egg: 3 consecutive pulls scoring a rare (Carbink/Gholdengo/Seviper)
    // sets luckyEggPending, forcing EYE on the next pull.
    luckyEggStreak: 0,
    luckyEggPending: false,
    // --- Third-wave charm state -------------------------------------------
    // Choice Specs: permanent per-run pattern boosts in whole base mults.
    permPatternLevels: {},
    // Contest scarves: activation counters (red/blue wear out at maxFires).
    scarfFires: {},
    // Green/Yellow scarf Luck bonuses (quota-scoped) and the Pink Scarf's
    // per-quota reroll counter; scarfFired = luck granted by scarves on the
    // CURRENT pull (read by resolvePull, e.g. Green Scarf growth).
    greenScarfBonus: 0,
    yellowScarfBonus: 0,
    rerollsThisCycle: 0,
    scarfFired: null,
    // Round-scoped temp boosts (reset when a round is bought): Adamant Mint
    // stacks base values on symbols, Sassy Mint doubles them, Electric Seed
    // stacks base mults on patterns, Psychic Seed doubles them. Misty Seed
    // doubles patterns permanently; Grassy Seed feeds grassyLevels (+1 per
    // cleared quota, alternating Symbols/Patterns via grassyTurns).
    adamantStacks: 0,
    sassyDoubles: 0,
    electricBoost: 0,
    psychicDoubles: 0,
    mistyDoubles: 0,
    grassyLevels: { global: 0, pattern: 0 },
    grassyTurns: 0,
    // Leftovers: completed rounds since purchase — self-discards at 10.
    leftoversRounds: 0,
    // Poffin Case is offered only once per run, even if sold.
    poffinCaseBought: false,
    grid: [...STARTER_GRID],
    charms: [],
    upgrades: emptyUpgrades(),
    shop: null, // offers generated lazily by the component
    stats: { totalEarned: 0, biggestWin: 0, pullsUsed: 0, jackpots: 0 },
  };
}

export const START_COINS = 70;
export const START_DEBT = 50000;
// Runs begin with enough tickets to buy a cheap charm or an upgrade.
export const START_TICKETS = 0;
// Clearing a debt doesn't end the run: the loan is replaced by a bigger one
// (×DEBT_GROWTH each time) and the charm tray gains +1 slot per debt paid,
// so runs become endless escalations instead of a single win.
export const DEBT_GROWTH = 2;
export function nextDebt(debtsCleared) {
  return Math.ceil(START_DEBT * Math.pow(DEBT_GROWTH, debtsCleared));
}
// Charm tray capacity: base slots, plus one per cleared debt, plus one when
// the Poffin Case is owned (which itself takes no space — see buyOffer).
export const CHARM_SLOTS_BASE = 8;
export function charmSlots(state) {
  return CHARM_SLOTS_BASE + (state.debtsCleared || 0) + (state.charms.includes("poffin-case") ? 1 : 0);
}

// Rerolling the Rotom Phone's offers costs COINS (not tickets) and the price
// doubles with every reroll — the counter NEVER resets (not between rounds,
// not between quotas), so rerolling only ever gets pricier during a run.
export const REROLL_BASE_COST = 3;
export const REROLL_COST_GROWTH = 2;
export function rerollCost(state) {
  return REROLL_BASE_COST * Math.pow(REROLL_COST_GROWTH, state.rerolls || 0);
}

// ---------------------------------------------------------------------------
// Rounds & quotas
// ---------------------------------------------------------------------------
// A QUOTA spans ROUNDS_PER_QUOTA rounds. Each round the player buys 3 or 7
// pulls — entry costs a fixed coin fee that grows with every quota (see
// ROUND_COST_TABLE / roundCost) and earns 8 / 3 tickets. Patterns pay coins
// only; tickets also come from clearing a quota early (see quotaClearBonus).
// Missing the last round's deadline is game over (Focus Sash postpones it
// once, Focus Band halves once).
export const ROUNDS_PER_QUOTA = 3;

// Entry fees are FIXED per quota (not a share of it): the 7-pull fee follows
// ROUND_COST_TABLE, the 3-pull fee is ~35% of it. There is NO credit: a pick
// the player can't cover with coins can still be entered by spending tickets
// instead (see ROUND_TICKET_COSTS, no rewards earned that way), and someone
// who can't pay either loses the run on the spot (checked by PokeSlots.jsx
// whenever the pull picker opens).
export const ROUND_MODES = {
  3: { pulls: 3, tickets: 6 },
  7: { pulls: 7, tickets: 3 },
};

// 7-pull entry fee per quota index; beyond the table the fee climbs +10%
// per quota (see roundCost).
export const ROUND_COST_TABLE = [7, 14, 28, 42, 56, 140, 168, 196, 224, 756, 1260, 1386, 1500];
export const THREE_PULL_COST_PCT = 0.35;
export const ROUND_COST_GROWTH = 1.1;

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

// The installment due within ROUNDS_PER_QUOTA rounds. Follows a steep
// exponential table (CloverPit's curve); beyond the last entry it keeps
// growing ×10 per quota without limit. Overpaying shrinks the debt principal,
// which shrinks the interest charged at each deadline. Clearing the whole
// debt is still how you escape.
export const QUOTA_TABLE = [
  75, 200, 666, 2222, 12500, 33333, 66666, 200000, 1000000, 6000000,
  144000000, 13800000000, 2e13, 2e17, 2e22,
];
export const QUOTA_TABLE_GROWTH = 10;
export function quotaForCycle(cycle) {
  if (cycle <= QUOTA_TABLE.length) return QUOTA_TABLE[cycle - 1];
  return QUOTA_TABLE[QUOTA_TABLE.length - 1] * Math.pow(QUOTA_TABLE_GROWTH, cycle - QUOTA_TABLE.length);
}

export function currentQuota(state) {
  return quotaForCycle(state.cycle);
}

// Entry price of a round mode: the 7-pull fee is ROUND_COST_TABLE indexed by
// the current quota (then +10% per quota beyond the table); the 3-pull fee is
// ~35% of that. Used by the pull picker (PokeSlots.jsx chooseRoundMode), the
// ATM's MAX clamp and the help text.
export function roundCost(state, mode) {
  const cycle = state.cycle;
  const last = ROUND_COST_TABLE.length;
  const cost7 =
    cycle <= last
      ? ROUND_COST_TABLE[cycle - 1]
      : Math.ceil(ROUND_COST_TABLE[last - 1] * Math.pow(ROUND_COST_GROWTH, cycle - last));
  if (Number(mode) === 7) return cost7;
  return Math.max(1, Math.round(cost7 * THREE_PULL_COST_PCT));
}

// Early-clear bonus: clearing a quota while rounds are still left pays 7% of
// the current quota plus 4 tickets per remaining round. Paying right on the
// deadline (0 rounds left) is not early and earns nothing extra. Lucky Egg's
// ticketMult is applied by the caller.
export const QUOTA_CLEAR_BONUS_PCT = 0.07;
export const QUOTA_CLEAR_BASE_TICKETS = 4;
export function quotaClearBonus(state) {
  const roundsLeft = state.roundsLeft || 0;
  return {
    coins: roundsLeft > 0 ? Math.floor(currentQuota(state) * QUOTA_CLEAR_BONUS_PCT) : 0,
    tickets: QUOTA_CLEAR_BASE_TICKETS + 2 * roundsLeft,
  };
}

// Coin ceiling for the ATM's MAX shortcut (and its default slider value):
//   - with enough coins, exactly enough to finish the CURRENT quota —
//     dumping the whole balance would just sit there past the quota;
//   - otherwise everything EXCEPT one more round's entry fee, keeping the
//     priciest mode that still leaves some coins in hand (7-pull if it
//     fits strictly, else 3-pull, else nothing to reserve). Depositing
//     your last coin would lock you out of spinning until the deadline.
// The ceiling is NOT clamped by the lifetime debt: quotas outgrow the
// START_DEBT floor (cycle 7 = 66666 > 50000), so a player can run their
// whole debt down to 0 mid-cycle while still owing quota — deposits must
// keep working to finish it.
export function atmMaxDeposit(state) {
  const coins = state.coins;
  const remaining = Math.max(0, currentQuota(state) - (state.quotaPaid || 0));
  if (coins >= remaining) return remaining;
  const costs = Object.keys(ROUND_MODES)
    .map(Number)
    .map((mode) => roundCost(state, mode))
    .sort((a, b) => b - a);
  const reserve = costs.find((cost) => cost < coins) || 0;
  return Math.min(coins - reserve, remaining);
}

// ---------------------------------------------------------------------------
// Charms — Pokémon held items standing in for CloverPit's lucky charms
// ---------------------------------------------------------------------------
// Passive effects read by symbolValue/patternMult/rollWeights/resolvePull.
// focus-band is the exception: it is consumed to survive one missed deadline.
// `cost` is the FIXED ticket price in the Rotom Phone shop; `file` is a
// PokeAPI item sprite; `emoji` is the fallback if it 404s.

// --- Third-wave charm tunables --------------------------------------------
// Drives key off the lifetime pull counter: every 7th pull.
export const DRIVE_EVERY_PULLS = 7;
export const SHOCK_DRIVE_LUCK = 7;
export const CHILL_DRIVE_EXTRA_PULLS = 2;
// Choice Scarf / Choice Specs: fire when the empty-pull streak hits exactly 3.
export const CHOICE_STREAK = 3;
// Bold Mint: +1 Symbols Multiplier level per N tickets owned.
export const BOLD_MINT_TICKETS = 5;
// Adamant Mint: patterns beyond the Nth in one pull each feed a round-scoped
// base-value stack on every symbol.
export const ADAMANT_MINT_FREE_PATTERNS = 2;
// Sassy Mint: N+ patterns in one pull double every symbol until round end.
export const SASSY_MINT_PATTERNS = 5;
// Electric Seed: a scored pattern with 4+ cells feeds a round-scoped
// +base-mult stack on every pattern; Psychic Seed needs 5+ cells and doubles.
export const ELECTRIC_SEED_MIN_CELLS = 4;
export const PSYCHIC_SEED_MIN_CELLS = 5;
// Green Scarf feeds +STEP on every pattern with base mult >= MIN it sees
// while firing; Pink grows +STEP per shop reroll of the current quota;
// Yellow starts each quota at STEP x rounds skipped on the previous quota.
export const GREEN_SCARF_PATTERN_MULT = 3;
export const GREEN_SCARF_STEP = 3;
export const PINK_SCARF_STEP = 2;
export const YELLOW_SCARF_STEP = 4;
// Leftovers self-discards after this many completed rounds.
export const LEFTOVERS_ROUNDS = 10;
// Poison Barb: this many Sevipers on the grid all turn Shiny.
export const POISON_BARB_SEVENS = 7;
// Giratina: max allowed on a single grid; only spawns after clearing Quota 666.
export const GIRATINA_MAX_PER_PULL = 3;
export const GIRATINA_UNLOCK_CYCLE = 4; // cycle >= this → Giratina can appear
// The Symbols Multiplier (global payout dial, shown under the boards):
// +1 per level — shop upgrades + Bold Mint + Grassy Seed levels.
export const SYMBOLS_MULT_STEP = 1;

export const CHARMS = {
  "silk-scarf": {
    cost: 2, file: "silk-scarf.png", emoji: "🧣",
    bonusValues: { lemon: 1, cherry: 1 },
  },
  "lucky-egg": {
    cost: 2, file: "lucky-egg.png", emoji: "🥚",
    luckyEgg: true, // 3 consecutive rare-scored pulls → next pull guaranteed EYE
  },
  // Choice Specs (rework): 3 consecutive empty pulls permanently raise every
  // pattern by its own base multiplier (permPatternLevels).
  "choice-specs": {
    cost: 2, file: "choice-specs.png", emoji: "🕶️",
    choiceSpecs: true,
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
    cost: 5, file: "wide-lens.png", emoji: "🔍",
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
    trait: "random", // "Triggers Randomly" — shown colored in tooltips
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
    bonusValues: { seven: 5 },
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
    traitLabel: "Symbols Multiplier +1",
  },
  "spell-tag": {
    cost: 3, file: "spell-tag.png", emoji: "👻",
    spellTag: true, // +7 Luck on the last pull of each round
  },
  // Shiny charms: each spin, cells of their symbol may turn SHINY. Scoring
  // a pattern with a shiny cell permanently raises that symbol's base value.
  // Their icon is the symbol's shiny Pokémon HOME render (`sprite` field).
  // Internal ids stay `golden-*` so persisted runs/cloud saves keep working.
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
  // --- The CloverPit-style second wave of charms -------------------------
  // focus-sash: consumed at a missed deadline — postpones it 2 rounds.
  "focus-sash": {
    cost: 5, file: "focus-sash.png", emoji: "🩹",
    focusSash: true,
  },
  // lagging-tail: doubles every "Triggers Randomly" charm's chance.
  "lagging-tail": {
    cost: 3, file: "lagging-tail.png", emoji: "🐌",
    laggingTail: true,
  },
  // arceus-statue: the next pull becomes a guaranteed JACKPOT, then the
  // statue discards itself (feeding Black Sludge). Icon = Arceus itself —
  // there is no Arceus Statue item in the games (self-hosted pokemon/493).
  "arceus-statue": {
    cost: 2, file: "arceus-statue.png", emoji: "🗿",
    arceusStatue: true,
  },
  // black-sludge: whenever ANY charm is discarded (sold or consumed), every
  // symbol permanently gains its own base value for this run (permLevels).
  "black-sludge": {
    cost: 5, file: "black-sludge.png", emoji: "🟣",
    blackSludge: true,
  },
  // metronome: after 2 consecutive empty pulls, charges the next pull with
  // Luck 5 (+2 more per consecutive fire) — see resolvePull in PokeSlots.jsx.
  "metronome": {
    cost: 1, file: "metronome.png", emoji: "🎵",
    metronome: true,
  },
  // heal-powder: a pull that hits exactly ONE pattern re-rolls it with the
  // pattern's cells turned into the most valuable symbol.
  "heal-powder": {
    cost: 3, file: "heal-powder.png", emoji: "💊",
    healPowder: true,
  },
  // zoom-lens: +1 to every pattern multiplier per 15 tickets owned.
  "zoom-lens": {
    cost: 1, file: "zoom-lens.png", emoji: "🔎",
    zoomLens: true,
  },
  // guidebook: finishing a quota raises the Symbols Multiplier (global
  // upgrade level) by the rounds skipped in that quota + 1.
  "guidebook": {
    cost: 3, file: "guidebook.png", emoji: "📖",
    guidebook: true,
  },
  // star-piece: after a pull with zero patterns, the next pull is guaranteed
  // a HOR-XL on the center row (forced in pullLever).
  "star-piece": {
    cost: 3, file: "star-piece.png", emoji: "🌟",
    starPiece: true,
  },
  // odd-keystone: 35% per pull that every pattern pays one extra time.
  "odd-keystone": {
    cost: 3, file: "odd-keystone.png", emoji: "🪨",
    oddKeystone: true,
    trait: "random",
  },
  // bright-powder: 5 charm activations in one round charge the next pull
  // with Luck +7 (once per round).
  "bright-powder": {
    cost: 3, file: "bright-powder.png", emoji: "✨",
    brightPowder: true,
  },
  // deep-sea-tooth: 3 pulls without a 5+ cell pattern guarantee an ABOVE or
  // BELOW on the next pull (forced in pullLever).
  "deep-sea-tooth": {
    cost: 3, file: "deep-sea-tooth.png", emoji: "🦷",
    deepSeaTooth: true,
  },
  // point-card: +1 Symbols Multiplier level per shop reroll of the run
  // (retroactive on purchase; the reroll counter never resets).
  "point-card": {
    cost: 2, file: "point-card.png", emoji: "🃏",
    pointCard: true,
  },
  // parcel: 25% per EMPTY pull that every symbol permanently gains its own
  // base value (permLevels) — same boost as a Black Sludge feeding.
  "parcel": {
    cost: 2, file: "parcel.png", emoji: "📦",
    parcel: true,
    trait: "random",
  },
  // --- Third wave: drives, mints, seeds, scarves & held-item staples ------
  // poffin-case: takes no tray space and adds +1 charm slot; offered once.
  "poffin-case": {
    cost: 2, file: "poffin-case.png", emoji: "🧰",
    poffinCase: true,
  },
  // The four Gen 5 drives key off the pull counter (every 7th pull).
  "douse-drive": {
    cost: 1, file: "douse-drive.png", emoji: "💧",
    douseDrive: true, // every 7th pull: patterns trigger one extra time
  },
  "shock-drive": {
    cost: 1, file: "shock-drive.png", emoji: "⚡",
    shockDrive: true, // every 7th pull: Luck +7
  },
  "burn-drive": {
    cost: 1, file: "burn-drive.png", emoji: "🔥",
    burnDrive: true, // every 7th pull: ZIG & ZAG guaranteed
  },
  "chill-drive": {
    cost: 4, file: "chill-drive.png", emoji: "❄️",
    chillDrive: true, // +2 pulls on every bought round
  },
  // choice-scarf: 3 consecutive empty pulls permanently raise every symbol
  // by its own base value (permLevels).
  "choice-scarf": {
    cost: 2, file: "choice-scarf.png", emoji: "🧣",
    choiceScarf: true,
  },
  // Mints (no official item sprites exist for them — emoji icons).
  "modest-mint": {
    cost: 2, emoji: "🍃",
    modestMint: true, // quota clear: +1 ticket per (quota #) tickets held
  },
  "bold-mint": {
    cost: 1, emoji: "🌱",
    boldMint: true, // Symbols Multiplier +1 level per 5 tickets owned
  },
  "adamant-mint": {
    cost: 2, emoji: "🌿",
    adamantMint: true, // per pull, +base value to all symbols per pattern past the 2nd (round-scoped)
  },
  "sassy-mint": {
    cost: 3, emoji: "☘️",
    sassyMint: true, // 5+ patterns in a pull: double all symbols until round end
  },
  // Terrain seeds.
  "electric-seed": {
    cost: 1, file: "electric-seed.png", emoji: "⚡",
    electricSeed: true, // a ×4+ pattern lands: all patterns +base mult until round end
  },
  "psychic-seed": {
    cost: 2, file: "psychic-seed.png", emoji: "🔮",
    psychicSeed: true, // a ×5+ pattern lands: double all patterns until round end
  },
  "misty-seed": {
    cost: 2, file: "misty-seed.png", emoji: "🌫️",
    mistySeed: true, // EYE pattern scores ALONE: double all patterns permanently
  },
  "grassy-seed": {
    cost: 3, file: "grassy-seed.png", emoji: "🌱",
    grassySeed: true, // each cleared quota feeds +1 to Symbols/Patterns mult, alternating
  },
  "leftovers": {
    cost: 4, file: "leftovers.png", emoji: "🍱",
    leftovers: true, // Exeggcute/Cherubi patterns pay twice; self-discards after 10 rounds
  },
  "poison-barb": {
    cost: 2, file: "poison-barb.png", emoji: "🦂",
    poisonBarb: true, // 7 Sevipers on the grid all turn Shiny
  },
  "twisted-spoon": {
    cost: 1, file: "twisted-spoon.png", emoji: "🥄",
    twistedSpoon: true, // a lone Carbink/Gholdengo pattern triggers twice more (last pays double)
  },
  // Contest scarves: "Triggers Randomly" Luck for the CURRENT pull. Red/Blue
  // wear out after N activations; Pink/Green/Yellow grow their Luck bonus
  // during the quota (rerolls / ×3+ patterns / rounds skipped last quota).
  "red-scarf": {
    cost: 1, file: "red-scarf.png", emoji: "🧣",
    scarf: { luck: 5, chance: 0.2, maxFires: 12 },
    trait: "random",
  },
  "blue-scarf": {
    cost: 2, file: "blue-scarf.png", emoji: "🧣",
    scarf: { luck: 7, chance: 0.15, maxFires: 9 },
    trait: "random",
  },
  "pink-scarf": {
    cost: 2, file: "pink-scarf.png", emoji: "🧣",
    scarf: { luck: 0, chance: 0.1, source: "rerolls", step: PINK_SCARF_STEP },
    trait: "random",
  },
  "green-scarf": {
    cost: 2, file: "green-scarf.png", emoji: "🧣",
    scarf: { luck: 0, chance: 0.1, source: "patterns", step: GREEN_SCARF_STEP },
    trait: "random",
  },
  "yellow-scarf": {
    cost: 2, file: "yellow-scarf.png", emoji: "🧣",
    scarf: { luck: 0, chance: 0.1, source: "skipped", step: YELLOW_SCARF_STEP },
    trait: "random",
  },
  // --- Fourth wave: Giratina-hunting charms --------------------------------
  // dragon-fang: when a Giratina cell appears on the grid, +10 Luck on the
  // very next spin of the same round (consumed once, re-armed per Giratina).
  "dragon-fang": {
    cost: 2, file: "dragon-fang.png", emoji: "🐉",
    dragonFang: true,
  },
  // red-card: if a Giratina HOR or DIAG is going to trigger, transform its
  // cells into the grid's majority real symbol; 50% chance of self-discarding.
  "red-card": {
    cost: 1, file: "red-card.png", emoji: "🟥",
    redCard: true,
  },
  // comet-shard: +2 to the Patterns Multiplier (stacks additively with other
  // pattern-mult bonuses) and +3% spawn weight for Giratina.
  "comet-shard": {
    cost: 3, file: "comet-shard.png", emoji: "☄️",
    cometShard: true, cometShardGiratinaPct: 0.03,
  },
  // dragon-skull: when a Giratina cell appears on the grid, permanently
  // double the pattern multiplier for ABOVE and BELOW.
  "dragon-skull": {
    cost: 3, file: "dragon-skull.png", emoji: "💀",
    dragonSkull: true,
  },
  // pearl-string: Triggers Randomly (35%). Same as Red Card but chance-based.
  "pearl-string": {
    cost: 1, file: "pearl-string.png", emoji: "🪩",
    pearlString: true, trait: "random",
  },
  // dark-stone: +1.5% Giratina spawn weight. When a Giratina cell appears,
  // gain bonus pulls: +3, +2, +1, +0 then stays at +0; resets at round end.
  "dark-stone": {
    cost: 2, file: "dark-stone.png", emoji: "🌑",
    darkStone: true, darkStoneGiratinaPct: 0.015,
  },
  // god-stone: when a Giratina cell appears on the grid, Symbols Multiplier
  // ×2 until the end of the round.
  "god-stone": {
    cost: 2, file: "god-stone.png", emoji: "🪨",
    godStone: true,
  },
};

// Modifier chances per cell, rolled every spin (see rollModifiers).
export const GOLDEN_CHANCE = 0.2;
export const CHAIN_CHANCE = 0.12;

// Roll the Shiny/Chain modifiers for a freshly landed grid: returns the
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
// Odd Keystone: chance per pull that every pattern pays one extra time.
export const ODD_KEYSTONE_CHANCE = 0.35;
// Parcel: chance per EMPTY pull that every symbol gains its base value.
export const PARCEL_CHANCE = 0.25;
// Metronome: base Luck after 2 consecutive empty pulls, +STEP per extra fire.
export const METRONOME_LUCK = 5;
export const METRONOME_LUCK_STEP = 2;
// Bright Powder: charm activations per round needed to charge Luck +7.
export const BRIGHT_POWDER_TRIGGERS = 5;
export const BRIGHT_POWDER_LUCK = 7;
// Focus Sash: extra rounds granted when a deadline would end the run.
export const FOCUS_SASH_EXTRA_ROUNDS = 2;
// Deep Sea Tooth: pulls without a 5+ cell pattern before it guarantees one.
export const DEEP_SEA_DROUGHT = 3;
// Zoom Lens: tickets per +1 pattern multiplier.
export const ZOOM_LENS_TICKETS = 15;

// "Triggers Randomly" charms roll this helper instead of their raw chance:
// a Lagging Tail in the tray doubles every such chance (capped at 100%).
export function randomTriggerChance(state, base) {
  return state.charms.includes("lagging-tail") ? Math.min(1, base * 2) : base;
}

// Discard a charm from the tray (sell or consume). If Black Sludge survives
// the discard it feeds: every symbol permanently gains its own base value for
// this run. Mutates the given draft (the callers pass a fresh object) and
// returns true when the sludge fed so callers can show the popup.
export function discardCharm(draft, charmId) {
  draft.charms = draft.charms.filter((c) => c !== charmId);
  if (!draft.charms.includes("black-sludge")) return false;
  draft.permLevels = { ...(draft.permLevels || {}) };
  for (const s of SYMBOLS) {
    draft.permLevels[s.id] = (draft.permLevels[s.id] || 0) + s.baseValue;
  }
  return true;
}

// Interest the ATM pays on the LIFETIME deposit total (deposited) after every
// round — unlike quotaPaid that total never resets, so interest keeps growing
// with everything deposited across the whole run. Pokédoll pays out the same
// amount whenever 3+ patterns hit in one pull.
export const DEPOSIT_INTEREST_RATE = 0.07;
export function depositInterest(state) {
  return Math.floor((state.deposited || 0) * DEPOSIT_INTEREST_RATE);
}

export const CHARM_IDS = Object.keys(CHARMS);

// Current coin value of a symbol, including upgrades, charm bonuses, the
// Cleanse Tag's all-symbol bonus, Shiny charm growth, the permanent
// base-value boosts (Black Sludge / Parcel / Choice Scarf — permLevels), the
// Adamant Mint's round-scoped base-value stacks, and the Sassy Mint's
// round-scoped doubling.
export function symbolValue(state, symId) {
  let value = SYMBOL_BY_ID[symId].baseValue + (state.upgrades.symbol[symId] || 0) + (state.cleanseStacks || 0) + (state.goldenLevels?.[symId] || 0) + (state.permLevels?.[symId] || 0);
  for (const charmId of state.charms) {
    const bonus = CHARMS[charmId].bonusValues?.[symId];
    if (bonus) value += bonus;
  }
  value += (state.adamantStacks || 0) * SYMBOL_BY_ID[symId].baseValue;
  if ((state.sassyDoubles || 0) > 0) value *= Math.pow(2, state.sassyDoubles);
  return value;
}

// Current multiplier of a pattern type, including upgrades, charm bonuses,
// Griseous Orb chain growth, the Choice Specs' permanent base-mult boosts,
// the Zoom Lens (+1 per 15 tickets), Grassy Seed levels, the Electric Seed's
// round-scoped base-mult stacks, and the Psychic/Misty Seed doublings.
export function patternMult(state, type) {
  let mult = BASE_PATTERN_MULT[type] + (state.upgrades.pattern[type] || 0) + (state.chainLevels?.[type] || 0) + (state.permPatternLevels?.[type] || 0);
  for (const charmId of state.charms) {
    const bonus = CHARMS[charmId].patternBonus?.[type];
    if (bonus) mult += bonus;
  }
  // Comet Shard: flat +2 to every pattern multiplier.
  if (state.charms.includes("comet-shard")) mult += 2;
  if (state.charms.includes("zoom-lens")) {
    mult += Math.floor((state.tickets || 0) / ZOOM_LENS_TICKETS);
  }
  mult += (state.grassyLevels?.pattern || 0) + (state.electricBoost || 0) * BASE_PATTERN_MULT[type];
  const doubles = (state.psychicDoubles || 0) + (state.mistyDoubles || 0);
  if (doubles > 0) mult *= Math.pow(2, doubles);
  return mult;
}

// Symbols Multiplier — the global payout dial shown under the boards. Each
// level is x1.5: shop upgrades, Bold Mint (+1 level per 5 tickets owned)
// and Grassy Seed's global levels. Default x1.
export function symbolsMultLevel(state) {
  let level = state.upgrades.global || 0;
  if (state.charms.includes("bold-mint")) {
    level += Math.floor((state.tickets || 0) / BOLD_MINT_TICKETS);
  }
  level += state.grassyLevels?.global || 0;
  return level;
}
export function symbolsMult(state) {
  let mult = 1 + symbolsMultLevel(state);
  // God Stone: ×2 until end of round when Giratina appeared.
  if (state.godStoneActive) mult *= 2;
  return mult;
}

// Global payout multiplier applied to every pull's raw payout: the Symbols
// Multiplier stacked with Luck Incense.
export function payoutMult(state) {
  let mult = symbolsMult(state);
  for (const charmId of state.charms) {
    if (CHARMS[charmId].payoutMult) mult *= CHARMS[charmId].payoutMult;
  }
  return mult;
}

// Patterns Multiplier shown under the Patterns board: the flat bonuses that
// apply to EVERY pattern (Grassy Seed levels + Zoom Lens). Default x1.
export function patternsMult(state) {
  let mult = 1 + (state.grassyLevels?.pattern || 0);
  if (state.charms.includes("zoom-lens")) {
    mult += Math.floor((state.tickets || 0) / ZOOM_LENS_TICKETS);
  }
  return mult;
}

// Drop weights for a spin, after Repel (removal) and the charms' per-symbol
// weight multipliers (Wide Lens boosts the rares, Big Mushroom the commons).
export function rollWeights(state) {
  const removed = new Set(state.charms.flatMap((c) => CHARMS[c].removeSymbols || []));
  return SYMBOLS.map((s) => {
    if (removed.has(s.id)) return 0;
    // Giratina only appears after clearing Quota 666 (cycle >= 4).
    if (s.id === "giratina" && (state.cycle || 1) < GIRATINA_UNLOCK_CYCLE) return 0;
    let weight = s.weight;
    // Comet Shard / Dark Stone increase Giratina's spawn weight additively.
    if (s.id === "giratina") {
      for (const c of state.charms) {
        const charm = CHARMS[c];
        if (charm.cometShardGiratinaPct) weight += charm.cometShardGiratinaPct * weight;
        if (charm.darkStoneGiratinaPct) weight += charm.darkStoneGiratinaPct * weight;
      }
    }
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
  // Giratina cap: at most GIRATINA_MAX_PER_PULL Giratinas per grid. Extras
  // are replaced with a random non-Giratina weighted pick.
  const giratinaIdxs = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === "giratina") giratinaIdxs.push(i);
  }
  if (giratinaIdxs.length > GIRATINA_MAX_PER_PULL) {
    const nonGWeights = weights.map((w, i) => SYMBOLS[i].id === "giratina" ? 0 : w);
    for (let j = GIRATINA_MAX_PER_PULL; j < giratinaIdxs.length; j++) {
      grid[giratinaIdxs[j]] = weightedPick(nonGWeights);
    }
  }
  return grid;
}

// A symbol drawn with the current drop weights (Repel removals and weight
// multipliers included) — used by the guaranteed-pattern forcing below.
function pickWeightedSymbol(state) {
  const weights = rollWeights(state);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return SYMBOLS[i].id;
  }
  return SYMBOLS[SYMBOLS.length - 1].id;
}

// Force the machine to land a guaranteed shape on `grid` (rolled fresh when
// omitted): JACKPOT fills all 15 cells (Arceus Statue), ABOVE/BELOW fills the
// pattern's 10 cells (Deep Sea Tooth) and CENTER_ROW fills the middle row for
// a HOR-XL (Star Piece). When `symbol` is passed the forced cells use it, so
// two guarantees on the same pull (Deep Sea Tooth + Star Piece) never break
// each other. Returns { grid, symbol }.
export function forceGridShape(state, shape, grid, symbol) {
  const sym = symbol || pickWeightedSymbol(state);
  const target = grid || rollGrid(state);
  if (shape === "JACKPOT") {
    return { grid: Array.from({ length: GRID_CELLS }, () => sym), symbol: sym };
  }
  if (shape === "ABOVE" || shape === "BELOW") {
    for (const cell of PATTERN_INSTANCES.find((p) => p.type === shape).cells) {
      target[cell] = sym;
    }
    return { grid: target, symbol: sym };
  }
  if (shape === "CENTER_ROW") {
    for (let c = 0; c < GRID_COLS; c++) target[GRID_COLS + c] = sym;
    return { grid: target, symbol: sym };
  }
  if (shape === "ZIG_ZAG") {
    // Burn Drive: both fixed shapes at once — they share their middle cells,
    // so one symbol completes the two of them.
    const cells = new Set([
      ...PATTERN_INSTANCES.find((p) => p.type === "ZIG").cells,
      ...PATTERN_INSTANCES.find((p) => p.type === "ZAG").cells,
    ]);
    for (const cell of cells) target[cell] = sym;
    return { grid: target, symbol: sym };
  }
  if (shape === "EYE") {
    for (const cell of PATTERN_INSTANCES.find((p) => p.type === "EYE").cells) {
      target[cell] = sym;
    }
    return { grid: target, symbol: sym };
  }
  return { grid: target, symbol: sym };
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
  // A pattern instance scores when every cell shows the same symbol, or when
  // at most 1 Ditto fills in for a single real symbol (max 1 Ditto per pattern).
  const matched = [];
  for (const inst of PATTERN_INSTANCES) {
    let dittoCount = 0;
    let realSym = null;
    let consistent = true;
    for (const cell of inst.cells) {
      const s = grid[cell];
      if (s === "ditto") {
        dittoCount++;
      } else if (realSym === null) {
        realSym = s;
      } else if (s !== realSym) {
        consistent = false;
        break;
      }
    }
    // Match if: at most 1 ditto, all real cells agree, at least 1 real symbol.
    if (consistent && dittoCount <= 1 && realSym !== null) {
      matched.push({ ...inst, symbol: realSym });
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

  // Giratina instant loss: a HOR or DIAG that scores as Giratina ends the run.
  const giratinaLoss = scored.some(
    (m) => m.symbol === "giratina" && (m.type === "HOR" || m.type === "DIAG")
  );

  let raw = 0;
  for (const m of scored) {
    raw += symbolValue(state, m.symbol) * m.cells.length * patternMult(state, m.type);
  }
  const payout = Math.floor(raw * payoutMult(state));

  const jackpot = scored.some((m) => m.type === "JACKPOT");

  // Track Ditto cells that contributed to a scored pattern (used for the
  // post-spin reveal animation in PokeSlots.jsx).
  const dittoCells = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== "ditto") continue;
    const parent = scored.find((m) => m.cells.includes(i));
    if (parent) dittoCells.push({ cell: i, symbol: parent.symbol });
  }

  return { scored, payout, jackpot, giratinaLoss, dittoCells };
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

// Shop offers are charms only (pattern/global/symbol upgrades were removed).
// Giratina-related charms only appear in the shop after Giratina is unlocked.
const GIRATINA_CHARMS = ["dragon-fang", "dragon-skull", "dark-stone", "god-stone", "red-card", "comet-shard"];

export function generateShopOffers(state) {
  // The Poffin Case never shows up again once bought (even if sold).
  const unowned = CHARM_IDS.filter(
    (id) => !state.charms.includes(id) && !(id === "poffin-case" && state.poffinCaseBought)
      && !((state.cycle || 1) < GIRATINA_UNLOCK_CYCLE && GIRATINA_CHARMS.includes(id))
  );
  return pickRandom(unowned, 3).map((id) => ({
    kind: "charm",
    id,
    cost: charmCost(id),
  }));
}

export function rerollShop(state) {
  return generateShopOffers(state);
}
