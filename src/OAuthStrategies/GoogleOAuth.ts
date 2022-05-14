import { Context, helpers } from "./../deps.ts";
import { GoogleOAuthParams } from "./../types.ts";

export class GoogleOAuth {
  provider = "Google";
  client_id: string;
  client_secret: string;
  scope: string;
  redirect_uri: string;
  response_type = "code";
  access_type?: "online" | "offline";
  state?: string;
  prompt?: "none" | "consent" | "select_account";

  constructor(stratParams: GoogleOAuthParams) {
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.scope = stratParams.scope;
    this.redirect_uri = stratParams.redirect_uri;
    Object.assign(this, stratParams)!;
  }

  /**
   * Appends client info onto uri string and redirects to generated link.
   */
  sendRedirect = (ctx: Context): void => {
    let uri = "http://accounts.google.com/o/oauth2/v2/auth?";
    if (this.state === undefined) {
      this.state = "";
      const alphanum: string =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let i = 0; i < 20; i++) {
        this.state += alphanum[Math.floor(Math.random() * alphanum.length)];
      }
    }
    // Adding defined props to uri and including only props that are strings (exludes functions)
    for (let prop in this) {
      if (this[prop] !== undefined && prop !== "provider" && prop !== "client_secret" && typeof this[prop] === 'string') {
        uri += `${prop}=${this[prop]}&`;
      }
    }
    // Removing trailing "&" from uri variable
    uri = uri.slice(0, uri.length - 1);    
    // console.log(uri);
    ctx.response.redirect(uri);
    return;
  }

  /**
   * After user signs in with their credentials on OAuth providers page a response 
   * with the code and current state are sent back to client
   * 
   */
  getToken = async ( ctx: Context, next: () => Promise<unknown>) => {
    try {
    
      const params = helpers.getQuery(ctx, { mergeParams: true });
      const { code, state } = params;

      if (params.error) throw new Error('User did not authorize app');

      if (state !== this.state) {
        ctx.state.session.set("isLoggedIn", false);
        throw new Error('State validation on incoming response failed');
      }

      const token = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code,
          grant_type: "authorization_code",
          redirect_uri: this.redirect_uri,
        }),
      });
      
      if (token.status !== 200) {
        throw new Error('Unsuccessful authentication response');
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
        message: "Unable to log in with Google.",
      };
      console.log('There was a problem logging in with Google: ', err)
      return;
    }
  }

  /**
   * 
   */
  verifyAuth = async ( ctx: Context, next: () => Promise<unknown>) => {
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
  }

  signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession(ctx);
    next();
  }
}
