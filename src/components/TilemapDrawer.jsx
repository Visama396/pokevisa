// Dev tool: paint a grid using the real terrain tileset and export it as an
// ASCII sketch (one letter per cell). Every cell can hold two tile layers — a
// base (background, e.g. grass) and a top (foreground, e.g. stairs) — plus a
// per-cell color palette (digits 1-5, for tiles picked from sheets 2-5). The
// sketch is exported as a palette grid (only when used), a blank line, the
// base grid, a blank line, then the top grid. The exported sketch is pasted
// into chats/prompts to describe village/event layouts, then parsed by the
// game code (letter -> tile, see src/lib/tilemap.js). Lives at /tilemap-drawer.
import { useRef, useState } from "react";
import {
  TERRAIN_SHEETS,
  FLOOR_TILE,
  WALL_TILE,
  terrainBackground,
  waterStyle,
} from "../lib/terrain";
import { TILES, SEMANTIC_CODES, SHEET_COLS, SHEET_ROWS, codeForCell, parseSketch } from "../lib/tilemap";
import HomeButton from "./HomeButton";

// Palette brushes. Semantic codes first (used by gameplay), then every raw
// tile of the color-1 sheet (letters from tilemap.js).
const SEMANTIC_BRUSHES = [
  { code: SEMANTIC_CODES.water, name: "Water", render: "water" },
  { code: SEMANTIC_CODES.floor1, name: "Grass color 1", palette: 1 },
  { code: SEMANTIC_CODES.floor2, name: "Grass color 2", palette: 2 },
  { code: SEMANTIC_CODES.floor3, name: "Grass color 3", palette: 3 },
  { code: SEMANTIC_CODES.floor4, name: "Grass color 4", palette: 4 },
  { code: SEMANTIC_CODES.floor5, name: "Grass color 5", palette: 5 },
  { code: SEMANTIC_CODES.wall, name: "Wall", wall: true },
  { code: SEMANTIC_CODES.empty, name: "Empty", render: "empty" },
];

const SHEET_BRUSHES = TILES.map((t) => ({
  code: t.code,
  name: `${t.name} (r${t.row}c${t.col})`,
  sheet1: true,
  col: t.col,
  row: t.row,
}));

const PALETTE = [...SEMANTIC_BRUSHES, ...SHEET_BRUSHES];
const TILE_LOOKUP = Object.fromEntries(PALETTE.map((entry) => [entry.code, entry]));

// Raw sheet tiles (letters f..Y). These have no palette baked into the letter,
// so when picked from a non-color-1 sheet they store the sheet as a per-cell
// palette digit. Semantic codes (a-e grass, w water, l wall) carry their own
// color and are excluded.
const RAW_CODES = new Set(TILES.map((t) => t.code));

// ASCII code for a cell in a specific color sheet. Grass floor tiles (r1c1,
// and its duplicate r1c6) map to that sheet's semantic grass color (a-e);
// every other tile uses the color-1 raw code and relies on the per-cell
// palette grid to carry the sheet's color.
function codeForSheet(sheet, col, row) {
  const key = `${row}-${col}`;
  if (key === "1-1" || key === "1-6") return SEMANTIC_CODES[`floor${sheet}`];
  return codeForCell(col, row);
}

// Background style for a brush entry, or null for emoji/empty tiles. Water is
// layered separately in <WaterCell>. `sheet` colors raw tiles picked from a
// non-color-1 reference sheet.
function cellStyle(entry, size, sheet = 1) {
  if (entry.palette) return terrainBackground(TERRAIN_SHEETS[entry.palette], FLOOR_TILE, size);
  if (entry.wall) return terrainBackground(TERRAIN_SHEETS[1], WALL_TILE, size);
  if (entry.sheet1)
    return terrainBackground(TERRAIN_SHEETS[sheet] || TERRAIN_SHEETS[1], { col: entry.col, row: entry.row }, size);
  return null;
}

// Water tile: a static flat surface. The foam sprite sheet is not animated
// here because overlaying foam on a cell needs depth/layer support the
// single-tile-per-cell map format doesn't have yet.
function WaterCell({ size }) {
  return <div className="relative" style={waterStyle(size)} />;
}

