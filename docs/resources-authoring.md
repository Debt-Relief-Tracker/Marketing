# Authoring Resources articles (guide for AI agents and humans)

Each article on `/resources` is **one Markdown file**. Adding a file is the whole job: type pages,
tag pages, sorting, sitemap, and listings are generated at build time. Cloudflare rebuilds on push
to `main`.

## Where the file goes

```text
src/content/resources/<type>/<kebab-case-slug>.md
```

- `<type>` is a folder name in kebab-case, e.g. `guide`, `news`, `article`. A new folder creates a
  new type automatically (label = capitalized + pluralized, so `guide` → "Guides").
- A file placed directly in `src/content/resources/` gets the type `article`.
- The URL is `/resources/<type>/<slug>` (folder + filename without `.md`).
- Only articles belong in `src/content/resources/`. Never put READMEs or notes there; every `.md`
  in that tree is treated as an article.

## Template

```md
---
title: How the debt snowball works
description: One sentence, used on cards and as the meta description.
date: 2026-09-29
tags: [snowball, budgeting]
---

## First section

Body in Markdown.
```

## Frontmatter reference

| Field         | Required | Format              | Notes                                                                                      |
| ------------- | -------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `title`       | yes      | string              | Rendered as the page `h1`.                                                                 |
| `description` | yes      | string              | One sentence; card text and SEO description.                                               |
| `date`        | yes      | `YYYY-MM-DD`        | Sort key (newest first). Future dates are hidden until that date passes (needs a rebuild). |
| `tags`        | no       | list of strings     | Free-form. Normalized to lowercase-kebab (`Budgeting` = `budgeting`), de-duplicated.       |
| `type`        | no       | string              | Overrides the folder-derived type. Normally omit it and use the folder.                    |
| `draft`       | no       | boolean, default no | `true` excludes the article from the build entirely.                                       |

Unknown fields are ignored. A missing or malformed required field fails the build with
`InvalidContentEntryDataError` naming the file and field.

## Body conventions

- Start headings at `##`; the page already renders the title as `h1`.
- Link other articles with root-relative URLs, e.g. `[snowball](/resources/guide/snowball)`.
- Images: put them under `src/assets/` and reference them from the Markdown with a relative path
  (e.g. `![alt](../../../assets/chart.png)`) so `astro:assets` optimizes them. Always write alt text.
- Plain Markdown only. No MDX or components. If that is needed, change the collection deliberately.

## Before pushing

1. `pnpm run check` and `pnpm run build` pass (Node >= 22.12; see `.nvmrc`).
2. Optionally `pnpm dev` and view `/resources`.

## Do not

- Add routes, edit `src/content.config.ts`, or edit `src/lib/resources.ts` just to publish an
  article.
- Maintain tag or type lists by hand anywhere.
- Name a type folder `type` or `tag` (they collide with the filter routes).

## How it works (only if you need to change the system)

- Schema: [`src/content.config.ts`](../src/content.config.ts)
- Type/tag derivation, draft and date filtering, sorting: [`src/lib/resources.ts`](../src/lib/resources.ts)
- Routes: `src/pages/resources/` (`[...slug]`, `type/[type]`, `tag/[tag]`, plus the index)
- Cards and filter UI: `src/components/ResourceCard.astro`, `ResourceList.astro`
