import { Router, Application, helpers, Context, isHttpError } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import dbController from "../controller/controller.ts";
import { init } from "../../src/mod.ts";
import {
  ClientOptions,
  LocalAuthParams,
  OAuthParams,
} from "../../src/types.ts";
import "https://deno.land/std@0.138.0/dotenv/load.ts";
import { GithubOAuth } from "../../src/Strategies/OAuth/GithubOAuth.ts";

export const MFARouter = new Router();

const clientOptions: ClientOptions = {
  connection: {
    hostname: Deno.env.get("EMAIL_HOSTNAME")!,
    tls: true,
    auth: {
      username: Deno.env.get("EMAIL_USERNAME")!,
      password: Deno.env.get("EMAIL_PASSWORD")!,
    },
  },
};

const params: LocalAuthParams = {
  provider: "Local",
  checkCreds: dbController.checkCreds,
  mfa_type: "Token",
  getSecret: dbController.getSecret,
  readCreds: async (ctx: Context): Promise<string[]> => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const { username, password } = bodyValue;
    return [username, password];
  },
  // getEmail: dbController.getEmail,
  // clientOptions: clientOptions,
  // fromAddress: Deno.env.get("EMAIL_FROM")!,
  // getNumber: dbController.getNumber,
  // accountSID: Deno.env.get("TWILIO_ACCOUNT_SID")!,
  // authToken: Deno.env.get("TWILIO_AUTH_TOKEN")!,
};

const GithubParams: OAuthParams = {
  provider: "Github",
  client_id: Deno.env.get("CLIENT_ID")!,
  client_secret: Deno.env.get("CLIENT_SECRET")!,
  redirect_uri: Deno.env.get("AUTH_CALLBACK_URL")!,
  scope: "read:user",
};

const GParams: OAuthParams = {
  client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
  client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
  scope: "openid",
  redirect_uri: "http://localhost:8080/oauth/google/token",
  provider: "Google",
};

const LinkedinParams: OAuthParams = {
  provider: "Linkedin",
  client_id: Deno.env.get("LINKEDIN_CLIENT_ID")!,
  client_secret: Deno.env.get("LINKEDIN_CLIENT_SECRET")!,
  scope: "r_liteprofile",
  redirect_uri: "http://localhost:8080/OAuth/linkedin/token",
};

const DiscordParams: OAuthParams = {
  provider: "Discord",
  client_id: Deno.env.get("DISCORD_CLIENT_ID")!,
  client_secret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
  redirect_uri: "http://localhost:8080/OAuth/discord/token",
  scope: "identify",
};

const FacebookParams: OAuthParams = {
  provider: "Facebook",
  client_id: Deno.env.get("FACEBOOK_CLIENT_ID")!,
  client_secret: Deno.env.get("FACEBOOK_CLIENT_SECRET")!,
  redirect_uri: "http://localhost:8080/OAuth/facebook/token",
  scope: "public_profile",
};

const TwitterParams: OAuthParams = {
  provider: "Twitter",
  client_id: Deno.env.get("TWITTER_CLIENT_ID")!,
  client_secret: Deno.env.get("TWITTER_CLIENT_SECRET")!,
  redirect_uri: "http://127.0.0.1:8080/OAuth/twitter/token",
  scope: "tweet.read users.read follows.read follows.write",
};

const Bedrock: any = init(params);
const BedrockGithub: any = init(GithubParams);
const BedrockGoogle: any = init(GParams);
const BedrockLinkedin: any = init(LinkedinParams);
const BedrockDiscord: any = init(DiscordParams);
const BedrockFacebook: any = init(FacebookParams);
const BedrockTwitter: any = init(TwitterParams);

