/**
 * Modern implementation of the TOTP algorithm using the new Crypto module
 * in Deno as well as a pseudorandom secret generator in base32
 */

 import { crypto } from "../../deps.ts";
 import { decode32 } from "../../deps.ts";

// HMAC-SHA1 implementation
async function hmacSHA1(k: Uint8Array, m: Uint8Array): Promise<Uint8Array> {
  // SHA1 has a block size of 64 bytes
  const BLOCKSIZE = 64;

  // Helper function to return a key that is equal to the above block size
  async function blocksizeKey (key: Uint8Array) {
    if (key.length > BLOCKSIZE) {
      key = new Uint8Array(await crypto.subtle.digest('SHA-1', key));
    }

    let output = new Uint8Array(BLOCKSIZE);

    if (key.length < BLOCKSIZE) {
      for (let i = 0; i < BLOCKSIZE; i++) {
        output[i] = (i < key.length) ? key[i] : 0;
      }
    } else {
      output = key;
    }

    return output;
  }

  // Computing the block sized key, padded with 0s and hashed with SHA-1
  const blockKey = await blocksizeKey(k);

  // Creation of outer and inner padded keys followed by bitwise XOR transformation
  const outer_pkey = new Uint8Array(BLOCKSIZE);
  const inner_pkey = new Uint8Array(BLOCKSIZE);

  for (let i = 0; i < BLOCKSIZE; i++) {
    outer_pkey[i] = blockKey[i] ^ 0x5c;
    inner_pkey[i] = blockKey[i] ^ 0x36;
  }

  // Hash of concat of ipad and message
  let firstPass = new Uint8Array(inner_pkey.length + m.length);
  firstPass.set(inner_pkey);
  firstPass.set(m, inner_pkey.length);
  firstPass = new Uint8Array(await crypto.subtle.digest('SHA-1', firstPass));

  // Hash of concat of opad and above hash
  let result = new Uint8Array(outer_pkey.length + firstPass.length);
  result.set(outer_pkey);
  result.set(firstPass, outer_pkey.length);
  result = new Uint8Array(await crypto.subtle.digest('SHA-1', result));

  return result;
}

// Returns array of TOTP codes
export async function generateTOTP(secret:string, numTimeSteps?: number): Promise<string[]> {
  // In place in order to faciliate testing
  if (numTimeSteps === undefined) {
    // Recommended timestep based off RFC6238 is 30 seconds
    const TIMESTEP = 30;

    // Determine number of steps based off dividing the current Unix time by the timestep interval
    numTimeSteps = Math.floor(Math.round((new Date()).getTime() / 1000)/TIMESTEP);
  }
  
  // Generates TOTP based off current UNIX time - broken into function in order to invoke and return
  // array of 3 values, token before, during, and after
  async function TOTP(timeSteps: number): Promise<string> {
    // Convert the integer value of number of steps into a hexadecimal string
    const hexTime = timeSteps.toString(16);

    // Padding hexTime with leading 0s to fit 16 character requirement
    let hexMod = '';

    for (let i = 0; i < 16 - hexTime.length; i++) {
      hexMod += '0';
    }

    // Add zeros to front of hexTime
    hexMod += hexTime;

    // Split time string to hex components, asserted to not be null
    const splitString = hexMod.match(/.{1,2}/g)!;

    // Create new output array equal to the final length of input (should be 16 if used with SHA1)
    const decArray = new Array(splitString.length);

    // Parse each block from hex to decimal
    for (let i = 0; i < decArray.length; i++) {
      decArray[i] = parseInt(splitString[i], 16);
    }

    // Translate decimal array to Uint8Array for ingestion by HMAC-SHA1
    const timeHex = new Uint8Array(decArray);
    
    // Returns an error string if secret is not Base32
    const regex = /^([A-Z2-7=]{8})+$/
    if (!regex.test(secret)) {
      console.log('Error: not Base32');
      return new Promise(() => 'ERROR');
    }

    // Decode the secret from base32 to a binary Uint8Array to prepare for HMAC-SHA1
    const binaryData = decode32(secret);

    // Calculate HMAC-SHA1 hash of the secret and the current time
    const hmac = await hmacSHA1(binaryData, timeHex);

    // Obtain the last hash byte, required for TOTP algorithm
    const last_hash_byte = hmac[hmac.length-1];

    // Obtain offset value by using Bitwise AND again 0x0f
    const offset = last_hash_byte & 0x0f;

    // Generate token code using Bitwise AND and performing a left shift based off values
    // specified in the TOTP algorithm
    let code = 0;
    code = code | ((hmac[offset] & 0x7f) << 24);
    code = code | ((hmac[offset + 1] & 0xff) << 16);
    code = code | ((hmac[offset + 2] & 0xff) << 8);
    code = code | (hmac[offset + 3] & 0xff);

    code = code % 1000000;

    // String manipulation and conversion to account for leading zeros in TOTP code
    let output = code.toString();

    for (let i = 0, length = output.length; i < 6 - length; i++) {
      output = '0'.concat(output);
    }

    return output;
  }

  // Defining array to hold TOTP [token 1 step prior, current, and 1 step ahead], then
  // generating tokens
  const result = [];

  for (let i = -1; i < 2; i++) {
    result.push(await TOTP(numTimeSteps - i));
  }

  return result;
}

// Pseudorandom TOTP secret generator
export function generateTOTPSecret(): string {
  const randString: Array<string> = new Array(32);
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  for (let i = 0; i < randString.length; i++) {
    randString[i] = base32Chars[Math.floor(Math.random() * 32)];
  }

  return randString.join('');
}