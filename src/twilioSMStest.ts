import { TwilioSMS } from './twilioSMS.ts';
import "https://deno.land/x/dotenv/load.ts";
import { SMSRequest, Incoming } from './types.ts'

const accountSid: string = <string>(
 Deno.env.get('TWILIO_ACCOUNT_SID')
);

const keySid: string = <string>(
 Deno.env.get('TWILIO_API_KEY')
);

// const secret: string = <string>(
//  Deno.env.get('TWILIO_API_SECRET')
// );

const phoneNumber: string = <string>(
 Deno.env.get('TWILIO_PHONE_NUMBER')
);

const authToken: string = <string>(
  Deno.env.get('TWILIO_AUTH_TOKEN')
);

// const message: SMSRequest = {
//  From: phoneNumber,
//  To: '+14434720873',
//  Body: 'Welcome to Twilio and Deno 🦕',
// };

const message: Incoming = {
  From: phoneNumber,
  To: '+14434720873',
 };

const secret = 'JDKSAJIWDJLIWJIQDJIDSADA4213DASD';

const helper = new TwilioSMS(accountSid, secret, authToken);
//helper.sendSms(message).subscribe(console.log);
console.log(await helper.sendSms(message));
//deno run --allow-env --allow-net --allow-read src/twilioSMStest.ts
