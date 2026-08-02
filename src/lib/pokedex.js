// Shared Pokémon data loading, stat calculation, and nature system.
// Used by: DungeonGame, Pokeroguelite, StarterQuiz, CaptureScreen, PokemonDetails
// and any component that needs accurate stat computation.

let cache = null
let loading = null

// Loads pokedex.json once and caches it. Subsequent calls return the cached data.
export async function ensureLoaded() {
  if (cache) return cache
  if (!loading) loading = fetch('/pokedex.json').then(r => r.json())
  cache = await loading
  return cache
}

// Returns a single Pokémon entry by its numeric id.
export function getFromCache(id) {
  if (!cache) return null
  return cache.find(e => e.id === id) || null
}

// Pokémon natures with their stat modifiers.
// up: the stat that gets x1.1, down: the stat that gets x0.9.
// Neutral natures (hardy, docile, serious, bashful, quirky) have up === down.
const NATURES = {
  hardy:   { up: 'atk', down: 'atk' },
  lonely:  { up: 'atk', down: 'def' },
  brave:   { up: 'atk', down: 'spe' },
  adamant: { up: 'atk', down: 'spa' },
  naughty: { up: 'atk', down: 'spd' },
  bold:    { up: 'def', down: 'atk' },
  docile:  { up: 'def', down: 'def' },
  relaxed: { up: 'def', down: 'spe' },
  impish:  { up: 'def', down: 'spa' },
  lax:     { up: 'def', down: 'spd' },
  timid:   { up: 'spe', down: 'atk' },
  hasty:   { up: 'spe', down: 'def' },
  serious: { up: 'spe', down: 'spe' },
  jolly:   { up: 'spe', down: 'spa' },
  naive:   { up: 'spe', down: 'spd' },
  modest:  { up: 'spa', down: 'atk' },
  mild:    { up: 'spa', down: 'def' },
  quiet:   { up: 'spa', down: 'spe' },
  bashful: { up: 'spa', down: 'spa' },
  rash:    { up: 'spa', down: 'spd' },
  calm:    { up: 'spd', down: 'atk' },
  gentle:  { up: 'spd', down: 'def' },
  sassy:   { up: 'spd', down: 'spe' },
  careful: { up: 'spd', down: 'spa' },
  quirky:  { up: 'spd', down: 'spd' },
}

const NATURE_NAMES = Object.keys(NATURES)

// Simple string hash used for deterministic nature picking.
function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i)
  return Math.abs(h)
}

// Deterministically pick a nature from a seed string.
// Used by DungeonGame when generating wild Pokémon (same Pokémon always gets the same nature).
export function pickNature(seed) {
  return NATURE_NAMES[hashStr(String(seed)) % NATURE_NAMES.length]
}

// Returns the stat modifier (1.0, 1.1, or 0.9) for a given nature and stat.
function natureMod(nature, stat) {
  if (stat === 'hp') return 1.0
  const n = NATURES[nature]
  if (!n) return 1.0
  if (n.up === stat && n.down === stat) return 1.0
  if (n.up === stat) return 1.1
  if (n.down === stat) return 0.9
  return 1.0
}

// Accurate Pokémon stat formula from the games.
// HP:  floor(((2 * base + 100) * level) / 100) + 10
// Other:  max(1, floor((floor((2 * base * level) / 100) + 5) * mod))
// mod is the nature multiplier (1.0 for neutral).
// Used by: DungeonGame, Pokeroguelite, StarterQuiz, CaptureScreen, PokemonDetails
export function calcStat(baseStat, level, isHP = false, mod = 1.0) {
  const base = Math.floor(baseStat)
  if (isHP) return Math.floor(((2 * base + 100) * level) / 100) + 10
  return Math.max(1, Math.floor((Math.floor((2 * base * level) / 100) + 5) * mod))
}

// Returns the types of a Pokémon by id.
export async function getTypes(id) {
  const entry = await ensureLoaded().then(() => getFromCache(id))
  return entry?.types || ['normal']
}

// Returns the base HP stat of a species (used to recompute max HP on evolution).
export function getBaseHp(pokemonId) {
  const entry = getFromCache(pokemonId)
  return entry?.baseStats?.find(s => s.name === 'hp')?.value || 50
}

// Find the evolutions a species can undergo at the given level, from
// pokedex.json's evolutionChart. Two kinds come back:
//   - level-up: `trigger: "level-up"` with a min level the Pokémon reached
//     (happiness/location variants like Eevee → Espeon are excluded — they
//     have no minLevel, so they never qualify).
//   - use-item: `trigger: "use-item"` — needs an evolution stone (the caller
//     checks whether the player owns `opt.item`).
// Trade/happiness evolutions are excluded — the Sage NPC only handles level
// and stone evolutions. Returns [{ id, slug, minLevel, item }]; empty when the
// Pokémon can't evolve.
export async function getEvolutionOptions(pokemonId, level) {
  await ensureLoaded()
  const species = getFromCache(pokemonId)
  if (!species || !species.evolutionChart || !species.slug) return []
  const node = species.evolutionChart.find(n => n.name === species.slug)
  if (!node || !node.evolvesTo) return []
  return (node.evolvesTo || [])
    .filter(e => {
      if (e.trigger === 'level-up' && e.item === null) {
        return e.minLevel && e.minLevel <= (level || 1)
      }
      if (e.trigger === 'use-item' && e.item) {
        return true
      }
      return false
    })
    .map(e => ({
      id: e.id,
      slug: e.name,
      minLevel: e.trigger === 'level-up' ? e.minLevel : null,
      item: e.item || null,
    }))
}

// Computes all 6 stats for a Pokémon at a given level with a specific nature.
// Used by: DungeonGame (real combat), StarterQuiz, CaptureScreen.
// Pokeroguelite uses calcStat directly (neutral natures only).
export async function computeStats(pokemonId, level, nature) {
  await ensureLoaded()
  const entry = getFromCache(pokemonId)
  if (!entry) throw new Error('Pokémon not found: ' + pokemonId)

  if (!nature) nature = NATURE_NAMES[Math.floor(Math.random() * NATURE_NAMES.length)]

  const baseHp = entry.baseStats.find(s => s.name === 'hp')?.value || 50
  const baseAtk = entry.baseStats.find(s => s.name === 'attack')?.value || 50
  const baseDef = entry.baseStats.find(s => s.name === 'defense')?.value || 50
  const baseSpa = entry.baseStats.find(s => s.name === 'special-attack')?.value || 50
  const baseSpd = entry.baseStats.find(s => s.name === 'special-defense')?.value || 50
  const baseSpe = entry.baseStats.find(s => s.name === 'speed')?.value || 50

  // Shedinja (id 292) always has exactly 1 HP
  const hp = pokemonId === 292 ? 1 : calcStat(baseHp, level, true)
  return {
    pokemonId,
    level,
    hp,
    maxHp: hp,
    nature,
    atk: calcStat(baseAtk, level, false, natureMod(nature, 'atk')),
    def: calcStat(baseDef, level, false, natureMod(nature, 'def')),
    spa: calcStat(baseSpa, level, false, natureMod(nature, 'spa')),
    spd: calcStat(baseSpd, level, false, natureMod(nature, 'spd')),
    spe: calcStat(baseSpe, level, false, natureMod(nature, 'spe')),
    types: entry.types || ['normal'],
  }
}
