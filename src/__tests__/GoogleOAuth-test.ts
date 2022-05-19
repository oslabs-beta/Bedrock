import { describe, assertEquals } from "../deps.ts";
import { init } from "../mod.ts";
import { GoogleOAuth } from "../Strategies/OAuth/GoogleOAuth.ts";

describe('GoogleOAuth\'s sendDirect function should create the correct URI to redirect client to Google', () => {
  const testClient = init({
    provider: 'Google',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    scope: 'test-scope',
    redirect_uri: 'http://localhost:8080/OAuth/Google/token'
  }) as GoogleOAuth;

  const testURI = testClient.uriBuilder();

  assertEquals(
    testURI,
    'http://accounts.google.com/o/oauth2/v2/auth?client_id=test-client-id&redirect_uri=http://localhost:8080/OAuth/Google/token&scope=test-scope&response_type=code'
  );
});
