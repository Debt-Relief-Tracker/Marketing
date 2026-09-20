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
├── lib/          # site.ts (shared constants), github.ts (build-time Releases fetch)
├── pages/        # index, features, open-source, donate, changelog
└── styles/       # global.css — Tailwind v4 import + theme tokens
docs/
└── blog-plan.md  # plan for a future hand-written blog (not built yet)
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

`/changelog` fetches GitHub Releases from the Tracker repo **at build time** (see
[`src/lib/github.ts`](src/lib/github.ts)) — there's no runtime server, so new releases only appear
after the site rebuilds. See `.github/workflows/release-watch.yml` for how rebuilds are triggered
automatically when a new release is published.

## Deployment (Cloudflare Pages)

This is a fully static site — no SSR adapter needed. Cloudflare Pages project settings:

- **Build command:** `pnpm build`
- **Build output directory:** `dist`
- **Node version:** see `.nvmrc`

Normal deploys happen via Cloudflare Pages' own Git integration (auto-deploy on push to `main`).
The `release-watch.yml` workflow additionally triggers a rebuild when the Tracker repo publishes a
new release, via a Cloudflare Pages **Deploy Hook**. That workflow requires a `CF_DEPLOY_HOOK_URL`
repository secret — see the workflow file for setup notes.
