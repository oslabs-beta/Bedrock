import { describe, assertEquals } from "../deps.ts";
import { init } from "../bedrock.ts";
import { TwitterOAuth } from "../Strategies/OAuth/TwitterOAuth.ts";

describe('TwitterOAuth\'s sendDirect function should create the correct URI to redirect client to Twitter', () => {
  const testClient = init({
    provider: 'Twitter',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    scope: 'test-scope',
    redirect_uri: 'http://127.0.0.1:8080/OAuth/twitter/token',
  }) as TwitterOAuth;

  const testURI = testClient.uriBuilder();

  assertEquals(
    testURI,
    'https://twitter.com/i/oauth2/authorize?client_id=test-client-id&redirect_uri=http://127.0.0.1:8080/OAuth/twitter/token&scope=test-scope&response_type=code',
  );
});