MFARouter.get("/", async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/demo/client`,
    path: `index.html`,
  });
  return;
});

MFARouter.post("/login", Bedrock.localLogin, (ctx: Context) => {

  if (ctx.state.localVerified) {
    // Authenticated locally
    if (ctx.state.hasSecret === false) {
      // No MFA secret attached to account
      ctx.response.body = {
        successful: false,
        log: 'No secret',
      }
    } else {
      // MFA secret found
      ctx.response.body = {
        successful: true,
        mfa_required: ctx.state.mfaRequired,
      };
      ctx.response.status = 200;
    }
  } else {
    // Local authentication failed
    ctx.response.body = {
      successful: false,
    };
    ctx.response.status = 401;
  }
  return;
});

MFARouter.get("/getSecret", (ctx: Context) => {
  ctx.response.body = "You do not have a secret";
  ctx.response.status = 200;
  return;
})

MFARouter.post("/verifyMFA", Bedrock.checkMFA, (ctx: Context) => {
  ctx.response.body = {
    mfaVerified: true,
    url: "http://localhost:8080/secret.html",
  };
});

MFARouter.get("/OAuth/github/login", BedrockGithub.sendRedirect);
MFARouter.get("/OAuth/github/token", BedrockGithub.getToken, (ctx: Context) => {
  if (ctx.state.OAuthVerified) {
    ctx.response.redirect("/secret.html");
  } else {
    ctx.response.redirect("/blocked.html");
  }
});

MFARouter.get("/OAuth/google/login", BedrockGoogle.sendRedirect);
MFARouter.get("/OAuth/google/token", BedrockGoogle.getToken, (ctx: Context) => {
  if (ctx.state.OAuthVerified) {
    ctx.response.redirect("/secret.html");
  } else {
    ctx.response.redirect("/blocked.html");
  }
});

MFARouter.get("/OAuth/linkedin/login", BedrockLinkedin.sendRedirect);
MFARouter.get(
  "/OAuth/linkedin/token",
  BedrockLinkedin.getToken,
  (ctx: Context) => {
    if (ctx.state.OAuthVerified) {
      ctx.response.redirect("/secret.html");
    } else {
      ctx.response.redirect("/blocked.html");
    }
  },
);

MFARouter.get("/OAuth/discord/login", BedrockDiscord.sendRedirect);
MFARouter.get(
  "/OAuth/discord/token",
  BedrockDiscord.getToken,
  (ctx: Context) => {
    if (ctx.state.OAuthVerified) {
      ctx.response.redirect("/secret.html");
    } else {
      ctx.response.redirect("/blocked.html");
    }
  },
);

MFARouter.get("/OAuth/facebook/login", BedrockFacebook.sendRedirect);
MFARouter.get(
  "/OAuth/facebook/token",
  BedrockFacebook.getToken,
  (ctx: Context) => {
    if (ctx.state.OAuthVerified) {
      ctx.response.redirect("/secret.html");
    } else {
      ctx.response.redirect("/blocked.html");
    }
  },
);

MFARouter.get("/OAuth/twitter/login", BedrockTwitter.sendRedirect);
MFARouter.get(
  "/OAuth/twitter/token",
  BedrockTwitter.getToken,
  (ctx: Context) => {
    if (ctx.state.OAuthVerified) {
      ctx.response.redirect("/secret.html");
    } else {
      ctx.response.redirect("/blocked.html");
    }
  },
);

MFARouter.get(
  "/secret.html",
  BedrockDiscord.verifyAuth,
  async (ctx: Context) => {
    await ctx.send({
      root: `${Deno.cwd()}/demo/client`,
      path: `secret.html`,
    });
    return;
  },
);

MFARouter.get("/logout", BedrockDiscord.signOut, (ctx: Context) => {
  ctx.response.redirect("/");
  return;
});

MFARouter.get("/:value", async (ctx: Context) => {
  const path = helpers.getQuery(ctx, { mergeParams: true }).value;
  if (path === "favicon.ico") {
    ctx.response.status = 200;
  } else {
    await ctx.send({
      root: `${Deno.cwd()}/demo/client`,
      path: `${path}`,
    });
  }
  return;
});

MFARouter.get("/imgs/:image", async (ctx: Context) => {
  const path = helpers.getQuery(ctx, { mergeParams: true }).image;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/imgs`,
    path: `${path}`, //ctx.request.url.searchParams.get(site)
  });
  return;
});

MFARouter.get("/scripts/:script", async (ctx: Context) => {
  const path = helpers.getQuery(ctx, { mergeParams: true }).script;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/scripts`,
    path: `${path}`, //ctx.request.url.searchParams.get(site)
  });
  return;
});

MFARouter.get("/stylesheets/:sheet", async (ctx: Context) => {
  const path = helpers.getQuery(ctx, { mergeParams: true }).sheet;
  await ctx.send({
    root: `${Deno.cwd()}/demo/client/stylesheets`,
    path: `${path}`, //ctx.request.url.searchParams.get(site)
  });
  return;
});

//deno run --allow-read --allow-env --allow-net
