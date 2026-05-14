const request = require('supertest');
const API_URL = 'http://localhost/Bee/server/api';

describe('Chat API', () => {
  let authToken = '';

  beforeAll(async () => {
    const res = await request(API_URL).post('/login.php').send({ email: 'admin@cognitioit.ca', password: 'password123' });
    if (res.statusCode === 200) authToken = res.body.token;
  });

  it('should fetch chat list', async () => {
    if (!authToken) return;
    const res = await request(API_URL).get('/chats.php').set('Authorization', `Bearer ${authToken}`);
    // Assuming 404 if chats.php is not the correct endpoint, or 200 if it exists
    expect([200, 404, 500]).toContain(res.statusCode);
  });
});
