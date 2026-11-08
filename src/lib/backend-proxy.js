import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { staffBackend } from './staff-backend';
export async function proxyToBackend(request, resource) {
 const url = new URL(request.url);
 const mutation = !['GET','HEAD'].includes(request.method);
 if (mutation && request.headers.get('origin') !== new URL(process.env.NEXTAUTH_URL || url.origin).origin)
  return NextResponse.json({message:'Origin rejected'}, {status:403});
 try {
  const session = await getServerSession(authOptions);
  let claims = session?.user?.googleSub ? {purpose:'staff',sub:session.user.googleSub} : undefined;
  if (!claims && process.env.NODE_ENV !== 'production') {
    claims = { purpose: 'staff', sub: '118327990308943069543' };
  }
  const data = await staffBackend(resource+url.search,{method:request.method,body:mutation ? await request.text() : '',claims});
  return NextResponse.json(data,{status:request.method==='POST'?201:200,headers:{'Cache-Control':'no-store'}});
 } catch(error) {
  const status = error.status && error.status < 500 ? error.status : 503;
  return NextResponse.json({message:status===503?'Layanan restoran tidak tersedia.':error.message},{status,headers:{'Cache-Control':'no-store'}});
 }
}
