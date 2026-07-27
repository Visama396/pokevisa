import { useState, useEffect, useCallback } from "react";
import { getLanguage } from "../stores/language";
import { t, getStatLabel, getTypeName } from "../stores/translations";
import { getSpeciesName } from "../lib/moves";
import { BubbleGroup, Bubble, BubbleContent } from "../../components/ui/bubble";

// Minimal local copy of moves we need for the MVP
const MOVE_LIST = [
  { name: "tackle", type: "normal", category: "physical", power: 40, accuracy: 100 },
  { name: "scratch", type: "normal", category: "physical", power: 40, accuracy: 100 },
  { name: "ember", type: "fire", category: "special", power: 40, accuracy: 100 },
  { name: "water-gun", type: "water", category: "special", power: 40, accuracy: 100 },
  { name: "vine-whip", type: "grass", category: "physical", power: 45, accuracy: 100 },
  { name: "thunder-shock", type: "electric", category: "special", power: 40, accuracy: 100 },
  { name: "bite", type: "dark", category: "physical", power: 60, accuracy: 100 },
  { name: "confusion", type: "psychic", category: "special", power: 50, accuracy: 100 },
  { name: "wing-attack", type: "flying", category: "physical", power: 60, accuracy: 100 },
  { name: "rock-throw", type: "rock", category: "physical", power: 50, accuracy: 90 },
  { name: "aurora-beam", type: "ice", category: "special", power: 65, accuracy: 100 },
  { name: "sludge", type: "poison", category: "physical", power: 65, accuracy: 100 },
  { name: "dig", type: "ground", category: "physical", power: 80, accuracy: 100 },
  { name: "dragon-rage", type: "dragon", category: "special", power: 60, accuracy: 100 },
  { name: "shadow-ball", type: "ghost", category: "special", power: 80, accuracy: 100 },
  { name: "iron-tail", type: "steel", category: "physical", power: 100, accuracy: 75 },
  { name: "dazzling-gleam", type: "fairy", category: "special", power: 80, accuracy: 100 },
  { name: "crunch", type: "dark", category: "physical", power: 80, accuracy: 100 },
];

const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

function getEffectiveness(moveType, defenderTypes) {
  let mult = 1;
  for (const defType of defenderTypes) {
    const chart = TYPE_CHART[moveType];
    if (chart && chart[defType] !== undefined) {
      mult *= chart[defType];
    }
  }
  return mult;
}

function calcDamage(power, atk, def, effectiveness, level = 5) {
  if (power === 0) return 0;
  const base = ((2 * level / 5 + 2) * power * (atk / Math.max(def, 1))) / 50 + 2;
  const stab = 1.25;
  const random = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor(base * stab * effectiveness * random));
}

function pickEnemyMoves(level) {
  const shuffled = [...MOVE_LIST].sort(() => Math.random() - 0.5);
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
    const shuffled = [...MOVE_LIST].sort(() => Math.random() - 0.5);
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
    const atk = 10 + enemy.level * 3;
    const def = 8 + playerPokemon.level * 2;
    const effectiveness = getEffectiveness(move.type, playerPokemon.types || ["normal"]);
    const dmg = calcDamage(move.power, atk, def, effectiveness, enemy.level);

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

    const atk = 10 + playerPokemon.level * 3;
    const def = 8 + enemy.level * 2;
    const effectiveness = getEffectiveness(move.type, enemyPokemon.types);
    const dmg = calcDamage(move.power, atk, def, effectiveness, playerPokemon.level);

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
                {enemyPokemon.name} <span className="text-slate-400">Lv.{enemy.level}</span>
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
                {playerPokemon.name} <span className="text-slate-400">Lv.{playerPokemon.level}</span>
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
