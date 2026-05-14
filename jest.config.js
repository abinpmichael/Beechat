module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/api/**/*.test.js', '**/tests/security/**/*.test.js', '**/tests/socket/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 10000,
  reporters: [
    'default'
  ]
};
