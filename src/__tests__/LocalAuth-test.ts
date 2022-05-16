import { generateTOTP, generateTOTPSecret } from "../Strategies/MFA/totp.ts";
import { describe, it, assertEquals, assertMatch } from "../deps.ts";


describe('TOTP verification tests', () => {
  it('generateTOTP returns array of TOTP codes based off TOTP secret', async () => {
    const testSecret = 'GV7HO2JDO5SNTFLEPCCLKOANIN3VWLOH';
    const timeSteps = 55090869;
    const codes = await generateTOTP(testSecret, timeSteps);
    assertEquals(
      codes,
      [ "213967", "814450", "510712" ]
    )
  });

  it('generateTOTPSecret generates Base32 secret', () => {
    const secret = generateTOTPSecret();
    const Base32RegExTest = /^(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}={6}|[A-Z2-7]{4}={4}|[A-Z2-7]{5}={3}|[A-Z2-7]{7}=)?$/;
    assertMatch(secret, Base32RegExTest);
  });
})