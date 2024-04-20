const request = require('supertest');
const app = require('../../index');
const seedUsers = require('../data/users.json');
const dbHelper = require('../helpers/db');

const BASE_API = '/api/v1';
const AUTH_HEADER = { Authorization: 'Bearer qwerty123' };

module.exports = {
  getAll: () => {
    test('should show status code 200 and return all user records found', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/users`)
        .set(AUTH_HEADER);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('name');
      expect(body.data[0]).toHaveProperty('email');
      expect(body.data[0].name).toBe(seedUsers[0].name);
      expect(body.data[0].email).toBe(seedUsers[0].email);
    });

    test('should show status code 401 if user not authenticated', async () => {
      const { statusCode, body } = await request(app).get(`${BASE_API}/users`);

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });
  },
  getById: () => {
    let fetchedUsers;

    beforeAll(async () => {
      const { body: fetchedUsersResponse } = await request(app)
        .get(`${BASE_API}/users`)
        .set(AUTH_HEADER);

      fetchedUsers = fetchedUsersResponse.data;
    });

    test('should show status code 200 and return the corresponding user data', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/users/${fetchedUsers[0].id}`)
        .set(AUTH_HEADER);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('name');
      expect(body.data).toHaveProperty('email');
      expect(body.data).toHaveProperty('profile');
      expect(body.data.profile).toHaveProperty('id');
      expect(body.data.profile).toHaveProperty('identityType');
      expect(body.data.profile).toHaveProperty('identityNumber');
      expect(body.data.profile).toHaveProperty('address');
      expect(body.data.profile).toHaveProperty('userId');
      expect(body.data.name).toBe(seedUsers[0].name);
      expect(body.data.email).toBe(seedUsers[0].email);
      expect(body.data.profile.identityType).toBe(seedUsers[0].identityType);
      expect(body.data.profile.identityNumber).toBe(
        seedUsers[0].identityNumber
      );
      expect(body.data.profile.address).toBe(seedUsers[0].address);
      expect(body.data.profile.userId).toBe(body.data.id);
    });

    test('should show status code 400 if there is no record found with the corresponding user id', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/users/${1e5}`)
        .set(AUTH_HEADER);

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 401 if user not authenticated', async () => {
      const { statusCode, body } = await request(app).get(
        `${BASE_API}/users/${fetchedUsers[0].id}`
      );

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });
  }
};