// One tile layer rendered at a cell. letter "." (or unknown) renders nothing.
// `sheet` colors raw tiles whose per-cell palette is 2-5.
function Tile({ letter, size, sheet = 1 }) {
  const entry = TILE_LOOKUP[letter];
  if (!entry || letter === ".") return null;
  if (entry.render === "water") {
    return <div className="absolute" style={{ left: 0, top: 0, ...waterStyle(size) }} />;
  }
  const style = cellStyle(entry, size, sheet);
  if (!style) return null;
  return (
    <div className="absolute" style={{ left: 0, top: 0, width: size, height: size, ...style }} />
  );
}

// Grid cell: stacks the per-cell base beneath the foreground tile, so
// transparent tile edges (coast grass, walls, stairs) blend into the base
// instead of showing gaps between tiles. `palette` is a digit 1-5 (or ".")
// from the palette grid and colors both layers.
function GridCell({ palette, baseLetter, letter, size }) {
  const sheet = palette && palette !== "." ? Number(palette) : 1;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Tile letter={baseLetter} size={size} sheet={sheet} />
      <Tile letter={letter} size={size} sheet={sheet} />
    </div>
  );
}

function makeGrid(width, height, fill = ".") {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
}

// Keep existing cells when the grid is resized; pad/trim with the fill letter.
function resizeGrid(grid, width, height, fill = ".") {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => grid[y]?.[x] ?? fill)
  );
}

