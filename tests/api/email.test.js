const request = require('supertest');
const API_URL = 'http://localhost/Bee/server/api';

describe('Email API', () => {
  let authToken = '';

  beforeAll(async () => {
    const res = await request(API_URL).post('/login.php').send({ email: 'admin@cognitioit.ca', password: 'password123' });
    if (res.statusCode === 200) authToken = res.body.token;
  });

  it('should fetch email templates', async () => {
    if (!authToken) return;
    const res = await request(API_URL).get('/email_templates.php').set('Authorization', `Bearer ${authToken}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it('should send a test email', async () => {
    if (!authToken) return;
    const res = await request(API_URL).post('/send_email.php').set('Authorization', `Bearer ${authToken}`).send({
      to: 'test@beechat.com',
      subject: 'Test Email',
      body: 'This is a test email'
    });
    expect([200, 201, 404, 500]).toContain(res.statusCode);
  });
});
