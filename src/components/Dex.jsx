import { useState, useEffect } from "react";

import DexItem from "./DexItem";
import { formatDexEntryNumber } from "../utils/dexentrynumber";

export default function Dex() {
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadPokedex() {
      const res = await fetch("/pokedex.json");

      if (!res.ok) {
        throw new Error("Failed to load pokedex.json");
      }

      const data = await res.json();
      setPokemons(data);
      setFilteredPokemons(data);
      setLoading(false);
    }

    loadPokedex();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setFilteredPokemons(pokemons);
      return;
    }
    const filtered = pokemons.filter((pokemon) => {
      const name = pokemon.names.en.toLowerCase();
      const types = pokemon.types.join(" ");
      const id = pokemon.id.toString();
      const formattedId = formatDexEntryNumber(pokemon.id);
      return name.includes(q) || types.includes(q) || id.includes(q) || formattedId.includes(q);
    });
    setFilteredPokemons(filtered);
  }, [query, pokemons]);

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <header className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-slate-900/95 backdrop-blur-sm">
        <a
          href="/"
          className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </a>
        <div className="relative max-w-md mx-auto">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, type, or number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-slate-500"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-slate-700 border-t-red-500" />
        </div>
      ) : filteredPokemons.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-slate-500">
          <span className="text-4xl">🔍</span>
          <p className="text-lg">No Pokémon found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 text-center">
            Showing {filteredPokemons.length} of {pokemons.length} Pokémon
          </p>
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredPokemons.map((pokemon) => (
              <DexItem key={pokemon.id} pokemon={pokemon} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
