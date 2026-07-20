import { useState, useEffect } from "react";
import { capitalize } from "../utils/capitalize";
import { formatDexEntryNumber } from "../utils/dexentrynumber";
import { getLanguage, subscribe } from "../stores/language";
import LanguageSelector from "./LanguageSelector";
import PokeTypeBadge from "./PokeTypeBadge";

const typeChart = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5, poison: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, bug: 0.5, ghost: 2, dark: 0.5, fairy: 0.5, steel: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, poison: 0.5, fighting: 2, dragon: 2, dark: 2, steel: 0.5 },
};

const languageNames = {
  "ja-hrkt": "Japanese (Hiragana)",
  "ja-roma": "Japanese (Romaji)",
  ko: "Korean",
  "zh-hant": "Chinese (Traditional)",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  en: "English",
  ja: "Japanese",
  "zh-hans": "Chinese (Simplified)",
  "es-419": "Spanish (Latin America)",
};

const pokedexNames = {
  national: "National",
  kanto: "Kanto",
  "original-johto": "Johto",
  "updated-johto": "Johto",
  hoenn: "Hoenn",
  "original-sinnoh": "Sinnoh",
  "extended-sinnoh": "Sinnoh",
  unova: "Unova",
  "original-unova": "Unova",
  "kalos-central": "Kalos Central",
  "kalos-coastal": "Kalos Coastal",
  "kalos-mountain": "Kalos Mountain",
  "original-alola": "Alola",
  "original-melemele": "Alola Melemele",
  "original-akala": "Alola Akala",
  "original-ulaula": "Alola Ula'ula",
  "original-poni": "Alola Poni",
  "updated-alola": "Alola",
  "updated-melemele": "Alola Melemele",
  "updated-akala": "Alola Akala",
  "updated-ulaula": "Alola Ula'ula",
  "updated-poni": "Alola Poni",
  "letsgo-kanto": "Let's Go Kanto",
  galar: "Galar",
  "isle-of-armor": "Isle of Armor",
  "crown-tundra": "Crown Tundra",
  hisui: "Hisui",
  paldea: "Paldea",
  kitakami: "Kitakami",
  blueberry: "Blueberry",
  "lumiose-city": "Lumiose City",
  "conquest-gallery": "Conquest Gallery",
  champions: "Champions",
};

const versionToGen = {
  red: "I", blue: "I", yellow: "I",
  gold: "II", silver: "II", crystal: "II",
  ruby: "III", sapphire: "III", emerald: "III", firered: "III", leafgreen: "III",
  diamond: "IV", pearl: "IV", platinum: "IV", heartgold: "IV", soulsilver: "IV",
  black: "V", white: "V", "black-2": "V", "white-2": "V",
  x: "VI", y: "VI", "omega-ruby": "VI", "alpha-sapphire": "VI",
  sun: "VII", moon: "VII", "ultra-sun": "VII", "ultra-moon": "VII",
  "letsgo-pikachu": "VII", "letsgo-eevee": "VII",
  sword: "VIII", shield: "VIII", "brilliant-diamond": "VIII", "shining-pearl": "VIII",
  "legends-arceus": "VIII",
  scarlet: "IX", violet: "IX", "the-teal-mask": "IX", "the-indigo-disk": "IX",
};

const allTypes = Object.keys(typeChart);
const statLabels = { hp: "HP", attack: "Attack", defense: "Defense", "special-attack": "Sp. Atk", "special-defense": "Sp. Def", speed: "Speed" };

function getEffectiveness(types) {
  return allTypes.map((attackType) => {
    let multiplier = 1;
    for (const defType of types) {
      const chart = typeChart[attackType];
      if (chart && chart[defType] !== undefined) {
        multiplier *= chart[defType];
      }
    }
    return { type: attackType, multiplier };
  });
}

function formatMoveName(name) {
  return name.split("-").map((w) => capitalize(w)).join(" ");
}

