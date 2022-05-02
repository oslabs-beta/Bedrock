import { Application, isHttpError, RouterMiddleware } from "https://deno.land/x/oak/mod.ts";
import { Users } from '../server/model.ts';
import { generateTOTPSecret} from '../../src/totp.ts';

const dbController: Controller = { 
  // create User
  addUser: async (ctx: any, next: any) => {
    //check if username exists in db already
    //console.log(ctx.request.hasBody);
    const body = await ctx.request.body(); // {limit: Infinity, "Content-Length": `${JSON.stringify(ctx.request.body).length}`}
    const bodyValue = await body.value;
    // console.log('bodyValue: ', bodyValue);
    //const information = await body.value;
    // console.log('this should be the information object', information)
    // console.log("CTX: ", ctx)
    let {username, password, email, phone} = bodyValue;
    // console.log('body: ', body)
    // console.log('username: ', username)
    //const newUser: string = username;//ctx.body.username;
    //next();
    try {
      const foundUser: object | void = await Users.findOne({username})
      console.log(foundUser)
      if (foundUser) {
        console.log('username already exists in db')
        throw new Error;
        ctx.response.body = {message: 'user already exists'};
      }
      else{
        console.log(">>>>>GOING TO CREATE A USER!<<<<<");
        const secret = await generateTOTPSecret();
        const user = {
          username: newUser,
          password: password,
          phone: phone,
          email: email,
          secret: secret,
        }
        // if (phone) user.phone = phone;
        
        try {
          const addedUser = await Users.insertOne(user);
          ctx.response.body = addedUser;
          console.log('--> user added to db', addedUser);
        } 
        catch (err) {
          console.log('error when adding user');
          if (isHttpError(err)){
            ctx.response.status = err.status;
          } else {
            ctx.response.status = 500;
          }
          ctx.response.body = {error: err.message}
          ctx.response.type = "json";
        }
      }
    }
    catch (err) {
      console.log('error when looking for user');
      if (isHttpError(err)){
        ctx.response.status = err.status;
      } else {
        ctx.response.status = 500;
      }
      ctx.response.body = {error: err.message}
      ctx.response.type = "json";
    }
    const {password, email} = ctx.body;
    const password: string = ctx.body.password;
    const email: string = ctx.body.email;
    let phone: string | null = null;
    if (phone) {
      phone = ctx.body.phone;
    }
    add user to DB
    error handler

    return next();
  }
  
  // read 
  // getUser: (ctx: any, next: any) => {
      
  // }

}


export type Controller = {
  addUser: RouterMiddleware<string>

}

export default dbController;
