// ─── Item catalog ─────────────────────────────────────────────────────────────
// Items are identified by a stable string id and stored as plain ids in the
// player's inventory (player_profiles.inventory.items / .storage) and in the
// dungeon's collected-items list during a run. All display info and effects
// live here so the shop, Kangaskhan Storage, the gift flow and the dungeon HUD
// render the same name/icon/effect everywhere.
//
// Effect shapes:
//   { heal: 100 }               heal that many HP (capped at max)
//   { heal: "full" }            heal to full HP
//   { cure: ["poison", ...] }   clear those status conditions
//   { awaken: true }            Chesto: wake up + grant Awaken this floor
//   { restorePP: "all" }        Elixir: restore a chosen move's PP
//   { tm: "<move-slug>" }       TM: teach that move to a compatible species
//   { evo: "stone" }            evolution item — collectible only for now
//
// `kind` groups items for UI (shop tabs, storage grouping, drops):
//   "berry" | "elixir" | "stone" | "tm" | "other"
//
// TMs are dynamic: every move in public/moves.json is a TM with id
// `tm-<move-slug>`. They aren't hand-written in ITEMS — getItem()/getItemName()
// resolve them on the fly so a full catalog of 797+ moves stays consistent.

import { getMoveName } from "./moves.js";

export const ITEMS = [
  // ── Berries (replace the old potions; used inside the dungeon) ──
  { id: "oran-berry",  kind: "berry", name: "Oran Berry",  description: "Heals 100 HP",                icon: "🍊", price: 100, effect: { heal: 100 } },
  { id: "sitrus-berry", kind: "berry", name: "Sitrus Berry", description: "Restores all HP",           icon: "🍋", price: 350, effect: { heal: "full" } },
  { id: "chesto-berry", kind: "berry", name: "Chesto Berry", description: "Wakes up & grants Awaken (sleep-proof this floor)", icon: "🥜", price: 150, effect: { cure: ["sleep"], awaken: true } },
  { id: "pecha-berry", kind: "berry", name: "Pecha Berry", description: "Cures poison",                icon: "🍑", price: 150, effect: { cure: ["poison"] } },
  { id: "rawst-berry", kind: "berry", name: "Rawst Berry", description: "Cures burn",                  icon: "🍓", price: 150, effect: { cure: ["burn"] } },
  { id: "cheri-berry", kind: "berry", name: "Cheri Berry", description: "Cures paralysis",             icon: "🍒", price: 150, effect: { cure: ["paralysis"] } },

  // ── PP ──
  { id: "elixir", kind: "elixir", name: "Elixir", description: "Restores the PP of the active Pokémon", icon: "🧪", price: 600, effect: { restorePP: "all" } },

  // ── Evolution items (collectible / tradeable for now; evolution mechanic
  //    is planned separately) ──
  { id: "water-stone",   kind: "stone", name: "Water Stone",   description: "Evolves certain Water Pokémon", icon: "💧", price: 800, effect: { evo: "stone" } },
  { id: "fire-stone",    kind: "stone", name: "Fire Stone",    description: "Evolves certain Fire Pokémon",  icon: "🔥", price: 800, effect: { evo: "stone" } },
  { id: "thunder-stone", kind: "stone", name: "Thunder Stone", description: "Evolves certain Electric Pokémon", icon: "⚡", price: 800, effect: { evo: "stone" } },
  { id: "leaf-stone",    kind: "stone", name: "Leaf Stone",    description: "Evolves certain Grass Pokémon", icon: "🍃", price: 800, effect: { evo: "stone" } },
  { id: "moon-stone",    kind: "stone", name: "Moon Stone",    description: "Evolves certain Pokémon",        icon: "🌙", price: 1200, effect: { evo: "stone" } },
  { id: "sun-stone",     kind: "stone", name: "Sun Stone",     description: "Evolves certain Pokémon",        icon: "☀️", price: 1200, effect: { evo: "stone" } },
  { id: "dawn-stone",    kind: "stone", name: "Dawn Stone",    description: "Evolves certain Pokémon",        icon: "🌅", price: 1200, effect: { evo: "stone" } },
  { id: "dusk-stone",    kind: "stone", name: "Dusk Stone",    description: "Evolves certain Pokémon",        icon: "🌆", price: 1200, effect: { evo: "stone" } },
  { id: "shiny-stone",   kind: "stone", name: "Shiny Stone",   description: "Evolves certain Pokémon",        icon: "✨", price: 1200, effect: { evo: "stone" } },
  { id: "ice-stone",     kind: "stone", name: "Ice Stone",     description: "Evolves certain Ice Pokémon",    icon: "❄️", price: 1200, effect: { evo: "stone" } },
  { id: "metal-coat",    kind: "stone", name: "Metal Coat",    description: "Evolves Onix into Steelix",      icon: "🛡️", price: 2000, effect: { evo: "item" } },
  { id: "peat-block",    kind: "stone", name: "Peat Block",    description: "Evolves Ursaring into Ursaluna", icon: "🟫", price: 2000, effect: { evo: "item" } },
  { id: "dragon-scale",  kind: "stone", name: "Dragon Scale",  description: "Evolves Seadra into Kingdra",    icon: "🐉", price: 2000, effect: { evo: "item" } },
  { id: "kings-rock",    kind: "stone", name: "King's Rock",   description: "Evolves certain Pokémon",        icon: "👑", price: 1500, effect: { evo: "item" } },
  { id: "razor-fang",    kind: "stone", name: "Razor Fang",    description: "Evolves Gligar into Gliscor",    icon: "🦷", price: 1500, effect: { evo: "item" } },
  { id: "razor-claw",    kind: "stone", name: "Razor Claw",    description: "Evolves Sneasel into Weavile",   icon: "🔪", price: 1500, effect: { evo: "item" } },
  { id: "protector",     kind: "stone", name: "Protector",     description: "Evolves Rhydon into Rhyperior",  icon: "🧿", price: 1500, effect: { evo: "item" } },
  { id: "electirizer",   kind: "stone", name: "Electirizer",   description: "Evolves Electabuzz into Electivire", icon: "🔋", price: 1500, effect: { evo: "item" } },
  { id: "magmarizer",    kind: "stone", name: "Magmarizer",    description: "Evolves Magmar into Magmortar",   icon: "🌡️", price: 1500, effect: { evo: "item" } },
  { id: "dubious-disc",  kind: "stone", name: "Dubious Disc",  description: "Evolves Porygon2 into Porygon-Z", icon: "💿", price: 1500, effect: { evo: "item" } },
  { id: "upgrade",       kind: "stone", name: "Upgrade",       description: "Evolves Porygon into Porygon2",   icon: "⬆️", price: 1500, effect: { evo: "item" } },
  { id: "reaper-cloth",  kind: "stone", name: "Reaper Cloth",  description: "Evolves Dusclops into Dusknoir",  icon: "🧵", price: 1500, effect: { evo: "item" } },
  { id: "prism-scale",   kind: "stone", name: "Prism Scale",   description: "Evolves Feebas into Milotic",     icon: "🪞", price: 1500, effect: { evo: "item" } },
  { id: "sachet",        kind: "stone", name: "Sachet",        description: "Evolves Spritzee into Aromatisse", icon: "🎀", price: 1500, effect: { evo: "item" } },
  { id: "whipped-dream", kind: "stone", name: "Whipped Dream", description: "Evolves Swirlix into Slurpuff",   icon: "🍰", price: 1500, effect: { evo: "item" } },
  { id: "oval-stone",    kind: "stone", name: "Oval Stone",    description: "Evolves Happiny into Chansey",    icon: "🥚", price: 1500, effect: { evo: "item" } },

  // ── Utility ──
  // Stairs Orb: reveals the stairs on the current floor. The reveal effect is
  // not implemented yet — the item exists so legacy "orb" ids (converted by
  // migration 014) render with a proper name/icon until the functionality ships.
  { id: "stairs-orb", kind: "other", name: "Stairs Orb", description: "Reveals the stairs on the current floor", icon: "🧭", price: 500 },
];

