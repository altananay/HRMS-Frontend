import { NextResponse } from 'next/server';

import { ensureAccessToken, getSession } from '@/server/session';

export async function GET() {
  await ensureAccessToken();

  const user = await getSession();

  return NextResponse.json({ user }, { headers: { 'cache-control': 'no-store' } });
}
