import { Application } from "../../src/deps.ts";
import { MFARouter } from '../router/MFARouter.ts';
import { Session } from "../../src/deps.ts";

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