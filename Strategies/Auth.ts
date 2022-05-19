import { Context } from "../deps.ts";
import { LocalAuth } from "./MFA/LocalAuth.ts";

export abstract class Auth {
  /**
   * @param ctx - Context object passed in via the Middleware chain
   * @param next - Invokes next function in the Middleware chain
   * Note: verifyAuth is an OPTIONAL authorization verifying middleware function for the developer to utilize
       This may be deferred, as developer may utilize different means of verifying authorization prior to allowing client access to sensitive material
   * verifyAuth checks the isLoggedIn and mfa_success session properties previously set by checkMFA
   * Will ensure that isLoggedIn is true
      Then will check to see if mfa_enabled is true -- if so, will ensure previous mfaCheck set property mfa_success to true
        If mfa_success is true, will then allow progression
   *  Otherwise, if mfa_enabled is false, will also allow progression since mfa_success check is not warranted
   * If isLoggedIn is false, will return message stating client is "Not currently signed in"
   */
  readonly verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    if (await ctx.state.session.has("isLoggedIn") && await ctx.state.session.get("isLoggedIn")) {
      if ( !(this instanceof LocalAuth) || this instanceof LocalAuth && (this.mfaType === undefined || await ctx.state.session.get('mfa_success'))){
        ctx.state.authSuccess = true;
      }
    } else {
      ctx.state.authSuccess = false;
    }

    return next();
  };

  /**
   * 
   * @param ctx - Context object passed in via the Middleware chain 
   * @param next - Invokes next function in the Middleware chain
   * Note: signOut is an OPTIONAL function for the developer to utilize in order to terminate the session. This may be deferred, as developer may utilize different means of verifying authorization prior to allowing client access to sensitive material.
   * signOut deletes the existing session instantiated via Oak_sessions and effectively signs the user out.
   */
  readonly signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession();
    next();
  };
}