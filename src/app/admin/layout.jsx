import { requireStaff } from '@/lib/require-staff';
export const dynamic = 'force-dynamic';
export default async function StaffLayout({children}) {
 await requireStaff(['admin']);
 return children;
}
