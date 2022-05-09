import { ClientOptions, passEmail } from './SMTPEmail.ts';
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

const clientId: string = <string>(
    Deno.env.get('EMAIL_CLIENT_ID')
);

const clientSecret: string = <string>(
    Deno.env.get('EMAIL_CLIENT_SECRET')
);

const senderEmail: string = <string>(
    Deno.env.get('EMAIL_FROM')
);



