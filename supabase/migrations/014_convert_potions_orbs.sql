-- =====================================================
-- PokéVisa - Fold legacy potion/orb item ids into the catalog
-- =====================================================
-- The Phase 1 item overhaul replaced the old consumables with berries, PP
-- elixirs and evolution items, but existing profiles can still hold the removed
-- ids in player_profiles.inventory (items and/or storage):
--
--   potion (heal 20)        -> oran-berry    (heal 100)
--   super-potion (heal 50)  -> sitrus-berry  (restores all HP)
--   orb (throw for damage)  -> stairs-orb    (reveals stairs; functionality planned)
--
-- Remap them in both the carried-items list and Kangaskhan Storage so the UI
-- always renders a known name/icon (see src/lib/items.js). The case preserves
-- any other item ids untouched.

update player_profiles
set inventory = jsonb_set(
  inventory,
  '{items}',
  (select jsonb_agg(case elem
      when 'potion' then 'oran-berry'
      when 'super-potion' then 'sitrus-berry'
      when 'orb' then 'stairs-orb'
      else elem end)
   from jsonb_array_elements_text(inventory->'items') elem)
)
where (inventory->'items') ?| array['potion', 'super-potion', 'orb'];

update player_profiles
set inventory = jsonb_set(
  inventory,
  '{storage}',
  (select jsonb_agg(case elem
      when 'potion' then 'oran-berry'
      when 'super-potion' then 'sitrus-berry'
      when 'orb' then 'stairs-orb'
      else elem end)
   from jsonb_array_elements_text(inventory->'storage') elem)
)
where (inventory->'storage') ?| array['potion', 'super-potion', 'orb'];
