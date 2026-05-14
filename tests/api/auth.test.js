const request = require('supertest');
const API_URL = 'http://localhost/Bee/server/api';

describe('Authentication API', () => {
  let authToken = '';

  it('should fail login with incorrect credentials', async () => {
    const res = await request(API_URL).post('/login.php').send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(API_URL).post('/login.php').send({ email: 'admin@cognitioit.ca', password: 'password123' });
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    }
  });

  it('should get current user profile with valid token', async () => {
    if (!authToken) return;
    const res = await request(API_URL).get('/me.php').set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email');
  });

  it('should reject unauthorized access', async () => {
    const res = await request(API_URL).get('/me.php');
    expect(res.statusCode).toEqual(401);
  });
});
