// Get a random number between 0 and 1024 (inclusive)
// to get the pokemon of the day
export function randomEntryNumber() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  let hash = 0;
  for (const char of date) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash % 1025;
}
