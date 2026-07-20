import { useState, useEffect } from "react";

import { randomEntryNumber } from "../utils/randomEntryNumber";
import { normalize } from "../utils/normalize";

import PokedleGuess from "./PokedleGuess";

export default function Pokewordle() {
  const [pokemons, setPokemons] = useState([])
  const [todayPokemon, setTodayPokemon] = useState(null)
  const [guess, setGuess] = useState("")
  const [guesses, setGuesses] = useState([])
  const [correct, setCorrect] = useState(false)

  // Get pokemons from fetch /pokedex.json
  useEffect(() => {
    fetch("/pokedex.json")
      .then((res) => res.json())
      .then((data) => {
        setPokemons(data)
        const num = randomEntryNumber()
        setTodayPokemon(data[num])
        console.log(data[num])
      })
  }, [])

  const submitGuess = () => {
    if (!guess || guess == "") return
    const normalizedGuess = normalize(guess);

    const pokemon = pokemons.find((p) =>
      Object.values(p.names).some(
        (name) => normalize(name) === normalizedGuess
      )
    );

    if (pokemon) {
      setGuesses([...guesses, pokemon])
    }
    if (todayPokemon.slug.toLowerCase() === normalizedGuess.toLowerCase()) {
      setCorrect(true)
    }
    setGuess("")
    console.log(guesses)
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <header>
        <h1 className="text-2xl">Guess Today´s Pokemon</h1>
        {correct && <h2>Correct! The Pokemon was {todayPokemon.name}</h2>}
      </header>
      <section className="flex gap-2">
        <form onSubmit={(e) => { e.preventDefault(); submitGuess(); }}>
          <input type="text" placeholder="Enter your guess" className="outline-0" value={guess} onChange={(e) => setGuess(e.target.value)} />
        </form>
      </section>
      <section>
        <div className="grid grid-cols-7 gap-2 font-bold text-center mb-2">
          <div>Pokémon</div>
          <div>Generation</div>
          <div>Types</div>
          <div>Abilities</div>
          <div>Height</div>
          <div>Weight</div>
          <div>Color</div>
        </div>
        {guesses.map((guess, index) => (
          <PokedleGuess key={index} todayPokemon={todayPokemon} pokemon={guess} />
        ))}
      </section>
    </div>
  );
}
