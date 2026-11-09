import { useState, useEffect, useMemo } from "react";

import LightTunnel from "@/components/LightTunnel";
import OptionWheel from "@/components/OptionWheel";
import DexItem from "./DexItem";
import HomeButton from "./HomeButton";
import LanguageSelector from "./LanguageSelector";
import { formatDexEntryNumber } from "../utils/dexentrynumber";
import { normalize } from "../utils/normalize";
import { TYPE_COLORS } from "../utils/typeColors";
import { getLanguage, subscribe } from "../stores/language";
import { t, typeNames, getTypeName } from "../stores/translations";

// Canonical type order used by the filter wheel (same order as the games' UI).
const TYPE_ORDER = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

export default function Dex() {
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState(getLanguage());
  // Type filter driven by the OptionWheel; null means "All types".
  const [selectedType, setSelectedType] = useState(null);
  // Remounts the wheel so it snaps back to "All types" when cleared externally.
  const [wheelKey, setWheelKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Desktop popout is hover/focus driven; true while the cursor is over the
  // terastal button or the revealed wheel panel.
  const [desktopWheelOpen, setDesktopWheelOpen] = useState(false);

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
    const terms = raw ? raw.split(",").map(term => normalize(term)).filter(Boolean) : [];
    const filtered = pokemons.filter((pokemon) => {
      // Type filter is independent from the text search, so they combine.
      if (selectedType && !pokemon.types.includes(selectedType)) return false;
      if (terms.length === 0) return true;
      const name = normalize(pokemon.names[language] || pokemon.names.en || "");
      const translatedTypes = pokemon.types.map(type => normalize(typeNames[type]?.[language] || typeNames[type]?.en || "")).join(" ");
      const types = pokemon.types.join(" ");
      const id = pokemon.id.toString();
      const formattedId = formatDexEntryNumber(pokemon.id);
      const haystack = [name, types, translatedTypes, id, formattedId].join(" ");
      return terms.some(term => haystack.includes(term));
    });
    setFilteredPokemons(filtered);
  }, [query, language, pokemons, selectedType]);

  // Labels for the wheel: "All types" first, then every type in the current language.
  const typeOptions = useMemo(
    () => [t("All types", language), ...TYPE_ORDER.map(type => getTypeName(type, language))],
    [language]
  );

  const handleTypeChange = (index) => {
    setSelectedType(index === 0 ? null : TYPE_ORDER[index - 1]);
  };

  const clearTypeFilter = () => {
    setSelectedType(null);
    setWheelKey((key) => key + 1);
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col gap-6 p-4 max-w-7xl mx-auto">
      {/* Animated Light Tunnel background (React Bits), fixed behind the dex */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <LightTunnel
          cableColor="#38bdf8"
          pulseColor="#c084fc"
          tunnelColor="#1e293b"
          speed={0.08}
          pulseSpeed={1.6}
          pulseDensity={0.4}
          cableCount={48}
          thickness={0.3}
          glow={0.8}
          brightness={0.9}
          fadeNear={0.45}
          fadeFar={2.2}
          opacity={0.7}
          mouseInteraction
          mouseStrength={0.08}
        />
        {/* Dark veil to keep the cards and text readable over the animation */}
        <div className="absolute inset-0 bg-slate-900/35" />
      </div>
      <header className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-slate-900/95 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between">
          <HomeButton />
          <LanguageSelector />
        </div>
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
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
          {/* On small screens the type wheel lives in a collapsible panel below */}
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-label={t("Filter by type", language)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors lg:hidden ${
              selectedType
                ? "border-slate-500 bg-slate-800 text-slate-100"
                : "border-slate-700 bg-slate-800 text-slate-300"
            }`}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M7 12h10M10 19h4" />
            </svg>
            {selectedType ? getTypeName(selectedType, language) : t("Types", language)}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Type filter wheel.
            Mobile: inline panel toggled by the header "Types" button.
            Desktop: fixed popout that slides in from the left while the
            terastal button (or the panel itself) is hovered/focused. */}
        <aside
          className={`w-full max-w-xs lg:fixed lg:left-0 lg:top-1/2 lg:z-30 lg:block lg:w-auto lg:max-w-none lg:-translate-y-1/2 ${
            filtersOpen ? "block" : "hidden"
          }`}
        >
          <div
            className="group relative"
            onMouseEnter={() => setDesktopWheelOpen(true)}
            onMouseLeave={() => setDesktopWheelOpen(false)}
          >
            {/* Terastal trigger button (desktop only) */}
            <button
              type="button"
              aria-label={t("Filter by type", language)}
              onFocus={() => setDesktopWheelOpen(true)}
              className="absolute left-2 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-400/40 bg-slate-900/80 shadow-lg shadow-black/30 backdrop-blur-sm transition-colors hover:border-emerald-300 hover:bg-slate-800 lg:flex"
              style={selectedType ? { borderColor: TYPE_COLORS[selectedType] } : undefined}
            >
              <img
                src="/terastal.png"
                alt=""
                className="size-7 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]"
              />
            </button>

            <div
              className={`rounded-xl bg-slate-900/60 p-3 backdrop-blur-sm lg:absolute lg:left-0 lg:top-1/2 lg:w-64 lg:rounded-l-none lg:rounded-r-2xl lg:pl-16 lg:transition-all lg:duration-300 lg:ease-out ${
                desktopWheelOpen
                  ? "lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto"
                  : "lg:-translate-x-full lg:opacity-0 lg:pointer-events-none"
              } lg:-translate-y-1/2 lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100 lg:group-focus-within:pointer-events-auto`}
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("Filter by type", language)}
                </h2>
                {selectedType && (
                  <button
                    type="button"
                    onClick={clearTypeFilter}
                    aria-label={t("Clear type filter", language)}
                    className="rounded p-0.5 text-slate-500 transition-colors hover:text-slate-200"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative h-64">
                <OptionWheel
                  key={wheelKey}
                  items={typeOptions}
                  defaultSelected={selectedType ? TYPE_ORDER.indexOf(selectedType) + 1 : 0}
                  onChange={handleTypeChange}
                  textColor="#64748b"
                  activeColor={selectedType ? TYPE_COLORS[selectedType] : "#e2e8f0"}
                  side="left"
                  fontSize={1.15}
                  spacing={1.7}
                  curve={1}
                  tilt={9}
                  blur={1.5}
                  fade={0.22}
                  minOpacity={0.08}
                  smoothing={180}
                  inset={28}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-slate-500">
                {t("Scroll or drag", language)}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
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
      </div>
    </div>
  );
}
