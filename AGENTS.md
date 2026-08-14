# PokéVisa Development Plan

This file records the phase plan and current status so work can be resumed across
sessions. When a phase is finished, mark it `[x]` here.

## Phase 1 — Item-system bug fixes (DONE)
- Dungeon loot/persistence: capture no longer remounts the dungeon; loot
  (gold delta + item bag) survives remounts via `persistLoot()` at every descend
  and on exit/defeat.
- Move-learn bug: only level-unlocked moves are offered, declined moves stop
  re-prompting, display-only `level` field dropped (matches Move Tutor).
- Dungeon entry seeds pocket gold + carried items; item use consumes from the
  live bag; shop pays pocket-then-bank; `stairs-orb` catalog entry.
- Migration `014` converts legacy `potion`/`super-potion`/`orb` ids.

## Phase 2 — TM system (DONE)
- Every move in `public/moves.json` is a TM (item id `tm-<move-slug>`).
- Species compatibility from `public/pokedex.json` `moves.tm` (real-game TM lists).
- TM sources: random dungeon treasure drop (rare, like elixir) + daily shop
  rotation (same 5 TMs for all players, date-seeded like PokéWordle, buyable
  unlimited, price 1200).
- Teaching flows in the village (Kangaskhan Storage "Use") and mid-run
  (dungeon items panel). Compat checks, duplicate check, appends if <4 moves,
  else a forget-a-move picker. Persisted via `updateTeamMember`.
- Files: `src/lib/moves.js`, `src/lib/items.js`, `src/lib/dungeon.js`,
  `src/components/VillageGame.jsx`, `src/components/DungeonGame.jsx`.

## Phase 3 — Gifts (async item/gold/Pokémon transfers) (DONE)
- Send items, gold, and club Pokémon to friends as pending gifts (escrow) instead
  of delivering directly. Receiver gets a notification; nothing lands in their
  carried bag.
- Sources: items from carried inventory OR Kangaskhan Storage; gold from pocket
  OR the bank; Pokémon from the club. Declined gifts refund to the sender's
  original buckets.
- Accept → items to receiver's Kangaskhan Storage, gold to their bank, Pokémon
  to their club. Decline → everything returns to the sender.
- Table `gifts` (migration `015`) + `pokemon jsonb` column (migration `016`).
  Client-side RPC-style functions in `src/lib/auth.js` (`sendGift`, `acceptGift`,
  `declineGift`, `getIncomingGifts`, `getOutgoingGifts`) with an atomic
  `pending → accepted/declined` claim so double-taps can't double-deliver.
- UI in `src/components/VillageGame.jsx`: gift bell with pending count + panel
  (incoming accept/decline, outgoing status), storage "Send" for carried and
  stored items, bank "Send gold to a friend" (bank or pocket source), Club
  Wigglytuff "Send" per club member.
- **Migrations `015`/`016` applied and the flow live-tested (gift → bell →
  accept/decline → delivery/refund) including Pokémon gifts.**

## Phase 4 — Village NPC rework (DONE)
- Rename moved into Club Wigglytuff (each club member has Rename/Make Active/
  Send). The Name Rater NPC is gone.
