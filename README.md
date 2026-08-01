# HRMS-Frontend

The web client for a Human Resources Management System. Employers publish job advertisements, job
seekers build a résumé and apply, system staff moderate everything.

Next.js 16 (App Router) · React 19 · TypeScript strict · Material UI · React Hook Form + Zod ·
next-intl (TR/EN). The .NET API lives in a sibling repository, `../HRMS-Backend`, and is the only data
source.

> This replaced a Create React App SPA. Nothing was migrated — the old client had no tests, no route
> guards, and never attached an `Authorization` header to any request.

---

## Requirements

| | |
|---|---|
| Node.js | ≥ 20.9 |
| .NET SDK | 10 — for the backend |
| Docker | for PostgreSQL, Mailpit and Seq |

## Running it

Three terminals. The backend first, because the frontend has no data of its own.

```bash
cd ../HRMS-Backend && docker compose up -d
```

```bash
cd ../HRMS-Backend && dotnet run --project Presentation/WebAPI
```

```bash
cp .env.local.example .env.local
npm install
NODE_OPTIONS=--use-system-ca npm run dev
```

`NODE_OPTIONS=--use-system-ca` is what makes Node trust the ASP.NET development certificate on
`https://localhost:7129`. Without it every request through the BFF fails with
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`, which reads like a broken login rather than a certificate problem.

Then: <http://localhost:3000>. Mailpit's inbox — where password-reset mail lands in development — is
at <http://localhost:8025>, and the backend's logs are at <http://localhost:8081>.

### Signing in

The backend seeds one administrator on first run — `admin@hrms.local`, with the password in the
backend's `appsettings.Development.json` under `Seed`. Everyone else registers through the app:
**Kayıt ol** offers a job seeker and an employer form, and registration signs you straight in.

## Scripts

| | |
|---|---|
| `npm run dev` | development server |
| `npm run build` | production build — must stay clean |
| `npm start` | serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest, once |
| `npm run test:watch` | Vitest, watching |
| `npm run e2e` | Playwright, against the real backend |
| `npm run e2e:ui` | the same suite in Playwright's UI |

`npm run e2e` needs no server running: it brings up docker, recreates the `hrms_e2e` database, builds
the app, then starts both the API and the production server itself. It refuses to reuse a server
already listening on 5129 or 3000 — reusing one would silently run the whole suite against your own
database.

## How it is put together

```
Browser ──HTTP──▶ Next.js BFF ──HTTP──▶ .NET API
          cookies    (src/app/api)         (Bearer)
```

The browser never sees a token and never talks to the API. Access and refresh tokens live in
httpOnly cookies that only the server can read; every browser request goes to a Route Handler in
`src/app/api`, which attaches the token and forwards it. `src/server/allowlist.ts` decides which
upstream endpoints the generic proxy will forward at all.

```
src/
├─ proxy.ts        runs before every request: session presence + proactive token refresh
├─ app/
│  ├─ (marketing)  public job board, company directory, contact
│  ├─ (auth)       sign in, register, password reset
│  ├─ (jobseeker)  profile, résumé, applications
│  ├─ (company)    dashboard, postings, applicants
│  ├─ (admin)      ten moderation screens
│  └─ api/         the BFF — auth handlers plus one allow-listed proxy
├─ server/         session, tokens, api-client, guards — never imported by a client component
├─ contracts/      wire types, mirroring the backend's Responses.cs
├─ schemas/        Zod schemas + form ⇄ wire mappers
├─ components/     UI, grouped the same way as the route groups
├─ i18n/           next-intl config and the TR/EN message files
└─ theme/          MUI theme, tokens, fonts
```

Language is a cookie (`NEXT_LOCALE`), not a URL segment, and switches from the header. Dark mode uses
MUI's CSS-variable color scheme, so there is no flash of the wrong theme on first paint.

## Testing

**Vitest** covers the parts where a mistake is silent: the token refresh, the proxy allow-list, the
ProblemDetails normalizer, the C#-to-RHF field-error translation, the Zod schemas at their exact
boundaries, and the date mappers. Upstream is stubbed at `globalThis.fetch`, so the real
request-building code still runs.

**Playwright** runs against the real API and a real PostgreSQL. Each spec creates its own users
through the API, which is what makes the suite safe to run fully parallel. One spec is an axe pass
over the public site and all three panels, in both light and dark, so a contrast or labelling
regression fails the build. Neither runner executes React Server Components — a page's modules are
unit-tested, and the rendered result is asserted in Playwright.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — the working standards for this repo: layering, error handling, the
  non-negotiables, and the traps that cost a day each.
- [`SECURITY-NOTES.md`](SECURITY-NOTES.md) — why the open `npm audit` findings stay open.
- `.claude/skills/HRMS-Frontend-analyst/` — the codebase-audit skill.

## Licence

See [LICENSE.md](LICENSE.md).
