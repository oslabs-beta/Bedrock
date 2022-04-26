import { TwilioSMS, SMSRequest } from './twilioSMS.ts';
import "https://deno.land/x/dotenv/load.ts"

const accountSid: string = <string>(
 Deno.env.get('TWILIO_ACCOUNT_SID')
);
console.log(accountSid);
const keySid: string = <string>(
 Deno.env.get('TWILIO_API_KEY')
);
const secret: string = <string>(
 Deno.env.get('TWILIO_API_SECRET')
);
const phoneNumber: string = <string>(
 Deno.env.get('TWILIO_PHONE_NUMBER')
);
const authToken: string = <string> (
  Deno.env.get('TWILIO_AUTH_TOKEN')
);

const message: SMSRequest = {
 From: phoneNumber,
 To: '+14434720873',
 Body: 'Welcome to Twilio and Deno 🦕',
};

const helper = new TwilioSMS(accountSid, keySid, secret, authToken);
helper.sendSms(message).subscribe(console.log);