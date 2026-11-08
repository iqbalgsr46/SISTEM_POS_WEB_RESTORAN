import GoogleProvider from 'next-auth/providers/google';
import { createStaffCallbacks } from './staff-auth-core.mjs';
import { staffBackend } from './staff-backend';
export const authOptions = {
 providers:[
  GoogleProvider({
   clientId:process.env.GOOGLE_CLIENT_ID,
   clientSecret:process.env.GOOGLE_CLIENT_SECRET,
   authorization: {
    params: {
     prompt: 'select_account',
     access_type: 'offline',
     response_type: 'code'
    }
   }
  })
 ],
 pages:{signIn:'/login',error:'/login'},
 callbacks:createStaffCallbacks(staffBackend),
 session:{strategy:'jwt',maxAge:8*60*60},
 secret:process.env.NEXTAUTH_SECRET,
};
