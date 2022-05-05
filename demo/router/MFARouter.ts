import { Router, Context, helpers } from "https://deno.land/x/oak/mod.ts";
import dbController from '../controller/controller.ts';
import { init } from '../../src/bedrock.ts'
import { LocalStrategyParams } from '../../src/LocalStrategy.ts'

export const MFARouter = new Router();

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

MFARouter.get('/', async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `index.html`,
  });
  return;
});

MFARouter.post('/login', (ctx: Context) => {
  ctx.response.body = {
    successful : true,
    redirectURL : 'http://localhost:8080/secret',
  };
  ctx.response.status = 200;
  return;
})

MFARouter.get('/secret', async (ctx: Context) => {
  console.log('Secret hit');
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `secret.html`,
  });
  return;
});

MFARouter.get('/:value', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).value;
  if (path === 'favicon.ico') {
    ctx.response.status = 200;
  } else {
    await ctx.send({
      root: `${Deno.cwd()}/demo/client`,
      path: `${path}`,
    });
  }
  return;
});

MFARouter.get('/imgs/:image', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).image;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/imgs`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

MFARouter.get('/scripts/:script', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).script;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/scripts`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

MFARouter.get('/stylesheets/:sheet', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).sheet;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/stylesheets`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});
