import { spriteImgStyle } from "../lib/spriteTrim";

// Shared Pokémon sprite renderer. Each sprite is cropped to its opaque content
// (transparent padding removed) and scaled to fill a box of the given size, so
// Pokémon appear much larger without enlarging their container/cell. Used by
// the dungeon and village grid maps.
export default function SpriteImg({ id, size, title }) {
  return (
    <div className="overflow-hidden" style={{ width: size, height: size }}>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
        alt=""
        title={title}
        style={spriteImgStyle(id, size)}
        draggable={false}
      />
    </div>
  );
}
