// =====================================================
// Dungeon Generation - BSP (Binary Space Partitioning)
// Generates grid-based dungeons with rooms and corridors
// =====================================================

import { ensureMovesData } from "./moves.js";

// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  STAIRS: 2,
  ENEMY: 3,
  TREASURE: 4,
  PLAYER: 5,
  GOLD: 6,
};

// Seeded random number generator (mulberry32)
function createRNG(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRNG(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted dungeon treasure pool. Berries are the everyday drops, elixir shows
// up occasionally, evolution items are rare collectibles, and "TM" rolls a
// random move TM (added dynamically once moves.json is loaded).
const DUNGEON_ITEM_POOL = [
  "oran-berry", "oran-berry", "oran-berry",
  "pecha-berry", "pecha-berry",
  "cheri-berry", "cheri-berry",
  "rawst-berry",
  "sitrus-berry",
  "chesto-berry",
  "elixir", "elixir",
  "water-stone", "fire-stone", "thunder-stone", "leaf-stone",
  "moon-stone", "sun-stone", "dawn-stone", "dusk-stone", "shiny-stone", "ice-stone",
  "metal-coat", "peat-block",
  "TM",
];

// All move slugs from moves.json (TM source). Cached at module level so the
// async load happens once; generateDungeon is async to await it.
let _tmSlugs = null;
async function getTMSlugs() {
  if (_tmSlugs) return _tmSlugs;
  const data = await ensureMovesData();
  _tmSlugs = data ? Object.keys(data) : [];
  return _tmSlugs;
}

function rollDungeonItem(rng, tmSlugs) {
  const roll = DUNGEON_ITEM_POOL[Math.floor(rng() * DUNGEON_ITEM_POOL.length)];
  if (roll === "TM") {
    // Guard against an empty move list (e.g. moves.json failed to load) by
    // falling back to a berry so a TM slot never yields an invalid id.
    if (!tmSlugs || tmSlugs.length === 0) return "sitrus-berry";
    return `tm-${tmSlugs[Math.floor(rng() * tmSlugs.length)]}`;
  }
  return roll;
}

// Generate a dungeon using BSP. Async because it rolls a TM from moves.json for
// the treasure pool — callers await it (DungeonGame already does for enemies).
export async function generateDungeon(width = 20, height = 15, seed = Date.now(), floor = 1) {
  const rng = createRNG(seed);
  const tmSlugs = await getTMSlugs();

  // Initialize grid with walls
  const tiles = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE.WALL)
  );

  const rooms = [];

  // BSP split
  function split(x, y, w, h, depth) {
    if (depth <= 0 || w < 5 || h < 5) {
      // Create a room in this region
      const roomW = Math.floor(rng() * (w - 3)) + 3;
      const roomH = Math.floor(rng() * (h - 3)) + 3;
      const roomX = x + Math.floor(rng() * (w - roomW));
      const roomY = y + Math.floor(rng() * (h - roomH));
      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
      return;
    }

    const splitH = rng() > 0.5;
    if (splitH && h >= 8) {
      const splitY = y + 3 + Math.floor(rng() * (h - 6));
      split(x, y, w, splitY - y, depth - 1);
      split(x, splitY, w, y + h - splitY, depth - 1);
    } else if (w >= 8) {
      const splitX = x + 3 + Math.floor(rng() * (w - 6));
      split(x, y, splitX - x, h, depth - 1);
      split(splitX, y, x + w - splitX, h, depth - 1);
    } else {
      const roomW = Math.floor(rng() * (w - 3)) + 3;
      const roomH = Math.floor(rng() * (h - 3)) + 3;
      const roomX = x + Math.floor(rng() * (w - roomW));
      const roomY = y + Math.floor(rng() * (h - roomH));
      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
    }
  }

  split(1, 1, width - 2, height - 2, 5);

  // Carve rooms
  for (const room of rooms) {
    for (let ry = room.y; ry < room.y + room.h; ry++) {
      for (let rx = room.x; rx < room.x + room.w; rx++) {
        if (ry >= 0 && ry < height && rx >= 0 && rx < width) {
          tiles[ry][rx] = TILE.FLOOR;
        }
      }
    }
  }

  // Connect rooms with corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const a = rooms[i];
    const b = rooms[i + 1];
    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);

    // Horizontal then vertical
    let cx = ax;
    while (cx !== bx) {
      if (ay >= 0 && ay < height && cx >= 0 && cx < width) {
        tiles[ay][cx] = TILE.FLOOR;
      }
      cx += cx < bx ? 1 : -1;
    }
    let cy = ay;
    while (cy !== by) {
      if (cy >= 0 && cy < height && bx >= 0 && bx < width) {
        tiles[cy][bx] = TILE.FLOOR;
      }
      cy += cy < by ? 1 : -1;
    }
  }

  // Place stairs in the last room
  const lastRoom = rooms[rooms.length - 1];
  const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2);
  const stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
  tiles[stairsY][stairsX] = TILE.STAIRS;

  // Enemies spawn dynamically at the stairs (every 4 steps, max 5 on floor)
  const enemies = [];

  // Collect floor tiles for treasures & gold placement
  const floorTiles = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiles[y][x] === TILE.FLOOR) {
        floorTiles.push({ x, y });
      }
    }
  }

  // Place a few treasures
  const treasureCount = Math.min(floorTiles.length, 2 + Math.floor(rng() * 3));
  const treasurePositions = shuffleWithRNG(floorTiles, rng).slice(0, treasureCount);
  const treasures = treasurePositions.map((pos) => ({
    x: pos.x,
    y: pos.y,
    item: rollDungeonItem(rng, tmSlugs),
    opened: false,
  }));

  // Place gold coins
  const usedForGold = new Set(
    treasurePositions.map((p) => `${p.x},${p.y}`)
  );
  const availableForGold = floorTiles.filter(
    (p) => !usedForGold.has(`${p.x},${p.y}`)
  );
  const goldCount = Math.min(availableForGold.length, 3 + Math.floor(rng() * 4));
  const goldPositions = shuffleWithRNG(availableForGold, rng).slice(0, goldCount);
  const gold = goldPositions.map((pos) => ({
    x: pos.x,
    y: pos.y,
    amount: 5 + Math.floor(rng() * 21),
    collected: false,
  }));

  // Spawn position (center of first room)
  const firstRoom = rooms[0];
  const spawnX = Math.floor(firstRoom.x + firstRoom.w / 2);
  const spawnY = Math.floor(firstRoom.y + firstRoom.h / 2);

  return {
    width,
    height,
    tiles,
    rooms,
    enemies,
    treasures,
    gold,
    spawnX,
    spawnY,
    stairsX,
    stairsY,
  };
}

