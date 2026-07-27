// =====================================================
// Move pools for captures and starters
// =====================================================

const MOVE_LIST = {
  normal: [
    { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 },
    { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 },
    { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 },
    { name: "headbutt", type: "normal", category: "physical", power: 70, accuracy: 100 },
    { name: "body-slam", type: "normal", category: "physical", power: 85, accuracy: 100 },
  ],
  fire: [
    { name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 },
    { name: "flame-wheel", type: "fire", category: "physical", power: 60, accuracy: 100 },
    { name: "fire-punch", type: "fire", category: "physical", power: 75, accuracy: 100 },
    { name: "flamethrower", type: "fire", category: "special", power: 90, accuracy: 100 },
  ],
  water: [
    { name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 },
    { name: "bubble-beam", type: "water", category: "special", power: 65, accuracy: 100 },
    { name: "water-pulse", type: "water", category: "special", power: 60, accuracy: 100 },
    { name: "surf", type: "water", category: "special", power: 90, accuracy: 100 },
  ],
  electric: [
    { name: "thunder-shock", type: "electric", category: "special", power: 40, accuracy: 100 },
    { name: "spark", type: "electric", category: "physical", power: 65, accuracy: 100 },
    { name: "thunder-punch", type: "electric", category: "physical", power: 75, accuracy: 100 },
    { name: "thunderbolt", type: "electric", category: "special", power: 90, accuracy: 100 },
  ],
  grass: [
    { name: "vine-whip", type: "grass", category: "physical", power: 45, accuracy: 100 },
    { name: "razor-leaf", type: "grass", category: "physical", power: 55, accuracy: 95 },
    { name: "leaf-blade", type: "grass", category: "physical", power: 75, accuracy: 100 },
    { name: "solar-beam", type: "grass", category: "special", power: 120, accuracy: 100 },
  ],
  ice: [
    { name: "ice-shard", type: "ice", category: "physical", power: 40, accuracy: 100 },
    { name: "ice-punch", type: "ice", category: "physical", power: 75, accuracy: 100 },
    { name: "aurora-beam", type: "ice", category: "special", power: 65, accuracy: 100 },
    { name: "blizzard", type: "ice", category: "special", power: 110, accuracy: 70 },
  ],
  fighting: [
    { name: "low-kick", type: "fighting", category: "physical", power: 50, accuracy: 100 },
    { name: "karate-chop", type: "fighting", category: "physical", power: 50, accuracy: 100 },
    { name: "brick-break", type: "fighting", category: "physical", power: 75, accuracy: 100 },
    { name: "cross-chop", type: "fighting", category: "physical", power: 100, accuracy: 80 },
  ],
  poison: [
    { name: "poison-sting", type: "poison", category: "physical", power: 15, accuracy: 100 },
    { name: "sludge", type: "poison", category: "physical", power: 65, accuracy: 100 },
    { name: "poison-fang", type: "poison", category: "physical", power: 50, accuracy: 100 },
    { name: "sludge-bomb", type: "poison", category: "special", power: 90, accuracy: 100 },
  ],
  ground: [
    { name: "mud-slap", type: "ground", category: "special", power: 20, accuracy: 100 },
    { name: "dig", type: "ground", category: "physical", power: 80, accuracy: 100 },
    { name: "bone-club", type: "ground", category: "physical", power: 65, accuracy: 85 },
    { name: "earthquake", type: "ground", category: "physical", power: 100, accuracy: 100 },
  ],
  flying: [
    { name: "gust", type: "flying", category: "special", power: 40, accuracy: 100 },
    { name: "wing-attack", type: "flying", category: "physical", power: 60, accuracy: 100 },
    { name: "air-cutter", type: "flying", category: "special", power: 60, accuracy: 95 },
    { name: "sky-attack", type: "flying", category: "physical", power: 140, accuracy: 90 },
  ],
  psychic: [
    { name: "confusion", type: "psychic", category: "special", power: 50, accuracy: 100 },
    { name: "psybeam", type: "psychic", category: "special", power: 65, accuracy: 100 },
    { name: "psychic", type: "psychic", category: "special", power: 90, accuracy: 100 },
    { name: "shadow-ball", type: "ghost", category: "special", power: 80, accuracy: 100 },
  ],
  bug: [
    { name: "string-shot", type: "bug", category: "special", power: 0, accuracy: 95 },
    { name: "pin-missile", type: "bug", category: "physical", power: 25, accuracy: 95 },
    { name: "bug-bite", type: "bug", category: "physical", power: 60, accuracy: 100 },
    { name: "x-scissor", type: "bug", category: "physical", power: 80, accuracy: 100 },
  ],
  rock: [
    { name: "rock-throw", type: "rock", category: "physical", power: 50, accuracy: 90 },
    { name: "rock-slide", type: "rock", category: "physical", power: 75, accuracy: 90 },
    { name: "stone-edge", type: "rock", category: "physical", power: 100, accuracy: 80 },
  ],
  ghost: [
    { name: "lick", type: "ghost", category: "physical", power: 30, accuracy: 100 },
    { name: "shadow-punch", type: "ghost", category: "physical", power: 60, accuracy: 100 },
    { name: "shadow-ball", type: "ghost", category: "special", power: 80, accuracy: 100 },
  ],
  dragon: [
    { name: "dragon-rage", type: "dragon", category: "special", power: 60, accuracy: 100 },
    { name: "dragon-claw", type: "dragon", category: "physical", power: 80, accuracy: 100 },
    { name: "outrage", type: "dragon", category: "physical", power: 120, accuracy: 100 },
  ],
  dark: [
    { name: "bite", type: "dark", category: "physical", power: 60, accuracy: 100 },
    { name: "feint-attack", type: "dark", category: "physical", power: 60, accuracy: 100 },
    { name: "crunch", type: "dark", category: "physical", power: 80, accuracy: 100 },
    { name: "dark-pulse", type: "dark", category: "special", power: 80, accuracy: 100 },
  ],
  steel: [
    { name: "metal-claw", type: "steel", category: "physical", power: 50, accuracy: 95 },
    { name: "iron-head", type: "steel", category: "physical", power: 80, accuracy: 100 },
    { name: "iron-tail", type: "steel", category: "physical", power: 100, accuracy: 75 },
  ],
  fairy: [
    { name: "dazzling-gleam", type: "fairy", category: "special", power: 80, accuracy: 100 },
    { name: "fairy-wind", type: "fairy", category: "special", power: 40, accuracy: 100 },
    { name: "play-rough", type: "fairy", category: "physical", power: 90, accuracy: 90 },
  ],
};

