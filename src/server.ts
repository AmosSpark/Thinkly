import "module-alias/register";

import morgan from "morgan";
import * as dotenv from "dotenv";

// Handle sync uncaught errors
process.on("uncaughtException", (error: any) => {
  console.log("Uncaught Exception : Shutting App Down...");
  console.log(error.name, `:`, error.message);
  // !optional
  process.exit(1);
});

import { app } from "./app";

// Environment Variables Configuration
dotenv.config();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Server
const PORT: number = Number(process.env.PORT) || 7000;

if (!process.env.PORT) {
  console.log(`App port not found`);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`App now listening on port ${PORT}`);
});

// Handle async uncaught errors
process.on("unhandledRejection", (error: any) => {
  console.log("Uncaught Rejection : Shutting App Down...");
  console.log(error.name, `:`, error.message);
  // optional
  server.close(() => {
    process.exit(1);
  });
});
