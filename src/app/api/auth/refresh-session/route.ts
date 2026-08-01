import { NextResponse } from 'next/server';

import { apiErrorResponse, crossOriginRejected, isSameOrigin } from '@/server/handlers';
import { API_BASE_URL } from '@/server/env';
import { clearSession, readTokens, writeSession } from '@/server/session';
import { refreshOnce } from '@/server/tokens';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  const { refresh } = await readTokens();

  if (!refresh) {
    await clearSession();
    return apiErrorResponse({ status: 401, code: 'session_expired', title: 'No refresh token.' });
  }

  const outcome = await refreshOnce(refresh, API_BASE_URL);

  if (outcome.status === 'refreshed') {
    await writeSession(outcome.tokens);
    return new NextResponse(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }

  if (outcome.status === 'rejected') {
    await clearSession();
    return apiErrorResponse({
      status: 401,
      code: 'session_expired',
      title: 'The refresh token was rejected.',
    });
  }

  return apiErrorResponse({
    status: 0,
    code: 'network',
    title: 'The API could not be reached.',
  });
}
