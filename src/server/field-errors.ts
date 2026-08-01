import 'server-only';

export const FORM_LEVEL_FIELD = 'root';

export function toFieldPath(key: string): string {
  const segments = key
    .split('.')
    .filter((segment) => segment.length > 0 && segment !== '$')
    .flatMap((segment) => segment.replace(/\[(\d+)\]/g, '.$1').split('.'))
    .map((segment) => (/^\d+$/.test(segment) ? segment : lowerFirst(segment)));

  return segments.length > 0 ? segments.join('.') : FORM_LEVEL_FIELD;
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function toFieldErrors(errors: Record<string, string[]>): Record<string, string[]> {
  const translated: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(errors)) {
    if (!Array.isArray(messages) || messages.length === 0) continue;

    const path = toFieldPath(key);
    translated[path] = [...(translated[path] ?? []), ...messages];
  }

  return translated;
}
