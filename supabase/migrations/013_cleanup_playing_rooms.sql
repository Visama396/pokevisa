-- =====================================================
-- PokéVisa - Clean up abandoned PLAYING rooms too
-- =====================================================
-- Previous cleanup only garbage-collected LOBBY (village) rooms:
--   - migration 010's trigger deleted a room when its last room_player left,
--     but only when the room status was 'lobby'.
--   - migration 012's cleanup_stale_lobby_players() swept stale room_players
--     rows only from lobby rooms.
-- Playing rooms were only ever swept by cleanup_old_rooms() (migration 002),
-- which is invoked solely from the dead DungeonLobby.jsx flow, so it never ran.
--
-- Result: solo dungeons left behind "playing" rooms with zero players forever
-- (the host closed the tab mid-dungeon, or started/invaded a new dungeon which
-- swept their old room_players row and orphaned the old playing room).
--
-- Fix:
--   1. Delete a room the moment it becomes empty, regardless of status (a
--      playing room always has at least the host, so empty == abandoned).
--   2. Replace the lobby-only sweep with cleanup_stale_rooms(), which removes
--      stale room_players rows from lobby AND playing rooms and then deletes
--      any room that ended up empty. DungeonGame heartbeats last_seen the same
--      way VillageGame does, so connected dungeon players are never swept.

-- 1. Empty-room trigger now applies to any status.
create or replace function cleanup_empty_room_on_player_leave()
returns trigger as $$
begin
  delete from rooms r
  where r.id = old.room_id
    and not exists (select 1 from room_players p where p.room_id = old.room_id);
  return old;
end;
$$ language plpgsql;

drop trigger if exists room_players_cleanup_lobby on room_players;
create trigger room_players_cleanup_empty
  after delete on room_players
  for each row execute function cleanup_empty_room_on_player_leave();

-- 2. Broader sweep: stale players from lobby/playing rooms, then any empty room.
--    The explicit empty-room delete also catches rooms that were ALREADY
--    orphaned before this migration (no room_players row exists, so the stale
--    delete above can never fire the trigger for them).
create or replace function cleanup_stale_rooms(min_age_seconds int default 120)
returns int as $$
declare
  removed int;
begin
  delete from room_players p
  where p.last_seen < now() - make_interval(secs => min_age_seconds)
    and exists (select 1 from rooms r where r.id = p.room_id and r.status in ('lobby', 'playing'));
  get diagnostics removed = row_count;

  delete from rooms r
  where not exists (select 1 from room_players p where p.room_id = r.id);

  return removed;
end;
$$ language plpgsql security definer;

grant execute on function cleanup_stale_rooms(int) to anon, authenticated;
