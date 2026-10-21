---
published: false
title: What I Learned Setting Up CI for My Repos
description: I used GitHub Actions to add automated checks that catch broken
  builds, risky dependencies, and dead links before they ship.
date: 2026-10-21
tags:
  - GitHub Actions
logo: githubactions
---
The way code is written has fundamentally changed with AI tools these days. They make writing code faster than many ever thought possible, but with that come new challenges, such as:

1. How do I know this code works?
2. How do I test this?
3. How does this integrate into external systems?
4. What security vulnerabilities does this introduce?

As the majority of the code I produce is written by AI, I've shifted my workflow to reviewing, verifying, and testing the code. That's something I haven't had time to do in the past because I was focusing on code generation and proper language syntax.

Now that's all changed.

## My Old "Testing" Method
For a long time my "testing process" was pushing to main and refreshing the live site to see if anything broke. That works fine until something breaks.

Last week I finally sat down and added a real CI ([Continuous Integration](https://aws.amazon.com/devops/continuous-integration/)) workflow to two of my repos: this blog (built with [Astro](https://astro.build/) and deployed on [Cloudflare](https://workers.cloudflare.com/)) and [ya-portal-blocks](https://github.com/johnmlilly/ya-portal-blocks), a WordPress block plugin I built for the [Youth Apostles](https://www.youthapostles.org/) member portal.

If you haven't used it yet, [GitHub Actions](https://docs.github.com/en/actions) lets you run scripts automatically when something happens in your repo, like opening a pull request or pushing to a branch. You write a YAML file, drop it in `.github/workflows`, and GitHub runs it for you.

Below are the workflows I set up and what I learned from each one. Most of this is pretty standard stuff, but putting it together myself taught me a lot more than a tutorial or reading ever did.

## Verify: Does It Even Build?

This is the one every repo should have. On every pull request and every push to main, it installs dependencies and runs a single `verify` script. If anything fails, the PR gets a red X and I know before it ever reaches the live site.

For this blog, `verify` runs `astro check` (TypeScript and template type checking) and then a full `astro build`. For the WordPress plugin, it runs the JavaScript and CSS linters from `@wordpress/scripts` and then builds the blocks. The plugin also has a second job that runs `php -l` on every PHP file to catch syntax errors, since a single missing semicolon in PHP can take down a whole WordPress site.

My favorite part of this setup is keeping the actual logic in `package.json` instead of the workflow. CI just runs `npm run verify`, and I can run the exact same command locally before I push.

```json
"scripts": {
  "check": "astro check",
  "verify": "astro check && astro build",
  "audit": "npm audit --omit=dev --audit-level=high"
}
```

```yaml
name: Verify

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run verify
```

One thing to note: this workflow never deploys. Cloudflare already builds and deploys the blog on every push to main, so all this job does is answer one question. Does it build?

If you want a solid intro to how workflows are structured, GitHub's quickstart is a great place to start: https://docs.github.com/en/actions/writing-workflows/quickstart

## Dependencies: Don't Ship Known Vulnerabilities

Every project pulls in a mountain of npm packages, and every one of those packages pulls in more. I wanted two things here. First, block a pull request if it adds a dependency with a known high or critical vulnerability. Second, check the existing dependencies once a week since new advisories come out all the time.

GitHub's [dependency review action](https://github.com/actions/dependency-review-action) handles the first part. It only looks at what the PR changes, so old advisories don't block unrelated work. The weekly part is just `npm audit` on a schedule.

```yaml
on:
  pull_request:
  schedule:
    - cron: '0 9 * * 1' # weekly, Mondays 9am UTC
  workflow_dispatch:

jobs:
  review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0
        with:
          fail-on-severity: high
```

The first time I ran the audit on the blog, it found 8 high-severity advisories in my runtime dependencies. A quick `npm audit fix` cleared all of them with a lockfile-only update. The plugin had two critical ones buried in a dev dependency of webpack. I'd never have known about any of these without the check.

I did set the bar differently for each repo. The blog fails on high since Astro runs on the Cloudflare Worker. The plugin only fails on critical because the `@wordpress/*` packages are supplied by WordPress core at runtime, so most of what npm flags there never actually ships.

To keep everything up to date, I also added [Dependabot](https://docs.github.com/en/code-security/dependabot). It opens PRs every Monday for npm packages and for the actions themselves. Grouping related packages keeps it from flooding me with ten PRs at once.

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 5
    groups:
      astro:
        patterns:
          - 'astro'
          - '@astrojs/*'
      dev-dependencies:
        dependency-type: development

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: monday
```

## Links: Old Posts Rot

This one is specific to the blog, and honestly it's the one I'm most glad I added. Links in old posts break over time. Sites move things around, docs get reorganized, and you'd never notice unless you went back and clicked every single one.

[Lychee](https://github.com/lycheeverse/lychee) is a fast link checker that scans every markdown file in my content folder. It runs on any PR that touches a post and again every Monday to catch links that died on their own.

```yaml
on:
  pull_request:
    paths:
      - 'src/content/**'
      - 'lychee.toml'
  schedule:
    - cron: '0 10 * * 1' # weekly, Mondays 10am UTC

jobs:
  lychee:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: lycheeverse/lychee-action@e7477775783ea5526144ba13e8db5eec57747ce8 # v2.9.0
        with:
          args: --config lychee.toml 'src/content/**/*.md'
          token: ${{ github.token }}
```

The first run caught a broken MDN link in my [CSS columns post](https://johnlilly.dev/blog/how-to-use-css-columns-for-simple-and-responsive-layouts/). It also failed on a bunch of links that were totally fine. Sites like LinkedIn and Instagram block automated requests and return a 403 to anything that isn't a browser. Internal links like `/projects` failed too since Lychee didn't know what site they belonged to.

Both were easy fixes in `lychee.toml`. Setting a `base_url` resolves root-relative links against the live site, and an exclude list skips the sites that block bots.

```toml
max_retries = 3
timeout = 20
accept = ["200..=299", "429"]

# Resolves root-relative links like /projects against the live site.
base_url = "https://johnlilly.dev"

exclude = [
  '^https://(www\.)?linkedin\.com',
  '^https://(www\.)?instagram\.com',
]
```

## Release: Building the Plugin Zip

The WordPress plugin needed one more workflow. When I push a version tag like `v1.1.0`, it builds the plugin, zips it up, and attaches the zip to a GitHub release with auto-generated release notes. No more building it on my laptop and uploading it by hand.

This is also where I learned the most about security. My first version was one job with write access to the repo that installed packages, built the plugin, and published the release. The problem is that `npm ci` runs code from every dependency, and that code was running with permission to write to my repo.

The fix was splitting it into two jobs. The build job has read-only access and does all the npm work. The publish job is the only one that can write, and it never runs any project code. It just downloads the zip and creates the release.

```yaml
jobs:
  # Install, build, and package with read-only access and no npm cache,
  # so dependency code never runs with release permissions.
  build:
    runs-on: ubuntu-latest
    steps:
      # checkout and setup-node...
      - run: npm ci
      - run: npm run build
      - run: npm run plugin-zip
      - uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: plugin-zip
          path: ya-portal-blocks.zip

  # Only this job can write, and it runs no project code.
  publish:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
        with:
          name: plugin-zip
      - uses: softprops/action-gh-release@efb35369e0ad2afab669f228072c1b0d510eae64 # v3.0.3
        with:
          files: ya-portal-blocks.zip
          generate_release_notes: true
```

## A Few Things I'd Do From the Start

Looking back, here's what I'd do differently next time:

1. **Set Up Tests First:** Anytime I scaffold a new repo, I plan to build testing suites, workflows, and regular audits. This ensures everything is testable and works before major features or components are shipped.
2. **The Necessity of Testing:** The world of testing is something I've largely avoided because it seemed too intimidating. But after building it out myself, I've learned that it's easier than I thought. The amount of code produced is larger than I can review myself, so setting up automated tests, checks, and audits is a must these days.
3. **Build It Into My AI Workflow:** I've checked out several AI workflow tools, but the one I keep coming back to is Brad Traversy's [AI Blueprint](https://ai-blueprint.dev/). It's a basic but effective workflow that I've used in several projects to date, and the built-in `/check` skill will make it easy to integrate these and other tests into it.

One last thing: you've probably noticed the long hashes after each action in the examples above. A tag like `@v5` can be moved to point at different code, but a commit SHA can't. The comment at the end keeps it readable, and Dependabot still keeps them updated. GitHub's security hardening guide covers this and more: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions

## Conclusion

All of these workflows are fairly straightforward. Each one is a few lines of YAML that saves me from a mistake I'd otherwise find on the live site (or never find at all). Between the build checks, dependency audits, and link checking, I feel a lot better about pushing changes to both of these projects. I plan to implement a similar setup for my future and existing projects.

If you want a quick overview of every workflow and what it caught, check out the [CI automation project](/projects/ci-automation/).

If you're working on a project and want help setting up CI or GitHub Actions, I'd love to help! Send me a message by [filling out my contact form](https://johnlilly.dev/contact). Reach out anytime if you're looking for freelance development work or want to bring an idea to life.
