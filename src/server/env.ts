import 'server-only';

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.local.example to .env.local — see that file for what each value means.`,
    );
  }

  return value;
}

export const API_BASE_URL = required('API_BASE_URL').replace(/\/+$/, '');

export const SESSION_COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE !== 'false';
