import { encode64 } from './../../deps.ts';
import { generateTOTP } from './totp.ts'
import { SMSRequest, Incoming } from './../../types.ts'

/**
 * TwilioSMS class requires 3 passed in properties: 
 *  AccountSID and AuthToken (provided by Twilio upon account creation)
 *  Secret - secret associated with with the username 
 */
export class Twilio {
  public readonly authorizationHeader: string;

  constructor(private accountSID: string, private secret: string, private authToken: string) {
    //building the basic access authentication header that must be sent with every HTTP request to the Twilio API, which requires base64 encoding
    this.authorizationHeader = 'Basic ' + encode64(`${accountSID}:${authToken}`);
  }

  /**
   * @param payload - SMSRequest object that contains information such as From, To, and Body of the SMS message
   * @returns Body of the API response, which will be the code sent to the end user
   * 
   * Sends a post request to the TwilioSMS API 
   * Content-type of the SMS message is passed as url-encoded form (ex. key1=value1&key2=value2)
   * postSMSRequest utilizes the authorizationHeader property as the authorization header
   * The content of the SMS message (payload) is passed within the body after invoking the URLSearchParams function
   */
  private async postSMSRequest(payload: SMSRequest): Promise<string> {
    //perform HTTP post request to the https://api.twilio.com/2010-04-01/Accounts/YOUR_ACC_SID/Messages.json URI to place the send SMS request
 
    const data = await fetch(
      'https://api.twilio.com/2010-04-01/Accounts/' + this.accountSID + '/Messages.json',
      {
        method: 'POST',
        headers: {
          'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',
          Authorization: this.authorizationHeader,
        },
        body: new URLSearchParams(payload),
      }
    )
    const response = await data.json();
    const { body } = response;
    //returning only the body of the response object, which is the code that was sent to the end-user
    return body;
  }
  /**
   * 
   * @param fromAndTo - an object with the To and From phone number for the Twilio API to send the message
   * 
   * Will invoke the imported generateTOTP() function with the passed in secret 
   * Since generateTOTP provides an array of 3 codes, will utilize the code at index 1
   * Will invoke the postSMSRequest function with the passed in 'From', 'To', and newly generated code as the newPayload
   */
  public async sendSms(fromAndTo: Incoming){
    const code = await generateTOTP(this.secret);
    const messageBody:string = code[1];
    const {From, To} = fromAndTo;
    const newPayload: SMSRequest = {
      From, 
      To,
      Body: messageBody
    }
    return this.postSMSRequest(newPayload);
  }
}
