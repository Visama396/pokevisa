-- =====================================================
-- PokéVisa - Bank
-- =====================================================
-- The village bank (deposit/withdraw) reads and writes bank_gold, but the
-- column never existed on player_profiles, so deposits failed with a 400.
-- =====================================================

alter table player_profiles
  add column if not exists bank_gold int not null default 0;
