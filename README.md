# PokeVisa

A multi-feature Pokémon web app with three main tools:

- **Pokedex** — Search and explore Pokémon by name, type, generation, stats, abilities, and more.
- **Pokedle** — A daily Pokémon guessing game to test your knowledge.
- **Dexmaster** — Track your progress and master the Pokédex.

Built with [Astro](https://astro.build), React, and Tailwind CSS.

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Install dependencies                             |
| `bun dev`                 | Start local dev server at `localhost:4321`        |
| `bun build`               | Build production site to `./dist/`                |
| `bun build:pokedex`       | Build the Pokédex data JSON                       |
| `bun preview`             | Preview the production build locally              |
| `bun astro ...`           | Run Astro CLI commands                            |

## Project Structure

```
/
├── public/            # Static assets (images, data)
├── src/
│   ├── components/    # React components (Dex, Pokewordle, etc.)
│   ├── layouts/       # Astro layout components
│   ├── pages/         # Route pages (index, pokedex, pokedle, pokedexmaster)
│   └── styles/        # Global CSS (Tailwind)
└── package.json
```
