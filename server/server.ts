import { Application, Router, send, SendOptions} from "https://deno.land/x/oak/mod.ts";
// import { staticFiles } from './staticFiles.ts'
const app = new Application();
const router = new Router();
const port = 8080;


// routing
router
  .get('/', async (ctx, next) => {
    //ctx.response.body = 'index.html';
    try {
      await ctx.send({
        root: `${Deno.cwd()}/client`,
        path: "index.html",
      });
    } catch (err) {
      next();
    }
  })
  // login router
  .get('/login', async (ctx, next) => {
    try {
      await ctx.send({
        root: `${Deno.cwd()}/client`,
        path: "login.html"
      })
    } catch (err) {
      next();
    }
  })
  // signup router
  .get('/signup', async (ctx, next) => {
    try {
      await ctx.send({
        root: `${Deno.cwd()}/client`,
        path: "signup.html",
      });
    } catch (err) {
      next();
    }
  })
  // secret router
  .get('/secret', async (ctx, next) => {
    try {
      await ctx.send({
        root: `${Deno.cwd()}/client`,
        path: "secret.html",
      });
    } catch (err) {
      next();
    };
  })
  // welcome router
  .get('/welcome', async (ctx, next) => {
    //ctx.response.body = 'welcome.html';
    try {
      await ctx.send({
        root: `${Deno.cwd()}/client`,
        path: "welcome.html",
      });
    } catch (err) {
      next();
    }
  });
 
  
// passes routing middleware functionality to application
// app.use(staticFiles);
app.use(router.routes());
app.use(router.allowedMethods());


// adding a listener for when server starts
app.addEventListener('listen', () => {
    console.log(`listening on localhost:${port}`);
});

// starting server
await app.listen({ port });