import {
  DiscordOAuth,
  FacebookOAuth,
  GithubOAuth,
  GoogleOAuth,
  LinkedinOAuth,
  LocalAuth,
  TwitterOAuth,
} from "./strategies.ts";
import { LocalAuthParams, OAuthParams } from "./types.ts";

/**
 * @param params
 * @returns
 */
export function init(params: OAuthParams | LocalAuthParams) {
  let strategy: DiscordOAuth | FacebookOAuth | GithubOAuth | GoogleOAuth | LinkedinOAuth | LocalAuth | TwitterOAuth;

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

  console.info(`Successfully initialized ${params.provider} strategy!`);
  return strategy;
}
