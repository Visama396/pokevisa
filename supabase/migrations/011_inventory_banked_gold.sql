-- =====================================================
-- PokéVisa - Fold banked gold + item storage into inventory jsonb
-- =====================================================
-- Banked gold was its own column (bank_gold), and items had no "stored"
-- distinction at all. This moves everything into the inventory jsonb so the
-- profile is self-contained:
--   inventory.gold          pocket gold
--   inventory.banked_gold   gold deposited in the village bank
--   inventory.items         carried items
--   inventory.storage       items stored in Kangaskhan Storage (safe from wipes)
--
-- The bank_gold column is dropped afterwards; its value is preserved.

update player_profiles
set inventory = jsonb_build_object(
  'gold', coalesce((inventory->>'gold')::int, 0),
  'banked_gold', bank_gold,
  'items', coalesce(inventory->'items', '[]'::jsonb),
  'storage', coalesce(inventory->'storage', '[]'::jsonb)
);

alter table player_profiles drop column if exists bank_gold;