// Moves every Pokémon can learn
const UNIVERSAL_MOVES = [
  { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 },
  { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 },
];

// Species → type mapping for Gen 1 (1-151)
const SPECIES_TYPES = {
  1: "grass", 2: "grass", 3: "grass",
  4: "fire", 5: "fire", 6: "fire",
  7: "water", 8: "water", 9: "water",
  10: "bug", 11: "bug", 12: "bug",
  13: "poison", 14: "poison", 15: "poison",
  16: "normal", 17: "normal", 18: "normal",
  19: "normal", 20: "normal",
  21: "normal", 22: "normal",
  23: "poison", 24: "poison",
  25: "electric", 26: "electric",
  27: "ground", 28: "ground",
  29: "poison", 30: "poison", 31: "poison",
  32: "poison", 33: "poison", 34: "poison",
  35: "fairy", 36: "fairy",
  37: "fire", 38: "fire",
  39: "normal", 40: "normal",
  41: "poison", 42: "poison",
  43: "grass", 44: "grass", 45: "grass",
  46: "bug", 47: "bug",
  48: "bug", 49: "bug",
  50: "ground", 51: "ground",
  52: "normal", 53: "normal",
  54: "water", 55: "water",
  56: "fighting", 57: "fighting",
  58: "fire", 59: "fire",
  60: "water", 61: "water", 62: "water",
  63: "psychic", 64: "psychic", 65: "psychic",
  66: "fighting", 67: "fighting", 68: "fighting",
  69: "grass", 70: "grass", 71: "grass",
  72: "water", 73: "water",
  74: "rock", 75: "rock", 76: "rock",
  77: "fire", 78: "fire",
  79: "water", 80: "water",
  81: "steel", 82: "steel",
  83: "normal",
  84: "normal", 85: "normal",
  86: "water", 87: "water",
  88: "poison", 89: "poison",
  90: "water", 91: "water",
  92: "ghost", 93: "ghost", 94: "ghost",
  95: "rock",
  96: "psychic", 97: "psychic",
  98: "water", 99: "water",
  100: "electric", 101: "electric",
  102: "grass", 103: "grass",
  104: "ground", 105: "ground",
  106: "fighting", 107: "fighting", 108: "normal",
  109: "poison", 110: "poison",
  111: "ground", 112: "ground",
  113: "normal", 114: "grass",
  115: "normal",
  116: "water", 117: "water",
  118: "water", 119: "water",
  120: "water", 121: "water",
  122: "psychic",
  123: "bug", 124: "ice", 125: "electric",
  126: "fire", 127: "bug", 128: "normal",
  129: "water", 130: "water", 131: "water",
  132: "normal", 133: "normal",
  134: "water", 135: "electric", 136: "fire",
  137: "normal", 138: "rock", 139: "rock",
  140: "rock", 141: "rock",
  142: "rock", 143: "normal",
  144: "ice", 145: "electric", 146: "fire",
  147: "dragon", 148: "dragon", 149: "dragon",
  150: "psychic", 151: "psychic",
};

