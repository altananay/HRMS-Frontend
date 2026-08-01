import { Role } from '@/contracts/enums';
import { requireRole } from '@/server/guard';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.Admin);

  return children;
}
