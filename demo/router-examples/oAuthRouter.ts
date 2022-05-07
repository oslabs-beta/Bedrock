import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { initOAuth } from '../../src/bedrock.ts'
import { OAuthStrategyParams } from '../../src/types.ts'
import "https://deno.land/x/dotenv/load.ts";

export const oAuthRouter = new Router();

// Inputting the parameters for OAuth
const params: OAuthStrategyParams = {
    client_id: Deno.env.get('CLIENT_ID')!,
    client_secret: Deno.env.get('CLIENT_SECRET')!,
    redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
    // login? : string;
    // scope? : string;
    // allow_signup? : string;
}

// Initializing the Bedrock library with the above parameters
const Bedrock = initOAuth(params);

// Route to redirect user to OAuth provider's login site
oAuthRouter.get('/OAuth', Bedrock.sendRedirect);

// Route to retrieve access token and create user session
oAuthRouter.get('/OAuth/github', Bedrock.getToken, (ctx: Context) => {
    console.log('Successfully logged in via OAuth')
    ctx.response.redirect('/secret');
    return;
});

// Secret route with verification middleware
oAuthRouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
    console.log('Secret obtained!');
    ctx.response.body = 'Secret obtained!';
    ctx.response.status = 200;
    return;
  })

// Route to log user out of OAuth and server session
oAuthRouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
    console.log('Successfully signed out');
    ctx.response.redirect('/home');
    return;
  })