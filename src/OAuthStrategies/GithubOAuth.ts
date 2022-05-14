// import { OAuthStrategyParams } from './bedrock.ts'
import { Context, helpers } from "./../deps.ts";
import { GithubOAuthParams } from "./../types.ts";

export class GithubOAuth {
  provider = 'Github';
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  state?: string;
  login?: string;
  scope?: string;
  allow_signup?: string;

  constructor(stratParams: GithubOAuthParams) {
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.redirect_uri = stratParams.redirect_uri;
    Object.assign(this, stratParams)!;
  }

  /**
   * Appends client info onto uri string and redirects to generated link.
   */
  sendRedirect = (ctx: Context): string => {
    let uri = "http://github.com/login/oauth/authorize?";
    if (this.scope !== undefined) {
      uri += `scope=${this.scope}&`;
    }
    if (this.state === undefined) {
      this.state = "";
      const alphanum: string =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let i = 0; i < 20; i++) {
        this.state += alphanum[Math.floor(Math.random() * alphanum.length)];
      }
    }

    for (let prop in this) {
      if (this[prop] !== undefined && prop !== "provider" && prop !== "client_secret" && typeof this[prop] === 'string') {
        uri += `${prop}=${this[prop]}&`;
      }
    }
    uri = uri.slice(0, uri.length - 1); 
    ctx.response.redirect(uri);
    return uri;
  };
  /**
   * 
   */
  getToken = async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      const params = helpers.getQuery(ctx, { mergeParams: true });    
      const { code, state } = params;    

      if (params.error) throw new Error('User did not authorize app');

      if (state !== this.state) {
        ctx.state.session.set("isLoggedIn", false);
        throw new Error('State validation on incoming response failed');
      }

      const token = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code,
        }),
      });

      if (token.status !== 200) {
        throw new Error(`Unsuccessful authentication response`)
      }

      const body = await token.json();
      ctx.state.session.set("accessToken", body.access_token);
      ctx.state.session.set("isLoggedIn", true);
      ctx.state.session.set("mfa_success", true);
      next();
    } 
    catch(err) {
      ctx.state.session.set("isLoggedIn", false);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Unable to login via Github",
      };
      console.log('There was a problem logging in with Github: ', err);
      return;
    }
  };

  verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    if (
      await ctx.state.session.has("isLoggedIn") &&
      await ctx.state.session.get("isLoggedIn")
    ) {
      if (
        await ctx.state.session.has("mfa_success") &&
        await ctx.state.session.get("mfa_success")
      ) {
        return next();
      }
    }
    ctx.response.redirect("/blocked.html");
    return;
  };

  signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession(ctx);
    next();
  };
}