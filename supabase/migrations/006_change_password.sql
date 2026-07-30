-- =====================================================
-- PokéVisa Dungeon Crawler - Change Password RPC
-- =====================================================
-- Run with security definer so the anon key can update
-- passwords without exposing the service_role key.
-- =====================================================

create or replace function change_password(
  p_account_id uuid,
  p_current_password_hash text,
  p_new_password_hash text
) returns boolean
language plpgsql
security definer
as $$
begin
  update accounts
  set password_hash = p_new_password_hash
  where id = p_account_id
    and password_hash = p_current_password_hash;

  return found;
end;
$$;
