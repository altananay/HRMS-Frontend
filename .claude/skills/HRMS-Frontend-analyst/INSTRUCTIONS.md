# HRMS-Frontend — Skill Notes

> Supporting reference for [SKILL.md](SKILL.md). Not required reading to run the skill — this is for
> maintaining/extending the skill itself.

## How this skill is invoked

Standard Claude Code project skill at `.claude/skills/HRMS-Frontend-analyst/`. Discovery and
invocation are native — there is no orchestration layer to maintain:

- **Automatic**: Claude loads it when a prompt matches `SKILL.md`'s `description` (e.g. "audit the
  frontend", "map the routes", "check the session model").
- **Manual**: type `/HRMS-Frontend-analyst` (the command name comes from the directory name, not the
  frontmatter `name` field — keep the two in sync anyway).
- **Via the subagent**: `.claude/agents/HRMS-Frontend-analyst.md` is a thin subagent whose whole job
  is to follow this skill.
- Only `SKILL.md` loads automatically. `STANDARDS.md` and this file are read on demand, which keeps
  the always-in-context cost to the `description` line until the skill actually runs.

## File layout

| File | Purpose |
|---|---|
| `SKILL.md` | Entry point — role, project context, baseline versions, constraints, the 9-step procedure. Required. |
| `STANDARDS.md` | Output templates, syntax rules, the File Creation Validation Checklist. Loaded when generating/validating output. |
| `INSTRUCTIONS.md` (this file) | Maintenance notes only — not part of the audit procedure. |

---

## The drift problem — read this before editing anything

**This skill was written before the application existed.** It was authored in P0 of the rewrite, from
the plan, describing a Next.js app that had not been scaffolded yet. Every claim in its Project
Context is a *prediction* until P10 verifies it against real code.

That is not hypothetical carelessness — the sibling repo's analyst skill went stale exactly this way.
It was written against a .NET 7 / MongoDB / Autofac codebase, that codebase was rewritten, and the
skill kept asserting the old world as fact, including the line *"a .NET 10 modernization is planned
but not started"* long after it had landed. An audit run against it would have produced a confident,
thoroughly-formatted, **completely wrong** report. What saved it was the Evidence Rules: *validate by
reading file content*, *confirm from the filesystem, never from memory*. The auditor read the code,
saw the contradiction, and reported the skill itself as finding #1.

Two things follow, and both are baked into `SKILL.md`:

1. **The Project Context is labelled a map, not evidence.** Step 1 re-confirms it and treats any
   contradiction as finding #1. Do not remove that framing — it is the safety net.
2. **Step 7 checks documentation drift as a standing audit area**, alongside security and
   dependencies. The skill audits itself every run.

When you change the architecture, update the docs in the same change. There are **four** artifacts in
this repo and they drift apart quietly:

- `.claude/skills/HRMS-Frontend-analyst/SKILL.md` + `STANDARDS.md` (this skill)
- `.claude/agents/HRMS-Frontend-analyst.md` (the subagent that runs it)
- root `CLAUDE.md` (always-loaded project standards)
- root `README.md` (the human-facing entry point)

And a fifth, across the boundary: **`../HRMS-Backend/Core/Application/Common/Contracts/`**. When the
backend renames a field, this repo's `src/contracts/` must follow the same day. Step 4 exists to catch
the day it doesn't.

---

## Repo-specific caveats to keep in sync with SKILL.md

These are the points where a generic Next.js audit would get this codebase wrong.

- **The browser never talks to the API.** Every request goes through the BFF. An audit that inventories
  "API calls" by grepping for the backend host will find nothing and conclude the app has no data
  layer. Follow `lib/http.ts` → Route Handler → `server/api-client.ts` instead.
- **`middleware.ts` is not the guard.** It checks cookie presence, nothing more, because the Edge
  runtime cannot verify a JWT and the backend's signing key must never be copied here. The real role
  check is in each segment `layout.tsx`. **Rule 5 in `STANDARDS.md` carries this — do not delete it.**
- **`src/server/allowlist.ts` is load-bearing.** The catch-all proxy rejects anything not on it, so a
  UI call to a missing entry fails at runtime with no compile error. Reconcile in both directions:
  dead calls *and* dead surface.
