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

export function calcStat(baseStat, level, isHP = false) {
  const base = Math.floor(baseStat)
  if (isHP) return Math.floor(((2 * base + 100) * level) / 100) + 10
  return Math.floor((2 * base * level) / 100) + 5
}

export async function getTypes(id) {
  const entry = await ensureLoaded().then(() => getFromCache(id))
  return entry?.types || ['normal']
}

export async function computeStats(pokemonId, level) {
  await ensureLoaded()
  const entry = getFromCache(pokemonId)
  if (!entry) return createFallbackStats(pokemonId, level)

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
    atk: calcStat(baseAtk, level),
    def: calcStat(baseDef, level),
    spa: calcStat(baseSpa, level),
    spd: calcStat(baseSpd, level),
    spe: calcStat(baseSpe, level),
    types: entry.types || ['normal'],
  }
}

function createFallbackStats(pokemonId, level) {
  const hp = pokemonId === 292 ? 1 : Math.floor(((2 * 50 + 100) * level) / 100) + 10
  return {
    pokemonId,
    level,
    hp,
    maxHp: hp,
    atk: Math.floor((2 * 50 * level) / 100) + 5,
    def: Math.floor((2 * 50 * level) / 100) + 5,
    spa: Math.floor((2 * 50 * level) / 100) + 5,
    spd: Math.floor((2 * 50 * level) / 100) + 5,
    spe: Math.floor((2 * 50 * level) / 100) + 5,
    types: ['normal'],
  }
}
