import { NPC_POSITIONS, VILLAGE_WIDTH, VILLAGE_HEIGHT, VILLAGE_LAYERS } from "../lib/village";
import { TERRAIN_SHEETS, waterStyle } from "../lib/terrain";
import { tileFromCode } from "../lib/tilemap";
import TerrainTile from "./TerrainTile";
import SpriteImg from "./SpriteImg";

// Render one layer of a village cell. Water and empty tiles are special-cased;
// every other tile is a cropped chunk of its palette sheet (1-5).
function LayerTile({ tile, cellSize }) {
  if (!tile || tile.kind === "empty") return null;
  if (tile.kind === "water") return <div className="absolute inset-0" style={waterStyle(cellSize)} />;
  return (
    <TerrainTile
      sheet={TERRAIN_SHEETS[tile.palette || 1] || TERRAIN_SHEETS[1]}
      tile={{ col: tile.col, row: tile.row }}
      cellSize={cellSize}
    />
  );
}

export default function VillageMap({
  playerX, playerY, playerSpriteId,
  otherPlayers, onMove, onInteractNPC,
}) {
  const otherPlayerMap = {};
  if (otherPlayers) {
    for (const p of otherPlayers) {
      otherPlayerMap[`${p.position_x},${p.position_y}`] = {
        name: p.player_name,
        spriteId: p.sprite_id,
      };
    }
  }

  const npcMap = {};
  for (const npc of NPC_POSITIONS) {
    npcMap[`${npc.x},${npc.y}`] = npc;
  }

  function handleTileClick(x, y) {
    const dx = Math.abs(x - playerX);
    const dy = Math.abs(y - playerY);
    if (dx <= 1 && dy <= 1 && (dx !== 0 || dy !== 0)) {
      const npc = npcMap[`${x},${y}`];
      if (npc) {
        onInteractNPC(npc);
      } else {
        onMove(x, y);
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="inline-grid gap-0 border border-stone-700 rounded-lg overflow-hidden bg-stone-900"
          style={{ gridTemplateColumns: `repeat(${VILLAGE_WIDTH}, 32px)` }}
        >
          {Array.from({ length: VILLAGE_HEIGHT }, (_, vy) =>
            Array.from({ length: VILLAGE_WIDTH }, (_, vx) => {
              // Decode the two layers (base under top) with the per-cell
              // palette so tiles picked from sheets 2-5 render their color.
              const paletteDigit = VILLAGE_LAYERS.palette[vy]?.[vx];
              const palette = paletteDigit && paletteDigit !== "." ? Number(paletteDigit) : 1;
              const base = VILLAGE_LAYERS.base[vy]?.[vx];
              const top = VILLAGE_LAYERS.top[vy]?.[vx];
              const baseTile = tileFromCode(base, palette);
              const topTile = top !== "." ? tileFromCode(top, palette) : null;
              const key = `${vx},${vy}`;
              const isPlayer = vx === playerX && vy === playerY;
              const otherInfo = otherPlayerMap[key];
              const npc = npcMap[key];
              const isAdjacent =
                !isPlayer &&
                Math.abs(vx - playerX) <= 1 &&
                Math.abs(vy - playerY) <= 1;

              const highlight = isPlayer ? "bg-green-800/50" : otherInfo ? "bg-blue-800/40" : npc ? "bg-amber-800/40" : null;

              return (
                <button
                  key={key}
                  onClick={() => handleTileClick(vx, vy)}
                  className={`relative flex items-center justify-center border border-stone-800/30 transition-all ${
                    isAdjacent ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={{ width: 32, height: 32 }}
                >
                  <LayerTile tile={baseTile} cellSize={32} />
                  {topTile && <LayerTile tile={topTile} cellSize={32} />}
                  {highlight && <div className={`absolute inset-0 ${highlight}`} />}
                  {isAdjacent && <div className="absolute inset-0 hover:bg-stone-600/40" />}
                  <span className="relative z-10 flex items-center justify-center">
                    {isPlayer && <SpriteImg id={playerSpriteId} size={30} title="You" />}
                    {otherInfo && !isPlayer && (
                      <SpriteImg id={otherInfo.spriteId || 25} size={26} title={otherInfo.name} />
                    )}
                    {npc && !isPlayer && !otherInfo && (
                      <SpriteImg id={npc.spriteId} size={26} title={npc.label} />
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
      <p className="text-[10px] text-stone-500 mt-2">
        Click adjacent tiles to move. Click NPCs to interact.
      </p>
    </div>
  );
}

/** The village layout (walkability + layers + NPC positions) lives in
 * src/lib/village.js, defined as a tilemap-drawer ASCII sketch. Use the
 * tilemap-drawer at /tilemap-drawer to design and export new layouts. */
