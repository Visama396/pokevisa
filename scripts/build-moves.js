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
      return { name, category: data.damage_class?.name || "status" };
    } catch {
      console.warn(`  Failed to fetch move: ${name}`);
      return { name, category: "status" };
    }
  });

  const moveMap = Object.fromEntries(moveData.map((m) => [m.name, m.category]));

  await fs.writeFile("public/moves.json", JSON.stringify(moveMap));
  console.log(`Saved ${Object.keys(moveMap).length} moves to public/moves.json`);
}

main().catch(console.error);
