import { describe, assertEquals } from "../deps.ts";
import { init } from "../mod.ts";
import { FacebookOAuth } from "../Strategies/OAuth/FacebookOAuth.ts";

describe('FacebookOAuth\'s sendDirect function should create the correct URI to redirect client to Facebook', () => {
  const testClient = init({
    provider: 'Facebook',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    scope: 'test-scope',
    redirect_uri: 'http://localhost:8080/oauth/facebook/token',
  }) as FacebookOAuth;

  const testURI = testClient.uriBuilder();

  assertEquals(
    testURI,
    'https://www.facebook.com/v13.0/dialog/oauth?client_id=test-client-id&redirect_uri=http://localhost:8080/oauth/facebook/token&scope=test-scope&response_type=code'
  );
});
