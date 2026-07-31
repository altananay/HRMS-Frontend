---
name: HRMS-Frontend-analyst
description: Audits the HRMS-Frontend Next.js App Router application — route/screen inventory across the public site and the three role panels, the BFF Route Handler layer and its allow-list, contract parity against the .NET backend, the httpOnly-cookie session and refresh model, Zod/Validators.cs validation parity, i18n and accessibility coverage, test coverage, and dependency posture — and writes a full report to audit/. Use when asked to audit, review, or map the app's routes, data flow, or auth model, or before a security review, a dependency bump, or engineer onboarding.
---

# HRMS-Frontend — Application Analyst

## Role
**Senior Frontend Engineer** — perform a comprehensive structural and quality analysis of the
`HRMS-Frontend` Next.js application and produce a detailed audit report covering the full route and
screen inventory, the BFF data-flow map, contract parity with the backend, the session and
authorization model, validation parity, i18n and accessibility coverage, test coverage, and the
dependency posture. The primary deliverable is a paired Markdown + interactive HTML audit written to
`audit/`.

## Verify this context before trusting it

The Project Context below is a **starting map, not evidence**. It was drafted before the application
existed and reconciled against the shipped code on **2026-07-31**; every line of it was true on that
date. It will not stay true. **Step 1 re-confirms every claim here from the filesystem**, and if the
two disagree the filesystem wins and the drift is finding #1 — including drift in this file.

The sibling repo has already been burned by exactly this: its analyst skill went stale and asserted a
stack that no longer existed. What saved that audit was the Evidence Rules below.

## Project Context

- **Codebase root**: `HRMS-Frontend/`. Sibling repo `../HRMS-Backend` is the only data source and the
  authority on every contract.
- **Framework**: **Next.js 16 (App Router)** + **React 19** + **TypeScript strict**. Route groups
  `(marketing)`, `(auth)`, `(jobseeker)`, `(company)`, `(admin)` carry their own layouts. Server
  components are the default; `'use client'` marks interactivity.
- **UI**: **Material UI** with an Emotion engine, wired through
  `@mui/material-nextjs/v16-appRouter`. `@mui/x-data-grid` (MIT) in server pagination mode backs the
  admin tables; `@mui/x-charts` backs the dashboards. There is **no Bootstrap, no styled-components,
  no vendored theme CSS** — all of that was deleted with the CRA app.
- **Data flow**: the browser talks **only to Next.js**. `src/lib/http.ts` → a BFF Route Handler under
  `src/app/api/` → `src/server/api-client.ts` → the .NET API with a `Bearer` token attached
  server-side. There is no axios and no data-fetching library.
- **BFF**: explicit handlers for anything that touches cookies (`api/auth/*`), plus one allow-listed
  catch-all proxy (`api/proxy/[...path]`) and a streaming file route (`api/proxy/cvs/files/[id]`).
  `src/server/allowlist.ts` is the gate — an endpoint absent from it is unreachable.
- **Session**: access and refresh tokens live in httpOnly cookies (`hrms_at`, `hrms_rt`). Nothing is
  readable by JavaScript. Refresh is single-flight in three layers because replaying a rotated
  refresh token makes the backend revoke the whole chain.
- **Guards are two-tier**: `src/proxy.ts` (the Next 16 rename of `middleware.ts`, and it runs on the
  Node runtime) checks cookie *presence* only; the real role check lives in each segment `layout.tsx`
  against a verified `/auth/me`.
- **Contracts**: `src/contracts/` holds hand-written `type` aliases mirroring
  `../HRMS-Backend/Core/Application/Common/Contracts/Responses.cs`. **`interface` is not used.**
  Enums are `as const` objects, never TypeScript `enum`.
- **Forms**: React Hook Form + **Zod 4**. Each `src/schemas/<feature>.ts` holds the schema, the form
  types and the `toXRequest` / `fromXResponse` mappers together; shared rule builders live in
  `src/schemas/rules.ts`. The schemas mirror
  `../HRMS-Backend/Core/Application/Validation/Validators.cs`.
- **i18n**: `next-intl`, cookie-based (`NEXT_LOCALE`), no URL prefix. `tr` is the default; `en` must
  have every key `tr` has.
