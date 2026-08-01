import { crossOriginRejected, forwardAndNormalize, isSameOrigin } from '@/server/handlers';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  return forwardAndNormalize('auth/forgot-password', request);
}
