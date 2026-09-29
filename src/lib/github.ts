import { marked } from 'marked';
import trackerActivity from '../data/tracker-activity.json';

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

interface StoredActivity {
  releases: Array<Omit<Release, 'htmlBody'> & { body: string }>;
  commits: Array<Omit<CommitBlurb, 'shortSha'>>;
}

// Written by .github/workflows/release-watch.yml. Read from disk rather than fetched from the
// GitHub API so builds make no network calls (Cloudflare's shared build IPs hit GitHub's
// unauthenticated rate limit).
const activity: StoredActivity = trackerActivity;

/** Releases from the committed Tracker activity data, with markdown bodies rendered to HTML. */
export async function getReleases(): Promise<Release[]> {
  return Promise.all(
    activity.releases.map(async ({ body, ...release }) => ({
      ...release,
      publishedAt: release.publishedAt ?? new Date().toISOString(),
      htmlBody: await marked.parse(body),
    })),
  );
}

/** Recent commits to Tracker's `main`, for a lightweight "recent activity" list alongside releases. */
export async function getRecentCommits(limit = 15): Promise<CommitBlurb[]> {
  return activity.commits.slice(0, limit).map((commit) => ({
    ...commit,
    shortSha: commit.sha.slice(0, 7),
  }));
}
