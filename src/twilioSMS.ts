import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import { Observable, from, timer } from 'https://cdn.skypack.dev/rxjs';
import { generateTOTP } from './totp.ts'

export interface SMSRequest {
  [index: string]: string;
  From: string; //the twilio phone number to use to send an SMS
  To: string; //phone number to receive SMS
  Body: string; //SMS content
}

export interface Incoming {
  From: string;
  To: string;
}
/**
 * TwilioSMS class requires 3 passed in properties: 
 *  AccountSID and AuthToken (provided by Twilio upon account creation)
 *  Secret - associated secret with the username 
 */
export class TwilioSMS {
  private authorizationHeader: string;

  constructor(private accountSID: string, private secret: string, private authToken: string) {
    //building the basic access authentication header that must be sent with every HTTP request to the Twilio API, which requires base64 encoding
    this.authorizationHeader = 'Basic ' + base64.fromUint8Array(new TextEncoder().encode(`${accountSID}:${authToken}`));
  }

  //async function 
  /**
   * @param payload object
   * returns promise<string>
   * 
   * Sends a post request to the TwilioSMS API 
   * Content-type of the SMS message is passed as url-encoded form 
     ex. key1=value1&key2=value2
   * postSMSRequest utilizes the authorizationHeader property as the authorization header
   * The content of the SMS message (payload) is passed within the body after invoking the URLSearchParams function
   */
  private async postSMSRequest(payload: SMSRequest): Promise<string> {
    //perform HTTP post request to the https://api.twilio.com/2010-04-01/Accounts/YOUR_ACC_SID/Messages.json URI to place the send SMS request
    console.log('this is the authorization header: ', this.authorizationHeader);
 
    const data = await fetch(
      'https://api.twilio.com/2010-04-01/Accounts/' + this.accountSID + '/Messages.json',
      {
        method: 'POST',
        headers: {
          'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',
          Authorization: this.authorizationHeader,
        },
        //content of the SMS message is passed within body of post request
        //body must be sent in url-encoded form: ex. key1=value1&key2=value2
        //payload object converted to url-encoded string using URLSearchParams object 
        body: new URLSearchParams(payload),
      }
    )
    //console.log('this is data!: ', data);
    const response = await data.json();
    const { body } = response;
    //console.log('this is response!:', response);
    
    //returning only the body of the response object 
    return body;
  }
  /**
   * 
   * @param fromAndTo object
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
