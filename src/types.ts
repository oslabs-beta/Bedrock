import { Context } from "./deps.ts";

export type { SendConfig } from 'https://deno.land/x/denomailer@1.0.1/mod.ts';
export type { RouterMiddleware } from "https://deno.land/x/oak@v10.5.1/mod.ts";

// Local Authentication Types
export type LocalStrategyParams = {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  mfa_type: "Token";
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  mfa_type: "SMS";
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
  getNumber: (username: string) => Promise<string>;
  accountSID: string;
  authToken: string;
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: false;
  readCreds?: (ctx: Context) => string[];
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
  mfa_type: 'Email';
  clientOptions: ClientOptions;
  getEmail: (username: string) => Promise<string>;
  fromAddress: string;
}

export interface SMSRequest {
  [index: string]: string;
  From: string; //the twilio phone number to use to send an SMS
  To: string; //phone number to receive SMS
  Body: string; //SMS content
}

export interface Incoming {
  From: string;
  To: string;
}

// Email Client Settings
export interface ClientOptions {
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

// OAuth Types
export interface GithubOAuthParams {
  provider: "Github";
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  login?: string;
  scope?: string;
  allow_signup?: string;
  state?: string;
}

export interface GoogleOAuthParams {
  provider: "Google";
  client_id: string;
  client_secret: string;
  scope: string;
  redirect_uri: string;
  response_type: "code";
  access_type?: "online" | "offline";
  state?: string;
  prompt?: "none" | "consent" | "select_account";
}

export interface DiscordOAuthParams {
  provider: "Discord" | "LinkedIn";
  client_id: string;
  client_secret: string;
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  state?: string;
}

export interface LinkedinOAuthParams {
  provider: "Linkedin";
  client_id: string;
  client_secret: string;
  scope: string;
  redirect_uri: string;
  response_type: "code";
  state?: string;
}

export interface FacebookOAuthParams {
  provider: "Facebook";
  client_id: string;
  redirect_uri: string;
  state: string;
  response_type?: "code";
  scope?: string;
}
