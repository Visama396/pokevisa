const listeners = new Set();

function getStored() {
  try {
    return localStorage.getItem("pokevisa_lang") || "en";
  } catch {
    return "en";
  }
}

let current = getStored();

export function getLanguage() {
  return current;
}

export function setLanguage(lang) {
  current = lang;
  try { localStorage.setItem("pokevisa_lang", lang); } catch {}
  listeners.forEach((fn) => fn(lang));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
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
