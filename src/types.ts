import { Context } from "https://deno.land/x/oak/mod.ts";

export type LocalStrategyParams = {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  mfa_type: "Token"
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: true;
  mfa_type: "SMS"
  readCreds?: (ctx: Context) => Promise<string[]>;
  getSecret: (username: string) => Promise<string>;
  getNumber: (username: string) => Promise<string>;
  accountSID: string;
  authToken: string;
} | {
  checkCreds: (username: string, password: string) => Promise<boolean>;
  mfa_enabled: false;
  readCreds?: (ctx: Context) => string[];
}

export type OAuthStrategyParams = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  login?: string;
  scope?: string;
  allow_signup?: string;
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