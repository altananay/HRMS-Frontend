import { authenticate } from '@/server/handlers';

/** Signs in. The tokens go into httpOnly cookies here and the browser receives only the user. */
export async function POST(request: Request) {
  return authenticate('auth/login', request);
}
