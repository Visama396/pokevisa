// Raw 64x64 tile map of Tilemap_color{1..5}.png (576x384 = 9 cols x 6 rows).
// Every non-empty cell is assigned a single ASCII char so layouts can be
// described as an ASCII sketch (see /tilemap-drawer). The same letters are
// used to decode sketches back into (sheet, col, row) tiles, so this table is
// shared by the drawer and any future layout implementations.
//
// Semantic codes (used by gameplay, not raw sheet positions):
//   w water | a-e floor grass in palette 1-5 | l wall | . empty
//
// Sketches can stack layers per cell as blank-line-separated grids:
//   1) optional palette grid (digits 1-5, "." = color 1) for raw tiles picked
//      from the color-2..5 sheets,
//   2) the base grid (background), a "." meaning no background (transparent),
//   3) the top grid (foreground).
// Semantic grass codes (a-e) already carry their color and ignore the palette
// grid.

export const SHEET_COLS = 9;
export const SHEET_ROWS = 6;

// Cells that hold transparent/empty pixels in the sheet.
const EMPTY_CELLS = new Set([
  "0-4", "1-4", "2-4", "3-4",
  "4-1", "4-2", "4-4",
  "5-1", "5-2", "5-4",
]);

// Cells that map to a semantic code instead of an auto-assigned one. "1-6" is
// a pixel-identical duplicate of the "1-1" grass floor tile, so it shares the
// "a" floor code instead of a fresh letter.
const RESERVED_CELLS = new Set(["1-1", "1-6", "4-5"]);

// Cells that get their code at the END of the row-major list instead of in
// place, so existing codes never renumber. "2-6" is NOT a duplicate of another
// tile — it is a unique grass tile that was previously miscounted as one.
const APPEND_CELLS = new Set(["2-6"]);

export const SEMANTIC_CODES = {
  water: "w",
  floor1: "a",
  floor2: "b",
  floor3: "c",
  floor4: "d",
  floor5: "e",
  wall: "l",
  empty: ".",
};

// Letters kept out of the auto-assignment pool so sketch codes stay stable
// across edits (s/t/g were previously stairs/treasure/gold markers).
const RESERVED_CHARS = new Set(["a", "b", "c", "d", "e", "g", "l", "s", "t", "w", "."]);

// Human description for each sheet region (used as the brush label).
function regionName(row, col) {
  if (row <= 1) return "grass";
  if (row <= 3) return "coast grass";
  if (row === 4 && col <= 3) return "stairs";
  if (row === 5 && col <= 3) return "stairs";
  if (row === 5) return "wall + foam";
  return "wall";
}

// All auto-coded sheet tiles: lowercase letters first, then uppercase. Cells
// are assigned in row-major order so codes stay stable; APPEND_CELLS (r2c6)
// are appended at the very end because slotting them in row-major would
// renumber every code after them.
function buildTiles() {
  const letters = [];
  for (let c = 97; c <= 122; c++) letters.push(String.fromCharCode(c));
  for (let c = 65; c <= 90; c++) letters.push(String.fromCharCode(c));
  const pool = letters.filter((ch) => !RESERVED_CHARS.has(ch));

  const tiles = [];
  let i = 0;
  for (let row = 0; row < SHEET_ROWS; row++) {
    for (let col = 0; col < SHEET_COLS; col++) {
      const key = `${row}-${col}`;
      if (EMPTY_CELLS.has(key)) continue;
      if (RESERVED_CELLS.has(key)) continue;
      if (APPEND_CELLS.has(key)) continue;
      tiles.push({ code: pool[i++], col, row, name: regionName(row, col) });
    }
  }
  // r2c6: unique grass tile appended at the end, keeping existing codes stable.
  for (const key of APPEND_CELLS) {
    const [row, col] = key.split("-").map(Number);
    tiles.push({ code: pool[i++], col, row, name: regionName(row, col) });
  }
  return tiles;
}

export const TILES = buildTiles();

// Map ASCII char -> { col, row, name } for raw sheet tiles.
const TILE_BY_CODE = Object.fromEntries(TILES.map((t) => [t.code, t]));

