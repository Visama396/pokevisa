import { useState, useEffect, useCallback } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t, getStatLabel, getTypeName } from "../stores/translations";
import HomeButton from "./HomeButton";
import LanguageSelector from "./LanguageSelector";
import PokeTypeBadge from "./PokeTypeBadge";

const STAT_NAMES = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

function pickRandom(arr, exclude) {
  const pool = exclude != null ? arr.filter((p) => p.id !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getStat(pokemon, statName) {
  return pokemon.baseStats.find((s) => s.name === statName)?.value ?? 0;
}

function PokemonCard({ pokemon, language, onClick, disabled, result, statName }) {
  const name = pokemon.names[language] || pokemon.names.en;
  const statVal = getStat(pokemon, statName);
  const isWinner = result === "win";
  const isLoser = result === "lose";

  let borderClass = "border-slate-700";
  if (isWinner) borderClass = "border-green-500 shadow-lg shadow-green-500/20";
  else if (isLoser) borderClass = "border-red-500 shadow-lg shadow-red-500/20";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center gap-3 rounded-2xl border ${borderClass} bg-slate-800/60 p-6 transition-all duration-300 ${!disabled ? "cursor-pointer hover:border-slate-500 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20" : "cursor-default"}`}
    >
      <img
        src={pokemon.sprite}
        alt={name}
        className="size-28 object-contain"
        loading="lazy"
      />
      <h2 className="text-lg font-bold text-slate-100">{name}</h2>
      <div className="flex flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => (
          <PokeTypeBadge key={type} type={type} language={language} />
        ))}
      </div>
      <div className={`text-sm font-mono mt-1 ${isWinner ? "text-green-400" : isLoser ? "text-red-400" : "text-slate-500"}`}>
        {isWinner && `✓ ${statVal}`}
        {isLoser && `✗ ${statVal}`}
      </div>
    </button>
  );
}

export default function PokeStatsBattle() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(getLanguage());
  const [screen, setScreen] = useState("title");
  const [champion, setChampion] = useState(null);
  const [challenger, setChallenger] = useState(null);
  const [statName, setStatName] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => subscribe(setLanguage), []);

  useEffect(() => {
    fetch("/pokedex.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load pokedex.json");
        return r.json();
      })
      .then((data) => {
        setPokemons(data);
        setLoading(false);
      });
  }, []);

  const startGame = useCallback(() => {
    if (pokemons.length < 2) return;
    const stat = STAT_NAMES[Math.floor(Math.random() * STAT_NAMES.length)];
    const a = pickRandom(pokemons);
    const b = pickRandom(pokemons, a.id);
    setChampion(a);
    setChallenger(b);
    setStatName(stat);
    setScore(0);
    setRound(1);
    setResult(null);
    setScreen("playing");
  }, [pokemons]);

  const handlePick = useCallback((picked) => {
    if (result) return;
    const winner =
      getStat(champion, statName) >= getStat(challenger, statName)
        ? champion
        : challenger;

    const isCorrect = picked.id === winner.id;
    const newScore = isCorrect ? score + 1 : score;
    const newStreak = isCorrect ? round : 0;

    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore(newScore);
      setBestStreak((prev) => Math.max(prev, round));
    }

    setTimeout(() => {
      if (!isCorrect) {
        setScreen("gameover");
        return;
      }
      const nextStat = STAT_NAMES[Math.floor(Math.random() * STAT_NAMES.length)];
      const nextChallenger = pickRandom(pokemons, winner.id);
      setChampion(winner);
      setChallenger(nextChallenger);
      setStatName(nextStat);
      setRound((r) => r + 1);
      setResult(null);
    }, 1200);
  }, [champion, challenger, statName, score, round, result, pokemons]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center text-slate-400 py-20">{t("Loading Pokédex...", language)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <HomeButton />
        <LanguageSelector />
      </div>

      {screen === "title" && (
        <div className="flex flex-col items-center gap-8 py-16">
          <h1 className="text-4xl font-bold tracking-tight">{t("Stats Battle", language)}</h1>
          <p className="text-slate-400 text-center max-w-md">
            {t("statsbattle-desc", language)}
          </p>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 max-w-sm w-full space-y-3 text-sm text-slate-300">
            <p>{t("statsbattle-rule1", language)}</p>
            <p>{t("statsbattle-rule2", language)}</p>
            <p>{t("statsbattle-rule3", language)}</p>
          </div>
          <button
            onClick={startGame}
            className="rounded-xl bg-green-700 px-8 py-3 text-lg font-semibold text-white hover:bg-green-600 transition-colors"
          >
            {t("Play", language)}
          </button>
        </div>
      )}

      {screen === "playing" && champion && challenger && (
        <>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
              <span>{t("Score", language)}: <span className="text-white font-bold">{score}</span></span>
              <span className="text-slate-600">|</span>
              <span>{t("Round", language)}: <span className="text-white font-bold">{round}</span></span>
            </div>
            <h2 className="text-lg font-semibold text-slate-200">
              {t("Which Pokémon has the highest", language)}{" "}
              <span className="text-yellow-400">{getStatLabel(statName, language)}</span>?
            </h2>
          </div>

          <div className="flex gap-4 items-stretch">
            <PokemonCard
              pokemon={champion}
              language={language}
              onClick={() => handlePick(champion)}
              disabled={!!result}
              result={
                result
                  ? (getStat(champion, statName) >= getStat(challenger, statName) ? "win" : "lose")
                  : null
              }
              statName={statName}
            />
            <div className="flex items-center">
              <span className="text-2xl font-bold text-slate-500">{t("or", language)}</span>
            </div>
            <PokemonCard
              pokemon={challenger}
              language={language}
              onClick={() => handlePick(challenger)}
              disabled={!!result}
              result={
                result
                  ? (getStat(challenger, statName) >= getStat(champion, statName) ? "win" : "lose")
                  : null
              }
              statName={statName}
            />
          </div>

          {result && (
            <div className={`text-center text-lg font-bold ${result === "correct" ? "text-green-400" : "text-red-400"}`}>
              {result === "correct" ? t("Correct!", language) : t("Wrong!", language)}
            </div>
          )}
        </>
      )}

      {screen === "gameover" && (
        <div className="flex flex-col items-center gap-6 py-16">
          <p className="text-4xl">{score > 0 ? "🎉" : "💀"}</p>
          <h2 className="text-3xl font-bold text-slate-100">{t("Game Over", language)}</h2>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-3 text-center">
            <p className="text-slate-400">
              {t("Total Score", language)}:{" "}
              <span className="text-2xl font-bold text-white">{score}</span>
            </p>
            <p className="text-slate-400">
              {t("Round", language)}:{" "}
              <span className="text-xl font-bold text-white">{round}</span>
            </p>
            <p className="text-slate-400">
              {t("Best Streak", language)}:{" "}
              <span className="text-xl font-bold text-yellow-400">{bestStreak}</span>
            </p>
          </div>
          <button
            onClick={startGame}
            className="rounded-xl bg-green-700 px-8 py-3 text-lg font-semibold text-white hover:bg-green-600 transition-colors"
          >
            {t("Play Again", language)}
          </button>
        </div>
      )}
    </div>
  );
}
