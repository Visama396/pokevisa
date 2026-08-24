import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../stores/language";
import { t } from "../stores/translations";
import HomeButton from "./HomeButton";
import LanguageSelector from "./LanguageSelector";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import {
  GRID_COLS,
  GRID_ROWS,
  SYMBOLS,
  SYMBOL_BY_ID,
  symbolSprite,
  symbolName,
  PATTERN_TYPES,
  PATTERN_ICONS,
  CHARMS,
  createRunState,
  rollGrid,
  evaluateGrid,
  symbolValue,
  patternMult,
  rollWeights,
  currentQuota,
  roundCost,
  quotaClearBonus,
  atmMaxDeposit,
  interestForDebt,
  ROUND_MODES,
  ROUND_TICKET_COSTS,
  ROUNDS_PER_QUOTA,
  generateShopOffers,
  rerollShop,
  charmCost,
  MAX_CHARMS,
  rerollCost,
  AMULET_COIN_CHANCE,
  AMULET_COIN_LUCK,
  SPELL_TAG_LUCK,
  depositInterest,
  rollModifiers,
} from "../lib/pokeslots";

// PokéSlots — CloverPit-inspired slot machine roguelite. The run rules live in
// src/lib/pokeslots.js; this component renders the machine, the two boards,
// the Rotom Phone shop/ATM and the deadline/end screens.
//
// Async flows (reel stops, deadline popup) read state through runRef so they
// never depend on stale closures, and no setState updater performs side
// effects, keeping behaviour identical under StrictMode.

const fmt = (n) => Math.floor(n).toLocaleString("en-US");
const ITEM_SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";
const GLOBAL_MULT_STEP = 1.5;
// The pulls-left strip always shows this many slots; slots beyond the bought
// round mode stay switched off.
const MAX_PULL_SLOTS = Math.max(...Object.values(ROUND_MODES).map((m) => m.pulls));

// Giovanni's texts through the Rotom Phone. The English sentences are the
// translation keys; missing languages fall back to English inside t().
const PHONE_ROUND_MSGS = [
  "The boss expects your quota on time. Don't disappoint Team Rocket.",
  "Time is money, trainer. Buy your pulls and pay the fee.",
  "Interest never sleeps. Neither do I.",
  "A wise investor pays early. A broke one pays interest.",
  "The machine owes us. Make it pay.",
];

// Best-results persistence (local only — this is an arcade side game).
const RECORDS_KEY = "pokeslots_records";
// Persisted sound-effects volume (0..1).
const VOLUME_KEY = "pokeslots_volume";
function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY)) || { wins: 0, bestWinRound: null, bestPayout: 0 };
  } catch {
    return { wins: 0, bestWinRound: null, bestPayout: 0 };
  }
}
function saveRecord(patch) {
  const rec = { ...loadRecords(), ...patch };
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(rec));
  } catch {}
  return rec;
}

// Charm names are proper nouns (item names) and stay in English; their
// descriptions use the `<id>-desc` translation keys.
const CHARM_NAME_KEYS = {
  "silk-scarf": "charm-silk-scarf",
  "lucky-egg": "charm-lucky-egg",
  "choice-specs": "charm-choice-specs",
  "muscle-band": "charm-muscle-band",
  "focus-band": "charm-focus-band",
  "luck-incense": "charm-luck-incense",
  "wide-lens": "charm-wide-lens",
  "metal-coat": "charm-metal-coat",
  "amulet-coin": "charm-amulet-coin",
  "super-repel": "charm-super-repel",
  magnet: "charm-magnet",
  "gold-bottle-cap": "charm-gold-bottle-cap",
  "big-mushroom": "charm-big-mushroom",
  pokedoll: "charm-pokedoll",
  "cleanse-tag": "charm-cleanse-tag",
  "spell-tag": "charm-spell-tag",
  "golden-lemon": "charm-golden-lemon",
  "golden-cherry": "charm-golden-cherry",
  "golden-clover": "charm-golden-clover",
  "golden-bell": "charm-golden-bell",
  "golden-diamond": "charm-golden-diamond",
  "golden-treasure": "charm-golden-treasure",
  "golden-seven": "charm-golden-seven",
  "griseous-orb": "charm-griseous-orb",
};

function CharmIcon({ charmId, className }) {
  const [failed, setFailed] = useState(false);
  const charm = CHARMS[charmId];
  // `sprite` is a full URL (Golden charms use the shiny HOME render);
  // `file` is a PokeAPI item sprite name. Emoji remains the fallback.
  const src = charm.sprite || (charm.file ? `${ITEM_SPRITES}/${charm.file}` : null);
  if (!src || failed) return <span className={className}>{charm.emoji}</span>;
  return (
    <img
      src={src}
      alt={charmId}
      draggable="false"
      onError={() => setFailed(true)}
      className={`object-contain ${className || ""}`}
    />
  );
}

function SymbolFace({ symId, spinning, won, small, golden, chain }) {
  const [failed, setFailed] = useState(false);
  const sym = SYMBOL_BY_ID[symId];
  const cls = small
    ? "flex items-center justify-center w-full h-full"
    : `relative flex items-center justify-center rounded-lg border-2 bg-slate-900 overflow-hidden transition-all duration-150 ${
        won
          ? "border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.7)] scale-[1.04] z-10"
          : golden
            ? "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
            : chain
              ? "border-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.5)]"
              : "border-slate-700"
      }`;
  if (!sym) return <div className={cls} />;
  const badges = (
    <>
      {golden && <span className="absolute top-0 right-0.5 text-[10px] leading-none">✨</span>}
      {chain && <span className="absolute bottom-0 right-0.5 text-[10px] leading-none">🔗</span>}
    </>
  );
  if (failed) return <div className={cls}>{badges}<span className={small ? "text-lg" : "text-2xl sm:text-3xl"}>{sym.emoji}</span></div>;
  return (
    <div className={cls}>
      {badges}
      <img
        src={symbolSprite(symId)}
        alt={symId}
        draggable="false"
        onError={() => setFailed(true)}
        className={`object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] ${
          spinning ? "animate-reel-blur" : ""
        } ${small ? "max-w-full max-h-full" : "w-[78%] h-[78%]"}`}
      />
    </div>
  );
}

