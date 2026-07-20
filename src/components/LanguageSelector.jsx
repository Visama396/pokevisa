import { useState, useEffect, useRef } from "react";
import { getLanguage, setLanguage, subscribe, LANGUAGES } from "../stores/language";

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(getLanguage());
  const ref = useRef(null);

  useEffect(() => subscribe(setLang), []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
      >
        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {current.label}
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl">
          {LANGUAGES.map((l) => (
            <li
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setLang(l.code);
                setOpen(false);
              }}
              className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                l.code === lang
                  ? "bg-slate-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {l.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
