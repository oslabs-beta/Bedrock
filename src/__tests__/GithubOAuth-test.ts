import {
  assert,
  assertEquals,
  assertExists,
  assertInstanceOf,
  assertStringIncludes,
  Context,
} from "../deps.ts";
import { init } from "../bedrock.ts";
import { GithubOAuth } from "../Strategies/OAuth/GithubOAuth.ts";
import { testing } from "https://deno.land/x/oak/mod.ts";

Deno.test("GithubOAuth's sendDirect function should create the correct URI to redirect client to Github", () => {
  const testClient = init({
    provider: "Github",
    client_id: "fdsa717hk2kdkf3k2",
    client_secret: "hfjdsAJSD7AD7sd9",
    scope: "read:user",
    redirect_uri: "http://localhost:8080/OAuth/Github/token",
  }) as GithubOAuth;

  const testURI = testClient.uriBuilder();
  console.log("testuri", testURI);
  assertEquals(
    testURI,
    "http://github.com/login/oauth/authorize?client_id=fdsa717hk2kdkf3k2&redirect_uri=http://localhost:8080/OAuth/Github/token&scope=read:user&response_type=code",
  );
});
