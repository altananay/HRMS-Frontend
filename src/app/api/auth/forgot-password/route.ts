import { crossOriginRejected, forwardAndNormalize, isSameOrigin } from '@/server/handlers';

/**
 * Requests a password-reset mail. Anonymous, and rate-limited upstream.
 *
 * The API answers 200 with the same message whether or not the address exists, so that a caller
 * cannot use this to discover who has an account. Nothing here may add a distinguishing signal —
 * no early return for an empty address, no different status, no different shape.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  return forwardAndNormalize('auth/forgot-password', request);
}
