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
  152: "grass", 155: "fire", 158: "water",
  239: "electric", 240: "fire",
  252: "grass", 255: "fire", 258: "water",
  280: "psychic", 293: "normal", 328: "ground",
  363: "ice",
  387: "grass", 390: "fire", 393: "water",
  495: "grass", 498: "fire", 501: "water",
  524: "rock", 551: "ground",
  650: "grass", 653: "fire", 656: "water",
  669: "fairy",
  722: "grass", 725: "fire", 728: "water",
  736: "bug", 761: "grass",
  810: "grass", 813: "fire", 816: "water",
  821: "flying", 859: "dark",
  906: "grass", 909: "fire", 912: "water",
  957: "fairy",
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
  // Gen 2
  152: "Chikorita", 155: "Cyndaquil", 158: "Totodile",
  // Gen 3
  252: "Treecko", 255: "Torchic", 258: "Mudkip",
  280: "Ralts", 293: "Whismur", 328: "Trapinch",
  363: "Spheal",
  // Gen 4
  387: "Turtwig", 390: "Chimchar", 393: "Piplup",
  // Gen 5
  495: "Snivy", 498: "Tepig", 501: "Oshawott",
  524: "Roggenrola", 551: "Sandile",
  // Gen 6
  650: "Chespin", 653: "Fennekin", 656: "Froakie",
  669: "Flabébé",
  // Gen 7
  722: "Rowlet", 725: "Litten", 728: "Popplio",
  736: "Grubbin", 761: "Bounsweet",
  // Gen 8
  810: "Grookey", 813: "Scorbunny", 816: "Sobble",
  821: "Rookidee", 859: "Impidimp",
  // Gen 9
  906: "Sprigatito", 909: "Fuecoco", 912: "Quaxly",
  957: "Tinkatink",
  // Others
  239: "Elekid", 240: "Magby",
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

