import { useState, useEffect } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";

export default function HomeButton() {
  const [language, setLanguage] = useState(getLanguage());
  useEffect(() => subscribe(setLanguage), []);

  return (
    <a
      href="/"
      className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
    >
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      {t("Home", language)}
    </a>
  );
}