// Resolve a sketch char to a terrain tile descriptor. Returns { col, row,
// palette } where palette is the color sheet number for grass floors (a-e)
// and for raw tiles painted with a per-cell palette grid (see tilemap-drawer),
// or a special marker for non-sheet tiles (water/empty).
export function tileFromCode(code, palette = 1) {
  switch (code) {
    case SEMANTIC_CODES.water: return { kind: "water" };
    case SEMANTIC_CODES.floor1: return { kind: "floor", palette: 1, col: 1, row: 1 };
    case SEMANTIC_CODES.floor2: return { kind: "floor", palette: 2, col: 1, row: 1 };
    case SEMANTIC_CODES.floor3: return { kind: "floor", palette: 3, col: 1, row: 1 };
    case SEMANTIC_CODES.floor4: return { kind: "floor", palette: 4, col: 1, row: 1 };
    case SEMANTIC_CODES.floor5: return { kind: "floor", palette: 5, col: 1, row: 1 };
    case SEMANTIC_CODES.wall: return { kind: "wall", col: 5, row: 4 };
    case SEMANTIC_CODES.empty: return { kind: "empty" };
    default: {
      const t = TILE_BY_CODE[code];
      return t ? { kind: "sheet", col: t.col, row: t.row, palette } : null;
    }
  }
}

// ASCII char for a raw sheet cell, or "" if the cell is empty/transparent.
const CODE_BY_CELL = Object.fromEntries(TILES.map((t) => [`${t.row}-${t.col}`, t.code]));
export function codeForCell(col, row) {
  const key = `${row}-${col}`;
  if (EMPTY_CELLS.has(key)) return "";
  if (key === "1-1" || key === "1-6") return SEMANTIC_CODES.floor1;
  if (key === "4-5") return SEMANTIC_CODES.wall;
  return CODE_BY_CELL[key] || "";
}

// Parse a tilemap-drawer ASCII sketch (optional palette grid, blank line,
// base grid, blank line, top grid — see the header comment) into per-cell
// grids. Returns { palette, base, top, width, height, baseFill } where
// palette/base/top are arrays of character rows (strings), or null when the
// text holds no grids. A legacy "# base=…" comment prefills the base of a
// single-block (top-only) sketch. Shared by the tilemap-drawer and village.
export function parseSketch(text) {
  let baseFill = null;
  const blocks = [];
  let current = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      const m = trimmed.match(/^#\s*base=(\S+)/);
      if (m) baseFill = m[1];
      continue;
    }
    const cleaned = line.replace(/\s/g, "");
    if (cleaned.length) current.push(cleaned);
    else if (current.length) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length) blocks.push(current);
  if (blocks.length === 0) return null;

  // Palette digits are validated to 1-5 / ".", tile letters through
  // tileFromCode (unknown chars collapse to ".").
  const clean = (rows, digits = false) =>
    rows.map((row) =>
      Array.from(row)
        .map((ch) => {
          if (digits) return ch === "." || (ch >= "1" && ch <= "5") ? ch : ".";
          return tileFromCode(ch) ? ch : ".";
        })
        .join("")
    );
  const n = blocks.length;
  const paletteRows = n === 3 ? clean(blocks[0], true) : null;
  const baseRows = n === 3 ? clean(blocks[1]) : n === 2 ? clean(blocks[0]) : null;
  const topRows = n === 3 ? clean(blocks[2]) : n === 2 ? clean(blocks[1]) : clean(blocks[0]);

  const width = Math.max(...topRows.map((r) => r.length));
  const height = topRows.length;
  const pad = (rows) =>
    Array.from({ length: height }, (_, y) => {
      const row = rows?.[y] ?? "";
      return (row + ".".repeat(width)).slice(0, width);
    });
  return {
    palette: paletteRows ? pad(paletteRows) : null,
    base: baseRows ? pad(baseRows) : null,
    top: pad(topRows),
    width,
    height,
    baseFill: baseFill && tileFromCode(baseFill) ? baseFill : ".",
  };
}

// Walkability of a decoded tile (see tileFromCode): water and walls block
// movement; grass, coast grass, stairs and open ground do not.
export function tileWalkable(tile) {
  if (!tile || tile.kind === "empty") return true;
  if (tile.kind === "water" || tile.kind === "wall") return false;
  if (tile.kind === "floor") return true;
  return tile.row <= 3 || tile.col <= 3;
}
