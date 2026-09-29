# Debt Relief Tracker — Marketing Site

Marketing site for [Debt Relief Tracker](https://github.com/Debt-Relief-Tracker/Tracker), built
with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed statically
to Cloudflare Pages.

- Hosted app: <https://app.debtrelief.win>
- Tool source code: <https://github.com/Debt-Relief-Tracker/Tracker>

## Project structure

```text
src/
├── components/   # Header, Footer, Hero, FeatureCard, CTAButton
├── layouts/      # BaseLayout.astro — <head>, SEO tags, Header/Footer
├── lib/          # site.ts (shared constants), github.ts (reads committed Tracker activity data)
├── content/      # resources/<type>/<slug>.md — one Markdown file per article
├── pages/        # index, features, open-source, donate, changelog, resources
└── styles/       # global.css — Tailwind v4 import + theme tokens
docs/
└── resources-authoring.md  # how to add a Resources article (agents + humans)
```

## Commands

| Command             | Action                                     |
| :------------------ | :----------------------------------------- |
| `pnpm install`      | Install dependencies                       |
| `pnpm dev`          | Start local dev server at `localhost:4321` |
| `pnpm build`        | Build the static site to `./dist/`         |
| `pnpm preview`      | Preview the production build locally       |
| `pnpm check`        | Run `astro check` (type-checking)          |
| `pnpm lint`         | Run ESLint                                 |
| `pnpm lint:fix`     | Run ESLint with autofix                    |
| `pnpm format`       | Format the codebase with Prettier          |
| `pnpm format:check` | Check formatting without writing changes   |

## Changelog page

`/changelog` is built from `src/data/tracker-activity.json` (see
[`src/lib/github.ts`](src/lib/github.ts)), which the `release-watch.yml` workflow keeps up to date
with the Tracker repo's releases and recent commits. The build itself makes no GitHub API calls
(unauthenticated calls from Cloudflare's shared build IPs hit GitHub's rate limit). There's no
runtime server, so new activity only appears after the site rebuilds.

## Deployment (Cloudflare Workers)

This is a fully static site (no SSR adapter needed) deployed to **Cloudflare Workers** via
Workers Builds — Cloudflare's git-connected CI/CD, configured under the Worker's dashboard
Settings, not GitHub Actions. See [AGENTS.md](AGENTS.md) for the full `wrangler.jsonc` /
`worker/index.ts` setup.

- Push to `main` → Workers Builds runs `pnpm run build` then `npx wrangler deploy`.
- Push to any other branch → Workers Builds runs a **Worker Preview** deploy instead, giving that
  branch its own isolated preview URL (posted as a PR comment). See AGENTS.md's "Feature-branch
  previews" note for the one-time dashboard setup this requires and how secrets work for previews.

The `release-watch.yml` workflow triggers a rebuild when the Tracker repo has new activity
by committing the updated data file to `main` — that push is itself picked up by Workers Builds'
normal auto-deploy, no separate Deploy Hook needed.
