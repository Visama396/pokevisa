import { useState, useEffect } from "react";

import DexItem from "./DexItem";

export default function Dex() {
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    async function loadPokedex() {
      const res = await fetch("/pokedex.json");

      if (!res.ok) {
        throw new Error("Failed to load pokedex.json");
      }

      const data = await res.json();
      setPokemons(data);
      setFilteredPokemons(data);
    }

    loadPokedex();
  }, []);

  return (
    <div className="flex flex-col gap-2 p-2">
      <header>
        <input
          type="text"
          placeholder="Search..."
          className="w-full outline-0"
          onChange={(e) => {
            const query = e.target.value.toLowerCase();
            const filtered = pokemons.filter((pokemon) =>
              pokemon.name.toLowerCase().includes(query),
            );
            setFilteredPokemons(filtered);
          }}
        />
      </header>
      <section className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredPokemons.map((pokemon) => (
          <DexItem key={pokemon.id} pokemon={pokemon} />
        ))}
      </section>
    </div>
  );
}
