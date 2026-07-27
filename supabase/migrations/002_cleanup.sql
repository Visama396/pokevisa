-- =====================================================
-- Room cleanup: delete old rooms no longer in use
-- =====================================================

-- Delete rooms older than 1 hour that are in lobby or finished status
-- (playing rooms are kept until they finish or go idle)
create or replace function cleanup_old_rooms()
returns void as $$
begin
  delete from rooms
  where status in ('lobby', 'finished')
    and updated_at < now() - interval '1 hour';

  -- Also clean up playing rooms that have been idle for 2 hours
  -- (no player updates recently)
  delete from rooms
  where status = 'playing'
    and updated_at < now() - interval '2 hours';
end;
$$ language plpgsql;
