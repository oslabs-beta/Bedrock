import { describe, assertEquals } from "../deps.ts";
import { init } from "../mod.ts";
import { LinkedinOAuth } from "../Strategies/OAuth/LinkedinOAuth.ts";

describe('LinkedinOAuth\'s sendDirect function should create the correct URI to redirect client to Linkedin', () => {
  const testClient = init({
    provider: 'Linkedin',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    scope: 'test-scope',
    redirect_uri: 'http://localhost:8080/OAuth/linkedin/token',
  }) as LinkedinOAuth;

  const testURI = testClient.uriBuilder();
  
  assertEquals(
    testURI,
    'https://www.linkedin.com/oauth/v2/authorization?client_id=test-client-id&redirect_uri=http://localhost:8080/OAuth/linkedin/token&scope=test-scope&response_type=code',
  );
});
