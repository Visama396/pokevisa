import fs from "fs/promises";

const POKEDEX_URL = "https://pokeapi.co/api/v2/pokedex/1/";
const POKEMON_LIMIT = 1025;

async function fetchJSON(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return res.json();
}

// Prevent hammering the API with 2000 simultaneous requests.
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

// Cache evolution chains so we only download each once.
const evolutionCache = new Map();

async function getEvolutionStage(species) {
  const chainUrl = species.evolution_chain.url;

  if (!evolutionCache.has(chainUrl)) {
    const chain = await fetchJSON(chainUrl);

    const members = [];

    function walk(node, stage) {
      const id = Number(node.species.url.match(/\/(\d+)\/$/)[1]);
      members.push({
        name: node.species.name,
        stage,
        id,
      });

      node.evolves_to.forEach((next) => walk(next, stage + 1));
    }

    walk(chain.chain, 1);

    const unique = members.length === 1;

    evolutionCache.set(
      chainUrl,
      members.map((m) => ({
        name: m.name,
        stage: m.stage,
        id: m.id,
        unique,
      })),
    );
  }

  const members = evolutionCache.get(chainUrl);

  const current = members.find((m) => m.name === species.name);

  return {
    chainId: Number(chainUrl.match(/\/evolution-chain\/(\d+)\//)[1]),
    stage: current.unique
      ? "unique"
      : (["first", "second", "third", "fourth"][current.stage - 1] ??
        `${current.stage}th`),
  };
}

async function getEvolutionChart(evolutionChainUrl) {
  if (!evolutionCache.has(evolutionChainUrl)) {
    const chain = await fetchJSON(evolutionChainUrl);
    const members = [];
    function walk(node, stage) {
      const id = Number(node.species.url.match(/\/(\d+)\/$/)[1]);
      members.push({
        name: node.species.name,
        stage,
        id,
      });
      node.evolves_to.forEach((next) => walk(next, stage + 1));
    }
    walk(chain.chain, 1);
    const unique = members.length === 1;
    evolutionCache.set(evolutionChainUrl, members.map((m) => ({ ...m, unique })));
  }
  return evolutionCache.get(evolutionChainUrl);
}

const versionPriority = [
  "scarlet-violet", "legends-arceus", "brilliant-diamond-and-shining-pearl",
  "sword-shield", "ultra-sun-ultra-moon", "sun-moon",
  "omega-ruby-alpha-sapphire", "x-y", "black-2-white-2", "black-white",
  "heartgold-soulsilver", "platinum", "diamond-pearl",
  "fire-red-leaf-green", "ruby-sapphire", "crystal", "gold-silver",
  "yellow", "red-blue",
];

function pickLatestVersion(details) {
  for (const vg of versionPriority) {
    const found = details.find((d) => d.version_group.name === vg);
    if (found) return found;
  }
  return details[0];
}

function organizeMoves(moves) {
  const levelUp = [];
  const tm = [];
  const egg = [];
  const tutor = [];

  for (const m of moves) {
    const detail = pickLatestVersion(m.version_group_details);
    if (!detail) continue;

    const method = detail.move_learn_method.name;
    const moveName = m.move.name;

    if (method === "level-up") {
      levelUp.push({ name: moveName, level: detail.level_learned_at });
    } else if (method === "machine") {
      tm.push(moveName);
    } else if (method === "egg") {
      egg.push(moveName);
    } else if (method === "tutor") {
      tutor.push(moveName);
    }
  }

  levelUp.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  return { levelUp, tm, egg, tutor };
}

async function buildAbilitiesJSON(abilityNames) {
  console.log(`Fetching ${abilityNames.size} abilities...`);

  const namesArray = Array.from(abilityNames);
  const abilityData = await mapLimit(namesArray, 20, async (name) => {
    const res = await fetchJSON(`https://pokeapi.co/api/v2/ability/${name}`);
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
    return {
      name,
      names,
      effect_entries: effectEntries,
    };
  });

  const abilities = {};
  for (const ability of abilityData) {
    abilities[ability.name] = {
      ...ability.names,
      effect_entries: ability.effect_entries,
    };
  }

  await fs.writeFile("public/abilities.json", JSON.stringify(abilities, null, 2));
  console.log(`Wrote ${Object.keys(abilities).length} abilities`);
}

async function main() {
  console.log("Fetching National Pokédex...");

  const pokedex = await fetchJSON(POKEDEX_URL);

  console.log(`Found ${pokedex.pokemon_entries.length} Pokémon`);

  const abilityNames = new Set();

  const data = await mapLimit(
    pokedex.pokemon_entries.slice(0, POKEMON_LIMIT),
    20,
    async (entry) => {
      console.log(
        `Loading #${entry.entry_number} ${entry.pokemon_species.name}`,
      );

      const [pokemonRes, species] = await Promise.all([
        fetchJSON(`https://pokeapi.co/api/v2/pokemon/${entry.entry_number}`),
        fetchJSON(entry.pokemon_species.url),
      ]);

      const evolution = await getEvolutionStage(species);
      const evolutionChart = await getEvolutionChart(species.evolution_chain.url);

      const genus = species.genera?.find((g) => g.language.name === "en")?.genus ?? null;

      const genderRate = species.gender_rate;
      let gender = null;
      if (genderRate === -1) {
        gender = "Genderless";
      } else if (genderRate === 0) {
        gender = "100% Male / 0% Female";
      } else if (genderRate === 8) {
        gender = "0% Male / 100% Female";
      } else {
        const femalePct = (genderRate / 8) * 100;
        gender = `${100 - femalePct}% Male / ${femalePct}% Female`;
      }

      return {
        id: entry.entry_number,
        slug: pokemonRes.name,
        names: Object.fromEntries(
          species.names.map((n) => [n.language.name, n.name])
        ),
        sprite: pokemonRes.sprites.other.home.front_default,

        types: pokemonRes.types.map((t) => t.type.name),

        height: pokemonRes.height,
        weight: pokemonRes.weight,

        abilities: pokemonRes.abilities.map((a) => {
          abilityNames.add(a.ability.name);
          return {
            name: a.ability.name,
            hidden: a.is_hidden,
          };
        }),

        baseStats: pokemonRes.stats.map((s) => ({
          name: s.stat.name,
          value: s.base_stat,
          effort: s.effort,
        })),

        baseExperience: pokemonRes.base_experience,

        genus,

        generation: species.generation.name,

        color: species.color?.name ?? null,

        habitat: species.habitat?.name ?? null,

        legendary: species.is_legendary,
        mythical: species.is_mythical,

        evolution,
        evolutionChart: evolutionChart.map((m) => ({
          name: m.name,
          stage: m.stage,
          id: m.id,
        })),

        evYield: pokemonRes.stats
          .filter((s) => s.effort > 0)
          .map((s) => ({ name: s.stat.name, value: s.effort })),

        catchRate: species.capture_rate,

        baseFriendship: species.base_happiness,

        growthRate: species.growth_rate?.name ?? null,

        eggGroups: species.egg_groups?.map((g) => g.name) ?? [],

        gender,

        eggCycles: species.hatch_counter,

        pokedexNumbers: species.pokedex_numbers?.map((n) => ({
          entry: n.entry_number,
          pokedex: n.pokedex.name,
        })) ?? [],

        flavorTexts: species.flavor_text_entries
          ?.filter((f) => f.language.name === "en")
          .map((f) => ({
            text: f.flavor_text.replace(/[\n\f]/g, " "),
            version: f.version.name,
          })) ?? [],

        moves: organizeMoves(pokemonRes.moves),
      };
    },
  );

  await fs.mkdir("public", { recursive: true });

  await fs.writeFile("public/pokedex.json", JSON.stringify(data, null, 2));

  await buildAbilitiesJSON(abilityNames);
  console.log("Done!");
}

main().catch(console.error);
