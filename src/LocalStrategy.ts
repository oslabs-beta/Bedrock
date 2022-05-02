import { Context } from "https://deno.land/x/oak/mod.ts";
import { decode } from "https://deno.land/std@0.137.0/encoding/base64.ts";
import { generateTOTP } from "./totp.ts";
import { TwilioSMS, Incoming } from "./twilioSMS.ts";

export type LocalStrategyParams = {
  mfa_enabled : true;
  checkCreds : (username: string, password: string) => boolean;
  readCreds? : (ctx: Context) => string[];
  mfa_type : "Token"
  phone : null;
  getSecret: (username: string) => string;
  accountSID: null;
  authToken: null;
} | {
  mfa_enabled : true;
  checkCreds : (username: string, password: string) => boolean;
  readCreds? : (ctx: Context) => string[];
  mfa_type : "SMS"
  getSecret: (username: string) => string;
  phone: string;
  accountSID: string;
  authToken: string;
} | {
  mfa_enabled : false;
  checkCreds : (username: string, password: string) => boolean;
  readCreds? : (ctx: Context) => string[];
  phone: null;
  mfa_type : null;
  getSecret: null;
  accountSID: null;
  authToken: null;
}

export class LocalStrategy{
  checkCreds: (username: string,password: string) => boolean;
  getSecret: ((username: string) => string) | null;
  readCreds?: (ctx: Context) => string[];
  mfa_enabled: boolean; 
  mfa_type: string | null;
  accountSID: string | null;
  authToken: string | null;
  phone: string | null;
  
  constructor(stratParams: LocalStrategyParams) {
    this.checkCreds = stratParams.checkCreds;
    this.readCreds = stratParams.readCreds;
    this.mfa_enabled = stratParams.mfa_enabled;
    this.mfa_type = stratParams.mfa_type;
    this.getSecret = stratParams.getSecret;
    this.accountSID = stratParams.accountSID;
    this.authToken = stratParams.authToken;
    this.phone = stratParams.phone;
  }
  
  async localLogin(ctx: Context, next: () => Promise<unknown>) {
    let credentials: string[] = [];

    if (this.readCreds) {
      credentials = this.readCreds(ctx);
    } else {
      if (ctx.request.headers.has('Authorization')) {
        let authHeaders: string = ctx.request.headers.get('Authorization')!;
        if (authHeaders.startsWith('Basic ')) {
          authHeaders = authHeaders.slice(6);
        }
        const auth = decode(authHeaders);
        const decodedAuth = new TextDecoder().decode(auth!);
        credentials = decodedAuth.split(":");
      }
    }
    const [username, password] = [credentials[0], credentials[1]];
    await ctx.state.session.set("username", username);

    if (this.checkCreds(username, password)) {
      await ctx.state.session.set('isLoggedIn', true);
      ctx.state.localVerified = true;
      this.sendMFA(ctx);
    } else {
      await ctx.state.session.set('isLoggedIn', false);
      ctx.state.localVerified = false;
    }
    next();
    // Developer needs to check the state property localVerified to redirect user
    // and send response based off auth status
  }
  /**
   * 
   */
  async verifyAuth(ctx: Context, next: () => Promise<unknown>) {
    if (await ctx.state.session.has('isLoggedIn') && await ctx.state.session.get('isLoggedin')) {
      if (!this.mfa_enabled || (this.mfa_enabled && await ctx.state.session.has('mfa_success') && await ctx.state.session.get('mfa_success'))) {
        return next();
      }
    }
    ctx.response.status = 401;
    ctx.response.body = {
      success: false,
      message: "Invalid credentials"
    };
    return;
  }
  /**
   * @params: 
   */
  async checkMFA(ctx: Context, next: () => Promise<unknown>) {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const mfaSecret = this.getSecret!(await ctx.state.session.get('username'));
    const currentTOTP = await generateTOTP(mfaSecret);

   
    const verified = currentTOTP.some((totp) => {
      return totp === bodyValue.code;
    });

    if (verified) {
      await ctx.state.session.set("mfaVerified", true);
      ctx.state.mfaVerified = true;
      return next();
    } else {
      await ctx.state.session.set("mfaVerified", false);
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
   * 
   */
  async sendMFA(ctx: Context) {
    if (this.mfa_type === "SMS") {
      const sms = new TwilioSMS(this.accountSID!, this.getSecret!(ctx.state.session.get('username')), this.authToken!);
      const context: Incoming = {
        From: '+17164543649',
        To: this.phone!,
      }
      await sms.sendSms(context);
    }
    // Insert ELSE IF statement for when email is set up
  }
}