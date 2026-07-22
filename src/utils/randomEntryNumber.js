// Get a deterministic "random" number between 0 and 1024 (inclusive)
// based on the current UTC date, so everyone gets the same Pokémon of the day
export function randomEntryNumber() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  let hash = 0x811c9dc5; // FNV offset basis
  for (const char of date) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }

  return hash % 1025;
}
