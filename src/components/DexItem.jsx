import { formatDexEntryNumber } from "../utils/dexentrynumber";
import { capitalize } from "../utils/capitalize";
import PokeTypeBadge from "./PokeTypeBadge";

export default function DexItem({ pokemon }) {
  return (
    <a
      href={`/pokedex/${pokemon.id}`}
      className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-black/20"
    >
      <span className="text-xs font-mono text-slate-500">
        #{formatDexEntryNumber(pokemon.id)}
      </span>
      <img
        className="size-24 object-contain transition-transform duration-200 group-hover:scale-110"
        src={pokemon.sprite}
        alt={pokemon.names.en}
      />
      <h2 className="text-sm font-semibold text-slate-200">
        {capitalize(pokemon.names.en)}
      </h2>
      <div className="flex flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => (
          <PokeTypeBadge key={type} type={type} />
        ))}
      </div>
    </a>
  );
}
