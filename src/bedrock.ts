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
 */

// Interface definitions
import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { decode } from "https://deno.land/std@0.137.0/encoding/base64.ts"

type Strategy = 'Local Strategy' | 'Github OAuth';

interface LocalStrategy {
  mfa_enabled : boolean;
  checkCreds : (username: string, password: string) => boolean;
  readCreds? : (ctx: Context) => string[2];
  // checkCreds(...readCreds(ctx));
}

interface OAuthStrategy {
  client_id : string;
  redirect_url? : string;
  login? : string;
  scope? : string;
  state? : string;
  allow_signup? : string;
}

// Main Function
export function init(strategy: Strategy, params: LocalStrategy | OAuthStrategy): LocalStrategy | OAuthStrategy {
  switch (strategy) {
    case 'Local Strategy':
      return new LocalStrategy(params: LocalStrategy);
    // case 'Github Oauth':
    //   return ;
    default:
      throw new Error('Incorrect value passed as strategy, init not completed');
  }
}


class LocalStrategy {
  constructor(stratParams: LocalStrategy) {
    this.checkCreds = stratParams.checkCreds;
    this.readCreds = stratParams.readCreds;
    this.mfa_enabled = stratParams.mfa_enabled;
  }

  verify(ctx: Context, next: () => Promise<unknown>) {
    if (this.readCreds) {
      const [username, password] = this.readCreds(ctx);
      ctx.state.username = username;
      ctx.state.password = password;
      next();
    } else {
      if (ctx.request.headers.has('Authorization')) {
        let authHeaders: string | null = ctx.request.headers.get('Authorization');
        if (authHeaders?.startsWith('Basic ')) {
          authHeaders = authHeaders.slice(6);
        }
        authHeaders = decode(authHeaders);
        const decodedAuth = new TextDecoder().decode(authHeaders!);
        const credentials = decodedAuth.split(":");
        return credentials;
      }
    }
  }
}

class OAuthStrategy {
  constructor(stratParams: OAuthStrategy) {
    this.allow_signup = stratParams.allow_signup;
    this.client_id = stratParams.client_id;
    this.login = stratParams.login;
    this.redirect_url = stratParams.redirect_url;
    this.state = stratParams.state;
  }
}

