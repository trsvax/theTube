# theTube Platform — Requirements

## What this is

theTube is a personal publishing platform built on a single constraint: **static HTML first, everything else optional**. No server, no database, no CMS. Content is Markdown in git repos. The build produces static files. S3 stores them. CloudFront serves them. Auth sits on top without changing any of that.

The architecture is the argument. Every decision demonstrates that the web doesn't need to be as complicated as it usually is.

---

## Design principles

**AI collaboration is the workflow.** This is designed to be built with AI, not just assisted by it. The human role is direction, judgment, and writing. The AI role is code, debugging, and implementation. The journal entry is the interface between them — you write what you want, AI builds it. The skills and specs exist to give AI enough context to do that without constant correction. Suggestions are welcome — if there's a better approach or a missing piece, say so.

Each layer down the stack is someone else's problem. You care about the journal. AI cares about the spec and code. Next.js handles HTML generation. V8 optimizes the JS. CloudFront serves the bytes. The further from your intent, the less it matters who does it or how.

**The development flow is: vague idea → journal → spec → code, where the last three are a loop.** The idea is the only one-way gate. After that: write in the journal, produce a spec, write code, learn something, update the journal, update the spec, write more code. The loop runs until it's shipped. You can enter at any stage and skip stages for small changes — a one-liner doesn't need a spec. But the journal entry is always the persistent record of the whole loop.

**AI makes exploration free.** Without AI, you'd default to the stack you already know because there's no time to prototype alternatives. The sprint is full. The tickets are due. AI makes the cost of exploration a conversation — try an idea, validate it in seconds, build it or discard it. This entire platform architecture emerged from conversations, not from upfront design. The journal captures what was explored. The code proves it works. The speed of the conversation is what makes the exploration happen at all.

**Build as you go, refactor freely.** The platform grows incrementally. Each journal entry is a feature or idea. Each spec is scoped to one thing. Nothing is designed upfront that hasn't been needed yet. The interface between components is kept thin so the internals can move freely — iterate toward the right structure instead of predicting it. Build the simplest thing that works. Add complexity only when a real problem forces it. The architecture supports adding it later without changing what's already there. See: [a-fork-is-a-refactor](/posts/a-fork-is-a-refactor).

**Static HTML first.** The site works in Lynx. CSS is for presentation, JS is for enhancement, auth is for gating. Each layer is optional — removing it doesn't break the layer below. The HTML stands on its own.

**The constraint is the point.** Every architectural decision is an argument that the web doesn't need to be as complicated as it usually is. No server, no database, no CMS — not because they're bad, but because they're not needed here. The absence is deliberate.

**One dollar a month.** Infrastructure cost is a design constraint. S3 + CloudFront at personal-site scale costs almost nothing. Complexity that adds cost without adding value doesn't belong here.

**Own what you write.** Content is plain Markdown in git. No proprietary format, no export button, no lock-in. If the site disappears, the writing doesn't.

---

Any content source that wants to participate in the platform must produce two things:

1. **Static HTML** — built files synced to an S3 path (e.g. `/`, `/books/tapestry-nocode/`)
2. **`index.json`** — a manifest of items at that path, in this shape:

```json
{
  "version": 1,
  "role": "public",
  "items": [
    {
      "type": "post",
      "slug": "my-post",
      "title": "My Post",
      "date": "2026-05-16",
      "tags": ["tech"],
      "summary": "One-line teaser."
    }
  ]
}
```

That's the interface. Any tool that speaks this format can participate. The front end doesn't care what built it.

---

## index.json — the master manifest

`index.json` at the S3 root lists all content sources. The front end fetches it to know what sections exist and what role is required to access each.

```json
{
  "updated": "ISO timestamp",
  "sections": [
    {
      "slug": "public",
      "contentUrl": "/public/index.json",
      "role": "public"
    },
    { "slug": "user", "contentUrl": "/user/index.json", "role": "user" },
    { "slug": "kids", "contentUrl": "/kids/index.json", "role": "kids" },
    {
      "slug": "friends",
      "contentUrl": "/friends/index.json",
      "role": "friends"
    },
    {
      "slug": "tapestry-nocode",
      "contentUrl": "/books/tapestry-nocode/index.json",
      "role": "public"
    }
  ]
}
```

