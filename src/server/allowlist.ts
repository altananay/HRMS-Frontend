import 'server-only';

/**
 * Every upstream endpoint the catch-all proxy is permitted to forward. Anything absent is rejected
 * with 404 before a request leaves this process.
 *
 * **This is a security control, not bookkeeping.** The proxy authenticates from an httpOnly cookie,
 * so the browser attaches credentials automatically. An open proxy would therefore let any page on
 * the internet drive the whole API as the signed-in user with a single `fetch`. The list bounds that
 * to the surface this app actually uses, and it doubles as the only complete inventory of it.
 *
 * `/api/auth/*` is deliberately **not** here. Those endpoints mint and rotate tokens; each one has an
 * explicit handler under `src/app/api/auth/` that decides what may touch a cookie. `auth/refresh` in
 * particular is never reachable from the browser at all.
 *
 * Path case matches the controllers. ASP.NET routing is case-insensitive, but matching exactly keeps
 * this readable against `Presentation/WebAPI/Controllers/`.
 */

export type AllowedMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** `:guid` matches one GUID segment. Any other segment must match literally. */
type Entry = readonly [AllowedMethod, string];

const ALLOWED: readonly Entry[] = [
  // Job advertisements — getall and getbyid are anonymous upstream and back the public job board.
  ['GET', 'JobAdvertisements/getall'],
  ['GET', 'JobAdvertisements/getbyid/:guid'],
  ['POST', 'JobAdvertisements/add'],
  ['PUT', 'JobAdvertisements/update'],
  ['DELETE', 'JobAdvertisements/deletebyid/:guid'],

  // Job applications. getall is scoped by role in the controller, not by us.
  ['GET', 'JobApplications/getall'],
  ['GET', 'JobApplications/getbyid/:guid'],
  ['POST', 'JobApplications/add'],
  ['PUT', 'JobApplications/update'],
  ['DELETE', 'JobApplications/deletebyid/:guid'],

  // CVs and CV files. `files/:guid` streams personal data — see the proxy's cache headers.
  ['GET', 'Cvs/getall'],
  ['GET', 'Cvs/getbyjobseekerid/:guid'],
  ['POST', 'Cvs/add'],
  ['PUT', 'Cvs/update'],
  ['DELETE', 'Cvs/deletecv/:guid'],
  ['POST', 'Cvs/uploadfile'],
  ['GET', 'Cvs/files/:guid'],
  ['DELETE', 'Cvs/files/:guid'],

  // Employers. `public` is the anonymous directory; `getall` is admin-only and carries email + status.
  ['GET', 'Employers/public'],
  ['GET', 'Employers/getbyemployerid/:guid'],
  ['GET', 'Employers/getall'],
  ['GET', 'Employers/getbyemail'],
  ['PUT', 'Employers/update'],
  ['DELETE', 'Employers/deletebyid/:guid'],

  // Job seekers.
  ['GET', 'JobSeekers/getall'],
  ['GET', 'JobSeekers/getbyid/:guid'],
  ['GET', 'JobSeekers/getbyemail'],
  ['PUT', 'JobSeekers/update'],
  ['DELETE', 'JobSeekers/deletebyid/:guid'],

  // System staff. Creating one is POST /api/auth/register/system-staff, which is an auth handler.
  ['GET', 'SystemStaffs/getall'],
  ['GET', 'SystemStaffs/:guid'],
  ['PUT', 'SystemStaffs/update'],
  ['DELETE', 'SystemStaffs/deletebyid/:guid'],

  // Job positions. Singular controller name — `JobPosition`, not `JobPositions`.
  ['GET', 'JobPosition/getall'],
  ['GET', 'JobPosition/getbyid/:guid'],
  ['POST', 'JobPosition/addjobposition'],
  ['PUT', 'JobPosition/update'],
  ['DELETE', 'JobPosition/deletebyid/:guid'],

  // Contacts. POST is anonymous upstream — the public contact form.
  ['GET', 'Contacts'],
  ['GET', 'Contacts/:guid'],
  ['POST', 'Contacts'],
  ['PUT', 'Contacts/:guid'],
  ['DELETE', 'Contacts/:guid'],

  ['GET', 'Users/getall'],
] as const;

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @param segments the path after `/api/proxy/`, already split by Next's catch-all route.
 */
export function isAllowed(method: string, segments: readonly string[]): boolean {
  // `..` and encoded variants can never appear in a legitimate call, and a single one that slipped
  // through would let a caller climb out of the API's route table. Rejected before matching rather
  // than relying on every pattern below to be un-escapable.
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    return false;
  }

  return ALLOWED.some(([allowedMethod, pattern]) => {
    if (allowedMethod !== method) return false;

    const expected = pattern.split('/');
    if (expected.length !== segments.length) return false;

    return expected.every((part, index) => {
      const actual = segments[index] ?? '';
      return part === ':guid' ? GUID.test(actual) : part === actual;
    });
  });
}

/** Exported for the allow-list's own test, which asserts the table matches what the UI calls. */
export const allowedEntries = ALLOWED;
