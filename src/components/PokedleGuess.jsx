import Cell from "./Cell";
import NumberCell from "./NumberCell";
import GenerationCell from "./GenerationCell";
import PokeTypeBadge from "./PokeTypeBadge";
import { t } from "../stores/translations";

export default function PokedleGuess({ todayPokemon, pokemon, abilities, language }) {
  const typeMatch = pokemon.types.some((type) =>
    todayPokemon.types.includes(type)
  );

  const abilityMatch = pokemon.abilities.some((a) =>
    todayPokemon.abilities.some((b) => b.name === a.name)
  );

  const todayAbilityNames = todayPokemon.abilities.map((a) => a.name);

  return (
    <div className="grid grid-cols-7 gap-2 items-stretch rounded-lg bg-slate-800/40 p-2 border border-slate-700/50">
      <div className="flex justify-center items-center h-full">
        <img src={pokemon.sprite} alt="" className="size-14 object-contain" />
      </div>

      <GenerationCell value={pokemon.generation} target={todayPokemon.generation} />

      <Cell
        correct={
          pokemon.types.length === todayPokemon.types.length &&
          pokemon.types.every((t) => todayPokemon.types.includes(t))
        }
        partial={typeMatch}
      >
        <div className="flex flex-col items-center gap-0.5">
          {pokemon.types.map((type) => (
            <PokeTypeBadge key={type} type={type} language={language} />
          ))}
        </div>
      </Cell>

      <Cell
        correct={
          pokemon.abilities.length === todayPokemon.abilities.length &&
          pokemon.abilities.every((a) => todayAbilityNames.includes(a.name))
        }
        partial={abilityMatch}
      >
        <div className="flex flex-col gap-0.5 w-full">
          {pokemon.abilities.map((ability) => {
            const localized =
              abilities[ability.name]?.[language] ?? ability.name;
            const matched = todayAbilityNames.includes(ability.name);
            return (
              <span
                key={ability.name}
                className={`rounded px-1 py-0.5 text-[11px] font-medium leading-tight text-center ${
                  matched ? "bg-green-600/60 text-green-100" : "bg-red-600/60 text-red-100"
                }`}
              >
                {localized}
                {ability.hidden && (
                  <span className="text-[10px] opacity-60"> ({t("Hidden", language)})</span>
                )}
              </span>
            );
          })}
        </div>
      </Cell>

      <NumberCell
        value={pokemon.height / 10}
        target={todayPokemon.height / 10}
        unit="m"
      />

      <NumberCell
        value={pokemon.weight / 10}
        target={todayPokemon.weight / 10}
        unit="kg"
      />

      <Cell correct={pokemon.color === todayPokemon.color}>
        <div className="flex flex-col items-center gap-1">
          <span
            className="inline-block size-4 rounded-full ring-1 ring-slate-600"
            style={{ backgroundColor: pokemon.color }}
          />
          <span className="text-[11px] capitalize">{t(pokemon.color, language)}</span>
        </div>
      </Cell>
    </div>
  );
}
