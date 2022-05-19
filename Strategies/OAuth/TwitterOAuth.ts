import { Context, crypto, encode64url, helpers, encode64, } from "./../../deps.ts";
import { OAuthParams } from "./../../types.ts";
import { OAuth } from './OAuth.ts';

  /**
   * Appends necessary client info onto uri string and redirects to generated link.
   * @param ctx 
   * @returns 
   **/

export class TwitterOAuth extends OAuth{
  constructor(stratParams: OAuthParams) {
    super(stratParams);
    Object.assign(this, stratParams)!;
  }
  
  /**
   * Appends necessary client info onto uri string and redirects to generated link. Utilizes PKCE SHA256 to secure response
   * and prevent malicious applications on device to steal access token
   * @param ctx - Context object passed in via the Middleware chain  
   **/
  sendRedirect = async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
    let uri = this.uriBuilder();

    const state = this.randomStringGenerator(20);
    const code_challenge = this.randomStringGenerator(128);

    await ctx.state.session.flash('state', state);
    await ctx.state.session.flash('code_challenge', code_challenge);

    const challengeArr = new TextEncoder().encode(code_challenge);
    const encoded = encode64url(
      await crypto.subtle.digest("SHA-256", challengeArr),
    );
    
    uri += `&state=${state}&code_challenge=${encoded}&code_challenge_method=S256`;

    ctx.response.redirect(uri);
    await next();
    return;
  };
  
  /**
   * Functionality to generate post request to Twitter server to obtain access token. Utilizes PKCE SHA256 to secure response
   * and prevent malicious applications on device to steal access token
   * @param ctx - Context object passed in via the Middleware chain 
   * @param next - Invokes next function in the Middleware chain
   **/
  getToken = async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      const params = helpers.getQuery(ctx, { mergeParams: true });
      const { code, state } = params;

      const sessionState = await ctx.state.session.get('state');
      
      if (params.error) throw new Error('User did not authorize app');

      if (state !== sessionState) {
        throw new Error('State validation on incoming response failed');
      }

      const authHeader = encode64(`${this.client_id}:${this.client_secret}`);
      
      const response = await fetch(
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
            code_verifier: await ctx.state.session.get('code_challenge'),
            code,
            grant_type: "authorization_code",
            redirect_uri: this.redirect_uri
          }),
        },
      );

      const token = await response.json();
      if (response.status !== 200) {
        console.log('Failed Response Body: ', token);
        throw new Error('Unsuccessful authentication response')
      }

      await ctx.state.session.set("accessToken", token.access_token);
      await ctx.state.session.set("isLoggedIn", true);

      ctx.state.OAuthVerified = true;
      ctx.state.token = token;
    } 
    catch(err){
      await ctx.state.session.set("isLoggedIn", false);
      ctx.state.OAuthVerified = false;

      console.log('There was a problem logging in with Twitter: ', err);
    }
    await next();
  };

}
