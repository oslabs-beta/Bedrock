import { init } from '../../src/mod.ts';
import { Router, Context } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import "https://deno.land/std@0.138.0/dotenv/load.ts";

export const OAuthRouter = new Router();

// Initializing the Bedrock library
const Bedrock = init({
  provider: 'Github',
  client_id: Deno.env.get('CLIENT_ID')!,
  client_secret: Deno.env.get('CLIENT_SECRET')!,
  redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
  scope: 'read:user'
});

// Route to redirect user to OAuth provider's login site
OAuthRouter.get('/OAuth', Bedrock.sendRedirect);

// Route to retrieve access token and create user session
OAuthRouter.get('/OAuth/github', Bedrock.getToken, (ctx: Context) => {
  console.log('Successfully logged in via OAuth')
  ctx.response.redirect('/secret');
  return;
});

// Secret route with verification middleware
OAuthRouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
  console.log('Secret obtained!');
  ctx.response.body = 'Secret obtained!';
  ctx.response.status = 200;
  return;
})

// Route to log user out of OAuth and server session
OAuthRouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
  console.log('Successfully signed out');
  ctx.response.redirect('/home');
  return;
})