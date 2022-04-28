import { Router } from "https://deno.land/x/oak/mod.ts";

export const router = new Router();

router
  .get('/', async (ctx, next) => {
    //ctx.response.body = 'index.html';
    if (await ctx.state.session.has("friends")) {
      console.log(await ctx.state.session.get("friends"));
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
  .get('/:site', async (ctx, next) => {
    try {
      await ctx.send({
        root: `${Deno.cwd()}/testenvironment/client`,
        path: `${ctx.params.site}.html`
      })
    } catch (err) {
      next();
    }
  });
  
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