- Sage (Whiscash #340) replaces it: evolution helper. Any team or club Pokémon
  can evolve either by reaching a level-up evolution (`trigger: "level-up"`,
  `item: null` — happiness/location variants excluded) or by using an evolution
  item (`trigger: "use-item"`, e.g. Eevee branches) — item evolutions require
  the player to own the stone (checked against Kangaskhan Storage + carried
  bag, `getEvolutionOptions` returns `item`), and `handleEvolve` consumes it
  from storage (fallback: carried). Multiple targets each get a button showing
  the stone needed. HP recomputed via `calcStat(getBaseHp(id), level, true)`
  keeping the ratio; default nickname updates to the new species, custom
  nicknames are kept. Helpers live in `src/lib/pokedex.js`
  (`getEvolutionOptions`, `getBaseHp`).
- **Evolution data now stores ALL methods per evolution**: each `evolvesTo`
  entry in `pokedex.json` carries a `conditions` array (one object per method)
  instead of a single flat condition — PokeAPI's `evolution_details` lists
  every way (e.g. Eevee → Leafeon: 5 mossy-rock locations + Leaf Stone).
  `scripts/build-pokedex.js` `detailToCondition`/`buildChainMembers` produce
  the shape. Consumers read `conditions`: the details page evolution chart
  shows every method (item sprite above the label, exact dupes collapsed via
  `formatCondition`), `getEvolutionOptions` returns one option per qualifying
  condition, and Pokeroguelite's `isPokemonAvailable`/`buildEvolutionData`
  reinterpret level-up conditions accordingly.
- Klefki (password NPC) at `village.js` position (21,5); Xatu relabeled to
  "Account Reset"; Move Changer tutor is now Hypno (sprite 97); all village UI
  strings translated (9 languages).

## Phase 5 — MMO-style progression & dungeon polish (DONE)
- EXP curve reworked (`src/lib/moves.js`): `expToNext(level)` is a steep
  geometric curve (10 EXP at level 1, ~10M at level 100); `cumulativeExp(level)`
  is the total needed to reach a level; EXP stays cumulative so old saves keep
  their banked EXP and just "catch up" on the next kill.
- `calcExpGain(enemyLevel, playerLevel, enemyMaxHp)` — base scales with enemy
  level + bulk, then a level-difference multiplier: on-level/above pays full
  value (up to 2.5x for tougher foes), below-level collapses fast (~1 EXP/kill
  for a L40 player on floor 1). Wild enemy level is `floor + 1..4`, so higher
  floors are where the EXP is.
- Dungeon sidebar: items list is always visible (accordion removed).
- EXP seeding convention: Pokémon caught/created at level N carry no lifetime
  EXP, so `handleEnemyDefeated` (and the sidebar EXP bar) treats a missing/zero
  `exp` as `cumulativeExp(level)` — otherwise the first cumulativeExp(level)
  EXP earned is invisible on the bar. New creations seed `exp: cumulativeExp(level)`
  (capture, starter). Level-ups only add the max-HP delta to current HP — the
  old `Math.max(hp, maxHp)` full-healed on every kill.
- Accuracy roll: `moveHits(move)` (`src/lib/moves.js`) rolls the move's real
  accuracy from `moves.json` in both the player (`processAttack`) and enemy
  (`enemyTurn`) attack paths in `DungeonGame.jsx` — a miss consumes the turn
  and applies no damage/status. `attachPP` also enriches accuracy (moves.json
  stores `null` for never-miss moves, treated as 100).
- Diagonal blocking (`src/lib/dungeon.js` `canTraverse`): diagonal moves and
  attacks (player + enemy + enemy AI chase) are blocked when either corner tile
  beside the diagonal is a wall — no squeezing between two walls. DungeonMap
  greys out blocked diagonal targets so the cursor isn't misleading.
- Defeat loot loss: fainting in combat now wipes your carried inventory. The
  game-over screen's Back button calls `handleDefeat` (DungeonGame), which
  saves the profile with pocket gold 0 and an empty item bag — everything
  carried into the run plus everything collected is lost, while the bank and
  captured Pokémon are untouched — and heals the team. Safe exits
  (`returnToVillage`, `leaveRoom`, lobby Back) still bank the loot via
  `persistLoot`.

## Phase 6 — Village elevation (DONE)
- Stairs are now the only way up or down in the village terrain. The two halls
  are raised platforms (level 2, olive grass) reached only via their stair
  tiles; the yellow/blue grass plateau and plaza (level 1) can't be crossed
  onto a hall's lip/roof without a stair.
- `src/lib/village.js`: `villageLevel(x, y)` returns 0 blocked / 1 ground /
  2 raised / 9 stair (stair = sheet tiles in rows 4-5 cols 0-3, codes O/T/N/S);
  `villageCanStep(x1,y1,x2,y2)` allows moves between same-level cells or across
  a stair. Raised regions are explicit rectangles (`RAISED_REGIONS`): the left
  hall (cols 3-8, rows 1-6), the right hall (cols 18-22, rows 0-7), its olive
  coast-grass south skirt + grass bridge (row 8, cols 13-20 — the "columns
  12/13" boundary), and the bottom dais (cols 11-20, rows 9-13 — the raised
  plaza platform entered only via the N/S stairs at (11,11)/(11,12)).
  Region-based because the same coast-grass tiles are ground level elsewhere.
- `VillageGame.jsx` `moveTo` enforces `villageCanStep` on top of
  `isWalkable`. `VILLAGE_TILES`/`tileWalkable` unchanged; every walkable cell
  stays reachable (verified by flood-fill + unit checks).

## Ongoing conventions
- Dev server: `astro dev --background`; never run `astro build` during development.
- Migrations are applied manually in the Supabase SQL editor.
- Reuse existing components/libs before creating new ones; comment new features.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

**Do not run `astro build` during development.** The user runs `bun run dev` and `astro build` (or `npx astro build`) breaks the running dev server and adds unnecessary files. Test changes by visiting `localhost:4321` instead.

## Codebase Map

Where to find each feature when you need to read or modify it.

**Routes (pages)**
- `/` — `src/pages/index.astro` → `src/components/Home.jsx` (game cards + patch notes `CHANGELOG`)
- `/pokedex` — `src/pages/pokedex.astro` → `src/components/Dex.jsx`; detail view `/pokedex/[id]` → `src/pages/pokedex/[id].astro` → `src/components/PokemonDetails.jsx`
- `/pokedle` — `src/pages/pokedle.astro` → `src/components/Pokewordle.jsx`
- `/pokedexmaster` — `src/pages/pokedexmaster.astro` → `src/components/DexMaster.jsx`
- `/pokelite` — `src/pages/pokelite.astro` → `src/components/Pokeroguelite.jsx`
- `/statsbattle` — `src/pages/statsbattle.astro` → `src/components/PokeStatsBattle.jsx`
- `/dungeon` — `src/pages/dungeon.astro` → `src/components/Dungeon.jsx` (auth → starter quiz → village → dungeon)

**Shared libs (`src/lib/`)**
- `pokedex.js` — pokedex.json loading, stat formulas (`calcStat`, `computeStats`), natures, type lookup, evolution helpers (`getEvolutionOptions`, `getBaseHp`)
- `public/abilities.json` — ability data with `effect_entries` in 9 languages (en/es/fr/de/it/ja/ko/zh-hans/zh-hant); gen 7-9 `de` entries were hand-translated in batches of 5 (source EN + official German terminology, e.g. Dondozo=Heerashai, Pecharunt=Infamomo, Booster Energy=Energiekapsel)
- `moves.js` — move data, type effectiveness (`getEffectiveness`), damage formula (`calcDamage`), STAB, EXP/level-up, wild Pokémon selection, moves at level
- `dungeon.js` — dungeon map generation (BSP), tile types, enemy movement AI, fog-of-war visibility
- `village.js` — village spawn, `NPC_POSITIONS` (mart, move changer/Hypno, Sage/Whiscash evolver, bank, storage, club, account reset, Klefki password, adventure), shop items
- `auth.js` — profile/team/auth helpers
- `supabase.js` — Supabase client
- `spriteTrim.js` + `spriteTrim.json` — per-species sprite padding boxes (generated by `scripts/build-sprite-trim.js`); `spriteImgStyle` crops the transparent margins so sprites fill their grid cell

**Dungeon gameplay (`src/components/`)**
- `DungeonGame.jsx` — main combat logic, enemy spawning (wild enemy HP/stats here), PvP damage sync, team, items, capture
- `DungeonBattle.jsx` — standalone turn-based battle screen
- `DungeonMap.jsx` — dungeon grid rendering, damage popups
- `DungeonLobby.jsx` — team selection
- `VillageGame.jsx` / `VillageMap.jsx` — village movement, NPCs (mart, move changer, etc.), gifts panel, club (rename/active/send)

**Other**
- `src/stores/language.js`, `src/stores/translations.js` — i18n
- `src/components/AuthScreen.jsx`, `StarterQuiz.jsx`, `TeamView.jsx`, `CaptureScreen.jsx`, `LanguageSelector.jsx`, `HomeButton.jsx` — shared screens/widgets
- `supabase/` — database schema/migrations

## Code Style

- **Comment and document new features.** When adding a new feature, add a brief comment explaining what it does and why, and where is used.
- **Reuse existing components.** Before creating something new, check if a matching component already exists in the project (e.g. `components/ui/`). Use it or extend it instead of duplicating.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
