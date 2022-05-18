import { Context } from "../../src/deps.ts";
import { LocalAuth } from "./MFA/LocalAuth.ts";

export abstract class Auth {
  /**
   * 
   * @param ctx 
   * @param next 
   * @returns 
   */
  readonly verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    if (await ctx.state.session.has("isLoggedIn") && await ctx.state.session.get("isLoggedIn")) {
      if ( !(this instanceof LocalAuth) || this instanceof LocalAuth && (this.mfa_type === undefined || await ctx.state.session.get('mfa_success'))){
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
  readonly signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession();
    next();
  };
}