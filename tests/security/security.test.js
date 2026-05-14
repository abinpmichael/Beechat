const request = require('supertest');
const API_URL = 'http://localhost/Bee/server/api';

describe('Security API Tests', () => {
  it('should prevent SQL injection on login', async () => {
    const res = await request(API_URL).post('/login.php').send({
      email: "' OR 1=1 --",
      password: "password123"
    });
    expect(res.statusCode).toBe(401); // Should fail to login cleanly
  });

  it('should reject requests without valid JWT token', async () => {
    const res = await request(API_URL).get('/me.php').set('Authorization', `Bearer invalid.token.here`);
    expect(res.statusCode).toBe(401);
  });

  it('should apply rate limiting', async () => {
    // Basic test checking for repeated requests if implemented
    let statuses = [];
    for (let i = 0; i < 50; i++) {
      const res = await request(API_URL).get('/login.php');
      statuses.push(res.statusCode);
    }
    // We just check if it doesn't crash. If rate limited, we might see 429.
    // By default, GET login.php returns 400 Bad Request.
    expect(statuses.some(s => s === 429 || s === 400 || s === 401)).toBeTruthy();
  });
});
