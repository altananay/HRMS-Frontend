import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.JobSeeker);

  return children;
}
