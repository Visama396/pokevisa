import { useEffect, useMemo, useState, useRef } from "react";
import { Toaster, toast } from "sonner";
import { normalize } from "../utils/normalize";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";
import LanguageSelector from "./LanguageSelector";
import PokeTypeBadge from "./PokeTypeBadge";

export default function DexMaster() {
  const [pokemons, setPokemons] = useState([]);
  const [guess, setGuess] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [language, setLanguage] = useState(getLanguage());

  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const [guessedPokemons, setGuessedPokemons] = useState(new Set());
  const [flash, setFlash] = useState(null);
  const inputRef = useRef(null);

  const prevGuessedCount = useRef(0);
  const prevCompleteKeys = useRef(new Set());
  const activeHintRef = useRef(null);
  const hintRevealedRef = useRef(1);

  useEffect(() => subscribe(setLanguage), []);

  useEffect(() => {
    async function loadPokedex() {
      const res = await fetch("/pokedex.json");
      const data = await res.json();
      setPokemons(data);
    }

    loadPokedex();
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [running, startTime]);

  useEffect(() => {
    if (
      pokemons.length > 0 &&
      guessedPokemons.size === pokemons.length
    ) {
      setRunning(false);
    }
  }, [guessedPokemons, pokemons]);

  const displayStats = useMemo(() => {
    const stats = {};

    for (const pokemon of pokemons) {
      const types = [...pokemon.types].sort();
      const key = types.join("/");

      if (!stats[key]) {
        stats[key] = {
          types,
          total: 0,
          guessed: 0,
          pokemons: [],
        };
      }

      stats[key].total++;

      if (guessedPokemons.has(pokemon.id)) {
        stats[key].guessed++;
        stats[key].pokemons.push(pokemon);
      }
    }

    return Object.values(stats).sort((a, b) => {
      const aDone = a.guessed === a.total;
      const bDone = b.guessed === b.total;
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return 0;
    });
  }, [pokemons, guessedPokemons]);

  function getUnguessed() {
    return pokemons.filter((p) => !guessedPokemons.has(p.id));
  }

  function getMostCompleteIncomplete() {
    const incomplete = displayStats.filter((s) => s.guessed < s.total);
    if (incomplete.length === 0) return null;
    incomplete.sort((a, b) => b.guessed / b.total - a.guessed / a.total);
    return incomplete[0];
  }

  function obscuredName(name, revealed) {
    if (revealed <= 0) return "_ ".repeat(name.length).trim();
    return name
      .split("")
      .map((ch, i) => (i < revealed ? ch : "_"))
      .join(" ");
  }

  function showHintToast(pokemon, revealed) {
    const gen = pokemon.generation.replace("generation-", "").toUpperCase();
    toast(
      <span>
        💡 <strong>{obscuredName(pokemon.names.en, revealed)}</strong>
        <br />
        <span className="text-xs text-slate-400">
          From <strong>Gen {gen}</strong>
        </span>
      </span>,
      { duration: 6000 },
    );
  }

  function pickNextHintPokemon() {
    const unguessed = getUnguessed();
    if (unguessed.length === 0) return null;
    const cat = getMostCompleteIncomplete();
    if (!cat) return unguessed[Math.floor(Math.random() * unguessed.length)];
    const catKey = cat.types.join("/");
    const catPool = unguessed.filter(
      (p) => [...p.types].sort().join("/") === catKey,
    );
    return catPool.length > 0
      ? catPool[Math.floor(Math.random() * catPool.length)]
      : unguessed[Math.floor(Math.random() * unguessed.length)];
  }

  function giveFullNameHint() {
    const unguessed = getUnguessed();
    if (unguessed.length === 0) return null;

    return unguessed[Math.floor(Math.random() * unguessed.length)];
  }

  function giveCategoryCompleteHint(completedKey) {
    const otherIncomplete = displayStats.filter(
      (s) => s.guessed < s.total && s.types.join("/") !== completedKey,
    );
    if (otherIncomplete.length === 0) return;

    otherIncomplete.sort((a, b) => b.guessed / b.total - a.guessed / a.total);
    const target = otherIncomplete[0];
    const targetKey = target.types.join("/");

    const unguessedInTarget = pokemons.filter(
      (p) =>
        !guessedPokemons.has(p.id) &&
        [...p.types].sort().join("/") === targetKey,
    );
    if (unguessedInTarget.length === 0) return;

    const pick =
      unguessedInTarget[Math.floor(Math.random() * unguessedInTarget.length)];

    return pick
  }

  useEffect(() => {
    if (pokemons.length === 0) return;

    const bonusPokemon = []

    const currentCount = guessedPokemons.size;
    const prevCount = prevGuessedCount.current;
    prevGuessedCount.current = currentCount;

    if (currentCount === prevCount) return;

    const currentComplete = new Set(
      displayStats
        .filter((s) => s.guessed === s.total)
        .map((s) => s.types.join("/"))
    );

    const newlyComplete = [...currentComplete].filter(
      (k) => !prevCompleteKeys.current.has(k)
    );

    prevCompleteKeys.current = currentComplete;

    // Decide rewards BEFORE any state changes happen.
    const hit10 = currentCount > 0 && currentCount % 10 === 0;
    const hit25 = currentCount > 0 && currentCount % 25 === 0;

    // Execute category rewards.
    newlyComplete.forEach((key) => {
      const pick = giveCategoryCompleteHint(key);
      if (pick) bonusPokemon.push({
        pokemon: pick,
        reason: "category",
        category: key,
      });
    });

    // Execute 10-guess reward.
    if (hit10) {
      if (
        activeHintRef.current &&
        !guessedPokemons.has(activeHintRef.current.id)
      ) {
        hintRevealedRef.current += 1;

        const pokemon = activeHintRef.current;
        const name = pokemon.names.en;

        if (hintRevealedRef.current >= name.length) {
          setGuessedPokemons((prev) => new Set([...prev, pokemon.id]));

          activeHintRef.current = null;
          hintRevealedRef.current = 1;

          toast(
            <span>
              🎉 <strong>{name}</strong>
              <br />
              <span className="text-xs text-slate-400">
                Hint fully revealed — automatically added!
              </span>
            </span>,
            { duration: 6000 }
          );
        } else {
          showHintToast(pokemon, hintRevealedRef.current);
        }
      } else {
        const pick = pickNextHintPokemon();

        if (pick) {
          activeHintRef.current = pick;
          hintRevealedRef.current = 1;
          showHintToast(pick, 1);
        }
      }
    }

    // Execute 25-guess reward.
    if (hit25) {
      const pick = giveFullNameHint();
      if (pick) bonusPokemon.push({
        pokemon: pick,
        reason: "25",
      });
    }

    if (bonusPokemon.length > 0) {
      setGuessedPokemons((prev) => {
        const next = new Set(prev);

        bonusPokemon.forEach(({ pokemon }) => {
          next.add(pokemon.id);
        });

        return next;
      });

      bonusPokemon.forEach((reward) => {
        if (reward.reason === "category") {
          toast(
            <span>
              🏆 <strong>{reward.category}</strong> complete!
              <br />
              <span className="text-xs text-slate-400">
                Bonus: <strong>{reward.pokemon.names.en}</strong> auto-added!
              </span>
            </span>,
            { duration: 7000 }
          );
        } else {
          toast(
            <span>
              ✨ <strong>{reward.pokemon.names.en}</strong>
              <br />
              <span className="text-xs text-slate-400">
                Automatically added!
              </span>
            </span>,
            { duration: 6000 }
          );
        }
      });
    }
  }, [guessedPokemons, displayStats, pokemons]);

  function handleGuess(e) {
    e.preventDefault();
    if (!guess.trim()) return;

    const normalizedGuess = normalize(guess);

    const pokemon = pokemons
      .filter((p) =>
        Object.values(p.names).some(
          (n) => normalize(n) === normalizedGuess
        )
      )
      .find((p) => !guessedPokemons.has(p.id));

    if (!pokemon) {
      setFlash("incorrect");
      setTimeout(() => setFlash(null), 400);
      return;
    }

    setFlash("correct");
    setTimeout(() => setFlash(null), 400);

    if (!running) {
      setRunning(true);
      setStartTime(Date.now());
    }

    setGuessedPokemons((prev) => {
      const next = new Set(prev);
      next.add(pokemon.id);
      return next;
    });

    setGuess("");
    setShowSuggestions(false);
  }

  const guessedList = guess.trim()
    ? pokemons.filter(
        (p) =>
          guessedPokemons.has(p.id) &&
          Object.values(p.names).some((name) =>
            normalize(name).includes(normalize(guess))
          )
      )
    : [];

  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #334155",
          },
        }}
      />
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm pb-4 space-y-4">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t("Home", language)}
            </a>
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-between">
            <div className="font-mono text-2xl font-bold text-slate-200">
              ⏱ {formatTime(elapsed)}
            </div>
            <span className="text-lg font-bold text-slate-200">
              {guessedPokemons.size} / {pokemons.length}
            </span>
          </div>
        </header>

        <div className="relative">
          <form onSubmit={handleGuess}>
          <input
            ref={inputRef}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-slate-500"
            placeholder={t("Type a Pokémon name in any language...", language)}
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => guess.trim() && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoFocus
            style={{
              boxShadow: flash === "correct"
                ? "0 0 0 3px #22c55e"
                : flash === "incorrect"
                ? "0 0 0 3px #ef4444"
                : undefined,
              transition: "box-shadow 0.1s, border-color 0.15s",
            }}
          />
        </form>

        {showSuggestions && guessedList.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl max-h-60 overflow-y-auto">
            {guessedList.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400"
              >
                <img src={p.sprite} alt="" className="size-8 object-contain opacity-60" />
                <span className="font-mono text-xs text-slate-600">
                  #{p.id.toString().padStart(4, "0")}
                </span>
                <span className="font-medium text-slate-400">
                  {p.names[language] || p.names.en}
                </span>
                <span className="ml-auto text-xs text-green-600 font-semibold">
                  ✓ {t("Guessed", language)}
                </span>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {displayStats.map((data) => (
          <div
            key={data.types.join("/")}
            className={`rounded-xl border p-4 transition-colors ${
              data.guessed === data.total
                ? "border-green-700 bg-green-900/10"
                : "border-slate-700 bg-slate-800/60"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-1.5 flex-wrap">
                {data.types.map((type) => (
                  <PokeTypeBadge key={type} type={type.toLowerCase()} language={language} />
                ))}
              </div>

              <span className="font-semibold text-sm text-slate-300">
                {data.guessed} / {data.total}
              </span>
            </div>

            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(data.guessed / data.total) * 100}%`,
                  backgroundColor: `hsl(${(data.guessed / data.total) * 120}, 80%, 40%)`,
                }}
              />
            </div>

            {data.pokemons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {data.pokemons.map((p) => (
                  <span
                    key={p.id}
                    className="rounded bg-slate-700/50 px-2 py-0.5 text-[11px] text-slate-300"
                  >
                    {p.names[language] || p.names.en}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
