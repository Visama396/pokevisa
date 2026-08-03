// Dev tool: paint a grid using the real terrain tileset and export it as an
// ASCII sketch (one letter per cell). The exported sketch is pasted into
// chats/prompts to describe village/event layouts, then parsed by the game
// code (letter -> tile, see src/lib/tilemap.js). Lives at /tilemap-drawer.
import { useRef, useState } from "react";
import {
  TERRAIN_SHEETS,
  FLOOR_TILE,
  WALL_TILE,
  terrainBackground,
  waterStyle,
} from "../lib/terrain";
import { TILES, SEMANTIC_CODES, SHEET_COLS, SHEET_ROWS, codeForCell } from "../lib/tilemap";
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

// Background style for a brush entry, or null for emoji/empty tiles. Water is
// layered separately in <WaterCell>.
function cellStyle(entry, size) {
  if (entry.palette) return terrainBackground(TERRAIN_SHEETS[entry.palette], FLOOR_TILE, size);
  if (entry.wall) return terrainBackground(TERRAIN_SHEETS[1], WALL_TILE, size);
  if (entry.sheet1) return terrainBackground(TERRAIN_SHEETS[1], { col: entry.col, row: entry.row }, size);
  return null;
}

// Water tile: a static flat surface. The foam sprite sheet is not animated
// here because overlaying foam on a cell needs depth/layer support the
// single-tile-per-cell map format doesn't have yet.
function WaterCell({ size }) {
  return <div className="relative" style={waterStyle(size)} />;
}

// A single paint cell: shows the tile or a translucent "eraser" crosshair.
function Cell({ letter, size, isEraser }) {
  const entry = TILE_LOOKUP[letter];
  const overlay = isEraser ? (
    <span className="text-slate-400 select-none" style={{ fontSize: size * 0.5 }}>
      ✕
    </span>
  ) : null;

  if (entry?.render === "water") {
    return (
      <div className="relative">
        <WaterCell size={size} />
        <span className="absolute inset-0 flex items-center justify-center">{overlay}</span>
      </div>
    );
  }

  const style = cellStyle(entry, size);
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size, ...(style || {}) }}
    >
      {overlay}
    </div>
  );
}

// Style for a single layer's tile, or null when the layer is empty ('.').
function layerStyle(letter, size) {
  if (letter === ".") return null;
  const entry = TILE_LOOKUP[letter];
  if (entry?.render === "water") return waterStyle(size);
  return cellStyle(entry, size);
}