- **`'use client'` is contagious.** It applies to the module and everything it imports transitively. A
  `src/server/**` import inside a client subtree is a boundary violation; `import 'server-only'` is
  what turns it into a build error rather than a leak.
- **Contracts are `type`, never `interface`**, and mirror the backend's `*Request`/`*Response` names
  exactly. `Dto`, `Model`, or an `I` prefix appearing anywhere is drift, not style.
- **Zod schemas are a deliberate duplicate** of `Validators.cs`. They exist for UX; the server is
  still the only real check. One asymmetry is intentional and must not be "fixed": the
  `Deadline >= today` rule exists only in the *create* validator, so the client schema gates it on
  create mode — otherwise editing an expired advertisement becomes impossible client-side while the
  server would have allowed it.
- **The refresh design is not over-engineering.** Replaying a rotated refresh token makes the backend
  revoke the entire chain and bump the security stamp, logging the user out everywhere and surfacing
  as an ordinary 401. Three single-flight layers (proactive, per-process, per-browser) exist because
  of that. If any layer is removed, that is a High finding.
- **Field-error translation fails silently.** `ValidationProblemDetails` keys are C# property paths
  (`Educations[0].School`); RHF wants `educations.0.school`. If `src/server/field-errors.ts` is wrong,
  server-side validation errors vanish with no console warning. Same class as the CV partial-PUT
  problem: no error, just missing behaviour.
- **DateOnly is a timezone trap.** `toISOString().slice(0,10)` on a local midnight shifts the date back
  a day in UTC+3, which the backend's create validator then rejects. Mappers must use local date parts.
- **i18n keys fail open.** A key missing from `en.json` renders the key name or the `tr` fallback
  depending on configuration — either way, no error. `src/i18n/messages.d.ts` types the keys against
  `tr.json` and `messages.test.ts` asserts `en.json` matches; both halves are needed.
- **A server component may not pass a function to a MUI component.** MUI components are client
  components, so props crossing the boundary must be serializable. That rules out `sx={(theme) => …}`,
  a function *value* inside `sx` (`zIndex: (theme) => …`), `theme.applyStyles(…)`, and
  `component={Link}`. `src/theme/tokens.ts` holds the plain-string replacements (`darkScheme`,
  `displayFontFamily`) and the theme registers `LinkBehavior` as `MuiButtonBase.LinkComponent` /
  `MuiLink.component` so `href` alone routes. **`next build` does not catch this** — the pages are
  dynamic, so nothing renders them until a request arrives and then every one 500s. Report a function
  prop in a non-`'use client'` file as a High finding.
- **MUI v9 removed the system props from `Stack` and `Grid`.** `alignItems` / `justifyContent` as
  direct props no longer type-check; they belong in `sx`. `Grid` also has no `item` prop — sizing is
  `size={{ xs: 12, md: 6 }}`.
- **Never set `overflow-x: hidden` on `body`.** Setting one axis to `hidden` computes the other to
  `auto`, which makes `<body>` the scroll container instead of the viewport — and scroll events on a
  non-viewport container never reach `window`. Everything listening for page scroll silently stops,
  `useScrollTrigger` included, with no error: the header just never frosts. `theme.ts` carries a comment
  where the rule used to be. Wide content gets its own `overflow-x: auto` wrapper.
- **Tests, Docker and CI all exist.** Step 6 is a coverage-*gap* analysis, not an absence finding —
  unlike the pre-rewrite app, which had literally zero tests.
- **E2E runs against the real backend**, so it needs `docker compose up` and a `dotnet run`. If the
  suite is red, check whether the API is up before assuming a frontend regression. The auth rate
  limiter partitions by IP and all Playwright workers share one bucket — the API is started with
  `RateLimiting__Auth__PermitLimit` raised.

---

## Baseline versions

`SKILL.md` carries the expected version table. **Update it whenever `package.json` moves**, or the
skill will report the current state against a stale baseline — the failure mode this whole file exists
to prevent.

## Adding another skill to this project

Create `.claude/skills/<new-skill-name>/SKILL.md` with `name`/`description` frontmatter (description
drives auto-invocation — put the trigger phrase first). Add supporting files in the same directory and
reference them from `SKILL.md` with a relative markdown link. Keep `SKILL.md` under ~500 lines; move
long reference material to supporting files. Each skill directory is self-contained and Claude Code
discovers it automatically.
