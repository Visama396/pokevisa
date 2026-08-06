import { useState, useEffect } from "react";

const listeners = new Set();

// Keep the initial language deterministic ("en") so the first client render
// matches the server-rendered HTML — reading localStorage at module load would
// make the client render a different language than SSR and cause React
// hydration mismatches. The persisted language is applied after hydration by
// subscribe() (called from useEffect) and by the useLanguage() hook.
let current = "en";

function getStored() {
  try {
    return localStorage.getItem("pokevisa_lang") || "en";
  } catch {
    return "en";
  }
}

export function getLanguage() {
  return current;
}

export function setLanguage(lang) {
  current = lang;
  try { localStorage.setItem("pokevisa_lang", lang); } catch {}
  listeners.forEach((fn) => fn(lang));
}

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh-hans", label: "简体中文" },
  { code: "zh-hant", label: "繁體中文" },
];

export function subscribe(fn) {
  listeners.add(fn);
  // Client-only: pull the persisted language right after React mounts (this
  // runs inside useEffect, so the initial hydration render already matched the
  // SSR HTML). Notifies this listener so it re-renders with the stored value.
  if (typeof window !== "undefined") {
    const stored = getStored();
    if (stored !== current) {
      current = stored;
      fn(stored);
    }
  }
  return () => listeners.delete(fn);
}

// Hook that reads the current language and stays in sync with language changes.
// Safe under SSR: initial state is deterministic and the persisted value is
// applied after hydration, avoiding hydration mismatches.
export function useLanguage() {
  const [language, setLanguage] = useState(getLanguage());
  useEffect(() => subscribe(setLanguage), []);
  return language;
}
