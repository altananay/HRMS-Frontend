/**
 * Server-side configuration. Read once, validated once.
 *
 * Nothing here is `NEXT_PUBLIC_`, and that is the point: the browser never talks to the .NET API, so
 * its address has no business being in the client bundle. `import 'server-only'` turns an accidental
 * client import into a build error rather than a leak.
 *
 * Not imported by `middleware.ts` — the Edge sandbox has its own module instance and reads
 * `process.env` directly there.
 */
import 'server-only';

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    // Thrown at import time, so a missing variable fails the first request loudly instead of
    // surfacing later as an unexplained fetch error against `undefined/api/...`.
    throw new Error(
      `${name} is not set. Copy .env.local.example to .env.local — see that file for what each value means.`,
    );
  }

  return value;
}

/** The .NET API, e.g. `https://localhost:7129`. Trailing slash trimmed so paths concatenate cleanly. */
export const API_BASE_URL = required('API_BASE_URL').replace(/\/+$/, '');

/**
 * `secure` on the session cookies. Must be `false` over plain http://localhost, or the browser drops
 * them and every request arrives anonymous — which looks exactly like a broken login.
 */
export const SESSION_COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE !== 'false';
