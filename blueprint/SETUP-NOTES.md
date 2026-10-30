# AI Blueprint setup notes

Installed with `npx create-ai-blueprint@latest --claude --codex` (v1.13.0).
Source: https://ai-blueprint.dev/#workflow

Run workflow skills in the AI chat (`/name` in Claude Code, `$name` in Codex).
Restart Claude Code in this folder first so the new skills load.

## One-time setup

1. `/adopt` — this blog already has shipped code, so adopt it. (`/onboard` is
   for fresh projects.)
2. Write `blueprint/project-plan.md` and `blueprint/build-plan.md`, or run
   `/discovery` to draft them through conversation. A plain feature list is
   enough for the build plan.
3. `/overview` — formats the build plan into a checklist and generates project
   context. Offers a local commit of the setup and plans.

## Per-feature loop

```text
/feature -> /implement -> /check -> /audit current -> /complete
```

1. `/feature` — spec the next build-plan item; review and approve it.
   (Use `/fix` for a small bug or change instead.)
2. `/implement` — build the approved spec.
3. `/check` — verify behavior against the real app.
4. `/audit current` — review for defects (optional per configured gates).
5. `/complete` — archive the work and approve the merge or PR.

## Handy extras

- `/status` — where did we leave off?
- `/doctor` — is Blueprint set up correctly?
- `/explore <idea>`, `/brief <n>`, `/debug`

## Optional

This repo lands work through PRs, so consider setting in
`blueprint/config.json`:

```json
"git": { "landing": "pull-request" }
```

Update later with `npx create-ai-blueprint@latest update --dry-run`, then
`npx create-ai-blueprint@latest update`.
