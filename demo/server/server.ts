import { Application } from "https://deno.land/x/oak/mod.ts";
import { router } from '../router/router.ts';
import { mainRouter } from '../router/mainRouter.ts';
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();
const session = new Session();

const port = 8080;

app.use(session.initMiddleware());
app.use(mainRouter.routes());
app.use(router.allowedMethods());

// adding a listener for when server starts
app.addEventListener('listen', () => {
    console.log(`listening on localhost:${port}`);
});

// starting server
await app.listen({ port });