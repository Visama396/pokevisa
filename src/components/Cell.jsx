export default function Cell({ children, correct, partial }) {
  let bg = "bg-red-500";

  if (correct) bg = "bg-green-500";
  else if (partial) bg = "bg-yellow-500";

  return (
    <div className={`${bg} rounded p-2 text-center text-white`}>
      {children}
    </div>
  );
}
