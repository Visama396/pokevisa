import { TILE } from "./dungeon";
import { ITEMS } from "./items";
import { parseSketch, tileFromCode, tileWalkable } from "./tilemap";

// The village layout is an ASCII sketch in the tilemap-drawer format: the
// palette grid (digits 1-5, "." = color 1), a blank line, the base grid, a
// blank line, then the top grid. Edit VILLAGE_SKETCH to redesign the village;
// the rest of this module derives width/height, the walkability grid and the
// render layers from it. The tilemap-drawer can be used to design new maps.
const VILLAGE_SKETCH = `
...................4444.
...222222.........4...4.
...2....2.........4...4.
...2....2.............4.
...2....2.............4.
...2..................4.
...222222.............4.
.....................4..
........................
........................
..3.................3...
..3.................3...
..3.................3...
..3.................3...
..3333333333333333333...
........................

wwwwwwwwwwwwwwwwwwwwwwww
wwwwwwwwwwwwwwwwwwwdddww
wwwwwwwwwwwwwwwwwwddddww
wwawwwwwwawwwawwwwddddww
wwawwwwwwawwwawwwwddddww
wwawwwwwwawwwawwwwddddww
wwuwwwwwwawwwawwwwddddww
wwuaaaaaaawwwawwwwdddwww
wwCwwwwwwwwwwaaaYYYYDwww
wwlPPPPPPPPPuaavPPPPQwww
wwpcccccccccuaavccccqwww
wwpcccccccccuaavccccqwww
wwpcccccccccCYYDccccqwww
wwpccccccccclPPPccccqwww
wwyzzzzzzzzzzzzzzzzzAwww
wwwwwwwwwwwwwwwwwwwwwwww

...................fhhi.
...fhhhhi.........f...q.
.fhubbbbvhhhhhhhhnp...q.
.p.ubbbbv.aaa.aaav....q.
.p.ubbbbv.aaa.aaav....q.
.u.ubbbbbOaaa.aaav....q.
.l.CYYYYDTaaa.aaaaO...A.
...lPPPPQaaaa.aaavT..A..
...aaaaaaaaaa.....KKL...
........................
........................
...........N............
...........S............
........................
........................
........................
`;

const LAYERS = parseSketch(VILLAGE_SKETCH);

export const VILLAGE_WIDTH = LAYERS.width;
export const VILLAGE_HEIGHT = LAYERS.height;

const PAD = (grid) =>
  grid || Array.from({ length: VILLAGE_HEIGHT }, () => ".".repeat(VILLAGE_WIDTH));

// Per-cell character grids used by the village renderer: palette (digits
// 1-5), base (background letters), top (foreground letters). A "." base cell
// is transparent; a "." top cell shows the base layer beneath it.
export const VILLAGE_LAYERS = {
  palette: PAD(LAYERS.palette),
  base: PAD(LAYERS.base),
  top: LAYERS.top,
};

// The tile visible at a cell: the top tile when one is painted, else the
// base tile. Used to derive walkability (see tileWalkable in tilemap.js).
export function villageTileAt(x, y) {
  const paletteDigit = VILLAGE_LAYERS.palette[y]?.[x];
  const palette = paletteDigit && paletteDigit !== "." ? Number(paletteDigit) : 1;
  const top = VILLAGE_LAYERS.top[y]?.[x];
  const base = VILLAGE_LAYERS.base[y]?.[x];
  return tileFromCode(top !== "." ? top : base, palette);
}

export function villageWalkable(x, y) {
  if (x < 0 || y < 0 || y >= VILLAGE_HEIGHT || x >= VILLAGE_WIDTH) return false;
  return tileWalkable(villageTileAt(x, y));
}

// ─── Elevation ─────────────────────────────────────────────────────────────
// The village has two terrain heights. Ground (level 1) is the yellow/blue
// grass (palettes 1 and 3); the two halls and the bottom dais are raised
// platforms (level 2, olive grass, palettes 2 and 4) that can only be entered
// at their stair tiles. Stairs are the sheet cells in rows 4-5, cols 0-3
// (codes O/T/N/S). `villageLevel` returns 0 (blocked), 1 (ground), 2 (raised)
// or 9 (stair); `villageCanStep` enforces "stairs are the only way up or down".
const RAISED_REGIONS = [
  { x0: 3, y0: 1, x1: 8, y1: 6 },   // left hall (services) platform
  { x0: 18, y0: 0, x1: 22, y1: 7 }, // right hall platform
  { x0: 13, y0: 8, x1: 20, y1: 8 }, // right hall south skirt + bridge (olive coast grass + the grass walkway that links it to the dais)
  { x0: 11, y0: 9, x1: 20, y1: 13 }, // bottom dais: the raised plaza platform around the N/S stairs
];

export function villageLevel(x, y) {
  if (x < 0 || y < 0 || y >= VILLAGE_HEIGHT || x >= VILLAGE_WIDTH) return 0;
  const tile = villageTileAt(x, y);
  if (!tileWalkable(tile)) return 0;
  if (tile.kind === "sheet" && tile.row >= 4 && tile.col <= 3) return 9;
  for (const r of RAISED_REGIONS) {
    if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) return 2;
  }
  return 1;
}

// Moving between two adjacent cells is allowed when both cells sit at the
// same elevation, or when either cell is a stair tile (the only transition).
export function villageCanStep(x1, y1, x2, y2) {
  const l1 = villageLevel(x1, y1);
  const l2 = villageLevel(x2, y2);
  if (l1 === 0 || l2 === 0) return false;
  if (l1 === 9 || l2 === 9) return true;
  return l1 === l2;
}

// Movement grid kept as FLOOR/WALL so VillageGame's isWalkable keeps working.
export const VILLAGE_TILES = Array.from({ length: VILLAGE_HEIGHT }, (_, y) =>
  Array.from({ length: VILLAGE_WIDTH }, (_, x) =>
    villageWalkable(x, y) ? TILE.FLOOR : TILE.WALL
  )
);

// NPCs stand on the walkable interior floors of the two buildings (the
// top-left services hall and the top-right special-services hall) and around
// the bottom plaza by the stairs.
export const NPC_POSITIONS = [
  { id: "mart", name: "Shopkeep", x: 11, y: 4, label: "Shop", spriteId: 352 },
  { id: "moves", name: "Tutor", x: 10, y: 5, label: "Move Changer", spriteId: 97 },
  { id: "bank", name: "Persian", x: 12, y: 5, label: "Bank", spriteId: 53 },
  { id: "storage", name: "Kangaskhan", x: 11, y: 7, label: "Kangaskhan Storage", spriteId: 115 },
  { id: "evolve", name: "Sage", x: 15, y: 4, label: "Sage", spriteId: 340 },
  { id: "password", name: "Klefki", x: 16, y: 4, label: "Change Password", spriteId: 707 },
  { id: "quiz-reset", name: "Xatu", x: 15, y: 5, label: "Account Reset", spriteId: 178 },
  { id: "club", name: "Wigglytuff", x: 7, y: 12, label: "Club Wigglytuff", spriteId: 40 },
  { id: "adventure", name: "Explorer", x: 10, y: 11, label: "Adventure", spriteId: 297 },
];

export const VILLAGE_SPAWN = { x: 10, y: 10 };

// Shop stock is the full item catalog (see src/lib/items.js). Potions were
// replaced by berries, and evolution items/elixir were added alongside.
export const SHOP_ITEMS = ITEMS;
