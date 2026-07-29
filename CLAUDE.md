# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# CLAUDE.md — Project Standards

> Read automatically at the start of every session. Single source of truth for how to work in this
> codebase. Keep it honest — every line should earn its place.

> **⚠ Written ahead of the code.** This file was authored in P0, before the application existed, and
> describes the *target* architecture the rewrite plan defines. P10 re-reads it against the real code
> and corrects the drift. Until that phase closes, treat a disagreement between this file and the
> filesystem as this file being wrong. **Delete this notice in P10.**

---

## 1) Project Overview

**HRMS-Frontend** — the web client for a Human Resources Management System: employers post job
advertisements, job seekers register and apply, system staff moderate.

Stack: **Next.js 16 (App Router)**, **React 19**, **TypeScript strict**, **Material UI**, **React
Hook Form + Zod 4**, **next-intl** (TR/EN), and a **BFF layer** of Route Handlers that owns the
session and proxies to the .NET API. Data fetching is plain `fetch` — there is no axios and no data
library.

Surfaces: a public job board, a unified auth flow, and three panels — **job seeker**, **company**,
**admin**. Identifiers are English; user-facing copy comes from i18n message files.

> **History.** This was a Create React App + React 18 SPA styled with Bootstrap 5 and ~56,500 lines
> of vendored theme CSS (Argon Dashboard, Start Bootstrap "New Age"), with Formik + Yup forms, axios,
> and tokens in `localStorage` under two different keys. It had no tests, no route guards, and never
> attached an `Authorization` header to any request. It was replaced wholesale, not migrated. If you
> find a comment explaining "the old code did X" — that is deliberate.

## 2) Philosophy

1. **Follow the flow.** `Client component → lib/http → BFF Route Handler → server/api-client →
   .NET API`. Don't collapse a hop and don't add a competing one.
2. **Server components by default.** `'use client'` is for interactivity — forms, canvas, dialogs,
   anything with a listener. A page that only reads and renders stays on the server.
3. **The backend is the authority.** Every rule here (validation, authorization, paging) mirrors
   something the API already enforces. The client copy exists for UX, never as the only check.
4. **Contracts mirror the backend verbatim.** If `Responses.cs` renames a field, so do we — same
   name, same shape, same day.
5. **Small diffs.** Match the sibling screen.

---

## 3) Non-Negotiables

If any item below is violated, the change is invalid.

1. **A token never reaches the browser.** Access and refresh tokens live only in httpOnly cookies
   and in server memory. Nothing goes in `localStorage`, `sessionStorage`, or a readable cookie —
   the pre-rewrite client kept raw JWTs in `localStorage` under two keys.
2. **No component calls the .NET API directly.** Every request goes through the BFF. A `fetch` to
   `process.env.API_BASE_URL` outside `src/server/**` is a bug, not a shortcut.
3. **Every proxied endpoint is on the allow-list.** `src/server/allowlist.ts` is the gate; an
   endpoint that isn't listed is rejected. An open cookie-authenticated proxy is a CSRF amplifier.
4. **Request/response types are `type` aliases, never `interface`**, and are named exactly like the
   backend's: `*Request` / `*Response`. No `Dto`, no `Model`, no `I` prefix.
5. **User-facing text comes from an i18n key.** Never render a raw backend `message`/`detail` as the
   primary copy — the API speaks Turkish and the UI may be English. Backend text is a fallback only.
6. **Never log or render PII.** National IDs (TCKN), passwords, tokens, whole request bodies. A 500
   `detail` from the API carries a .NET stack trace in Development — log it server-side, never show it.
7. **Validation is written twice on purpose.** Zod schemas mirror `Core/Application/Validation/Validators.cs`.
   If you change one, change the other, and say so.
8. No TODO placeholders. No silent empty `catch`. No `any` without a justification comment.
9. **Package versions are pinned in `package.json`**; no `^` on framework-critical packages
   (`next`, `react`, `@mui/*`).

---

## 4) Commands

```bash
# Backend + infrastructure (postgres 5433, seq 8081, mailpit 8025)
cd ../HRMS-Backend && docker compose up -d
dotnet run --project Presentation/WebAPI

# Frontend
npm run dev            # http://localhost:3000
npm run build          # production build — must be clean
npm run test           # Vitest
npm run test:watch
npm run e2e            # Playwright, against the real backend
npm run e2e:ui
npm run lint
```

`NODE_OPTIONS=--use-system-ca` is needed in the everyday dev loop so Node trusts the ASP.NET dev
certificate on `https://localhost:7129`. E2E sidesteps it by running the API over plain HTTP.

---

