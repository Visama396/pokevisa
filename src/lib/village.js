import { TILE } from "./dungeon";

const W = TILE.WALL;
const F = TILE.FLOOR;

export const VILLAGE_WIDTH = 30;
export const VILLAGE_HEIGHT = 20;

export const VILLAGE_TILES = (() => {
  const tiles = Array.from({ length: VILLAGE_HEIGHT }, () =>
    Array(VILLAGE_WIDTH).fill(F)
  );
  for (let x = 0; x < VILLAGE_WIDTH; x++) {
    tiles[0][x] = W;
    tiles[VILLAGE_HEIGHT - 1][x] = W;
  }
  for (let y = 0; y < VILLAGE_HEIGHT; y++) {
    tiles[y][0] = W;
    tiles[y][VILLAGE_WIDTH - 1] = W;
  }

  function building(tx, ty, bw, bh) {
    for (let y = ty; y < ty + bh; y++)
      for (let x = tx; x < tx + bw; x++)
        tiles[y][x] = W;
  }

  building(3, 3, 2, 2);
  building(3, 5, 2, 2);
  building(10, 2, 2, 2);
  building(10, 4, 2, 2);
  building(20, 3, 2, 2);
  building(20, 5, 2, 2);
  building(24, 5, 2, 2);
  building(6, 13, 2, 2);
  building(6, 15, 2, 2);
  building(14, 12, 2, 2);
  building(14, 14, 2, 2);
  building(23, 13, 2, 2);
  building(23, 15, 2, 2);

  for (let x = 8; x <= 22; x++) tiles[9][x] = W;

  for (let x = 3; x <= 26; x++) tiles[17][x] = W;

  tiles[2][6] = W; tiles[2][7] = W;
  tiles[17][8] = W; tiles[18][8] = W;
  tiles[2][22] = W; tiles[2][23] = W;
  tiles[4][12] = W; tiles[4][13] = W; tiles[4][14] = W;

  return tiles;
})();

export const NPC_POSITIONS = [
  { id: "mart", name: "Shopkeep", x: 4, y: 4, label: "Poké Mart", spriteId: 129 },
  { id: "moves", name: "Tutor", x: 11, y: 3, label: "Move Changer", spriteId: 61 },
  { id: "name", name: "Rater", x: 21, y: 4, label: "Name Rater", spriteId: 108 },
  { id: "adventure", name: "Explorer", x: 7, y: 14, label: "Adventure", spriteId: 95 },
];

export const VILLAGE_SPAWN = { x: 15, y: 10 };

export const SHOP_ITEMS = [
  { id: "potion", name: "Potion", description: "Heal 20 HP", price: 50, effect: { heal: 20 } },
  { id: "super-potion", name: "Super Potion", description: "Heal 50 HP", price: 150, effect: { heal: 50 } },
  { id: "full-heal", name: "Full Heal", description: "Cure all status & heal to full", price: 500, effect: { heal: "full" } },
  { id: "revive", name: "Revive", description: "Revive fainted Pokémon (50% HP)", price: 800, effect: { revive: true, healRatio: 0.5 } },
];
