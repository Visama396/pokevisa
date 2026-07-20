const listeners = new Set();

let current = "en";

export function getLanguage() {
  return current;
}

export function setLanguage(lang) {
  current = lang;
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
  { code: "ja-roma", label: "日本語 (Romaji)" },
  { code: "ko", label: "한국어" },
  { code: "zh-hans", label: "简体中文" },
  { code: "zh-hant", label: "繁體中文" },
];
