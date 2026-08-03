import { TILE } from "../lib/dungeon";
import { VILLAGE_TILES, NPC_POSITIONS, VILLAGE_WIDTH, VILLAGE_HEIGHT } from "../lib/village";
import { TERRAIN_SHEETS, WALL_TILE, FLOOR_TILE } from "../lib/terrain";
import TerrainTile from "./TerrainTile";
import SpriteImg from "./SpriteImg";

// The village always uses palette 1 of the terrain tileset.
const SHEET = TERRAIN_SHEETS[1];

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
              const tile = VILLAGE_TILES[vy]?.[vx];
              const key = `${vx},${vy}`;
              const isPlayer = vx === playerX && vy === playerY;
              const otherInfo = otherPlayerMap[key];
              const npc = npcMap[key];
              const isAdjacent =
                !isPlayer &&
                Math.abs(vx - playerX) <= 1 &&
                Math.abs(vy - playerY) <= 1;

              const isWall = tile === TILE.WALL;
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
                  <TerrainTile sheet={SHEET} tile={isWall ? WALL_TILE : FLOOR_TILE} />
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
