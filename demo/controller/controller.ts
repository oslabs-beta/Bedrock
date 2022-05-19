import { Users } from '../server/model.ts';
import { Router, Application, helpers, Context, isHttpError } from "https://deno.land/x/oak@v10.5.1/mod.ts";

const dbController: Controller = { 
  // create User
  // addUser: async (ctx: Context, next: any) => {
  //   //check if username exists in db already
  //   const body = await ctx.request.body();
  //   const bodyValue = await body.value;
  //   const {username, password, email, phone} = bodyValue;
  //   try {
  //     const foundUser: resObject | any = await Users.findOne({username})
  //     const found = await foundUser;
  //     if (found) {        
  //       ctx.response.body = {message: 'A user by this name already exists'};
  //       throw new Error;
  //     }
  //     else{        
  //       // const secret = await generateTOTPSecret();
  //       const user = {
  //         username: username,
  //         password: password,
  //         phone: phone,
  //         email: email,
  //         secret: secret,
  //       }
  //       try {          
  //         const addedUser: resObject | any = await Users.insertOne(user);
  //         ctx.response.body = await addedUser;          
  //         return next();
  //       } 
  //       catch (err) {          
  //         if (isHttpError(err)){
  //           ctx.response.status = err.status;
  //         } else {
  //           ctx.response.status = 500;
  //         }
  //         ctx.response.body = {error: err.message}
  //         ctx.response.type = "json";
  //       }
  //     }
  //   }
  //   catch (err) {      
  //     if (isHttpError(err)){ß
  //       ctx.response.status = err.status;
  //     } else {
  //       ctx.response.status = 500;
  //     }
  //     ctx.response.body = {error: err.message}
  //     ctx.response.type = "json";
  //   }
  // },

  verifyUser: async (ctx: Context, next: any) => {
    const body = await ctx.request.body();
    const bodyValue = await body.value;    
    const {username, password} = bodyValue;
    try {
      const foundUser = await Users.findOne({username})
      const found = await foundUser;      
      if (found) {        
        if (password === found.password) {          
          ctx.response.body = true;
          
        } else {          
          ctx.response.body = false;
        }
        return next();
      } else {        
        ctx.response.body = false;
        return next();
      }
    }
    catch (err) {      
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
      if (found) {        
        if (password === found.password) {          
          return true;
        } else {          
          return false;
        }
      } else {        
        return false;
      }
    }
    catch (err) {      
      return false;
    }
  },

  getSecret: async (username: string): Promise<string | null> => {
    try {
      const foundUser = await Users.findOne({username});
      const found = await foundUser;

      if (found && found.secret) {
        return found.secret;
      } else {
        return null;
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

  getEmail: async (username: string): Promise<string> => {
    try {
      const foundUser = await Users.findOne({username});
      const found = await foundUser;
      if (found !== undefined){
        return found.email; 
      } else {
        return 'Could not find an email associated with that username';
      }
    } catch {
      throw Error('Error accessing the database');
    }
  },
}

export type Controller = {
  // addUser: (ctx: Context, next: any) => Promise<string>;
  verifyUser: (ctx: Context, next: any) => Promise<string>;
  checkCreds: (username: string, password: string) => Promise<boolean>;
  getSecret: (username: string) => Promise<string | null>;
  getNumber: (username: string) => Promise<string>;
  getEmail: (username: string) => Promise<string>;
}

interface resObject {
  username: string;
  password: string;
  phone?: string;
  email?: string;
}

export default dbController;
