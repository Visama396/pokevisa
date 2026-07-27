-- =====================================================
-- PokéVisa Dungeon Crawler - Accounts & Progress
-- =====================================================

-- =====================================================
-- 1. ACCOUNTS TABLE
-- Player accounts (username + password, no email)
-- =====================================================
create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password_hash text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounts_username on accounts(username);

-- =====================================================
-- 2. PLAYER PROFILES TABLE
-- Quiz results, starter, dungeon progress
-- =====================================================
create table if not exists player_profiles (
  account_id uuid primary key references accounts(id) on delete cascade,
  quiz_result text,                           -- dominant trait: brave/gentle/quick/tough/clever
  starter_id int,                             -- chosen starter species ID (1-151)
  current_floor int not null default 1,
  inventory jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 3. PLAYER TEAM TABLE
-- Pokémon the player owns (max 6 active)
-- =====================================================
create table if not exists player_team (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references accounts(id) on delete cascade,
  pokemon_id int not null,                    -- species (1-151)
  nickname text,
  level int not null default 5,
  hp int not null,
  max_hp int not null,
  moves jsonb not null default '[]',          -- [{name, type, power, accuracy, category}]
  slot int not null default 0,                -- party position 0-5
  is_starter boolean not null default false,
  created_at timestamptz not null default now(),
  unique(account_id, slot)
);

create index if not exists idx_player_team_account on player_team(account_id);

-- =====================================================
-- 4. SAVE DUNGEON STATE per account
-- So players can resume after closing browser
-- =====================================================
create table if not exists saved_dungeons (
  account_id uuid primary key references accounts(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  dungeon_seed int not null,
  floor int not null default 1,
  width int not null,
  height int not null,
  tiles jsonb not null,
  enemies jsonb not null default '[]',
  treasures jsonb not null default '[]',
  player_positions jsonb not null default '{}', -- {player_id: {x, y}}
  updated_at timestamptz not null default now()
);

-- =====================================================
-- RLS Policies
-- =====================================================
alter table accounts enable row level security;
alter table player_profiles enable row level security;
alter table player_team enable row level security;
alter table saved_dungeons enable row level security;

-- Accounts: anyone can read usernames (for login check), only insert自己的
create policy "Accounts: read usernames" on accounts
  for select using (true);

create policy "Accounts: insert own" on accounts
  for insert with check (true);

-- Player profiles: only owner
create policy "Profiles: owner" on player_profiles
  for all using (true) with check (true);

-- Player team: only owner
create policy "Team: owner" on player_team
  for all using (true) with check (true);

-- Saved dungeons: only owner
create policy "Dungeons: owner" on saved_dungeons
  for all using (true) with check (true);

-- =====================================================
-- Auto-update updated_at
-- =====================================================
create or replace function update_player_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger player_profiles_updated_at
  before update on player_profiles
  for each row execute function update_player_updated_at();

create trigger saved_dungeons_updated_at
  before update on saved_dungeons
  for each row execute function update_player_updated_at();
