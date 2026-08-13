import fs from "fs/promises";

// Builds public/megas.json: one-time enrichment attaching Mega Evolution data
// (base stats, abilities, types, sprite) to every species that has one. Megas
// live in PokeAPI as extra /pokemon varieties (IDs ~10033-10099), NOT as
// evolution-chain entries, so they are kept out of pokedex.json and exposed
// separately for PokemonDetails.jsx (fetched like moves.json/abilities.json).
//
// Also merges any missing mega abilities into public/abilities.json so the
// details page can show localized names + effect tooltips for them.

const BASE_URL = "https://pokeapi.co/api/v2";

// Mega forms are Gen 6 battle-only varieties; scanning this range picks them
// up without touching every species in the API.
const ID_RANGE = [10001, 10199];

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": "pokevisa-build" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

// Prevent hammering the API with hundreds of simultaneous requests.
async function mapLimit(array, limit, asyncFn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < array.length) {
      const current = index++;
      results[current] = await asyncFn(array[current]);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));

  return results;
}

// Derived label suffix for a mega form, e.g. "X"/"Y" for charizard-mega-x, or
// "" for venusaur-mega (single-mega species). The UI renders "Charizard X".
function megaSuffix(name) {
  const match = name.match(/-mega(?:-([a-z]+))?$/);
  return match?.[1]?.toUpperCase() ?? "";
}

async function buildAbilityJSON(abilityNames) {
  const abilityData = await mapLimit(Array.from(abilityNames), 20, async (name) => {
    const res = await fetchJSON(`${BASE_URL}/ability/${name}`);
    const names = {};
    for (const n of res.names || []) {
      names[n.language.name] = n.name;
    }
    const effectEntries = {};
    for (const e of res.effect_entries || []) {
      effectEntries[e.language.name] = {
        effect: e.effect,
        short_effect: e.short_effect,
      };
    }
    return { name, names, effect_entries: effectEntries };
  });

  const abilities = {};
  for (const ability of abilityData) {
    abilities[ability.name] = {
      ...ability.names,
      effect_entries: ability.effect_entries,
    };
  }

  return abilities;
}

async function main() {
  const ids = [];
  for (let i = ID_RANGE[0]; i <= ID_RANGE[1]; i++) ids.push(i);

  console.log(`Scanning ${ids.length} form IDs for mega varieties...`);

  const forms = await mapLimit(ids, 20, async (id) => {
    const pokemon = await fetchJSON(`${BASE_URL}/pokemon/${id}/`);
    if (!pokemon.name.includes("-mega")) return null;

    const speciesId = Number(pokemon.species.url.match(/\/(\d+)\/$/)[1]);
    return {
      name: pokemon.name,
      suffix: megaSuffix(pokemon.name),
      speciesId,
      sprite:
        pokemon.sprites.other?.home?.front_default ||
        pokemon.sprites.other?.["official-artwork"]?.front_default ||
        pokemon.sprites.front_default,
      types: pokemon.types.map((t) => t.type.name),
      abilities: pokemon.abilities.map((a) => a.ability.name),
      baseStats: pokemon.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
        effort: s.effort,
      })),
    };
  });

  const megas = forms.filter(Boolean);
  console.log(`Found ${megas.length} mega forms`);

  const bySpecies = {};
  for (const mega of megas) {
    if (!bySpecies[mega.speciesId]) bySpecies[mega.speciesId] = [];
    const { speciesId, ...entry } = mega;
    bySpecies[mega.speciesId].push(entry);
  }

  await fs.mkdir("public", { recursive: true });
  await fs.writeFile("public/megas.json", JSON.stringify(bySpecies, null, 2));
  console.log(`Wrote megas for ${Object.keys(bySpecies).length} species`);

  // Merge mega abilities into abilities.json (only missing keys) so the
  // details page can render tooltips for them like any other ability.
  const abilityNames = new Set(megas.flatMap((m) => m.abilities));

  let abilities = {};
  try {
    abilities = JSON.parse(await fs.readFile("public/abilities.json", "utf-8"));
  } catch {
    // no existing file — write from scratch
  }

  const missing = [...abilityNames].filter((name) => !abilities[name]);
  if (missing.length > 0) {
    console.log(`Fetching ${missing.length} mega abilities...`);
    const newAbilities = await buildAbilityJSON(missing);
    abilities = { ...abilities, ...newAbilities };
    await fs.writeFile("public/abilities.json", JSON.stringify(abilities, null, 2));
    console.log(`Merged ${Object.keys(newAbilities).length} abilities`);
  } else {
    console.log("All mega abilities already present in abilities.json");
  }

  console.log("Done!");
}

main().catch(console.error);
