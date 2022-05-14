import {assert, assertEquals, assertInstanceOf, assertStringIncludes, assertExists, Context } from '../src/deps.ts'
import { GithubOAuth } from '../src/OAuthStrategies/GithubOAuth.ts';
import { testing } from "https://deno.land/x/oak/mod.ts";

Deno.test('GithubOAuth\'s sendDirect function should create the correct URI to redirect client to Github', ()=> {
  const testClient = new GithubOAuth({
    provider: 'Github',
    client_id: 'fdsa717hk2kdkf3k2',
    client_secret: 'hfjdsAJSD7AD7sd9',
    redirect_uri: 'http://localhost:8080/OAuth/Github/token',
    state: '1234567890'
  });
  const ctx = testing.createMockContext();
  const testURI = testClient.sendRedirect(ctx);
  assertEquals(testURI, 
    'http://github.com/login/oauth/authorize?client_id=fdsa717hk2kdkf3k2&redirect_uri=http://localhost:8080/OAuth/Github/token&state=1234567890')
})

Deno.test('GithubOAuth\'s fdsa', ()=> {
  
})