## 5) Working Agreement

**Before changing code** — open the sibling screen first. To change the company job form, read
`src/components/company/JobAdvertisementForm.tsx`, `src/schemas/job-advertisement.ts` and its
`.map.ts`, then mirror the pattern.

**While changing code** — a new endpoint means a new allow-list entry. A new form means a Zod schema
and a mapper. A new user-facing string means a key in **both** `messages/tr.json` and `messages/en.json`.

**After changing code** — `npm run build` clean, `npm run test` green. If you touched the BFF or a
guard, run `npm run e2e` too.

---

## 6) Code Style

2-space indent, single quotes, no semicolon debates — Prettier decides. `PascalCase` components,
`camelCase` everything else, `kebab-case` file names except components (`JobAdvertisementForm.tsx`).

- **Contracts** (`src/contracts/`): one file per concern — `enums.ts`, `envelope.ts`, `responses.ts`,
  `requests.ts`. Types only, no logic, no imports from outside `contracts/`.
- **Schemas** (`src/schemas/`): `<feature>.ts` holds the Zod schema and its inferred form type;
  `<feature>.map.ts` holds `toXRequest` / `fromXResponse`. Mappers carry a compile-time
  `Assert<Equals<…>>` so a contract change fails `tsc` rather than runtime.
- **Server-only modules** (`src/server/`): never imported by a client component. Add
  `import 'server-only'` at the top so the boundary is enforced by the bundler, not by discipline.
- **Form fields**: use the `RHF*` wrappers in `src/components/form/`. A bare MUI `TextField` inside a
  form means the wrapper is missing a feature — add it there, not inline.
- **Enums** are `as const` objects plus a union type, never TypeScript `enum`.
- **Theme** (`src/theme/`): `palette.ts` holds the raw scales, `theme.ts` builds the theme,
  `tokens.ts` holds plain-string tokens for server components, `fonts.ts` owns `next/font`.
  Component look belongs in `theme.ts` `components.*`, not repeated in `sx` on every screen.

> **⚠ No function props from a server component.** MUI components are client components, so anything
> passed to them must be serializable. These all throw at request time — and `next build` will not
> catch it, because the pages are dynamic and nothing renders them until a request arrives:
>
> ```tsx
> sx={(theme) => ({ … })}              // function prop
> sx={{ zIndex: (theme) => … }}        // function value inside the prop
> ...theme.applyStyles('dark', { … })  // needs the theme, so needs the callback
> component={Link}                     // a component reference is a function
> ```
>
> Use `src/theme/tokens.ts` instead — `darkScheme` for a dark-mode branch in a plain object,
> `displayFontFamily` for the heading stack — and plain `href` for links: the theme registers
> `LinkBehavior` on `MuiButtonBase.LinkComponent` and `MuiLink.component`, so `<Button href="/jobs">`
> routes through Next from a server component. Inside a `'use client'` file the callback forms are
> fine and preferred.
>
> MUI v9 also dropped the system props from `Stack` and `Grid`: `alignItems` and `justifyContent` go
> in `sx`, and `Grid` sizes with `size={{ xs: 12, md: 6 }}` (there is no `item` prop).

---

## 7) Layering (one-way)

```
contracts  ←  schemas  ←  components
    ↑                        │
    └────  server/  ←  app/api (BFF)  ←──┘   (client → BFF over HTTP, never by import)
```

| Directory | Contains | May import |
|---|---|---|
| `src/contracts` | wire types, enums, envelope | **nothing** |
| `src/schemas` | Zod schemas + mappers | `contracts`, `zod` |
| `src/server` | session, api-client, problem-details, allow-list | `contracts`, Node built-ins |
| `src/app/api` | BFF Route Handlers | `server`, `contracts` |
| `src/components` | UI | `contracts`, `schemas`, `lib`, MUI |
| `src/app/(groups)` | pages and layouts | everything above |

**A client component must never import from `src/server/`.** The `server-only` marker makes that a
build error. The browser reaches the server exclusively over HTTP, through `src/lib/http.ts`.

## 8) Error Handling

Everything the API returns is normalized once, in `src/server/problem-details.ts`, into a single
`ApiError` shape (`status`, `code`, `title`, `detail?`, `fieldErrors?`).

| Backend | `code` | UI |
|---|---|---|
| 400 + `errors` | `validation` | `fieldErrors` → `setError` on the matching RHF fields |
| 400 without `errors` | `validation` | toast from an i18n key |
| 401 | `unauthorized` | refresh once, then sign out |
| 403 | `forbidden` | 403 screen |
| 404 | `not_found` | `notFound()` |
| 409 | `conflict` | toast — **always surface something specific** (duplicate application, file rejected) |
| 429 | `rate_limited` | "try again shortly" toast |
| 5xx | `server` | generic toast; the real detail is logged server-side only |

