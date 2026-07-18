export default function PokedleGuess({ todayPokemon, pokemon }) {
  // Show information about the guessed pokemon: generation, types, abilities, height, weight
  return (
    <div className="flex gap-1">
      <div>
        <p>Generation</p>
        <p>{pokemon.generation}</p>
      </div>
      <div>
        <p></p>
        <p></p>
      </div>
    </div>
  )
}
