import { Context, helpers } from "../../deps.ts";
import { OAuthParams } from "../../types.ts";
import { OAuth } from './OAuth.ts';

export class GithubOAuth extends OAuth {
  constructor(stratParams: OAuthParams) {
    super(stratParams)
  }

  /**
   * Appends necessary client info onto uri string and redirects to generated link.
   * @param ctx - Context object passed in via the Middleware chain  
   **/
  sendRedirect = async (ctx: Context): Promise<void> => {
    let uri = this.uriBuilder();

    const state = this.randomStringGenerator(20);

    await ctx.state.session.flash("state", state);

    uri += `&state=${state}`;
    
    ctx.response.redirect(uri);
    return;
  };

  /**
   * Functionality to generate post request to Github server to obtain access token
   * @param ctx - Context object passed in via the Middleware chain 
   * @param next - Invokes next function in the Middleware chain
   **/
  getToken = async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      const params = helpers.getQuery(ctx, { mergeParams: true });    
      const { code, state } = params;    

      if (params.error) throw new Error('User did not authorize app');

      if (state !== await ctx.state.session.get('state')) {
        throw new Error('State validation on incoming response failed');
      }

      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept" : "application/json"
        },
        body: JSON.stringify({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code
        }),
      });
      
      const token = await response.json();
      
      if (response.status !== 200) {
        console.log('Failed Response Body: ', token);
        throw new Error('Unsuccessful authentication response');
      }
      
      // Bedrock session management variable assignment
      await ctx.state.session.set("accessToken", token.access_token);
      await ctx.state.session.set("isLoggedIn", true);

      /**
       * State properties that expire at end of response cycle
       * Meant for developer to utilize in case of external session management
       * Token passed to expose access/refresh token to developer
       **/
      ctx.state.OAuthVerified = true;
      ctx.state.token = token;
    } 
    catch(err) {
      await ctx.state.session.set("isLoggedIn", false);
      ctx.state.OAuthVerified = false;

      console.log('There was a problem logging in with Github: ', err)
    }

    await next();
  };
}
