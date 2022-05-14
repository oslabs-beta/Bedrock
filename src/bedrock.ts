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
 * Session Template:
 * {
 *  isLoggedin: boolean,
 *  mfa_success: boolean
 *  username: string,
 * }
 */

// Interface definitions
import { LocalStrategy } from "./LocalStrategy.ts";
import { GoogleOAuth } from "./OAuthStrategies/GoogleOAuth.ts";
import { GithubOAuth } from "./OAuthStrategies/GithubOAuth.ts";
import { LinkedinOAuth } from "./OAuthStrategies/LinkedinOAuth.ts";
import { DiscordOAuth } from "./OAuthStrategies/DiscordOAuth.ts";
import { FacebookOAuth } from "./OAuthStrategies/FacebookOAuth.ts";
import { TwitterOAuth } from "./OAuthStrategies/TwitterOAuth.ts";
import {
  DiscordOAuthParams,
  FacebookOAuthParams,
  GithubOAuthParams,
  GoogleOAuthParams,
  LinkedinOAuthParams,
  LocalStrategyParams,
  TwitterOAuthParams
} from "./types.ts";

// export type Strategy = 'Local Strategy' | 'Github Strategy';
// export type Strategy = 'Github Strategy'

//Main Functions
export function initLocal(params: LocalStrategyParams): LocalStrategy {
  return new LocalStrategy(params);
}

export function initOAuth(
  params:
    | GithubOAuthParams
    | GoogleOAuthParams
    | LinkedinOAuthParams
    | DiscordOAuthParams
    | FacebookOAuthParams
    | TwitterOAuthParams,
) {
  switch (params.provider) {
    // case 'Local' && typeof params === LocalStrategyParams:
    //   return new LocalStrategy(params);
    case "Discord":
      return new DiscordOAuth(params);
    case "Google":
      return new GoogleOAuth(params);
    case "Github":
      return new GithubOAuth(params);
    case "Linkedin":
      return new LinkedinOAuth(params);
    case "Facebook":
      return new FacebookOAuth(params);
    case "Twitter":
      return new TwitterOAuth(params);
    default:
      throw new Error(
        "Invalid input on initOauth constuctor - see log for more information",
      );
  }
}
