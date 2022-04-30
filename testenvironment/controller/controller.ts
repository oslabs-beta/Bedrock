import { Application } from "https://deno.land/x/oak/mod.ts";
import { db, Users } from '../server/model.ts';

export const controller: Controller = {
    // check if username exists already
        // if it does -> throw error
        //else 
        // try  to input user in db
        // import the secret
        //return next
    //catch err
    
    
    // create User
    addUser: async (ctx: any, next: any) => {
      //check if username exists in db already
      const newUser: string = ctx.body.username;
      try {
        const foundUser: object | void = await Users.findOne({username: `${newUser}`})
        if (foundUser) {
          console.log('username already exists in db')
          throw new Error;
        }
      }
      catch (err) {
        return next(err);
      }
        const password: string = ctx.body.password;
        const email: string = ctx.body.email;
        if (ctx.body.phone) {
            const phone: string = ctx.body.phone;
        }
        // add user to DB
        //error handler
        try {
            
        }
    },
    
    // read 
    getUser: (ctx: any, next: any) => {
        
    }

}


export type Controller = {
  addUser: Function,
  getUser: Function
}

