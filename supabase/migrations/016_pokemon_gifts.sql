-- =====================================================
-- PokéVisa - Pokémon gifts
-- =====================================================
-- Extend the gifts escrow so players can also send a club Pokémon (from
-- stored_pokemon) to a friend, alongside items and gold. The Pokémon sits in
-- escrow on the gift row; accept -> it joins the receiver's stored_pokemon,
-- decline -> it returns to the sender's stored_pokemon (the only bucket club
-- Pokémon can come from, so no source column is needed).
alter table gifts
  add column if not exists pokemon jsonb;
