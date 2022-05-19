# Bedrock

<!-- ![Bedrock](https://socialify.git.ci/oslabs-beta/Bedrock/image?description=1&descriptionEditable=An%20intuitive%20authentication%20library%20for%20Deno.&font=Inter&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Dark) -->

<p align="center"><img src="https://socialify.git.ci/oslabs-beta/Bedrock/image?description=1&descriptionEditable=An%20intuitive%20authentication%20library%20for%20Deno.&font=Inter&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Dark" alt="drawing" width="700"/></p>

A fully modular authentication library for Deno that intends to be the *Bedrock* of your application's authentication/session control. Bedrock provides authentication (Local + MFA, OAuth), and session handling middleware as well as conditional access controls to restrict access to your routes as defined by your application's requirements.

Check our website [here](https://bedrockauth.dev) for additional information and documentation!


### Importing Bedrock
```typescript
import { init } from 'https://deno.land/x/bedrock@v1.0.1/mod.ts'
```
## Implementation

### Choose your desired strategy or strategies. 
Bedrock offers several ways to provide multi-factor authentication through a local authentication strategy. These include TOTP through an authentication app, SMS, and Email. Additionally, we have abstracted away the process of implementing these six popular OAuth providers. 
- Discord
- Facebook
- Github
- Google
- LinkedIn
- Twitter
## Local Authentication Strategy

### Define Your Parameters
Implementations your choice of strategies will require some variance in your parameters object. Visit our documentatioin for more information about which parameters you will need for your desired implementation.
```typescript
const params: LocalAuthParams = {  
  checkCreds : dbController.checkCreds,
  mfaType: "Token",
  getSecret: dbController.getSecret,
};
```
### Initiate Bedrock
Initiate a Bedrock class object passing in params.
```typescript
const Bedrock = init(params);
```

### Implant Bedrock middleware into your routes
```typescript
// Verification of username/password and creation of session
MFARouter.post('/login', Bedrock.localLogin, (ctx: Context) => {
  if(ctx.state.localVerified){
    //inside this if statement means user is locally authenticated with username/password  
    if(ctx.state.hasSecret === false){
      //inside this if statement means user is locally authenticated 
      //but does not have a stored secret
      ctx.response.body = {
        successful: true;
        mfaRequired: ctx.state.mfaRequired; //false
      }
  } else{
      //inside this else statement means user is locally authenticated and with a secret, 
      //to be redirected to verify MFA
      ctx.response.body = {
      successful: true,
      mfaRequired: ctx.state.mfaRequired; //true
    };
    ctx.response.status = 200;
  } else{
      //inside this else statement means user authentication with username/password failed
      ctx.response.body = {
        successful: false
      }
      ctx.response.status = 401;
  }
  return;

// Verification of MFA token code, if enabled
MFARouter.post('/checkMFA', Bedrock.checkMFA, (ctx: Context) => {
  console.log('Successfully verified MFA code');
  ctx.response.redirect('/secret');
  return;
});

// Secret route with session verification middleware
MFARouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
  console.log('Secret obtained!');
  ctx.response.body = 'Secret obtained!';
  ctx.response.status = 200;
  return;
});

// Route to log user out of server session
MFARouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
  console.log('Successfully signed out');
  ctx.response.body = 'Successfully signed out';
  ctx.response.status = 200;
  return;
});
```


## OAuth 2.0 Strategy
All OAuth providers require a client_id, client_secret, and redirect_uri. Additionally, Bedrock requires the developer to define scope for an added level of secruity. However, each OAuth provider publishes an extensive list of their supported scopes and they largely differ from each other. Please see our [documentation](https://bedrockauth.dev/docs) for more information about scopes for specific OAuth providers. 

### Define Your Parameters
```typescript
const params: OAuthParams = {
  provider: 'Github',
  client_id: Deno.env.get('CLIENT_ID')!,
  client_secret: Deno.env.get('CLIENT_SECRET')!,
  redirect_uri: Deno.env.get('AUTH_CALLBACK_URL')!,
  scope: 'read:user',
};
```
### Initiate a Bedrock Class
```typescript
const Bedrock = init(params);
```
### Implant Bedrock middleware into your routes

```typescript
// Route to redirect user to OAuth provider's login site
OAuthRouter.get('/OAuth', Bedrock.sendRedirect);

// Route to retrieve access token and create user session
OAuthRouter.get('/OAuth/github', Bedrock.getToken, (ctx: Context) => {
  console.log('Successfully logged in via OAuth');
  ctx.response.redirect('/secret');
  return;
});

// Secret route with verification middleware
OAuthRouter.get('/secret', Bedrock.verifyAuth, (ctx: Context) => {
  console.log('Secret obtained!');
  ctx.response.body = 'Secret obtained!';
  ctx.response.status = 200;
  return;
});

// Route to log user out of OAuth and server session
OAuthRouter.get('/signout', Bedrock.signOut, (ctx: Context) => {
  console.log('Successfully signed out');
  ctx.response.redirect('/home');
  return;
});
```

## How Bedrock is Built
- The timed one time password (TOTP) algorithm used in Bedrock follows the standard outlined in the [IETF RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238).
- The SMS verification is provided through use of the [Twilio API](https://www.twilio.com/docs/usage/api).
- The email verification is provided through [deno-mailer](https://deno.land/x/denomailer@1.0.1)
## How to Build Upon Bedrock

#### How to contribute...
- The first way to contribute is by giving us feedback with context about your use case. The will help us determine where we can improve for future builds.
- Other ways to contribute would be to contact us or open issues on this repo. If neither of those options work for you, email us at bedrock.deno@gmail.com
## Authors

- Eric Hagen: [Github](https://github.com/ejhagen) | [LinkedIn](https://www.linkedin.com/in/hagenforhire)
- Anthony Valdez: [Github](https://github.com/va1dez) | [LinkedIn](https://www.linkedin.com/in/va1dez)
- Julian Kang: [Github](https://github.com/julianswkang) | [LinkedIn](https://www.linkedin.com/in/julianswkang)
- John Howell: [Github](https://github.com/Tak149) | [LinkedIn](https://www.linkedin.com/in/jdh3/)

## v1.0.1
- Added additional Local Authentication MFA option of e-mail (via [deno-mailer](https://deno.land/x/denomailer@1.0.1))
- Added additional OAuth strategies, including Discord, Facebook, LinkedIn, and Twitter

## v1.0.0

Initial release supporting the following authentication strategies:
- Local Authentication, with optional MFA options
  - TOTP code (generated by popular apps such as Google and Microsoft Authenticator)
  - SMS code (Via Twilio)
- OAuth
  - Github
  - Google

Built on top of the [Oak](https://github.com/oakserver/oak) library and intended to be used as middleware in routes.

Session management handled by [oak_sessions](https://github.com/jcs224/oak_sessions)

