// import { OAuthStrategyParams } from './bedrock.ts'
import { Context, helpers } from "./deps.ts";
import { GithubOAuthParams, Provider } from './types.ts'


export class GithubOAuth {
  provider: Provider;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  state = '';
  login?: string;
  scope?: string;
  allow_signup?: string;

  constructor(stratParams: GithubOAuthParams) {
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.redirect_uri = stratParams.redirect_uri;
    this.provider = stratParams.provider;
    Object.assign(this, stratParams)!
  }
  /**
   * @param context object
   * @param next function
   * @returns
   */

  createURI = () => {
    let uri = 'http://github.com/login/oauth/authorize?';
    if (this.scope != undefined) {
      uri += `scope=${this.scope}&`;
    }
    const alphanum: string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 20; i++) {
      this.state += alphanum[Math.floor(Math.random() * alphanum.length)];
    }
    //console.log('this.state: ', this.state)
    uri += `redirect_uri=${this.redirect_uri}&state=${this.state}&client_id=${this.client_id}`;
    return uri;
  }

  /**
   * Invoke createURI() to obtain redirect URL
   * call ctx.response.redirect(createURI());
   */
  sendRedirect = (ctx: Context): void => {
    //console.log('--> going through /OAuth endpoint')
    ctx.response.redirect(this.createURI());
    return;
  }
  /**
   *  
   *
   */
  getToken = async (ctx: Context, next: () => Promise<unknown>) => {

    const params = helpers.getQuery(ctx, { mergeParams: true });
    //console.log(params);
    const { code, state } = params;
    // console.log('code, state', code, state)

    if (state !== this.state) {
      console.log('State validation on incoming response failed')
      ctx.state.session.set("isLoggedIn", false);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: 'Unable to log in via Github'
      }
      throw new Error;
    }

    try {
      const token = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.client_id,
          client_secret: this.client_secret,
          code
        })
      })

      const { access_token } = await token.json();
      // console.log(access_token)
      ctx.state.session.set("accessToken", access_token);
      ctx.state.session.set("isLoggedIn", true);
      ctx.state.session.set("mfa_success", true);
      next();
    }
    catch (err) {
      ctx.state.session.set("isLoggedIn", false);
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: 'Unable to retrieve token'
      }
      return;
    }
  }

  verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    if (await ctx.state.session.has('isLoggedIn') && await ctx.state.session.get('isLoggedIn')) {
      console.log('local auth worked');
      if (await ctx.state.session.has('mfa_success') && await ctx.state.session.get('mfa_success')) {
        console.log('mfa worked');
        return next();
      }
    }
    ctx.response.redirect('/blocked.html');
    // ctx.response.status = 401;
    // ctx.response.body = {
    //   success: false,
    //   message: "Not currently signed in"
    // };
    return;
  }

  signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession(ctx);
    next();
  }

  /**
   * Callback middleware (route hit after successful Github authentication)
   * - Make a POST request with the information received from Github (secret, code, etc)
   * - Response of POST request will be an access token and refresh token
   * - Add tokens to user session
   * - Add property to user session (perhaps isLoggedIn = true/false) to determine that user has successfully signed in
   */
  // .post('/redirect_url/:code', Bedrock.CompleteOAUTH, DEVELOPERMIDDLEWARE) ->> console.log(ctx.params.code) -> CODE //-->


  /**
   * Verify auth middleware
   * Genuine copy/paste from LocalStrategy with minor tweaks to account for lack of MFA properties and certain class variables
   */

  /**
   * Logout middleware
   * Copy/paste from LocalStrategy
   * OPTIONAL: look into whether Github has logout functionality as well
   * OPTIONAL: Check session length for Github OAUTH - match oak session length to github session length
   */
}



// https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
// Github Auth Flow
  //1 Request a user's GitHub identity
    // create URL
        //URL should contain
        // githubURL,
        // redirect_uri,
        // client_id (required)
        // login
        // scope
        // state
        // allow_signup
  //2 users are redirected back to your site by github
    //POST https://github.com/login/oauth/access_token
    //