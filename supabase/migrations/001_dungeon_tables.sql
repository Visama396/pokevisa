-- =====================================================
-- PokéVisa Dungeon Crawler - Supabase Migrations
-- =====================================================
-- Run this in your Supabase SQL Editor to create all
-- necessary tables and policies for the multiplayer
-- dungeon crawler game.
-- =====================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. ROOMS TABLE
-- Each game session is a "room" with a dungeon.
-- =====================================================
create table if not exists rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,               -- 6-char room code for joining
  host_id text not null,                    -- anonymous player ID of host
  max_players int not null default 4,
  status text not null default 'lobby'      -- lobby | playing | finished
    check (status in ('lobby', 'playing', 'finished')),
  dungeon_seed int not null,                -- RNG seed for reproducible dungeons
  floor int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fast lookup by room code
create index if not exists idx_rooms_code on rooms(code);
create index if not exists idx_rooms_status on rooms(status);

-- =====================================================
-- 2. ROOM PLAYERS TABLE
-- Tracks which players are in which room.
-- =====================================================
create table if not exists room_players (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade,
  player_id text not null,                  -- anonymous client-generated ID
  player_name text not null,
  sprite_id int not null default 25,        -- Pikachu by default
  position_x int not null default 1,        -- dungeon grid position
  position_y int not null default 1,
  is_host boolean not null default false,
  is_alive boolean not null default true,
  hp int not null default 100,
  max_hp int not null default 100,
  level int not null default 5,
  joined_at timestamptz not null default now(),
  unique(room_id, player_id)               -- one entry per player per room
);

create index if not exists idx_room_players_room on room_players(room_id);

-- =====================================================
-- 3. DUNGEON STATE TABLE
-- Stores the generated dungeon layout per room.
-- =====================================================
create table if not exists dungeon_state (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade unique,
  width int not null default 20,
  height int not null default 15,
  tiles jsonb not null default '[]',        -- 2D array: 0=floor, 1=wall, 2=stairs, 3=enemy, 4=treasure
  enemies jsonb not null default '[]',      -- array of {x, y, pokemonId, hp, ...}
  treasures jsonb not null default '[]',    -- array of {x, y, item, opened}
  player_vision jsonb not null default '{}',-- fog of war: which tiles each player has seen
  created_at timestamptz not null default now()
);

-- =====================================================
-- 4. BATTLE STATE TABLE
-- Active battles (wild, co-op, invade).
-- =====================================================
create table if not exists battle_state (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade,
  battle_type text not null default 'wild'
    check (battle_type in ('wild', 'coop', 'invade')),
  enemy_pokemon jsonb not null,             -- {pokemonId, level, hp, maxHp, moves, ...}
  participants text[] not null default '{}', -- array of player_ids in this battle
  current_turn text,                        -- player_id whose turn it is
  turn_number int not null default 1,
  log jsonb not null default '[]',          -- battle log entries
  status text not null default 'active'
    check (status in ('active', 'won', 'fled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_battle_state_room on battle_state(room_id);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================
-- For the MVP, we'll use a permissive approach since
-- all game logic is client-driven with anon access.
-- You can tighten these later.

alter table rooms enable row level security;
alter table room_players enable row level security;
alter table dungeon_state enable row level security;
alter table battle_state enable row level security;

-- Allow all operations for anon (MVP)
-- In production, you'd want more restrictive policies.
create policy "Allow all for anon" on rooms for all using (true) with check (true);
create policy "Allow all for anon" on room_players for all using (true) with check (true);
create policy "Allow all for anon" on dungeon_state for all using (true) with check (true);
create policy "Allow all for anon" on battle_state for all using (true) with check (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate a 6-character room code
create or replace function generate_room_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I/O/0/1 to avoid confusion
  code text := '';
  i int;
begin
  for i in 1..6 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return code;
end;
$$ language plpgsql;

-- Auto-update updated_at on rooms
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger rooms_updated_at
  before update on rooms
  for each row execute function update_updated_at();
