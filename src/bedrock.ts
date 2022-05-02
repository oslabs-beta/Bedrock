/**
 * First Auth Middleware
 * 1. Get credentials
 *    -POST body
 *    -Authorization header (Basic -CREDENTIALSINBASE64-) [potentially create a frontend function that does this for the developer]
 *  Extracting credentials: return 2 strings, a username and a password:
 *    by default, we will use Authorization header, however we will provide an optional parameter where they can insert their own custom verification function
 * 2. Verify that username/password is correct
 *  Execute a function given to us by the developer that queries the database and returns true/false
 * 3. Set login property (in session) to true
 * 4. Redirect to MFA route (if enabled)
 * 
 * Session Cookie Template:
 * {
 *  isLoggedin: boolean,
 *  mfa_success: boolean
 * }
 */

// Interface definitions
import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { decode } from "https://deno.land/std@0.137.0/encoding/base64.ts"

type Strategy = 'Local Strategy' | 'Github OAuth';

interface LocalStrategyParams {
  mfa_enabled : boolean;
  checkCreds : (username: string, password: string) => boolean;
  readCreds? : (ctx: Context) => string[];
  // checkCreds(...readCreds(ctx));
}

interface OAuthStrategyParams {
  client_id : string;
  redirect_url? : string;
  login? : string;
  scope? : string;
  state? : string;
  allow_signup? : string;
}

// Main Function
export function init(strategy: Strategy, params: LocalStrategyParams): LocalStrategy {
  switch (strategy) {
    case 'Local Strategy':
      return new LocalStrategy(params);
    // case 'Github Oauth':
    //   return ;
    default:
      throw new Error('Incorrect value passed as strategy, init not completed');
  }
}


class LocalStrategy{
  checkCreds: (username: string,password: string) => boolean;
  readCreds?: (ctx: Context) => string[];
  mfa_enabled: boolean; 
  
  constructor(stratParams: LocalStrategyParams) {
    this.checkCreds = stratParams.checkCreds;
    this.readCreds = stratParams.readCreds;
    this.mfa_enabled = stratParams.mfa_enabled;
  }
  
  async localLogin(ctx: Context, next: () => Promise<unknown>) {
    let credentials: string[] = [];

    if (this.readCreds) {
      credentials = this.readCreds(ctx);
    } else {
      if (ctx.request.headers.has('Authorization')) {
        let authHeaders: string = ctx.request.headers.get('Authorization')!;
        if (authHeaders.startsWith('Basic ')) {
          authHeaders = authHeaders.slice(6);
        }
        const auth = decode(authHeaders);
        const decodedAuth = new TextDecoder().decode(auth!);
        credentials = decodedAuth.split(":");
      }
    }
    const [username, password] = [credentials[0], credentials[1]];

    if (this.checkCreds(username, password)) {
      await ctx.state.session.set('isLoggedIn', true);
      ctx.state.localVerified = true;
    } else {
      await ctx.state.session.set('isLoggedIn', false);
      ctx.state.localVerified = false;
    }
    next();
    // Developer needs to check the state property localVerified to redirect user
    // and send response based off auth status
  }

  async verify(ctx: Context, next: () => Promise<unknown>) {
    if (await ctx.state.session.has('isLoggedIn') && await ctx.state.session.get('isLoggedin')) {

    }

    // check that the isLoggedIn property is true
    // if MFA is enabled, check MFA property is true
    // next
    // otherwise, ??? 
  }
}


function testFunction() {
  // anthony:valdez
  let authHeaders = 'Basic YW50aG9ueTp2YWxkZXo=';
  if (authHeaders.startsWith('Basic ')) {
    authHeaders = authHeaders.slice(6);
  }
  const auth = decode(authHeaders);
  const decodedAuth = new TextDecoder().decode(auth!);
  const credentials = decodedAuth.split(":");
  console.log(credentials);
}

testFunction();

// class OAuthStrategy {
//   constructor(stratParams: OAuthStrategy) {
//     this.allow_signup = stratParams.allow_signup;
//     this.client_id = stratParams.client_id;
//     this.login = stratParams.login;
//     this.redirect_url = stratParams.redirect_url;
//     this.state = stratParams.state;
//   }
// }

