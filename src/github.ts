import type { Activity } from './game';

const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const DAY = 24 * 60 * 60 * 1000;

export function isLogin(s: string): boolean {
  return LOGIN.test(s);
}

const QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!, $merged: String!, $recent: String!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
  merged: search(query: $merged, type: ISSUE) { issueCount }
  recent: search(query: $recent, type: ISSUE) { issueCount }
}`;

export interface ActivityResponse {
  data?: {
    user: {
      contributionsCollection: {
        totalCommitContributions: number;
        contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number }[] }[] };
      };
    } | null;
    merged: { issueCount: number };
    recent: { issueCount: number };
  };
  errors?: { type?: string; message: string }[];
}

/** null when the user does not exist */
export function toActivity(res: ActivityResponse): Activity | null {
  const user = res.data?.user;
  if (!user) return null;
  const c = user.contributionsCollection;
  const days = c.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .sort((a, b) => b.date.localeCompare(a.date));
  return {
    commits: c.totalCommitContributions,
    mergedPrs: res.data!.merged.issueCount,
    recentDays: days.slice(0, 7).map((d) => d.contributionCount),
    mergedRecently: res.data!.recent.issueCount > 0,
  };
}

export class GitHubError extends Error {}

export async function fetchActivity(login: string, token: string, now = new Date()): Promise<Activity | null> {
  if (!isLogin(login)) return null;
  const since = new Date(now.getTime() - 3 * DAY).toISOString().slice(0, 10);
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'chiicawa',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: {
        login,
        from: new Date(now.getTime() - 365 * DAY).toISOString(),
        to: now.toISOString(),
        merged: `author:${login} is:pr is:merged`,
        recent: `author:${login} is:pr merged:>=${since}`,
      },
    }),
  });
  if (!res.ok) throw new GitHubError(`GitHub API ${res.status}`);
  const json = (await res.json()) as ActivityResponse;
  if (json.errors?.some((e) => e.type === 'NOT_FOUND')) return null;
  if (json.errors?.length) throw new GitHubError(json.errors[0].message);
  return toActivity(json);
}
