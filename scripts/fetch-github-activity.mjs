// Refresh src/data/github.json with the last year of contributions and the
// latest commits to public repos. Run by .github/workflows/github-activity.yml.
//
// Needs GITHUB_TOKEN. With a personal token (GH_ACTIVITY_TOKEN in the
// workflow), private contributions are counted too, without any repo names.
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/data/github.json', import.meta.url);
const USERNAME = 'johnmlilly';
const RECENT = 5;

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      id
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
const body = await response.json();
if (!response.ok || body.errors || !body.data?.user) {
  // Keep the last good data rather than blanking the section.
  console.error('GitHub API error:', JSON.stringify(body.errors ?? body));
  process.exit(1);
}

const { contributionsCollection, repositories } = body.data.user;
const calendar = contributionsCollection.contributionCalendar;

const weeks = calendar.weeks.map((week) =>
  week.contributionDays.map((day) => ({
    date: day.date,
    count: day.contributionCount,
    level: LEVELS[day.contributionLevel] ?? 0,
  }))
);

const recent = repositories.nodes
  .filter((repo) => !repo.isFork && repo.defaultBranchRef?.target?.history)
  .flatMap((repo) =>
    repo.defaultBranchRef.target.history.nodes
      .filter((commit) => commit.author?.user?.login?.toLowerCase() === USERNAME)
      .filter((commit) => !commit.messageHeadline.startsWith('Merge '))
      .map((commit) => ({
        repo: repo.name,
        sha: commit.oid,
        message: commit.messageHeadline,
        date: commit.committedDate,
        url: commit.url,
      }))
  )
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, RECENT);

const next = { username: USERNAME, total: calendar.totalContributions, weeks, recent };

// Only touch the file when the data changed, so a quiet day makes no commit.
const previous = JSON.parse(await readFile(FILE, 'utf8').catch(() => '{}'));
const { fetchedAt: _, ...previousData } = previous;
if (JSON.stringify(previousData) === JSON.stringify(next)) {
  console.log('No change');
} else {
  await writeFile(FILE, `${JSON.stringify({ username: USERNAME, fetchedAt: new Date().toISOString(), total: next.total, weeks, recent }, null, 2)}\n`);
  console.log(`Updated: ${next.total} contributions, ${recent.length} recent commits`);
}
