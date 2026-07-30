## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

**Do not run `astro build` during development.** The user runs `bun run dev` and `astro build` (or `npx astro build`) breaks the running dev server and adds unnecessary files. Test changes by visiting `localhost:4321` instead.

## Code Style

- **Comment and document new features.** When adding a new feature, add a brief comment explaining what it does and why, and where is used.
- **Reuse existing components.** Before creating something new, check if a matching component already exists in the project (e.g. `components/ui/`). Use it or extend it instead of duplicating.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
