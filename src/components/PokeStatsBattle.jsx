import { useState, useEffect } from "react"

export default function PokeStatsBattle() {
  const [pokemons, setPokemons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPokedex() {
      const res = await fetch("/pokedex.json");

      if (!res.ok) {
        throw new Error("Failed to load pokedex.json");
      }

      const data = await res.json();
      setPokemons(data);
      setLoading(false);
    }

    loadPokedex();
  }, [])
  return (
    <div>
      <h1>Stats Battle</h1>
    </div>
  )
}
