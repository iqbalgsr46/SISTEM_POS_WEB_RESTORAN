import { signIdentity } from './staff-auth-core.mjs';
export async function staffBackend(resource, { method = 'GET', body = '', claims } = {}) {
 const base = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8010/api';
 const url = new URL(`${base.replace(/\/$/, '')}/${resource}`);
 const headers = {Accept:'application/json','Content-Type':'application/json'};
 if (claims) headers['X-Staff-Identity'] = signIdentity(process.env.STAFF_PROXY_SECRET,method,url.pathname+url.search,body,claims);
 const response = await fetch(url,{method,headers,body:['GET','HEAD'].includes(method)?undefined:body,cache:'no-store',signal:AbortSignal.timeout(10000)});
 const data = await response.json();
 if (!response.ok) { const error=new Error(data.message || 'Request rejected'); error.status=response.status; throw error; }
 return data;
}
