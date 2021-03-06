import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    preset: "ts-jest",
    displayName: {
      name: "placeNameOfYourAppHere",
      color: "greenBright",
    },
    verbose: true,
    setupFiles: ["dotenv/config"],
    testMatch: ["**/**/*.test.ts"],
    testEnvironment: "node",
    detectOpenHandles: true,
    // collectCoverage: true,
    transform: { "^.+\\.tsx?$": "ts-jest" },
    moduleNameMapper: {
      "@/resources/(.*)$": "<rootDir>/src/resources/$1",
      "@/utils/(.*)$": "<rootDir>/src/utils/$1",
      "@/middleware/(.*)$": "<rootDir>/src/middleware/$1",
    },
    globalTeardown: "<rootDir>/src/tests/jest-globals-teardown.ts",
    forceExit: true,
  };
};
