import { useEffect, useMemo, useState } from "react";
import { normalize } from "../utils/normalize";

import PokeTypeBadge from "./PokeTypeBadge";

export default function DexMaster() {
  const [pokemons, setPokemons] = useState([]);
  const [guess, setGuess] = useState("");
  const [language, setLanguage] = useState("es")

  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const [guessedPokemons, setGuessedPokemons] = useState(new Set());
  const [flash, setFlash] = useState(null);

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

  function handleGuess(e) {
    e.preventDefault();

    const normalizedGuess = normalize(guess);

    const pokemon = pokemons.find((p) =>
      Object.values(p.names).some(
        (name) => normalize(name) === normalizedGuess
      )
    );

    if (!pokemon || guessedPokemons.has(pokemon.id)) {
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
  }

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
        };
      }

      stats[key].total++;

      if (guessedPokemons.has(pokemon.id)) {
        stats[key].guessed++;
      }
    }

    const entries = Object.values(stats);
    const incomplete = entries.filter((s) => s.guessed < s.total);
    const complete = entries.filter((s) => s.guessed === s.total);
    return [...incomplete, ...complete];
  }, [pokemons, guessedPokemons]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div className="font-mono text-3xl">
          ⏱ {formatTime(elapsed)}
        </div>

        <div className="text-xl font-bold">
          {guessedPokemons.size} / {pokemons.length}
        </div>
      </header>

      <form onSubmit={handleGuess}>
        <input
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Type a Pokémon..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          autoFocus
          style={{
            boxShadow: flash === "correct"
              ? "0 0 0 3px #22c55e"
              : flash === "incorrect"
              ? "0 0 0 3px #ef4444"
              : undefined,
            transition: "box-shadow 0.1s",
          }}
        />
      </form>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {displayStats.map((data) => (
          <div
            key={data.types.join("/")}
            className="rounded-lg border p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2 flex-wrap">
                {data.types.map((type) => (
                  <PokeTypeBadge
                    key={type}
                    type={type.toLowerCase()}
                  />
                ))}
              </div>

              <span className="font-semibold">
                {data.guessed} / {data.total}
              </span>
            </div>

            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(data.guessed / data.total) * 100}%`,
                  backgroundColor: `hsl(${(data.guessed / data.total) * 120}, 80%, 40%)`,
                }}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