// Species names (for display)
const SPECIES_NAMES = {
  1: "Bulbasaur", 2: "Ivysaur", 3: "Venusaur",
  4: "Charmander", 5: "Charmeleon", 6: "Charizard",
  7: "Squirtle", 8: "Wartortle", 9: "Blastoise",
  10: "Caterpie", 11: "Metapod", 12: "Butterfree",
  13: "Weedle", 14: "Kakuna", 15: "Beedrill",
  16: "Pidgey", 17: "Pidgeotto", 18: "Pidgeot",
  19: "Rattata", 20: "Raticate",
  21: "Spearow", 22: "Fearow",
  23: "Ekans", 24: "Arbok",
  25: "Pikachu", 26: "Raichu",
  27: "Sandshrew", 28: "Sandslash",
  29: "Nidoran♀", 30: "Nidorina", 31: "Nidoqueen",
  32: "Nidoran♂", 33: "Nidorino", 34: "Nidoking",
  35: "Clefairy", 36: "Clefable",
  37: "Vulpix", 38: "Ninetales",
  39: "Jigglypuff", 40: "Wigglytuff",
  41: "Zubat", 42: "Golbat",
  43: "Oddish", 44: "Gloom", 45: "Vileplume",
  46: "Paras", 47: "Parasect",
  48: "Venonat", 49: "Venomoth",
  50: "Diglett", 51: "Dugtrio",
  52: "Meowth", 53: "Persian",
  54: "Psyduck", 55: "Golduck",
  56: "Mankey", 57: "Primeape",
  58: "Growlithe", 59: "Arcanine",
  60: "Poliwag", 61: "Poliwhirl", 62: "Poliwrath",
  63: "Abra", 64: "Kadabra", 65: "Alakazam",
  66: "Machop", 67: "Machoke", 68: "Machamp",
  69: "Bellsprout", 70: "Weepinbell", 71: "Victreebel",
  72: "Tentacool", 73: "Tentacruel",
  74: "Geodude", 75: "Graveler", 76: "Golem",
  77: "Ponyta", 78: "Rapidash",
  79: "Slowpoke", 80: "Slowbro",
  81: "Magnemite", 82: "Magneton",
  83: "Farfetch'd",
  84: "Doduo", 85: "Dodrio",
  86: "Seel", 87: "Dewgong",
  88: "Grimer", 89: "Muk",
  90: "Shellder", 91: "Cloyster",
  92: "Gastly", 93: "Haunter", 94: "Gengar",
  95: "Onix",
  96: "Drowzee", 97: "Hypno",
  98: "Krabby", 99: "Kingler",
  100: "Voltorb", 101: "Electrode",
  102: "Exeggcute", 103: "Exeggutor",
  104: "Cubone", 105: "Marowak",
  106: "Hitmonlee", 107: "Hitmonchan", 108: "Lickitung",
  109: "Koffing", 110: "Weezing",
  111: "Rhyhorn", 112: "Rhydon",
  113: "Chansey", 114: "Tangela",
  115: "Kangaskhan",
  116: "Horsea", 117: "Seadra",
  118: "Goldeen", 119: "Seaking",
  120: "Staryu", 121: "Starmie",
  122: "Mr. Mime",
  123: "Scyther", 124: "Jynx", 125: "Electabuzz",
  126: "Magmar", 127: "Pinsir", 128: "Tauros",
  129: "Magikarp", 130: "Gyarados", 131: "Lapras",
  132: "Ditto", 133: "Eevee",
  134: "Vaporeon", 135: "Jolteon", 136: "Flareon",
  137: "Porygon", 138: "Omanyte", 139: "Omastar",
  140: "Kabuto", 141: "Kabutops",
  142: "Aerodactyl", 143: "Snorlax",
  144: "Articuno", 145: "Zapdos", 146: "Moltres",
  147: "Dratini", 148: "Dragonair", 149: "Dragonite",
  150: "Mewtwo", 151: "Mew",
};

