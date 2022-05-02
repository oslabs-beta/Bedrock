import { Router, Context, isHttpError} from "https://deno.land/x/oak/mod.ts";
import dbController from '../controller/controller.ts';

export const router = new Router();

router
  .get('/scripts/:script', async (ctx, next) => {
    await ctx.send({
      root: `${Deno.cwd()}/testenvironment/client/scripts`,
      path: `${ctx.params.script}` //ctx.request.url.searchParams.get(site)
    })
  })
  .get('/stylesheets/:sheet', async (ctx, next) => {
    await ctx.send({
      root: `${Deno.cwd()}/testenvironment/client/stylesheets`,
      path: `${ctx.params.sheet}` //ctx.request.url.searchParams.get(site)
    })
  })
  .post('/signup', dbController.addUser, async (ctx, next) => {
    console.log('something')
  })
  
  .get('/:site', async (ctx, next) => {
    // const searchParams = new URLSearchParams();
    // console.log('these are the params using the URLSearchParams class: ', searchParams)
    // console.log('param?', ctx.request.url.searchParams.getAll('code'));
    await ctx.send({
      root: `${Deno.cwd()}/testenvironment/client`,
      path: `${ctx.params.site}.html` //ctx.request.url.searchParams.get(site)
    })
  })
  .get('/', async (ctx: Context, next) => {
    if (await ctx.state.session.has("friends")) {
      console.log(await ctx.state.session.get("friends"));
      // console.log(Object.keys(ctx.state.session));
    } else {
      await ctx.state.session.set("friends", 'john');
      console.log('Had to add the property!');
    }
    try {
      await ctx.send({
        root: `${Deno.cwd()}/testenvironment/client`,
        path: "index.html",
      });
    } catch (err) {
      next();
    }
  })

  // .use(async (ctx: Context, next) => {
  //   try {
  //     await next();
  //   } catch (err) {
  //     if (isHttpError(err)) {
  //       ctx.response.status = err.status;
  //       const { message, status, stack } = err;
  //       if (ctx.request.accepts("json")) {
  //         ctx.response.body = { message, status, stack };
  //         ctx.response.type = "json";
  //       } else {
  //         ctx.response.body = `${status} ${message}\n\n${stack ?? ""}`;
  //         ctx.response.type = "text/plain";
  //       }
  //     } else {
  //       console.log(err);
  //       throw err;
  //     }
  //   }
  //});

  // .get('/oAuthInitialize', Bedrock.OAUTH)
  // .post('/redirect_url/:code', Bedrock.CompleteOAUTH, DEVELOPERMIDDLEWARE) ->> console.log(ctx.params.code) -> CODE //-->
  // .post('/verify', Bedrock.local, DEVELOPERMIDDLEWARE, ctx.response.redirect('verifyMFA')) //--> send back with session loggedin/authenticated true if credentials verified
  // .post('/verifyMFA', Bedrock.MFA, DEVELOPER MIDDLEWARE) //checks to see if session mfa property is initialized --> will undergo MFA check based on which MFA is on property
  // .get('/secret', Bedrock.verifyAuth, DEVELOPER MIDDLEWARE)
  // .get('/logout', Bedrock.signOut, DEVELOPER MIDDLEWARE)
  // 
  
/**
 * import Bedrock from "bedrock.ts"
 * import Bedrock_localauth
 * import Bedrock_mfa
 * import Bedrock_oauth
 * 
 * const bedrock = Bedrock_localauth.init(checkCredentials: function, invalidCredentials: function)
 * if checkCredentials returns true --> calls next()
 * if false --> invokes the invalidCredentials function
 * 
 * router.post('/login', bedrock, (ctx, next) => {
 * you rock!
 * });
 */
