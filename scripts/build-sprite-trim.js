import fs from "fs/promises";
import { PNG } from "pngjs";

// Measures the opaque (non-transparent) bounding box of every PokéAPI sprite
// and writes src/lib/spriteTrim.json. The UI uses these boxes to crop each
// sprite's transparent padding and scale it up to fill its grid cell, so all
// Pokémon appear much larger without enlarging the cells.

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

async function fetchSprite(id) {
  const res = await fetch(`${SPRITE_URL}/${id}.png`);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return PNG.sync.read(buf);
}

function contentBox(png) {
  let minX = png.width, minY = png.height, maxX = -1, maxY = -1;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const alpha = png.data[((png.width * y + x) << 2) + 3];
      if (alpha > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
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
  const ids = pokedex.map((p) => p.id).sort((a, b) => a - b);

  console.log(`Measuring ${ids.length} sprites...`);
  const boxes = await mapLimit(ids, 24, async (id) => {
    try {
      const png = await fetchSprite(id);
      return { id, box: png ? contentBox(png) : null };
    } catch {
      return { id, box: null };
    }
  });

  const trims = {};
  let missing = 0;
  for (const { id, box } of boxes) {
    if (box) trims[id] = box;
    else missing++;
  }

  await fs.writeFile("src/lib/spriteTrim.json", JSON.stringify(trims));
  console.log(`Wrote src/lib/spriteTrim.json (${Object.keys(trims).length} entries, ${missing} missing).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
