// Get a deterministic "random" number between 0 and 1024 (inclusive)
// based on the given UTC date (or today by default), so everyone gets
// the same Pokémon for the same day. Used by PokéWordle daily puzzle.
export function randomEntryNumber(dateStr) {
  const date = dateStr || new Date().toISOString().slice(0, 10);

  let hash = 0x811c9dc5;
  for (const char of date) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash % 1025;
}