Convention: every directory has an `index.json`. That's the listing. `index.json` is `ls`.

Adding a new content source = deploy it first, then add its entry to `SECTIONS` in `scripts/aggregate-site.mjs` and run the aggregate workflow.

---

## Repos

| Repo                          | Purpose                                     | Deploys to                             |
| ----------------------------- | ------------------------------------------- | -------------------------------------- |
| `trsvax/theTube`              | App code, public posts, docs, `index.json`  | `/` (S3 root)                          |
| `trsvax/theTube-content`      | Public post content                         | merged into theTube build              |
| `trsvax/thetube-private`      | Private content, licensed fonts, Lambda/CDK | merged into theTube build              |
| `trsvax/tapestry-nocode-site` | Tapestry NoCode book renderer               | `/books/tapestry-nocode/`              |
| `trsvax/tapestry-nocode`      | Tapestry NoCode book content                | merged into tapestry-nocode-site build |

Each content source has its own repo, its own build, its own deploy. The format agreement — Markdown, `index.json`, S3 path — is the only coupling.

### Repos as access boundaries

A repo is like a Unix directory — it gates access at the top, everything inside inherits. Permissions are set at the repo level; issues, PRs, and files all inherit that access. That's why "what earns a repo" is an access control decision, not a code organization decision. The designer gets write access to the design repo. They can't accidentally break the app code because it's a different directory with different permissions. Issues go in the repo where the work happens — content issues in the content repo, design issues in the design repo, code issues in the code repo.

---

## The build pipeline

Every content source follows the same pattern:

```
git push main
  → GitHub Actions
      - checkout this repo + content repo(s)
      - merge content into build tree
      - npm ci && npm run build  →  out/
      - aws s3 sync out/ s3://<bucket>/<path> --delete
      - CloudFront invalidation at /<path>/*
```

The theTube main build additionally:

- Merges private assets (fonts, protected images) from `thetube-private`
- Runs `scripts/build-indexes.mjs` to generate role-scoped `index.json` files
- Deploys the CloudFront short-URL function

---

## AWS infrastructure

One S3 bucket, one CloudFront distribution. All content sources share them.

**S3** — private bucket, CloudFront is the only entry point via OAC.

**CloudFront behaviors:**

| Path                               | Access                 | Notes                            |
| ---------------------------------- | ---------------------- | -------------------------------- |
| `default (*)`                      | Public                 | All static HTML, fonts, images   |
| `/protected/*`                     | Signed cookie required | Role-gated assets                |
| `/user/*`, `/kids/*`, `/friends/*` | Lambda@Edge auth       | Role-scoped `index.json` files   |

**Auth stack:**

- Cognito user pool — Google + email/password sign-in
- Lambda at `auth.thetube.today/callback` — exchanges auth code for JWT, sets cookies
- Lambda@Edge on viewer requests to `/user/*`, `/kids/*`, `/friends/*` — validates JWT, checks group membership, returns 403 if unauthorized
- Cognito public keys hardcoded in Lambda@Edge — no network call at edge time

**Roles:**

| Role      | Access                                      |
| --------- | ------------------------------------------- |
| `public`  | Everyone, no login                          |
| `user`    | Any Cognito account (self-signup open)      |
| `kids`    | Cognito `kids` group — manually assigned    |
| `friends` | Cognito `friends` group — manually assigned |

---

## Content model

Posts are `.md` files with YAML frontmatter. The slug is the filename without `.md`.

**Required:** `title`, `date`, `tags`, `summary`, `workflow`
**Optional:** `image`, `bsky`, `audience`, `type`, `shortSlug`

`workflow` controls visibility: `published` = included in index.json feeds, `draft` = builds to a URL but excluded from all feeds. Extensible later (e.g. `review`, `scheduled`).

`audience` routes the post into the right role-scoped `index.json`. Default: `public`.

`type` controls how the post is treated: `post` (default), `thought`, `draft` (excluded from index). `journal` is reserved for in-progress thinking — excluded from `index.json`, rendered at `/journal`.

