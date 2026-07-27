import { useState } from "react";
import { getLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { getSpeciesName } from "../lib/moves";
import { updateTeamMember, removeTeamMember } from "../lib/auth";

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export default function TeamView({ team, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [nickname, setNickname] = useState("");
  const language = getLanguage();

  async function handleRename(id) {
    if (!nickname.trim()) return;
    await updateTeamMember(id, { nickname: nickname.trim() });
    setEditing(null);
    onUpdate();
  }

  async function handleRelease(id) {
    await removeTeamMember(id);
    onUpdate();
  }

  if (team.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        {t("No Pokémon yet. Complete the quiz to get your starter!", language)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {team.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <img
              src={`${SPRITE_URL}/${p.pokemon_id}.png`}
              alt=""
              className="w-12 h-12"
            />
            <div className="flex-1 min-w-0">
              {editing === p.id ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(p.id)}
                    className="w-full rounded border border-slate-600 bg-slate-800 px-1 py-0.5 text-xs text-slate-200 outline-none"
                    autoFocus
                  />
                </div>
              ) : (
                <p
                  className="text-xs font-semibold text-slate-200 truncate cursor-pointer hover:text-yellow-400"
                  onClick={() => { setEditing(p.id); setNickname(p.nickname || getSpeciesName(p.pokemon_id)); }}
                  title={t("Click to rename", language)}
                >
                  {p.nickname || getSpeciesName(p.pokemon_id)}
                </p>
              )}
              <p className="text-[10px] text-slate-400">Lv.{p.level}</p>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.max(0, (p.hp / p.max_hp) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            HP: {p.hp}/{p.max_hp}
          </p>

          <div className="flex gap-1">
            <button
              onClick={() => { setEditing(p.id); setNickname(p.nickname || getSpeciesName(p.pokemon_id)); }}
              className="flex-1 rounded text-[10px] text-slate-400 hover:text-slate-200 py-0.5 transition-colors"
            >
              {t("Rename", language)}
            </button>
            {!p.is_starter && (
              <button
                onClick={() => handleRelease(p.id)}
                className="flex-1 rounded text-[10px] text-red-400 hover:text-red-300 py-0.5 transition-colors"
              >
                {t("Release", language)}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
