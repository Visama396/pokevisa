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

// Maps a PokeAPI evolution_detail object to the flat condition shape used in
// pokedex.json. Kept separate so both chain builders share the same mapping.
function detailToCondition(detail) {
  return {
    minLevel: detail.min_level ?? null,
    trigger: detail.trigger?.name ?? null,
    item: detail.item?.name ?? null,
    heldItem: detail.held_item?.name ?? null,
    knownMove: detail.known_move?.name ?? null,
    knownMoveType: detail.known_move_type?.name ?? null,
    location: detail.location?.name ?? null,
    minHappiness: detail.min_happiness ?? null,
    minBeauty: detail.min_beauty ?? null,
    minAffection: detail.min_affection ?? null,
    needsOverworldRain: detail.needs_overworld_rain ?? false,
    partySpecies: detail.party_species?.name ?? null,
    partyType: detail.party_type?.name ?? null,
    relativePhysicalStats: detail.relative_physical_stats ?? null,
    timeOfDay: detail.time_of_day ?? null,
    tradeSpecies: detail.trade_species?.name ?? null,
    gender: detail.gender ?? null,
    turnUpsideDown: detail.turn_upside_down ?? false,
  };
}

// Builds the flat member list for an evolution chain. Each target keeps ALL of
// its evolution methods under `conditions` (PokeAPI stores every way in
// evolution_details, e.g. Leafeon's mossy-rock level-ups AND the Leaf Stone).
// Returns { members, regionalForms } where regionalForms is a Set of form
// slugs (e.g. "sandshrew-alola") discovered via base_form/evolved_form fields.
function buildChainMembers(chain) {
  const members = [];
  const regionalForms = new Set();

  function walk(node, stage) {
    const id = Number(node.species.url.match(/\/(\d+)\/$/)[1]);
    const evolvesTo = node.evolves_to.map(next => {
      const details = next.evolution_details || [];
      // A detail is regional-variant-only if its base_form or evolved_form
      // points to an actual regional form (contains a regional suffix).
      // PokeAPI sets base_form on ALL details in a chain (e.g. Eevee→Vaporeon
      // has base_form=eevee), so we must check for the suffix.
      const isRegionalDetail = (d) =>
        formFromSlug(d.base_form?.name) != null || formFromSlug(d.evolved_form?.name) != null;

      // Collect base detail keys (non-regional) to avoid stripping
      // conditions that also have a base-form variant
      const baseKeys = new Set(
        details
          .filter(d => d.trigger && !isRegionalDetail(d))
          .map(d => `${d.trigger?.name}|${d.item?.name ?? null}|${d.min_level ?? null}|${d.time_of_day ?? ""}`)
      );
      const conditions = details
        .filter(d => {
          if (!d.trigger) return false;
          if (!isRegionalDetail(d)) return true;
          // Regional-only detail — keep only if no base detail matches
          const key = `${d.trigger?.name}|${d.item?.name ?? null}|${d.min_level ?? null}|${d.time_of_day ?? ""}`;
          return baseKeys.has(key);
        })
        .map(detailToCondition)
        .filter(cond => cond.trigger != null);

      // Collect regional form slugs from base_form/evolved_form fields
      for (const detail of details) {
        if (detail.base_form?.name) regionalForms.add(detail.base_form.name);
        if (detail.evolved_form?.name) regionalForms.add(detail.evolved_form.name);
      }

      return {
        name: next.species.name,
        id: Number(next.species.url.match(/\/(\d+)\/$/)[1]),
        conditions,
      };
    });
    members.push({
      name: node.species.name,
      stage,
      id,
      evolvesTo: evolvesTo.length > 0 ? evolvesTo : undefined,
    });
    node.evolves_to.forEach((next) => walk(next, stage + 1));
  }
  walk(chain.chain, 1);
  return { members, regionalForms };
}

async function getEvolutionStage(species) {
  const chainUrl = species.evolution_chain.url;

  if (!evolutionCache.has(chainUrl)) {
    const chain = await fetchJSON(chainUrl);
    const { members, regionalForms } = buildChainMembers(chain);

    const unique = members.length === 1;

    evolutionCache.set(chainUrl, {
      members: members.map((m) => ({
        name: m.name,
        stage: m.stage,
        id: m.id,
        evolvesTo: m.evolvesTo,
        unique,
      })),
      regionalForms,
    });
  }

  const { members } = evolutionCache.get(chainUrl);

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
    const { members, regionalForms } = buildChainMembers(chain);

    const unique = members.length === 1;
    evolutionCache.set(evolutionChainUrl, {
      members: members.map((m) => ({ ...m, unique })),
      regionalForms,
    });
  }
  const cached = evolutionCache.get(evolutionChainUrl);
  return { chart: cached.members, regionalForms: cached.regionalForms };
}

