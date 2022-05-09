// Using deno_mongo (third party)
import { MongoClient } from "https://deno.land/x/mongo@v0.29.4/mod.ts";
import "https://deno.land/std@0.138.0/dotenv/load.ts";
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
}

export const db = client.database("denotestdb");
export const Users = db.collection<UserSchema>("users");