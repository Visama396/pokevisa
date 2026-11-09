import { formatDexEntryNumber } from "../utils/dexentrynumber";
import { capitalize } from "../utils/capitalize";
import { typeGradient } from "../utils/typeColors";
import PokeTypeBadge from "./PokeTypeBadge";

export default function DexItem({ pokemon, language = "en" }) {
  return (
    <a
      href={`/pokedex/${pokemon.id}`}
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-800/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Type-tinted background: gradient of the Pokémon's type color(s) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-200 group-hover:opacity-60"
        style={{ backgroundImage: typeGradient(pokemon.types) }}
      />
      <span className="relative text-xs font-mono text-slate-500">
        #{formatDexEntryNumber(pokemon.id)}
      </span>
      <img
        className="relative size-24 object-contain transition-transform duration-200 group-hover:scale-110"
        src={pokemon.sprite}
        alt={pokemon.names.en}
      />
      <h2 className="relative text-sm font-semibold text-slate-200">
        {capitalize(pokemon.names[language] || pokemon.names.en)}
      </h2>
      <div className="relative flex flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => (
          <PokeTypeBadge key={type} type={type} language={language} />
        ))}
      </div>
    </a>
  );
}
