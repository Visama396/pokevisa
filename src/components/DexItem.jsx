import { formatDexEntryNumber } from "../utils/dexentrynumber";
import { capitalize } from "../utils/capitalize";
import PokeTypeBadge from "./PokeTypeBadge";

export default function DexItem({ pokemon }) {
  return (
    <div className="bg-slate-800 rounded-md p-2 hover:bg-slate-750">
      <h2>
        #{formatDexEntryNumber(pokemon.id)} {capitalize(pokemon.name)}
      </h2>
      <p className="flex gap-1">
        {pokemon.types.map((type) => (
          <PokeTypeBadge type={type} />
        ))}
      </p>
      <img className="size-30" src={pokemon.sprite} alt={pokemon.name} />
    </div>
  );
}
