import { connect } from "mongoose";

import * as dotenv from "dotenv";
dotenv.config();

const URI: string = String(process.env.MONGO_URI);

connect(URI)
  .then(() => {
    console.log(`Connected to database`);
  })
  .catch((error) => {
    console.error(`Couldn't connect to database`, error);
    process.exit(1);
  });
