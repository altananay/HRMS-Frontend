import { authenticate } from '@/server/handlers';

export async function POST(request: Request) {
  return authenticate('auth/login', request);
}