**Journal status lifecycle:** `vague-thought` → `thought` → `journaling` → `shipped`

- `vague-thought` — a title, maybe a sentence. Not ready to write about yet.
- `thought` — more formed but not yet being actively worked.
- `journaling` — actively in the loop (journal → spec → code).
- `shipped` — done.

Posts start at `audience: user` while in progress, flipped to `audience: public` when ready.

---

## The front end

`PostList` is a `"use client"` component. On load it:

1. Reads the `thetube_roles` cookie to know which feeds to fetch
2. Fetches each accessible `index.json` in parallel
3. Merges, deduplicates, and sorts by date
4. Renders the list with client-side tag filtering

The browser does the dynamic work. The build produces static assets. No server needed.

---

## The `/tube/` write protocol

All writes go through one endpoint:

```
POST /tube/{namespace}/{verb}
```

**The `?` is an app decision — driven by how AWS logging works:**

CloudFront logs the URL (path + query string), not the body. That's the whole driver.

| Request | Where data lands | Who saves it |
|---|---|---|
| `?` present (data in query string) | CloudFront access log | CloudFront, automatically |
| No `?` (data in body) | S3 (via Lambda) | Lambda — `s3.putObject`, nothing more |

Two questions drive the choice: do you want the data in the logs, and do you need the body saved? Use `?` for fire-and-forget (metadata, events, captures — data safe to log, no body). Use body when data shouldn't be in the logs (PII, sensitive content), or when you have a body to save. Lambda receives the body and writes it to S3 — that's the only compute. The pipe Lambda is dumb as `cat`.

**How routing works (default):** The CloudFront Function checks for a query string. Present → return 202 immediately (data is in the URL, logged). Absent → pass through to Lambda@Edge. No body inspection needed — the `?` is the signal.

**Defaults:**

- Data in the query string = fire and forget. CloudFront logs it. Free. Always works.
- No query string = body needs saving. Lambda writes to S3. Plugin provides the Lambda.
- POST (not GET) because CloudFront must not cache write requests.

**Client contract:** POST, look at the status code. 2xx = success. 4xx = your fault. 503 = retry later (Lambda is down). If there's a response body, use it. If not, don't.

**CloudFront config:** One behavior for `/tube/*` — no cache, run the function. Auth, CORS, rate limiting all in one place.

**Namespace is a convention, not a contract.** The path structure is `/tube/{namespace}/{verb}` but nothing enforces that the namespace maps to a repo or that a schema exists. The CloudFront Function doesn't validate — it logs and returns 202. Structure is opt-in.

---

## GraphQL as the plugin contract

Plugins that want typed operations bring a GraphQL schema. The schema lives in the plugin repo. It declares:

- What operations exist (the namespace/verb combinations under `/tube/`)
- What parameters each operation accepts (the query string shape)
- What the output looks like
- What directives apply

| Directive | Meaning | Client behavior |
|---|---|---|
| `@moderate` | Batch processing, no immediate result | Client includes `?` (data in query string) |
| `@realtime` | Immediate processing, returns result | Client omits `?` (data in body) |
| `@auth(role)` | JWT required with specified role | Lambda validates before processing |

The schema is a type system and capability declaration, not a routing table. The operation name tells you the input and output shapes. The directives tell the client hook whether to include a body.

You can also just `POST /tube/whatever/thing?x=1` with no schema — it gets logged. Add structure when it earns its keep.

GraphQL schemas are backward compatible by design — add fields, don't remove them. Deprecate with `@deprecated`, don't delete. Old clients keep working because they only ask for fields they know about. This makes the plugin interface stable across tagged snapshots and time-traveled versions.

---

## Plugin isolation

The namespace is the security boundary. Each plugin namespace maps to:

| Layer | Scope |
|---|---|
| Repo | Who can deploy code for this namespace |
| Lambda | What code runs for this namespace |
| IAM role | What the Lambda can write to |
| S3 prefix | Where the output lives |

Example:

```
/tube/comment/*  → thetube-comments repo → comment Lambda → IAM: s3://bucket/comments/* only
/tube/contact/*  → contact repo          → contact Lambda → IAM: s3://bucket/contact/* only
```