export function getSpeciesName(id) {
  return SPECIES_NAMES[id] || `Pokémon #${id}`;
}

export function getSpeciesType(id) {
  return SPECIES_TYPES[id] || "normal";
}

export function getMovesForType(typeName) {
  return MOVE_LIST[typeName] || UNIVERSAL_MOVES;
}

export function getRandomMovesForSpecies(speciesId, count = 2) {
  const typeName = getSpeciesType(speciesId);
  const typeMoves = MOVE_LIST[typeName] || [];
  const pool = [...new Map([...typeMoves, ...UNIVERSAL_MOVES].map((m) => [m.name, m])).values()];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Starter Pokémon with their signature + tackle
export const STARTERS = [
  { pokemonId: 1, name: "Bulbasaur", types: ["grass", "poison"], moves: [{ name: "vine-whip", type: "grass", category: "physical", power: 45, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 4, name: "Charmander", types: ["fire"], moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 7, name: "Squirtle", types: ["water"], moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 25, name: "Pikachu", types: ["electric"], moves: [{ name: "thunder-shock", type: "electric", category: "special", power: 40, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 35, name: "Clefairy", types: ["fairy"], moves: [{ name: "dazzling-gleam", type: "fairy", category: "special", power: 80, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 56, name: "Mankey", types: ["fighting"], moves: [{ name: "low-kick", type: "fighting", category: "physical", power: 50, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 63, name: "Abra", types: ["psychic"], moves: [{ name: "confusion", type: "psychic", category: "special", power: 50, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 74, name: "Geodude", types: ["rock", "ground"], moves: [{ name: "rock-throw", type: "rock", category: "physical", power: 50, accuracy: 90 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 88, name: "Grimer", types: ["poison"], moves: [{ name: "sludge", type: "poison", category: "physical", power: 65, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 92, name: "Gastly", types: ["ghost", "poison"], moves: [{ name: "lick", type: "ghost", category: "physical", power: 30, accuracy: 100 }, { name: "shadow-ball", type: "ghost", category: "special", power: 80, accuracy: 100 }] },
  { pokemonId: 10, name: "Caterpie", types: ["bug"], moves: [{ name: "bug-bite", type: "bug", category: "physical", power: 60, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 124, name: "Jynx", types: ["ice", "psychic"], moves: [{ name: "ice-punch", type: "ice", category: "physical", power: 75, accuracy: 100 }, { name: "confusion", type: "psychic", category: "special", power: 50, accuracy: 100 }] },
  { pokemonId: 27, name: "Sandshrew", types: ["ground"], moves: [{ name: "dig", type: "ground", category: "physical", power: 80, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 21, name: "Spearow", types: ["flying", "normal"], moves: [{ name: "wing-attack", type: "flying", category: "physical", power: 60, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 81, name: "Magnemite", types: ["steel", "electric"], moves: [{ name: "metal-claw", type: "steel", category: "physical", power: 50, accuracy: 95 }, { name: "thunder-shock", type: "electric", category: "special", power: 40, accuracy: 100 }] },
  { pokemonId: 19, name: "Rattata", types: ["normal"], moves: [{ name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 50, name: "Diglett", types: ["ground"], moves: [{ name: "dig", type: "ground", category: "physical", power: 80, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 147, name: "Dratini", types: ["dragon"], moves: [{ name: "dragon-rage", type: "dragon", category: "special", power: 60, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
];

// Trait → type mapping
export const TRAIT_TYPES = {
  brave: ["fire", "fighting", "dark"],
  gentle: ["normal", "fairy", "psychic"],
  quick: ["electric", "flying", "bug"],
  tough: ["rock", "ground", "steel"],
  clever: ["water", "grass", "ice"],
};

export function getStartersForTrait(trait) {
  const types = TRAIT_TYPES[trait] || ["normal"];
  return STARTERS.filter((s) => s.types.some((t) => types.includes(t)));
}
