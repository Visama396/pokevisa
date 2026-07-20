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

  let bg = correct ? "bg-green-500" : "bg-red-500";
  let arrow = "";

  if (!correct) {
    arrow = current < generations[target] ? "↑" : "↓";
  }

  return (
    <div className={`${bg} rounded p-2 text-center text-white`}>
      {romans[current - 1]} {arrow}
    </div>
  );
}
