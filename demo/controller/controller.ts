import { isHttpError, Context } from "../../src/deps.ts";
import { Users } from '../server/model.ts';
import { generateTOTPSecret} from '../../src/totp.ts';
import { RouterMiddleware } from '../../src/types.ts'

const dbController: Controller = { 
  // create User
  addUser: async (ctx: Context, next: any) => {
    //check if username exists in db already
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    const {username, password, email, phone} = bodyValue;
    try {
      const foundUser: resObject | any = await Users.findOne({username})
      const found = await foundUser;
      if (found) {
        // console.log('Username already exists in the database')
        ctx.response.body = {message: 'A user by this name already exists'};
        throw new Error;
      }
      else{
        // console.log(">>>GOING TO CREATE A USER!<<<");
        const secret = await generateTOTPSecret();
        const user = {
          username: username,
          password: password,
          phone: phone,
          email: email,
          secret: secret,
        }
        try {          
          const addedUser: resObject | any = await Users.insertOne(user);
          ctx.response.body = await addedUser;
          // console.log('--> user added to db', addedUser);
          return next();
        } 
        catch (err) {
          // console.log('Error when adding user');
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
      // console.log('Error when finding user in the database');
      if (isHttpError(err)){
        ctx.response.status = err.status;
      } else {
        ctx.response.status = 500;
      }
      ctx.response.body = {error: err.message}
      ctx.response.type = "json";
    }
  },

  verifyUser: async (ctx: Context, next: any) => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;
    // const username = bodyValue[0];
    // const password = bodyValue[1];
    const {username, password} = bodyValue;
    try {
      const foundUser = await Users.findOne({username})
      const found = await foundUser;
      // console.log("FOUND: ", found);
      if (found) {
        // check that password passed in (bodyValue) matches found.password (pw in DB)
        if (password === found.password) {
          // console.log('Password matches')
          ctx.response.body = true;
          
        } else {
          // console.log('Bad password')
          ctx.response.body = false;
        }
        return next();
      } else {
        // console.log("Couldn't find username in the database")
        ctx.response.body = false;
        return next();
      }
    }
    catch (err) {
      // console.log('Error when finding user in the database');
      if (isHttpError(err)){
        ctx.response.status = err.status;
      } else {
        ctx.response.status = 500;
      }
      ctx.response.body = {error: err.message}
      ctx.response.type = "json";
    }
  },

  checkCreds: async (username: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await Users.findOne({username})
      const found = await foundUser;
      // console.log("FOUND: ", found);
      if (found) {
        // check that password passed in (bodyValue) matches found.password (pw in DB)
        if (password === found.password) {
          // console.log('Password matches')
          return true;
        } else {
          // console.log('Bad password')
          return false;
        }
      } else {
        // console.log("Couldn't find username in the database")
        return false;
      }
    }
    catch (err) {
      // console.log('Error when finding user in the database');
      return false;
    }
  },

  getSecret: async (username: string): Promise<string> => {
    try {
      const foundUser = await Users.findOne({username});
      const found = await foundUser;

      if (found) {
        return found.secret;
      } else {
        return 'No Secret';
      }
    } catch {
      throw Error('Error accessing the database');
    }
  },

  getNumber: async (username: string): Promise<string> => {
    try {
      const foundUser = await Users.findOne({username});
      const found = await foundUser;

      if (found !== undefined && found.phone !== null) {
        return found.phone;
      } else {
        return 'No Phone Number';
      }
    } catch {
      throw Error('Error accessing the database');
    }
  },
}

export type Controller = {
  addUser: RouterMiddleware<string>;
  verifyUser: RouterMiddleware<string>;
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret: (username: string) => Promise<string>;
  getNumber: (username: string) => Promise<string>;
}

interface resObject {
  username: string;
  password: string;
  phone?: string;
  email?: string;
}

export default dbController;