function EffBadge({ multiplier }) {
  const label = multiplier === 0 ? "0×" : multiplier < 1 ? "½×" : multiplier === 1 ? "1×" : multiplier === 2 ? "2×" : "4×";
  const colors =
    multiplier === 0
      ? "bg-gray-700 text-gray-400"
      : multiplier < 1
        ? "bg-red-900/50 text-red-300"
        : multiplier === 1
          ? "bg-slate-700/50 text-slate-300"
          : multiplier <= 2
            ? "bg-green-900/50 text-green-300"
            : "bg-green-700/50 text-green-200";
  return <span className={`${colors} rounded px-2 py-0.5 text-xs font-mono font-bold`}>{label}</span>;
}

function MoveIcon({ name, moveData }) {
  const category = moveData?.[name];
  if (!category) return null;
  return (
    <img
      src={`https://img.pokemondb.net/images/icons/move-${category}.png`}
      alt={category}
      className="size-4 shrink-0 object-contain"
      title={category}
    />
  );
}

export default function PokemonDetails({ pokemon }) {
  const [moveData, setMoveData] = useState(null);
  const [language, setLanguage] = useState(getLanguage());

  useEffect(() => subscribe(setLanguage), []);

  useEffect(() => {
    fetch("/moves.json")
      .then((r) => r.json())
      .then(setMoveData)
      .catch(() => {});
  }, []);
  const effectiveness = getEffectiveness(pokemon.types);

  const flavorTextsByText = {};
  for (const ft of pokemon.flavorTexts || []) {
    const key = ft.text.replace(/\s+/g, " ").trim();
    if (!flavorTextsByText[key]) {
      flavorTextsByText[key] = { text: ft.text, versions: [] };
    }
    const gen = versionToGen[ft.version] || "?";
    if (!flavorTextsByText[key].versions.find((v) => v.gen === gen)) {
      flavorTextsByText[key].versions.push({ gen, names: [] });
    }
    const group = flavorTextsByText[key].versions.find((v) => v.gen === gen);
    if (!group.names.includes(ft.version)) {
      group.names.push(ft.version);
    }
  }

  const localDexEntries = (pokemon.pokedexNumbers || []).filter((n) => n.pokedex !== "national");

  const maxStat = 255;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <nav className="flex items-center justify-between gap-4">
        <a
          href="/pokedex"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700/60 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pokédex
        </a>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          {pokemon.id > 1 && (
            <a
              href={`/pokedex/${pokemon.id - 1}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </a>
          )}
          {pokemon.id < 1025 && (
            <a
              href={`/pokedex/${pokemon.id + 1}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Next
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </nav>

      {/* Row 1: Sprite + Name | Pokedex */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-8">
          <span className="text-sm font-mono text-slate-500">
            #{formatDexEntryNumber(pokemon.id)}
          </span>
          <img
            className="size-48 object-contain"
            src={pokemon.sprite}
            alt={pokemon.names.en}
          />
          <h1 className="text-3xl font-bold">{capitalize(pokemon.names[language] || pokemon.names.en)}</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {pokemon.types.map((type) => (
              <PokeTypeBadge key={type} type={type} />
            ))}
          </div>
          {(pokemon.legendary || pokemon.mythical) && (
            <div className="flex gap-2">
              {pokemon.legendary && (
                <span className="rounded-full bg-yellow-600/30 text-yellow-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  Legendary
                </span>
              )}
              {pokemon.mythical && (
                <span className="rounded-full bg-purple-600/30 text-purple-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  Mythical
                </span>
              )}
            </div>
          )}
          {pokemon.generation && (
            <span className="text-xs text-slate-500 font-mono">
              {pokemon.generation.replace("generation-", "").toUpperCase()}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-xl font-bold mb-4">Pokédex</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">National №</dt>
              <dd className="font-mono font-semibold">#{formatDexEntryNumber(pokemon.id)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Species</dt>
              <dd className="font-semibold">{pokemon.genus || "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Height</dt>
              <dd className="font-semibold">{(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Weight</dt>
              <dd className="font-semibold">{(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
            <div className="border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400 mb-1">Abilities</dt>
              <dd className="flex flex-wrap gap-1">
                {(pokemon.abilities || []).map((ability) => (
                  <span
                    key={ability.name}
                    className={`rounded-full px-3 py-0.5 text-xs ${
                      ability.hidden
                        ? "border border-dashed border-slate-500 text-slate-400"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    {capitalize(ability.name.replace(/-/g, " "))}
                    {ability.hidden && (
                      <span className="text-xs text-slate-500 ml-1">(Hidden)</span>
                    )}
                  </span>
                ))}
              </dd>
            </div>
            {localDexEntries.length > 0 && (
              <div className="pb-2">
                <dt className="text-slate-400 mb-1">Local Entries</dt>
                <dd className="space-y-1">
                  {localDexEntries.map((entry) => (
                    <div key={entry.pokedex} className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        {pokedexNames[entry.pokedex] || capitalize(entry.pokedex.replace(/-/g, " "))}
                      </span>
                      <span className="font-mono text-slate-200">
                        #{formatDexEntryNumber(entry.entry)}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Row 2: Training | Breeding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-xl font-bold mb-4">Training</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">EV Yield</dt>
              <dd className="font-semibold text-right">
                {(pokemon.evYield || []).length > 0
                  ? (pokemon.evYield || []).map((ev) => (
                      <span key={ev.name} className="ml-2">
                        {statLabels[ev.name] || capitalize(ev.name)} +{ev.value}
                      </span>
                    ))
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Catch Rate</dt>
              <dd className="font-semibold">{pokemon.catchRate ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Base Friendship</dt>
              <dd className="font-semibold">{pokemon.baseFriendship ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Base Exp.</dt>
              <dd className="font-semibold">{pokemon.baseExperience ?? "—"}</dd>
            </div>
            <div className="flex justify-between pb-2">
              <dt className="text-slate-400">Growth Rate</dt>
              <dd className="font-semibold">
                {pokemon.growthRate ? capitalize(pokemon.growthRate.replace(/-/g, " ")) : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-xl font-bold mb-4">Breeding</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Egg Groups</dt>
              <dd className="font-semibold text-right">
                {(pokemon.eggGroups || []).length > 0
                  ? (pokemon.eggGroups || []).map((g) => capitalize(g)).join(", ")
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <dt className="text-slate-400">Gender</dt>
              <dd className="font-semibold">{pokemon.gender || "Genderless"}</dd>
            </div>
            <div className="flex justify-between pb-2">
              <dt className="text-slate-400">Egg Cycles</dt>
              <dd className="font-semibold">{pokemon.eggCycles ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Row 3: Base Stats */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
        <h2 className="text-xl font-bold mb-4">Base Stats</h2>
        <div className="space-y-2">
          {(pokemon.baseStats || []).map((stat) => {
            const pct = Math.min((stat.value / maxStat) * 100, 100);
            const barColor =
              stat.value >= 120
                ? "bg-green-500"
                : stat.value >= 90
                  ? "bg-lime-500"
                  : stat.value >= 60
                    ? "bg-yellow-500"
                    : stat.value >= 30
                      ? "bg-orange-500"
                      : "bg-red-500";
            return (
              <div key={stat.name} className="grid grid-cols-[6rem_2.5rem_1fr_2.5rem] items-center gap-2 text-sm">
                <span className="text-slate-300 font-medium text-right">
                  {statLabels[stat.name] || capitalize(stat.name)}
                </span>
                <span className="font-mono font-bold text-slate-200 text-right">{stat.value}</span>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {(stat.effort || 0) > 0 ? `+${stat.effort}` : ""}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50 text-sm font-bold">
            <span className="text-slate-300">Total</span>
            <span className="font-mono text-slate-200">
              {(pokemon.baseStats || []).reduce((s, st) => s + st.value, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Type Effectiveness */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
        <h2 className="text-xl font-bold mb-4">Type Effectiveness</h2>
        <div className="flex flex-wrap gap-1.5">
          {effectiveness.map(({ type, multiplier }) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                multiplier === 0
                  ? "bg-gray-700/60 text-gray-400"
                  : multiplier < 1
                    ? "bg-red-900/30 text-red-300"
                    : multiplier === 1
                      ? "bg-slate-700/40 text-slate-400"
                      : multiplier <= 2
                        ? "bg-green-900/30 text-green-300"
                        : "bg-green-700/30 text-green-200"
              }`}
            >
              {capitalize(type)}
              <span className="font-mono">
                {multiplier === 0 ? "0×" : multiplier < 1 ? "½×" : multiplier === 1 ? "" : multiplier === 2 ? "2×" : "4×"}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Row 5: Evolution Chart */}
      {(pokemon.evolutionChart || []).length > 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-xl font-bold mb-4">Evolution Chart</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pokemon.evolutionChart.map((evo, idx) => (
              <span key={evo.name} className="flex items-center gap-2">
                {idx > 0 && (
                  <svg className="size-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <a
                  href={`/pokedex/${evo.name}`}
                  className="rounded-lg bg-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {capitalize(evo.name.replace(/-/g, " "))}
                  <span className="text-xs text-slate-500 ml-1 font-mono">
                    (Stage {evo.stage})
                  </span>
                </a>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Row 6: Moves by Level | Moves by TM */}
      {(pokemon.moves?.levelUp?.length > 0 || pokemon.moves?.tm?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(pokemon.moves?.levelUp || []).length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
              <h2 className="text-xl font-bold mb-4">Moves by Level</h2>
              <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                {[...(pokemon.moves?.levelUp || [])]
                  .sort((a, b) => a.level - b.level)
                  .map((move) => (
                    <div
                      key={move.name}
                      className="flex justify-between items-center rounded bg-slate-700/30 px-3 py-1.5 text-sm"
                    >
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <MoveIcon name={move.name} moveData={moveData} />
                        {formatMoveName(move.name)}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        Lv. {move.level}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {(pokemon.moves?.tm || []).length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
              <h2 className="text-xl font-bold mb-4">Moves by TM</h2>
              <div className="max-h-80 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                {(pokemon.moves?.tm || []).map((move) => (
                  <span
                    key={move}
                    className="inline-flex items-center gap-1 rounded bg-slate-700/30 px-2.5 py-1 text-xs text-slate-200"
                  >
                    <MoveIcon name={move} moveData={moveData} />
                    {formatMoveName(move)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 7: Moves by Breeding | Tutor */}
      {((pokemon.moves?.egg || []).length > 0 || (pokemon.moves?.tutor || []).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(pokemon.moves?.egg || []).length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
              <h2 className="text-xl font-bold mb-4">Moves by Breeding</h2>
              <div className="flex flex-wrap gap-1.5">
                {(pokemon.moves?.egg || []).map((move) => (
                  <span
                    key={move}
                    className="inline-flex items-center gap-1 rounded bg-slate-700/30 px-2.5 py-1 text-xs text-slate-200"
                  >
                    <MoveIcon name={move} moveData={moveData} />
                    {formatMoveName(move)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(pokemon.moves?.tutor || []).length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
              <h2 className="text-xl font-bold mb-4">Moves by Tutor</h2>
              <div className="flex flex-wrap gap-1.5">
                {(pokemon.moves?.tutor || []).map((move) => (
                  <span
                    key={move}
                    className="inline-flex items-center gap-1 rounded bg-slate-700/30 px-2.5 py-1 text-xs text-slate-200"
                  >
                    <MoveIcon name={move} moveData={moveData} />
                    {formatMoveName(move)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 8: Flavor Texts by Generation */}
      {Object.keys(flavorTextsByText).length > 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-xl font-bold mb-4">Pokédex Entries</h2>
          <div className="space-y-4">
            {Object.values(flavorTextsByText).map((entry) => (
              <div key={entry.text} className="rounded-lg bg-slate-700/30 p-4">
                <div className="flex flex-wrap gap-1 mb-2">
                  {entry.versions.map((v) => (
                    <span
                      key={v.gen + v.names.join(",")}
                      className="rounded bg-slate-600/50 px-2 py-0.5 text-xs font-mono text-slate-300"
                    >
                      Gen {v.gen}
                      <span className="text-slate-500 ml-1">
                        ({v.names.map((n) => formatMoveName(n)).join(", ")})
                      </span>
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 9: Names in Other Languages */}
      {pokemon.names && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-xl font-bold mb-4">Other Languages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(pokemon.names).map(([lang, name]) => (
              <div
                key={lang}
                className={`rounded-lg px-3 py-2 text-sm ${
                  lang === language
                    ? "bg-slate-600/60 ring-1 ring-slate-500"
                    : "bg-slate-700/30"
                }`}
              >
                <span className="block text-xs text-slate-500">
                  {languageNames[lang] || capitalize(lang.replace(/-/g, " "))}
                </span>
                <span className="font-semibold text-slate-200">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
