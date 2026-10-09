// Shape of src/data/github.json, shared by the fetch script that writes it
// and the homepage section that reads it.

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RecentCommit {
  repo: string;
  sha: string;
  message: string;
  date: string; // ISO timestamp
  url: string;
}

export interface GitHubActivity {
  username: string;
  total: number;
  weeks: ContributionDay[][];
  recent: RecentCommit[];
}
