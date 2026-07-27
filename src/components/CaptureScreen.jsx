import { useState } from "react";
import { getLanguage } from "../stores/language";
import { t } from "../stores/translations";
import { getSpeciesName, getRandomMovesForSpecies } from "../lib/moves";
import { addTeamMember, removeTeamMember } from "../lib/auth";

const SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export default function CaptureScreen({ enemy, playerLevel, team, accountId, onCapture, onDecline }) {
  const [releasing, setReleasing] = useState(null);
  const [saving, setSaving] = useState(false);
  const language = getLanguage();
  const teamFull = team.length >= 6;

  const captureChance = Math.min(
    0.5,
    Math.max(0.1, 0.15 + (playerLevel - enemy.level) * 0.03)
  );

  async function handleCapture() {
    setSaving(true);
    try {
      const moves = getRandomMovesForSpecies(enemy.pokemonId, 2);
      const level = Math.max(1, enemy.level + Math.floor(Math.random() * 5) - 2);
      const hp = 15 + level * 3;

      await addTeamMember(accountId, {
        pokemon_id: enemy.pokemonId,
        nickname: getSpeciesName(enemy.pokemonId),
        level,
        hp,
        max_hp: hp,
        moves,
        slot: team.length,
        is_starter: false,
      });

      onCapture();
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleReleaseAndCapture(memberId) {
    setSaving(true);
    try {
      await removeTeamMember(memberId);

      const moves = getRandomMovesForSpecies(enemy.pokemonId, 2);
      const level = Math.max(1, enemy.level + Math.floor(Math.random() * 5) - 2);
      const hp = 15 + level * 3;

      const newSlot = team.filter((p) => p.id !== memberId).length;

      await addTeamMember(accountId, {
        pokemon_id: enemy.pokemonId,
        nickname: getSpeciesName(enemy.pokemonId),
        level,
        hp,
        max_hp: hp,
        moves,
        slot: newSlot,
        is_starter: false,
      });

      onCapture();
    } catch (err) {
      console.error("Release and capture failed:", err);
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
      ) : teamFull ? (
        <div className="space-y-3">
          <p className="text-xs text-yellow-400">
            {t("Your team is full! Release a Pokémon to make room.", language)}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {team.map((p) => (
              <button
                key={p.id}
                onClick={() => handleReleaseAndCapture(p.id)}
                className="flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800/60 p-2 hover:border-red-500 transition-colors"
              >
                <img
                  src={`${SPRITE_URL}/${p.pokemon_id}.png`}
                  alt=""
                  className="w-10 h-10"
                />
                <p className="text-[10px] text-slate-300 truncate w-full">
                  {p.nickname || getSpeciesName(p.pokemon_id)}
                </p>
                <p className="text-[9px] text-red-400">
                  {t("Release", language)}
                </p>
              </button>
            ))}
          </div>
          <button
            onClick={onDecline}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {t("Decline", language)}
          </button>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCapture}
            className="rounded-xl bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            {t("Add to team", language)}
          </button>
          <button
            onClick={onDecline}
            className="rounded-xl bg-slate-700 px-6 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-600 transition-colors"
          >
            {t("Decline", language)}
          </button>
        </div>
      )}
    </div>
  );
}
