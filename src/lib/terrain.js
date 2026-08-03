// Terrain tileset used to render the village and dungeon maps.
//
// public/Terrain/Tileset/Tilemap_color{1..5}.png is a 576x384 image of 64x64
// tiles (9 columns x 6 rows). Each map cell crops the matching chunk via CSS
// background-position and scales it down to the rendered cell size.
//
// The sheet only contains grass + water terrain, so walls reuse the grass
// tile and the renderer darkens them. Palette 1 is used by the village and
// dungeon floor 1; deeper floors cycle palettes ((floor - 1) % 5) for a fresh
// look as you descend.

export const TILE_SIZE = 64;

// Tileset image per palette (1-5).
export const TERRAIN_SHEETS = {
  1: "/Terrain/Tileset/Tilemap_color1.png",
  2: "/Terrain/Tileset/Tilemap_color2.png",
  3: "/Terrain/Tileset/Tilemap_color3.png",
  4: "/Terrain/Tileset/Tilemap_color4.png",
  5: "/Terrain/Tileset/Tilemap_color5.png",
};

// Chunks (col, row) of the 9x6 sheet that read as clean, uniform grass — used
// for walkable floor. A single variant is used everywhere: the sheet's grass
// tiles differ subtly in brightness, so mixing them creates visible stripes.
export const FLOOR_TILE = { col: 1, row: 1 };

// Wall/blocked tiles come from the sheet's bottom-right 2x4 block (rows 4-5,
// cols 5-8) — stone wall tiles with a baked-in dark outline. One block is used
// for every wall cell so borders read as a consistent stone wall.
export const WALL_TILE = { col: 5, row: 4 };

// Pick the sheet for a dungeon floor: floor 1 -> palette 1, floor 2 ->
// palette 2, ... wrapping after 5. The village always uses palette 1.
export function terrainSheetForFloor(floor = 1) {
  return TERRAIN_SHEETS[((floor - 1) % 5) + 1];
}

// CSS style that crops and scales one 64x64 chunk onto a cellSize box.
export function terrainBackground(sheet, tile, cellSize) {
  const scale = cellSize / TILE_SIZE;
  return {
    backgroundImage: `url(${sheet})`,
    backgroundSize: `${576 * scale}px ${384 * scale}px`,
    backgroundPosition: `-${tile.col * cellSize}px -${tile.row * cellSize}px`,
    backgroundRepeat: "no-repeat",
  };
}

// Water tile, used for the village island border (and any future water cells).
// The surface is the flat "Water Background color.png" (64x64). A separate
// foam sprite sheet exists ("Water Foam.png", 16 tiles of 192x192 in a row)
// but is not rendered here: overlaying a foam frame onto a cell requires
// layered/depth rendering that the single-tile-per-cell map format doesn't
// support yet, so water renders as a static surface for now.
// Spaces are percent-encoded because CSS url() strips whitespace from
// unquoted paths, which would otherwise 404.
export const WATER_BG = "/Terrain/Tileset/Water%20Background%20color.png";

// Style for a water cell: a flat blue surface sized to the cell.
export function waterStyle(cellSize) {
  return {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    backgroundImage: `url(${WATER_BG})`,
    backgroundSize: `${cellSize}px ${cellSize}px`,
    backgroundRepeat: "no-repeat",
  };
}
