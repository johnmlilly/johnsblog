// Refresh src/data/github.json with the last year of contributions and the
// latest commits to public repos. Run by .github/workflows/github-activity.yml
// with Node's built-in TypeScript support, so this file must stick to
// erasable syntax (types only, no enums).
//
// Needs GITHUB_TOKEN. With a personal token (GH_ACTIVITY_TOKEN in the
// workflow), private contributions are counted too, without any repo names.
import { writeFile } from 'node:fs/promises';
import type { ContributionDay, GitHubActivity, RecentCommit } from '../src/utils/githubActivity.ts';

const FILE = new URL('../src/data/github.json', import.meta.url);
const USERNAME = 'johnmlilly';
const RECENT = 5;

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const satisfies Record<string, ContributionDay['level']>;

interface CommitNode {
  oid: string;
  messageHeadline: string;
  committedDate: string;
  url: string;
  author: { user: { login: string } | null } | null;
}

interface QueryResult {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: { date: string; contributionCount: number; contributionLevel: keyof typeof LEVELS }[];
          }[];
        };
      };
      repositories: {
        nodes: {
          name: string;
          isFork: boolean;
          defaultBranchRef: { target: { history?: { nodes: CommitNode[] } } } | null;
        }[];
      };
    } | null;
  };
  errors?: unknown;
}

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
      repositories(first: 10, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          name
          isFork
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 10) {
                  nodes { oid messageHeadline committedDate url author { user { login } } }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is not set');
  process.exit(1);
}

const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
});
const body = (await response.json()) as QueryResult;
const user = body.data?.user;
if (!response.ok || body.errors || !user) {
  // Exit without writing, so the site keeps the last good data.
  console.error('GitHub API error:', JSON.stringify(body.errors ?? body));
  process.exit(1);
}

const calendar = user.contributionsCollection.contributionCalendar;

const weeks: ContributionDay[][] = calendar.weeks.map((week) =>
  week.contributionDays.map((day) => ({
    date: day.date,
    count: day.contributionCount,
    level: LEVELS[day.contributionLevel] ?? 0,
  }))
);

const isOwnCommit = (commit: CommitNode) =>
  commit.author?.user?.login.toLowerCase() === USERNAME && !commit.messageHeadline.startsWith('Merge ');

const recent: RecentCommit[] = user.repositories.nodes
  .filter((repo) => !repo.isFork)
  .flatMap((repo) =>
    (repo.defaultBranchRef?.target.history?.nodes ?? []).filter(isOwnCommit).map((commit) => ({
      repo: repo.name,
      sha: commit.oid,
      message: commit.messageHeadline,
      date: commit.committedDate,
      url: commit.url,
    }))
  )
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, RECENT);

const activity: GitHubActivity = { username: USERNAME, total: calendar.totalContributions, weeks, recent };

// The workflow only commits when this output differs from what's checked in.
await writeFile(FILE, `${JSON.stringify(activity, null, 2)}\n`);
console.log(`${activity.total} contributions, ${recent.length} recent commits`);
