import { useState, useEffect } from "react";
import { getLanguage, subscribe } from "../stores/language";
import { t } from "../stores/translations";
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
];

const COLOR_MAP = {
  red: "hover:border-red-500 hover:shadow-red-500/10 group-hover:text-red-400",
  yellow: "hover:border-yellow-500 hover:shadow-yellow-500/10 group-hover:text-yellow-400",
  blue: "hover:border-blue-500 hover:shadow-blue-500/10 group-hover:text-blue-400",
  green: "hover:border-green-500 hover:shadow-green-500/10 group-hover:text-green-400",
  orange: "hover:border-orange-500 hover:shadow-orange-500/10 group-hover:text-orange-400",
  purple: "hover:border-purple-500 hover:shadow-purple-500/10 group-hover:text-purple-400",
};

const CHANGELOG = [
  {
    date: "2026-07-31",
    title: "Dungeon modes: solo, invade & play with a friend",
    items: [
      "The adventure NPC now offers three ways to play: Go to a dungeon (host your own solo run), Invade a dungeon (join a random active dungeon as an invader), and Play with a friend (join by code)",
      "Each player explores their own dungeon — other village players are no longer dragged along",
      "PvP rules: invaders can attack and be attacked by everyone, while the host and friends who joined by code play cooperatively and can't hurt each other",
      "Leaving a dungeon as a guest only removes yourself — the host's run keeps going",
    ],
  },
  {
    date: "2026-07-31",
    title: "Dungeon multiplayer fixes",
    items: [
      "Fixed wild Pokémon HP not matching their base stats — enemies now use the real stat formula (a level 3 Popplio no longer survives 5 scratches from a level 5 Charmander)",
      "Players who close the tab now get removed from the lobby, so disconnected players no longer get sent to the dungeon and block everyone's turns",
    ],
  },
  {
    date: "2026-07-31",
    title: "Dungeon wild Pokémon HP fix",
    items: [
      "Fixed wild Pokémon HP not matching their base stats — enemies now use the real stat formula (a level 3 Popplio no longer survives 5 scratches from a level 5 Charmander)",
    ],
  },
  {
    date: "2026-07-30",
    title: "Search improvements + code cleanup",
    items: [
      "Pokedex search now supports translated type names (search 'fuego' for Fire Pokémon)",
      "Pokedex search is accent-insensitive ('psiquico' matches Psíquico type)",
      "Pokedex search supports multi-filtering with commas ('char,venu,emp' shows all matching)",
      "Removed 'Showing X of Y Pokémon' counter from Pokedex search results",
      "PokéWordle classic mode now shows yesterday's Pokémon below the guess counter",
      "Added language selector to the Home page",
      "Game card titles and descriptions are now translated",
      "Pokéroguelite now uses the real Pokémon stat formula (neutral natures)",
      "Consolidated duplicate translation entries",
      "Extracted reusable HomeButton component used across all game screens",
      "Added documentation comments to shared utilities",
    ],
  },
  {
    date: "2026-07-30",
    title: "Community Center + Village",
    items: [
      "Replaced the button-based lobby with a shared village map where players can move freely and see each other in real-time",
      "Added NPCs: Poké Mart (buy/use items), Move Changer (swap moves), Name Rater (rename Pokémon), Adventure Explorer (start dungeon)",
      "Rooms now start in lobby/village mode — auto-create or auto-join on connect, no room codes needed",
      "Dungeon returns to village on completion",
      "Fixed PvP attacks dealing no damage — player-vs-player damage calculation now works",
      "Fixed wild Pokémon walking through player tiles instead of stopping adjacent to attack",
      "Turn-based combat fully synchronized across all players",
    ],
  },
  {
    date: "2026-07-29",
    title: "Pokedex overhaul + account system",
    items: [
      "Pokedex now uses the true stat formula from the games (IVs, EVs, nature)",
      "All 9 generations of Pokémon added with updated movesets and abilities",
      "Added conditional evolution display (trade evolutions, stone evos, etc.)",
      "Account system with registration, login, and team management",
      "Starter Pokémon selection quiz for new players",
      "Gold and inventory system with item rewards from dungeons",
      "Fixed Pokedex search edge cases and Pokémon detail view",
      "Added language selector to all game screens",
      "Multiple language support (English, Spanish, French, German, Italian, Japanese, Korean, Chinese)",
    ],
  },
  {
    date: "2026-07-28",
    title: "Dungeon Crawler turn-based combat",
    items: [
      "Turn-based multiplayer combat system with player/enemy turn coordination",
      "Enemy movement AI chases nearest visible player",
      "Real-time player position sync via Supabase Realtime",
      "Fog of war with raycasting visibility per player",
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
