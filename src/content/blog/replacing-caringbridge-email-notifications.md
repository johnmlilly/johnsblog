---
published: false
title: Replacing a CaringBridge Feature With a Custom Notification Stack
description: CaringBridge emailed our followers automatically every time we posted an update about our son Francis. Moving to a custom site meant I had to rebuild that feature myself, and I ended up passing on the usual email platforms to do it.
date: 2026-09-18
featured: false
tags:
  - Backend Development
  - Cloudflare
---
We built [francisroylilly.com](https://francisroylilly.com) to document our son Francis's story and move his updates off CaringBridge onto something we own. CaringBridge did one thing really well that I didn't appreciate until it was gone: post an update, and everyone following gets an email automatically. No setup, no config, it just happens. When we moved to our own site, that feature didn't come with us. I had to build it.

## Weighing the options

My first instinct was to reach for an email platform instead of writing my own. I looked at Buttondown, Mailchimp, ConvertKit, that whole category. Buttondown in particular looked like a good fit: simple, cheap, built for exactly this kind of use case. I actually shipped it first, a form on the site posting straight to Buttondown's subscribe API.

But the more I used it, the more it felt like the wrong tool for the job. Every one of those platforms is built around running a mailing list: audience management, open and click tracking, broadcast campaigns, list segmentation. I don't need any of that. I need exactly one thing: when a new post goes up, tell the people who asked to know. That's it. Paying a monthly fee for a full email marketing platform to do one notification felt like buying a delivery truck to bring in the mail.

So I pulled Buttondown back out and built the notification myself.

## The stack

The site already runs on Astro deployed to Cloudflare Workers, so I kept everything in that world instead of bolting on a new service:

- **Cloudflare D1** for subscriber data. One `Subscriber` table (email, name, confirmation and unsubscribe timestamps, a token) and one `PostNotification` table that just records which posts have already gone out.
- **Resend** for sending. Simple API, and `resend.batch.send` handles up to 100 recipients per call so I'm not looping one send at a time.
- **A GitHub Actions workflow** that fires on every push to `main` touching the blog content directory, and calls a `/api/notify` endpoint on the live site.

Subscribing is double opt-in: you give your email, get a confirmation link, click it, you're in. Unsubscribing is one click, no login. `/api/notify` looks at every published post, checks `PostNotification` for which ones haven't gone out yet, sends those, and records them so a re-run never double-sends. Small, boring system. Boring was exactly what I wanted here.

## Bug one: the workflow fired before the site did

The first real problem showed up almost immediately. GitHub Actions runs the workflow the instant a post is pushed to `main`, but the site doesn't update that fast. Cloudflare Workers Builds still has to install dependencies, run the Astro build, and deploy. That takes a few minutes.

So the workflow was calling `/api/notify` before the new post even existed on the live site. The endpoint ran fine, found nothing new, and returned a clean `200`. No error, no red X in Actions. Just silence where an email should've gone out. That's the worst kind of bug: everything looks like it worked.

The fix was to make the workflow actually wait for the real deploy instead of trusting a few minutes had passed. I added a tiny `/api/version` endpoint that reports the exact commit SHA the running Worker was built from, and had the workflow poll it, checking against the SHA that triggered the push, until they match:

```bash
for attempt in $(seq 1 24); do
  # compare /api/version's sha to github.sha, sleep 15s, try again
done
```

Only once the live site is running the new commit does it call `/api/notify`. A slow deploy now just makes the workflow take longer instead of silently doing nothing.

## Bug two: Cloudflare's own bot protection was blocking my own workflow

Once that was sorted, runs still failed here and there, and for a while I couldn't figure out why. Cloudflare's Bot Fight Mode was flagging the request coming from GitHub's runners as bot traffic and quietly blocking it before it ever reached my Worker. The workflow got back a challenge page instead of JSON, and because the original script used `curl -sf`, any non-2xx response just vanished into an empty string. Success and failure looked identical in the logs.

That one stung a bit, since Bot Fight Mode exists to stop exactly the kind of automated request my own notify workflow is. I had to carve out an exception so my server-to-server trigger wouldn't get treated like an attacker.

While I was in there I found a second, unrelated silent failure: the POST to `/api/notify` had no `Content-Type` header, and Astro's CSRF protection (`security.checkOrigin`) was rejecting it as a forged cross-site form submission before it even reached my secret check. Adding `Content-Type: application/json` cleared that.

Both bugs had the same shape: a request failing in a way the script wasn't checking for, so it reported green while doing nothing. I rewrote both curl calls to capture the actual status code and body and fail loudly on anything but 200:

```bash
if response=$(curl -sS --max-time 60 -w '\n%{http_code}' -X POST \
  "https://francisroylilly.com/api/notify" \
  -H "Content-Type: application/json" \
  -H "x-notify-secret: ${{ secrets.NOTIFY_SECRET }}"); then
  code=${response##*$'\n'}
  body=${response%$'\n'*}
fi
[ "$code" = "200" ]
```

Not glamorous, but it means if this breaks again, I'll know within minutes instead of finding out someone missed an update.

## Where it landed

It's a small system for a small audience, and that's the point. No monthly platform fee, no dashboard I don't need, nothing running that isn't mine. When we publish a post about Francis, the people who asked to hear about it get an email, same as CaringBridge did automatically. It just took a bit more work to get there this time.

---

## Notes to self: nuts and bolts (not publish-ready, rework before using)

### Two databases, on purpose

The site runs two DBs side by side: Turso (`db/client.ts`) for `Comment`/`Reaction`, an older feature, and Cloudflare D1 (`db/d1-client.ts`) for `Subscriber`/`PostNotification`, built for this feature. D1 got picked because it's a first-party Cloudflare binding, zero network hop from the Worker, versus Turso's external HTTP client. Not a rewrite of the existing data layer, a second one bolted on.

**Lazy-init gotcha:** Cloudflare only populates `env` bindings inside a request, not at module load. So the D1 client can't be built at the top of the file the normal way:

```ts
function getDb(): Db {
  if (!instance) instance = drizzle(env.SUBSCRIBERS_DB, { schema });
  return instance;
}
export const d1 = new Proxy({} as Db, {
  get: (_t, prop, receiver) => Reflect.get(getDb(), prop, receiver),
});
```

The `Proxy` lets every call site just `import { d1 }` and use it normally, while the actual instantiation defers to first property access. Good "gotcha I didn't expect from Workers" beat.

### Schema

```
Subscriber: id, email (unique), firstName, lastName, token (unique),
  createdAt, confirmedAt, unsubscribedAt, lastEmailedAt

PostNotification: postSlug (PK), notifiedAt
```

- One `token` column does double duty: same UUID for both the confirm link and the unsubscribe link. Simpler than two tokens; confirm only checks `confirmedAt` is null, unsubscribe only checks `unsubscribedAt` is null.
- `PostNotification` is a dedupe table, not a queue. A row existing for a slug means "already sent" (or backfilled). No status column, no retry count. Presence = done. That's what makes reruns safe.
- `lastEmailedAt` throttles confirmation resends (10-minute window) so resubmitting the form doesn't spam a new email every time.

### The "pure function next to the I/O" pattern

Probably the most reusable idea here, worth its own section. Every branching decision got pulled into a plain function that takes data in and returns a decision out, no DB or network calls inside. The route/action then executes whatever came back.

- `decideSubscribe(existing, input, now, newToken)` in `src/lib/subscribeDecision.ts` returns one of `insert | resend | reactivate | noop | throttled`. The handler `switch`es on `decision.kind` and does the D1/Resend calls. Covers: brand new signup, resubmitting before confirming, an already-active subscriber submitting again (no-op), and someone who unsubscribed coming back (reactivate, fresh token).
- `selectNewPosts(posts, notifiedSlugs, now)` in `src/lib/notify.ts` filters drafts, future-dated posts, already-notified slugs, sorts oldest first. Takes plain objects, no `getCollection()` inside it.
- `secretsMatch(provided, expected)`: constant-time string compare for the notify endpoint's auth header, hand-written (XOR every byte, no early return) since Workers don't have Node's `crypto.timingSafeEqual`.
- `chunk(items, size)`: splits the subscriber list into groups of 100 for Resend's batch endpoint.

Why it matters: every one of these got full branch-coverage unit tests with zero mocking, because they're just functions. The DB-touching code around them gets tested separately with `vi.mock` on the D1 client and Resend. Worth a paragraph on "extract the decision from the effect" as a general pattern, not just a notify-specific trick.

### The API surface

- `subscribeToUpdates` is an Astro Action, not a raw API route: called from a form via `actions.subscribeToUpdates(formData)`. Honeypot field (`website`) plus a timestamp-based minimum-fill-time check (rejects under 3 seconds; a missing/non-numeric timestamp is treated the same, since it only gets populated by client script — closes the no-JS bot path).
- GET/POST split on `/api/confirm` and `/api/unsubscribe`: GET never mutates, only looks up and renders. Reason: email clients and link scanners prefetch URLs in emails automatically. If GET confirmed the subscription, a safe-links scanner would silently confirm every subscriber before a human clicked. POST (real button/form submit) is the only thing that writes. Confirm is one-shot; unsubscribe is idempotent (second POST just succeeds again).
- `POST /api/notify`: shared-secret header auth (`x-notify-secret`), 401 before touching D1 on mismatch. Loads published posts via `getCollection('blog')` (only works inside the Worker's Astro context), diffs against `PostNotification`, sends via `resend.batch.send` in chunks of 100, records the `PostNotification` row after the send attempt so a rerun after partial failure doesn't double-send (known tradeoff: a crash between send and insert could in theory double-send). `?skipSend=true` mode writes rows only, no sends, used once to backfill history so existing posts didn't all blast emails the day the feature shipped.
- `GET /api/version`: returns `{ sha: __BUILD_SHA__ }`, a build-time constant from Astro's `vite.define` reading Cloudflare's `WORKERS_CI_COMMIT_SHA`. Exists purely so the workflow can poll for deploy completion. `Cache-Control: no-store`.

### Email templates

- Hand-rolled inline-styled HTML, not React Email. Deliberate: rendering JSX inside a Cloudflare Worker request adds a runtime-compatibility risk two simple templates don't justify, and email HTML needs inline styles regardless of how it's authored.
- One shared `renderEmail({ previewText, bodyHtml, footerHtml })` layout both templates call into. Handles the table-based HTML skeleton plus the "preview text" trick: a hidden `<span>` holding the subject line so the inbox preview snippet shows something useful instead of grabbing random header HTML.
- Every interpolated value goes through `escapeHtml` — post titles and subscriber first names both come from user/author input, so they're escaped before landing in the HTML string. Good "why I bothered" detail: nobody's attacking a family blog, but a title with an `&` in it would literally break the markup without it. Correctness fix as much as a security one.

### GitHub Actions workflow specifics

Two sequential curl calls, both hardened the same way (capture status + body with `-w '\n%{http_code}'`, explicit non-200 failure) after the silent-failure bugs above:

1. Poll `/api/version`, 24 attempts x 15s (6 min ceiling), compared to `github.sha`.
2. POST to `/api/notify` with the secret header and `Content-Type: application/json`.

Also:
- `concurrency: { group: notify-subscribers, cancel-in-progress: false }` stops two quick pushes to `main` racing into a double-send. Doesn't cancel the first run, queues the second behind it.
- `paths: ['src/content/blog/**']` so the workflow doesn't fire on unrelated pushes to `main`.
- `workflow_dispatch` kept as a manual escape hatch to rerun by hand.

### Loose ends / honest tradeoffs (good closing material)

- Resend batch sends are all-or-nothing per chunk of 100: one bad address fails the whole batch of up to 100 recipients, no per-recipient granularity.
- No retry queue. A failed send shows up as `failed` in the response and the Actions log; recovery is manual since the `PostNotification` row is already written.
- Confirmation resend is throttled, but there's no rate limit on the subscribe action itself beyond the honeypot/timing check.
