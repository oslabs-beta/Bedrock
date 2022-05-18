import { Context } from "./deps.ts";

/**
 * Defined below are the types to structure arguments across various classes
 * and methods in the Bedrock library
 */

/**
 * LocalAuthParams type defines the parameters required to instantiate an
 * instance of the LocalAuth class. Aliases are used to account for varying
 * parameters depending on MFA type.
 */
export type LocalAuthParams = {
  provider: "Local";
  mfa_type: "Token";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret: (username: string) => Promise<string | null>;
  readCreds?: (ctx: Context) => Promise<string[]>;
} | {
  provider: "Local";
  mfa_type: "SMS";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret: (username: string) => Promise<string | null>;
  getNumber: (username: string) => Promise<string>;
  sourceNumber: string;
  accountSID: string;
  authToken: string;
  readCreds?: (ctx: Context) => Promise<string[]>;
} | {
  provider: "Local";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  readCreds?: (ctx: Context) => Promise<string[]>;
} | {
  provider: "Local";
  mfa_type: "Email";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret: (username: string) => Promise<string | null>;
  clientOptions: ClientOptions;
  fromAddress: string;
  getEmail: (username: string) => Promise<string>;
  readCreds?: (ctx: Context) => Promise<string[]>;
};

/**
 * SMSRequest type is defined to structure postSMSRequest function's parameter in Twilio class
 * Structured to ensure proper inputs that are needed by the Twilio SMS API
 */ 
export type SMSRequest = {  
  From: string; //the Twilio phone number to used to send an SMS
  To: string; //phone number to receive SMS
  Body: string; //SMS content
}

/**
 * Incoming type is defined to structure the sendSMS function's parameter in Twilio class
 * Structured to ensure proper inputs that represent from and to
 */
export type Incoming = {
  From: string; //the Twilio phone number used to send an SMS
  To: string; //phone number to receive SMS
}

/**
 * ClientOptions type is defined to structure parameters required to instantiate
 * an instance of DenoMailer. It accepts parameters required to setup a connection
 * with a SMTP server of the developer's choice.
 */ 
export type ClientOptions = {
  connection: {
    hostname: string;
    port?: number;
    tls?: boolean;
    auth?: {
      username: string;
      password: string;
    };
  };
}

/**
 * OAuthParams type defines the parameters required across all OAuth providers
 * and are used to instantiate an instance of the OAuth subclass base off the
 * provider. Google has a defined alias due to optional parameters available to
 * it which we are restricting from other OAuth providers
 */
export type OAuthParams = {
  provider: 'Github' | 'Facebook' | 'Twitter' | 'Linkedin' | 'Discord';
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string;
} | {
  provider: 'Google';
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string;
  access_type?: "online" | "offline";  
  prompt?: "none" | "consent" | "select_account";
}