import { useState, useEffect } from "react";

import { randomEntryNumber } from "../utils/randomEntryNumber";

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
    const normalizedGuess = guess.toLowerCase()
    const pokemon = pokemons.find((p) => p.name.toLowerCase() === normalizedGuess)
    if (pokemon) {
      setGuesses([...guesses, pokemon])
    }
    if (todayPokemon.name.toLowerCase() === normalizedGuess) {
      setCorrect(true)
    }
    setGuess("")
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <header>
        <h1 className="text-2xl">Guess Today´s Pokemon</h1>
        {correct && <h2>Correct! The Pokemon was {todayPokemon.name}</h2>}
      </header>
      <section className="flex gap-2">
        <input type="text" placeholder="Enter your guess" className="outline-0" value={guess} onChange={(e) => setGuess(e.target.value)} />
        <input type="submit" value="Guess" className="bg-slate-700 px-2 py-1 rounded-sm" onClick={() => submitGuess()}/>
      </section>
      <section>
        {guesses.map((guess, index) => (
          <PokedleGuess key={index} todayPokemon={todayPokemon} pokemon={guess} />
        ))}
      </section>
    </div>
  );
}
