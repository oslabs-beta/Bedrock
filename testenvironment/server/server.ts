import { Application } from "https://deno.land/x/oak/mod.ts";
import { router } from '../router/router.ts';
import { testRouter } from '../router/testRouter.ts';
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();
const session = new Session();

const port = 8080;

app.use(session.initMiddleware());
// app.use(router.routes());
app.use(testRouter.routes());
app.use(router.allowedMethods());

/**
 * ctx.state.session.loggedIn<boolean>
 * ctx.state.session.mfa<boolean>
*/

// adding a listener for when server starts
app.addEventListener('listen', () => {
    console.log(`listening on localhost:${port}`);
});

// starting server
await app.listen({ port });