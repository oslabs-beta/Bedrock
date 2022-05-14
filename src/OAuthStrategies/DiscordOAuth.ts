// import { OAuthStrategyParams } from './bedrock.ts'
import { Context, helpers } from "./../deps.ts";
import { DiscordOAuthParams } from "./../types.ts"

export class DiscordOAuth {
  provider = "Discord"; 
  client_id: string;
  client_secret: string;
  grant_type = "authorization_code";
  redirect_uri: string;
  response_type = 'code';
  scope?: string;
  state?: string;
  

  constructor(stratParams: DiscordOAuthParams) {
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.redirect_uri = stratParams.redirect_uri;
    this.scope = stratParams.scope;
    Object.assign(this, stratParams)!;
  }

  /**
   * Appends client info onto uri string and redirects to generated link.
   */
  sendRedirect = (ctx: Context): void => {
    let uri = "https://discord.com/api/oauth2/authorize?";
    if (this.scope !== undefined) {
      uri += `scope=${this.scope}&`;
    } else{
      uri += `scope=identify`;
    }
    
    if (this.state === undefined) {
      this.state = "";
      const alphanum = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let i = 0; i < 20; i++) {
        this.state += alphanum[Math.floor(Math.random() * alphanum.length)];
      }
    }

    for (const prop in this) {
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
    try {
      const params = helpers.getQuery(ctx, { mergeParams: true });    
      const { code, state } = params;    

      if (params.error) throw new Error('User did not authorize app');

      if (state !== this.state) {
        ctx.state.session.set("isLoggedIn", false);
        throw new Error('State validation on incoming response failed');
      }

      const token = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirect_uri
        }),
      });

      if (token.status !== 200) {
        throw new Error('Unsuccessful authentication response')
      }

      console.log(token);
      
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
        message: "Unable to log in with Discord",
      };
      console.log('There was a problem logging in with Discord: ', err)
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