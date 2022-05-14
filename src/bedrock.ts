import { LocalStrategy } from "./LocalStrategy.ts";
import { GoogleOAuth } from "./OAuthStrategies/GoogleOAuth.ts";
import { GithubOAuth } from "./OAuthStrategies/GithubOAuth.ts";
import { LinkedinOAuth } from "./OAuthStrategies/LinkedinOAuth.ts";
import { DiscordOAuth } from "./OAuthStrategies/DiscordOAuth.ts";
import { FacebookOAuth } from "./OAuthStrategies/FacebookOAuth.ts";
import { TwitterOAuth } from "./OAuthStrategies/TwitterOAuth.ts";
import { OAuthParams, LocalStrategyParams } from "./types.ts";
import { Context } from './deps.ts';

/**
 * 
 * @param params 
 * @returns 
 */
export function init(params: OAuthParams | LocalStrategyParams) {
  let strategy: LocalStrategy | DiscordOAuth | GoogleOAuth | GithubOAuth | LinkedinOAuth | FacebookOAuth | TwitterOAuth;
  switch (params.provider) {
    case 'Local':
      strategy = new LocalStrategy(params)
      break;
    case 'Discord':
      strategy = new DiscordOAuth(params);
      break;
    case 'Google':
      strategy = new GoogleOAuth(params);
      break;
    case 'Github':
      strategy = new GithubOAuth(params);
      break;
    case 'Linkedin':
      strategy = new LinkedinOAuth(params);
      break;
    case 'Facebook':
      strategy = new FacebookOAuth(params);
      break;
    case 'Twitter':
      strategy = new TwitterOAuth(params);
      break;
    default:
      throw new Error(
        'Invalid input on init constuctor - see log for more information'
      ); 
  }

  /**
   * Universal methods leveraged in both OAuth and Local strategies are added
   * after instantiation in order to avoid multiple class extensions
   */


  /**
   * 
   * @param ctx 
   * @param next 
   * @returns 
   */
  strategy.verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    if (await ctx.state.session.has("isLoggedIn") && await ctx.state.session.get("isLoggedIn")) {
      if ( !(strategy instanceof LocalStrategy) || strategy instanceof LocalStrategy && (strategy.mfa_type === undefined || await ctx.state.session.get('mfa_success'))){
        ctx.state.authSuccess = true;
      }
    } else {
      ctx.state.authSuccess = false;
    }

    return next();
  };

  /**
   * 
   * @param ctx 
   * @param next 
   */
  strategy.signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession(ctx);
    next();
  };

  return strategy;
}
