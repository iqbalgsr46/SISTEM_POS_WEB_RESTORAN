import { requireStaff } from '@/lib/require-staff';
import AdminLayoutShell from '@/components/admin/admin-layout-shell';

export const dynamic = 'force-dynamic';

export default async function StaffLayout({ children }) {
  const account = await requireStaff(['admin']);
  return <AdminLayoutShell account={{ name: account.name, email: account.email }}>{children}</AdminLayoutShell>;
}
