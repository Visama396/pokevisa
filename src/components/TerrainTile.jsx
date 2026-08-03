import { terrainBackground } from "../lib/terrain";

// Background layer for a map cell. Crops the requested 64x64 chunk from the
// palette sheet and scales it to fit the cell. `dim` darkens tiles that were
// visited but aren't currently visible (dungeon fog). Sprites/NPCs render on
// top. Used by VillageMap and DungeonMap.
export default function TerrainTile({ sheet, tile, cellSize = 32, dim = false }) {
  return (
    <div
      className="absolute inset-0"
      style={terrainBackground(sheet, tile, cellSize)}
    >
      {dim && <div className="absolute inset-0 bg-black/50" />}
    </div>
  );
}
