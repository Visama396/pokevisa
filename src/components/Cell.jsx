export default function Cell({ children, correct, partial }) {
  let styles = "border-red-800 bg-red-900/20";
  if (correct) styles = "border-green-600 bg-green-900/20";
  else if (partial) styles = "border-yellow-600 bg-yellow-900/20";

  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center text-xs h-full flex flex-col items-center justify-center min-w-0 overflow-hidden ${styles}`}>
      {children}
    </div>
  );
}
