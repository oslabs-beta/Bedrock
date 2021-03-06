import { DiscordOAuth, FacebookOAuth, GithubOAuth, GoogleOAuth, LinkedinOAuth, LocalAuth, TwitterOAuth, OAuth } from "./strategies.ts";
import { LocalAuthParams, OAuthParams } from "./types.ts";

/**
 * Strategy and StrategyParams type is a collection of various strategies and their respective parameter objects grouped for cleanliness
 */
type Strategy = DiscordOAuth | FacebookOAuth | GithubOAuth | GoogleOAuth | LinkedinOAuth | LocalAuth | TwitterOAuth;
type StrategyParams = LocalAuthParams | OAuthParams;

/**
 * Bedrock's init function accepts a Params object and instantiates the appropriate class
 * based off the provider defined within the Params object
 * @param OAuthParams or LocalAuthParams
 * @returns Strategy
 */

/**
 * 
 * @param params StrategyParams object constructed with initialization details of Strategy of choice
 * @returns {OAuth | LocalAuth} Returns class with exposed Middleware functions based off chosen strategy
 */
export function init(params: LocalAuthParams): LocalAuth;
export function init(params: OAuthParams): OAuth;
export function init(params: StrategyParams): LocalAuth | OAuth {
  let strategy: Strategy;

  switch (params.provider) {
    case "Local":
      strategy = new LocalAuth(params);
      break;
    case "Discord":
      strategy = new DiscordOAuth(params);
      break;
    case "Google":
      strategy = new GoogleOAuth(params);
      break;
    case "Github":
      strategy = new GithubOAuth(params);
      break;
    case "Linkedin":
      strategy = new LinkedinOAuth(params);
      break;
    case "Facebook":
      strategy = new FacebookOAuth(params);
      break;
    case "Twitter":
      strategy = new TwitterOAuth(params);
      break;
    default:
      throw new Error(
        "Invalid input on init constuctor - see log for more information",
      );
  }

  // will provide developer a log that will inform which strategy has been initialized
  console.info(`Successfully initialized ${params.provider} strategy!`);
  return strategy;
}
