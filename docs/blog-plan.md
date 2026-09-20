# Blog plan (not yet implemented)

This describes how to add a hand-written blog to this site once there's content to publish. It's
intentionally deferred — the `/changelog` page (build-time GitHub Releases fetch, see
[`src/lib/github.ts`](../src/lib/github.ts)) covers release notes today.

## Goal

Let the team publish longer-form posts (announcements, guides, "how we built X") as Markdown/MDX
files committed to this repo, without needing a CMS.

## Approach: Astro Content Collections

1. **Define the collection** in `src/content.config.ts`:

   ```ts
   import { defineCollection, z } from 'astro:content';
   import { glob } from 'astro/loaders';

   const posts = defineCollection({
     loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
     schema: z.object({
       title: z.string(),
       description: z.string(),
       publishedAt: z.date(),
       draft: z.boolean().default(false),
     }),
   });

   export const collections = { posts };
   ```

2. **Add posts** as `src/content/posts/YYYY-MM-DD-slug.mdx`, frontmatter matching the schema above.

3. **Routes**:
   - `src/pages/blog/index.astro` — lists non-draft posts, newest first, reusing `FeatureCard`-style
     summary cards.
   - `src/pages/blog/[...slug].astro` — uses `getStaticPaths()` over the collection and renders each
     post's content via `render(entry)`.

4. **Nav**: add a "Blog" link next to "Changelog" in `src/components/Header.astro` once there's at
   least one published post — don't ship an empty nav item.

5. **SEO**: reuse `BaseLayout`'s `title`/`description` props per post; `@astrojs/sitemap` (already
   installed) will pick up the new routes automatically.

## How this coexists with `/changelog`

- `/changelog` = release notes, sourced from GitHub Releases, no manual authoring.
- `/blog` = long-form posts, hand-written, sourced from files in this repo.
- If a post is essentially "release notes plus commentary," write it as a blog post that links to
  the relevant changelog entry, rather than duplicating the release body.

## Effort estimate

Small — collection schema, two route files, one nav link. No new dependencies (MDX support ships
with `astro:content`'s built-in loaders; add `@astrojs/mdx` via `astro add mdx` when this is built).
