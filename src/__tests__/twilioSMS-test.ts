import {assert, assertEquals, assertInstanceOf, assertStringIncludes, assertExists, describe, it } from '../../src/deps.ts'
import { Twilio } from '../../src/Strategies/MFA/twilio.ts'
import {encode64} from '../../src/deps.ts'

describe('Testing creation of TwilioSMS class', () => {
  const testClass = new Twilio('testAccountSID', 'JDKSAJIWDJLIWJIQDJIDSADA4223DASD', 'testAuthToken');

  it('Testing to see if testClass is instance of TwilioSMS', ()=> {
    assertInstanceOf(testClass, Twilio);
  })
  
  it('Testing to see if authorization header is correct', () => {
    assertStringIncludes(testClass.authorizationHeader, 'Basic');
  })
  
  it('Testing to ensure authorization header includes base 64 following \'basic\' ', () => {
    // testAccountSID:testAuthToken
    const correctAuthHeader = 'Basic ' + encode64('testAccountSID:testAuthToken');
    assertEquals(testClass.authorizationHeader, correctAuthHeader);
  })
})

describe ('Testing TwilioSMS sendSMS function', () => {
  const testClass = new Twilio('testAccountSID', 'JDKSAJIWDJLIWJIQDJIDSADA4223DASD', 'testAuthToken');
  assertExists(testClass.sendSms);
})