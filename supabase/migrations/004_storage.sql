-- =====================================================
-- PokéVisa Dungeon Crawler - Storage & Inventory
-- =====================================================

-- Add stored_pokemon column to player_profiles
alter table player_profiles
  add column if not exists stored_pokemon jsonb not null default '[]',
  alter column inventory set default '{"gold": 0, "items": []}';

-- Update existing rows to use object format for inventory
update player_profiles
  set inventory = '{"gold": 0, "items": []}'
  where jsonb_typeof(inventory) = 'array';

-- Add gold column to dungeon_state for coin spawns
alter table dungeon_state
  add column if not exists gold jsonb not null default '[]';
