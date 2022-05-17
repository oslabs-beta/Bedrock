import { assertEquals, assertInstanceOf, assertStringIncludes,assertMatch, assertExists, describe, it } from '../../src/deps.ts'
import { Twilio } from '../../src/Strategies/MFA/twilio.ts'
import {encode64} from '../../src/deps.ts'

describe("Testing creation of TwilioSMS class", () => {
  const testClass = new Twilio('testAccountSID', 'JDKSAJIWDJLIWJIQDJIDSADA4223DASD', 'testAuthToken');

  it("Testing to see if testClass is instance of TwilioSMS", ()=> {
    assertInstanceOf(testClass, Twilio);
  })
  
  it("Testing to see if authorization header is correct", () => {
    assertStringIncludes(testClass.authorizationHeader, 'Basic');
  })

  it('Testing to see if encoded portion of authorization header is correctly in Base64', () => {
    // testAccountSID:testAuthToken
    const encoded = encode64('testAccountSID:testAuthToken')
    const Base64RegEx = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    
    assertMatch(encoded, Base64RegEx);
  })
  
  it("Testing to ensure authorization header includes base 64 following 'basic' ", () => {
    // testAccountSID:testAuthToken
    const encoded = encode64('testAccountSID:testAuthToken')
    const correctAuthHeader = 'Basic ' + encoded;
    
    assertEquals(testClass.authorizationHeader, correctAuthHeader);

  })
})

describe ("Testing TwilioSMS sendSMS function", () => {
  const testClass = new Twilio('testAccountSID', 'JDKSAJIWDJLIWJIQDJIDSADA4223DASD', 'testAuthToken');
  assertExists(testClass.sendSms);
})