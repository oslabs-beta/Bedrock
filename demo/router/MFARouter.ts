import { Router, Context, helpers } from "../../src/deps.ts";
import dbController from '../controller/controller.ts';
import { initLocal, initOAuth } from '../../src/bedrock.ts'
import { LocalStrategyParams, GithubOAuthParams, GoogleOAuthParams, LinkedinOAuthParams, ClientOptions} from '../../src/types.ts'
import "https://deno.land/std@0.138.0/dotenv/load.ts";

export const MFARouter = new Router();

const clientOptions: ClientOptions = {
  connection: {
    hostname: Deno.env.get('EMAIL_HOSTNAME')!,
    tls: true,
    auth: {
      username: Deno.env.get('EMAIL_USERNAME')!,
      password: Deno.env.get('EMAIL_PASSWORD')!
    }
  }
}

const params: LocalStrategyParams = {
  mfa_enabled : true,
  checkCreds : dbController.checkCreds,
  mfa_type: "Email",
  getSecret: dbController.getSecret,
  readCreds: async (ctx: Context): Promise<string[]> => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const {username, password} = bodyValue;
    return [username, password];
  },
  getEmail: dbController.getEmail,
  clientOptions: clientOptions,
  fromAddress: Deno.env.get('EMAIL_FROM')!
  
  // getNumber: dbController.getNumber,
  // accountSID: Deno.env.get('TWILIO_ACCOUNT_SID')!,
  // authToken: Deno.env.get('TWILIO_AUTH_TOKEN')!,
}

const GithubParams: GithubOAuthParams = {
  provider: 'Github',
  client_id: Deno.env.get('CLIENT_ID')!,
  client_secret: Deno.env.get('CLIENT_SECRET')!,
  redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
  // login? : string;
  // scope? : string;
  // allow_signup? : string;
};

const GParams: GoogleOAuthParams = {
  client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
  client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
  scope: 'openid',
  redirect_uri: 'http://localhost:8080/oauth/google/token',
  provider: 'Google',
  response_type: 'code'
}

const LinkedinParams: LinkedinOAuthParams = {
  provider: "Linkedin",
  client_id: Deno.env.get('LINKEDIN_CLIENT_ID')!,
  client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
  scope: 'r_liteprofile',
  redirect_uri: 'http://localhost:8080/OAuth/linkedin/token',
  response_type: "code",
}

const Bedrock = initLocal(params);
const BedrockGithub = initOAuth(GithubParams);
const BedrockGoogle = initOAuth(GParams);
const BedrockLinkedin = initOAuth(LinkedinParams);


MFARouter.get('/', async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `index.html`,
  });
  return;
});

MFARouter.post('/login', Bedrock.localLogin, (ctx: Context) => {
  if (ctx.state.localVerified) {
    ctx.response.body = {
      successful : true,
    };
    ctx.response.status = 200;
  } else {
    ctx.response.body = {
      successful : false,
    };
    ctx.response.status = 401;
  }
  return;
})

MFARouter.post('/verifyMFA', Bedrock.checkMFA, (ctx: Context) => {
  ctx.response.body = {
    mfaVerified : true,
    url : 'http://localhost:8080/secret.html'
  }
})

MFARouter.get('/OAuth/github/login', BedrockGithub.sendRedirect);

MFARouter.get('/OAuth/github/token', BedrockGithub.getToken, (ctx: Context) => {
  ctx.response.redirect('/secret.html');
});

MFARouter.get('/OAuth/google/login', BedrockGoogle.sendRedirect);

MFARouter.get('/OAuth/google/token', BedrockGoogle.getToken, (ctx: Context) => {
  ctx.response.redirect('/secret.html')  
});

MFARouter.get('/OAuth/linkedin/login', BedrockLinkedin.sendRedirect);

MFARouter.get('/OAuth/linkedin/token', BedrockLinkedin.getToken, (ctx: Context) => {
  ctx.response.redirect('/secret.html')  
});

MFARouter.get('/secret.html', Bedrock.verifyAuth, async (ctx: Context) => {
  console.log('Secret hit');
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `secret.html`,
  });
  return;
});

MFARouter.get('/logout', Bedrock.signOut, (ctx: Context) => {
  ctx.response.redirect('/');
  return;
});

MFARouter.get('/:value', async (ctx: Context) => {
  console.log('hit!');
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

MFARouter.get('/imgs/:image', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).image;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/imgs`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

MFARouter.get('/scripts/:script', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).script;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/scripts`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

MFARouter.get('/stylesheets/:sheet', async (ctx: Context) => {
  const path = helpers.getQuery(ctx, {mergeParams: true}).sheet;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/stylesheets`,
    path: `${path}` //ctx.request.url.searchParams.get(site)
  });
  return;
});

//deno run --allow-read --allow-env