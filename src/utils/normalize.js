export function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’.:-]/g, "")
    .replace(/[♀♂]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}
