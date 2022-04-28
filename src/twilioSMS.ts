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

export class TwilioSMS {
  private authorizationHeader: string;

  // constructor(private accountSID: string, keySID: string, secret: string) {
  //   //building the basic access authentication header that must be sent with every HTTP request to the Twilio API
  //   this.authorizationHeader = 'Basic ' + base64.fromUint8Array(new TextEncoder().encode(keySID + ':' + secret));
  // }
  constructor(private accountSID: string, private keySID: string, private secret: string, private authToken: string) {
    //building the basic access authentication header that must be sent with every HTTP request to the Twilio API, which requires base64 encoding
    this.authorizationHeader = 'Basic ' + base64.fromUint8Array(new TextEncoder().encode(`${accountSID}:${authToken}`));
  }

  //async function 
  /*
  input: SMSRequest object
  output: promise --> will resolve with a URI which can be called to check request status 
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
 
    // //if request is accepted, a promise returned by this function resolves with a URI
    // //otherwise it rejects 
    // const uri = request.then((resp) => {
    //   if (resp.status != 'queued') {
    //     return Promise.reject(resp.message);
    //   }
    //   else return resp.uri;
    // });
    
    // //this uri can be used to poll the status of the request made to the Twilio API
    // return uri;
  }
  
  //polls the message status
  /*
  input: uri string
  output: Observable string
  */
  // private pollRequestStatus(uri: string): Observable<string> {
  //   const timeout = timer(10 * 1000);
 
  //   return timer(0, 500).pipe(
  //     flatMap(() => {return from ( 
  //       fetch('https://api.twilio.com' + uri, {
  //           headers: {
  //             Authorization: this.authorizationHeader,
  //           },
  //         })
  //           .then((resp) => resp.json())
  //           .then((resp) => resp.status)
  //       );
  //     }),
  //     distinct(),
  //     takeWhile(
  //       (status: string) =>
  //         !['delivered', 'undelivered'].includes(status),
  //       true
  //     ),
 
  //     takeUntil(timeout)
  //   );
  // }

  public async sendSms(context: Incoming){
    const code = await generateTOTP(this.secret);
    const messageBody:string = code[1];
    const {From, To} = context;

    const newPayload: SMSRequest = {
      From, 
      To,
      Body: messageBody
    }

    return this.postSMSRequest(newPayload);
    //return from (this.postSMSRequest(payload))
    // .pipe(
    //   flatMap((uri: string) => this.pollRequestStatus(uri))
    // );
  }
}
