import { Context } from "./deps.ts";
export type { SendConfig } from "https://deno.land/x/denomailer@1.0.1/mod.ts";
export type { RouterMiddleware } from "https://deno.land/x/oak@v10.5.1/mod.ts";

/**
 * Defined below are the types to structure arguments across various classes
 * and methods in the Bedrock library
 */

// Local Authentication configuration object
export type LocalStrategyParams = {
  provider: "Local";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_type: "Token";
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
} | {
  provider: "Local";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_type: "SMS";
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
  getNumber: (username: string) => Promise<string>;
  accountSID: string;
  authToken: string;
} | {
  provider: "Local";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: false;
  readCreds?: (ctx: Context) => Promise<string[]>;
} | {
  provider: "Local";
  checkCreds: (username: string, password: string) => Promise<boolean>;
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
  mfa_type: "Email";
  clientOptions: ClientOptions;
  getEmail: (username: string) => Promise<string>;
  fromAddress: string;
};

// SMS configuration object
export type SMSRequest = {
  
  
  From: string; //the twilio phone number to use to send an SMS
  To: string; //phone number to receive SMS
  Body: string; //SMS content
}

// SMS to/from object
export type Incoming = {
  From: string;
  To: string;
}

// Email client configuration object
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

// OAuth Type configuration object
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