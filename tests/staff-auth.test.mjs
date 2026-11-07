import test from 'node:test';
import assert from 'node:assert/strict';
import { createStaffCallbacks, signIdentity, canAccess } from '../src/lib/staff-auth-core.mjs';

test('Google verified subject is required and registration failure denies login', async () => {
 const calls=[];
 const cb=createStaffCallbacks(async (...args)=>{ calls.push(args); return {status:'pending'}; });
 assert.equal(await cb.signIn({account:{provider:'credentials'},profile:{}}),false);
 assert.equal(await cb.signIn({account:{provider:'google'},profile:{sub:'123',email:'x@example.com',email_verified:false}}),false);
 assert.equal(await cb.signIn({account:{provider:'google'},profile:{sub:'123',email:'x@example.com',email_verified:true,name:'X'}}),true);
 assert.equal(calls.length,1);
 assert.equal(await createStaffCallbacks(async()=>{throw Error('offline');}).signIn({account:{provider:'google'},profile:{sub:'123',email:'x@example.com',email_verified:true}}),false);
});
test('identity envelope is short lived and binds method URL and body',()=>{
 assert.throws(()=>signIdentity('', 'GET','/api/orders','',{sub:'1'}));
 const token=signIdentity('s'.repeat(64),'PATCH','/api/orders','{}',{sub:'1'});
 const payload=JSON.parse(Buffer.from(token.split('.')[0],'base64url'));
 assert.equal(payload.method,'PATCH'); assert.equal(payload.uri,'/api/orders');
 assert.ok(payload.exp <= Math.floor(Date.now()/1000)+30);
});
test('pending disabled wrong role cannot access staff pages',()=>{
 assert.equal(canAccess(null,['admin']),false);
 assert.equal(canAccess({status:'pending',role:'admin'},['admin']),false);
 assert.equal(canAccess({status:'disabled',role:'admin'},['admin']),false);
 assert.equal(canAccess({status:'approved',role:'cashier'},['admin']),false);
 assert.equal(canAccess({status:'approved',role:'admin'},['admin']),true);
});
