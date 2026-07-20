import { getTypeName } from "../stores/translations";

const typeToColor = {
  normal: "bg-gray-400 text-gray-900",
  fire: "bg-orange-500 text-white",
  water: "bg-blue-500 text-white",
  electric: "bg-yellow-400 text-yellow-900",
  grass: "bg-green-500 text-white",
  ice: "bg-cyan-300 text-cyan-900",
  fighting: "bg-red-600 text-white",
  poison: "bg-purple-600 text-white",
  ground: "bg-amber-600 text-white",
  flying: "bg-indigo-400 text-white",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-500 text-white",
  rock: "bg-yellow-700 text-white",
  ghost: "bg-purple-700 text-white",
  dragon: "bg-indigo-600 text-white",
  dark: "bg-gray-700 text-white",
  steel: "bg-gray-400 text-gray-900",
  fairy: "bg-pink-400 text-white",
};

export default function PokeTypeBadge({ type, language }) {
  return (
    <span className={`${typeToColor[type] || "bg-slate-600 text-white"} rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide`}>
      {getTypeName(type, language)}
    </span>
  );
}
