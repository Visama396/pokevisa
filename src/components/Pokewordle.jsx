import { useState, useEffect, useRef } from "react";
import { randomEntryNumber } from "../utils/randomEntryNumber";
import { normalize } from "../utils/normalize";
import { getLanguage, subscribe } from "../stores/language";
import { t, getTypeName } from "../stores/translations";
import LanguageSelector from "./LanguageSelector";
import PokedleGuess from "./PokedleGuess";

const MAX_GUESSES = 12;

export default function Pokewordle() {
  const [pokemons, setPokemons] = useState([]);
  const [abilities, setAbilities] = useState({});
  const [todayPokemon, setTodayPokemon] = useState(null);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [language, setLanguage] = useState(getLanguage());
  const inputRef = useRef(null);

  useEffect(() => subscribe(setLanguage), []);

  useEffect(() => {
    Promise.all([
      fetch("/pokedex.json").then((r) => r.json()),
      fetch("/abilities.json").then((r) => r.json()),
    ]).then(([data, abilData]) => {
      setPokemons(data);
      setAbilities(abilData);
      const num = randomEntryNumber();
      setTodayPokemon(data[num]);
    });
  }, []);

  const filtered = guess.trim()
    ? pokemons.filter((p) =>
        Object.values(p.names).some((name) =>
          normalize(name).includes(normalize(guess))
        )
      ).slice(0, 10)
    : [];

  const submitGuess = (name) => {
    const input = name || guess;
    if (!input.trim()) return;
    const normalizedGuess = normalize(input);
    const pokemon = pokemons.find((p) =>
      Object.values(p.names).some((n) => normalize(n) === normalizedGuess)
    );
    if (!pokemon) return;

    const newGuesses = [...guesses, pokemon];
    setGuesses(newGuesses);
    setGuess("");
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (pokemon.id === todayPokemon.id) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filtered.length === 0) {
      if (e.key === "Enter") submitGuess();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        submitGuess(filtered[selectedIndex].slug);
      } else {
        submitGuess();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="relative flex items-center justify-center gap-4">
        <a
          href="/"
          className="absolute left-0 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t("Home", language)}
        </a>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">PokéWordle</h1>
          <p className="text-sm text-slate-400">
            {t("Guess today's Pokémon —", language)} {guesses.length}/{MAX_GUESSES}
          </p>
        </div>
        <div className="absolute right-0">
          <LanguageSelector />
        </div>
      </div>

      {!gameOver && (
        <div className="relative max-w-md mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitGuess();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={t("Type a Pokémon name...", language)}
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => guess.trim() && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
            />
          </form>
          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl max-h-60 overflow-y-auto">
              {filtered.map((p, i) => (
                <li
                  key={p.id}
                  onMouseDown={() => submitGuess(p.slug)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition-colors ${
                    i === selectedIndex
                      ? "bg-slate-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <img src={p.sprite} alt="" className="size-8 object-contain" />
                  <span className="font-mono text-xs text-slate-500">
                    #{p.id.toString().padStart(4, "0")}
                  </span>
                  <span className="font-medium">{p.names[language] || p.names.en}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {guesses.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
              <div>{t("Pokémon (header)", language)}</div>
              <div>{t("Gen (header)", language)}</div>
              <div>{t("Types (header)", language)}</div>
              <div>{t("Abilities (header)", language)}</div>
              <div>{t("Height (header)", language)}</div>
              <div>{t("Weight (header)", language)}</div>
              <div>{t("Color (header)", language)}</div>
            </div>
            <div className="space-y-2">
              {guesses.map((g, i) => (
                <PokedleGuess
                  key={g.id + "-" + i}
                  todayPokemon={todayPokemon}
                  pokemon={g}
                  abilities={abilities}
                  language={language}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 text-center space-y-3">
          {won ? (
            <>
              <p className="text-2xl">🎉</p>
              <h2 className="text-2xl font-bold text-green-400">{t("Correct!", language)}</h2>
              <p className="text-slate-300">
                {t("You guessed it in", language)} {guesses.length} {t(guesses.length > 1 ? "attempts" : "attempt", language)}.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl">😔</p>
              <h2 className="text-2xl font-bold text-red-400">{t("Game Over", language)}</h2>
              <p className="text-slate-300">
                {t("The Pokémon was", language)}{" "}
                <span className="font-bold text-white">
                  {todayPokemon?.names?.[language] || todayPokemon?.names?.en}
                </span>
                .
              </p>
            </>
          )}
          <div className="flex justify-center gap-2">
            {todayPokemon?.types?.map((type) => (
              <span key={type} className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                {getTypeName(type, language)}
              </span>
            ))}
          </div>
          <img
            src={todayPokemon?.sprite}
            alt=""
            className="size-32 object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}