// Get visible tiles (simple flood-fill vision)
export function getVisibleTiles(tiles, px, py, range = 5) {
  const visible = new Set();
  const height = tiles.length;
  const width = tiles[0].length;

  // Simple raycasting from player position
  for (let angle = 0; angle < 360; angle += 5) {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    let x = px + 0.5;
    let y = py + 0.5;

    for (let step = 0; step < range; step++) {
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);

      if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= height) break;

      visible.add(`${tileX},${tileY}`);

      if (tiles[tileY][tileX] === TILE.WALL) break;

      x += dx;
      y += dy;
    }
  }

  return visible;
}

// Check if a tile is walkable
export function isWalkable(tiles, x, y) {
  if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) return false;
  return tiles[y][x] !== TILE.WALL;
}

// A diagonal step/attack between two orthogonally adjacent tiles (x1,y1) and
// (x2,y2) is only allowed when the two corner tiles beside the diagonal are
// both open. A wall on either side blocks it — you can't squeeze between two
// walls. Straight (orthogonal) moves are always fine.
export function canTraverse(tiles, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx !== 0 && dy !== 0) {
    if (tiles[y1]?.[x2] === TILE.WALL || tiles[y2]?.[x1] === TILE.WALL) return false;
  }
  return true;
}

// Move enemy 1 step toward target (8-direction greedy chase, no squeezing
// diagonally between two walls)
export function moveEnemyToward(tiles, ex, ey, tx, ty, occupiedPositions) {
  const dirs = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
  ];

  dirs.sort((a, b) => {
    const da = Math.max(Math.abs(ex + a.dx - tx), Math.abs(ey + a.dy - ty));
    const db = Math.max(Math.abs(ex + b.dx - tx), Math.abs(ey + b.dy - ty));
    return da - db;
  });

  for (const { dx, dy } of dirs) {
    const nx = ex + dx;
    const ny = ey + dy;
    const key = `${nx},${ny}`;
    if (
      isWalkable(tiles, nx, ny)
      && canTraverse(tiles, ex, ey, nx, ny)
      && !occupiedPositions.has(key)
    ) {
      return { x: nx, y: ny };
    }
  }
  return null;
}

// Random one-step wander used when the player isn't in line of sight, so wild
// Pokémon roam the dungeon instead of camping at their spawn point. `avoidPos`
// is the tile the enemy just left — stepping straight back is a last resort so
// enemies don't jitter between two tiles.
export function wanderEnemy(tiles, ex, ey, occupiedPositions, avoidPos) {
  const dirs = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
  ];
  const valid = [];
  for (const { dx, dy } of dirs) {
    const nx = ex + dx;
    const ny = ey + dy;
    const key = `${nx},${ny}`;
    if (
      isWalkable(tiles, nx, ny)
      && canTraverse(tiles, ex, ey, nx, ny)
      && !occupiedPositions.has(key)
    ) {
      valid.push({ x: nx, y: ny, key });
    }
  }
  if (valid.length === 0) return null;
  if (avoidPos) {
    const avoidKey = `${avoidPos.x},${avoidPos.y}`;
    const forward = valid.filter((v) => v.key !== avoidKey);
    if (forward.length > 0) return forward[Math.floor(Math.random() * forward.length)];
  }
  return valid[Math.floor(Math.random() * valid.length)];
}
