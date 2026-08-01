import { crossOriginRejected, forwardAndNormalize, isSameOrigin } from '@/server/handlers';
import { clearSession } from '@/server/session';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  await clearSession();

  return forwardAndNormalize('auth/reset-password', request);
}
