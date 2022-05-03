import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import dbController from '../controller/controller.ts';
import { init } from '../../src/bedrock.ts'
import { LocalStrategyParams } from '../../src/LocalStrategy.ts'
import "https://deno.land/x/dotenv/load.ts";

export const testRouter = new Router();

const params: LocalStrategyParams = {
  mfa_enabled : true,
  checkCreds : dbController.checkCreds,
  mfa_type: "Token",
  getSecret: dbController.getSecret,
  // getNumber: dbController.getNumber,
  // accountSID: Deno.env.get('TWILIO_ACCOUNT_SID')!,
  // authToken: Deno.env.get('TWILIO_AUTH_TOKEN')!,
}

const Bedrock = init('Local Strategy', params);
console.log(Bedrock);

testRouter.post('/', Bedrock.localLogin, (ctx: Context) => {
  console.log('SUCCESS WTF');
  ctx.response.body = 'WOO';
  ctx.response.status = 200;
  return;
})

testRouter.post('/mfaCheck', Bedrock.checkMFA, (ctx: Context) => {
  console.log('Yo your MFA works');
  ctx.response.body = 'Success';
  ctx.response.status = 200;
  return;
})

testRouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
  console.log('Secret obtained!');
  ctx.response.body = 'Secret obtained!';
  ctx.response.status = 200;
  return;
})

testRouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
  console.log('signed out');
  ctx.response.body = 'Signed out successfully';
  ctx.response.status = 200;
  return;
})