import 'server-only';

/**
 * Translates `ValidationProblemDetails` keys into React Hook Form field paths.
 *
 * ```
 *   Email                  → email
 *   Educations[0].School   → educations.0.school
 *   SocialMedia.Github     → socialMedia.github
 *   $.deadline             → deadline
 * ```
 *
 * **This fails silently when it is wrong.** `setError('Email', …)` matches no registered field, so
 * RHF stores it and renders nothing: the form just sits there, apparently ignoring a valid-looking
 * submission, with no console warning and no failing request. That is why it has its own table-driven
 * test and an E2E case rather than being three lines inline in the proxy.
 *
 * Two producers, two shapes. FluentValidation emits C# property paths (`Educations[0].School`) via
 * the exception handler. ASP.NET's own model binder emits JSON paths (`$.deadline`) when the body
 * cannot be deserialised at all — different origin, same dictionary, so both are handled here.
 */

/** Where an error that names no recognisable field is filed, for display above the form. */
export const FORM_LEVEL_FIELD = 'root';

export function toFieldPath(key: string): string {
  const segments = key
    .split('.')
    // `$` is the JSON-path root the model binder prefixes; an empty segment comes from a leading dot.
    .filter((segment) => segment.length > 0 && segment !== '$')
    // `Educations[0]` is one segment to C# but two to RHF.
    .flatMap((segment) => segment.replace(/\[(\d+)\]/g, '.$1').split('.'))
    .map((segment) => (/^\d+$/.test(segment) ? segment : lowerFirst(segment)));

  return segments.length > 0 ? segments.join('.') : FORM_LEVEL_FIELD;
}

/**
 * Only the first character, matching `JsonNamingPolicy.CamelCase` for the names this API actually
 * uses: `WebSite` → `webSite`, not `webSite` → `website`. A full lower-casing would break every
 * multi-word property, and every one of those failures would be invisible.
 */
function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/**
 * Converts the whole `errors` dictionary. Keys that collide after translation are merged rather than
 * overwritten — `Email` and `email` in one payload would otherwise silently drop one of the two.
 */
export function toFieldErrors(errors: Record<string, string[]>): Record<string, string[]> {
  const translated: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(errors)) {
    if (!Array.isArray(messages) || messages.length === 0) continue;

    const path = toFieldPath(key);
    translated[path] = [...(translated[path] ?? []), ...messages];
  }

  return translated;
}
