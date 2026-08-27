import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { getSlotsProgress, saveSlotsProgress } from "../lib/auth";
import HomeButton from "./HomeButton";
import LanguageSelector from "./LanguageSelector";
import AuthScreen from "./AuthScreen";
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
  ROUND_MODES,
  ROUND_TICKET_COSTS,
  ROUNDS_PER_QUOTA,
  generateShopOffers,
  rerollShop,
  charmCost,
  charmSlots,
  nextDebt,
  rerollCost,
  AMULET_COIN_CHANCE,
  AMULET_COIN_LUCK,
  SPELL_TAG_LUCK,
  ODD_KEYSTONE_CHANCE,
  PARCEL_CHANCE,
  METRONOME_LUCK,
  METRONOME_LUCK_STEP,
  BRIGHT_POWDER_TRIGGERS,
  BRIGHT_POWDER_LUCK,
  FOCUS_SASH_EXTRA_ROUNDS,
  DEEP_SEA_DROUGHT,
  depositInterest,
  rollModifiers,
  randomTriggerChance,
  discardCharm,
  forceGridShape,
  payoutMult,
  symbolsMult,
  symbolsMultLevel,
  patternsMult,
  BASE_PATTERN_MULT,
  DRIVE_EVERY_PULLS,
  SHOCK_DRIVE_LUCK,
  CHILL_DRIVE_EXTRA_PULLS,
  CHOICE_STREAK,
  ADAMANT_MINT_FREE_PATTERNS,
  SASSY_MINT_PATTERNS,
  ELECTRIC_SEED_MIN_MULT,
  PSYCHIC_SEED_MIN_MULT,
  GREEN_SCARF_PATTERN_MULT,
  GREEN_SCARF_STEP,
  YELLOW_SCARF_STEP,
  LEFTOVERS_ROUNDS,
  POISON_BARB_SEVENS,
  GIRATINA_UNLOCK_CYCLE,
  CHARM_IDS,
} from "../lib/pokeslots";

// PokéSlots — CloverPit-inspired slot machine roguelite. The run rules live in
// src/lib/pokeslots.js; this component renders the machine, the two boards,
// the Rotom Phone shop/ATM and the deadline/end screens.
//
// Async flows (reel stops, deadline popup) read state through runRef so they
// never depend on stale closures, and no setState updater performs side
// effects, keeping behaviour identical under StrictMode.

const fmt = (n) => {
  const v = Math.floor(n);
  if (v >= 1e10) return v.toExponential(2);
  return v.toLocaleString("en-US");
};
// Charm item sprites are self-hosted copies of the PokeAPI item sprites
// (public/slots/items/) — no third-party requests during a run.
const ITEM_SPRITES = "/slots/items";
const GLOBAL_MULT_STEP = 1.5;
// The pulls-left strip always shows this many slots; slots beyond the bought
// round mode stay switched off. Chill Drive raises the cap by its extra pulls.
const BASE_MAX_PULL_SLOTS = Math.max(...Object.values(ROUND_MODES).map((m) => m.pulls));

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
  "focus-sash": "charm-focus-sash",
  "lagging-tail": "charm-lagging-tail",
  "arceus-statue": "charm-arceus-statue",
  "black-sludge": "charm-black-sludge",
  metronome: "charm-metronome",
  "heal-powder": "charm-heal-powder",
  "zoom-lens": "charm-zoom-lens",
  guidebook: "charm-guidebook",
  "star-piece": "charm-star-piece",
  "odd-keystone": "charm-odd-keystone",
  "bright-powder": "charm-bright-powder",
  "deep-sea-tooth": "charm-deep-sea-tooth",
  "point-card": "charm-point-card",
  parcel: "charm-parcel",
  "poffin-case": "charm-poffin-case",
  "douse-drive": "charm-douse-drive",
  "shock-drive": "charm-shock-drive",
  "burn-drive": "charm-burn-drive",
  "chill-drive": "charm-chill-drive",
  "choice-scarf": "charm-choice-scarf",
  "modest-mint": "charm-modest-mint",
  "bold-mint": "charm-bold-mint",
  "adamant-mint": "charm-adamant-mint",
  "sassy-mint": "charm-sassy-mint",
  "electric-seed": "charm-electric-seed",
  "psychic-seed": "charm-psychic-seed",
  "misty-seed": "charm-misty-seed",
  "grassy-seed": "charm-grassy-seed",
  leftovers: "charm-leftovers",
  "poison-barb": "charm-poison-barb",
  "twisted-spoon": "charm-twisted-spoon",
  "red-scarf": "charm-red-scarf",
  "blue-scarf": "charm-blue-scarf",
  "pink-scarf": "charm-pink-scarf",
  "green-scarf": "charm-green-scarf",
  "yellow-scarf": "charm-yellow-scarf",
  "dragon-fang": "charm-dragon-fang",
  "red-card": "charm-red-card",
  "comet-shard": "charm-comet-shard",
  "dragon-skull": "charm-dragon-skull",
  "pearl-string": "charm-pearl-string",
  "dark-stone": "charm-dark-stone",
  "god-stone": "charm-god-stone",
};

