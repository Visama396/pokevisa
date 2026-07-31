import trims from "./spriteTrim.json";

// Per-species opaque bounding box within the 96x96 PokéAPI sprite, generated
// by scripts/build-sprite-trim.js. Defaults to the full frame for any species
// missing from the table (e.g. future generations) — old behaviour.
const FULL = { x: 0, y: 0, w: 96, h: 96 };

export function getSpriteTrim(id) {
  return trims[id] || FULL;
}

// Returns styles for an <img> that, inside an overflow-hidden container of the
// given size, shows the sprite's opaque content scaled to fill the cell. The
// transparent padding around each sprite is cropped, so Pokémon look much
// bigger without enlarging the grid cells.
export function spriteImgStyle(id, size) {
  const { x, y, w, h } = getSpriteTrim(id);
  const scale = size / Math.max(w, h);
  // The visible window is max(w, h) wide in source space, centred on the
  // content box and clamped to the 96x96 frame so nothing is ever clipped.
  const win = Math.max(w, h);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const vx = clamp(x + w / 2 - win / 2, 0, 96 - win);
  const vy = clamp(y + h / 2 - win / 2, 0, 96 - win);
  return {
    display: "block",
    width: 96 * scale,
    height: 96 * scale,
    maxWidth: "none",
    marginLeft: -vx * scale,
    marginTop: -vy * scale,
  };
}