const ITEMS_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

// ─── TMs (dynamic catalog) ────────────────────────────────────────────────────
// A TM's item id is `tm-<move-slug>`, so no per-move entries are needed. Static
// metadata (icon, price, kind) is constant; the name comes from moves.json so
// it localizes. The move's data is stored in `effect.tm` and used by the
// teach-TM flows in the village and dungeon.
export const TM_PREFIX = "tm-";
export const TM_PRICE = 1200;

export function getTMMoveSlug(itemId) {
  return itemId && itemId.startsWith(TM_PREFIX) ? itemId.slice(TM_PREFIX.length) : null;
}

// Build the item object for a TM of the given move slug. Used by the shop and
// by getItem() for dynamic lookup.
export function getTMItem(moveSlug) {
  return {
    id: `${TM_PREFIX}${moveSlug}`,
    kind: "tm",
    name: "TM",
    description: "Teaches a move to a compatible Pokémon",
    icon: "📼",
    price: TM_PRICE,
    effect: { tm: moveSlug },
  };
}

// Resolve a TM's localized display name, falling back to a readable slug.
export function getTMItemName(itemId, language) {
  const slug = getTMMoveSlug(itemId);
  if (!slug) return null;
  return `TM ${getMoveName({ name: slug }, language)}`;
}

export function getItem(id) {
  if (id && id.startsWith(TM_PREFIX)) return getTMItem(id.slice(TM_PREFIX.length));
  return ITEMS_BY_ID.get(id);
}

// Fallback so unknown/legacy ids (e.g. removed potions) never crash the UI.
export function getItemName(id, language) {
  const tmName = getTMItemName(id, language);
  if (tmName) return tmName;
  return getItem(id)?.name || id;
}

export function getItemIcon(id) {
  if (id && id.startsWith(TM_PREFIX)) return "📼";
  return getItem(id)?.icon || "📦";
}

// Group an array of item ids into { itemId: count } for list rendering.
export function countItems(ids = []) {
  const counts = {};
  for (const id of ids) counts[id] = (counts[id] || 0) + 1;
  return counts;
}

// Items that can be used on a team member (berries, elixir, TMs). Stones are
// collectible but have no usable effect yet.
export function isUsableItem(id) {
  const item = getItem(id);
  if (!item) return false;
  const e = item.effect || {};
  return Boolean(e.heal || e.cure || e.awaken || e.restorePP || e.tm);
}

// Pure helper: new HP value after applying a heal effect (or unchanged).
export function applyHeal(effect, pkm) {
  if (!effect?.heal) return pkm?.hp ?? pkm?.hp ?? 0;
  const maxHp = pkm?.maxHp ?? pkm?.max_hp ?? 100;
  if (effect.heal === "full") return maxHp;
  return Math.min(maxHp, (pkm?.hp ?? 0) + effect.heal);
}
