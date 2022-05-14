import {
  Context,
  crypto,
  encode64url,
  helpers,
  encode64,
} from "./../deps.ts";
import { TwitterOAuthParams } from "./../types.ts";

export class TwitterOAuth {
  provider = "Twitter";
  client_id: string;
  client_secret: string;
  response_type = "code";
  redirect_uri: string;
  state?: string;
  scope = "tweet.read users.read follows.read follows.write";
  code_challenge: string;
  code_challenge_method = "S256";

  constructor(stratParams: TwitterOAuthParams) {
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.redirect_uri = stratParams.redirect_uri;
    this.code_challenge = this.randomGenerator(128);
    Object.assign(this, stratParams)!;
  }
  randomGenerator = (length: number): string => {
    let result = "";
    const alphanum = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < length; i++) {
      result += alphanum[Math.floor(Math.random() * alphanum.length)];
    }
    return result;
  }
  /**
   * Appends client info onto uri string and redirects to generated link.
   */
  sendRedirect = async (ctx: Context): Promise<void> => {
    let uri = "https://twitter.com/i/oauth2/authorize?";

    if (this.state === undefined) {
      this.state = this.randomGenerator(20);
    }

    const challengeArr = new TextEncoder().encode(this.code_challenge);
    const encoded = encode64url(
      await crypto.subtle.digest("SHA-256", challengeArr),
    );

    for (const prop in this) {
      if (
        this[prop] !== undefined && prop !== "code_challenge" && prop !== "provider" &&
        prop !== "client_secret" && typeof this[prop] === "string"
      ) {
        uri += `${prop}=${this[prop]}&`;
      }
    }
    
    uri += `code_challenge=${encoded}`
    // ctx.response.headers.set('Content-type', 'application/x-www-form-urlencoded');
    // ctx.response.headers.set('Charset', 'UTF-8');
    ctx.response.redirect(encodeURI(uri));
    return;
  };
  /** */
  getToken = async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      const params = helpers.getQuery(ctx, { mergeParams: true });
      const { code, state } = params;

      if (params.error) throw new Error('User did not authorize app');

      if (state !== this.state) {
        ctx.state.session.set("isLoggedIn", false);
        throw new Error('State validation on incoming response failed');
      }
      const authHeader = encode64(`${this.client_id}:${this.client_secret}`);
      //console.log('this is the authheader: ', authHeader);
      
      const token = await fetch(
        "https://api.twitter.com/2/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Charset": "UTF-8",
            "Authorization": 'Basic ' + authHeader,
          },
          body: new URLSearchParams({
            client_id: this.client_id,
            code_verifier: this.code_challenge,
            code,
            grant_type: "authorization_code",
            redirect_uri: this.redirect_uri
          }),
        },
      );

      if (token.status !== 200) {
        throw new Error('Unsuccessful authentication response')
      }
      //console.log('twitter token is: ', token);
      const body = await token.json();
      //console.log('twitter body is: ', body);
      ctx.state.session.set("accessToken", body.access_token);
      ctx.state.session.set("isLoggedIn", true);
      ctx.state.session.set("mfa_success", true);
      next();
    } 
    catch(err){
      ctx.state.session.set("isLoggedIn", false);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Unable to log in with Twitter",
      };
      console.log('There was a problem logging in with Twitter: ', err);
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
