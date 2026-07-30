import { crossOriginRejected, forwardAndNormalize, isSameOrigin } from '@/server/handlers';
import { clearSession } from '@/server/session';

/**
 * Consumes the emailed token and sets the new password.
 *
 * A successful reset revokes every session for that user upstream, so any cookies this browser holds
 * are already dead. They are cleared regardless of outcome: this endpoint is reached from an email
 * link, usually by someone who could not sign in, and a stale cookie pair would send them to a panel
 * that 401s instead of to the sign-in screen.
 *
 * Cleared *before* the upstream call, not after. Mutating the cookie store once a `NextResponse` has
 * already been constructed relies on Next merging the two, which is not worth depending on when the
 * failure mode is a session that should have ended and quietly did not.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return crossOriginRejected();

  await clearSession();

  return forwardAndNormalize('auth/reset-password', request);
}
