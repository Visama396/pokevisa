export default function PokemonDetails({ pokemon }) {
  return (
    <div>
      <h1>{pokemon.name}</h1>
      <p>{pokemon.type}</p>
    </div>
  );
}
