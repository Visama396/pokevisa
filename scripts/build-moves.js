import fs from "fs/promises";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

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

async function main() {
  const pokedex = JSON.parse(await fs.readFile("public/pokedex.json", "utf-8"));

  const uniqueMoves = new Set();
  for (const pokemon of pokedex) {
    const moves = pokemon.moves || {};
    for (const category of ["levelUp", "tm", "egg", "tutor"]) {
      for (const move of moves[category] || []) {
        uniqueMoves.add(typeof move === "string" ? move : move.name);
      }
    }
  }

  const moveList = [...uniqueMoves].sort();
  console.log(`Fetching categories for ${moveList.length} unique moves...`);

  const moveData = await mapLimit(moveList, 20, async (name) => {
    try {
      const data = await fetchJSON(`https://pokeapi.co/api/v2/move/${name}/`);

      const names = {};
      for (const entry of data.names || []) {
        const lang = entry.language.name;
        names[lang.toLowerCase()] = entry.name;
      }

      const effects = {};
      for (const entry of data.effect_entries || []) {
        const lang = entry.language.name;
        effects[lang.toLowerCase()] = entry.short_effect || entry.effect;
      }

      const flavorTexts = {};
      for (const entry of data.flavor_text_entries || []) {
        const lang = entry.language.name.toLowerCase();
        flavorTexts[lang] = entry.flavor_text.replace(/\n/g, " ").replace(/\f/g, " ");
      }
      for (const [lang, text] of Object.entries(flavorTexts)) {
        if (!effects[lang]) {
          effects[lang] = text;
        }
      }

      return {
        name,
        category: data.damage_class?.name || "status",
        type: data.type?.name || null,
        power: data.power ?? null,
        accuracy: data.accuracy ?? null,
        pp: data.pp ?? null,
        names,
        effect: effects,
      };
    } catch {
      console.warn(`  Failed to fetch move: ${name}`);
      return { name, category: "status", type: null, power: null, accuracy: null, pp: null, names: {}, effect: {} };
    }
  });

  const moveMap = Object.fromEntries(
    moveData.map((m) => [m.name, {
      category: m.category,
      type: m.type,
      power: m.power,
      accuracy: m.accuracy,
      pp: m.pp,
      names: m.names,
      effect: m.effect,
    }])
  );

  await fs.writeFile("public/moves.json", JSON.stringify(moveMap));
  console.log(`Saved ${Object.keys(moveMap).length} moves to public/moves.json`);
}

main().catch(console.error);
