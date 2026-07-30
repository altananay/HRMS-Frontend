import { authenticate } from '@/server/handlers';

/** Registration signs the new job seeker straight in — the API answers with a full token pair. */
export async function POST(request: Request) {
  return authenticate('auth/register/jobseeker', request);
}
