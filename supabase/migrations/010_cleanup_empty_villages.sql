-- =====================================================
-- PokéVisa - Garbage-collect abandoned village rooms
-- =====================================================
-- Village "rooms" (status='lobby') used to pile up forever: when the last
-- player left (closed tab, joined another village, or the host ended a
-- dungeon and left an empty lobby), the room row was never removed.
--
-- These triggers delete a lobby room the moment it becomes empty, so empty
-- villages don't take space or show up in auto-join.

-- 1. When a room_players row is deleted, remove the parent room if it's an
--    empty lobby. Covers players leaving the village or being cleaned up after
--    going offline. Playing dungeons are never touched.
create or replace function cleanup_empty_lobby_on_player_leave()
returns trigger as $$
begin
  delete from rooms r
  where r.id = old.room_id
    and r.status = 'lobby'
    and not exists (select 1 from room_players p where p.room_id = old.room_id);
  return old;
end;
$$ language plpgsql;

create trigger room_players_cleanup_lobby
  after delete on room_players
  for each row execute function cleanup_empty_lobby_on_player_leave();

-- 2. When a room is set back to 'lobby' with nobody in it (e.g. the host ends
--    a dungeon and the room reverts to a village), delete it right away.
create or replace function cleanup_empty_lobby_on_status_change()
returns trigger as $$
begin
  if new.status = 'lobby' then
    delete from rooms r
    where r.id = new.id
      and not exists (select 1 from room_players p where p.room_id = new.id);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger rooms_cleanup_lobby_on_status
  after update of status on rooms
  for each row execute function cleanup_empty_lobby_on_status_change();
