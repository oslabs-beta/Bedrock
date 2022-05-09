import {assert, assertEquals, assertInstanceOf, assertStringIncludes, assertExists } from '../src/deps.ts'
import { TwilioSMS } from '../src/twilioSMS.ts'
import {encode64} from '../src/deps.ts'

Deno.test("This is a test function", () => {
  assertEquals(1, 1);
})

Deno.test("Testing creation of TwilioSMS class", () => {
  const testClass = new TwilioSMS('testAccountSID', 'JDKSAJIWDJLIWJIQDJIDSADA4223DASD', 'testAuthToken');

  Deno.test("Testing to see if testClass is instance of TwilioSMS", ()=> {
    assertInstanceOf(testClass, TwilioSMS);
  })
  
  Deno.test("Testing to see if authorization header is correct", () => {
    assertStringIncludes(testClass.authorizationHeader, 'Basic');
  })
  
  Deno.test("Testing to ensure authorization header includes base 64 following 'basic' ", () => {
    // testAccountSID:testAuthToken
    let correctAuthHeader = 'Basic ' + encode64('testAccountSID:testAuthToken');
    assertEquals(testClass.authorizationHeader, correctAuthHeader);
  })
})

Deno.test("Testing TwilioSMS sendSMS function", () => {
  const testClass = new TwilioSMS('testAccountSID', 'JDKSAJIWDJLIWJIQDJIDSADA4223DASD', 'testAuthToken');
  assertExists(testClass.sendSms);
})