import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.Employer);

  return children;
}
