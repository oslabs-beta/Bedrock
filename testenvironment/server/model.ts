// Using deno_mongo (third party)
import { Bson, MongoClient } from "https://deno.land/x/mongo@v0.29.4/mod.ts";
import "https://deno.land/x/dotenv/load.ts";
// New instance of mongo
const client = new MongoClient();

const connString: string = Deno.env.get("DBCONNSTRING")!;

// Connect using srv url
await client.connect(connString);

interface UserSchema {
  username: string;
  password: string;
  phone: string | null;
  email: string;
  secret: string;
};

export const db = client.database("denotestdb");
export const Users = db.collection<UserSchema>("users");




//////////insertuser test////////////
// const insertTest = await Users.insertOne({    
//   username: 'eric',
//   password: 'eric1',
//   phone: '7346460635',
//   email: 'bedrock.deno@gmail.com',
//   secret: '123456789',
// });

//insertTest();

console.log('well, it didn\'t break')

//////////finduser test////////////
// async function findUser (userid: string) {
//     const user1 = await users.findOne({_id: userid})
//     console.log(await user1);
//     return user1;
// };
// findUser('0001');

