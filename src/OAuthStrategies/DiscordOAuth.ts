// import { OAuthStrategyParams } from './bedrock.ts'
import { Context, helpers } from "./../deps.ts";
import { DiscordOAuthParams } from "./../types.ts"

export class DiscordOAuth {
  provider = "Discord"; 
  client_id: string;
  client_secret: string;
  grant_type = "authorization_code";
  redirect_uri: string;
  state?: string;
  scope?: string;

  constructor(stratParams: DiscordOAuthParams) {
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.redirect_uri = stratParams.redirect_uri;
    Object.assign(this, stratParams)!;
  }

  /**
   * Appends client info onto uri string and redirects to generated link.
   */
  sendRedirect = (ctx: Context): void => {
    let uri = "https://discord.com/api/oauth2/authorize";
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
    return;
  };
  /**
   * 
   */
  getToken = async (ctx: Context, next: () => Promise<unknown>) => {
    const params = helpers.getQuery(ctx, { mergeParams: true });    
    const { code, state } = params;    

    if (state !== this.state) {
      console.log("State validation on incoming response failed");
      ctx.state.session.set("isLoggedIn", false);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Unable to log in via Discord",
      };
      throw new Error();
    }

    try {
      const token = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code,
          grant_type: 'authorization-code',
          redirect_uri: this.redirect_uri
        }),
      });

      const { access_token } = await token.json();
      ctx.state.session.set("accessToken", access_token);
      ctx.state.session.set("isLoggedIn", true);
      ctx.state.session.set("mfa_success", true);
      next();
    } catch (err) {
      ctx.state.session.set("isLoggedIn", false);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Unable to retrieve token",
      };
      return;
    }
  };

  verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    if (
      await ctx.state.session.has("isLoggedIn") &&
      await ctx.state.session.get("isLoggedIn")
    ) {
      console.log("local auth worked");
      if (
        await ctx.state.session.has("mfa_success") &&
        await ctx.state.session.get("mfa_success")
      ) {
        console.log("mfa worked");
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