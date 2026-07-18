// Get a random number between 0 and 1024 (inclusive)
// to get the pokemon of the day
export function randomEntryNumber() {
  const time = new Date().getDate()
  return time % 1025
}
