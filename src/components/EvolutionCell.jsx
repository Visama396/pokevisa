import { t } from "../stores/translations";

const stageNumbers = { unique: 0, first: 1, second: 2, third: 3, fourth: 4 };

const ordinals = {
  en: ["", "1st", "2nd", "3rd", "4th"],
  es: ["", "1ª", "2ª", "3ª", "4ª"],
  fr: ["", "1er", "2e", "3e", "4e"],
  de: ["", "1.", "2.", "3.", "4."],
  it: ["", "1ª", "2ª", "3ª", "4ª"],
  ja: ["", "1番目", "2番目", "3番目", "4番目"],
  ko: ["", "1단계", "2단계", "3단계", "4단계"],
  "zh-hans": ["", "第1", "第2", "第3", "第4"],
  "zh-hant": ["", "第1", "第2", "第3", "第4"],
};

export default function EvolutionCell({ value, target, language }) {
  const isUnique = value === "unique";
  const targetIsUnique = target === "unique";
  const num = stageNumbers[value] ?? 0;
  const targetNum = stageNumbers[target] ?? 0;
  const correct = value === target;

  let styles = "border-red-800 bg-red-900/20";
  let arrow = "";

  if (correct) {
    styles = "border-green-600 bg-green-900/20";
  } else if (!isUnique && !targetIsUnique) {
    styles = "border-yellow-600 bg-yellow-900/20";
    arrow = num < targetNum ? "↑" : "↓";
  }

  const label = isUnique
    ? "-"
    : `${ordinals[language]?.[num] || ordinals.en[num]} ${t("Stage", language)}`;

  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center text-xs font-mono h-full flex items-center justify-center ${styles}`}>
      <span className="text-slate-200">{label}</span>
      {arrow && <span className="ml-1 text-lg font-bold">{arrow}</span>}
    </div>
  );
}
