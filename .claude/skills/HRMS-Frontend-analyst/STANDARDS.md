# HRMS-Frontend — Application Analyst Standards

> **Supporting reference for [SKILL.md](SKILL.md).** Extends its Role, Project Context, and Constraints sections.
> This file adds output templates, syntax rules, and the File Creation Validation Checklist. Load it only when
> generating or validating the output files — SKILL.md's Procedure links here at the point it's needed.

Reference templates for producing `hrms-frontend-audit.html` and `hrms-frontend-audit.md`.
Replace ALL placeholder labels with actual content from analysis — templates are starting points only.

> **CRITICAL FILE RULE**: Always **overwrite** output files completely — **NEVER append**.
> If a file already exists, replace its entire contents in one write operation. Appending produces duplicate
> document structures that break rendering.

---

## Output Template

### `hrms-frontend-audit.html`

Use this scaffold. Replace all `{{PLACEHOLDER}}` values with real content found during analysis.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HRMS-Frontend — Application Audit</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; background: #0d1117; color: #c9d1d9; line-height: 1.6; }
    nav { position: sticky; top: 0; background: #161b22; border-bottom: 1px solid #30363d; padding: 0.75rem 1.5rem; display: flex; gap: 1.5rem; flex-wrap: wrap; z-index: 100; }
    nav a { color: #58a6ff; text-decoration: none; font-size: 0.875rem; }
    nav a:hover { text-decoration: underline; }
    main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
    h1 { font-size: 1.75rem; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 2.5rem; border-left: 3px solid #58a6ff; padding-left: 0.75rem; }
    h3 { font-size: 1rem; color: #8b949e; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
    th { background: #161b22; color: #8b949e; text-align: left; padding: 0.5rem 0.75rem; border: 1px solid #30363d; }
    td { padding: 0.5rem 0.75rem; border: 1px solid #30363d; vertical-align: top; }
    tr:nth-child(even) { background: #161b22; }
    code { background: #161b22; padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.85em; }
    .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .high   { background: #3d1c1c; color: #f85149; }
    .medium { background: #2d2008; color: #e3b341; }
    .low    { background: #0d2216; color: #3fb950; }
    .none   { background: #21262d; color: #8b949e; }
    .authed { background: #12213d; color: #58a6ff; }
    .role   { background: #2d1a3d; color: #bc8cff; }
    .public { background: #0d2216; color: #3fb950; }
    .open   { background: #3d1c1c; color: #f85149; }
    .server { background: #12213d; color: #58a6ff; }
    .client { background: #2d2008; color: #e3b341; }
    pre.mermaid { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; overflow-x: auto; }
    details summary { cursor: pointer; font-weight: 600; padding: 0.5rem 0; color: #58a6ff; }
    details[open] summary { margin-bottom: 0.5rem; }
    .callout { background: #2d2008; border-left: 4px solid #e3b341; padding: 1rem 1.25rem; border-radius: 0 6px 6px 0; margin: 1.5rem 0; }
    .callout strong { color: #e3b341; }
    .scroll { overflow-x: auto; }
    :focus-visible { outline: 2px solid #58a6ff; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
  </style>
</head>
<body>
  <nav aria-label="Report sections">
    <a href="#summary">Summary</a>
    <a href="#stack">Tech Stack</a>
    <a href="#routes">Routes &amp; Screens</a>
    <a href="#bff">BFF &amp; Data Flow</a>
    <a href="#contracts">Contracts &amp; Validation</a>
    <a href="#auth">Session &amp; Authorization</a>
    <a href="#i18n">i18n &amp; Accessibility</a>
    <a href="#risks">Risk Matrix</a>
    <a href="#handoff">Handoff Notes</a>
  </nav>

  <main>
    <h1>HRMS-Frontend — Application Audit</h1>
    <p><strong>Generated:</strong> {{DATE}} &nbsp;|&nbsp; <strong>Branch:</strong> <code>{{branch}}</code></p>

    <!-- Include this callout ONLY if Step 1 found SKILL.md's Project Context or CLAUDE.md
         contradicting the filesystem. Delete it entirely when the documentation is accurate. -->
    <div class="callout">
      <strong>⚠ {{Drift headline}}</strong>
      <p>{{Which documented claim disagreed with the filesystem, and what is actually true.}}</p>
    </div>

    <section id="summary">
      <h2>1. Executive Summary</h2>
      <p>{{One paragraph: what the application is and its overall posture. Then name the top three
      findings. Do not manufacture severity — if the app is healthy, say so and let the findings be
      the hygiene and verification gaps they actually are.}}</p>
    </section>

    <section id="stack">
      <h2>2. Tech Stack</h2>
      <div class="scroll">
      <table>
        <thead><tr><th>Component</th><th>Version</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Next.js</td><td>{{16.2.12}}</td><td>{{App Router; pinned / unpinned}}</td></tr>
          <tr><td>React</td><td>{{19.x}}</td><td>{{server components default}}</td></tr>
          <tr><td>TypeScript</td><td>{{5.x}}</td><td>{{strict; noUncheckedIndexedAccess}}</td></tr>
          <tr><td>Material UI</td><td>{{version}}</td><td>{{adapter: @mui/material-nextjs/v16-appRouter}}</td></tr>
          <tr><td>React Hook Form / Zod</td><td>{{versions}}</td><td>{{@hookform/resolvers}}</td></tr>
          <tr><td>next-intl</td><td>{{version}}</td><td>{{cookie-based, tr default}}</td></tr>
          <tr><td>Vitest / Playwright</td><td>{{versions}}</td><td>{{fetch stubbed per test; E2E vs real backend}}</td></tr>
        </tbody>
      </table>
      </div>
      <p>{{State whether framework-critical packages are pinned, and list the orphaned-dependency set
      computed in Step 1 — packages declared but never imported.}}</p>
    </section>

    <section id="routes">
      <h2>3. Route &amp; Screen Inventory</h2>
      <p>{{Route count by group. Note that the guard column is the EFFECTIVE guard, resolved through
      proxy matcher → segment layout → BFF → backend, not the proxy matcher alone.}}</p>
      <div class="scroll">
      <table>
        <thead><tr><th>Path</th><th>Group / Layout</th><th>Rendering</th><th>Data</th><th>Effective guard</th></tr></thead>
        <tbody>
          <tr>
            <td><code>{{/jobs/[id]}}</code></td>
            <td>{{(marketing)}}</td>
            <td><span class="badge server">{{server}}</span></td>
            <td>{{JobAdvertisements/getbyid}}</td>
            <td><span class="badge public">{{public}}</span></td>
          </tr>
          <!-- one row per page.tsx -->
        </tbody>
      </table>
      </div>
    </section>

    <section id="bff">
      <h2>4. BFF &amp; Data Flow</h2>
      <pre class="mermaid">
graph LR
  C[Client component] -->|fetch| H[lib/http.ts]
  H -->|same-origin, cookie| R[Route Handler]
  R --> A[server/api-client.ts]
  A -->|Bearer| API[(.NET API)]
  S[Server component] --> A
      </pre>
      <h3>Handlers</h3>
      <div class="scroll">
      <table>
        <thead><tr><th>Route</th><th>Methods</th><th>Touches cookies</th><th>Upstream</th></tr></thead>
        <tbody><tr><td>{{...}}</td><td>{{...}}</td><td>{{...}}</td><td>{{...}}</td></tr></tbody>
      </table>
      </div>
      <h3>Allow-list reconciliation</h3>
      <p>{{Both directions: endpoints the UI calls that are NOT allow-listed (dead calls), and
      allow-list entries nothing calls (dead surface).}}</p>
    </section>

    <section id="contracts">
      <h2>5. Contracts &amp; Validation Parity</h2>
      <p>{{Field-by-field divergences from Responses.cs / Requests.cs, and boundary-by-boundary
      divergences from Validators.cs. Deliberate asymmetries are design, not defect — label them.}}</p>
    </section>

    <section id="auth">
      <h2>6. Session &amp; Authorization</h2>
      <pre class="mermaid">
sequenceDiagram
  participant B as Browser
  participant N as Next.js BFF
  participant A as .NET API
  B->>N: POST /api/auth/login
  N->>A: POST /api/auth/login
  A-->>N: AuthResponse
  N-->>B: Set-Cookie hrms_at, hrms_rt (httpOnly)
      </pre>
      <p>{{Cookie flags. Token-exposure check result. The three refresh layers and whether each is
      present. The Origin check. The two-tier guard, per private segment.}}</p>
    </section>

    <section id="i18n">
      <h2>7. i18n &amp; Accessibility</h2>
      <p>{{Key-by-key tr/en comparison result. Any raw backend message rendered as primary copy.
      Accessibility: form labels, focus order, the SkillSphere hidden link list, reduced-motion.}}</p>
    </section>

    <section id="risks">
      <h2>8. Risk Matrix</h2>
      <div class="scroll">
      <table>
        <thead><tr><th>#</th><th>Finding</th><th>Severity</th><th>Evidence</th><th>Impact</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>{{finding}}</td><td><span class="badge high">High</span></td><td><code>{{file:line}}</code></td><td>{{impact}}</td></tr>
        </tbody>
      </table>
      </div>
    </section>

    <section id="handoff">
      <h2>9. Handoff Notes</h2>
      <p>{{What a new engineer needs first: where the BFF boundary is, why the refresh is
      single-flight, which files to read in what order.}}</p>
    </section>
  </main>

  <script>mermaid.initialize({ startOnLoad: true, theme: 'dark' });</script>
</body>
</html>
```

---

## Syntax Rules

### Rule 1 — Route Accuracy
Report the URL path as the router resolves it, not the folder path. Route groups (`(marketing)`) do
**not** appear in the URL. Dynamic segments keep their brackets (`/jobs/[id]`). Never invent a route
that has no `page.tsx`.

### Rule 2 — Rendering Mode
State server vs client from the presence of `'use client'` **at the top of that file or any ancestor
in its import chain** — not from whether the component looks interactive.

### Rule 3 — Evidence Citations
Every material claim cites `path/to/file.tsx:line`. Paths are repo-relative and use forward slashes.

### Rule 4 — Mermaid Diagram Node Names
Node ids are alphanumeric only. Put punctuation, slashes and brackets inside the label:
`H[lib/http.ts]`, never `lib/http.ts[...]`.

### Rule 5 — Effective Guards

Resolve the whole chain before reporting a route as protected:

1. Does `src/proxy.ts`'s `matcher` cover the path? — this proves only that a **cookie exists**.
2. Does the segment `layout.tsx` check the role against a verified `/auth/me`?
3. Is the endpoint the page calls on `src/server/allowlist.ts`?
4. What does the backend's own `[Authorize]` require?

> **The proxy is not the guard.** It deliberately does not verify the JWT: that would mean holding
> the backend signing key here, which would be a real regression. A page whose layout performs no role
> check is reachable by **any signed-in user**, whatever the matcher implies. Report that as a
> finding, not as "protected".

### Rule 6 — Secrets Never Appear
Never write `API_BASE_URL`'s value, a cookie value, a token, a seed password, or any content of
`.env.local` into the report. Reference configuration **by key name** only.

### Rule 7 — Report Health Honestly
The severity classes exist for real problems. Do not inflate a hygiene item to `High` to fill the
matrix, and do not soften a genuine defect because the rest of the report is positive. "No finding in
this area" is a valid, useful result.

---

## File Creation Validation Checklist

Run every item. Fix and re-validate until all pass.

1. [ ] `audit/hrms-frontend-audit.md` exists and is non-empty
2. [ ] `audit/hrms-frontend-audit.html` exists and is non-empty
3. [ ] Both files were **overwritten**, not appended — exactly one `<!DOCTYPE html>` and one `<h1>`
4. [ ] No `{{PLACEHOLDER}}` remains in either file
5. [ ] All 9 sections present in both, in the same order
6. [ ] Every `page.tsx` under `src/app/` appears in the route table — **count them from the filesystem; do not assume a number**
7. [ ] Every Route Handler under `src/app/api/` appears in the handler table
8. [ ] The allow-list is reconciled in **both** directions
9. [ ] Guard column reflects the resolved chain (Rule 5), not the proxy matcher
10. [ ] Rendering column reflects the import chain (Rule 2)
11. [ ] Contract parity was checked field-by-field against the backend, not summarised
12. [ ] Zod schemas compared boundary-by-boundary against `Validators.cs`
13. [ ] Token-exposure check explicitly reported (`localStorage` / `sessionStorage` / readable cookies)
14. [ ] `tr.json` and `en.json` compared key-by-key, with the diff stated
15. [ ] The four silent-failure test cases (SKILL.md Step 6) each confirmed present or reported missing
16. [ ] Risk Matrix has ≥ 8 findings, each with a `file[:line]` citation
17. [ ] Documentation drift assessed — this skill and `CLAUDE.md` vs. the code — and the HTML drift callout either filled in or **deleted**
18. [ ] Mermaid blocks use `<pre class="mermaid">` and valid node ids (Rule 4)
19. [ ] No secret, token, or `.env.local` content anywhere in either file

> **Shell caution when scripting checks:** in PowerShell, `(...).Count -eq 0` inside a command
> argument is parsed as separate arguments and silently produces a false result. Wrap comparisons in
> `$( )` or assign to a variable first. A checker that reports a false FAIL wastes more time than no
> checker at all.

---

## Output Document Structure

### `hrms-frontend-audit.md`

Same nine sections, same order, plain Markdown:

```
# HRMS-Frontend — Application Audit
**Generated:** {{DATE}} | **Branch:** {{branch}}

## 1. Executive Summary
## 2. Tech Stack
## 3. Route & Screen Inventory
## 4. BFF & Data Flow
## 5. Contracts & Validation Parity
## 6. Session & Authorization
## 7. i18n & Accessibility
## 8. Risk Matrix
## 9. Handoff Notes
```

Use Markdown tables with the same columns as the HTML. Mermaid goes in ```` ```mermaid ```` fences.

---

## Areas to Check

Not findings to copy — areas where this codebase is most likely to have drifted. Confirm each from
the filesystem; report only what you can evidence.

1. **Documentation drift** — `CLAUDE.md` and this skill were written before the code existed.
2. **Token exposure** — any `localStorage`/`sessionStorage` write, any readable cookie.
3. **Allow-list gaps** — a UI call with no entry (dead), or an entry nothing calls (surface).
4. **Guard chain holes** — a private segment whose layout performs no role check.
5. **Contract drift** — a field renamed in `Responses.cs` but not here; `interface` instead of `type`.
6. **Validation drift** — a Zod boundary that no longer matches `Validators.cs`.
7. **The refresh design** — are all three single-flight layers present, and is the concurrency test there?
8. **Field-error translation** — is the PascalCase → RHF path mapping present and tested?
9. **DateOnly mapping** — does any mapper use `toISOString()` on a date, shifting it by timezone?
10. **CV update completeness** — does the editor send the whole document, or can a partial PUT wipe sections?
11. **i18n key parity** — keys present in `tr.json` but missing from `en.json`.
12. **Server/client boundary** — a `src/server/**` import reachable from a `'use client'` subtree.
13. **Dependency posture** — orphans, unpinned framework packages, anything re-added from the old stack.
