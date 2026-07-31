-- =====================================================
-- PokéVisa - Social System & EXP persistence
-- =====================================================

-- 1. FRIENDS TABLE
-- Bidirectional friendship graph. status: 'pending' (request sent) or
-- 'accepted'. Only accepted rows count as friends. Requests are stored with
-- account_id = requester, friend_id = recipient.
create table if not exists friends (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references accounts(id) on delete cascade,
  friend_id uuid not null references accounts(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique(account_id, friend_id)
);

create index if not exists idx_friends_account on friends(account_id);
create index if not exists idx_friends_friend on friends(friend_id);

alter table friends enable row level security;
create policy "Friends: open" on friends
  for all using (true) with check (true);

-- 2. EXP COLUMN ON PLAYER_TEAM
-- Leveling up was broken because handleEnemyDefeated tried to persist `exp`
-- but no column existed, so the whole UPDATE (level/max_hp/hp/moves too) was
-- rejected. This column lets EXP and levels actually persist.
alter table player_team add column if not exists exp int not null default 0;
