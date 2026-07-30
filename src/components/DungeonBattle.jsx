import { useState, useEffect, useCallback } from "react";
import { getLanguage } from "../stores/language";
import { t, getStatLabel, getTypeName } from "../stores/translations";
import { getSpeciesName, getEffectiveness, calcDamage, getStabMultiplier, getMovesForType, getSpeciesTypes } from "../lib/moves";
import { BubbleGroup, Bubble, BubbleContent } from "../../components/ui/bubble";

function pickEnemyMoves(level) {
  const allTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
  const pool = allTypes.flatMap(t => getMovesForType(t));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
}

export default function DungeonBattle({ enemy, playerPokemon, language, onEnd, playerMoves: playerMovesProp }) {
  const [playerHp, setPlayerHp] = useState(playerPokemon.hp);
  const [playerMaxHp] = useState(playerPokemon.maxHp || 100);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [enemyMaxHp] = useState(enemy.maxHp || enemy.hp);
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleOver, setBattleOver] = useState(false);
  const [fled, setFled] = useState(false);
  const [enemyMoves] = useState(() => pickEnemyMoves(enemy.level));
  const [playerMoves] = useState(() => playerMovesProp || (() => {
    const allTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
    const pool = allTypes.flatMap(t => getMovesForType(t));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  })());

  const enemyPokemon = {
    name: getSpeciesName(enemy.pokemonId),
    types: enemy.types || ["normal"],
    level: enemy.level,
  };

  const addLog = useCallback((msg, side = null) => {
    setLog((prev) => [...prev, { text: msg, side }]);
  }, []);

  const enemyAttack = useCallback(() => {
    const move = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
    const atkStat = move.category === "physical" ? (enemy.atk || 10 + enemy.level * 3) : (enemy.spa || 10 + enemy.level * 3);
    const defStat = move.category === "physical" ? (playerPokemon.def || 8 + playerPokemon.level * 2) : (playerPokemon.spd || 8 + playerPokemon.level * 2);
    const effectiveness = getEffectiveness(move.type, playerPokemon.types || getSpeciesTypes(playerPokemon.pokemonId || 25));
    const stab = getStabMultiplier(move.type, enemy.types || getSpeciesTypes(enemy.pokemonId));
    const dmg = calcDamage(move, atkStat, defStat, effectiveness, enemy.level, stab);

    setPlayerHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next <= 0) {
        setBattleOver(true);
        addLog(`${t("Enemy used", language)} ${move.name}! ${dmg} ${t("dmg", language)}`, "enemy");
        setTimeout(() => onEnd({ result: "lost", playerHp: 0 }), 1500);
      } else {
        addLog(`${t("Enemy used", language)} ${move.name}! ${dmg} ${t("dmg", language)}`, "enemy");
      }
      return next;
    });
    setIsPlayerTurn(true);
  }, [enemy, enemyMoves, playerPokemon, language, addLog, onEnd]);

  const handleAttack = useCallback((move) => {
    if (!isPlayerTurn || battleOver) return;

    const atkStat = move.category === "physical" ? (playerPokemon.atk || 10 + playerPokemon.level * 3) : (playerPokemon.spa || 10 + playerPokemon.level * 3);
    const defStat = move.category === "physical" ? (enemy.def || 8 + enemy.level * 2) : (enemy.spd || 8 + enemy.level * 2);
    const effectiveness = getEffectiveness(move.type, enemyPokemon.types);
    const stab = getStabMultiplier(move.type, playerPokemon.types || getSpeciesTypes(playerPokemon.pokemonId || 25));
    const dmg = calcDamage(move, atkStat, defStat, effectiveness, playerPokemon.level, stab);

    let effText = "";
    if (effectiveness > 1) effText = ` ${t("Super effective!", language)}`;
    else if (effectiveness < 1 && effectiveness > 0) effText = ` ${t("Not very effective...", language)}`;
    else if (effectiveness === 0) effText = ` ${t("No effect!", language)}`;

    addLog(`${t("You used", language)} ${move.name}! ${dmg} ${t("dmg", language)}${effText}`, "player");

    setEnemyHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next <= 0) {
        setBattleOver(true);
        addLog(`${t("Enemy fainted!", language)}`, "player");
        setTimeout(() => onEnd({ result: "won", playerHp, captureChance: Math.min(0.5, Math.max(0.1, 0.15 + (playerPokemon.level - enemy.level) * 0.03)) }), 1500);
      } else {
        setIsPlayerTurn(false);
        setTimeout(enemyAttack, 800);
      }
      return next;
    });
  }, [isPlayerTurn, battleOver, playerPokemon, enemy, enemyPokemon, language, addLog, enemyAttack, onEnd, playerHp]);

  const handleRun = useCallback(() => {
    if (battleOver) return;
    const chance = 0.5 + (playerPokemon.level - enemy.level) * 0.05;
    if (Math.random() < chance) {
      setFled(true);
      setBattleOver(true);
      addLog(t("Got away safely!", language), "player");
      setTimeout(() => onEnd({ result: "fled", playerHp }), 1000);
    } else {
      addLog(t("Couldn't get away!", language), "player");
      setIsPlayerTurn(false);
      setTimeout(enemyAttack, 800);
    }
  }, [battleOver, playerPokemon, enemy, language, addLog, enemyAttack, onEnd, playerHp]);

  const playerHpPct = Math.max(0, (playerHp / playerMaxHp) * 100);
  const enemyHpPct = Math.max(0, (enemyHp / enemyMaxHp) * 100);

  const playerHpColor = playerHpPct > 50 ? "bg-green-500" : playerHpPct > 20 ? "bg-yellow-500" : "bg-red-500";
  const enemyHpColor = enemyHpPct > 50 ? "bg-green-500" : enemyHpPct > 20 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 space-y-4">
      <div className="flex justify-between items-start gap-4">
        {/* Enemy */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemy.pokemonId}.png`}
              alt=""
              className="w-16 h-16"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">
                {enemyPokemon.name} <span className="text-slate-400">Lv.{enemy.level}{enemy.nature ? ` · ${enemy.nature}` : ''}</span>
              </p>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${enemyHpColor}`} style={{ width: `${enemyHpPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{enemyHp}/{enemyMaxHp}</p>
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="flex-1 space-y-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">
                {playerPokemon.name} <span className="text-slate-400">Lv.{playerPokemon.level}{playerPokemon.nature ? ` · ${playerPokemon.nature}` : ''}</span>
              </p>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${playerHpColor}`} style={{ width: `${playerHpPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{playerHp}/{playerMaxHp}</p>
            </div>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerPokemon.spriteId || 25}.png`}
              alt=""
              className="w-16 h-16"
            />
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <BubbleGroup language={language}>
        {log.length === 0 ? (
          <Bubble variant="dungeon-enemy" align="start">
            <BubbleContent>
              <span className="font-medium">{t("Wild Pokémon appeared!", language)} ({enemyPokemon.name})</span>
            </BubbleContent>
          </Bubble>
        ) : (
          log.map((entry, i) => (
            <Bubble
              key={i}
              variant={entry.side === "player" ? "dungeon-player" : "dungeon-enemy"}
              align={entry.side === "player" ? "end" : "start"}
            >
              <BubbleContent>
                <span className="font-medium">{entry.text}</span>
              </BubbleContent>
            </Bubble>
          ))
        )}
      </BubbleGroup>

      {/* Actions */}
      {!battleOver && (
        <div className="space-y-2">
          {isPlayerTurn ? (
            <div className="grid grid-cols-2 gap-2">
              {playerMoves.map((move) => (
                <button
                  key={move.name}
                  onClick={() => handleAttack(move)}
                  className="rounded-lg bg-slate-700/60 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-600/60 transition-colors text-left"
                >
                  <span className="font-semibold">{move.name}</span>
                  <span className="text-slate-400 ml-1">({move.power})</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-slate-400 py-2">
              {t("Enemy's turn...", language)}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={!isPlayerTurn}
              className="flex-1 rounded-lg bg-slate-700/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-600/60 transition-colors disabled:opacity-40"
            >
              {t("Run", language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
