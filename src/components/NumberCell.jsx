export default function NumberCell({ value, target, unit }) {
  const correct = value === target;
  const styles = correct ? "border-green-600 bg-green-900/20" : "border-red-800 bg-red-900/20";
  const arrow = correct ? "" : value < target ? "↑" : "↓";

  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center text-xs font-mono h-full flex items-center justify-center ${styles}`}>
      <span className="text-slate-200">
        {value}
        {unit && <span className="text-[10px] text-slate-400 ml-0.5">{unit}</span>}
      </span>
      {arrow && (
        <span className="ml-1 text-lg font-bold">{arrow}</span>
      )}
    </div>
  );
}
