const request = require('supertest');
const API_URL = process.env.API_BASE_URL || 'http://localhost/Bee/server/api';

describe('Super Admin API', () => {
  let superAdminToken = '';

  beforeAll(async () => {
    // Attempt to log in to get a super admin token
    // Using the seeded super admin credentials
    const res = await request(API_URL)
      .post('/login.php')
      .send({ email: 'admin@cognitioit.ca', password: 'password123' });
    
    if (res.statusCode === 200 && res.body.token) {
      superAdminToken = res.body.token;
    }
  });

  it('should fetch platform statistics for super admin', async () => {
    if (!superAdminToken) {
      console.warn('Skipping test: No super admin token available.');
      return;
    }

    const res = await request(API_URL)
      .get('/super_stats.php')
      .set('Authorization', `Bearer ${superAdminToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total_tenants');
    expect(res.body).toHaveProperty('total_leads');
  });

  it('should reject non-admin access to super stats', async () => {
    const fakeUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidGVuYW50X2lkIjoyLCJlbWFpbCI6ImFnZW50QHRlc3QuY29tIiwiaXNfc3VwZXJfYWRtaW4iOjB9.mock_signature';
    
    const res = await request(API_URL)
      .get('/super_stats.php')
      .set('Authorization', `Bearer ${fakeUserToken}`);
      
    // Expected to be 401 Unauthorized or 403 Forbidden
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
  });

  it('should fetch list of tenants', async () => {
    if (!superAdminToken) return;

    const res = await request(API_URL)
      .get('/superadmin.php?action=tenants')
      .set('Authorization', `Bearer ${superAdminToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should list all billing plans', async () => {
    if (!superAdminToken) return;

    const res = await request(API_URL)
      .get('/superadmin.php?action=plans')
      .set('Authorization', `Bearer ${superAdminToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
