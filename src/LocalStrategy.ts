import { Context } from "https://deno.land/x/oak/mod.ts";
import { decode } from "https://deno.land/std@0.137.0/encoding/base64.ts";
import { generateTOTP } from "./totp.ts";
import { TwilioSMS, Incoming } from "./twilioSMS.ts";

export type LocalStrategyParams = {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  mfa_type: "Token"
  readCreds?: (ctx: Context) => string[];
  getSecret: (username: string) => Promise<string>;
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  mfa_type: "SMS"
  readCreds?: (ctx: Context) => string[];
  getSecret: (username: string) => Promise<string>;
  getNumber: (username: string) => Promise<string>;
  accountSID: string;
  authToken: string;
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: false;
  readCreds?: (ctx: Context) => string[];
}

// export interface LocalStrategyInterface {
//   checkCreds: boolean;
//   mfa_enabled: boolean; 
//   getSecret?: string;
//   readCreds?: string[];
//   mfa_type?: string;
//   accountSID?: string;
//   authToken?: string;
//   getNumber?: string;
// }
/**
 * Class LocalStrategy has 2 REQUIRED properties: checkCreds and mfa_enabled
 * All other properties are optional, and will be subjected to type LocalStrategyParams
 */
export class LocalStrategy {
  checkCreds: ((username: string, password: string) => Promise<boolean>);
  mfa_enabled: boolean;
  getSecret?: (username: string) => Promise<string>;
  readCreds?: ((ctx: Context) => string[]);
  mfa_type?: string;
  accountSID?: string;
  authToken?: string;
  getNumber?: (username: string) => Promise<string>;

  constructor(stratParams: LocalStrategyParams) {
    this.checkCreds = stratParams.checkCreds;
    this.mfa_enabled = stratParams.mfa_enabled;

    Object.assign(this, stratParams);
  }
  /**
   * @param context object
   * @param next function
   * The localLogin method leverages the checkCreds property that was initialized when the object was instantiated 
   * It may also utilize the optional readCreds property that the developer may use in order to provide an array of [username, password]
   * If readCreds is not initialized, will assume the developer is utilizing the Authorization header Basic to pass username and password in base64
   
   * Will leverage the checkCreds property with the passed in username and password. 
      If returns true, will set session 'isLoggedIn' to true and initialize state property 'localVerified' to true.
      Else, will set 'isLoggedIn' to false and initialize state property 'localVerified' to false.

   * Developer may then leverage the localVerified property on state in subsequent middleware 
   */
  localLogin = async (ctx: Context, next: () => Promise<unknown>) => {
    let credentials: string[] = [];

    if (this.readCreds === undefined) {
      if (ctx.request.headers.has('Authorization')) {
        let authHeaders: string = ctx.request.headers.get('Authorization')!;
        if (authHeaders.startsWith('Basic ')) {
          authHeaders = authHeaders.slice(6);
        }
        const auth = decode(authHeaders);
        const decodedAuth = new TextDecoder().decode(auth!);
        credentials = decodedAuth.split(":");
      }
    } else {
      credentials = this.readCreds(ctx);
    }

    const [username, password] = [credentials[0], credentials[1]];
    await ctx.state.session.set("username", username);

    if (await this.checkCreds(username, password)) {
      await ctx.state.session.set('isLoggedIn', true);
      ctx.state.localVerified = true;
      this.sendMFA(ctx);
    } else {
      await ctx.state.session.set('isLoggedIn', false);
      ctx.state.localVerified = false;
    }
    console.log(await ctx.state.session);

    next();
    // Developer needs to check the state property localVerified to redirect user
    // and send response based off auth status
  }
  /**
   * @param context object
   * @param next function
   * Note: verifyAuth is an OPTIONAL authorization verifying middleware function for the developer to utilize
       This may be deferred, as developer may utilize different means of verifying authorization prior to allowing client access to sensitive material
   * verifyAuth checks the isLoggedIn and mfa_success session properties previously set by checkMFA
   * Will ensure that isLoggedIn is true
      Then will check to see if mfa_enabled is true -- if so, will ensure previous mfaCheck set property mfa_success to true
        If mfa_success is true, will then allow progression
   *  Otherwise, if mfa_enabled is false, will also allow progression since mfa_success check is not warranted
   * If isLoggedIn is false, will return message stating client is "Not currently signed in"
   */
  verifyAuth = async (ctx: Context, next: () => Promise<unknown>) => {
    console.log('route hit - details below');
    console.log('isLoggedIn:', await ctx.state.session.get('isLoggedIn'));
    console.log('MFA Enabled:', this.mfa_enabled);
    console.log('MFA success', await ctx.state.session.get('mfa_success'));

    if (await ctx.state.session.has('isLoggedIn') && await ctx.state.session.get('isLoggedIn')) {
      console.log('local auth worked');
      if (!this.mfa_enabled || (this.mfa_enabled && await ctx.state.session.has('mfa_success') && await ctx.state.session.get('mfa_success'))) {
        console.log('mfa worked');
        return next();
      }
    }
    ctx.response.status = 401;
    ctx.response.body = {
      success: false,
      message: "Not currently signed in"
    };
    return;
  }
  /**
   * @param context object
   * @param next function
   * Invoking checkMFA will utilize the object's getSecret property (a function defined by the developer)
   * This will utilize the Oak session to obtain the client username in order to utilize getSecret
   * Upon obtaining the username's associated secret, will invoke the imported generateTOTP() function
   * Checks to see if the input code from client matches the generated TOTP
   *  Note: the developer will need to ensure that the client's MFA input is passed into the 
      context.request body as the property, 'code'
   * If verified, will initialize session 'mfa_success' as set to true. Else, will initialize to false
   */
  checkMFA = async (ctx: Context, next: () => Promise<unknown>) => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const mfaSecret = await this.getSecret!(await ctx.state.session.get('username'));
    const currentTOTP = await generateTOTP(mfaSecret);

    const verified = currentTOTP.some((totp) => {
      return totp === bodyValue.code;
    });

    if (verified) {
      await ctx.state.session.set("mfa_success", true);
      ctx.state.mfaVerified = true;
      return next();
    } else {
      await ctx.state.session.set("mfa_success", false);
      ctx.state.mfaVerified = false;
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: "Invalid credentials"
      };
      return;
    }
  }
  /**
   * @param context object
   * Invoking sendMFA will send a 6 digit code via one of two methods: SMS or e-mail
   * Will check to see which mfa_type is initialized
   * If mfa_type is SMS, will instantiate an object from the TwilioSMS class with the accountSID and authtoken provided from Twilio
   *  Will then invoke the TwilioSMS method's sendSMS function while passing in an object that designates 
      the 'From' phone number (developer's designated Twilio phone number) and 'To' phone number (client/user's phone number)
   */
  sendMFA = async (ctx: Context) => {
    if (this.mfa_type === "SMS") {
      const sms = new TwilioSMS(this.accountSID!, await this.getSecret!(await ctx.state.session.get('username')), this.authToken!);
      const context: Incoming = {
        From: '+17164543649',
        To: await this.getNumber!(await ctx.state.session.get('username'))!,
      }
      await sms.sendSms(context);
    }
    //Insert ELSE IF statement for when email is set up
  }
  /**
   * 
   * @param context object
   * @param next function
   * When invoked, will delete the current session from the client 
   */
  signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession(ctx);
    next();
  }
}