// Grid cell: renders the base layer beneath the top layer, so transparent tile
// edges (coast grass, walls, stairs) blend into the base instead of showing
// gaps between tiles.
function GridCell({ base, letter, size, isEraser }) {
  const baseStyle = layerStyle(base, size);
  return (
    <div style={{ width: size, height: size, ...(baseStyle || {}) }}>
      <Cell letter={letter} size={size} isEraser={isEraser} />
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
  const [base, setBase] = useState("w");
  const [grid, setGrid] = useState(() => makeGrid(24, 16));
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);

  const CELL = 36;
  const REF = 36; // reference-sheet cell size in px
  const paintingRef = useRef(false); // avoid re-render churn while dragging

  const paint = (x, y, letter) =>
    setGrid((prev) => {
      if (prev[y][x] === letter) return prev;
      const next = prev.map((row) => row.slice());
      next[y][x] = letter;
      return next;
    });

  const startPaint = (e, x, y) => {
    e.preventDefault();
    paintingRef.current = true;
    // Right-click always erases, left-click uses the selected brush.
    const letter = e.button === 2 ? "." : brush;
    paint(x, y, letter);
  };

  const ascii = `# base=${base}\n${grid.map((row) => row.join("")).join("\n")}`;

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
    let baseChar = null;
    const rows = [];
    for (const line of pasted.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#")) {
        const m = trimmed.match(/^#\s*base=(\S+)/);
        if (m) baseChar = m[1];
        continue;
      }
      const cleaned = line.replace(/\s/g, "");
      if (cleaned.length) rows.push(cleaned);
    }
    if (rows.length === 0) return;
    if (baseChar && TILE_LOOKUP[baseChar]) setBase(baseChar);
    const w = Math.max(...rows.map((r) => r.length));
    const h = rows.length;
    setGrid(Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        const ch = rows[y][x] ?? ".";
        return TILE_LOOKUP[ch] ? ch : ".";
      })
    ));
    setWidth(w);
    setHeight(h);
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
              }}
              className="w-16 rounded-md bg-slate-800 border border-slate-700 px-2 py-1"
            />
          </label>

          <div className="h-6 w-px bg-slate-700" />

          <button
            onClick={() => setGrid((g) => resizeGrid(g, g[0].length, g.length))}
            className="rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1"
            title="Empty every cell"
          >
            Clear
          </button>
          <button
            onClick={() => setGrid((g) => g.map((row) => row.map(() => brush)))}
            className="rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1"
          >
            Fill all with {brush}
          </button>
          <button
            onClick={() =>
              setGrid((g) =>
                g.map((row, y) =>
                  row.map((cell, x) =>
                    y === 0 || y === g.length - 1 || x === 0 || x === row.length - 1 ? "w" : cell
                  )
                )
              )
            }
            className="rounded-md bg-sky-900 hover:bg-sky-800 border border-sky-700 px-3 py-1"
            title="Fill the outer ring with water tiles"
          >
            Water border
          </button>

          <div className="h-6 w-px bg-slate-700" />

          <button
            onClick={copyAscii}
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-1 font-semibold"
          >
            {copied ? "Copied!" : "Copy ASCII"}
          </button>
        </div>

        {/* Brush */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Brush</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((entry) => (
              <button
                key={entry.code}
                onClick={() => setBrush(entry.code)}
                title={entry.name}
                className={`flex flex-col items-center gap-0.5 rounded-md border p-1 transition-colors ${
                  brush === entry.code
                    ? "border-emerald-400 bg-slate-800"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                }`}
              >
                <Cell letter={entry.code} size={entry.sheet1 ? 28 : 30} />
                <span className="text-[10px] font-mono text-slate-300">
                  {entry.code} · {entry.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tileset reference */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            Tileset reference (color 1) — click a tile to use it as a brush
          </p>
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="relative inline-block border border-slate-700 rounded-md overflow-hidden select-none"
              style={{ width: REF * SHEET_COLS, height: REF * SHEET_ROWS }}
            >
              <img
                src={TERRAIN_SHEETS[1]}
                alt="Tilemap color 1"
                className="absolute inset-0 w-full h-full"
                draggable={false}
              />
              {Array.from({ length: SHEET_ROWS }, (_, r) =>
                Array.from({ length: SHEET_COLS }, (_, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="absolute border border-white/20 hover:bg-white/25 cursor-pointer"
                    style={{ left: c * REF, top: r * REF, width: REF, height: REF }}
                    onClick={() => {
                      const code = codeForCell(c, r);
                      if (code) setBrush(code);
                    }}
                    onMouseEnter={() => setHoverCell({ c, r })}
                    onMouseLeave={() => setHoverCell(null)}
                    title={`r${r}c${c} → ${codeForCell(c, r) || "empty"}`}
                  />
                ))
              )}
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Hover a tile to see its cell + ASCII code.</p>
              <p>Click it to make it the current brush.</p>
              {hoverCell && (
                <p className="font-mono text-emerald-300">
                  r{hoverCell.r}c{hoverCell.c} → “{codeForCell(hoverCell.c, hoverCell.r) || "empty"}”
                </p>
              )}
              <p className="pt-2">
                Semantic codes: <span className="font-mono">a-e</span> grass color 1-5,{" "}
                <span className="font-mono">w</span> water, <span className="font-mono">l</span> wall,
                <span className="font-mono"> .</span> empty. Stairs are the raw{" "}
                <span className="font-mono">N O S T</span> tiles.
              </p>
            </div>
          </div>
        </div>

        {/* Base layer */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">Base layer</p>
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-slate-700 p-1">
              <Cell letter={base} size={30} />
            </div>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-sm"
              title="Tile painted beneath every grid cell (empty cells show through)"
            >
              {PALETTE.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.code} · {entry.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400">
            Painted under the whole grid — “.” empty cells reveal it. Exported as{" "}
            <span className="font-mono"># base=…</span>.
          </p>
        </div>

        {/* Grid */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            Grid — left-click paints, right-click erases (reveals base), drag to paint a line
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
                    onMouseEnter={() => paintingRef.current && paint(x, y, brush)}
                  >
                    <GridCell base={base} letter={cell} size={CELL} isEraser={brush === "."} />
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
              placeholder={"# base=w\n........aa\naaaaaa.a.a"}
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