The contract repo (schema) declares what the plugin *can* do. IAM enforces the ceiling. A team with write access to one plugin repo cannot:

- Deploy code to another namespace's Lambda
- Write to another namespace's S3 prefix
- Modify another namespace's IAM role

Blast radius = repo scope. A bad deploy breaks one namespace. Everything else keeps working. The `?` path still captures data even when a namespace's Lambda is broken — nothing is lost, processing is just delayed until the fix ships.

The platform enforces the boundary (namespace, IAM, S3 prefix) but says nothing about what happens inside it. Process, tooling, language, deploy cadence, code review policy — all internal to the repo. One team vibe codes and ships ten times a day. Another does waterfall with mandatory code reviews. The platform doesn't care. The interface is the schema and the URL. Everything behind it is the team's business.

Opinionated about the contract. Silent about the implementation.

---

## Adding a new content source

1. Create a repo with a build that produces `out/` and `out/index.json`
2. Add a GitHub Actions workflow that syncs `out/` to `s3://<bucket>/<path>`
3. Add the section to `SECTIONS` in `scripts/aggregate-site.mjs`
4. Run the aggregate workflow to update `index.json`

The front end picks it up automatically on next load.

---

## Block extensions

Markdown files are extended with `[tag]:` blocks.

### Blocks have actions, not just rendering

A block is an action declaration, not just a display hint. Different tools read the same block and do different things with it.

| Block        | Render                                                    | Action                                                   |
| ------------ | --------------------------------------------------------- | -------------------------------------------------------- |
| `[journey]:` | `<details>` accordion                                     | Running log — accumulates over time, unpolished          |
| `[spec]:`    | `<details>` accordion                                     | Spec conversation — clarifying questions, link to spec   |
| `[design]:`  | `<img>` when `src:` present; SVG placeholder when missing | Creates a GitHub issue in the design repo with the brief |

The `[design]` block spans two concerns across repos:

- **Action** — owned by the design repo. A GitHub issue is created there with the block content as the brief so the designer sees it.
- **Render** — owned by the app repo (`lib/posts.ts`). Shows an SVG placeholder until the asset exists, then the real image once `src:` is populated and checked in. The placeholder-to-image transition happens on next build with no manual intervention.

### The file is the unit

One file, whole story. The idea, the spec conversation, the implementation log, the dead ends, the finished writing. Whatever the process was — short or long, clean or messy — it's all in one file. The blocks capture the stages. The file is the record.

The file lives in git. Every change is versioned. The `[commit sha]` inline reference in `[journey]:` blocks links specific moments in the narrative to specific commits. The whole history of an idea is traceable: when it was written, when the spec was added, when the implementation landed, which commits did what. Git is the audit trail.

Five years later you can open the file and reconstruct the whole thing — what you were thinking, what you tried, why you made the call you made, which commit broke it, which commit fixed it. Most codebases lose the reasoning. This keeps it.

Docs go stale because they're written separately from the work. The journal stays current because it _is_ the work — you can't build something without writing about it first. The journal is the source of truth by construction.

The goal is frictionless writing. You write in the file. You don't send emails to request images, you don't open GitHub to create issues, you don't switch to a different tool to generate a spec. You add a block and the tooling handles it.

A markdown file is both the human-readable document and the instruction set for tooling. The same file that renders as a journal entry on the site also drives GitHub issue creation, Kiro spec generation, and Bluesky publishing — depending on which blocks it contains and which tools process it.

### Extensibility

New `[tag]:` types can be added by defining their render behavior in `lib/posts.ts` and their action behavior in the relevant workflow or skill. No registration, no prefix, no coordination. Add a block, add a reader. Tools that don't know about a block skip it — the file stays valid markdown either way.

Specific features and problems are handled as journal entries. A journal entry is a finished, polished piece — the distilled account of what was built and why. The `[journey]:` block inside it is the raw log: the chat history, the dead ends, the approaches that didn't work. The journey doesn't need to be polished.

The journal-to-spec workflow converts a journal entry (or in-progress notes) into a targeted Kiro spec. The spec drives implementation. Once shipped, the journey block captures how it actually went.

This keeps the platform spec stable and the feature work incremental.
