const axios = require('axios');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost/Bee/server/api';

// Global setup for Jest tests
beforeAll(() => {
  // Set default timeout
  jest.setTimeout(10000);
});

// Mock database interactions or seed data if needed
// This would typically reset the DB state before tests
global.API_BASE_URL = API_BASE_URL;
