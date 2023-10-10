/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  projects: [
    {
      displayName: "safe-type",
      testEnvironment: "node",
      cwd: "./lib/safe-type",
    },
  ],
};
