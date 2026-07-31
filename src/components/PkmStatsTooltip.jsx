import { useEffect, useState } from "react";
import { TooltipContent } from "../../components/ui/tooltip";
import SpriteImg from "./SpriteImg";
import { getSpeciesName, getMoveName, ensureMovesData } from "../lib/moves";
import { computeStats } from "../lib/pokedex";
import { getLanguage } from "../stores/language";

// Hover tooltip for a party badge (below the village grid). Shows the
// Pokémon's real stats — computed from pokedex base stats, level, and nature —
// plus its known moves. Used together with the shared Tooltip component.
export default function PkmStatsTooltip({ pkm }) {
  const [stats, setStats] = useState(null);
  const language = getLanguage();
  const id = pkm.pokemonId || pkm.pokemon_id || 25;
  const level = pkm.level || 5;
  // Camp Pokémon stored without a nature default to neutral instead of a random pick.
  const nature = pkm.nature && pkm.nature !== "_" ? pkm.nature : "hardy";

  useEffect(() => {
    let alive = true;
    computeStats(id, level, nature)
      .then((s) => { if (alive) setStats(s); })
      .catch(() => {});
    // Warm the localized move-name cache used by getMoveName.
    ensureMovesData();
    return () => { alive = false; };
  }, [id, level, nature]);

  return (
    <TooltipContent
      side="top"
      sideOffset={8}
      className="w-60 flex-col items-stretch gap-0 rounded-xl border border-stone-600 bg-stone-900/95 p-0 text-stone-100 shadow-lg"
    >
      <div className="flex items-center gap-2 border-b border-stone-700 p-2.5">
        <SpriteImg id={id} size={36} />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{pkm.nickname || getSpeciesName(id)}</p>
          <p className="text-[10px] text-stone-400">
            Lv.{level}
            {stats?.types?.length ? ` · ${stats.types.join("/")}` : ""}
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 p-2.5 text-[10px] text-stone-300">
          <span>HP {stats.hp}</span>
          <span>Atk {stats.atk}</span>
          <span>Def {stats.def}</span>
          <span>SpA {stats.spa}</span>
          <span>SpD {stats.spd}</span>
          <span>Spe {stats.spe}</span>
        </div>
      )}

      <div className="space-y-1 border-t border-stone-700 p-2.5">
        <p className="text-[9px] uppercase tracking-wide text-stone-500">Moves</p>
        {(pkm.moves || []).slice(0, 4).map((move, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-stone-300">
            <span className="rounded bg-stone-700/60 px-1 py-[1px] text-[8px] uppercase text-stone-400">
              {move.type || "normal"}
            </span>
            <span className="truncate">{getMoveName(move, language)}</span>
            <span className="ml-auto text-stone-400">{move.power > 0 ? move.power : "—"}</span>
          </div>
        ))}
        {(pkm.moves || []).length === 0 && (
          <p className="text-[10px] text-stone-500">No moves</p>
        )}
      </div>
    </TooltipContent>
  );
}
