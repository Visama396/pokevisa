import { useState, useEffect } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";
import { useIsMobile } from "../lib/useIsMobile";
import LanguageSelector from "./LanguageSelector";

const GAMES = [
  {
    href: "/pokedex",
    img: "/pokedex.png",
    emoji: null,
    titleKey: "Pokedex",
    descKey: "Search and explore Pokemon by name, type, generation, stats, and more",
    color: "red",
  },
  {
    href: "/pokedle",
    img: null,
    emoji: "🎯",
    titleKey: "Pokedle",
    descKey: "Daily Pokemon guessing game — test your knowledge",
    color: "yellow",
  },
  {
    href: "/pokedexmaster",
    img: null,
    emoji: "⏱️",
    titleKey: "Dexmaster",
    descKey: "Track your progress and master the Pokedex",
    color: "blue",
  },
  {
    href: "/pokelite",
    img: null,
    emoji: "⚔️",
    titleKey: "Pokéroguelite",
    descKey: "Team-based roguelite with Slay the Spire-style map progression",
    color: "green",
  },
  {
    href: "/statsbattle",
    img: null,
    emoji: "📊",
    titleKey: "Stats Battle",
    descKey: "Compare Pokemon stats and prove your knowledge",
    color: "orange",
  },
  {
    href: "/dungeon",
    img: null,
    emoji: "🏰",
    titleKey: "Dungeon Crawler",
    descKey: "Multiplayer dungeon exploration with friends",
    color: "purple",
  },
  {
    href: "/pokeslots",
    img: null,
    emoji: "🎰",
    titleKey: "PokéSlots",
    descKey: "CloverPit-style slot machine — beat your debt to Team Rocket",
    color: "pink",
  },
];

const COLOR_MAP = {
  red: "hover:border-red-500 hover:shadow-red-500/10 group-hover:text-red-400",
  yellow: "hover:border-yellow-500 hover:shadow-yellow-500/10 group-hover:text-yellow-400",
  blue: "hover:border-blue-500 hover:shadow-blue-500/10 group-hover:text-blue-400",
  green: "hover:border-green-500 hover:shadow-green-500/10 group-hover:text-green-400",
  orange: "hover:border-orange-500 hover:shadow-orange-500/10 group-hover:text-orange-400",
  purple: "hover:border-purple-500 hover:shadow-purple-500/10 group-hover:text-purple-400",
  pink: "hover:border-pink-500 hover:shadow-pink-500/10 group-hover:text-pink-400",
};

