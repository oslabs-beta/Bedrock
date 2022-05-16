import { OAuthParams } from "../../types.ts";
import { Auth } from "../Auth.ts";

export class OAuth extends Auth{
  /**
   * Universal OAuth properties and constructor method
   */

  // deno-lint-ignore no-explicit-any
  [key: string]: any;
  protected readonly provider: string;
  protected readonly client_id: string;
  protected readonly client_secret: string;
  protected readonly redirect_uri: string;
  protected readonly response_type = 'code';
  protected readonly scope: string;
  protected readonly URIprops: string[] = ['client_id', 'redirect_uri', 'scope', 'response_type'];

  constructor(stratParams: OAuthParams) {
    super();
    this.client_id = stratParams.client_id;
    this.client_secret = stratParams.client_secret;
    this.redirect_uri = stratParams.redirect_uri;
    this.scope = stratParams.scope;
    this.provider = stratParams.provider;
  }

  /**
   * Universal class methods used across all OAuth classes
   */
  
  /**
   * 
   * @param length 
   * @returns 
   */
  randomStringGenerator = (length: number): string => {
    let result = '';
    const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
      result += alphanum[Math.floor(Math.random() * alphanum.length)];
    }
    return result;
  }

  /**
   * 
   * @param ctx 
   * @param next 
   */
  // signOut = async (ctx: Context, next: () => Promise<unknown>) => {
  //   await ctx.state.session.deleteSession(ctx);
  //   next();
  // };

  uriBuilder = ():string => {
    let uri;

    switch (this.provider) {
      case 'Discord':
        uri = 'https://discord.com/api/oauth2/authorize?';
        break;
      case 'Google':
        uri = 'http://accounts.google.com/o/oauth2/v2/auth?';
        break;
      case 'Github':
        uri = 'http://github.com/login/oauth/authorize?';
        break;
      case 'Linkedin':
        uri = 'https://www.linkedin.com/oauth/v2/authorization?';
        break;
      case 'Facebook':
        uri = 'https://www.facebook.com/v13.0/dialog/oauth?';
        break;
      case 'Twitter':
        uri = 'https://twitter.com/i/oauth2/authorize?';
        break;
      default:
        throw new Error(
          'Invalid provider was provided.'
        );
    }

    for (const prop of this.URIprops){
      if (this[prop] !== undefined) {
        uri += `${prop}=${this[prop]}&`;
      }
    }
    uri = uri.slice(0, uri.length - 1); 
    return uri;
  }
}