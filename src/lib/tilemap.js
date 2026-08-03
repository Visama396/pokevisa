// Raw 64x64 tile map of Tilemap_color{1..5}.png (576x384 = 9 cols x 6 rows).
// Every non-empty cell is assigned a single ASCII char so layouts can be
// described as an ASCII sketch (see /tilemap-drawer). The same letters are
// used to decode sketches back into (sheet, col, row) tiles, so this table is
// shared by the drawer and any future layout implementations.
//
// Semantic codes (used by gameplay, not raw sheet positions):
//   w water | a-e floor grass in palette 1-5 | l wall | . empty

export const SHEET_COLS = 9;
export const SHEET_ROWS = 6;

// Cells that hold transparent/empty pixels in the sheet.
const EMPTY_CELLS = new Set([
  "0-4", "1-4", "2-4", "3-4",
  "4-1", "4-2", "4-4",
  "5-1", "5-2", "5-4",
]);

// Cells whose tile is a duplicate of another (same pixels).
const DUP_CELLS = new Set(["1-6", "2-6"]);

// Cells that map to a semantic code instead of an auto-assigned one.
const RESERVED_CELLS = new Set(["1-1", "4-5"]);

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

// All auto-coded sheet tiles: lowercase letters first, then uppercase.
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
      if (DUP_CELLS.has(key)) continue;
      if (RESERVED_CELLS.has(key)) continue;
      tiles.push({ code: pool[i++], col, row, name: regionName(row, col) });
    }
  }
  return tiles;
}

export const TILES = buildTiles();

// Map ASCII char -> { col, row, name } for raw sheet tiles.
const TILE_BY_CODE = Object.fromEntries(TILES.map((t) => [t.code, t]));

// Resolve a sketch char to a terrain tile descriptor. Returns { col, row,
// palette } where palette is the color sheet number for grass floors (a-e),
// or a special marker for non-sheet tiles (water/empty).
export function tileFromCode(code) {
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
      return t ? { kind: "sheet", col: t.col, row: t.row } : null;
    }
  }
}

// ASCII char for a raw sheet cell, or "" if the cell is empty/duplicate.
const CODE_BY_CELL = Object.fromEntries(TILES.map((t) => [`${t.row}-${t.col}`, t.code]));
export function codeForCell(col, row) {
  const key = `${row}-${col}`;
  if (EMPTY_CELLS.has(key) || DUP_CELLS.has(key)) return "";
  if (key === "1-1") return SEMANTIC_CODES.floor1;
  if (key === "4-5") return SEMANTIC_CODES.wall;
  return CODE_BY_CELL[key] || "";
}
