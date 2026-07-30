import { useState, useEffect } from "react";

import DexItem from "./DexItem";
import HomeButton from "./HomeButton";
import LanguageSelector from "./LanguageSelector";
import { formatDexEntryNumber } from "../utils/dexentrynumber";
import { normalize } from "../utils/normalize";
import { getLanguage, subscribe } from "../stores/language";
import { t, typeNames } from "../stores/translations";

export default function Dex() {
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState(getLanguage());

  useEffect(() => subscribe(setLanguage), []);

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
    const raw = query.trim();
    if (!raw) {
      setFilteredPokemons(pokemons);
      return;
    }
    const terms = raw.split(",").map(t => normalize(t)).filter(Boolean);
    const filtered = pokemons.filter((pokemon) => {
      const name = normalize(pokemon.names[language] || pokemon.names.en || "");
      const translatedTypes = pokemon.types.map(t => normalize(typeNames[t]?.[language] || typeNames[t]?.en || "")).join(" ");
      const types = pokemon.types.join(" ");
      const id = pokemon.id.toString();
      const formattedId = formatDexEntryNumber(pokemon.id);
      const haystack = [name, types, translatedTypes, id, formattedId].join(" ");
      return terms.some(term => haystack.includes(term));
    });
    setFilteredPokemons(filtered);
  }, [query, language, pokemons]);

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <header className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-slate-900/95 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between">
          <HomeButton />
          <LanguageSelector />
        </div>
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
            placeholder={t("Search by name, type, or number...", language)}
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
          <p className="text-lg">{t("No Pokémon found", language)}</p>
          <p className="text-sm">{t("Try a different search term", language)}</p>
        </div>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredPokemons.map((pokemon) => (
            <DexItem key={pokemon.id} pokemon={pokemon} language={language} />
          ))}
        </section>
      )}
    </div>
  );
}
