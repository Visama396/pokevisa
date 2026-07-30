-- Add nature column to player_team for deterministic stat modifiers
alter table player_team add column if not exists nature text not null default '_';

-- Backfill: assign natures deterministically from existing Pokémon's UUID
update player_team
set nature = (
  select arr[1 + (abs(('x' || substr(md5(id::text), 1, 8))::bit(32)::int) % 25)]
  from (select string_to_array('hardy,lonely,brave,adamant,naughty,bold,docile,relaxed,impish,lax,timid,hasty,serious,jolly,naive,modest,mild,quiet,bashful,rash,calm,gentle,sassy,careful,quirky', ',') as arr) _
)
where nature = '_';