// Starter Pokémon with their signature + tackle, assigned to quiz traits
export const STARTERS = [
  // brave: Charmander, Piplup, Scorbunny, Sandile, Elekid, Rowlet, Rookidee, Roggenrola
  { pokemonId: 4, name: "Charmander", types: ["fire"], trait: "brave", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 393, name: "Piplup", types: ["water"], trait: "brave", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 813, name: "Scorbunny", types: ["fire"], trait: "brave", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 551, name: "Sandile", types: ["ground", "dark"], trait: "brave", moves: [{ name: "bite", type: "dark", category: "physical", power: 60, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 239, name: "Elekid", types: ["electric"], trait: "brave", moves: [{ name: "thunder-shock", type: "electric", category: "special", power: 40, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 722, name: "Rowlet", types: ["grass", "flying"], trait: "brave", moves: [{ name: "razor-leaf", type: "grass", category: "physical", power: 55, accuracy: 95 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 821, name: "Rookidee", types: ["flying"], trait: "brave", moves: [{ name: "wing-attack", type: "flying", category: "physical", power: 60, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 524, name: "Roggenrola", types: ["rock"], trait: "brave", moves: [{ name: "rock-throw", type: "rock", category: "physical", power: 50, accuracy: 90 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },

  // gentle: Ralts, Bounsweet, Spheal, Whismur, Chikorita, Popplio, Tinkatink, Impidimp, Totodile
  { pokemonId: 280, name: "Ralts", types: ["psychic", "fairy"], trait: "gentle", moves: [{ name: "confusion", type: "psychic", category: "special", power: 50, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 761, name: "Bounsweet", types: ["grass"], trait: "gentle", moves: [{ name: "razor-leaf", type: "grass", category: "physical", power: 55, accuracy: 95 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 363, name: "Spheal", types: ["ice", "water"], trait: "gentle", moves: [{ name: "ice-shard", type: "ice", category: "physical", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 293, name: "Whismur", types: ["normal"], trait: "gentle", moves: [{ name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 152, name: "Chikorita", types: ["grass"], trait: "gentle", moves: [{ name: "razor-leaf", type: "grass", category: "physical", power: 55, accuracy: 95 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 728, name: "Popplio", types: ["water"], trait: "gentle", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 957, name: "Tinkatink", types: ["fairy"], trait: "gentle", moves: [{ name: "fairy-wind", type: "fairy", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 859, name: "Impidimp", types: ["dark", "fairy"], trait: "gentle", moves: [{ name: "bite", type: "dark", category: "physical", power: 60, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 158, name: "Totodile", types: ["water"], trait: "gentle", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },

  // quick: Zubat, Grubbin, Trapinch, Torchic, Sobble, Grookey, Litten, Treecko, Flabébé
  { pokemonId: 41, name: "Zubat", types: ["poison", "flying"], trait: "quick", moves: [{ name: "wing-attack", type: "flying", category: "physical", power: 60, accuracy: 100 }, { name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 736, name: "Grubbin", types: ["bug"], trait: "quick", moves: [{ name: "bug-bite", type: "bug", category: "physical", power: 60, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 328, name: "Trapinch", types: ["ground"], trait: "quick", moves: [{ name: "mud-slap", type: "ground", category: "special", power: 20, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 255, name: "Torchic", types: ["fire"], trait: "quick", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 816, name: "Sobble", types: ["water"], trait: "quick", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 810, name: "Grookey", types: ["grass"], trait: "quick", moves: [{ name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 725, name: "Litten", types: ["fire"], trait: "quick", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 252, name: "Treecko", types: ["grass"], trait: "quick", moves: [{ name: "quick-attack", type: "normal", category: "physical", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 669, name: "Flabébé", types: ["fairy"], trait: "quick", moves: [{ name: "fairy-wind", type: "fairy", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },

  // tough: Bulbasaur, Turtwig, Mudkip, Tepig, Oshawott, Chespin, Fuecoco, Machop, Quaxly
  { pokemonId: 1, name: "Bulbasaur", types: ["grass", "poison"], trait: "tough", moves: [{ name: "vine-whip", type: "grass", category: "physical", power: 45, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 387, name: "Turtwig", types: ["grass"], trait: "tough", moves: [{ name: "razor-leaf", type: "grass", category: "physical", power: 55, accuracy: 95 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 258, name: "Mudkip", types: ["water"], trait: "tough", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 498, name: "Tepig", types: ["fire"], trait: "tough", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 501, name: "Oshawott", types: ["water"], trait: "tough", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 650, name: "Chespin", types: ["grass"], trait: "tough", moves: [{ name: "vine-whip", type: "grass", category: "physical", power: 45, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 909, name: "Fuecoco", types: ["fire"], trait: "tough", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 66, name: "Machop", types: ["fighting"], trait: "tough", moves: [{ name: "karate-chop", type: "fighting", category: "physical", power: 50, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 912, name: "Quaxly", types: ["water"], trait: "tough", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },

  // clever: Squirtle, Snivy, Fennekin, Magby, Poliwag, Chimchar, Froakie, Cyndaquil, Sprigatito
  { pokemonId: 7, name: "Squirtle", types: ["water"], trait: "clever", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 495, name: "Snivy", types: ["grass"], trait: "clever", moves: [{ name: "vine-whip", type: "grass", category: "physical", power: 45, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 653, name: "Fennekin", types: ["fire"], trait: "clever", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 240, name: "Magby", types: ["fire"], trait: "clever", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 60, name: "Poliwag", types: ["water"], trait: "clever", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 390, name: "Chimchar", types: ["fire"], trait: "clever", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 656, name: "Froakie", types: ["water"], trait: "clever", moves: [{ name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 155, name: "Cyndaquil", types: ["fire"], trait: "clever", moves: [{ name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
  { pokemonId: 906, name: "Sprigatito", types: ["grass"], trait: "clever", moves: [{ name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 }, { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 }] },
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
  return STARTERS.filter((s) => s.trait === trait);
}

// Species base speed stats (Gen 1, approximate)
const SPECIES_SPEED = {
  1:45, 2:60, 3:80, 4:65, 5:80, 6:100, 7:43, 8:58, 9:78,
  10:45, 11:30, 12:70, 13:50, 14:35, 15:75, 16:56, 17:71, 18:101,
  19:56, 20:97, 21:60, 22:70, 23:55, 24:80, 25:90, 26:110,
  27:40, 28:65, 29:46, 30:61, 31:76, 32:50, 33:65, 34:85,
  35:90, 36:95, 37:65, 38:100, 39:20, 40:45, 41:55, 42:90,
  43:30, 44:40, 45:50, 46:55, 47:75, 48:45, 49:90, 50:25,
  51:95, 52:40, 53:65, 54:55, 55:85, 56:80, 57:105, 58:60,
  59:95, 60:90, 61:90, 62:70, 63:90, 64:105, 65:120, 66:35,
  67:45, 68:55, 69:70, 70:75, 71:115, 72:70, 73:100, 74:40,
  75:55, 76:45, 77:90, 78:105, 79:15, 80:30, 81:45, 82:70,
  83:60, 84:35, 85:60, 86:45, 87:45, 88:25, 89:50, 90:40,
  91:70, 92:80, 93:95, 94:110, 95:70, 96:42, 97:97, 98:50,
  99:75, 100:30, 101:60, 102:40, 103:55, 104:50, 105:45,
  106:87, 107:76, 108:30, 109:35, 110:60, 111:25, 112:40,
  113:50, 114:60, 115:90, 116:40, 117:60, 118:60, 119:68,
  120:85, 121:115, 122:100, 123:105, 124:95, 125:105, 126:85,
  127:85, 128:110, 129:80, 130:81, 131:60, 132:48, 133:55,
  134:65, 135:130, 136:65, 137:40, 138:35, 139:55, 140:80,
  141:115, 142:130, 143:30, 144:85, 145:100, 146:90, 147:50,
  148:70, 149:80,   150:130, 151:100,
  152:55, 155:65, 158:43,
  239:95, 240:83,
  252:65, 255:45, 258:40,
  280:40, 293:28, 328:10,
  363:25,
  387:31, 390:61, 393:40,
  495:38, 498:45, 501:45,
  524:15, 551:65,
  650:35, 653:61, 656:71,
  669:42,
  722:36, 725:70, 728:40,
  736:46, 761:32,
  810:65, 813:69, 816:50,
  821:60, 859:50,
  906:65, 909:66, 912:50,
  957:50,
};

export function getSpeciesSpeed(id) {
  return SPECIES_SPEED[id] || 50;
}

// EXP formula: base EXP from defeating an enemy
export function calcExpGain(enemyLevel) {
  return 10 + enemyLevel * 5;
}

// Level up check: returns new level if leveled up, else null
export function checkLevelUp(currentLevel, currentExp) {
  const threshold = currentLevel * 20 + 30;
  if (currentExp >= threshold) {
    return currentLevel + 1;
  }
  return null;
}