function MiniPattern({ type }) {
  const lit = new Set(PATTERN_ICONS[type]);
  return (
    <div
      className="grid gap-px shrink-0 rounded-sm bg-slate-950 p-0.5 border border-slate-800"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 4px)`,
        gridTemplateRows: `repeat(3, 4px)`,
      }}
    >
      {Array.from({ length: GRID_COLS * 3 }).map((_, i) => (
        <div key={i} className={`rounded-[1px] ${lit.has(i) ? "bg-yellow-400" : "bg-slate-800"}`} />
      ))}
    </div>
  );
}

// Shared modal shell: dark backdrop + centered panel with a title bar.
// Used by the shop, ATM/deadline, help and the game-over/victory screens.
function Overlay({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black tracking-tight">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="size-7 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PokeSlots() {
  const language = useLanguage();
  const tr = useCallback((key) => t(key, language), [language]);

  const [run, setRun] = useState(createRunState);
  const [offers, setOffers] = useState(() => generateShopOffers(run));
  const [phase, setPhase] = useState("idle"); // idle | spinning | ended
  const [displayGrid, setDisplayGrid] = useState(run.grid);
  const [stoppedCols, setStoppedCols] = useState(GRID_COLS);
  const [winCells, setWinCells] = useState(new Set());
  const [scoredTypes, setScoredTypes] = useState(new Set());
  const [popups, setPopups] = useState([]);
  const [jackpotBanner, setJackpotBanner] = useState(false);
  // Upgrade purchases briefly light up the matching row on the Symbols /
  // Patterns boards ("symbol:<id>" / "pattern:<type>" → true) so the player
  // can see exactly what just got better behind the shop modal.
  const [flashes, setFlashes] = useState({});
  const [modal, setModal] = useState(null); // null | shop | atm | deadline | over | won | help
  const [payAmount, setPayAmount] = useState(0);
  const [phoneMsg, setPhoneMsg] = useState(PHONE_ROUND_MSGS[0]);
  // Records come from localStorage, so they load after mount — reading them in
  // useState would render different HTML on server vs client (hydration error).
  const [records, setRecords] = useState({ wins: 0, bestWinRound: null, bestPayout: 0 });
  useEffect(() => setRecords(loadRecords()), []);

  // Mirrors of state for timers/async flows.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const timersRef = useRef([]);
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    clearInterval(timersRef.current.shuffle);
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);
  const later = (fn, ms) => timersRef.current.push(setTimeout(fn, ms));
  const pushMsg = (msg) => setPhoneMsg(msg);

  // Sound effects (mp3s in /public): slot-spin plays while the reels roll,
  // cash-register chimes on shop purchases. Each file gets ONE shared Audio
  // element created lazily, so rapid pulls retrigger instead of stacking
  // players; play() rejections (autoplay policy) are ignored.
  const sfxRef = useRef({});

  // SFX volume (0..1). Persisted in localStorage like the records; a ref
  // mirrors it so timer-driven sfx callers never read a stale closure.
  const [volume, setVolumeState] = useState(1);
  const volumeRef = useRef(1);
  useEffect(() => {
    try {
      const stored = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (!Number.isNaN(stored)) setVolumeState(Math.min(1, Math.max(0, stored)));
    } catch {}
  }, []);
  useEffect(() => {
    volumeRef.current = volume;
    Object.values(sfxRef.current).forEach((a) => {
      try {
        a.volume = volume;
      } catch {}
    });
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {}
  }, [volume]);

  const playSfx = (name) => {
    try {
      const audio = (sfxRef.current[name] ||= new Audio(`/${name}`));
      audio.volume = volumeRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };
  const stopSfx = (name) => {
    try {
      sfxRef.current[name]?.pause();
    } catch {}
  };

  const addPopup = (popup) => {
    const id = Math.random().toString(36).slice(2);
    setPopups((p) => [...p, { id, ...popup }]);
    later(() => setPopups((p) => p.filter((x) => x.id !== id)), 1250);
  };

  // ------------------------------------------------------------------
  // Pulling the lever: reels blur and stop column by column, then score.
  // ------------------------------------------------------------------
  const pullLever = () => {
    if (phase !== "idle" || modal || runRef.current.pullsLeft <= 0) return;
    const cur = runRef.current;

    // Amulet Coin: 10% chance per spin to refund the pull and charge the spin
    // with Luck. Spell Tag: the round's LAST pull always gets +7 Luck. Both
    // feed state.luck, which rollGrid consumes as guaranteed symbol cells.
    const netPulls = cur.pullsLeft - 1;
    const amuletTrigger =
      cur.charms.includes("amulet-coin") && Math.random() < AMULET_COIN_CHANCE;
    const pullsLeft = amuletTrigger ? cur.pullsLeft : netPulls;
    const spellTrigger = cur.charms.includes("spell-tag") && pullsLeft === 0;
    const luckGain = (amuletTrigger ? AMULET_COIN_LUCK : 0) + (spellTrigger ? SPELL_TAG_LUCK : 0);

    // rollGrid reads luck from its state argument; the stored run state keeps
    // luck at 0 so nothing re-consumes it later.
    const finalGrid = rollGrid({ ...cur, luck: luckGain });
    // Golden/Chain modifiers are rolled per cell for every fresh grid and
    // stored so scoring (resolvePull) and rendering read the same flags.
    const { golden, chain } = rollModifiers(cur, finalGrid);
    setRun((r) => ({ ...r, pullsLeft, luck: 0, goldenCells: golden, chainCells: chain }));
    runRef.current = { ...cur, pullsLeft, luck: 0, goldenCells: golden, chainCells: chain };
    setPhase("spinning");
    setStoppedCols(0);
    setWinCells(new Set());
    setScoredTypes(new Set());
    playSfx("slot-spin.mp3");
    if (amuletTrigger) addPopup({ x: 50, y: 26, text: `🪙 +1 PULL`, kind: "tickets" });
    if (spellTrigger) addPopup({ x: 50, y: 26, text: `👻 +${SPELL_TAG_LUCK} LUCK`, kind: "pattern" });

    let stopped = 0;
    const shuffle = setInterval(() => {
      // Stopped columns already show their final symbols; the rest blur-cycle.
      setDisplayGrid(finalGrid.map((sym, i) => (i % GRID_COLS < stopped ? sym : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id)));
    }, 70);

    for (let c = 1; c <= GRID_COLS; c++) {
      later(() => {
        stopped = c;
        setStoppedCols(c);
      }, 420 + (c - 1) * 170);
    }

    later(() => {
      clearInterval(shuffle);
      setDisplayGrid(finalGrid);
      resolvePull(finalGrid);
    }, 420 + (GRID_COLS - 1) * 170 + 260);
  };

  const resolvePull = (finalGrid) => {
    stopSfx("slot-spin.mp3"); // the mp3 outlasts the reel animation
    const cur = runRef.current;
    const next = { ...cur, grid: finalGrid };
    const res = evaluateGrid(next, finalGrid);
    next.coins += res.payout;
    next.stats = { ...next.stats };
    next.stats.totalEarned += res.payout;
    next.stats.pullsUsed += 1;
    if (res.jackpot) next.stats.jackpots += 1;
    if (res.payout > next.stats.biggestWin) next.stats.biggestWin = res.payout;
    // Pokédoll: 3+ patterns in one pull pay out the current deposit interest.
    let pokedollBonus = 0;
    if (next.charms.includes("pokedoll") && res.scored.length >= 3) {
      pokedollBonus = depositInterest(cur);
      next.coins += pokedollBonus;
      next.stats.totalEarned += pokedollBonus;
    }
    // Cleanse Tag: a pull that lands 5+ patterns adds another +1 to every
    // symbol's value (same bonus as the on-purchase stack).
    const cleanseTrigger = next.charms.includes("cleanse-tag") && res.scored.length >= 5;
    if (cleanseTrigger) next.cleanseStacks = (next.cleanseStacks || 0) + 1;
    // Golden / Chain growth: each scored pattern carrying a modified cell
    // permanently raises its symbol's base value (+1 per Golden charm stack)
    // or its pattern type's multiplier (+1 per chained cell), for this run.
    const goldenSet = new Set(next.goldenCells || []);
    const chainSet = new Set(next.chainCells || []);
    const goldenGrowth = new Set();
    const chainGrowth = new Set();
    for (const inst of res.scored) {
      for (const cell of inst.cells) {
        if (goldenSet.has(cell)) goldenGrowth.add(inst.symbol);
        if (chainSet.has(cell)) chainGrowth.add(inst.type);
      }
    }
    if (goldenGrowth.size > 0 || chainGrowth.size > 0) {
      next.goldenLevels = { ...next.goldenLevels };
      next.chainLevels = { ...next.chainLevels };
      for (const s of goldenGrowth) {
        next.goldenLevels[s] = (next.goldenLevels[s] || 0) + 1;
        addPopup({ x: 50, y: 62, text: `✨${SYMBOL_BY_ID[s].emoji} +1`, kind: "pattern" });
      }
      for (const t of chainGrowth) {
        next.chainLevels[t] = (next.chainLevels[t] || 0) + 1;
        addPopup({ x: 50, y: 68, text: `🔗${t.replace("_", "-")} +1`, kind: "pattern" });
      }
    }

    setRun(next);
    runRef.current = next;
    setPhase("idle");
    setWinCells(new Set(res.scored.flatMap((s) => s.cells)));
    setScoredTypes(new Set(res.scored.map((s) => s.type)));

    if (res.jackpot) {
      setJackpotBanner(true);
      later(() => setJackpotBanner(false), 2200);
      pushMsg(tr("JACKPOT?! ...Enjoy it while it lasts."));
    }
    if (res.payout > 0) {
      addPopup({ x: 50, y: 40, text: `+${fmt(res.payout)} ₽`, kind: "coins" });
      if (pokedollBonus > 0) {
        addPopup({ x: 50, y: 30, text: `🧸 +${fmt(pokedollBonus)} ₽`, kind: "coins" });
        pushMsg(tr("The Pokédoll sells your interest on the spot."));
      }
      if (cleanseTrigger) {
        addPopup({ x: 50, y: 52, text: "🏷️ +1/symbol", kind: "pattern" });
        pushMsg(tr("The Cleanse Tag hums — every symbol is worth more!"));
      }
      for (const s of res.scored.slice(0, 4)) {
        const avgCol = s.cells.reduce((a, i) => a + (i % GRID_COLS), 0) / s.cells.length;
        const avgRow = s.cells.reduce((a, i) => a + Math.floor(i / GRID_COLS), 0) / s.cells.length;
        addPopup({
          x: ((avgCol + 0.5) / GRID_COLS) * 100,
          y: ((avgRow + 0.5) / 3) * 100,
          text: `${s.type.replace("_", "-")}`,
          kind: "pattern",
        });
      }
    }

    if (next.pullsLeft <= 0) {
      // Round over. If the quota still has rounds left, return to the pull
      // picker; on the last round the deadline comes due instead.
      later(() => {
        const now = runRef.current;
        if (now.awaitingChoice) return; // quota was cleared via ATM meanwhile
        // Deposit interest: the ATM pays 7% on the current deposit after
        // EVERY played round — one that ends at the deadline included.
        const interest = depositInterest(now);
        const base = interest > 0 ? { ...now, coins: now.coins + interest } : now;
        if (interest > 0) addPopup({ x: 50, y: 30, text: `🏦 +${fmt(interest)} ₽`, kind: "coins" });
        if (base.roundsLeft > 0) {
          // Mid-cycle: move to the next round of this quota. totalRounds
          // counts every played round across all quotas (charm hook).
          const next = { ...base, round: base.round + 1, totalRounds: (base.totalRounds || 0) + 1, pullsLeft: 0, awaitingChoice: true };
          commit(next);
          // Broke with no tickets to fall back on → game over right here.
          if (!canEnterRound(next)) endRun(false);
        } else {
          // Deadline comes due against the WHOLE cycle: deposits already made
          // (quotaPaid) plus whatever is left in hand must cover the quota.
          const rem = Math.max(0, currentQuota(base) - (base.quotaPaid || 0));
          if (base.coins >= rem || base.charms.includes("focus-band")) {
            setPayAmount(Math.min(base.coins, rem));
            setModal("deadline");
          } else {
            endRun(false); // cannot cover the quota and no Focus Band left
          }
        }
      }, 1500);
    }
  };

  // ------------------------------------------------------------------
  // Money: ATM payments, deadlines, interest, endings
  // ------------------------------------------------------------------
  const openAtm = () => {
    if (phase !== "idle" || modal) return;
    // Default the slider to the clamped MAX (quota-capped, round-fee aware).
    setPayAmount(atmMaxDeposit(runRef.current));
    setModal("atm");
  };

  // Round start: buy 3 or 7 pulls. Entering a round costs a share of the
  // current quota (roundCost) and earns its mode's tickets (4 for 3 pulls,
  // 2 for 7 — see ROUND_MODES). There is no credit anymore: if the coins
  // don't cover the fee, the round is paid with tickets instead
  // (ROUND_TICKET_COSTS, earning nothing back). Playing a round consumes
  // one of the quota's ROUNDS_PER_QUOTA rounds, so the pick is also a
  // pacing choice.
  const chooseRoundMode = (mode) => {
    if (phase !== "idle" || !runRef.current.awaitingChoice) return;
    const cur = runRef.current;
    const m = Number(mode);
    const coinCost = roundCost(cur, m);
    if (cur.coins >= coinCost) {
      commit({
        ...cur,
        coins: cur.coins - coinCost,
        pullsLeft: ROUND_MODES[m].pulls,
        tickets: cur.tickets + (ROUND_MODES[m].tickets || 0),
        lastMode: m,
        awaitingChoice: false,
        roundsLeft: cur.roundsLeft - 1,
      });
    } else {
      const ticketCost = ROUND_TICKET_COSTS[m];
      if ((cur.tickets || 0) < ticketCost) return;
      commit({
        ...cur,
        tickets: cur.tickets - ticketCost,
        pullsLeft: ROUND_MODES[m].pulls,
        lastMode: m,
        awaitingChoice: false,
        roundsLeft: cur.roundsLeft - 1,
      });
    }
    pushMsg(tr("The machine owes us. Make it pay."));
  };

  // True while the player can still enter SOME round — with coins or via the
  // ticket fallback. When neither is possible at picker time, the run ends:
  // otherwise they'd be stuck on the pull picker forever (the deadline only
  // comes due after pulls are spent).
  const canEnterRound = (s) =>
    s.coins >= roundCost(s, 3) ||
    s.coins >= roundCost(s, 7) ||
    (s.tickets || 0) >= ROUND_TICKET_COSTS[3];

  const makePayment = (amount, { deadline } = {}) => {
    const cur = runRef.current;
    const quota = currentQuota(cur);
    const paid = Math.max(0, Math.min(amount, cur.coins, cur.debt));
    // Payments accumulate toward the CURRENT quota (quotaPaid): several small
    // deposits clear a quota exactly like one big payment.
    const quotaPaid = (cur.quotaPaid || 0) + paid;
    let charms = cur.charms;
    // Focus Band auto-triggers once when a deadline can't be covered: it wipes
    // the remaining quota, empties the wallet and grants a free 7-pull round.
    let focusSave = false;
    if (deadline && quotaPaid < quota && charms.includes("focus-band")) {
      charms = charms.filter((c) => c !== "focus-band");
      focusSave = true;
    }
    if (deadline && quotaPaid < quota && !focusSave) {
      endRun(false);
      return;
    }
    let debt = cur.debt - paid;
    // A save zeroes the wallet instead of subtracting the payment.
    let next = { ...cur, coins: focusSave ? 0 : cur.coins - paid, debt, charms, quotaPaid };

    if (debt <= 0) {
      next.debt = 0;
      commit(next);
      endRun(true);
      return;
    }

    // A payment clears the quota when it's the forced deadline (already
    // validated above) or when the cycle's accumulated payments cross it —
    // mid-cycle ATM deposits included. Clearing early pays out the
    // quotaClearBonus (7% of the quota + 4 tickets + 1 per round left) and
    // starts a fresh cycle; only the forced deadline charges interest on
    // what remains.
    const cleared = deadline || quotaPaid >= quota;
    if (focusSave) {
      // The Focus Band's sacrifice: quota gone, wallet gone, but the run
      // continues straight into a free full-length (7-pull) round.
      next.cycle = cur.cycle + 1;
      next.quotaPaid = 0;
      next.rerolls = 0;
      next.roundsLeft = ROUNDS_PER_QUOTA;
      next.round = 1;
      if (!cur.awaitingChoice) next.totalRounds = (cur.totalRounds || 0) + 1;
      next.pullsLeft = ROUND_MODES[7].pulls;
      next.lastMode = 7; // the granted round is always the long one
      next.awaitingChoice = false;
      addPopup({ x: 50, y: 40, text: "🎗️", kind: "pattern" });
      pushMsg(tr("The Focus Band shatters! Quota wiped — seven pulls on the house."));
      setOffers(generateShopOffers(next));
      commit(next);
      return;
    }
    if (cleared) {
      // Deposit interest for rounds that end through this early-clear path:
      // they never reach the resolvePull timer. Skip payments made straight
      // from the pull picker (no round played) and deadline payments (the
      // timer already swept the interest before opening this modal).
      if (!cur.awaitingChoice && !deadline) {
        const interest = depositInterest(cur);
        if (interest > 0) {
          next.coins += interest;
          addPopup({ x: 50, y: 30, text: `🏦 +${fmt(interest)} ₽`, kind: "coins" });
        }
      }
      const bonus = quotaClearBonus(cur); // zero unless cleared with rounds to spare
      const eggMult = charms.includes("lucky-egg") ? CHARMS["lucky-egg"].ticketMult : 1;
      const bonusCoins = bonus.coins;
      const bonusTickets = Math.floor(bonus.tickets * eggMult);
      if (bonusCoins > 0) {
        next.coins += bonusCoins;
        addPopup({ x: 50, y: 40, text: `+${fmt(bonusCoins)} ₽`, kind: "coins" });
      }
      if (bonusTickets > 0) {
        next.tickets = cur.tickets + bonusTickets;
        addPopup({ x: 50, y: 58, text: `+${fmt(bonusTickets)} 🎫`, kind: "tickets" });
      }
      next.cycle = cur.cycle + 1;
      next.quotaPaid = 0; // the new cycle's quota starts unpaid
      next.rerolls = 0; // fresh shop for the new quota → reroll price resets
      next.roundsLeft = ROUNDS_PER_QUOTA;
      next.round = 1; // back to round 1 of the fresh quota
      // The finished round counts toward totalRounds — unless the payment
      // came straight from the pull picker (awaitingChoice), where no round
      // was actually being played.
      if (!cur.awaitingChoice) next.totalRounds = (cur.totalRounds || 0) + 1;
      next.pullsLeft = 0;
      next.awaitingChoice = true; // back to the pull picker for the new quota
      if (deadline) {
        // Interest is charged on whatever debt remains after the payment...
        next.debt = debt + interestForDebt(debt);
      }
      setOffers(generateShopOffers(next));
      pushMsg(tr(PHONE_ROUND_MSGS[next.cycle % PHONE_ROUND_MSGS.length]));
    }
    commit(next);
    // A fresh cycle sends the player back to the pull picker; if they spent
    // everything and hold no tickets, there is no way to enter a round —
    // the run ends here.
    if (cleared && !canEnterRound(next)) endRun(false);
  };

  const commit = (next) => {
    setRun(next);
    runRef.current = next;
    setModal(null);
  };

  const endRun = (won) => {
    const cur = runRef.current;
    setPhase("ended");
    setModal(won ? "won" : "over");
    const rec = loadRecords();
    if (won) {
      setRecords(
        saveRecord({
          wins: rec.wins + 1,
          bestWinRound: rec.bestWinRound == null ? cur.totalRounds : Math.min(rec.bestWinRound, cur.totalRounds),
          bestPayout: Math.max(rec.bestPayout, cur.stats.biggestWin),
        })
      );
      pushMsg(tr("You're free... for now."));
    } else {
      setRecords(saveRecord({ bestPayout: Math.max(rec.bestPayout, cur.stats.biggestWin) }));
      pushMsg(tr("Team Rocket blasted off with YOUR wallet!"));
    }
  };

  const restart = () => {
    clearTimers();
    const fresh = createRunState();
    setRun(fresh);
    runRef.current = fresh;
    setOffers(generateShopOffers(fresh));
    setDisplayGrid(fresh.grid);
    setStoppedCols(GRID_COLS);
    setWinCells(new Set());
    setScoredTypes(new Set());
    setPopups([]);
    setJackpotBanner(false);
    setFlashes({});
    setPhase("idle");
    setModal(null);
    setPhoneMsg(tr(PHONE_ROUND_MSGS[0]));
  };

  // ------------------------------------------------------------------
  // Shop actions
  // ------------------------------------------------------------------
  const buyOffer = (offer) => {
    const cur = runRef.current;
    if (phase !== "idle" || cur.tickets < offer.cost) return;
    playSfx("cash-register-purchase.mp3");
    const next = { ...cur, tickets: cur.tickets - offer.cost };
    if (offer.kind === "charm") {
      if (next.charms.length >= MAX_CHARMS) return;
      next.charms = [...next.charms, offer.id];
      // Cleanse Tag's on-purchase bonus: every symbol is worth +1 from now on.
      if (offer.id === "cleanse-tag") next.cleanseStacks = (next.cleanseStacks || 0) + 1;
    } else {
      next.upgrades = { ...next.upgrades };
      if (offer.target === "global") {
        next.upgrades.global = (next.upgrades.global || 0) + 1;
      } else {
        const [kind, target] = offer.target.split(":");
        next.upgrades[kind] = { ...next.upgrades[kind], [target]: (next.upgrades[kind][target] || 0) + 1 };
      }
    }
    commit(next);
    setOffers((o) => o.filter((x) => x !== offer));
    // Flash the upgraded row on its board so the new value is noticeable.
    if (offer.kind === "upgrade" && offer.target !== "global") {
      setFlashes((f) => ({ ...f, [offer.target]: true }));
      later(() => {
        setFlashes((f) => {
          const rest = { ...f };
          delete rest[offer.target];
          return rest;
        });
      }, 2400);
    }
  };

  const sellCharm = (charmId) => {
    const cur = runRef.current;
    const refund = Math.max(1, Math.floor(charmCost(charmId) / 2));
    commit({ ...cur, charms: cur.charms.filter((c) => c !== charmId), tickets: cur.tickets + refund });
  };

  const doReroll = () => {
    const cur = runRef.current;
    const cost = rerollCost(cur);
    if (phase !== "idle" || cur.coins < cost) return;
    playSfx("cash-register-purchase.mp3");
    commit({ ...cur, coins: cur.coins - cost, rerolls: (cur.rerolls || 0) + 1 });
    setOffers(rerollShop(cur));
  };

  // ------------------------------------------------------------------
  // Derived display data
  // ------------------------------------------------------------------
  const weights = rollWeights(run);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const quota = currentQuota(run);
  // What's still owed of the CURRENT quota after partial ATM deposits.
  const remainingQuota = Math.max(0, quota - (run.quotaPaid || 0));
  const canAct = phase === "idle" && !modal;
  const canPull = canAct && run.pullsLeft > 0;
  const hasFocusBand = run.charms.includes("focus-band");
  // Modifier flags of the current grid, rendered as cell badges/rings.
  const goldenCells = new Set(run.goldenCells || []);
  const chainCells = new Set(run.chainCells || []);
  const spinning = phase === "spinning";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-3 py-5 sm:px-6">
      {/* Header */}
      <div className="mx-auto max-w-6xl grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 mb-5">
        <HomeButton />
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Poké<span className="text-yellow-400">Slots</span>
          </h1>
          <p className="text-xs text-slate-500">{tr("Pay your debt to Team Rocket or fall into the pit")}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Status bar */}
      <div className="mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        <StatusChip label={tr("Coins")} value={`${fmt(run.coins)} ₽`} color="text-yellow-300" />
        {/* Only the quota still owed is shown up here (deposits shrink it) —
            the full remaining debt lives in the ATM screen so the bar stays
            readable at a glance. The chip also shows the current deposit and
            the 7% interest it will pay out after the round ends. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button onClick={openAtm} disabled={!canAct} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left transition-colors enabled:hover:border-red-500 disabled:opacity-90">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{tr("Quota")}</div>
                <div className="font-bold text-red-400">{fmt(remainingQuota)} ₽</div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] leading-none">
                  <span className="text-slate-500">
                    {tr("Deposit")} {fmt(run.quotaPaid || 0)} ₽
                  </span>
                  <span className={`font-semibold ${depositInterest(run) > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                    +{fmt(depositInterest(run))} ₽
                  </span>
                </div>
              </button>
            }
          />
          <TooltipContent side="bottom" className="max-w-56 text-wrap">
            🏦 {tr("Deposits earn 7% interest, paid out after every round.")}
          </TooltipContent>
        </Tooltip>
        <StatusChip label={tr("Tickets")} value={`${fmt(run.tickets)} 🎫`} color="text-sky-300" />
        {/* Round counts WITHIN the current quota (1..3); the all-time total
            lives in run.totalRounds for future charm effects. */}
        <StatusChip label={tr("Round")} value={`${run.round}/${ROUNDS_PER_QUOTA}`} color="text-purple-300" />
        {/* Pull pips: the strip always shows MAX_PULL_SLOTS slots. While no
            round is paid for (awaitingChoice) every slot is switched off;
            paying for a round lights up its mode's slots (3 or 7), and they
            go out one by one as pulls are spent. Slots beyond the bought
            mode's count stay off. */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{tr("Pulls left")}</div>
          <div className="flex items-center gap-1 mt-1.5">
            {Array.from({ length: MAX_PULL_SLOTS }).map((_, i) => {
              const inMode = !run.awaitingChoice && i < (ROUND_MODES[run.lastMode]?.pulls || 0);
              return (
                <span
                  key={i}
                  className={`h-2.5 flex-1 rounded-sm transition-colors ${
                    inMode ? (i < run.pullsLeft ? "bg-yellow-400" : "bg-slate-700") : "bg-slate-800/50"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {canAct && run.pullsLeft === 0 && !run.awaitingChoice && (
        <div className="mx-auto max-w-6xl mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm text-red-300 animate-pulse">
          {tr("Out of pulls! Pay the quota at the ATM before time runs out")}
        </div>
      )}

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[225px_minmax(0,1fr)_225px] gap-4 items-start">
        {/* Symbols board */}
        <Board title={tr("Symbols")}>
          {SYMBOLS.map((s, i) => {
            const lit = !!flashes[`symbol:${s.id}`];
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
                  lit ? "bg-yellow-500/15 ring-2 ring-yellow-400" : "bg-slate-800/60"
                }`}
              >
                <div className="size-9 shrink-0 rounded-md overflow-hidden bg-slate-900 border border-slate-700">
                  <SymbolFace symId={s.id} small />
                </div>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="text-xs font-semibold truncate">{symbolName(s.id, language)}</div>
                  <div className="text-[10px] text-slate-500">
                    {totalWeight > 0 && weights[i] > 0 ? `${((weights[i] / totalWeight) * 100).toFixed(1)}%` : tr("gone")}
                  </div>
                </div>
                <div className="text-right leading-tight">
                  <div className={`text-sm font-bold ${lit ? "text-green-300" : "text-yellow-300"}`}>
                    {symbolValue(run, s.id)} ₽
                    {weights[i] > 0 && symbolValue(run, s.id) > s.baseValue && <span className="text-green-400 text-[10px]"> ↑</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </Board>

        {/* Machine cabinet */}
        <div className="relative rounded-2xl border-4 border-yellow-600/80 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl p-4 pb-5">
          <div className="absolute inset-x-0 -top-3 mx-auto w-fit rounded-full border border-yellow-600/60 bg-slate-950 px-4 py-0.5 text-[11px] font-bold tracking-widest text-yellow-500 whitespace-nowrap">
            TEAM ROCKET SLOT MACHINE
          </div>

          <div className="relative mt-1">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
              {displayGrid.map((symId, i) => (
                <div key={i} className="aspect-[5/4]">
                  <SymbolFace
                    symId={symId}
                    spinning={phase === "spinning" && i % GRID_COLS >= stoppedCols}
                    won={winCells.has(i)}
                    golden={!spinning && goldenCells.has(i)}
                    chain={!spinning && chainCells.has(i)}
                  />
                </div>
              ))}
            </div>

            {/* Floating payout popups */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
              {popups.map((p) => (
                <div
                  key={p.id}
                  className={`absolute font-black animate-damage-popup whitespace-nowrap drop-shadow-lg ${
                    p.kind === "coins"
                      ? "text-yellow-300 text-2xl"
                      : p.kind === "tickets"
                        ? "text-sky-300 text-lg"
                        : "text-emerald-300 text-xs"
                  }`}
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
                >
                  {p.text}
                </div>
              ))}
            </div>
          </div>

          {/* Lever + help. While the round's pulls haven't been paid for yet
              (awaitingChoice) the pull picker takes the lever's place: buy 3
              fast pulls (5% of the quota) or 7 slower ones (10%). Choosing
              makes the picker disappear and the lever reappear. */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {run.awaitingChoice ? (
              [3, 7].map((m) => {
                const coinCost = roundCost(run, m);
                const withCoins = run.coins >= coinCost; // otherwise the ticket fallback applies
                const price = withCoins ? `${fmt(coinCost)} ₽` : `${ROUND_TICKET_COSTS[m]} 🎫`;
                const canBuy =
                  withCoins || (run.tickets || 0) >= ROUND_TICKET_COSTS[m];
                return (
                  <Tooltip key={m}>
                    <TooltipTrigger
                      render={
                        <button
                          onClick={() => chooseRoundMode(m)}
                          disabled={!canAct || !canBuy}
                          className={`w-28 rounded-xl border-2 py-3 font-black transition-all disabled:opacity-40 ${
                            m === 3
                              ? "border-emerald-600/60 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20"
                              : "border-yellow-600/60 bg-yellow-500/10 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/20"
                          }`}
                        >
                          <span className="block text-lg leading-none">{m}</span>
                          <span className="mt-1 block text-[11px] font-bold leading-none opacity-80">{price}</span>
                        </button>
                      }
                    />
                    <TooltipContent side="bottom">
                      {m} {tr("pulls")} — {price}
                    </TooltipContent>
                  </Tooltip>
                );
              })
            ) : (
              <button
                onClick={pullLever}
                disabled={!canPull}
                className={`rounded-xl px-10 py-3 font-black text-lg tracking-wider transition-all ${
                  canPull
                    ? "bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_4px_0_rgb(127_29_29)] hover:brightness-110 active:translate-y-0.5 active:shadow-none"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                {phase === "spinning" ? "···" : tr("PULL")}
              </button>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setModal("help")}
                    className="size-9 rounded-full border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
                  >
                    ?
                  </button>
                }
              />
              <TooltipContent>{tr("How to play")}</TooltipContent>
            </Tooltip>
          </div>

          {/* Rotom Phone bar */}
          <div className="mt-4 flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2">
            <span className="text-xl shrink-0">📱</span>
            <Tooltip>
              <TooltipTrigger
                render={<p className="flex-1 min-w-0 text-xs text-slate-300 italic truncate cursor-default">“{phoneMsg}”</p>}
              />
              <TooltipContent side="top" className="max-w-64 text-wrap">
                {phoneMsg}
              </TooltipContent>
            </Tooltip>
            <button
              onClick={() => canAct && setModal("shop")}
              disabled={!canAct}
              className="shrink-0 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              {tr("Shop")}
            </button>
            <button
              onClick={openAtm}
              disabled={!canAct}
              className="shrink-0 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              ATM
            </button>
          </div>

          {/* Charms tray */}
          <div className="mt-3 flex items-center gap-2 flex-wrap min-h-9">
            <span className="text-[10px] uppercase tracking-wide text-slate-500 mr-1">{tr("Charms")}</span>
            {run.charms.length === 0 && <span className="text-[11px] text-slate-600">—</span>}
            {run.charms.map((c) => (
              <Tooltip key={c}>
                <TooltipTrigger
                  render={
                    <div className="rounded-md border border-slate-700 bg-slate-800/70 px-1.5 py-1 cursor-default">
                      <CharmIcon charmId={c} className="size-5" />
                    </div>
                  }
                />
                <TooltipContent side="bottom" className="max-w-56 flex-col items-stretch gap-0.5">
                  <span className="font-bold">{tr(CHARM_NAME_KEYS[c])}</span>
                  <span className="opacity-80">{tr(`${c}-desc`)}</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Right column: patterns board + SFX volume control */}
        <div className="space-y-4">
          <Board title={tr("Patterns")}>
            {PATTERN_TYPES.map((type) => {
              const lit = !!flashes[`pattern:${type}`];
              return (
                <div
                  key={type}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
                    lit
                      ? "bg-yellow-500/15 ring-2 ring-yellow-400"
                      : scoredTypes.has(type)
                        ? "bg-yellow-500/15 ring-1 ring-yellow-500/60"
                        : "bg-slate-800/60"
                  }`}
                >
                  <MiniPattern type={type} />
                  <div className="flex-1 text-[11px] font-semibold">{type.replace("_", "-")}</div>
                  <div className={`text-sm font-bold ${lit ? "text-green-300" : scoredTypes.has(type) ? "text-yellow-300" : "text-slate-300"}`}>
                    ×{patternMult(run, type)}
                  </div>
                </div>
              );
            })}
          </Board>

          {/* Sound-effects volume (persisted): tap the speakers for mute/max,
              or drag the slider. Applies to every sfx in the game. */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">{tr("Sound volume")}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setVolumeState(0)}
                      disabled={volume === 0}
                      className="shrink-0 text-base w-6 text-center transition-transform enabled:hover:scale-110 disabled:opacity-50"
                    >
                      {volume === 0 ? "🔇" : "🔈"}
                    </button>
                  }
                />
                <TooltipContent>{tr("Mute")}</TooltipContent>
              </Tooltip>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolumeState(Number(e.target.value))}
                aria-label={tr("Sound volume")}
                className="min-w-0 w-full flex-1 accent-yellow-500"
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setVolumeState(1)}
                      disabled={volume === 1}
                      className="shrink-0 text-base w-6 text-center transition-transform enabled:hover:scale-110 disabled:opacity-50"
                    >
                      🔊
                    </button>
                  }
                />
                <TooltipContent>100%</TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-1 text-center text-[10px] text-slate-600">{Math.round(volume * 100)}%</div>
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-6xl mt-4 text-center text-[11px] text-slate-600">
        {records.wins > 0
          ? `${tr("Escapes")}: ${records.wins} · ${tr("Fastest escape")}: ${tr("round")} ${records.bestWinRound}`
          : tr("No one has ever escaped this basement... probably")}
      </p>

      {/* Sound effects license attributions (Pixabay content license). */}
      <p className="mx-auto max-w-6xl mb-2 text-center text-[10px] text-slate-700">
        Sound Effects by{" "}
        <a
          href="https://pixabay.com/users/victorabdo-24752366/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=232536"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-500 transition-colors"
        >
          victor abdo
        </a>{" "}
        and{" "}
        <a
          href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=87313"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-500 transition-colors"
        >
          freesound_community
        </a>{" "}
        from{" "}
        <a
          href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=232536"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-500 transition-colors"
        >
          Pixabay
        </a>
      </p>

      {/* JACKPOT banner */}
      {jackpotBanner && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="animate-jackpot text-center">
            <div className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
              JACKPOT!
            </div>
            <div className="mt-2 text-xl font-bold text-yellow-300">{tr("FULL HOUSE!")}</div>
          </div>
        </div>
      )}

      {/* ---------------- Modals ---------------- */}
      {modal === "shop" && (
        <Overlay title={tr("Rotom Phone Shop")} onClose={() => setModal(null)}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-sky-300 font-bold">🎫 {fmt(run.tickets)}</div>
            <button
              onClick={doReroll}
              disabled={run.coins < rerollCost(run) || phase !== "idle"}
              className="rounded-lg border border-sky-600 px-3 py-1 text-xs text-sky-300 hover:bg-sky-600/20 disabled:opacity-40 transition-colors"
            >
              ⟳ {tr("Reroll")} ({fmt(rerollCost(run))} ₽)
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {offers.map((offer, i) => (
              <OfferCard key={`${offer.kind}-${offer.id || offer.target}-${i}`} offer={offer} />
            ))}
            {offers.length === 0 && (
              <p className="col-span-2 text-center text-sm text-slate-500 py-6">{tr("Sold out! Come back next round")}</p>
            )}
          </div>
          {run.charms.length > 0 && (
            <>
              <h4 className="mt-4 mb-2 text-xs uppercase tracking-wide text-slate-500">
                {tr("Your charms")} ({run.charms.length}/{MAX_CHARMS})
              </h4>
              <div className="flex flex-wrap gap-2">
                {run.charms.map((c) => {
                  const refund = Math.max(1, Math.floor(charmCost(c) / 2));
                  return (
                    <Tooltip key={c}>
                      <TooltipTrigger
                        render={
                          <button
                            onClick={() => sellCharm(c)}
                            className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <CharmIcon charmId={c} className="size-5" />
                            <span className="text-[10px] text-slate-400">+{refund}🎫</span>
                          </button>
                        }
                      />
                      <TooltipContent side="bottom" className="max-w-56 text-wrap">
                        {tr(`${c}-desc`)} — {tr("sell for")} {refund} 🎫
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              <p className="mt-1 text-[10px] text-slate-600">{tr("Click a charm to sell it")}</p>
            </>
          )}
        </Overlay>
      )}

      {(modal === "atm" || modal === "deadline") && (
        <Overlay
          title={modal === "deadline" ? tr("QUOTA DEADLINE!") : tr("ATM")}
          onClose={modal === "atm" ? () => setModal(null) : undefined}
        >
          <p className="mb-3 text-sm text-red-300 font-bold">
            {tr("Giovanni")}: “
            {run.coins >= remainingQuota ? tr("Pay up, and maybe I'll let you keep pulling.") : tr("You're short, trainer.")}”
          </p>
          <div className="space-y-1 text-sm mb-4">
            <Row label={tr("Quota due")} value={`${fmt(remainingQuota)} ₽`} color="text-red-400" />
            {/* Current deposit and the interest it pays out after each round. */}
            <Row label={tr("Deposit")} value={`${fmt(run.quotaPaid || 0)} ₽`} color="text-emerald-300" />
            <Row label={tr("Interest (7%)")} value={`+${fmt(depositInterest(run))} ₽`} color="text-emerald-400" small />
            <Row label={tr("Your coins")} value={`${fmt(run.coins)} ₽`} color="text-yellow-300" />
            <Row label={tr("Remaining debt")} value={`${fmt(run.debt)} ₽`} />
            {modal === "deadline" && run.debt - payAmount > 0 && (
              <Row label={tr("Interest after payment")} value={`+${fmt(interestForDebt(run.debt - payAmount))} ₽`} color="text-red-300" small />
            )}
          </div>
          {/* The MAX ceiling is clamped by atmMaxDeposit(): enough to finish
              the quota when possible, otherwise everything except one more
              round's entry fee. At the deadline there is no next round to
              save for, so the ceiling is just the remaining quota. */}
          <input
            type="range"
            min={modal === "deadline" ? Math.min(run.coins, remainingQuota) : 0}
            max={modal === "deadline" ? Math.min(run.coins, remainingQuota) : atmMaxDeposit(run)}
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1 mb-4">
            <button onClick={() => setPayAmount(Math.min(run.coins, remainingQuota))} className="hover:text-slate-200">
              {tr("MIN")}
            </button>
            <span className="text-base font-black text-yellow-300">{fmt(payAmount)} ₽</span>
            <button
              onClick={() => setPayAmount(modal === "deadline" ? Math.min(run.coins, remainingQuota) : atmMaxDeposit(run))}
              className="hover:text-slate-200"
            >
              {tr("MAX")}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => makePayment(payAmount, { deadline: modal === "deadline" })}
              disabled={
                modal === "deadline"
                  ? !((run.quotaPaid || 0) + payAmount >= quota) && !hasFocusBand
                  : payAmount <= 0
              }
              className="flex-1 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-2 font-bold transition-colors"
            >
              {tr("Pay")}
            </button>
            {modal === "atm" && (
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 px-4 py-2 text-sm transition-colors"
              >
                {tr("Keep")}
              </button>
            )}
          </div>
          {modal === "deadline" && hasFocusBand && (run.quotaPaid || 0) + payAmount < quota && (
            <p className="mt-2 text-xs text-emerald-300">🎗️ {tr("Focus Band: wipes the quota for free — your wallet is emptied, but you get 7 pulls")}</p>
          )}
        </Overlay>
      )}

      {modal === "help" && (
        <Overlay title={tr("How to play")} onClose={() => setModal(null)}>
          <ul className="list-disc pl-4 space-y-2 text-sm text-slate-300">
            <li>{tr("Each round, buy 3 pulls (5% of the quota) or 7 (10%) — paying with coins earns 4 tickets (3-pull) or 2 (7-pull). Can't afford a round? It costs 1 ticket (3 pulls) or 2 tickets (7 pulls) instead. No coins and no tickets? You lose.")}</li>
            <li>{tr("Clear a quota early for a bonus: 7% of the quota + 4 tickets, plus 1 extra ticket per round still left. Paying right on the deadline earns no bonus.")}</li>
            <li>{tr("Patterns pay coins only. Tickets come from clearing quotas — spend them on charms and permanent upgrades.")}</li>
            <li>{tr("Unpaid debt grows 8% interest at every deadline — but deposits earn 7% interest, paid by the ATM after every round.")}</li>
            <li>{tr("Clear the whole debt to escape. That's the win.")}</li>
            <li>{tr("Smaller patterns are swallowed by bigger ones that contain them — chase the big shapes!")}</li>
          </ul>
        </Overlay>
      )}

      {modal === "over" && (
        <Overlay title={tr("GAME OVER")}>
          <div className="text-center space-y-3">
            <div className="text-6xl">🕳️</div>
            <p className="text-sm text-slate-300">
              {tr("You couldn't pay the quota. Team Rocket repossessed your team AND your shoes.")}
            </p>
            <EndStats />
            <button onClick={restart} className="rounded-xl bg-red-600 hover:bg-red-500 px-8 py-3 font-black tracking-wide transition-colors">
              {tr("Try again")}
            </button>
          </div>
        </Overlay>
      )}

      {modal === "won" && (
        <Overlay title={tr("DEBT CLEARED!")}>
          <div className="text-center space-y-3">
            <div className="text-6xl">🗝️</div>
            <p className="text-sm text-slate-300">
              {tr("The vault door creaks open. You walk out richer than Giovanni — he'll remember this.")}
            </p>
            <EndStats />
            <button
              onClick={restart}
              className="rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-8 py-3 font-black tracking-wide transition-colors"
            >
              {tr("Play again")}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );

  // ---- small local render helpers ----
  function StatusChip({ label, value, color }) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className={`font-bold truncate ${color}`}>{value}</div>
      </div>
    );
  }

  function Row({ label, value, color = "", small }) {
    return (
      <div className={`flex justify-between ${small ? "text-xs" : ""}`}>
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
      </div>
    );
  }

  function Board({ title, children }) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">{title}</h3>
        <div className="space-y-1">{children}</div>
      </div>
    );
  }

  function EndStats() {
    return (
      <div className="text-xs text-slate-500 space-y-0.5">
        <div>{tr("Round reached")}: {run.totalRounds}</div>
        <div>{tr("Total earned")}: {fmt(run.stats.totalEarned)} ₽</div>
        <div>{tr("Best single pull")}: {fmt(run.stats.biggestWin)} ₽</div>
        <div>{tr("Jackpots")}: {run.stats.jackpots}</div>
      </div>
    );
  }

  function OfferCard({ offer }) {
    const affordable = run.tickets >= offer.cost;
    let icon, name, desc;
    if (offer.kind === "charm") {
      name = tr(CHARM_NAME_KEYS[offer.id]);
      desc = tr(`${offer.id}-desc`);
      icon = <CharmIcon charmId={offer.id} className="size-10" />;
    } else if (offer.target === "global") {
      name = tr("Symbols Multiplier");
      const lvl = run.upgrades.global || 0;
      desc = `${tr("All payouts")} ×${Math.pow(GLOBAL_MULT_STEP, lvl).toFixed(2)} → ×${Math.pow(GLOBAL_MULT_STEP, lvl + 1).toFixed(2)}`;
      icon = <span className="text-3xl leading-none">✖️</span>;
    } else {
      const [kind, target] = offer.target.split(":");
      if (kind === "symbol") {
        name = symbolName(target, language);
        desc = `${tr("value")} ${symbolValue(run, target)} → ${symbolValue(run, target) + 1}`;
        icon = (
          <div className="size-10 rounded-md overflow-hidden bg-slate-900 border border-slate-700 p-0.5">
            <SymbolFace symId={target} small />
          </div>
        );
      } else {
        name = `${target.replace("_", "-")} ×`;
        desc = `${tr("multiplier")} ×${patternMult(run, target)} → ×${patternMult(run, target) + 1}`;
        icon = (
          <div className="scale-[1.7] mx-2 my-1">
            <MiniPattern type={target} />
          </div>
        );
      }
    }
    return (
      <button
        onClick={() => buyOffer(offer)}
        disabled={!affordable}
        className={`flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
          affordable
            ? "border-slate-600 bg-slate-800/70 hover:border-sky-400 hover:bg-sky-500/10"
            : "border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed"
        }`}
      >
        <div className="shrink-0 size-10 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold leading-tight">{name}</div>
          <div className="text-[11px] text-slate-400 leading-snug">{desc}</div>
        </div>
        <div className={`shrink-0 text-sm font-black ${affordable ? "text-sky-300" : "text-slate-600"}`}>{offer.cost}🎫</div>
      </button>
    );
  }
}
