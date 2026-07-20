import { useState, useEffect } from "react"

import Cell from "./Cell"
import NumberCell from "./NumberCell"
import GenerationCell from "./GenerationCell"

export default function PokedleGuess({ todayPokemon, pokemon, abilities, language }) {
  const match = (a, b) => a === b;

  const typeMatch = pokemon.types.some(type =>
    todayPokemon.types.includes(type)
  );

  const abilityMatch = pokemon.abilities.some(a =>
    todayPokemon.abilities.some(b => b.name === a.name)
  );

  const localizedAbilities = pokemon.abilities.map((ability) => {
    return abilities[ability.name]?.[language] ?? ability.name
  })

  const todayAbilities = todayPokemon.abilities.map((a) => a.name)

  return (
    <div className="grid grid-cols-7 gap-2 items-center border-b py-2">

      {/* Pokemon */}
      <div className="flex justify-center items-center gap-2">
        <img src={pokemon.sprite} className="w-20 h-20" />
      </div>

      {/* Generation */}
      <GenerationCell value={pokemon.generation} target={todayPokemon.generation} />

      {/* Types */}
      <Cell
        correct={match(
          pokemon.types.join(","),
          todayPokemon.types.join(",")
        )}
        partial={!match(
          pokemon.types.join(","),
          todayPokemon.types.join(",")
        ) && typeMatch}
      >
        {pokemon.types.join(" / ")}
      </Cell>

      {/* Abilities */}
      <Cell
        correct={
          pokemon.abilities.length === todayPokemon.abilities.length &&
          pokemon.abilities.every((a) => todayAbilities.includes(a.name))
        }
        partial={abilityMatch}
      >
        <div className="flex flex-col gap-1">
          {pokemon.abilities.map((ability) => {
            const localized =
              abilities[ability.name]?.[language] ?? ability.name;

            const matched = todayAbilities.includes(ability.name);

            return (
              <span
                key={ability.name}
                className={`rounded px-2 py-1 text-white ${
                  matched ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {localized}
              </span>
            );
          })}
        </div>
      </Cell>

      {/* Height */}
      <NumberCell
        value={pokemon.height / 10}
        target={todayPokemon.height / 10}
        unit="m"
      />

      {/* Weight */}
      <NumberCell
        value={pokemon.weight / 10}
        target={todayPokemon.weight / 10}
        unit="kg"
      />

      {/* Color */}
      <Cell correct={match(pokemon.color, todayPokemon.color)}>
        {pokemon.color}
      </Cell>

    </div>
  );
}
