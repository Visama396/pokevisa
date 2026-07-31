-- =====================================================
-- PokéVisa Dungeon Crawler - Dungeon Modes (solo / invade / play-with-friend)
-- =====================================================
-- room_players.is_invader: marks a player who invaded a running dungeon.
--   PvP rule (client-side): damage is allowed iff at least one of the two
--   combatants is an invader. Host + coop joiners (code) cannot hurt each other.
-- dungeon_state.spawn_x/spawn_y: persisted dungeon spawn so late joiners
--   (invaders / friends joining by code) can be placed on a safe tile.
-- =====================================================

alter table room_players
  add column if not exists is_invader boolean not null default false;

alter table dungeon_state
  add column if not exists spawn_x int,
  add column if not exists spawn_y int;
