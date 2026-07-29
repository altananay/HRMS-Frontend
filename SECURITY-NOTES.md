# Accepted `npm audit` findings

`npm audit` reports 12 high-severity advisories on a clean install. All of them are transitive, none
comes from a version this project chose, and none is fixable today without making things worse. This
file records what they are and why they stay, so the next person does not have to re-derive it.

Re-check with `npm audit` after any dependency bump and update this file.

## Do not run `npm audit fix --force`

It resolves the `next` advisories by **downgrading Next.js from 16.2.12 to 9.3.3** — npm's resolver
walking back to a version that predates the advisory rather than forward to a fix. That would undo
the entire framework.

## The eslint chain — 8 findings

`brace-expansion` → `minimatch` → `eslint-plugin-import` / `eslint-plugin-jsx-a11y` /
`eslint-plugin-react` → `eslint-config-next` → `eslint`.

Root cause: `brace-expansion@1.1.17` (DoS via unbounded expansion). `brace-expansion@5.0.8` is also
installed and is patched; the vulnerable 1.x copy arrives through `minimatch@3.x`, which
`eslint-config-next@16.2.12` bundles under its own `node_modules`.

npm names `eslint@10.8.0` as the fix. **Tried and reverted:** ESLint 10 crashes
`eslint-plugin-react`'s `getReactVersionFromContext` — the bundled copy inside `eslint-config-next`
is not compatible — so `npm run lint` fails outright, and the finding count only drops from 12 to 9
because the bundled plugin copies keep their own vulnerable `minimatch`. Net effect: no linting, for
a marginal improvement. Pinned back to `eslint@9.39.5`.

Assessment: lint-time only, never in a shipped bundle, and the input is this repo's own source. Not a
runtime exposure. Resolves upstream when `eslint-config-next` refreshes its bundled plugins.

## `postcss` — 1 finding

XSS via unescaped `</style>` in stringify output, and file read via attacker-controlled
`sourceMappingURL`. Arrives inside `next@16.2.12`; 16.2.12 is the newest patch on that line.

Assessment: both vectors need attacker-controlled CSS reaching the compiler. All CSS here is authored
in this repo — there is no user-supplied stylesheet path anywhere in the app.

## `sharp` — 1 finding

Inherited libvips CVEs (CVE-2026-33327, -33328, -35590, -35591). Arrives inside `next@16.2.12` for
the image optimizer.

Assessment: the optimizer only ever processes the seven files in `public/images/`, all committed
here. Nothing accepts a remote or user-supplied image. `next.config.ts` declares no
`images.remotePatterns`, so `/_next/image` cannot be pointed at an external host — **keep it that
way**, because adding one is what would turn this into a real exposure.

## What would change the assessment

- Adding `images.remotePatterns` or any user-supplied image source → the `sharp` finding becomes live.
- Processing CSS from outside this repo → the `postcss` finding becomes live.
- Deploying this anywhere reachable from another machine → re-evaluate all of it. The project is
  local-only today (`CLAUDE.md` §12).
