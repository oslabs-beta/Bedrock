import { Context } from "https://deno.land/x/oak/mod.ts";
import { decode } from "https://deno.land/std@0.137.0/encoding/base64.ts";
import { generateTOTP } from "./totp.ts";
import { TwilioSMS, Incoming } from "./twilioSMS.ts";

export type LocalStrategyParams = {
  checkCreds : (username: string, password: string) => Promise<boolean>;
  mfa_enabled : true;
  mfa_type : "Token"
  readCreds? : (ctx: Context) => string[];
  getSecret: (username: string) => Promise<string>;
} | {
  checkCreds : (username: string, password: string) => Promise<boolean>;
  mfa_enabled : true;
  mfa_type : "SMS"
  readCreds? : (ctx: Context) => string[];
  getSecret: (username: string) => Promise<string>;
  getNumber: (username: string) => Promise<string>;
  accountSID: string;
  authToken: string;
} | {
  checkCreds : (username: string, password: string) => Promise<boolean>;
  mfa_enabled : false;
  readCreds? : (ctx: Context) => string[];
}

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
   * 
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
   * @params: 
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
   * @params: context object
   * Invoking sendMFA will send a 6 digit code via one of two methods: SMS or e-mail
   * If mfa_type is SMS, will instantiate an object from the TwilioSMS class with the accountSID and authtoken provided from Twilio
   *  Will then invoke the TwilioSMS method's sendSMS function while passing in an object that designates the 'From' phone number (developer's designated Twilio phone number) and 'To' phone number (client/user's phone number)
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

  signOut = async (ctx: Context, next: () => Promise<unknown>) => {
    await ctx.state.session.deleteSession(ctx);
    next();
  }
}