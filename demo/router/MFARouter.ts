import { Router, Context, helpers } from "https://deno.land/x/oak/mod.ts";
import dbController from '../controller/controller.ts';
import { initLocal, initOAuth } from '../../src/bedrock.ts'
import { LocalStrategyParams } from '../../types.ts'
import { OAuthStrategyParams } from '../../types.ts'
import "https://deno.land/x/dotenv/load.ts";

export const MFARouter = new Router();

const params: LocalStrategyParams = {
  mfa_enabled : true,
  checkCreds : dbController.checkCreds,
  mfa_type: "Token",
  getSecret: dbController.getSecret,
  readCreds: async (ctx: Context): Promise<string[]> => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const {username, password} = bodyValue;
    return [username, password];
  },
  // getNumber: dbController.getNumber,
  // accountSID: Deno.env.get('TWILIO_ACCOUNT_SID')!,
  // authToken: Deno.env.get('TWILIO_AUTH_TOKEN')!,
}

const oAuthparams: OAuthStrategyParams = {
  client_id: Deno.env.get('CLIENT_ID')!,
  client_secret: Deno.env.get('CLIENT_SECRET')!,
  redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
  // login? : string;
  // scope? : string;
  // allow_signup? : string;
};

const Bedrock = initLocal(params);
const BedrockOAuth = initOAuth(oAuthparams);

MFARouter.get('/', async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `index.html`,
  });
  return;
});

MFARouter.post('/login', Bedrock.localLogin, (ctx: Context) => {
  if (ctx.state.localVerified) {
    ctx.response.body = {
      successful : true,
    };
    ctx.response.status = 200;
  } else {
    ctx.response.body = {
      successful : false,
    };
    ctx.response.status = 401;
  }
  return;
})

MFARouter.post('/verifyMFA', Bedrock.checkMFA, (ctx: Context) => {
  ctx.response.body = {
    mfaVerified : true,
    url : 'http://localhost:8080/secret.html'
  }
})

MFARouter.get('/OAuth/login', BedrockOAuth.sendRedirect);

MFARouter.get('/OAuth/github', BedrockOAuth.getToken, (ctx: Context) => {
  ctx.response.redirect('/secret.html');
});

MFARouter.get('/secret.html', Bedrock.verifyAuth, async (ctx: Context) => {
  console.log('Secret hit');
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `secret.html`,
  });
  return;
});

MFARouter.get('/logout', Bedrock.signOut, (ctx: Context) => {
  ctx.response.redirect('/');
  return;
});

MFARouter.get('/:value', async (ctx: Context) => {
  console.log('hit!');
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
