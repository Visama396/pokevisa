-- =====================================================
-- PokéVisa - PokéSlots run progress (per account)
-- =====================================================
-- Saves the live PokéSlots run state (coins, debt, charms, upgrades, grid,
-- quota cycle, ...) so a logged-in player can close the tab and resume
-- where they left off, like saved_dungeons does for the Dungeon game.
--
-- `state` is the whole run object as JSON (null between runs); `records`
-- keeps the player's personal bests (wins, best payout, ...) so they follow
-- the account instead of a single browser's localStorage.
create table if not exists pokeslots_progress (
  account_id uuid primary key references accounts(id) on delete cascade,
  state jsonb,
  records jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table pokeslots_progress enable row level security;
-- Open RLS like the rest of the app's tables (friends, player_profiles, etc.)
create policy "Pokeslots progress: open" on pokeslots_progress
  for all using (true) with check (true);

create or replace function update_pokeslots_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pokeslots_progress_updated_at
  before update on pokeslots_progress
  for each row execute function update_pokeslots_progress_updated_at();