> **The trap:** `ValidationProblemDetails` keys are C# property paths (`Educations[0].School`), RHF
> wants `educations.0.school`. `src/server/field-errors.ts` translates. Get it wrong and every
> server-side validation error disappears **with no console warning** — hence its own unit test and
> an E2E test.

## 9) Testing

Two runners, both must stay green.

- **Vitest** — the BFF handlers, `problem-details`, `field-errors`, `session` (including the
  single-flight refresh), Zod schemas at their exact boundaries, mappers, hooks, a few components.
  Upstream is mocked with `msw` so real `fetch` semantics are exercised.
- **Playwright** — against the **real** backend and a real PostgreSQL (`hrms_e2e`), with Mailpit for
  the password-reset flow. `globalSetup` brings up docker; `webServer` starts the API and `next dev`.

> **Neither runner executes React Server Components.** Don't try to unit-test an RSC page — test the
> modules it calls and assert the rendered result in Playwright.

The rate limiter partitions by IP, so all Playwright workers share one bucket: the API is started
with `RateLimiting__Auth__PermitLimit` raised, exactly as the backend's own functional suite does.

## 10) Security

- **Session is server-side.** `hrms_at` / `hrms_rt`, httpOnly, `sameSite=lax`, `secure` in production.
- **Refresh is single-flight, in three layers** — proactive (before expiry), per-process, and
  per-browser. This is not over-engineering: replaying a rotated refresh token makes the backend
  revoke the entire chain and bump the security stamp, which logs the user out everywhere and
  surfaces as an ordinary 401.
- **CSRF**: `sameSite=lax` plus an `Origin` check on every mutating proxy request.
- **Guards are two-tier.** `middleware.ts` only checks that a cookie exists (the Edge runtime cannot
  verify a JWT and the signing key must never be copied here); the real role check happens in the
  segment layout against a verified `/auth/me`. The backend remains the only authority.
- **CV files** are personal data: they stream through an authorized proxy, are never given a URL that
  works without the session cookie, and are `cache-control: private, no-store`.
- **No secrets in the client bundle.** Anything prefixed `NEXT_PUBLIC_` is public by definition —
  `API_BASE_URL` is not, and must stay server-side.

## 11) Dependencies

Before adding a package: check whether MUI, the Next.js runtime, or a ~40-line local module already
covers it. The rewrite deleted 20+ dependencies that were installed and never imported.

| Purpose | Package |
|---|---|
| Framework | `next` **16.2.12**, `react` / `react-dom` 19 |
| UI | `@mui/material`, `@mui/material-nextjs` (`/v16-appRouter`), `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-charts`, `@mui/x-date-pickers` |
| Styling engine | `@emotion/react`, `@emotion/styled` |
| Forms | `react-hook-form`, `zod` (4.x), `@hookform/resolvers` |
| i18n | `next-intl` |
| Dates | `dayjs` |
| Tests | `vitest`, `@testing-library/*`, `jsdom`, `msw`, `@playwright/test` |

**Deliberately absent:** axios, formik, yup, bootstrap, react-bootstrap, jquery, sass,
styled-components, react-toastify, react-select, react-transition-group, jwt-decode, uuid,
animate.css, loaders.css, FontAwesome. Toasts are MUI `Snackbar`; charts are `@mui/x-charts`; the
tag-cloud animation is ~180 lines of local canvas code.

## 12) External Integrations

- **HRMS-Backend** (`../HRMS-Backend`) — the only data source. `https://localhost:7129` in dev,
  reached **server-side only**. CORS is irrelevant under the BFF and must not be modified.
- **Mailpit** (`localhost:1025` SMTP, `:8025` web UI) — password-reset mail in dev and E2E.
- **Seq** (`localhost:8081`) — backend logs. Keep it open while working on the BFF: refresh-token
  revocation and every rejected token validation are visible there in real time.

## 13) AI Interaction Rules

- **Read the backend before guessing a contract.** `Core/Application/Common/Contracts/Responses.cs`
  and `Validation/Validators.cs` are the source of truth, not this file's summary of them.
- **Do not invent features or patterns.** No new state library, no new auth scheme, no extra packages
  unless asked.
- **Ask before behaviour changes.** API contract, authorization, and navigation structure are the
  user's call.
- **Verify.** `npm run build`, `npm run test`, and exercise the screen in a browser before handing back.
- **Be brief.** Short sentences. Cut the fluff.