// Extract the regional form suffix from a form slug. Checks if any known
// regional suffix appears as a segment in the slug (e.g. "sandshrew-alola"
// → "alola", "darmanitan-galar-standard" → "galar").
const REGIONAL_SUFFIXES = ["alola", "galar", "hisui", "paldea"];

function formFromSlug(slug) {
  const parts = (slug || "").split("-");
  for (const suffix of REGIONAL_SUFFIXES) {
    if (parts.includes(suffix)) return suffix;
  }
  return null;
}

// Cache for species varieties: speciesName → Map<formSlug, pokemonId>
const varietiesCache = new Map();

// Fetch the varieties for a species and return a Map of non-default form
// slugs to their Pokemon IDs.
async function getVarieties(speciesName) {
  if (varietiesCache.has(speciesName)) {
    return varietiesCache.get(speciesName);
  }
  const res = await fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${speciesName}`);
  const forms = new Map();
  for (const v of res.varieties || []) {
    if (!v.is_default) {
      const name = v.pokemon.name;
      const pokemonId = Number(v.pokemon.url.match(/\/(\d+)\/$/)[1]);
      forms.set(name, pokemonId);
    }
  }
  varietiesCache.set(speciesName, forms);
  return forms;
}

// Extract the base species name from a regional form slug by stripping the
// regional suffix and everything after it.
// "sandshrew-alola" → "sandshrew", "darmanitan-galar-standard" → "darmanitan",
// "mr-mime-galar" → "mr-mime".
function baseSpeciesFromSlug(slug) {
  const parts = slug.split("-");
  for (const suffix of REGIONAL_SUFFIXES) {
    const idx = parts.indexOf(suffix);
    if (idx !== -1) return parts.slice(0, idx).join("-");
  }
  return slug;
}

// Build a parallel evolution chain for a specific regional form suffix
// (e.g. "alola", "galar"). Walks the raw PokeAPI chain and extracts only
// the evolution steps that involve this regional form, using actual form
// slugs and Pokemon IDs from the chain data (not constructed names, since
// some regional evolutions lack a suffix — e.g. Obstagoon).
function buildRegionalChain(chain, formSuffix, pokemonIdMap) {
  const result = [];
  const stageMap = new Map(); // formSlug → member entry

  function walk(node, stage) {
    for (const next of node.evolves_to || []) {
      // Check if any evolution detail for this step involves our form suffix
      const details = next.evolution_details || [];
      const relevantDetails = details.filter(d => {
        const bf = d.base_form?.name;
        const ef = d.evolved_form?.name;
        return (bf && bf.endsWith(`-${formSuffix}`)) ||
               (ef && ef.endsWith(`-${formSuffix}`));
      });
      if (relevantDetails.length === 0) {
        // No regional form involvement — recurse to check deeper
        walk(next, stage + 1);
        continue;
      }

      // Determine source and target form slugs
      const sourceDetail = relevantDetails.find(d => d.base_form?.name?.endsWith(`-${formSuffix}`));
      const targetDetail = relevantDetails.find(d => d.evolved_form?.name?.endsWith(`-${formSuffix}`));
      // Also check for details where evolved_form is null but base_form matches
      // (e.g. linoone-galar → obstagoon, where obstagoon has no suffix)
      const defaultTargetDetail = relevantDetails.find(d =>
        d.base_form?.name?.endsWith(`-${formSuffix}`) && !d.evolved_form?.name
      );

      const sourceSlug = sourceDetail?.base_form?.name || node.species.name;
      const targetSlug = targetDetail?.evolved_form?.name ||
                         defaultTargetDetail?.evolved_form?.name ||
                         next.species.name;

      const sourceId = pokemonIdMap.get(sourceSlug);
      const targetId = pokemonIdMap.get(targetSlug);
      if (sourceId == null || targetId == null) {
        walk(next, stage + 1);
        continue;
      }

      // Get or create source entry
      const srcForm = sourceSlug.endsWith(`-${formSuffix}`) ? formSuffix : null;
      const tgtForm = targetSlug.endsWith(`-${formSuffix}`) ? formSuffix : null;

      let sourceEntry = stageMap.get(sourceSlug);
      if (!sourceEntry) {
        sourceEntry = {
          name: sourceSlug,
          stage,
          id: sourceId,
          ...(srcForm ? { form: srcForm } : {}),
          evolvesTo: [],
        };
        stageMap.set(sourceSlug, sourceEntry);
        result.push(sourceEntry);
      }
      if (!sourceEntry.evolvesTo) sourceEntry.evolvesTo = [];

      // Filter conditions: keep only those whose raw detail matches a
      // relevantDetail (same trigger, item, level)
      const conditions = details
        .map(detailToCondition)
        .filter(cond => {
          if (cond.trigger == null) return false;
          return relevantDetails.some(rd =>
            rd.trigger?.name === cond.trigger &&
            (rd.item?.name ?? null) === cond.item &&
            (rd.min_level ?? null) === cond.minLevel &&
            (rd.time_of_day ?? "") === (cond.timeOfDay ?? "")
          );
        });

      sourceEntry.evolvesTo.push({
        name: targetSlug,
        id: targetId,
        ...(tgtForm ? { form: tgtForm } : {}),
        conditions,
      });

      // Create or find target entry
      if (!stageMap.has(targetSlug)) {
        const targetEntry = {
          name: targetSlug,
          stage: stage + 1,
          id: targetId,
          ...(tgtForm ? { form: tgtForm } : {}),
        };
        stageMap.set(targetSlug, targetEntry);
        result.push(targetEntry);
      }

      // Recurse from the next node
      walk(next, stage + 1);
    }
  }

  walk(chain.chain, 1);
  return result;
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

  // Phase 1: Build the base data for all species.
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
      const { chart: evolutionChart, regionalForms } =
        await getEvolutionChart(species.evolution_chain.url);

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
          evolvesTo: m.evolvesTo,
        })),

        // Store regional form slugs so we can build their chains later
        _regionalForms: regionalForms.size > 0 ? [...regionalForms] : undefined,

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

  // Phase 2: Build regional form chains.  For every species whose evolution
  // chain contains regional form conditions, we re-walk the raw PokeAPI chain
  // and build parallel entries with the correct Pokemon IDs and form labels.
  const chainUrlToRaw = new Map();
  const speciesWithRegionals = data.filter(d => d._regionalForms);
  console.log(`\nBuilding regional chains for ${speciesWithRegionals.length} species...`);

  for (const species of speciesWithRegionals) {
    const speciesRes = await fetchJSON(
      `https://pokeapi.co/api/v2/pokemon-species/${species.id}`
    );
    const chainUrl = speciesRes.evolution_chain.url;

    if (!chainUrlToRaw.has(chainUrl)) {
      chainUrlToRaw.set(chainUrl, await fetchJSON(chainUrl));
    }
    const rawChain = chainUrlToRaw.get(chainUrl);

    // Collect all form slugs from the chain and group by suffix
    const formsBySuffix = new Map();
    function collectFormSlugs(node) {
      for (const next of node.evolves_to || []) {
        for (const detail of next.evolution_details || []) {
          const bf = detail.base_form?.name;
          const ef = detail.evolved_form?.name;
          if (bf) {
            const suffix = formFromSlug(bf);
            if (suffix) {
              if (!formsBySuffix.has(suffix)) formsBySuffix.set(suffix, new Set());
              formsBySuffix.get(suffix).add(bf);
            }
          }
          if (ef) {
            const suffix = formFromSlug(ef);
            if (suffix) {
              if (!formsBySuffix.has(suffix)) formsBySuffix.set(suffix, new Set());
              formsBySuffix.get(suffix).add(ef);
            }
          }
        }
        collectFormSlugs(next);
      }
    }
    collectFormSlugs(rawChain.chain);

    // For each suffix, build a Pokemon ID map and the parallel chain
    for (const [suffix, formSlugs] of formsBySuffix) {
      const pokemonIdMap = new Map();

      // First, collect ALL species names in this chain (including defaults)
      // by walking the chain and noting species names + IDs
      function collectDefaultSpecies(node) {
        const name = node.species.name;
        const id = Number(node.species.url.match(/\/(\d+)\/$/)[1]);
        pokemonIdMap.set(name, id);
        for (const next of node.evolves_to || []) {
          collectDefaultSpecies(next);
        }
      }
      collectDefaultSpecies(rawChain.chain);

      // Then, fetch varieties for each species that has a regional form
      // to get the regional form's Pokemon ID
      const baseSpecies = new Set();
      for (const formSlug of formSlugs) {
        baseSpecies.add(baseSpeciesFromSlug(formSlug));
      }
      for (const baseName of baseSpecies) {
        const varieties = await getVarieties(baseName);
        for (const [formName, pokemonId] of varieties) {
          pokemonIdMap.set(formName, pokemonId);
        }
      }

      const regionalMembers = buildRegionalChain(rawChain, suffix, pokemonIdMap);
      if (regionalMembers.length > 0) {
        species.evolutionChart.push(...regionalMembers.map(m => ({
          name: m.name,
          stage: m.stage,
          id: m.id,
          form: m.form,
          evolvesTo: m.evolvesTo,
        })));
      }
    }

    // Clean up internal field
    delete species._regionalForms;
  }

  // Clean up _regionalForms from all data entries
  for (const species of data) {
    delete species._regionalForms;
  }

  await fs.mkdir("public", { recursive: true });

  await fs.writeFile("public/pokedex.json", JSON.stringify(data, null, 2));

  await buildAbilitiesJSON(abilityNames);
  console.log("Done!");
}

main().catch(console.error);
