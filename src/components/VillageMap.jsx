import { TILE } from "../lib/dungeon";
import { VILLAGE_TILES, NPC_POSITIONS, VILLAGE_WIDTH, VILLAGE_HEIGHT } from "../lib/village";
import SpriteImg from "./SpriteImg";

const TILE_COLORS = {
  [TILE.FLOOR]: "bg-green-900/30",
  [TILE.WALL]: "bg-stone-800",
};

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

              let bgClass = TILE_COLORS[tile] || "bg-stone-900";
              if (isPlayer) bgClass = "bg-green-800/60";
              else if (otherInfo) bgClass = "bg-blue-800/40";
              else if (npc) bgClass = "bg-amber-800/40";

              return (
                <button
                  key={key}
                  onClick={() => handleTileClick(vx, vy)}
                  className={`flex items-center justify-center ${bgClass} border border-stone-800/30 transition-all ${
                    isAdjacent
                      ? "hover:bg-stone-600/40 cursor-pointer"
                      : "cursor-default"
                  }`}
                  style={{ width: 32, height: 32 }}
                >
                  {isPlayer && <SpriteImg id={playerSpriteId} size={30} title="You" />}
                  {otherInfo && !isPlayer && (
                    <SpriteImg id={otherInfo.spriteId || 25} size={26} title={otherInfo.name} />
                  )}
                  {npc && !isPlayer && !otherInfo && (
                    <SpriteImg id={npc.spriteId} size={26} title={npc.label} />
                  )}
                  {tile === TILE.WALL && (
                    <div className="text-stone-700 text-[10px] leading-none">⬛</div>
                  )}
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
