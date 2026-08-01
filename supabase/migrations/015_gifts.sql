-- =====================================================
-- PokéVisa - Gifts (async item/gold transfers)
-- =====================================================
-- Gifts let a player send items and/or gold to a friend without delivering
-- them directly: the value is held in escrow and the receiver gets a
-- notification. Accept -> items go to Kangaskhan Storage and gold to the bank;
-- decline -> everything returns to the sender's original buckets.
--
-- The source_* columns record where the value came from when the gift was
-- sent ('items' | 'storage' for items, 'pocket' | 'bank' for gold) so a
-- decline can refund to the exact same place.
create table if not exists gifts (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references accounts(id) on delete cascade,
  receiver_id uuid not null references accounts(id) on delete cascade,
  items jsonb not null default '[]',            -- array of item ids (may repeat)
  gold int not null default 0,
  note text,
  source_items text not null default 'items' check (source_items in ('items','storage')),
  source_gold text not null default 'pocket' check (source_gold in ('pocket','bank')),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gifts_receiver on gifts(receiver_id, status);
create index if not exists idx_gifts_sender on gifts(sender_id, status);

alter table gifts enable row level security;
-- Open RLS like the rest of the app's tables (friends, player_profiles, etc.)
create policy "Gifts: open" on gifts
  for all using (true) with check (true);

-- Auto-update updated_at on status changes (accept/decline).
create or replace function update_gift_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger gifts_updated_at
  before update on gifts
  for each row execute function update_gift_updated_at();
