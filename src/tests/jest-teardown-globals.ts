export default () => {
  process.exit(0);
};
// import { MongoMemoryServer } from "mongodb-memory-server";

// import { config } from "./utils/config";

// export = async function globalTeardown() {
//   if (config.Memory) {
//     const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
//     await instance.stop();
//   }
// };
