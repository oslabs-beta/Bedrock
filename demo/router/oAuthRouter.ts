import { Router, Context, helpers } from "https://deno.land/x/oak/mod.ts";
import dbController from '../controller/controller.ts';


export const oAuthRouter = new Router();

oAuthRouter.get('/', async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `index.html`,
  });
  return;
});

oAuthRouter.post('/login', (ctx: Context) => {
  ctx.response.body = {
    successful : true,
  };
  ctx.response.status = 200;
  return;
})

oAuthRouter.get('/secret', async (ctx: Context) => {
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
