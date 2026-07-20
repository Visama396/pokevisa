const generations = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};

const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

export default function GenerationCell({ value, target }) {
  const current = generations[value];
  const correct = current === generations[target];

  let styles = "border-red-800 bg-red-900/20";
  let arrow = "";

  if (correct) {
    styles = "border-green-600 bg-green-900/20";
  } else {
    arrow = current < generations[target] ? "↑" : "↓";
  }

  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center text-xs font-mono h-full flex items-center justify-center ${styles}`}>
      <span className="text-slate-200">{romans[current - 1]}</span>
      {arrow && <span className="ml-1 text-lg font-bold">{arrow}</span>}
    </div>
  );
}
