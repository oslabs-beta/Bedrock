import { ClientOptions, Incoming, LocalAuthParams } from "../../types.ts";
import { Context, decode64, SMTPClient, SendConfig } from "../../deps.ts";
import { generateTOTP } from "./totp.ts";
import { Twilio } from "./twilio.ts";
import { Auth } from "../Auth.ts";

/**
 * Local Authentication class with Middleware functions to provide functionality needed by the developer
 */
export class LocalAuth extends Auth {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret?: (username: string) => Promise<string | null>;
  readCreds?: (ctx: Context) => Promise<string[]>;
  mfaType?: string;
  accountSID?: string;
  authToken?: string;
  getNumber?: (username: string) => Promise<string>;
  sourceNumber?: string;
  clientOptions?: ClientOptions;
  getEmail?: (username: string) => Promise<string>;
  fromAddress?: string;

  constructor(stratParams: LocalAuthParams) {
    super();
    this.checkCreds = stratParams.checkCreds;

    Object.assign(this, stratParams);
  }

  /**
   * @param context object
   * @param next function
   *
   * The localLogin method leverages the checkCreds property that was initialized when the object was instantiated
   * It may also utilize the optional readCreds property that the developer may use in order to provide an array of [username, password]
   * If readCreds is not initialized, will assume the developer is utilizing the Authorization header Basic to pass username and password in base64

   * Will leverage the checkCreds property with the passed in username and password.
      If returns true, will set session 'isLoggedIn' to true and initialize state property 'localVerified' to true.
      Else, will set 'isLoggedIn' to false and initialize state property 'localVerified' to false.

   * Developer may then leverage the localVerified property on state in subsequent middleware
   */
  readonly localLogin = async (ctx: Context, next: () => Promise<unknown>) => {
    let credentials: string[] = [];

    if (this.readCreds === undefined) {
      if (ctx.request.headers.has("Authorization")) {
        let authHeaders: string = ctx.request.headers.get("Authorization")!;
        if (authHeaders.startsWith("Basic ")) {
          authHeaders = authHeaders.slice(6);
        }
        const auth = decode64(authHeaders);
        const decodedAuth = new TextDecoder().decode(auth!);
        credentials = decodedAuth.split(":");
      }
    } else {
      credentials = await this.readCreds(ctx);
    }

    const [username, password] = [credentials[0], credentials[1]];
    await ctx.state.session.set("username", username);

    if (await this.checkCreds(username, password)) {
      await ctx.state.session.set("isLoggedIn", true);
      await this.sendMFA(ctx);

      ctx.state.localVerified = true;
      ctx.state.mfaRequired = this.mfaType !== undefined;
    } else {
      await ctx.state.session.set("isLoggedIn", false);
      ctx.state.localVerified = false;
    }

    return next();
  };

  /**
   * @param context object
   * @param next function
   * Invoking checkMFA will utilize the object's getSecret property (a function defined by the developer)
   * This will utilize the Oak session to obtain the client username in order to utilize getSecret
   * Upon obtaining the username's associated secret, will invoke the imported generateTOTP() function
   * Checks to see if the input code from client matches the generated TOTP
   *  Note: the developer will need to ensure that the client's MFA input is passed into the
      context.request body as the property, 'code'
   * If verified, will initialize session 'mfa_success' and add mfaVerified property on ctx.state as set to true. Else, will initialize to false
      The developer can use ctx.state.mfaVerified to determine if client's mfa check was successful or not
   */
  readonly checkMFA = async (ctx: Context, next: () => Promise<unknown>) => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const mfaSecret = await this.getSecret!(
      await ctx.state.session.get("username"),
    );

    const currentTOTP = await generateTOTP(mfaSecret!);

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
      return next();
    }
  };
  /**
   * @param context object
   * Invoking sendMFA will send a 6 digit code via one of two methods: SMS or e-mail
   * Will check to see which mfaType is initialized
   * If mfaType is SMS, will instantiate an object from the Twilio class with the accountSID and authtoken provided from Twilio
   *  Will then invoke the Twilio method's sendSMS function while passing in an object that designates
      the 'From' phone number (developer's designated Twilio phone number) and 'To' phone number (client/user's phone number)
   */
  readonly sendMFA = async (ctx: Context) => {
    const secret = await this.getSecret!(
      await ctx.state.session.get("username"),
    );

    ctx.state.hasSecret = (secret === null) ? false : true;

    if (this.mfaType === "SMS" && secret) {
      const sms = new Twilio(this.accountSID!, secret, this.authToken!);
      const context: Incoming = {
        From: this.sourceNumber!,
        To: await this.getNumber!(await ctx.state.session.get("username"))!,
      };

      await sms.sendSms(context);
    } else if (this.mfaType === "Email" && secret) {
      // Generate TOTP code
      const code = await generateTOTP(secret);

      // Set up email client
      const client = new SMTPClient(this.clientOptions!);

      // Build email
      const subjectText: string = "Your MFA code is " + code[1];
      const contentText: string = subjectText;
      const htmlText: string = "<p>Your MFA code is " + code[1] + ".</p>";
      const userEmail = await this.getEmail!(await ctx.state.session.get('username'));

      const newEmail: SendConfig = {
        from: this.fromAddress!,
        to: userEmail,
        subject: subjectText,
        content: contentText,
        html: htmlText,
      };

      // Send email and close server connection
      await client.send(newEmail);
      await client.close();
    }
    return;
  };

  static readonly generateTOTPSecret = (): string => {
    const randString: Array<string> = new Array(32);
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  
    for (let i = 0; i < randString.length; i++) {
      randString[i] = base32Chars[Math.floor(Math.random() * 32)];
    }
  
    return randString.join('');
  }
}
