import fs from "fs/promises";

const POKEDEX_URL = "https://pokeapi.co/api/v2/pokedex/1/";

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
      members.push({
        name: node.species.name,
        stage,
      });

      node.evolves_to.forEach((next) => walk(next, stage + 1));
    }

    walk(chain.chain, 1);

    const unique = members.length === 1;

    evolutionCache.set(
      chainUrl,
      members.map((m) => ({
        ...m,
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

async function main() {
  console.log("Fetching National Pokédex...");

  const pokedex = await fetchJSON(POKEDEX_URL);

  console.log(`Found ${pokedex.pokemon_entries.length} Pokémon`);

  const data = await mapLimit(
    pokedex.pokemon_entries,
    20, // 20 concurrent requests
    async (entry) => {
      console.log(
        `Loading #${entry.entry_number} ${entry.pokemon_species.name}`,
      );

      const [pokemon, species] = await Promise.all([
        fetchJSON(`https://pokeapi.co/api/v2/pokemon/${entry.entry_number}`),
        fetchJSON(entry.pokemon_species.url),
      ]);

      const evolution = await getEvolutionStage(species);

      return {
        id: entry.entry_number,
        name: pokemon.name,
        sprite: pokemon.sprites.other.home.front_default,

        types: pokemon.types.map((t) => t.type.name),

        height: pokemon.height,
        weight: pokemon.weight,

        abilities: pokemon.abilities.map((a) => ({
          name: a.ability.name,
          hidden: a.is_hidden,
        })),

        generation: species.generation.name,

        color: species.color?.name ?? null,

        habitat: species.habitat?.name ?? null,

        legendary: species.is_legendary,
        mythical: species.is_mythical,

        evolution,
      };
    },
  );

  await fs.mkdir("public", { recursive: true });

  await fs.writeFile("public/pokedex.json", JSON.stringify(data, null, 2));

  console.log("Done!");
}

main().catch(console.error);
