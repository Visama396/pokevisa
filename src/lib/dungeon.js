// =====================================================
// Dungeon Generation - BSP (Binary Space Partitioning)
// Generates grid-based dungeons with rooms and corridors
// =====================================================

// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  STAIRS: 2,
  ENEMY: 3,
  TREASURE: 4,
  PLAYER: 5,
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

// Generate a dungeon using BSP
export function generateDungeon(width = 20, height = 15, seed = Date.now()) {
  const rng = createRNG(seed);

  // Initialize grid with walls
  const tiles = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE.WALL)
  );

  const rooms = [];

  // BSP split
  function split(x, y, w, h, depth) {
    if (depth <= 0 || w < 6 || h < 6) {
      // Create a room in this region
      const roomW = Math.floor(rng() * (w - 4)) + 4;
      const roomH = Math.floor(rng() * (h - 4)) + 4;
      const roomX = x + Math.floor(rng() * (w - roomW));
      const roomY = y + Math.floor(rng() * (h - roomH));
      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
      return;
    }

    const splitH = rng() > 0.5;
    if (splitH && h >= 10) {
      const splitY = y + 4 + Math.floor(rng() * (h - 8));
      split(x, y, w, splitY - y, depth - 1);
      split(x, splitY, w, y + h - splitY, depth - 1);
    } else if (w >= 10) {
      const splitX = x + 4 + Math.floor(rng() * (w - 8));
      split(x, y, splitX - x, h, depth - 1);
      split(splitX, y, x + w - splitX, h, depth - 1);
    } else {
      const roomW = Math.floor(rng() * (w - 4)) + 4;
      const roomH = Math.floor(rng() * (h - 4)) + 4;
      const roomX = x + Math.floor(rng() * (w - roomW));
      const roomY = y + Math.floor(rng() * (h - roomH));
      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
    }
  }

  split(1, 1, width - 2, height - 2, 4);

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

  // Place enemies in random floor tiles (not in first room)
  const enemies = [];
  const floorTiles = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (tiles[y][x] === TILE.FLOOR) {
        // Skip the first room (spawn room)
        const firstRoom = rooms[0];
        if (x >= firstRoom.x && x < firstRoom.x + firstRoom.w &&
            y >= firstRoom.y && y < firstRoom.y + firstRoom.h) {
          continue;
        }
        floorTiles.push({ x, y });
      }
    }
  }

  const enemyCount = Math.min(floorTiles.length, 5 + Math.floor(rng() * 6));
  const enemyPositions = shuffleWithRNG(floorTiles, rng).slice(0, enemyCount);
  for (const pos of enemyPositions) {
    // Random Pokémon ID (1-151 for Gen 1)
    const pokemonId = Math.floor(rng() * 151) + 1;
    const hp = 20 + Math.floor(rng() * 30);
    enemies.push({
      x: pos.x,
      y: pos.y,
      pokemonId,
      level: 3 + Math.floor(rng() * 5),
      hp,
      maxHp: hp,
    });
  }

  // Place a few treasures
  const treasureCount = Math.min(floorTiles.length - enemyCount, 2 + Math.floor(rng() * 3));
  const usedPositions = new Set(enemyPositions.map((p) => `${p.x},${p.y}`));
  const availableForTreasure = floorTiles.filter(
    (p) => !usedPositions.has(`${p.x},${p.y}`)
  );
  const treasurePositions = shuffleWithRNG(availableForTreasure, rng).slice(0, treasureCount);
  const treasures = treasurePositions.map((pos) => ({
    x: pos.x,
    y: pos.y,
    item: rng() > 0.5 ? "potion" : "orb",
    opened: false,
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
