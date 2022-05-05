import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import dbController from '../controller/controller.ts';
import { initLocal } from '../../src/bedrock.ts'
import { LocalStrategyParams } from '../../src/LocalStrategy.ts'
import "https://deno.land/x/dotenv/load.ts";

export const MFARouter = new Router();

// Inputting the parameters for Local Authentication and MFA
const params: LocalStrategyParams = {
  mfa_enabled : true,
  checkCreds : dbController.checkCreds,
  mfa_type: "Token",
  getSecret: dbController.getSecret,
  // getNumber: dbController.getNumber,
  // accountSID: Deno.env.get('TWILIO_ACCOUNT_SID')!,
  // authToken: Deno.env.get('TWILIO_AUTH_TOKEN')!,
}

// Initializing the Bedrock library with the above parameters
const Bedrock = initLocal(params);

// Verification of username/password and creation of session
MFARouter.post('/', Bedrock.localLogin, (ctx: Context) => {
  console.log('Successfully logged in via username/password');
  ctx.response.body = 'WOO';
  ctx.response.status = 200;
  return;
})

// Verification of MFA token code, if enabled
MFARouter.post('/checkMFA', Bedrock.checkMFA, (ctx: Context) => {
  console.log('Successfully verified MFA code');
  ctx.response.redirect('/secret');
  return;
})

// Secret route with session verification middleware
MFARouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
  console.log('Secret obtained!');
  ctx.response.body = 'Secret obtained!';
  ctx.response.status = 200;
  return;
})

// Route to log user out of server session
MFARouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
  console.log('Successfully signed out');
  ctx.response.body = 'Successfully signed out';
  ctx.response.status = 200;
  return;
})