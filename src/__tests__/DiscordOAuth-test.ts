import { describe, assertEquals } from "../deps.ts";
import { init } from "../bedrock.ts";
import { DiscordOAuth } from "../Strategies/OAuth/DiscordOAuth.ts";

describe('DiscordOAuth\'s sendDirect function should create the correct URI to redirect client to Discord', () => {
  const testClient = init({
    provider: 'Discord',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    scope: 'test-scope',
    redirect_uri: 'http://localhost:8080/OAuth/discord/token',
  }) as DiscordOAuth;

  const testURI = testClient.uriBuilder();
  
  assertEquals(
    testURI,
    'https://discord.com/api/oauth2/authorize?client_id=test-client-id&redirect_uri=http://localhost:8080/OAuth/discord/token&scope=test-scope&response_type=code'
  );
});
