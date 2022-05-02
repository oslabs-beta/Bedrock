/**
 * First Auth Middleware
 * 1. Get credentials
 *    -POST body
 *    -Authorization header (Basic -CREDENTIALSINBASE64-) [potentially create a frontend function that does this for the developer]
 *  Extracting credentials: return 2 strings, a username and a password:
 *    by default, we will use Authorization header, however we will provide an optional parameter where they can insert their own custom verification function
 * 2. Verify that username/password is correct
 *  Execute a function given to us by the developer that queries the database and returns true/false
 * 3. Set login property (in session) to true
 * 4. Redirect to MFA route (if enabled)
 */

export function Bedrock () {
  
}