function CharmIcon({ charmId, className }) {
  const [failed, setFailed] = useState(false);
  const charm = CHARMS[charmId];
  // `sprite` is a full URL (Shiny charms use the shiny HOME render);
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

function SymbolFace({ symId, spinning, won, small, golden, chain, morphTo }) {
  const [failed, setFailed] = useState(false);
  // morphStage: 0 = idle, 1 = flash Ditto sprite, 2 = morphed to target
  const [morphStage, setMorphStage] = useState(0);
  const sym = SYMBOL_BY_ID[symId];
  // Ditto morph: random → Ditto sprite → target symbol (two 120ms steps)
  useEffect(() => {
    if (morphTo && morphStage === 0) {
      const t = setTimeout(() => setMorphStage(1), 120);
      return () => clearTimeout(t);
    }
  }, [morphTo, morphStage]);
  useEffect(() => {
    if (morphStage === 1) {
      const t = setTimeout(() => setMorphStage(2), 600);
      return () => clearTimeout(t);
    }
  }, [morphStage]);
  const cls = small
    ? "flex items-center justify-center w-full h-full"
    : // Modifier cells keep their normal border — only the ✨/🔗 corner badges
      // mark them, so they don't compete with the win highlight.
      `relative flex items-center justify-center rounded-lg border-2 bg-slate-900 overflow-hidden transition-all duration-150 ${
        won ? "border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.7)] scale-[1.04] z-10" : "border-slate-700"
      }`;
  if (!sym) return <div className={cls} />;
  const badges = (
    <>
      {golden && <span className="absolute top-0.5 right-1 text-[10px] leading-none">✨</span>}
      {chain && <span className="absolute bottom-0.5 right-1 text-[10px] leading-none">🔗</span>}
    </>
  );
  if (failed) return <div className={cls}>{badges}<span className={small ? "text-lg" : "text-2xl sm:text-3xl"}>{sym.emoji}</span></div>;
  // Stage 0: show original symId (the random placeholder)
  // Stage 1: flash the Ditto sprite
  // Stage 2: morph into the target symbol
  const imgSymId = !morphTo ? symId : morphStage === 0 ? symId : morphStage === 1 ? "ditto" : morphTo;
  const imgSym = SYMBOL_BY_ID[imgSymId];
  if (!imgSym) return <div className={cls}>{badges}</div>;
  return (
    <div className={cls}>
      {badges}
      <img
        src={symbolSprite(imgSymId)}
        alt={imgSymId}
        draggable="false"
        onError={() => setFailed(true)}
        className={`object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] ${
          spinning ? "animate-reel-blur" : ""
        } ${morphTo && morphStage > 0 ? "animate-ditto-morph" : ""} ${
          small ? "max-w-full max-h-full" : "w-[78%] h-[78%]"
        }`}
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
  const [phase, setPhase] = useState("idle"); // idle | spinning | ditto-reveal | ended
  const [displayGrid, setDisplayGrid] = useState(run.grid);
  const [stoppedCols, setStoppedCols] = useState(GRID_COLS);
  const [revealingDittos, setRevealingDittos] = useState(new Map());
  const [winCells, setWinCells] = useState(new Set());
  const [scoredTypes, setScoredTypes] = useState(new Set());
  const [popups, setPopups] = useState([]);
  const [firedCharms, setFiredCharms] = useState(new Set());
  const [trayPopups, setTrayPopups] = useState([]); // { id, charmId, text } — floating item-icon popups over the charm tray
  const [giraRelease, setGiraRelease] = useState(false);
  const [jackpotBanner, setJackpotBanner] = useState(false);
  // Stable Ditto→random mappings computed once per spin so non-pattern Dittos
  // don't flicker through different random symbols every 70ms during the reel.
  const dittoMapRef = useRef(new Map());
  // Upgrade purchases briefly light up the matching row on the Symbols /
  // Patterns boards ("symbol:<id>" / "pattern:<type>" → true) so the player
  // can see exactly what just got better behind the shop modal.
  const [flashes, setFlashes] = useState({});
  const [modal, setModal] = useState(null); // null | shop | atm | deadline | over | won | help | codex
  const [codexSearch, setCodexSearch] = useState("");
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

  // ------------------------------------------------------------------
  // Cloud saves. Logged-in accounts (same "pokevisa_account" session the
  // Dungeon flow uses) get their run persisted to pokeslots_progress so the
  // run resumes after closing the tab; guests play unsaved. One row per
  // account: `state` = live run JSON (null between runs), `records` = bests.
  // ------------------------------------------------------------------
  const accountIdRef = useRef(null);
  const [accountId, setAccountId] = useState(null);
  const [accountName, setAccountName] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [ready, setReady] = useState(false);

  // Load (or reload) an account's saved run + records and hydrate the UI.
  const loadProgress = useCallback(async (id) => {
    setReady(false);
    try {
      const row = await getSlotsProgress(id);
      // Merge remote records with local ones (better value wins) so bests
      // follow the account across browsers.
      if (row?.records && Object.keys(row.records).length) {
        const local = loadRecords();
        const remote = row.records;
        const merged = {
          wins: Math.max(local.wins || 0, remote.wins || 0),
          bestWinRound:
            local.bestWinRound == null
              ? remote.bestWinRound ?? null
              : remote.bestWinRound == null
                ? local.bestWinRound
                : Math.min(local.bestWinRound, remote.bestWinRound),
          bestPayout: Math.max(local.bestPayout || 0, remote.bestPayout || 0),
        };
        saveRecord(merged);
        setRecords(merged);
      }
      if (row?.state && typeof row.state === "object") {
        const saved = { ...createRunState(), ...row.state };
        // Edge case: tab closed between the last pull and the round-end
        // timer — avoid a stuck "no pulls, no picker" state.
        if (!saved.awaitingChoice && (saved.pullsLeft || 0) === 0 && (saved.roundsLeft || 0) === 0) {
          saved.awaitingChoice = true;
        }
        setRun(saved);
        runRef.current = saved;
        setOffers(generateShopOffers(saved));
        setDisplayGrid(saved.grid);
      }
    } catch (err) {
      console.error("Failed to load PokéSlots progress:", err);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let acc = null;
    try {
      acc = JSON.parse(localStorage.getItem("pokevisa_account"));
    } catch {}
    if (!acc?.id) {
      setReady(true);
      return;
    }
    accountIdRef.current = acc.id;
    setAccountId(acc.id);
    setAccountName(acc.display_name);
    loadProgress(acc.id);
  }, [loadProgress]);

  // Login from the header: store the session under the same localStorage key
  // the Dungeon flow uses, then hydrate the account's saved run.
  const handleAuth = (acc) => {
    try {
      localStorage.setItem("pokevisa_account", JSON.stringify(acc));
    } catch {}
    accountIdRef.current = acc.id;
    setAccountId(acc.id);
    setAccountName(acc.display_name);
    setShowAuth(false);
    loadProgress(acc.id);
  };

  // Logout: the cloud copy stays on the account; the local session continues
  // as a fresh guest run that isn't saved.
  const handleLogout = () => {
    try {
      localStorage.removeItem("pokevisa_account");
    } catch {}
    accountIdRef.current = null;
    setAccountId(null);
    setAccountName(null);
    restart(); // persistRun is a no-op for guests, so this only resets the UI
  };

  // Persist the live run (called on every committed state change).
  const persistRun = (next) => {
    const id = accountIdRef.current;
    if (!id) return;
    saveSlotsProgress(id, next, loadRecords()).catch(() => {});
  };
  // Run over (win/lose/restart): keep the records, clear the saved run.
  const persistRecords = (rec) => {
    const id = accountIdRef.current;
    if (!id) return;
    saveSlotsProgress(id, null, rec).catch(() => {});
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

    // Amulet Coin: 10% chance per spin (doubled by Lagging Tail) to refund the
    // pull and charge it with Luck. Spell Tag: the round's LAST pull always
    // gets +7 Luck. Pending Luck from Metronome / Bright Powder (state.luck)
    // is consumed here too — everything feeds rollGrid as guaranteed cells.
    const netPulls = cur.pullsLeft - 1;
    const amuletTrigger =
      cur.charms.includes("amulet-coin") && Math.random() < randomTriggerChance(cur, AMULET_COIN_CHANCE);
    const pullsLeft = amuletTrigger ? cur.pullsLeft : netPulls;
    const spellTrigger = cur.charms.includes("spell-tag") && pullsLeft === 0;
    // Charm activations that fire on this pull — counted toward the Bright
    // Powder's 5-trigger meter (resolvePull adds its own).
    let triggerCount = (amuletTrigger ? 1 : 0) + (spellTrigger ? 1 : 0);
    // Discard draft: consumed charms go through discardCharm so Black Sludge
    // feeds on them (+1 base value per symbol, permanently).
    const draft = { charms: cur.charms, permLevels: cur.permLevels };
    let sludgeFed = false;

    // The four drives key off the lifetime pull counter (every 7th pull).
    const pullNum = cur.stats.pullsUsed + 1;
    const driveHit = pullNum % DRIVE_EVERY_PULLS === 0;
    // Shock Drive: every 7th pull is charged with Luck +7.
    const shockTrigger = driveHit && cur.charms.includes("shock-drive");
    if (shockTrigger) triggerCount += 1;

    // Contest scarves ("Triggers Randomly", doubled by Lagging Tail): Luck
    // for THIS pull. Pink grows with this quota's rerolls, Green with its
    // stored bonus (fed by +3 patterns when it fires), Yellow with the rounds
    // skipped on the previous quota. Red/Blue wear out after N activations
    // and discard themselves (feeding Black Sludge).
    const scarves = {};
    const scarfFires = { ...(cur.scarfFires || {}) };
    for (const c of cur.charms) {
      const cfg = CHARMS[c].scarf;
      if (!cfg || Math.random() >= randomTriggerChance(cur, cfg.chance)) continue;
      let luck = cfg.luck;
      if (cfg.source === "rerolls") luck += (cur.rerollsThisCycle || 0) * cfg.step;
      if (cfg.source === "patterns") luck += cur.greenScarfBonus || 0;
      if (cfg.source === "skipped") luck += cur.yellowScarfBonus || 0;
      scarves[c] = luck;
      triggerCount += 1;
      if (cfg.maxFires) {
        scarfFires[c] = (scarfFires[c] || 0) + 1;
        if (scarfFires[c] >= cfg.maxFires) {
          sludgeFed = discardCharm(draft, c) || sludgeFed;
          delete scarfFires[c];
        }
      }
    }
    const scarfLuck = Object.values(scarves).reduce((a, b) => a + b, 0);

    // Dragon Fang: +10 Luck when Giratina appeared on the previous pull.
    const dragonFangTrigger = cur.dragonFangPending && cur.charms.includes("dragon-fang");
    if (dragonFangTrigger) triggerCount += 1;

    const luckGain =
      (cur.luck || 0) +
      (amuletTrigger ? AMULET_COIN_LUCK : 0) +
      (spellTrigger ? SPELL_TAG_LUCK : 0) +
      (shockTrigger ? SHOCK_DRIVE_LUCK : 0) +
      scarfLuck +
      (dragonFangTrigger ? 10 : 0);

    // rollGrid reads luck from its state argument; the stored run state keeps
    // luck at 0 so nothing re-consumes it later.
    let finalGrid = rollGrid({ ...cur, luck: luckGain });

    // Arceus Statue: this pull is a guaranteed JACKPOT — the statue discards
    // itself the moment it grants it.
    let luckyEggPending = cur.luckyEggPending || false;
    if (cur.charms.includes("arceus-statue")) {
      finalGrid = forceGridShape(cur, "JACKPOT", finalGrid).grid;
      sludgeFed = discardCharm(draft, "arceus-statue");
      triggerCount += 1;
      addPopup({ x: 50, y: 20, text: "🗿 JACKPOT!", kind: "pattern" });
      pushMsg(tr("The Arceus Statue glows — the reels obey."));
      luckyEggPending = false;
    } else {
      // Burn Drive (ZIG+ZAG every 7th pull), Deep Sea Tooth (ABOVE/BELOW
      // after a 3-pull drought), Star Piece (center-row HOR-XL after an
      // empty pull) and Lucky Egg (EYE after 3 consecutive rare-scored pulls)
      // share ONE forced symbol so guarantees on the same pull never break each other.
      let forcedSymbol = null;
      if (luckyEggPending && cur.charms.includes("lucky-egg")) {
        const forced = forceGridShape(cur, "EYE", finalGrid);
        finalGrid = forced.grid;
        forcedSymbol = forced.symbol;
        triggerCount += 1;
        addPopup({ x: 50, y: 80, text: "👁️ EYE", kind: "pattern" });
        luckyEggPending = false;
      }
      if (driveHit && cur.charms.includes("burn-drive")) {
        const forced = forceGridShape(cur, "ZIG_ZAG", finalGrid, forcedSymbol);
        finalGrid = forced.grid;
        forcedSymbol = forced.symbol;
        triggerCount += 1;
        addPopup({ x: 50, y: 80, text: "🔥 ZIG+ZAG", kind: "pattern" });
      }
      if (cur.charms.includes("deep-sea-tooth") && (cur.bigDrought || 0) >= DEEP_SEA_DROUGHT) {
        const forced = forceGridShape(cur, Math.random() < 0.5 ? "ABOVE" : "BELOW", finalGrid, forcedSymbol);
        finalGrid = forced.grid;
        forcedSymbol = forced.symbol;
        triggerCount += 1;
        addPopup({ x: 50, y: 74, text: "🦷", kind: "pattern" });
      }
      if (cur.charms.includes("star-piece") && cur.lastPullEmpty) {
        finalGrid = forceGridShape(cur, "CENTER_ROW", finalGrid, forcedSymbol).grid;
        triggerCount += 1;
        addPopup({ x: 50, y: 48, text: "🌟", kind: "pattern" });
      }
    }

    // Shiny/Chain modifiers are rolled per cell for every fresh grid and
    // stored so scoring (resolvePull) and rendering read the same flags.
    // Poison Barb: a grid with 7+ Sevipers turns every one of them Shiny.
    let { golden, chain } = rollModifiers(cur, finalGrid);
    if (cur.charms.includes("poison-barb")) {
      const sevens = finalGrid.map((s, i) => (s === "seven" ? i : -1)).filter((i) => i >= 0);
      if (sevens.length >= POISON_BARB_SEVENS) golden = [...new Set([...golden, ...sevens])];
    }
    setRun((r) => ({
      ...r,
      charms: draft.charms,
      permLevels: draft.permLevels,
      pullsLeft,
      luck: 0,
      goldenCells: golden,
      chainCells: chain,
      lastPullEmpty: false,
      scarfFires,
      scarfFired: Object.keys(scarves).length > 0 ? scarves : null,
      luckyEggPending,
      dragonFangPending: false,
    }));
    runRef.current = {
      ...cur,
      charms: draft.charms,
      permLevels: draft.permLevels,
      pullsLeft,
      luck: 0,
      goldenCells: golden,
      chainCells: chain,
      lastPullEmpty: false,
      scarfFires,
      scarfFired: Object.keys(scarves).length > 0 ? scarves : null,
      luckyEggPending,
      dragonFangPending: false,
    };
    // Persist immediately so a tab closed mid-spin can't replay a free pull.
    persistRun(runRef.current);
    setPhase("spinning");
    setStoppedCols(0);
    setWinCells(new Set());
    setScoredTypes(new Set());
    setFiredCharms(new Set());
    setTrayPopups([]);
    playSfx("slot-spin.mp3");
    if (sludgeFed) addPopup({ x: 50, y: 52, text: "🟣 +BASE", kind: "pattern" });
    // Track which charms fired this pull for the tray highlight + icon popups.
    const pullFired = new Set();
    const tray = [];
    let trayId = 0;
    const addTrayPopup = (charmId, text) => { pullFired.add(charmId); tray.push({ id: trayId++, charmId, text }); };
    if (amuletTrigger) addTrayPopup("amulet-coin", "+1 PULL");
    if (spellTrigger) addTrayPopup("spell-tag", `+${SPELL_TAG_LUCK} LUCK`);
    if (shockTrigger) addTrayPopup("shock-drive", `+${SHOCK_DRIVE_LUCK} LUCK`);
    if (dragonFangTrigger) addTrayPopup("dragon-fang", "+10 LUCK");
    for (const [k, v] of Object.entries(scarves)) addTrayPopup(k, `+${v} LUCK`);
    setFiredCharms(pullFired);
    setTrayPopups(tray);
    later(() => setTrayPopups([]), 1500);

    // Blur-cycle uses only symbols the player can actually see at this cycle.
    // Ditto is excluded from the spin animation — it only appears after the
    // reels stop, via a reveal animation that morphs it into its target symbol.
    const blurSyms = SYMBOLS.filter((s) => s.id !== "ditto" && (s.id !== "giratina" || (runRef.current.cycle || 1) >= GIRATINA_UNLOCK_CYCLE));
    // Pre-compute stable random replacements for every Ditto cell so they don't
    // flicker through a new random symbol on each blur tick.
    const stableDitto = new Map();
    for (let i = 0; i < finalGrid.length; i++) {
      if (finalGrid[i] === "ditto") {
        stableDitto.set(i, blurSyms[Math.floor(Math.random() * blurSyms.length)].id);
      }
    }
    dittoMapRef.current = stableDitto;
    let stopped = 0;
    const shuffle = setInterval(() => {
      // Stopped columns show their final symbols (Ditto masked as a stable
      // random symbol so it never flickers); the rest blur-cycle.
      setDisplayGrid(finalGrid.map((sym, i) => {
        if (i % GRID_COLS < stopped) {
          return sym === "ditto" ? stableDitto.get(i) : sym;
        }
        return blurSyms[Math.floor(Math.random() * blurSyms.length)].id;
      }));
    }, 70);

    for (let c = 1; c <= GRID_COLS; c++) {
      later(() => {
        stopped = c;
        setStoppedCols(c);
      }, 420 + (c - 1) * 170);
    }

    later(() => {
      clearInterval(shuffle);

      // Evaluate once to find which Dittos helped a pattern.
      const res = evaluateGrid(runRef.current, finalGrid);
      const dittoMap = new Map();
      for (const d of res.dittoCells) dittoMap.set(d.cell, d.symbol);

      // Replace ALL Ditto cells in the displayed grid with the stable random
      // symbols computed at spin start (dittoMapRef). Pattern Dittos will show
      // a reveal morph to their target; non-pattern Dittos keep the same
      // random symbol they had during the blur — no visible flash.
      const display = [...finalGrid];
      const stableMap = dittoMapRef.current;
      for (let i = 0; i < display.length; i++) {
        if (display[i] === "ditto") {
          display[i] = stableMap.get(i) || "cherry";
        }
      }
      setDisplayGrid(display);

      if (dittoMap.size > 0) {
        setRevealingDittos(dittoMap);
        setPhase("ditto-reveal");
        later(() => {
          setRevealingDittos(new Map());
          const revealed = [...display];
          for (const [cell, sym] of dittoMap) revealed[cell] = sym;
          setDisplayGrid(revealed);
          resolvePull(revealed, { triggers: triggerCount, scarves });
        }, 550);
      } else {
        resolvePull(display, { triggers: triggerCount, scarves });
      }
    }, 420 + (GRID_COLS - 1) * 170 + 260);
  };

  const resolvePull = (finalGrid, pullInfo = {}) => {
    stopSfx("slot-spin.mp3"); // the mp3 outlasts the reel animation
    const cur = runRef.current;
    // Heal Powder: a pull that hits exactly ONE pattern transforms that
    // pattern's symbols into the most valuable symbol and re-scores.
    let grid = finalGrid;
    let res = evaluateGrid(cur, grid);
    let healPowderTrigger = false;
    if (cur.charms.includes("heal-powder") && res.scored.length === 1) {
      const inst = res.scored[0];
      let best = inst.symbol;
      for (const s of SYMBOLS) {
        if (symbolValue(cur, s.id) > symbolValue(cur, best)) best = s.id;
      }
      if (best !== inst.symbol) {
        const healed = [...grid];
        for (const cell of inst.cells) healed[cell] = best;
        grid = healed;
        res = evaluateGrid(cur, healed);
        healPowderTrigger = true;
        setDisplayGrid(healed);
      }
    }

    // Red Card / Pearl String: if a Giratina HOR or DIAG is about to trigger,
    // transform its cells into the most common real symbol and re-evaluate.
    let redCardDiscard = false;
    if (res.giratinaLoss) {
      let transformed = false;
      if (cur.charms.includes("red-card")) {
        transformed = true;
      } else if (cur.charms.includes("pearl-string") && Math.random() < randomTriggerChance(cur, 0.35)) {
        transformed = true;
      }
      if (transformed) {
        const counts = {};
        for (const s of grid) { if (s !== "giratina") counts[s] = (counts[s] || 0) + 1; }
        const majority = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "lemon";
        for (const m of res.scored) {
          if (m.symbol === "giratina" && (m.type === "HOR" || m.type === "DIAG")) {
            for (const cell of m.cells) grid[cell] = majority;
          }
        }
        res = evaluateGrid(cur, grid);
        setDisplayGrid(grid);
        if (cur.charms.includes("red-card") && Math.random() < 0.5) redCardDiscard = true;
      }
    }

    const next = { ...cur, grid };
    if (redCardDiscard) {
      const draft = { charms: next.charms, permLevels: next.permLevels };
      discardCharm(draft, "red-card");
      next.charms = draft.charms;
      next.permLevels = draft.permLevels;
    }
    next.roundEarnings = (next.roundEarnings || 0) + res.payout;
    next.stats = { ...next.stats };
    next.stats.totalEarned += res.payout;
    next.stats.pullsUsed += 1;
    if (res.jackpot) next.stats.jackpots += 1;
    if (res.payout > next.stats.biggestWin) next.stats.biggestWin = res.payout;
    // Odd Keystone ("Triggers Randomly", doubled by Lagging Tail): every
    // pattern of this pull pays one extra time — the whole payout again.
    let keystoneTrigger = false;
    if (
      next.charms.includes("odd-keystone") &&
      res.scored.length > 0 &&
      Math.random() < randomTriggerChance(next, ODD_KEYSTONE_CHANCE)
    ) {
      keystoneTrigger = true;
      next.roundEarnings = (next.roundEarnings || 0) + res.payout;
      next.stats.totalEarned += res.payout;
      if (res.payout * 2 > next.stats.biggestWin) next.stats.biggestWin = res.payout * 2;
    }
    // Douse Drive: every 7th pull, all patterns trigger one extra time.
    let douseTrigger = false;
    if (next.charms.includes("douse-drive") && next.stats.pullsUsed % DRIVE_EVERY_PULLS === 0 && res.payout > 0) {
      douseTrigger = true;
      next.roundEarnings = (next.roundEarnings || 0) + res.payout;
      next.stats.totalEarned += res.payout;
      if (res.payout * 2 > next.stats.biggestWin) next.stats.biggestWin = res.payout * 2;
    }
    // Leftovers: patterns made of Exeggcute / Cherubi trigger one extra time.
    let leftoversExtra = 0;
    if (next.charms.includes("leftovers")) {
      let extraRaw = 0;
      for (const m of res.scored) {
        if (m.symbol === "lemon" || m.symbol === "cherry") {
          extraRaw += symbolValue(next, m.symbol) * m.cells.length * patternMult(next, m.type);
        }
      }
      if (extraRaw > 0) {
        leftoversExtra = Math.floor(extraRaw * payoutMult(next));
        next.roundEarnings = (next.roundEarnings || 0) + leftoversExtra;
        next.stats.totalEarned += leftoversExtra;
        if (res.payout + leftoversExtra > next.stats.biggestWin) {
          next.stats.biggestWin = res.payout + leftoversExtra;
        }
      }
    }
    // Twisted Spoon: a lone Carbink / Gholdengo pattern triggers twice more —
    // the final trigger pays double (total x4).
    let spoonTrigger = false;
    if (
      next.charms.includes("twisted-spoon") &&
      res.scored.length === 1 &&
      (res.scored[0].symbol === "diamond" || res.scored[0].symbol === "treasure") &&
      res.payout > 0
    ) {
      spoonTrigger = true;
      next.roundEarnings = (next.roundEarnings || 0) + res.payout * 3;
      next.stats.totalEarned += res.payout * 3;
      if (res.payout * 4 > next.stats.biggestWin) next.stats.biggestWin = res.payout * 4;
    }
    // Pokédoll: a +3 pattern in one pull pays out the current deposit interest.
    let pokedollBonus = 0;
    if (next.charms.includes("pokedoll") && res.scored.some((m) => BASE_PATTERN_MULT[m.type] >= 3)) {
      pokedollBonus = depositInterest(cur);
      next.roundEarnings = (next.roundEarnings || 0) + pokedollBonus;
      next.stats.totalEarned += pokedollBonus;
    }
    // Cleanse Tag: a pull that lands 5+ patterns adds another +1 to every
    // symbol's value (same bonus as the on-purchase stack).
    const cleanseTrigger = next.charms.includes("cleanse-tag") && res.scored.length >= 5;
    if (cleanseTrigger) next.cleanseStacks = (next.cleanseStacks || 0) + 1;
    // Shiny / Chain growth: each scored pattern carrying a modified cell
    // permanently raises its symbol's base value (+1 per Shiny charm stack)
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

    // Parcel ("Triggers Randomly", doubled by Lagging Tail): on a pull with
    // NO patterns, 25% chance every symbol permanently gains its base value.
    let parcelTrigger = false;
    if (
      next.charms.includes("parcel") &&
      res.scored.length === 0 &&
      Math.random() < randomTriggerChance(next, PARCEL_CHANCE)
    ) {
      parcelTrigger = true;
      next.permLevels = { ...(next.permLevels || {}) };
      for (const s of SYMBOLS) {
        next.permLevels[s.id] = (next.permLevels[s.id] || 0) + s.baseValue;
      }
      pushMsg(tr("The Parcel bursts — every symbol gains its base value!"));
    }

    // Lucky Egg: 3 consecutive pulls scoring Carbink/Gholdengo/Seviper → next pull EYE
    let luckyEggTrigger = false;
    if (next.charms.includes("lucky-egg")) {
      const rareScored = res.scored.some((m) => m.symbol === "diamond" || m.symbol === "treasure" || m.symbol === "seven");
      if (rareScored) {
        next.luckyEggStreak = (cur.luckyEggStreak || 0) + 1;
        if (next.luckyEggStreak >= 3) {
          next.luckyEggPending = true;
          next.luckyEggStreak = 0;
          luckyEggTrigger = true;
        }
      } else {
        next.luckyEggStreak = 0;
      }
    } else {
      next.luckyEggStreak = 0;
      next.luckyEggPending = false;
    }

    // Pull-to-pull memory: empty-pull streaks (Star Piece / Metronome) and
    // the 5+ cell pattern drought (Deep Sea Tooth).
    next.lastPullEmpty = res.scored.length === 0;
    next.emptyStreak = res.scored.length === 0 ? (cur.emptyStreak || 0) + 1 : 0;
    const hadBigPattern = res.scored.some((m) => m.cells.length >= 5);
    next.bigDrought = hadBigPattern ? 0 : (cur.bigDrought || 0) + 1;

    // Metronome: 2 consecutive empty pulls charge the next pull with Luck 5,
    // +2 more per consecutive activation while the streak holds.
    let metronomeLuck = 0;
    if (next.charms.includes("metronome") && next.emptyStreak >= 2) {
      next.metronomeFires = (cur.metronomeFires || 0) + 1;
      metronomeLuck = METRONOME_LUCK + METRONOME_LUCK_STEP * (next.metronomeFires - 1);
      next.luck = (next.luck || 0) + metronomeLuck;
    } else if (res.scored.length > 0) {
      next.metronomeFires = 0;
    }

    // Choice Scarf / Choice Specs: when the empty-pull streak hits exactly 3,
    // every symbol / every pattern permanently gains its own base value /
    // base multiplier for this run.
    let choiceScarfTrigger = false;
    let choiceSpecsTrigger = false;
    if (next.emptyStreak === CHOICE_STREAK) {
      if (next.charms.includes("choice-scarf")) {
        choiceScarfTrigger = true;
        next.permLevels = { ...(next.permLevels || {}) };
        for (const s of SYMBOLS) next.permLevels[s.id] = (next.permLevels[s.id] || 0) + s.baseValue;
      }
      if (next.charms.includes("choice-specs")) {
        choiceSpecsTrigger = true;
        next.permPatternLevels = { ...(next.permPatternLevels || {}) };
        for (const t of PATTERN_TYPES) {
          next.permPatternLevels[t] = (next.permPatternLevels[t] || 0) + BASE_PATTERN_MULT[t];
        }
      }
    }

    // Adamant Mint: every pattern beyond the 2nd in one pull stacks a
    // round-scoped base value on all symbols.
    let adamantGain = 0;
    if (next.charms.includes("adamant-mint") && res.scored.length > ADAMANT_MINT_FREE_PATTERNS) {
      adamantGain = res.scored.length - ADAMANT_MINT_FREE_PATTERNS;
      next.adamantStacks = (cur.adamantStacks || 0) + adamantGain;
    }
    // Sassy Mint: 5+ patterns in one pull double all symbols until round end.
    let sassyTrigger = false;
    if (next.charms.includes("sassy-mint") && res.scored.length >= SASSY_MINT_PATTERNS) {
      sassyTrigger = true;
      next.sassyDoubles = (cur.sassyDoubles || 0) + 1;
    }
    // Terrain seeds: Electric (+base mult to all patterns, round-scoped) on a
    // x4+ pattern, Psychic (double all patterns, round-scoped) on a x5+,
    // Misty (double all patterns, PERMANENT) when EYE scores alone.
    let electricTrigger = false;
    if (
      next.charms.includes("electric-seed") &&
      res.scored.some((m) => BASE_PATTERN_MULT[m.type] >= ELECTRIC_SEED_MIN_MULT)
    ) {
      electricTrigger = true;
      next.electricBoost = (cur.electricBoost || 0) + 1;
    }
    let psychicTrigger = false;
    if (
      next.charms.includes("psychic-seed") &&
      res.scored.some((m) => BASE_PATTERN_MULT[m.type] >= PSYCHIC_SEED_MIN_MULT)
    ) {
      psychicTrigger = true;
      next.psychicDoubles = (cur.psychicDoubles || 0) + 1;
    }
    let mistyTrigger = false;
    if (
      next.charms.includes("misty-seed") &&
      res.scored.length === 1 &&
      res.scored[0].type === "EYE"
    ) {
      mistyTrigger = true;
      next.mistyDoubles = (cur.mistyDoubles || 0) + 1;
    }

    // Bright Powder: counts charm activations this round (pullInfo.triggers
    // covers Amulet Coin / Spell Tag / drives / scarves / guarantees from
    // pullLever); reaching 5 charges the NEXT pull with Luck +7, once/round.
    next.itemTriggers =
      (cur.itemTriggers || 0) +
      (pullInfo.triggers || 0) +
      (keystoneTrigger ? 1 : 0) +
      (douseTrigger ? 1 : 0) +
      (spoonTrigger ? 1 : 0) +
      (parcelTrigger ? 1 : 0) +
      (healPowderTrigger ? 1 : 0) +
      (metronomeLuck > 0 ? 1 : 0) +
      (choiceScarfTrigger ? 1 : 0) +
      (choiceSpecsTrigger ? 1 : 0) +
      (adamantGain > 0 ? 1 : 0) +
      (sassyTrigger ? 1 : 0) +
      (electricTrigger ? 1 : 0) +
      (psychicTrigger ? 1 : 0) +
      (mistyTrigger ? 1 : 0) +
      (luckyEggTrigger ? 1 : 0);
    let brightPowderTrigger = false;
    if (
      next.charms.includes("bright-powder") &&
      !cur.brightPowderFired &&
      next.itemTriggers >= BRIGHT_POWDER_TRIGGERS
    ) {
      brightPowderTrigger = true;
      next.brightPowderFired = true;
      next.luck = (next.luck || 0) + BRIGHT_POWDER_LUCK;
    }
    // Green Scarf: each x3+ pattern on the pull where it fired feeds its
    // quota-scoped Luck bonus (+3 each).
    if (pullInfo.scarves && "green-scarf" in pullInfo.scarves) {
      const plus3 = res.scored.filter((m) => BASE_PATTERN_MULT[m.type] >= GREEN_SCARF_PATTERN_MULT).length;
      if (plus3 > 0) next.greenScarfBonus = (cur.greenScarfBonus || 0) + plus3 * GREEN_SCARF_STEP;
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
    // ResolvePull tray popups — item-icon popups for charms that fire during scoring.
    const rpTray = [];
    let rpId = 100;
    const addRp = (charmId, text) => rpTray.push({ id: rpId++, charmId, text });
    if (keystoneTrigger) addRp("odd-keystone", "×2!");
    if (douseTrigger) addRp("douse-drive", "×2!");
    if (spoonTrigger) addRp("twisted-spoon", "×4!");
    if (healPowderTrigger) addRp("heal-powder", "");
    if (parcelTrigger) addRp("parcel", "+BASE");
    if (metronomeLuck > 0) addRp("metronome", `+${metronomeLuck} LUCK`);
    if (brightPowderTrigger) addRp("bright-powder", `+${BRIGHT_POWDER_LUCK} LUCK`);
    if (choiceScarfTrigger) addRp("choice-scarf", "+BASE");
    if (choiceSpecsTrigger) addRp("choice-specs", "+BASE");
    if (adamantGain > 0) addRp("adamant-mint", `+${adamantGain} BASE`);
    if (sassyTrigger) addRp("sassy-mint", "×2 SYMBOLS");
    if (electricTrigger) addRp("electric-seed", "+BASE PATTERNS");
    if (psychicTrigger) addRp("psychic-seed", "×2 PATTERNS");
    if (mistyTrigger) addRp("misty-seed", "×2 FOREVER");
    if (pokedollBonus > 0) addRp("pokedoll", `+${fmt(pokedollBonus)} ₽`);
    if (rpTray.length > 0) {
      setTrayPopups((prev) => [...prev, ...rpTray]);
      later(() => setTrayPopups((prev) => prev.filter((p) => !rpTray.some((r) => r.id === p.id))), 1500);
    }
    const totalPayout =
      res.payout +
      (keystoneTrigger ? res.payout : 0) +
      (douseTrigger ? res.payout : 0) +
      (spoonTrigger ? res.payout * 3 : 0) +
      leftoversExtra;
    if (totalPayout > 0) {
      addPopup({ x: 50, y: 40, text: `+${fmt(totalPayout)} ₽`, kind: "coins" });
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

    // Giratina: a HOR or DIAG of Giratinas wipes all round earnings.
    if (res.giratinaLoss) {
      const lost = next.roundEarnings || 0;
      next.roundEarnings = 0;
      addPopup({ x: 50, y: 40, text: "👻💀", kind: "pattern" });
      if (lost > 0) addPopup({ x: 50, y: 50, text: `-${fmt(lost)} ₽`, kind: "coins" });
      pushMsg(tr("Giratina pulled you to the Distortion World!"));
      setRun(next);
      runRef.current = next;
    }

    // --- "Giratina appears on the grid" charms ---
    const hasGiratina = grid.some((s) => s === "giratina");
    if (hasGiratina) {
      // Dragon Fang: +10 Luck on the next spin of this round.
      if (next.charms.includes("dragon-fang")) {
        next.dragonFangPending = true;
        addPopup({ x: 50, y: 20, text: "🐉 +10 LUCK", kind: "pattern" });
      }
      // Dragon Skull: permanently double ABOVE and BELOW pattern multipliers.
      if (next.charms.includes("dragon-skull")) {
        next.permPatternLevels = { ...(next.permPatternLevels || {}) };
        next.permPatternLevels.ABOVE = (next.permPatternLevels.ABOVE || 0) + BASE_PATTERN_MULT.ABOVE;
        next.permPatternLevels.BELOW = (next.permPatternLevels.BELOW || 0) + BASE_PATTERN_MULT.BELOW;
        addPopup({ x: 50, y: 54, text: "💀 ABOVE/BELOW ×2", kind: "pattern" });
      }
      // Dark Stone: bonus spins (+3, +2, +1, +0), resets at round end.
      if (next.charms.includes("dark-stone")) {
        const stage = next.darkStoneStage ?? 3;
        if (stage > 0) {
          next.pullsLeft = (next.pullsLeft || 0) + stage;
          addPopup({ x: 50, y: 58, text: `🌑 +${stage} SPINS`, kind: "tickets" });
        }
        next.darkStoneStage = Math.max(0, stage - 1);
      }
      // God Stone: Symbols Mult ×2 until end of round.
      if (next.charms.includes("god-stone")) {
        next.godStoneActive = true;
        addPopup({ x: 50, y: 62, text: "🪨 ×2 SYMBOLS", kind: "pattern" });
      }
    }

    if (next.pullsLeft <= 0) {
      // Round over. If the quota still has rounds left, return to the pull
      // picker; on the last round the deadline comes due instead.
      later(() => {
        const now = runRef.current;
        if (now.awaitingChoice) return; // quota was cleared via ATM meanwhile
        // Deposit interest: the ATM pays 7% on the current deposit after
        // EVERY played round — one that ends at the deadline included. It is
        // committed to the run immediately, otherwise the deadline payment
        // below would be checked against a wallet that doesn't include it.
        const interest = depositInterest(now);
        const baseRaw = interest > 0 ? { ...now, coins: now.coins + interest } : now;
        // Grant round-end earnings + tickets (earned during the round).
        const roundEarn = baseRaw.roundEarnings || 0;
        const baseDraft = roundEarn > 0
          ? { ...baseRaw, coins: baseRaw.coins + roundEarn, roundEarnings: 0 }
          : baseRaw;
        const base = baseDraft.pendingTickets
          ? { ...baseDraft, tickets: (baseDraft.tickets || 0) + baseDraft.pendingTickets, pendingTickets: 0 }
          : baseDraft;
        if (interest > 0 || roundEarn > 0 || baseDraft.pendingTickets) {
          if (interest > 0) addPopup({ x: 50, y: 30, text: `🏦 +${fmt(interest)} ₽`, kind: "coins" });
          if (roundEarn > 0) addPopup({ x: 50, y: 38, text: `🎰 +${fmt(roundEarn)} ₽`, kind: "coins" });
          if (baseDraft.pendingTickets) addPopup({ x: 50, y: 46, text: `🎟️ +${baseDraft.pendingTickets}`, kind: "tickets" });
          commit(base);
        }
        if (base.roundsLeft > 0) {
          // Mid-cycle: move to the next round of this quota. totalRounds
          // counts every played round across all quotas (charm hook).
          const next = { ...base, round: base.round + 1, totalRounds: (base.totalRounds || 0) + 1, pullsLeft: 0, awaitingChoice: true };
          tickLeftovers(next);
          commit(next);
          // Broke with no tickets to fall back on → game over right here.
          if (!canEnterRound(next)) endRun(false);
        } else {
          // Deadline comes due against the WHOLE cycle: deposits already made
          // (quotaPaid) plus whatever is left in hand must cover the quota.
          // No auto modal — the Quota card glows via isDeadline and the player
          // must pay via the ATM. Sash/Band still auto-trigger.
          const rem = Math.max(0, currentQuota(base) - (base.quotaPaid || 0));
          if (base.coins >= rem) {
            // payable deadline — just let the Quota card glow, no modal
          } else if (base.charms.includes("focus-sash")) {
            // Focus Sash: about to die → two extra rounds to pay the quota,
            // then the sash discards itself (feeding Black Sludge). The
            // partial deposits (quotaPaid) are kept.
            const draft = { charms: base.charms, permLevels: base.permLevels };
            const fed = discardCharm(draft, "focus-sash");
            commit({
              ...base,
              charms: draft.charms,
              permLevels: draft.permLevels,
              roundsLeft: base.roundsLeft + FOCUS_SASH_EXTRA_ROUNDS,
              pullsLeft: 0,
              awaitingChoice: true,
            });
            addPopup({ x: 50, y: 40, text: "🩹", kind: "pattern" });
            pushMsg(tr("The Focus Sash shatters — two extra rounds to pay the quota!"));
            if (fed) addPopup({ x: 50, y: 52, text: "🟣 +BASE", kind: "pattern" });
          } else if (base.charms.includes("focus-band")) {
            const draft = { charms: base.charms, permLevels: base.permLevels };
            const fed = discardCharm(draft, "focus-band");
            const extra = draft.charms.includes("chill-drive") ? CHILL_DRIVE_EXTRA_PULLS : 0;
            commit({
              ...base,
              charms: draft.charms,
              permLevels: draft.permLevels,
              coins: 0,
              quotaPaid: 0,
              deposited: base.deposited || 0,
              cycle: base.cycle + 1,
              roundsLeft: ROUNDS_PER_QUOTA,
              round: 1,
              totalRounds: (base.totalRounds || 0) + 1,
              pullsLeft: ROUND_MODES[7].pulls + extra,
              lastMode: 7,
              awaitingChoice: false,
              yellowScarfBonus: 0,
              rerollsThisCycle: 0,
              greenScarfBonus: 0,
            });
            addPopup({ x: 50, y: 40, text: "🎗️", kind: "pattern" });
            if (fed) addPopup({ x: 50, y: 52, text: "🟣 +BASE", kind: "pattern" });
            pushMsg(tr("The Focus Band shatters! Quota wiped — seven pulls on the house."));
          } else {
            endRun(false); // cannot cover the quota, no Sash, no Focus Band
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
    // Mid-round spending is locked: quota payments and shop buys wait until
    // all purchased pulls are used (see canSpend).
    if ((runRef.current.pullsLeft || 0) > 0) return;
    // Default the slider to the clamped MAX (quota-capped, round-fee aware).
    setPayAmount(atmMaxDeposit(runRef.current));
    setModal("atm");
  };

  // Round start: buy 3 or 7 pulls. Entering a round costs a fixed coin fee
  // that grows with every quota (roundCost) and earns its mode's tickets
  // (8 for 3 pulls, 3 for 7 — see ROUND_MODES). There is no credit anymore:
  // if the coins don't cover the fee, the round is paid with tickets instead
  // (ROUND_TICKET_COSTS, earning nothing back). Playing a round consumes
  // one of the quota's ROUNDS_PER_QUOTA rounds, so the pick is also a
  // pacing choice.
  const chooseRoundMode = (mode) => {
    if (phase !== "idle" || !runRef.current.awaitingChoice) return;
    const cur = runRef.current;
    const m = Number(mode);
    const coinCost = roundCost(cur, m);
    // Chill Drive adds its extra pulls to every bought round.
    const pulls = ROUND_MODES[m].pulls + (cur.charms.includes("chill-drive") ? CHILL_DRIVE_EXTRA_PULLS : 0);
    // A fresh round resets the round-scoped charm boosts (Bright Powder meter,
    // Adamant/Sassy/Electric/Psychic stacks, scarf counters stay quota/run-wide).
    const roundReset = {
      itemTriggers: 0,
      brightPowderFired: false,
      adamantStacks: 0,
      sassyDoubles: 0,
      electricBoost: 0,
      psychicDoubles: 0,
      darkStoneStage: 3,
      godStoneActive: false,
    };
    if (cur.coins >= coinCost) {
      commit({
        ...cur,
        coins: cur.coins - coinCost,
        pullsLeft: pulls,
        pendingTickets: (ROUND_MODES[m].tickets || 0),
        lastMode: m,
        awaitingChoice: false,
        roundsLeft: cur.roundsLeft - 1,
        ...roundReset,
      });
    } else {
      const ticketCost = ROUND_TICKET_COSTS[m];
      if ((cur.tickets || 0) < ticketCost) return;
      commit({
        ...cur,
        tickets: cur.tickets - ticketCost,
        pullsLeft: pulls,
        lastMode: m,
        awaitingChoice: false,
        roundsLeft: cur.roundsLeft - 1,
        ...roundReset,
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
    // deposits clear a quota exactly like one big payment. They also grow the
    // lifetime deposit total (deposited), which never resets — it is the base
    // for the 7% interest paid after every round.
    const quotaPaid = (cur.quotaPaid || 0) + paid;
    const deposited = (cur.deposited || 0) + paid;
    const draft = { charms: cur.charms, permLevels: cur.permLevels };
    // Focus Band auto-triggers once when a deadline can't be covered: it wipes
    // the remaining quota, empties the wallet and grants a free 7-pull round.
    // It is discarded through discardCharm so Black Sludge can feed on it.
    let focusSave = false;
    let sludgeFed = false;
    if (deadline && quotaPaid < quota && draft.charms.includes("focus-band")) {
      sludgeFed = discardCharm(draft, "focus-band");
      focusSave = true;
    }
    if (deadline && quotaPaid < quota && !focusSave) {
      endRun(false);
      return;
    }
    let debt = cur.debt - paid;
    // A save zeroes the wallet instead of subtracting the payment.
    let next = { ...cur, coins: focusSave ? 0 : cur.coins - paid, debt, charms: draft.charms, permLevels: draft.permLevels, quotaPaid, deposited };

    // Debt paid in full — the run does NOT end: Team Rocket instantly grants
    // a bigger loan (nextDebt, ×DEBT_GROWTH per debt) and the charm tray
    // gains +1 slot (charmSlots reads debtsCleared). A fresh quota cycle
    // starts so the run keeps flowing endlessly.
    if (debt <= 0) {
      next.debtsCleared = (cur.debtsCleared || 0) + 1;
      next.debt = nextDebt(next.debtsCleared);
      next.cycle = cur.cycle + 1;
      next.quotaPaid = 0;
      next.roundsLeft = ROUNDS_PER_QUOTA;
      next.round = 1;
      if (!cur.awaitingChoice) next.totalRounds = (cur.totalRounds || 0) + 1;
      next.pullsLeft = 0;
      next.awaitingChoice = true;
      // Guidebook: finishing this quota raises the Symbols Multiplier by the
      // rounds skipped + 1 (the global upgrade level, ×1.5 each).
      if (next.charms.includes("guidebook")) {
        const gain = (cur.roundsLeft || 0) + 1;
        next.upgrades = { ...next.upgrades, global: (next.upgrades.global || 0) + gain };
        addPopup({ x: 50, y: 52, text: `📖 +${gain}`, kind: "pattern" });
      }
      applyQuotaFinish(next, cur);
      if (!cur.awaitingChoice) tickLeftovers(next);
      // Deposit interest for rounds that end through this path (mirrors the
      // early-clear sweep below); deadline payments were already swept by the
      // round-end timer before this modal opened.
      if (!cur.awaitingChoice && !deadline) {
        const interest = depositInterest(cur);
        if (interest > 0) {
          next.coins += interest;
          addPopup({ x: 50, y: 30, text: `🏦 +${fmt(interest)} ₽`, kind: "coins" });
        }
      }
      // Quota clear bonus: coins + tickets (same as the payment path below).
      const debtBonus = quotaClearBonus(cur);
      if (debtBonus.coins > 0) {
        next.coins += debtBonus.coins;
        addPopup({ x: 50, y: 44, text: `+${fmt(debtBonus.coins)} ₽`, kind: "coins" });
      }
      if (debtBonus.tickets > 0) {
        next.tickets = cur.tickets + debtBonus.tickets;
        addPopup({ x: 50, y: 58, text: `+${fmt(debtBonus.tickets)} 🎫`, kind: "tickets" });
      }
      addPopup({ x: 50, y: 40, text: "🏆", kind: "pattern" });
      pushMsg(tr("Debt cleared! One more charm slot — and a much bigger debt."));
      setOffers(generateShopOffers(next));
      if (next.cycle >= GIRATINA_UNLOCK_CYCLE && (cur.cycle || 1) < GIRATINA_UNLOCK_CYCLE) {
        setGiraRelease(true);
        later(() => setGiraRelease(false), 2600);
        pushMsg(tr("The Distortion World trembles — Giratina awakens!"));
      }
      commit(next);
      return;
    }

    // A payment clears the quota when it's the forced deadline (already
    // validated above) or when the cycle's accumulated payments cross it —
    // mid-cycle ATM deposits included. Clearing early pays out the
    // quotaClearBonus (7% of the quota + 4 tickets + 2 per round left) and
    // starts a fresh cycle.
    const cleared = deadline || quotaPaid >= quota;
    if (focusSave) {
      // The Focus Band's sacrifice: quota gone, wallet gone, but the run
      // continues straight into a free full-length (7-pull) round.
      next.cycle = cur.cycle + 1;
      next.quotaPaid = 0;
      next.roundsLeft = ROUNDS_PER_QUOTA;
      next.round = 1;
      if (!cur.awaitingChoice) {
        next.totalRounds = (cur.totalRounds || 0) + 1;
        tickLeftovers(next);
      }
      // A wipe is not a finish — Yellow Scarf gets no bonus, quota counters reset.
      next.yellowScarfBonus = 0;
      next.rerollsThisCycle = 0;
      next.greenScarfBonus = 0;
      next.pullsLeft = ROUND_MODES[7].pulls;
      next.lastMode = 7; // the granted round is always the long one
      next.awaitingChoice = false;
      addPopup({ x: 50, y: 40, text: "🎗️", kind: "pattern" });
      if (sludgeFed) addPopup({ x: 50, y: 52, text: "🟣 +BASE", kind: "pattern" });
      pushMsg(tr("The Focus Band shatters! Quota wiped — seven pulls on the house."));
      setOffers(generateShopOffers(next));
      if (next.cycle >= GIRATINA_UNLOCK_CYCLE && (cur.cycle || 1) < GIRATINA_UNLOCK_CYCLE) {
        setGiraRelease(true);
        later(() => setGiraRelease(false), 2600);
        pushMsg(tr("The Distortion World trembles — Giratina awakens!"));
      }
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
      const bonusCoins = bonus.coins;
      const bonusTickets = bonus.tickets;
      if (bonusCoins > 0) {
        next.coins += bonusCoins;
        addPopup({ x: 50, y: 40, text: `+${fmt(bonusCoins)} ₽`, kind: "coins" });
      }
      if (bonusTickets > 0) {
        next.tickets = cur.tickets + bonusTickets;
        addPopup({ x: 50, y: 58, text: `+${fmt(bonusTickets)} 🎫`, kind: "tickets" });
      }
      // Guidebook: finishing this quota raises the Symbols Multiplier by the
      // rounds skipped + 1 (deadline clears skipped none → +1).
      if (next.charms.includes("guidebook")) {
        const gain = (cur.roundsLeft || 0) + 1;
        next.upgrades = { ...next.upgrades, global: (next.upgrades.global || 0) + gain };
        addPopup({ x: 50, y: 52, text: `📖 +${gain}`, kind: "pattern" });
      }
      applyQuotaFinish(next, cur);
      next.cycle = cur.cycle + 1;
      next.quotaPaid = 0; // the new cycle's quota starts unpaid
      // The reroll counter never resets — the price keeps climbing all run.
      next.roundsLeft = ROUNDS_PER_QUOTA;
      next.round = 1; // back to round 1 of the fresh quota
      // The finished round counts toward totalRounds — unless the payment
      // came straight from the pull picker (awaitingChoice), where no round
      // was actually being played.
      if (!cur.awaitingChoice) {
        next.totalRounds = (cur.totalRounds || 0) + 1;
        tickLeftovers(next);
      }
      next.pullsLeft = 0;
      next.awaitingChoice = true; // back to the pull picker for the new quota
      setOffers(generateShopOffers(next));
      pushMsg(tr(PHONE_ROUND_MSGS[next.cycle % PHONE_ROUND_MSGS.length]));
      if (next.cycle >= GIRATINA_UNLOCK_CYCLE && (cur.cycle || 1) < GIRATINA_UNLOCK_CYCLE) {
        setGiraRelease(true);
        later(() => setGiraRelease(false), 2600);
        pushMsg(tr("The Distortion World trembles — Giratina awakens!"));
      }
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
    persistRun(next);
  };

  const endRun = (won) => {
    const cur = runRef.current;
    setPhase("ended");
    setModal(won ? "won" : "over");
    const rec = loadRecords();
    if (won) {
      const updated = saveRecord({
        wins: rec.wins + 1,
        bestWinRound: rec.bestWinRound == null ? cur.totalRounds : Math.min(rec.bestWinRound, cur.totalRounds),
        bestPayout: Math.max(rec.bestPayout, cur.stats.biggestWin),
      });
      setRecords(updated);
      persistRecords(updated); // the run is over: keep records, drop the state
      pushMsg(tr("You're free... for now."));
    } else {
      const updated = saveRecord({ bestPayout: Math.max(rec.bestPayout, cur.stats.biggestWin) });
      setRecords(updated);
      persistRecords(updated);
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
    persistRun(fresh); // a fresh run replaces whatever was saved
  };

  // ------------------------------------------------------------------
  // Shop actions
  // ------------------------------------------------------------------
  const buyOffer = (offer) => {
    const cur = runRef.current;
    if (phase !== "idle" || cur.tickets < offer.cost) return;
    const next = { ...cur, tickets: cur.tickets - offer.cost };
    if (offer.kind === "charm") {
      // Tray capacity grows with cleared debts and the Poffin Case (charmSlots)
      // — a full tray blocks buying, sell first. The Poffin Case itself takes
      // no space, so it doesn't count against the capacity.
      const occupying = next.charms.filter((c) => c !== "poffin-case").length;
      if (!CHARMS[offer.id] || occupying >= charmSlots(next)) return;
      playSfx("cash-register-purchase.mp3");
      next.charms = [...next.charms, offer.id];
      // Poffin Case: +1 charm slot (charmSlots reads it), offered only once.
      if (offer.id === "poffin-case") next.poffinCaseBought = true;
      // Cleanse Tag's on-purchase bonus: every symbol is worth +1 from now on.
      if (offer.id === "cleanse-tag") next.cleanseStacks = (next.cleanseStacks || 0) + 1;
      // Point Card: retroactively grants +1 Symbols Multiplier per reroll
      // already performed this run (the counter never resets).
      if (offer.id === "point-card" && (cur.rerolls || 0) > 0) {
        next.upgrades = { ...next.upgrades, global: (next.upgrades.global || 0) + cur.rerolls };
        addPopup({ x: 50, y: 52, text: `🃏 +${cur.rerolls}`, kind: "pattern" });
      }
    } else {
      playSfx("cash-register-purchase.mp3");
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

  // Selling DISCARDS the charm — Black Sludge feeds on it (discardCharm).
  const sellCharm = (charmId) => {
    const cur = runRef.current;
    const refund = Math.max(1, Math.floor(charmCost(charmId) / 2));
    const next = { ...cur, tickets: cur.tickets + refund };
    const fed = discardCharm(next, charmId);
    commit(next);
    if (fed) addPopup({ x: 50, y: 52, text: "🟣 +BASE", kind: "pattern" });
  };

  const doReroll = () => {
    const cur = runRef.current;
    const cost = rerollCost(cur);
    if (phase !== "idle" || cur.coins < cost) return;
    playSfx("cash-register-purchase.mp3");
    // rerollsThisCycle feeds the Pink Scarf and resets on quota clear.
    const next = {
      ...cur,
      coins: cur.coins - cost,
      rerolls: (cur.rerolls || 0) + 1,
      rerollsThisCycle: (cur.rerollsThisCycle || 0) + 1,
    };
    // Point Card: every reroll of the run raises the Symbols Multiplier.
    if (next.charms.includes("point-card")) {
      next.upgrades = { ...next.upgrades, global: (next.upgrades.global || 0) + 1 };
      addPopup({ x: 50, y: 52, text: "🃏 +1", kind: "pattern" });
    }
    commit(next);
    setOffers(rerollShop(next));
  };

  // Leftovers: counts completed rounds and self-discards after 10 (feeding
  // Black Sludge). Called everywhere a round actually completes.
  const tickLeftovers = (next) => {
    if (!next.charms.includes("leftovers")) return;
    next.leftoversRounds = (next.leftoversRounds || 0) + 1;
    if (next.leftoversRounds >= LEFTOVERS_ROUNDS) {
      const fed = discardCharm(next, "leftovers");
      addPopup({ x: 50, y: 46, text: "🍱", kind: "pattern" });
      if (fed) addPopup({ x: 50, y: 52, text: "🟣 +BASE", kind: "pattern" });
    }
  };

  // Quota-finished charm hooks shared by the clear paths: Modest Mint tickets,
  // Grassy Seed's alternating multiplier growth, the Yellow Scarf's next-quota
  // bonus (from rounds skipped here) and the quota-scoped counter resets.
  const applyQuotaFinish = (next, cur) => {
    const skipped = cur.roundsLeft || 0;
    // Modest Mint: +1 ticket per (quota number) tickets held — X is the index
    // of the quota just finished (quota 1 → 1 per ticket, quota 2 → 1 per 2).
    if (next.charms.includes("modest-mint") && cur.cycle > 0) {
      const gain = Math.floor((next.tickets || 0) / cur.cycle);
      if (gain > 0) {
        next.tickets = (next.tickets || 0) + gain;
        addPopup({ x: 50, y: 58, text: `🍃 +${gain} 🎫`, kind: "tickets" });
      }
    }
    // Grassy Seed: +1 alternating between the Symbols and Patterns multipliers.
    if (next.charms.includes("grassy-seed")) {
      const turns = cur.grassyTurns || 0;
      next.grassyLevels = { ...(next.grassyLevels || { global: 0, pattern: 0 }) };
      if (turns % 2 === 0) next.grassyLevels.global += 1;
      else next.grassyLevels.pattern += 1;
      next.grassyTurns = turns + 1;
      addPopup({ x: 50, y: 64, text: "🌱 +1", kind: "pattern" });
    }
    // Yellow Scarf: next quota's Luck bonus = 4 x rounds skipped on this one.
    next.yellowScarfBonus = skipped * YELLOW_SCARF_STEP;
    // Quota-scoped counters reset with the new cycle.
    next.rerollsThisCycle = 0;
    next.greenScarfBonus = 0;
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
  // Mid-round spending lock: once a round is bought (pullsLeft > 0), quota
  // payments (ATM) and Rotom Phone purchases are unavailable until every
  // pull has been used.
  const canSpend = canAct && run.pullsLeft === 0;
  const hasFocusBand = run.charms.includes("focus-band");
  // Modifier flags of the current grid, rendered as cell badges/rings.
  const goldenCells = new Set(run.goldenCells || []);
  const chainCells = new Set(run.chainCells || []);
  const spinning = phase === "spinning";
  const maxPullSlots = BASE_MAX_PULL_SLOTS + (run.charms.includes("chill-drive") ? CHILL_DRIVE_EXTRA_PULLS : 0);
  const sMult = symbolsMult(run);
  const pMult = patternsMult(run);
  const isDeadline = remainingQuota > 0 && run.roundsLeft === 0 && run.pullsLeft === 0 && !run.awaitingChoice && phase === "idle";

  // Login/register replaces the board while open; "Play as guest" returns.
  if (showAuth) {
    return (
      <div className="relative">
        <AuthScreen onAuth={handleAuth} subtitle="PokéSlots" />
        <button
          onClick={() => setShowAuth(false)}
          className="absolute top-4 left-4 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← {tr("Play as guest")}
        </button>
      </div>
    );
  }

  // While a saved run is being fetched the board would flash a fresh run for
  // a moment — show a splash instead, same as the Dungeon page does.
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">...</p>
      </div>
    );
  }

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
        <div className="flex flex-col items-end gap-1.5">
          {accountId ? (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-slate-300">{accountName}</span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                {tr("Logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-lg bg-yellow-600 hover:bg-yellow-500 px-3 py-1 text-[11px] font-bold text-white transition-colors"
            >
              {tr("Login")}
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (confirm(tr("Restart the run? All progress will be lost."))) restart();
              }}
              disabled={phase === "spinning"}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:border-red-500 hover:text-red-400 disabled:opacity-40 transition-colors"
              title={tr("Restart")}
            >
              ↻ {tr("Restart")}
            </button>
            <LanguageSelector />
          </div>
        </div>
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
              <button
                onClick={openAtm}
                disabled={!canSpend}
                className={`rounded-xl border bg-slate-900 px-3 py-2 text-left transition-colors enabled:hover:border-red-500 disabled:opacity-90 ${isDeadline ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse" : "border-slate-700"}`}
              >
                <div className="text-[10px] uppercase tracking-wide text-slate-500">{tr("Quota")}</div>
                <div className="font-bold text-red-400">{fmt(remainingQuota)} ₽</div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] leading-none">
                  <span className="text-slate-500">
                    {tr("Deposit")} {fmt(run.deposited || 0)} ₽
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
            {Array.from({ length: maxPullSlots }).map((_, i) => {
              const actualModePulls =
                (ROUND_MODES[run.lastMode]?.pulls || 0) + (run.charms.includes("chill-drive") ? CHILL_DRIVE_EXTRA_PULLS : 0);
              const inMode = !run.awaitingChoice && i < actualModePulls;
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
          {SYMBOLS.filter((s) => !s.hideInChart).map((s) => {
            const i = SYMBOLS.indexOf(s);
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
          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-800/60 px-2 py-1 text-[10px]">
            <span className="uppercase tracking-wide text-slate-500">{tr("Symbols Multiplier")}</span>
            <span className="font-bold text-yellow-300 text-sm">×{Number.isInteger(sMult) ? sMult : sMult.toFixed(2)}</span>
          </div>
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
                    morphTo={revealingDittos.has(i) ? revealingDittos.get(i) : null}
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
              fast pulls (~35% of the fee) or 7 slower ones (the full fee,
              fixed per quota). Choosing makes the picker disappear and the
              lever reappear. */}
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
                    onClick={() => setModal("codex")}
                    className="size-9 rounded-full border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
                  >
                    📖
                  </button>
                }
              />
              <TooltipContent>{tr("Charm Codex")}</TooltipContent>
            </Tooltip>
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
              onClick={() => canSpend && setModal("shop")}
              disabled={!canSpend}
              className="shrink-0 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              {tr("Shop")}
            </button>
            <button
              onClick={openAtm}
              disabled={!canSpend}
              className="shrink-0 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              ATM
            </button>
          </div>

          {/* Charms tray */}
          <div className="mt-3 flex items-center gap-2 flex-wrap min-h-9">
            <span className="text-[10px] uppercase tracking-wide text-slate-500 mr-1">{tr("Charms")} ({run.charms.filter((c) => c !== "poffin-case").length}/{charmSlots(run)})</span>
            {run.charms.length === 0 && <span className="text-[11px] text-slate-600">—</span>}
            {run.charms.map((c) => {
              const popups = trayPopups.filter((p) => p.charmId === c);
              return (
                <div key={c} className="relative">
                  {popups.length > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-0.5 animate-tray-float">
                      {popups.map((p) => (
                        <div key={p.id} className="flex items-center gap-1 rounded-full bg-slate-900/90 border border-yellow-500/60 px-1.5 py-0.5 shadow-lg shadow-yellow-500/20">
                          <CharmIcon charmId={c} className="size-3.5" />
                          {p.text && <span className="text-[10px] font-bold text-yellow-300 whitespace-nowrap">{p.text}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div className={`rounded-md border bg-slate-800/70 px-1.5 py-1 cursor-default ${
                          firedCharms.has(c) ? "border-yellow-400 animate-charm-fire" : "border-slate-700"
                        }`}>
                          <CharmIcon charmId={c} className="size-5" />
                        </div>
                      }
                    />
                <TooltipContent side="bottom" className="max-w-56 flex-col items-stretch gap-0.5">
                  <span className="font-bold">{tr(CHARM_NAME_KEYS[c])}</span>
                  {CHARMS[c].trait === "random" && (() => {
                    const pct = CHARMS[c].scarf
                      ? Math.round(CHARMS[c].scarf.chance * 100)
                      : c === "amulet-coin"
                        ? Math.round(AMULET_COIN_CHANCE * 100)
                        : c === "odd-keystone"
                          ? Math.round(ODD_KEYSTONE_CHANCE * 100)
                          : c === "parcel"
                            ? Math.round(PARCEL_CHANCE * 100)
                            : null;
                    return <span className="font-semibold text-fuchsia-400">{tr("Triggers Randomly")} ({pct}%)</span>;
                  })()}
                  <span className="opacity-80">{tr(`${c}-desc`)}</span>
                  {c === "green-scarf" && <span className="text-[11px] text-emerald-400 font-semibold">Luck +{run.greenScarfBonus || 0}</span>}
                  {c === "point-card" && <span className="text-[11px] text-yellow-300 font-semibold">{tr("Symbols Multiplier")} +{run.rerolls || 0}</span>}
                  {c === "leftovers" && <span className="text-[11px] text-orange-300 font-semibold">{LEFTOVERS_ROUNDS - (run.leftoversRounds || 0)} {tr("rounds left")}</span>}
                  {c === "burn-drive" && <span className="text-[11px] text-orange-400 font-semibold">{DRIVE_EVERY_PULLS - ((run.stats?.pullsUsed || 0) % DRIVE_EVERY_PULLS)} {tr("pulls left")}</span>}
                  {c === "choice-specs" && <span className="text-[11px] text-purple-400 font-semibold">{Math.max(0, CHOICE_STREAK - (run.emptyStreak || 0))} {tr("pulls left")}</span>}
                </TooltipContent>
              </Tooltip>
                </div>
              );
            })}
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
          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-800/60 px-2 py-1 text-[10px]">
            <span className="uppercase tracking-wide text-slate-500">{tr("Patterns Multiplier")}</span>
            <span className="font-bold text-slate-300 text-sm">×{pMult}</span>
          </div>
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
                {tr("Your charms")} ({run.charms.length}/{charmSlots(run)})
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
            {/* Lifetime deposit (never resets) and the interest it pays out
                after each round. Quota progress itself is visible via the
                shrinking "Quota due" row above. */}
            <Row label={tr("Deposit")} value={`${fmt(run.deposited || 0)} ₽`} color="text-emerald-300" />
            <Row label={tr("Interest (7%)")} value={`+${fmt(depositInterest(run))} ₽`} color="text-emerald-400" small />
            <Row label={tr("Your coins")} value={`${fmt(run.coins)} ₽`} color="text-yellow-300" />
            <Row label={tr("Remaining debt")} value={`${fmt(run.debt)} ₽`} />
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
            <li>{tr("Each round, buy 3 pulls or 7 — the coin fee grows with every quota. Paying with coins earns tickets (3 pulls earn more). Can't afford a round? It costs 1 ticket (3 pulls) or 2 tickets (7 pulls) instead, earning nothing back. No coins and no tickets? You lose.")}</li>
            <li>{tr("Clear a quota early for a bonus: 7% of the quota + 4 tickets, plus 1 extra ticket per round still left. Paying right on the deadline earns no bonus.")}</li>
            <li>{tr("Patterns pay coins only. Tickets come from clearing quotas — spend them on charms and permanent upgrades.")}</li>
            <li>{tr("Deposits earn 7% interest, paid by the ATM after every round.")}</li>
            <li>{tr("Pay off a debt completely and a bigger one takes its place — plus one extra charm slot. How far can you go?")}</li>
            <li>{tr("Smaller patterns are swallowed by bigger ones that contain them — chase the big shapes!")}</li>
          </ul>
        </Overlay>
      )}

      {modal === "codex" && (() => {
        const q = (codexSearch || "").toLowerCase();
        const filtered = CHARM_IDS.filter((c) => {
          if (!q) return true;
          return tr(CHARM_NAME_KEYS[c]).toLowerCase().includes(q) || tr(`${c}-desc`).toLowerCase().includes(q);
        });
        return (
          <Overlay title={tr("Charm Codex")} onClose={() => { setModal(null); setCodexSearch(""); }}>
            <input
              type="text"
              value={codexSearch}
              onChange={(e) => setCodexSearch(e.target.value)}
              placeholder={tr("Search") + "…"}
              className="w-full mb-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
              autoFocus
            />
            <div className="space-y-2">
              {filtered.map((c) => {
                const charm = CHARMS[c];
                return (
                  <div key={c} className="flex items-start gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
                    <CharmIcon charmId={c} className="size-6 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{tr(CHARM_NAME_KEYS[c])}</span>
                        <span className="text-[11px] text-yellow-400">{charm.cost} 🎫</span>
                        {charm.trait === "random" && <span className="text-[10px] font-semibold text-fuchsia-400">⚡ {tr("Triggers Randomly")}</span>}
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{tr(`${c}-desc`)}</p>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="text-center text-sm text-slate-500 py-4">{tr("No results")}</p>}
            </div>
          </Overlay>
        );
      })()}

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
    const occupying = run.charms.filter((c) => c !== "poffin-case").length;
    const trayFull = offer.kind === "charm" && offer.id !== "poffin-case" && occupying >= charmSlots(run);
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
    const disabled = !affordable || trayFull;
    return (
      <button
        onClick={() => buyOffer(offer)}
        disabled={disabled}
        className={`flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
          disabled
            ? "border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed"
            : "border-slate-600 bg-slate-800/70 hover:border-sky-400 hover:bg-sky-500/10"
        }`}
      >
        <div className="shrink-0 size-10 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold leading-tight">{name}</div>
          {offer.kind === "charm" && trayFull && (
            <div className="text-[11px] font-semibold text-red-400">{tr("Tray full")} ({occupying}/{charmSlots(run)})</div>
          )}
          {offer.kind === "charm" && CHARMS[offer.id].trait === "random" && (() => {
            const pct = CHARMS[offer.id].scarf
              ? Math.round(CHARMS[offer.id].scarf.chance * 100)
              : offer.id === "amulet-coin"
                ? Math.round(AMULET_COIN_CHANCE * 100)
                : offer.id === "odd-keystone"
                  ? Math.round(ODD_KEYSTONE_CHANCE * 100)
                  : offer.id === "parcel"
                    ? Math.round(PARCEL_CHANCE * 100)
                    : null;
            return <div className="text-[11px] font-semibold text-fuchsia-400">{tr("Triggers Randomly")} ({pct}%)</div>;
          })()}
          <div className="text-[11px] text-slate-400 leading-snug">{desc}</div>
        </div>
        <div className={`shrink-0 text-sm font-black ${affordable ? "text-sky-300" : "text-slate-600"}`}>{offer.cost}🎫</div>
      </button>
    );
  }
}
