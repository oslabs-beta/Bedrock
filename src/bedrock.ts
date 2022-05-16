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
  switch (params.provider) {
    case "Local":
      return new LocalAuth(params);
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
        "Invalid input on init constuctor - see log for more information",
      );
  }
}
