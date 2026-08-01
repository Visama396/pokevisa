-- =====================================================
-- PokéVisa - Clean up stale lobby players
-- =====================================================
-- Players who close their browser or lose their connection can leave their
-- room_players row behind: the pagehide cleanup is best-effort and unreliable
-- on crashes/OS kills, and presence-based cleanup only runs while another
-- player is in the same room. A stale row keeps the player's sprite visible in
-- the village and can make a lobby look full.
--
-- Fix: every connected client heartbeats its room_players.last_seen while in a
-- room. cleanup_stale_lobby_players() deletes rows in LOBBY villages whose
-- heartbeat is older than a threshold. Playing dungeons are never touched.
-- Background tabs throttle timers (worst case ~1/min), so the default threshold
-- of 120s is much wider than any drift a still-connected player can produce.

alter table room_players add column if not exists last_seen timestamptz not null default now();

create index if not exists idx_room_players_last_seen on room_players(room_id, last_seen);

-- Delete stale lobby room_players rows. Returns how many were removed. Only
-- rooms with status='lobby' are swept so active dungeons are never affected.
create or replace function cleanup_stale_lobby_players(min_age_seconds int default 120)
returns int as $$
declare
  removed int;
begin
  delete from room_players p
  using rooms r
  where p.room_id = r.id
    and r.status = 'lobby'
    and p.last_seen < now() - make_interval(secs => min_age_seconds);
  get diagnostics removed = row_count;
  return removed;
end;
$$ language plpgsql security definer;

grant execute on function cleanup_stale_lobby_players(int) to anon, authenticated;
