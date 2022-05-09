import { Router, Context, helpers } from "../../src/deps.ts";
import { initOAuth } from '../../src/bedrock.ts'
import { OAuthStrategyParams } from '../../src/types.ts'
import "https://deno.land/std@0.138.0/dotenv/load.ts";

export const oAuthRouter = new Router();

const params: OAuthStrategyParams = {
  client_id: Deno.env.get('CLIENT_ID')!,
  client_secret: Deno.env.get('CLIENT_SECRET')!,
  redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
  // login? : string;
  // scope? : string;
  // allow_signup? : string;
}

const Bedrock = initOAuth(params);

oAuthRouter.get('/', async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `index.html`,
  });
  return;
});

oAuthRouter.get('/login', Bedrock.sendRedirect);

oAuthRouter.get('/OAuth/github', Bedrock.getToken, (ctx: Context) => {
  ctx.response.redirect('/secret.html');
})

oAuthRouter.get('/secret.html', Bedrock.verifyAuth, async (ctx: Context) => {
  console.log('Secret hit');
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `secret.html`,
  });
  return;
});

oAuthRouter.get('/:value', async (ctx: Context) => {
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

oAuthRouter.get('/imgs/:image', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).image;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/imgs`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

oAuthRouter.get('/scripts/:script', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).script;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/scripts`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

oAuthRouter.get('/stylesheets/:sheet', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).sheet;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/stylesheets`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});
