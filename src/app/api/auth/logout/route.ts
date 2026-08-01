import { NextResponse } from 'next/server';

import { apiFetch } from '@/server/api-client';
import { crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { clearSession, readTokens } from '@/server/session';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const { refresh } = await readTokens();

  if (refresh) {
    try {
      await apiFetch({
        method: 'POST',
        path: 'auth/logout',
        body: JSON.stringify({ refreshToken: refresh }),
        contentType: 'application/json',
      });
    } catch {
    }
  }

  await clearSession();

  return new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}