const CHANGELOG = [
  {
    date: "2026-08-24",
    title: "PokéSlots rework",
    items: [
      "Every round starts with a choice: buy 3 pulls (cheap, fatter tickets) or 7 pulls",
      "Quotas now start at 100₽ and climb forever — clear the whole 5000₽ debt to escape",
      "Finish a quota early to bank your spare pulls as tickets and dodge interest",
      "Symbols are now named after the Pokémon themselves (Exeggcute, Cherubi...)",
    ],
  },
  {
    date: "2026-08-24",
    title: "PokéSlots",
    items: [
      "New CloverPit-inspired slot machine: 7 Pokémon symbols, 11 patterns, jackpots",
      "Beat the quota every round or pay 8% interest on what you owe",
      "Spend tickets in the Rotom Phone shop on charms and permanent upgrades",
      "Clear the whole debt to escape the basement",
    ],
  },
  {
    date: "2026-08-13",
    title: "Move sorting fix",
    items: [
      "All active sort buttons now apply at once",
      "Sort buttons now show ascending/descending lists",
    ],
  },
  {
    date: "2026-08-13",
    title: "Saved language fix",
    items: [
      "The game now always opens in the language you saved, instead of showing English until you picked it again",
    ],
  },
  {
    date: "2026-08-13",
    title: "Dexmaster auto-enter",
    items: [
      "Full Pokémon names are entered automatically as you type them — no need to press Enter",
      "English names always work, plus the names in your app language",
    ],
  },
  {
    date: "2026-08-11",
    title: "Pokédex moves QoL",
    items: [
      "Moves can now be sorted by several criteria at once (type, power, level or A-Z)",
      "New Move Searcher on the Pokémon details page: type a move to see instantly how that Pokémon learns it",
    ],
  },
  {
    date: "2026-08-02",
    title: "MMO-style progression & dungeon polish",
    items: [
      "Leveling now works like an MMO — a few EXP at low levels, millions at high ones",
      "Tougher and higher-level enemies give more EXP",
      "You can no longer slip between two walls diagonally, and neither can wild Pokémon",
      "The items bag in the dungeon is always open",
      "Moves now use their real accuracy — a miss costs your turn",
      "Fainting in the dungeon is costly: you lose your carried gold and items (your bank and caught Pokémon are safe)",
    ],
  },
  {
    date: "2026-08-02",
    title: "Village upgrades: gifts, evolutions & a new NPC",
    items: [
      "Added Klefki to change your password, and Account Reset at Xatu",
      "Rename your Pokémon from Club Wigglytuff",
      "Sage (Whiscash) helps Pokémon evolve — by level or with an evolution stone",
      "Send items, gold, or club Pokémon to friends as gifts (accept or decline)",
      "The Move Changer tutor is now Hypno",
      "All village UI is now translated into 9 languages",
    ],
  },
  {
    date: "2026-07-31",
    title: "Dungeon modes: solo, invade & play with a friend",
    items: [
      "The adventure NPC now offers three ways to play: Go to a dungeon, Invade a dungeon, or Play with a friend",
      "Each player explores their own dungeon",
      "Invaders can fight everyone; the host and friends play cooperatively",
      "Leaving a dungeon as a guest only removes yourself",
    ],
  },
  {
    date: "2026-07-31",
    title: "Dungeon multiplayer fixes",
    items: [
      "Fixed wild Pokémon HP not matching their base stats",
      "Players who close the tab are now removed from the lobby",
    ],
  },
  {
    date: "2026-07-31",
    title: "Dungeon wild Pokémon HP fix",
    items: [
      "Fixed wild Pokémon HP not matching their base stats",
    ],
  },
  {
    date: "2026-07-30",
    title: "Search improvements + code cleanup",
    items: [
      "Pokedex search supports translated type names ('fuego' finds Fire Pokémon)",
      "Pokedex search is accent-insensitive",
      "Pokedex search supports multi-filtering with commas",
      "PokéWordle classic mode now shows yesterday's Pokémon",
      "Added language selector to the Home page",
      "Game card titles and descriptions are now translated",
      "Pokéroguelite now uses the real stat formula",
    ],
  },
  {
    date: "2026-07-30",
    title: "Community Center + Village",
    items: [
      "Replaced the lobby with a shared village map where players can move freely and see each other in real-time",
      "Added NPCs: Poké Mart, Move Changer, Name Rater, Adventure Explorer",
      "Rooms start in village mode — no room codes needed",
      "Dungeons return to the village on completion",
      "Fixed PvP attacks dealing no damage",
      "Fixed wild Pokémon walking through players",
      "Turn-based combat fully synchronized across all players",
    ],
  },
  {
    date: "2026-07-29",
    title: "Pokedex overhaul + account system",
    items: [
      "Pokedex now uses the true stat formula from the games",
      "All 9 generations of Pokémon added",
      "Added evolution display (trade, stones, etc.)",
      "Account system with registration, login, and team management",
      "Starter Pokémon selection quiz for new players",
      "Gold and inventory system with item rewards from dungeons",
      "Multiple language support (9 languages)",
    ],
  },
  {
    date: "2026-07-28",
    title: "Dungeon Crawler turn-based combat",
    items: [
      "Turn-based multiplayer combat",
      "Enemy movement AI chases nearest visible player",
      "Real-time player position sync",
      "Fog of war visibility",
      "Treasure chests and gold coins on dungeon floors",
      "Staircase progression with safe exit or continue deeper",
      "Wild Pokémon capture on defeat (chance-based)",
      "Battle log with damage numbers and effectiveness text",
    ],
  },
  {
    date: "2026-07-27",
    title: "Pokedle — daily guessing game",
    items: [
      "Classic mode: guess the daily Pokémon with feedback",
      "Arcade mode: unlimited streak-based guessing",
      "Game state saved locally between sessions",
      "Added evolution stage column to help narrow guesses",
    ],
  },
  {
    date: "2026-07-26",
    title: "Dexmaster + Pokéroguelite",
    items: [
      "Dexmaster progress tracker with generation filters",
      "Added hint system for hard-to-find Pokémon",
      "Pokéroguelite mode: Slay the Spire-style map with encounters, trainers, items, and move upgrades",
      "Team-based roguelite progression with randomized nodes",
      "Stats Battle: compare two Pokémon and prove your knowledge",
    ],
  },
  {
    date: "2026-07-25",
    title: "Stats Battle + UI polish",
    items: [
      "Stats Battle game mode added",
      "Improved bubble colors for better readability",
      "UI fixes across Pokedex and Pokedle",
      "Pokedle classic mode state persistence fixed",
    ],
  },
];

export default function Home() {
  const [language, setLanguage] = useState(getLanguage());
  const [showChangelog, setShowChangelog] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => subscribe(setLanguage), []);

  return (
    <div className="flex flex-col items-center min-h-[80vh] gap-12 px-4 py-12">
      <div className="relative w-full max-w-4xl flex items-start justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">Pokédex</h1>
          <p className="text-xl text-slate-400">{t("Enjoy Pokémon in different ways", language)}</p>
        </div>
        <div className="absolute right-0 top-0">
          <LanguageSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {GAMES.map((game) => {
          const hoverColor = COLOR_MAP[game.color];
          return (
            <a
              key={game.href}
              href={game.href}
              className={`group flex flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-8 text-center transition-all duration-300 ${hoverColor} hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1`}
            >
              {game.img ? (
                <img src={game.img} alt={game.titleKey} className="h-12 w-auto" />
              ) : (
                <span className="text-5xl">{game.emoji}</span>
              )}
              <span className={`text-2xl font-semibold transition-colors ${hoverColor.split(" ").pop()}`}>
                {t(game.titleKey, language)}
              </span>
              <span className="text-sm text-slate-400">{t(game.descKey, language)}</span>
              {isMobile && game.href === "/dungeon" && (
                <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-[10px] text-amber-400">
                  {t("dungeon-mobile-warning", language)}
                </span>
              )}
            </a>
          );
        })}
      </div>

      <div className="w-full max-w-4xl">
        <button
          onClick={() => setShowChangelog((v) => !v)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mx-auto"
        >
          <span className={`transition-transform ${showChangelog ? "rotate-90" : ""}`}>▸</span>
          {t("Patch Notes", language)}
        </button>

        {showChangelog && (
          <div className="mt-4 space-y-4">
            {CHANGELOG.map((entry) => (
              <div
                key={entry.date}
                className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">{entry.title}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{entry.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-slate-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
