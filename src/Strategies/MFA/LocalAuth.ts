import { ClientOptions, Incoming, LocalAuthParams, SendConfig } from "../../types.ts";
import { Context, decode64, SMTPClient } from "../../deps.ts";
import { generateTOTP } from "./totp.ts";
import { Twilio } from "./twilio.ts";
import { Auth } from "../Auth.ts";

/**
 * Class LocalAuth has 2 REQUIRED properties: checkCreds and mfa_enabled
 * All other properties are optional, and will be subjected to type LocalAuthParams
 */
export class LocalAuth extends Auth {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret?: (username: string) => Promise<string>;
  readCreds?: (ctx: Context) => Promise<string[]>;
  mfa_type?: string;
  accountSID?: string;
  authToken?: string;
  getNumber?: (username: string) => Promise<string>;
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
      ctx.state.localVerified = true;
      ctx.state.mfaRequired = this.mfa_type !== undefined;

      this.sendMFA(ctx);
    } else {
      await ctx.state.session.set("isLoggedIn", false);
      ctx.state.localVerified = false;
    }

    next();
    // Developer needs to check the state property localVerified to redirect user
    // and send response based off auth status
  };
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
        message: "Invalid credentials",
      };
      return;
    }
  };
  /**
   * @param context object
   * Invoking sendMFA will send a 6 digit code via one of two methods: SMS or e-mail
   * Will check to see which mfa_type is initialized
   * If mfa_type is SMS, will instantiate an object from the Twilio class with the accountSID and authtoken provided from Twilio
   *  Will then invoke the Twilio method's sendSMS function while passing in an object that designates
      the 'From' phone number (developer's designated Twilio phone number) and 'To' phone number (client/user's phone number)
   */
  readonly sendMFA = async (ctx: Context) => {
    const secret = await this.getSecret!(
      await ctx.state.session.get("username"),
    );

    if (this.mfa_type === "SMS") {
      const sms = new Twilio(this.accountSID!, secret, this.authToken!);
      const context: Incoming = {
        From: "+17164543649", //need to use env or pass into class initialization for developer to add phone number
        To: await this.getNumber!(await ctx.state.session.get("username"))!,
      };
      await sms.sendSms(context);
    } else if (this.mfa_type === "Email") {
      // Generate TOTP code
      const code = await generateTOTP(secret);

      // Set up email client
      const client = new SMTPClient(this.clientOptions!);

      // Build email
      const subjectText: string = "Your MFA code is " + code[1];
      const contentText: string = subjectText;
      const htmlText: string = "<p>Your MFA code is " + code[1] + ".</p>";

      const newEmail: SendConfig = {
        from: this.fromAddress!,
        to: "bedrock.deno@gmail.com", //need to use env or pass into class intialization
        subject: subjectText,
        content: contentText,
        html: htmlText,
      };

      // Send email and close server connection
      await client.send(newEmail);
      await client.close();
    }
  };
}
