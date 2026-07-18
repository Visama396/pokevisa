import { capitalize } from "../utils/capitalize";

const typeToColor = {
  normal: "bg-slate-700",
  fire: "bg-red-700",
  water: "bg-blue-700",
  electric: "bg-yellow-700",
  grass: "bg-green-700",
  ice: "bg-cyan-700",
  fighting: "bg-orange-700",
  poison: "bg-purple-700",
  ground: "bg-orange-700",
  flying: "bg-indigo-700",
  psychic: "bg-pink-700",
  bug: "bg-green-700",
  rock: "bg-slate-700",
  ghost: "bg-indigo-700",
  dragon: "bg-indigo-700",
  dark: "bg-slate-700",
  steel: "bg-slate-700",
  fairy: "bg-pink-700",
};

export default function PokeTypeBadge({ type }) {
  return (
    <span className={`${typeToColor[type]} rounded-full px-2 py-1 text-sm`}>
      {capitalize(type)}
    </span>
  );
}
