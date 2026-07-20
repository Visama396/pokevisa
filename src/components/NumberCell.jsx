export default function NumberCell({ value, target, unit }) {
  let bg = "bg-red-500";
  let arrow = "";

  if (value === target) {
    bg = "bg-green-500";
  } else if (value < target) {
    arrow = "↑";
  } else {
    arrow = "↓";
  }

  return (
    <div className={`${bg} rounded p-2 text-center text-white`}>
      {value}
      {unit && <span className="text-xs">{unit}</span>}
      {arrow}
    </div>
  );
}
