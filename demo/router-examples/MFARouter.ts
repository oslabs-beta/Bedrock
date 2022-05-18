import { init } from '../../src/mod.ts';



import { Router, Context } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import dbController from '../controller/controller.ts';
import "https://deno.land/std@0.138.0/dotenv/load.ts";

export const MFARouter = new Router();    

// Initializing the Bedrock library with the above parameters
const Bedrock = init({
  provider: 'Local',
  mfa_type: 'Token',
  checkCreds: dbController.checkCreds,
  getSecret: dbController.getSecret
});

// Verification of username/password and creation of session
MFARouter.post('/', Bedrock.localLogin, (ctx: Context) => {
  console.log('Successfully logged in via username/password, rerouting to check MFA');
  ctx.response.redirect('/checkMFA');
  return;
});

// Verification of MFA token code, if enabled
MFARouter.post('/checkMFA', Bedrock.checkMFA, (ctx: Context) => {
  console.log('Successfully verified MFA code');
  ctx.response.redirect('/secret');
  return;
});

// Secret route with session verification middleware
MFARouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
  console.log('Secret obtained!');
  ctx.response.body = 'Secret obtained!';
  return;
});

// Route to log user out of server session
MFARouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
  console.log('Successfully signed out');
  ctx.response.body = 'Successfully signed out';
  return;
});