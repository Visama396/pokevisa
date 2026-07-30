let cache = null
let loading = null

export async function ensureLoaded() {
  if (cache) return cache
  if (!loading) loading = fetch('/pokedex.json').then(r => r.json())
  cache = await loading
  return cache
}

export function getFromCache(id) {
  if (!cache) return null
  return cache.find(e => e.id === id) || null
}

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

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i)
  return Math.abs(h)
}

export function pickNature(seed) {
  return NATURE_NAMES[hashStr(String(seed)) % NATURE_NAMES.length]
}

function natureMod(nature, stat) {
  if (stat === 'hp') return 1.0
  const n = NATURES[nature]
  if (!n) return 1.0
  if (n.up === stat && n.down === stat) return 1.0
  if (n.up === stat) return 1.1
  if (n.down === stat) return 0.9
  return 1.0
}

export function calcStat(baseStat, level, isHP = false, mod = 1.0) {
  const base = Math.floor(baseStat)
  if (isHP) return Math.floor(((2 * base + 100) * level) / 100) + 10
  return Math.max(1, Math.floor((Math.floor((2 * base * level) / 100) + 5) * mod))
}

export async function getTypes(id) {
  const entry = await ensureLoaded().then(() => getFromCache(id))
  return entry?.types || ['normal']
}

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


