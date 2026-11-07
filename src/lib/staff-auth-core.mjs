import { createHmac, createHash } from 'node:crypto';
export function signIdentity(secret, method, uri, body, claims) {
 if (!secret || secret.length < 32) throw new Error('Staff identity configuration missing');
 const payload = Buffer.from(JSON.stringify({...claims, exp:Math.floor(Date.now()/1000)+30, method, uri, body:createHash('sha256').update(body).digest('hex')})).toString('base64url');
 return `${payload}.${createHmac('sha256',secret).update(payload).digest('hex')}`;
}
export function canAccess(account, roles) { return !!account && account.status === 'approved' && roles.includes(account.role); }
export function createStaffCallbacks(backend) {
 return {
  async signIn({account,profile}) {
   if (account?.provider !== 'google' || profile?.email_verified !== true || !profile.sub || !profile.email) return false;
   try { await backend('auth/google', {method:'POST', body:JSON.stringify({sub:profile.sub,email:profile.email,email_verified:true,name:profile.name || profile.email}), claims:{purpose:'provision'}}); return true; }
   catch { return false; }
  },
  async jwt({token,account,profile}) {
   if (account?.provider === 'google' && profile?.email_verified === true) token.googleSub = profile.sub;
   return token;
  },
  async session({session,token}) {
   session.user.googleSub = token.googleSub;
   session.user.account = null;
   if (token.googleSub) {
    try { session.user.account = await backend('auth/me',{claims:{purpose:'staff',sub:token.googleSub}}); } catch { /* fail closed */ }
   }
   return session;
  }
 };
}
