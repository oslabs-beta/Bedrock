import { Application } from "https://deno.land/x/oak/mod.ts";
import { MFARouter } from '../router/MFARouter.ts';
import { oAuthRouter } from '../router/oAuthRouter.ts';
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();
const session = new Session();

const port = 8080;

app.use(session.initMiddleware());

// MFA Routes
app.use(MFARouter.routes());
app.use(MFARouter.allowedMethods());

// OAuth Routes
// app.use(oAuthRouter.routes());
// app.use(oAuthRouter.allowedMethods());

// adding a listener for when server starts
app.addEventListener('listen', () => {
    console.log(`listening on localhost:${port}`);
});

// starting server
await app.listen({ port });