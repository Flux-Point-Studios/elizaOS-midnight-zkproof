module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  // Ignore build outputs and long-running end-to-end specs unless explicitly opted-in
  testPathIgnorePatterns: ["/dist/", ".*\\.e2e\\.test\\.ts$"]
}; 