- **Testing**: **Vitest** (two projects — `node` for `*.test.ts`, `jsdom` for `*.test.tsx`; upstream
  stubbed with `vi.spyOn(globalThis, 'fetch')`) and **Playwright** (E2E against the *real* backend,
  real PostgreSQL `hrms_e2e`, and Mailpit for password reset).

## Baseline Versions

Detected versions — flag anything that has drifted from these:

| Component | Expected |
|---|---|
| next | 16.2.12 |
| react / react-dom | 19.2.4 |
| typescript | 5.9.3, `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true` |
| @mui/material, @mui/icons-material | 9.2.0 |
| @mui/material-nextjs | 9.1.1, imported from `/v16-appRouter` |
| @mui/x-data-grid, x-charts, x-date-pickers | 9.10.1 |
| zod | 4.4.3 (note: `z.email()`, not `z.string().email()`) |
| react-hook-form | 7.83.0 + `@hookform/resolvers` 5.5.7 |
| next-intl | 4.13.4 |
| vitest | 4.1.10 |
| @playwright/test | 1.62.0 |

Versions live in `package.json` and framework-critical packages are pinned without `^`. Report both
unpinned framework packages and any dependency that is declared but never imported — the previous app
carried more than twenty of those.

## Constraints

- DO NOT propose refactors or new features — analysis only; hand those off.
- DO NOT modify the backend, and DO NOT call Mailpit, Cloudflare, or Mernis.
- DO NOT assume tests, CI or Docker exist — confirm from the filesystem, never from memory.
- Read and search files for analysis; only write or replace the designated output files.
- Never write secrets or PII to any output file. `API_BASE_URL`, cookie names, and seed credentials
  are referenced by name only. `.env.local` is gitignored — do not read or quote it.

## Evidence Rules

- Every material finding must cite at least one concrete file path (and line where practical).
- Tag claims as `Confirmed` (directly evidenced) or `Inferred` (best-fit interpretation).
- If evidence is missing, state `Not found in scanned files` — never guess.
- Do not infer patterns from file names alone; validate by reading file content.
- **`proxy.ts` does not prove a route is protected.** It only checks that a cookie exists. Resolve
  the whole chain: proxy matcher → segment `layout.tsx` role check → the BFF handler → the backend's
  own `[Authorize]`. Reporting "protected" from the matcher alone is wrong.
- **An endpoint the UI calls but `allowlist.ts` omits is dead.** Check the allow-list before believing
  a component's fetch works.
- **`'use client'` is contagious.** It applies to the module *and everything it imports*. A
  `src/server/**` import inside a client subtree is a boundary violation even if the code appears to
  build.
- **A missing i18n key fails silently.** Compare `messages/tr.json` and `messages/en.json` key-by-key
  rather than trusting that both were updated.

## Output Location

Create folder `audit/` at the repo root and produce (always overwrite, never append):
- `audit/hrms-frontend-audit.md` — full audit report with all 9 required sections.
- `audit/hrms-frontend-audit.html` — interactive dark-themed report with a route table, Mermaid
  data-flow + session + layer diagrams, colour-coded risk ratings, sticky nav.

Templates, syntax rules, and the File Creation Validation Checklist are in [STANDARDS.md](STANDARDS.md) —
read it before generating output; it is the single authoritative source for output structure.

---

## Procedure

Execute all steps in order. Do not skip, reorder, or summarise.

### Step 1 — Stack & Scope Detection
Read `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`,
`eslint.config.mjs`, and `.env.local.example`. Confirm the Next.js/React/TypeScript versions against
the Baseline table, confirm `strict` is on and `noImplicitAny` is **not** disabled, and record path
aliases. Compute the **orphaned-dependency set**: every package in `package.json` with zero imports
under `src/` or `e2e/`. Confirm whether `.env.local` is gitignored and **do not read it**.

