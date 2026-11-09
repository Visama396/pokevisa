// Accent colors per Pokémon type, matching the Tailwind palette used by
// PokeTypeBadge. Hex values let us build gradients inline (Tailwind can't
// generate dynamic `from-<type>` classes at runtime).
export const TYPE_COLORS = {
  normal: "#9ca3af", // gray-400
  fire: "#f97316", // orange-500
  water: "#3b82f6", // blue-500
  electric: "#facc15", // yellow-400
  grass: "#22c55e", // green-500
  ice: "#67e8f9", // cyan-300
  fighting: "#dc2626", // red-600
  poison: "#9333ea", // purple-600
  ground: "#d97706", // amber-600
  flying: "#818cf8", // indigo-400
  psychic: "#ec4899", // pink-500
  bug: "#84cc16", // lime-500
  rock: "#a16207", // yellow-700
  ghost: "#7e22ce", // purple-700
  dragon: "#4f46e5", // indigo-600
  dark: "#374151", // gray-700
  steel: "#9ca3af", // gray-400
  fairy: "#f472b6", // pink-400
};

const DEFAULT_COLOR = "#475569"; // slate-600

function withAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Builds a CSS gradient tinted with a Pokémon's type color(s).
 * - 2 types: gradient from the first type to the second.
 * - 1 type: gradient from a strong tint to a faint one for depth.
 * Used by DexItem for the card background (see Dex.jsx).
 */
export function typeGradient(types = [], alpha = 0.55) {
  const colors = types.length
    ? types.map((type) => TYPE_COLORS[type] || DEFAULT_COLOR)
    : [DEFAULT_COLOR];

  const from = withAlpha(colors[0], alpha);
  const to = withAlpha(colors[1] ?? colors[0], colors[1] ? alpha : alpha * 0.3);

  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}
