import { assertInstanceOf, Context, describe, it } from "../deps.ts";
import { init } from "../bedrock.ts";
import { GithubOAuth, FacebookOAuth, GoogleOAuth, LinkedinOAuth, DiscordOAuth, TwitterOAuth, LocalAuth } from "../strategies.ts";

/**
 * Unit testing to ensure that the init function corrects the correct instance based on the provided parameters
 * 
 * Note: testing to see if inputting wrong provider throws an error is not needed
 * this is because there is type checking of provider is done at instantiation via init function
 */
describe('init should create correct instance of class', ()=> {
  
  it('github', ()=> {
    const testGithub = init({
      provider: "Github",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      scope: "read:user",
      redirect_uri: 'http://localhost:8080/OAuth/Github/token',
    });
  
    assertInstanceOf(testGithub, GithubOAuth);
  })

  it('facebook', ()=> {
    const testFacebook = init({
      provider: "Facebook",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      redirect_uri: 'http://localhost:8080/OAuth/facebook/token',
      scope: "public_profile",
    });
  
    assertInstanceOf(testFacebook, FacebookOAuth);
  })

  it('google', ()=> {
    const testGoogle = init({
      provider: "Google",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      scope: "openid",
      redirect_uri: 'http://localhost:8080/oauth/google/token',
    });
  
    assertInstanceOf(testGoogle, GoogleOAuth);
  })

  it('linkedin', ()=> {
    const testLinkedin = init({
      provider: "Linkedin",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      scope: "r_liteprofile",
      redirect_uri: 'http://localhost:8080/OAuth/linkedin/token',
    }) as LinkedinOAuth;
  
    assertInstanceOf(testLinkedin, LinkedinOAuth);
  })

  it('discord', ()=> {
    const testDiscord = init({
      provider: "Discord",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      redirect_uri: 'http://localhost:8080/OAuth/discord/token',
      scope: "identify",
    }) as DiscordOAuth;
   
    assertInstanceOf(testDiscord, DiscordOAuth);
  })

  it('twitter', ()=> {
    const testTwitter = init({
      provider: "Twitter",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      redirect_uri: 'http://127.0.0.1:8080/OAuth/twitter/token',
      scope: 'tweet.read users.read follows.read follows.write',
    });
  
    assertInstanceOf(testTwitter, TwitterOAuth);
  })

  it('local auth', ()=> {
    //a test function that fulfills the LocalAuth parameter type that requires a function called checkCreds
    //this will need to return a Promise<boolean>
    const testFn = (): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        resolve(true);
        reject(false);
      })
    }

    const testLocal = init({
      provider: 'Local',
      readCreds: async (ctx: Context): Promise<string[]> => {
        const body = await ctx.request.body();
        const bodyValue = await body.value;
        const { username, password } = bodyValue;
        return [username, password];
      },
      checkCreds: testFn
    })

    assertInstanceOf(testLocal, LocalAuth);
  })
})

