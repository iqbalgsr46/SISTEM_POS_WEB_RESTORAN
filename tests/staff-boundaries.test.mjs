import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('staff page boundaries use server authorization, never localStorage grants',()=>{
 for(const role of ['admin','pos','kitchen']) {
  assert.match(read(`src/app/${role}/layout.jsx`),/requireStaff/);
  assert.doesNotMatch(read(`src/app/${role}/page.jsx`),/localStorage/);
 }
 assert.doesNotMatch(read('src/app/login/page.jsx'),/localStorage|handleLogin|password/);
});
test('admin provides account approval reject disable and role controls',()=>{
 const ui=read('src/app/admin/accounts/page.jsx');
 for(const word of ['approved','rejected','disabled','cashier','kitchen','admin','PATCH']) assert.ok(ui.includes(word));
 assert.match(read('src/features/admin/admin-dashboard.jsx'),/\/admin\/accounts/);
});
test('customer dine-in and takeaway track scoped single orders, never global active orders',()=>{
 for (const page of ['src/app/dine-in/page.jsx', 'src/app/takeaway/page.jsx']) {
  const content = read(page);
  assert.doesNotMatch(content, /\/api\/orders\?status=active/);
  assert.match(content, /\/api\/orders\?id=/);
 }
});
test('proxy obtains server identity, validates same origin and never forwards client identity',()=>{
 const proxy=read('src/lib/backend-proxy.js');
 assert.match(proxy,/getServerSession/); assert.match(proxy,/origin/); assert.match(proxy,/googleSub/);
 assert.match(proxy,/staffBackend/);
});
