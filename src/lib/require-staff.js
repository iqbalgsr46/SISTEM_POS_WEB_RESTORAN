import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth-options';
import { canAccess } from './staff-auth-core.mjs';
export async function requireStaff(roles) {
 const session = await getServerSession(authOptions);
 if (!session || !canAccess(session.user?.account,roles)) redirect('/login');
 return session.user.account;
}
