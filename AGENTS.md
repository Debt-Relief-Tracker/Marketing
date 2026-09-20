This is a static site built with Astro, Tailwind CSS, and TypeScript.

## Project-specific notes

- Fill this section in as the project takes shape — the "why" behind
  non-standard structure, deploy targets, or content sources belongs here so
  future changes don't accidentally undo a deliberate decision.
- Note here once decided: hosting/deploy target (Netlify, Vercel, Cloudflare
  Pages, static export elsewhere), whether content comes from local
  Markdown/MDX via Content Collections or a headless CMS, and whether any
  pages need `output: "server"`/hybrid rendering or if the whole site is
  fully static (`output: "static"`, the default).

## Claude guidelines

### Subagents v1.0

Spawn subagents to isolate context, parallelize independent work, or offload bulk mechanical tasks. Don't spawn when the parent needs the reasoning, when synthesis requires holding things together, or when spawn overhead dominates.

Pick the cheapest model that can do the subtask well:

- Haiku: bulk mechanical work, no judgment
- Sonnet: scoped research, code exploration, in-scope synthesis
- Opus: subtasks needing real planning or tradeoffs

If a subagent realizes it needs a higher tier than itself, return to the parent.

Parent owns final output and cross-spawn synthesis. User instructions override.

## Reuse guidelines

- Before adding a new component, check `src/components/` for an existing one
  that does the job (or is close enough to extend with a prop) before
  creating a parallel version.
- Before adding a new layout, check `src/layouts/` — most pages should
  compose an existing layout (e.g. `BaseLayout.astro`) rather than
  hand-rolling `<html>`/`<head>` again.
- Before writing a new utility function, check `src/utils/` (or `src/lib/`)
  for existing helpers — date formatting, slugify, reading-time calculation,
  etc. are easy to accidentally duplicate.
- Before adding a new Tailwind color, spacing value, or font size, check
  `tailwind.config.ts`'s `theme.extend` first — extend the design tokens
  there rather than reaching for arbitrary values (`w-[423px]`) in markup.
- Before adding a new content type, check `src/content/config.ts` — extend
  an existing collection schema before standing up a new collection if the
  shape is similar enough.

## Project guidelines

- This is a **static site** — default to zero client-side JavaScript. Every
  `<script>` or interactive island should be a deliberate choice, not a
  default.
- Use Astro's **Islands Architecture** for interactivity: isolate
  interactive pieces into framework components (or vanilla `<script>` in
  `.astro` files) and hydrate them with the least aggressive directive that
  works — prefer `client:visible` or `client:idle` over `client:load`, and
  reach for `client:load` only when something must be interactive
  immediately (e.g. above-the-fold nav toggle).
- Prefer plain `.astro` components for anything that doesn't need
  client-side state or interactivity — they ship no JS by default.
- Use **Content Collections** (`src/content/config.ts` + `src/content/`)
  for structured Markdown/MDX content (blog posts, docs pages, etc.) instead
  of ad hoc frontmatter parsing. Define a Zod schema per collection so
  content is type-checked at build time.
- Use `astro:assets` (`<Image />`, `<Picture />`) for images instead of raw
  `<img>` tags — it handles optimization, lazy loading, and width/height
  inference automatically.
- Fetch external data in the component frontmatter (the `---` fence) at
  build time wherever possible, not in a client-side `useEffect`/`onMount` —
  this is a static site, so data should be baked in at build unless there's
  a specific reason it can't be.

### Astro guidelines

- Component frontmatter (the code between `---` fences) runs at build time
  (or request time in SSR routes) — never assume it runs in the browser.
- Props are typed via an exported `Props` interface/type at the top of the
  frontmatter:

      ---
      interface Props {
        title: string;
        description?: string;
      }
      const { title, description } = Astro.props;
      ---

- Use `<slot />` for children content, and named slots (`<slot name="foo" />`
  / `<Fragment slot="foo">`) for multiple insertion points — don't invent a
  `children` prop pattern from React habits.
- Routing is file-based under `src/pages/`. Dynamic routes use `[param]` or
  `[...rest]` file names and **must** export `getStaticPaths()` for static
  output — don't add a route without one unless the page is intentionally
  SSR.
- Keep framework components (React/Vue/Svelte/etc., if any are used) out of
  `.astro` files unless they need client-side interactivity. If the whole
  site can be done in `.astro` + vanilla `<script>`, prefer that — don't
  introduce a UI framework dependency just for static markup.
- Environment variables go through `astro:env` or `import.meta.env`, prefixed
  `PUBLIC_` only if they truly need to reach the client bundle. Never prefix
  a secret with `PUBLIC_`.
- Don't use `<script>` tags to inline large logic — put substantial
  client-side code in a `.ts` file under `src/scripts/` (or colocated with
  its component) and import it, so it's type-checked and lintable.

### Tailwind guidelines

- Configure design tokens (colors, spacing, fonts, breakpoints) in
  `tailwind.config.ts` under `theme.extend` — don't override `theme`
  wholesale unless intentionally dropping Tailwind's defaults.
- Avoid arbitrary-value utilities (`top-[117px]`, `text-[#3b3b3b]`) for
  anything that recurs more than once — promote it to a token in the config
  instead.
- Prefer composing utility classes directly in markup over reaching for
  `@apply` in a CSS file; reserve `@apply` for a handful of genuinely
  repeated, non-componentizable patterns (e.g. a `.prose`-style content
  block), not as a default styling strategy.
- Use the `class:list` directive (or the `clsx`/`cva` pattern) for
  conditional classes in `.astro` files rather than manual string
  concatenation:

      <div class:list={["card", { "card--active": isActive }]}>

- Keep responsive/state variants readable — prefer a small number of
  breakpoints applied consistently (`sm:` `md:` `lg:`) over stacking many
  variants on one element; if a class list gets unwieldy, that's a signal to
  extract a component, not to add `@apply`.
- Dark mode (if used): decide once whether it's `class`-based or
  `media`-based in `tailwind.config.ts` and stick to it — don't mix
  strategies across components.

### TypeScript guidelines

- `strict: true` stays on in `tsconfig.json` (Astro's `strict` or `strictest`
  base config) — don't loosen it to silence errors; fix the type instead.
- Never use `any` as an escape hatch — use `unknown` and narrow, or define
  the actual shape. If a third-party type is genuinely unavailable, isolate
  the `any` to a single well-commented boundary, not scattered through
  business logic.
- Use `import type { Foo } from "./foo"` (or inline `import { type Foo }`)
  for type-only imports so they're erased from the build output cleanly.
- Prefer `interface` for object shapes that might be extended (component
  Props, content collection entries) and `type` for unions, intersections,
  and utility-type compositions.
- Co-locate shared types in `src/types/` (or `src/env.d.ts` for ambient/
  global types) rather than redefining the same shape in multiple
  components.
- Content Collection schemas (Zod, in `src/content/config.ts`) are the
  source of truth for content-derived types — don't hand-write a parallel
  `interface BlogPost` that can drift from the schema; use
  `CollectionEntry<"blog">` instead.

### Testing

- Fill in once a testing approach is chosen. Common pairing for this stack:
  **Vitest** for unit-testing utilities/components in isolation, and
  **Playwright** for end-to-end checks against the built site
  (`astro build` + `astro preview`, then run Playwright against that).
- Favor testing rendered output and user-visible behavior over
  implementation details, same principle as with any UI framework.
