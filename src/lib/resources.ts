import { getCollection, type CollectionEntry } from 'astro:content';

export interface Resource {
  entry: CollectionEntry<'resources'>;
  slug: string;
  title: string;
  description: string;
  date: Date;
  type: string;
  tags: string[];
}

export interface Facet {
  slug: string;
  label: string;
  count: number;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function typeLabel(type: string): string {
  const words = type.replace(/-/g, ' ');
  const label = words.charAt(0).toUpperCase() + words.slice(1);
  return label.endsWith('s') ? label : `${label}s`;
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, ' ');
}

// Drafts and future-dated articles are excluded; newest first. The type is the frontmatter
// `type` if set, else the article's parent folder (files at the top level get "article").
export async function getAllResources(): Promise<Resource[]> {
  const now = new Date();
  const entries = await getCollection('resources', ({ data }) => !data.draft && data.date <= now);
  return entries
    .map((entry) => {
      const parts = entry.id.split('/');
      const folder = parts.length > 1 ? parts[0]! : 'article';
      return {
        entry,
        slug: entry.id.replace(/\.md$/, ''),
        title: entry.data.title,
        description: entry.data.description,
        date: entry.data.date,
        type: slugify(entry.data.type ?? folder),
        tags: [...new Set(entry.data.tags.map(slugify).filter(Boolean))],
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function facets(values: string[], label: (slug: string) => string): Facet[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts]
    .map(([slug, count]) => ({ slug, label: label(slug), count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const getTypes = (resources: Resource[]) =>
  facets(
    resources.map((r) => r.type),
    typeLabel,
  );

export const getTags = (resources: Resource[]) =>
  facets(
    resources.flatMap((r) => r.tags),
    tagLabel,
  );
