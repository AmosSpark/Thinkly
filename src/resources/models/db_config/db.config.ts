import { connect } from "mongoose";

import * as dotenv from "dotenv";
dotenv.config();

let URI: string = String(process.env.MONGO_URI);

if (process.env.NODE_ENV === "test") {
  URI = String(process.env.MONGO_URI_TEST);
}

connect(URI)
  .then(() => {
    console.log(`Connected to database`);
  })
  .catch((error) => {
    console.error(`Couldn't connect to database`, error);
    process.exit(1);
  });
