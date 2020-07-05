module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
  testPathIgnorePatterns: ['./__tests__/setup.ts'],
};
