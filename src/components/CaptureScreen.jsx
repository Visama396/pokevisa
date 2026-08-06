import { useState } from "react";
import { useLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { getSpeciesName } from "../lib/moves";

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export default function CaptureScreen({ enemy, playerLevel, team, accountId, onCapture, onDecline }) {
  const [saving, setSaving] = useState(false);
  const language = useLanguage();
  const teamFull = team.length >= 1;

  const captureChance = Math.min(
    0.5,
    Math.max(0.1, 0.15 + (playerLevel - enemy.level) * 0.03)
  );

  async function handleCaptureToClub() {
    setSaving(true);
    try {
      onCapture();
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-4 text-center">
      <p className="text-sm text-yellow-400 font-semibold">
        {t("Oh!", language)}
      </p>

      <div className="flex items-center justify-center gap-3">
        <img
          src={`${SPRITE_URL}/${enemy.pokemonId}.png`}
          alt=""
          className="w-20 h-20"
        />
        <div>
          <p className="font-semibold text-slate-200">
            {getSpeciesName(enemy.pokemonId)}
          </p>
          <p className="text-xs text-slate-400">
            {t("Lv", language)}.{enemy.level}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-300">
        {t("wants to join your team!", language)}
      </p>

      {saving ? (
        <p className="text-xs text-slate-400">{t("Saving...", language)}</p>
      ) : (
        <div className="space-y-3">
          {teamFull && (
            <p className="text-xs text-yellow-400">
              {t("dungeon-storage-msg", language)}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCaptureToClub}
              className="rounded-xl bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
            >
              {t("dungeon-send-storage", language) || "Send to Club"}
            </button>
            <button
              onClick={onDecline}
              className="rounded-xl bg-slate-700 px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t("Decline", language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
