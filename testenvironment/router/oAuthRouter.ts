import { Router, Context } from "https://deno.land/x/oak/mod.ts";
import { initOAuth } from '../../src/bedrock.ts'
import { OAuthStrategyParams } from '../../src/oauth-github.ts'
import "https://deno.land/x/dotenv/load.ts";

export const test1Router = new Router();

const params: OAuthStrategyParams = {
    client_id: Deno.env.get('CLIENT_ID')!,
    client_secret: Deno.env.get('CLIENT_SECRET')!,
    redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
    // login? : string;
    // scope? : string;
    // allow_signup? : string;
}

const Bedrock = initOAuth('Github Strategy', params);
console.log(Bedrock);
// .get('/oAuthInitialize', Bedrock.OAUTH)


test1Router.get('/OAuth', Bedrock.sendRedirect)

    .get('/OAuth/github', Bedrock.getToken, async (ctx: Context, next) => {
        console.log('yayyy we logged in via github oauth')
        ctx.response.redirect('/');
    })

