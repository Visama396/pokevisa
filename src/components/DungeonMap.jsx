import { useMemo } from "react";
import { TILE, getVisibleTiles } from "../lib/dungeon";

const TILE_COLORS = {
  [TILE.FLOOR]: "bg-slate-700/40",
  [TILE.WALL]: "bg-slate-900",
  [TILE.STAIRS]: "bg-yellow-900/60",
  [TILE.ENEMY]: "bg-red-900/30",
  [TILE.TREASURE]: "bg-amber-900/30",
  [TILE.PLAYER]: "bg-green-900/30",
};

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function TileContent({ tile, enemy, treasure, gold, isPlayer, isOtherPlayer, otherPlayerName, playerSpriteId, otherSpriteId }) {
  if (isPlayer) {
    return (
      <img
        src={`${SPRITE_URL}/${playerSpriteId}.png`}
        alt=""
        className="w-6 h-6 object-contain"
        title="You"
      />
    );
  }
  if (isOtherPlayer) {
    return (
      <img
        src={`${SPRITE_URL}/${otherSpriteId || 25}.png`}
        alt=""
        className="w-5 h-5 object-contain"
        title={otherPlayerName}
      />
    );
  }
  if (enemy) {
    return (
      <img
        src={`${SPRITE_URL}/${enemy.pokemonId}.png`}
        alt=""
        className="w-6 h-6 object-contain"
        title={`Lv.${enemy.level}`}
      />
    );
  }
  if (treasure && !treasure.opened) {
    return <span className="text-sm">📦</span>;
  }
  if (gold && !gold.collected) {
    return <span className="text-sm">💰</span>;
  }
  if (tile === TILE.STAIRS) {
    return <span className="text-sm">🔽</span>;
  }
  return null;
}

export default function DungeonMap({
  dungeon,
  playerX,
  playerY,
  playerSpriteId,
  otherPlayers,
  visitedTiles,
  onMove,
  disabled,
  targeting,
}) {
  const visibleTiles = useMemo(() => {
    if (!dungeon) return new Set();
    return getVisibleTiles(dungeon.tiles, playerX, playerY, 6);
  }, [dungeon, playerX, playerY]);

  if (!dungeon) return null;

  const { tiles, enemies, treasures, gold, width, height } = dungeon;

  const viewRadius = 7;
  const viewMinX = Math.max(0, playerX - viewRadius);
  const viewMaxX = Math.min(width, playerX + viewRadius + 1);
  const viewMinY = Math.max(0, playerY - viewRadius);
  const viewMaxY = Math.min(height, playerY + viewRadius + 1);

  const otherPlayerMap = {};
  if (otherPlayers) {
    for (const p of otherPlayers) {
      otherPlayerMap[`${p.position_x},${p.position_y}`] = {
        name: p.player_name,
        spriteId: p.sprite_id,
      };
    }
  }

  const enemyMap = {};
  for (const e of enemies) {
    enemyMap[`${e.x},${e.y}`] = e;
  }

  const treasureMap = {};
  for (const t of treasures) {
    treasureMap[`${t.x},${t.y}`] = t;
  }

  const goldMap = {};
  if (gold) {
    for (const g of gold) {
      goldMap[`${g.x},${g.y}`] = g;
    }
  }

  function handleTileClick(x, y) {
    if (disabled) return;
    const dx = x - playerX;
    const dy = y - playerY;
    const isAdjacent = Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0);
    if (isAdjacent) {
      onMove(x, y);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="inline-grid gap-0 border border-slate-700 rounded-lg overflow-hidden bg-slate-900"
        style={{ gridTemplateColumns: `repeat(${viewMaxX - viewMinX}, 2rem)` }}
      >
        {Array.from({ length: viewMaxY - viewMinY }, (_, vy) => {
          const y = viewMinY + vy;
          return Array.from({ length: viewMaxX - viewMinX }, (_, vx) => {
            const x = viewMinX + vx;
            const tile = tiles[y]?.[x];
            const key = `${x},${y}`;
            const isVisible = visibleTiles.has(key);
            const isVisited = visitedTiles?.has(key);
            const isPlayer = x === playerX && y === playerY;
            const otherInfo = otherPlayerMap[key];
            const enemy = enemyMap[key];
            const treasure = treasureMap[key];
            const goldCoin = goldMap[key];
            const isAdjacentTile = !isPlayer && Math.abs(x - playerX) <= 1 && Math.abs(y - playerY) <= 1;

            let bgClass = "bg-slate-900";
            if (isVisible) {
              bgClass = TILE_COLORS[tile] || "bg-slate-700/40";
              if (isPlayer) bgClass = "bg-green-800/60";
              else if (otherInfo) bgClass = "bg-blue-800/40";
            } else if (isVisited) {
              bgClass = "bg-slate-800/60";
            }

            return (
              <button
                key={key}
                onClick={() => handleTileClick(x, y)}
                disabled={disabled || !isVisible}
                className={`w-8 h-8 flex items-center justify-center ${bgClass} border border-slate-800/30 transition-all ${
                  !disabled && isVisible && isAdjacentTile
                    ? targeting
                      ? "hover:bg-red-600/40 cursor-crosshair ring-1 ring-red-500/30"
                      : "hover:bg-slate-600/40 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                {(isVisible || isVisited) && (
                  <TileContent
                    tile={tile}
                    enemy={isVisible ? enemy : null}
                    treasure={isVisible ? treasure : null}
                    gold={isVisible ? goldCoin : null}
                    isPlayer={isPlayer}
                    isOtherPlayer={!!otherInfo}
                    otherPlayerName={otherInfo?.name}
                    playerSpriteId={playerSpriteId}
                    otherSpriteId={otherInfo?.spriteId}
                  />
                )}
              </button>
            );
          });
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-2">{targeting ? "Click a tile to attack" : "Click adjacent tiles to move"}</p>
    </div>
  );
}
