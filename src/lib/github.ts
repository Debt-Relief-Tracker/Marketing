import { marked } from 'marked';
import { SITE } from './site';

export interface Release {
  tag: string;
  name: string;
  publishedAt: string;
  htmlBody: string;
  url: string;
}

export interface CommitBlurb {
  sha: string;
  shortSha: string;
  summary: string;
  authorName: string;
  date: string;
  url: string;
}

const REPO_API_URL = SITE.repoUrl.replace('https://github.com/', 'https://api.github.com/repos/');

async function githubGet(path: string) {
  const url = `${REPO_API_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      // GitHub's API rejects requests with no User-Agent (403), and unlike Node's fetch,
      // not every runtime (e.g. Cloudflare's build-time workerd sandbox) sets a default one.
      'User-Agent': 'debt-relief-marketing-site',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches GitHub Releases at build time. Runs only during `astro build`/`astro dev`,
 * never in the browser — the result is baked into the static output.
 */
export async function getReleases(): Promise<Release[]> {
  const releases = (await githubGet('/releases')) as Array<{
    tag_name: string;
    name: string | null;
    published_at: string | null;
    body: string | null;
    html_url: string;
    draft: boolean;
    prerelease: boolean;
  }>;

  return Promise.all(
    releases
      .filter((release) => !release.draft)
      .map(async (release) => ({
        tag: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: release.published_at ?? new Date().toISOString(),
        htmlBody: await marked.parse(release.body ?? ''),
        url: release.html_url,
      })),
  );
}

/**
 * Fetches the most recent commits to `main` at build time, for a lightweight
 * "recent activity" list alongside full releases.
 */
export async function getRecentCommits(limit = 15): Promise<CommitBlurb[]> {
  const commits = (await githubGet(`/commits?sha=main&per_page=${limit}`)) as Array<{
    sha: string;
    html_url: string;
    commit: {
      message: string;
      author: { name: string; date: string } | null;
    };
  }>;

  return commits.map((commit) => ({
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 7),
    // Use only the first line of the commit message as the blurb — full bodies belong in the commit itself.
    summary: commit.commit.message.split('\n')[0],
    authorName: commit.commit.author?.name ?? 'Unknown',
    date: commit.commit.author?.date ?? new Date().toISOString(),
    url: commit.html_url,
  }));
}
