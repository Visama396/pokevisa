export default function Cell({ children, correct, partial }) {
  let bg = "bg-red-500";

  if (correct) bg = "bg-green-500";
  else if (partial) bg = "bg-yellow-500";

  return (
    <div
      className={`rounded border-2 p-2 ${
        correct
          ? "border-green-500"
          : partial
          ? "border-yellow-500"
          : "border-red-500"
      }`}
    >
      {children}
    </div>
  );
}