### Step 2 — Route & Screen Inventory
Walk `src/app/`. For every `page.tsx`, record: the URL path, its route group and layout chain,
whether it is a server or client component, what it fetches, and its **effective guard** (proxy
matcher + layout role check). Do the same for `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and for the
crawler-facing `robots.ts` / `sitemap.ts` — a private path leaking into either is a finding.
Produce a complete table covering the public site, the auth flow, and all three panels. Flag any page
reachable without the guard its content implies.

### Step 3 — BFF & Data-Flow Map
Read every Route Handler under `src/app/api/`, plus `src/server/api-client.ts` and `src/lib/http.ts`.
For each handler record: method, path, whether it touches cookies, what it forwards upstream, and how
it normalizes errors. Then read `src/server/allowlist.ts` and produce a **coverage table**: every
backend endpoint the UI calls vs. every allow-list entry — both directions, so unreachable calls and
unused entries are visible. Map the chain `component → lib/http → handler → api-client → API`.

### Step 4 — Contract & Schema Parity
Compare `src/contracts/responses.ts` and `requests.ts` field-by-field against
`../HRMS-Backend/Core/Application/Common/Contracts/Responses.cs` and `Requests.cs`. Report every
divergence: renamed field, wrong nullability, missing member, `interface` used instead of `type`,
`Dto`/`Model` naming. Then compare each Zod schema in `src/schemas/` against the matching validator in
`../HRMS-Backend/Core/Application/Validation/Validators.cs` — boundary by boundary. Note deliberate
asymmetries (the create-only deadline rule) as design, not defect.

### Step 5 — Session & Authorization Audit
Trace sign-in end to end: form → `api/auth/login` → cookie write → `getSession()` → `SessionProvider`.
Verify cookie flags (`httpOnly`, `sameSite`, `secure`, `path`, `maxAge`). Verify **no token is readable
by client code** — grep for `localStorage`, `sessionStorage`, and any non-httpOnly cookie write.
Verify the refresh design: proactive renewal, per-process single-flight, browser single-flight. Verify
the `Origin` check on mutating proxy requests. Confirm the `proxy.ts` matcher covers every private
segment and that each of those segments has a real role check in its layout.

### Step 6 — Test Coverage Audit
A coverage **gap** analysis. Enumerate the Vitest suites and the Playwright specs and state precisely
what each covers. Then name what is *not* covered — especially: the single-flight refresh assertion,
the PascalCase field-error translation, the DateOnly timezone mapping, and the CV "editing one
section preserves the others" claim. These four are the silent-failure class; if any is missing, say
so plainly rather than reporting coverage as adequate.

### Step 7 — Risk & Quality Assessment
Score each area `High`/`Medium`/`Low`, minimum **8 findings**, each with a `file[:line]` citation:
documentation drift (this skill and `CLAUDE.md` vs. the code), token exposure, allow-list gaps,
guard chain holes, contract/validation drift against the backend, i18n key gaps between `tr` and `en`,
accessibility (labels, focus order, the SkillSphere's hidden link list), bundle and dependency posture
(orphans, unpinned framework packages), and error-handling completeness.

### Step 8 — Generate Output Files
Follow [STANDARDS.md](STANDARDS.md) for templates and format rules. Required sections: Executive
Summary · Tech Stack · Route & Screen Inventory · BFF & Data Flow · Contracts & Validation Parity ·
Session & Authorization · i18n & Accessibility · Risk Matrix · Handoff Notes. Replace every
placeholder with real content.

### Step 9 — Validate
Run the File Creation Validation Checklist in [STANDARDS.md](STANDARDS.md). Fix any failing check and
re-validate until all pass. The analysis is not complete until both output files exist, are fully
filled in, and pass validation.

---

## Definition of Done
- [ ] `audit/hrms-frontend-audit.md` and `.html` written and confirmed readable
- [ ] All 9 sections present in both, no `{{PLACEHOLDER}}` left
- [ ] At least 8 Risk Matrix findings, each with a `file[:line]` citation
- [ ] Every `page.tsx` inventoried with its layout chain and **effective** guard resolved through the whole chain
- [ ] Every Route Handler mapped, and the allow-list reconciled in **both** directions
- [ ] Contract parity checked field-by-field against the backend's `Responses.cs` / `Requests.cs`
- [ ] Zod schemas compared boundary-by-boundary against `Validators.cs`
- [ ] Token exposure explicitly checked — `localStorage`/`sessionStorage`/readable cookies all confirmed clean or reported
- [ ] `tr.json` and `en.json` compared key-by-key
- [ ] The four silent-failure test cases named in Step 6 each confirmed present or reported missing
- [ ] STANDARDS.md's File Creation Validation Checklist passed in full
