import { generateTOTP } from './totp.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts';
import "https://deno.land/x/dotenv/load.ts";

const hostname: string = <string>(
  Deno.env.get('EMAIL_HOSTNAME')
);

const username: string = <string>(
  Deno.env.get('EMAIL_USERNAME')
);

const password: string = <string>(
  Deno.env.get('EMAIL_PASSWORD')
);

const senderEmail: string = <string>(
  Deno.env.get('EMAIL_FROM')
);

export interface ClientOptions {
  connection: {
    hostname: string;
    port?: number;
    tls?: boolean;
    auth?: {
      username: string;
      password: string;
    };
    pool?: {
      size?: number;
      timeout?: number;
    }
  };
}

export interface passEmail {
  to: string;
  from: string;
  subject: string;
  content?: string;
  html: string;
}

const connectInfo: ClientOptions = {
  connection: {
      hostname: hostname,
      port: 587,
      tls: true,
      auth: {
        username: username,
        password: password,
      },
  },
}

const secret = 'JDKSAJIWDJLIWJIQDJIDSADA4213DASD';

const client = new SMTPClient(connectInfo);

async function genMsg(){
  const code = await generateTOTP(secret);
  const subjectLine: string = 'The code is: ' + code[1];
  const htmlBody: string = '<p>' + code[1] + '</p>';

  const newEmail: passEmail  = {
    from: senderEmail, 
    to: "bedrock.deno@gmail.com",
    subject: subjectLine,
    content: "auto",
    html: htmlBody,
  }

  return await client.send(newEmail)
}

genMsg();

await client.close();

