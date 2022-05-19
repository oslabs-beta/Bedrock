import { describe, assertEquals } from "../deps.ts";
import { init } from "../mod.ts";
import { GithubOAuth } from "../Strategies/OAuth/GithubOAuth.ts";

describe('GithubOAut\'s sendDirect function should create the correct URI to redirect client to Github', () => {
  const testClient = init({
    provider: 'Github',
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    scope: 'test-scope',
    redirect_uri: 'http://localhost:8080/OAuth/Github/token',
  }) as GithubOAuth;

  const testURI = testClient.uriBuilder();

  assertEquals(
    testURI,
    'http://github.com/login/oauth/authorize?client_id=test-client-id&redirect_uri=http://localhost:8080/OAuth/Github/token&scope=test-scope&response_type=code',
  );
});