export default function TilemapDrawer() {
  const [width, setWidth] = useState(24);
  const [height, setHeight] = useState(16);
  const [brush, setBrush] = useState("a");
  const [brushSheet, setBrushSheet] = useState(1); // reference sheet the brush was picked from
  const [layer, setLayer] = useState("top"); // "top" (foreground) or "base" (background)
  const [grid, setGrid] = useState(() => makeGrid(24, 16));
  const [baseGrid, setBaseGrid] = useState(() => makeGrid(24, 16, "."));
  const [paletteGrid, setPaletteGrid] = useState(() => makeGrid(24, 16, ".")); // digits 1-5, "." = color 1
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);

  const CELL = 36;
  const REF = 36; // reference-sheet cell size in px
  const paintingRef = useRef(false); // avoid re-render churn while dragging

  // Paint one letter into the active layer (top or base grid). Raw tiles
  // painted from a non-color-1 sheet also record the sheet in the palette grid.
  const setCell = (which, x, y, letter) => {
    const updater = which === "base" ? setBaseGrid : setGrid;
    updater((prev) => {
      if (prev[y][x] === letter) return prev;
      const next = prev.map((row) => row.slice());
      next[y][x] = letter;
      return next;
    });
    const digit = brushSheet > 1 && RAW_CODES.has(letter) ? String(brushSheet) : ".";
    setPaletteGrid((prev) => {
      if (prev[y][x] === digit) return prev;
      const next = prev.map((row) => row.slice());
      next[y][x] = digit;
      return next;
    });
  };

  const startPaint = (e, x, y) => {
    e.preventDefault();
    paintingRef.current = true;
    // Right-click always erases, left-click uses the selected brush.
    const letter = e.button === 2 ? "." : brush;
    setCell(layer, x, y, letter);
  };

  // Export: an optional palette grid (only when a color other than 1 is used),
  // then the base grid, blank line, then the top grid.
  const hasPalette = paletteGrid.some((row) => row.some((c) => c !== "."));
  const ascii = [
    ...(hasPalette ? [paletteGrid.map((row) => row.join("")).join("\n")] : []),
    baseGrid.map((row) => row.join("")).join("\n"),
    grid.map((row) => row.join("")).join("\n"),
  ].join("\n\n");

  const copyAscii = async () => {
    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback for browsers without clipboard API: select the pre content.
      const pre = document.getElementById("tilemap-ascii");
      if (pre) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const loadAscii = () => {
    // Delegate the parsing (3-block palette/base/top, 2-block base/top, or a
    // single top block with a "# base=…" prefill) to the shared tilemap lib.
    const parsed = parseSketch(pasted);
    if (!parsed) return;
    const grid = (rows) => rows.map((r) => r.split(""));
    setGrid(grid(parsed.top));
    setBaseGrid(parsed.base ? grid(parsed.base) : makeGrid(parsed.width, parsed.height, parsed.baseFill));
    setPaletteGrid(parsed.palette ? grid(parsed.palette) : makeGrid(parsed.width, parsed.height, "."));
    setWidth(parsed.width);
    setHeight(parsed.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Tilemap Drawer</h1>
            <p className="text-sm text-slate-400">
              Paint with the terrain tiles, then copy the ASCII sketch to describe a layout.
            </p>
          </div>
          <HomeButton />
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            W
            <input
              type="number"
              min={1}
              max={99}
              value={width}
              onChange={(e) => {
                const w = Math.max(1, Math.min(99, Number(e.target.value) || 1));
                setWidth(w);
                setGrid((g) => resizeGrid(g, w, g[0].length));
                setBaseGrid((g) => resizeGrid(g, w, g[0].length));
                setPaletteGrid((g) => resizeGrid(g, w, g[0].length));
              }}
              className="w-16 rounded-md bg-slate-800 border border-slate-700 px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1.5">
            H
            <input
              type="number"
              min={1}
              max={99}
              value={height}
              onChange={(e) => {
                const h = Math.max(1, Math.min(99, Number(e.target.value) || 1));
                setHeight(h);
                setGrid((g) => resizeGrid(g, g[0].length, h));
                setBaseGrid((g) => resizeGrid(g, g[0].length, h));
                setPaletteGrid((g) => resizeGrid(g, g[0].length, h));
              }}
              className="w-16 rounded-md bg-slate-800 border border-slate-700 px-2 py-1"
            />
          </label>

          <div className="h-6 w-px bg-slate-700" />

          <button
            onClick={() => {
              const w = grid[0].length;
              const h = grid.length;
              setGrid(resizeGrid(grid, w, h));
              setBaseGrid(resizeGrid(baseGrid, w, h, "."));
              setPaletteGrid(resizeGrid(paletteGrid, w, h, "."));
            }}
            className="rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1"
            title="Empty every cell (all layers)"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const fill = (g) => g.map((row) => row.map(() => brush));
              const digit = brushSheet > 1 && RAW_CODES.has(brush) ? String(brushSheet) : ".";
              if (layer === "base") setBaseGrid(fill);
              else setGrid(fill);
              setPaletteGrid((g) => g.map((row) => row.map(() => digit)));
            }}
            className="rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1"
          >
            Fill {layer} with {brush}
          </button>
          <button
            onClick={() => {
              setGrid((g) =>
                g.map((row, y) =>
                  row.map((cell, x) =>
                    y === 0 || y === g.length - 1 || x === 0 || x === row.length - 1 ? "w" : cell
                  )
                )
              );
              setPaletteGrid((g) =>
                g.map((row, y) =>
                  row.map((cell, x) =>
                    y === 0 || y === g.length - 1 || x === 0 || x === row.length - 1 ? "." : cell
                  )
                )
              );
            }}
            className="rounded-md bg-sky-900 hover:bg-sky-800 border border-sky-700 px-3 py-1"
            title="Fill the outer ring with water tiles"
          >
            Water border
          </button>

          <div className="flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700 p-0.5">
            <button
              onClick={() => setLayer("top")}
              className={`rounded px-2 py-0.5 transition-colors ${
                layer === "top" ? "bg-emerald-600 font-semibold" : "text-slate-400 hover:bg-slate-700"
              }`}
              title="Paint the foreground of each cell"
            >
              Top
            </button>
            <button
              onClick={() => setLayer("base")}
              className={`rounded px-2 py-0.5 transition-colors ${
                layer === "base" ? "bg-sky-600 font-semibold" : "text-slate-400 hover:bg-slate-700"
              }`}
              title="Paint the background of each cell (empty base cells are transparent)"
            >
              Base
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <button
            onClick={copyAscii}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-1 font-semibold"
          >
            {copied ? "Copied!" : "Copy ASCII"}
          </button>
        </div>

        {/* Tileset reference — acts as the brush palette */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            Tileset reference — click a tile in any sheet to make it the brush
          </p>
          <div className="flex flex-wrap items-start gap-4">
            {[1, 2, 3, 4, 5].map((sheet) => (
              <div key={sheet}>
                <div
                  className="relative inline-block border border-slate-700 rounded-md overflow-hidden select-none"
                  style={{ width: REF * SHEET_COLS, height: REF * SHEET_ROWS }}
                >
                  <img
                    src={TERRAIN_SHEETS[sheet]}
                    alt={`Tilemap color ${sheet}`}
                    className="absolute inset-0 w-full h-full"
                    draggable={false}
                  />
                  {Array.from({ length: SHEET_ROWS }, (_, r) =>
                    Array.from({ length: SHEET_COLS }, (_, c) => {
                      const code = codeForSheet(sheet, c, r);
                      return (
                        <div
                          key={`${sheet}-${r}-${c}`}
                          className="absolute border border-white/20 hover:bg-white/25 cursor-pointer"
                          style={{ left: c * REF, top: r * REF, width: REF, height: REF }}
                          onClick={() => {
                            if (code) {
                              setBrush(code);
                              setBrushSheet(sheet);
                            }
                          }}
                          onMouseEnter={() => setHoverCell({ sheet, c, r, code })}
                          onMouseLeave={() => setHoverCell(null)}
                          title={`color ${sheet} r${r}c${c} → ${code || "empty"}`}
                        />
                      );
                    })
                  )}
                </div>
                <p className="mt-1 text-center text-[11px] font-mono text-slate-400">color {sheet}</p>
              </div>
            ))}
            <div key="water">
              <button
                onClick={() => {
                  setBrush(SEMANTIC_CODES.water);
                  setBrushSheet(1);
                }}
                title="Water (w)"
                className={`block rounded-md border overflow-hidden transition-colors ${
                  brush === SEMANTIC_CODES.water
                    ? "border-emerald-400"
                    : "border-slate-700 hover:border-slate-500"
                }`}
                style={{ width: REF, height: REF }}
              >
                <WaterCell size={REF} />
              </button>
              <p
                className={`mt-1 text-center text-[11px] font-mono ${
                  brush === SEMANTIC_CODES.water ? "text-emerald-300" : "text-slate-400"
                }`}
              >
                w · water
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 space-y-1">
            <p>
              Click a tile in any sheet to make the brush. Grass floor tiles (r1c1, r1c6) keep their
              color in the letter (<span className="font-mono">a-e</span>); other tiles picked from
              sheets 2-5 export their color as a palette grid (digits 1-5) above the base grid.
            </p>
            {hoverCell && (
              <p className="font-mono text-emerald-300">
                color {hoverCell.sheet} r{hoverCell.r}c{hoverCell.c} → “{hoverCell.code || "empty"}”
              </p>
            )}
            <p>
              Current brush:{" "}
              <span className="font-mono text-emerald-300">
                {brush} · {brushSheet > 1 ? `color ${brushSheet} · ` : ""}
                {TILE_LOOKUP[brush]?.name}
              </span>
            </p>
            <p className="pt-2">
              Stairs are the raw <span className="font-mono">N O S T</span> tiles; the watery stone
              block is the bottom-right 2x4 area of each sheet (<span className="font-mono">r4c5</span>{" "}
              is the wall <span className="font-mono">l</span>). The water tile sits beside the last
              sheet. Right-click erases a cell.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            Grid — left-click paints the {layer} layer, right-click erases, drag to paint a line
          </p>
          <div
            className="inline-block select-none border border-slate-700 rounded-md overflow-hidden"
            onMouseUp={() => (paintingRef.current = false)}
            onMouseLeave={() => (paintingRef.current = false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {grid.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    onMouseDown={(e) => startPaint(e, x, y)}
                    onMouseEnter={() => paintingRef.current && setCell(layer, x, y, brush)}
                  >
                    <GridCell
                      palette={paletteGrid[y][x]}
                      baseLetter={baseGrid[y][x]}
                      letter={cell}
                      size={CELL}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ASCII output */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
              ASCII output (copy this)
            </p>
            <pre
              id="tilemap-ascii"
              className="whitespace-pre font-mono text-sm leading-4 rounded-md bg-slate-950 border border-slate-800 p-3 overflow-auto"
            >
              {ascii}
            </pre>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
              Paste ASCII back to edit
            </p>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"222222\n222222\n222222\n\n......\n..aaa.\n......\n\n......\n..NN..\n......"}
              rows={5}
              className="w-full rounded-md bg-slate-950 border border-slate-800 p-3 font-mono text-sm"
            />
            <button
              onClick={loadAscii}
              className="mt-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 text-sm"
            >
              Load ASCII into grid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
