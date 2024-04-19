const request = require('supertest');
const app = require('../../index');
const seedUsers = require('../data/users.json');
const dbHelper = require('../helpers/db');

const BASE_API = '/api/v1';
const AUTH_HEADER = { Authorization: 'Bearer qwerty123' };

module.exports = {
  create: () => {
    beforeAll(async () => {
      await dbHelper.truncateUserTable();
    });

    test('should show status code 201 and return the created user record', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/users`)
        .set(AUTH_HEADER)
        .send({
          name: seedUsers[0].name,
          email: seedUsers[0].email,
          password: seedUsers[0].password,
          identityType: seedUsers[0].identityType,
          identityNumber: seedUsers[0].identityNumber,
          address: seedUsers[0].address
        });

      expect(statusCode).toBe(201);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('name');
      expect(body.data).toHaveProperty('email');
      expect(body.data).toHaveProperty('password');
      expect(body.data).toHaveProperty('profile');
      expect(body.data.profile).toHaveProperty('id');
      expect(body.data.profile).toHaveProperty('identityType');
      expect(body.data.profile).toHaveProperty('identityNumber');
      expect(body.data.profile).toHaveProperty('address');
      expect(body.data.profile).toHaveProperty('userId');
      expect(body.data.name).toBe(seedUsers[0].name);
      expect(body.data.email).toBe(seedUsers[0].email);
      expect(body.data.password).toBe(seedUsers[0].password);
      expect(body.data.profile.identityType).toBe(seedUsers[0].identityType);
      expect(body.data.profile.identityNumber).toBe(
        seedUsers[0].identityNumber
      );
      expect(body.data.profile.address).toBe(seedUsers[0].address);
      expect(body.data.profile.userId).toBe(body.data.id);
    });

    test('should show status code 400 if one of the required fields is missing in the request body', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/users`)
        .set(AUTH_HEADER)
        .send({
          name: seedUsers[1].name,
          email: seedUsers[1].email,
          password: null,
          identityType: seedUsers[1].identityType,
          identityNumber: seedUsers[1].identityNumber,
          address: seedUsers[1].address
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if identityType field has invalid value', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/users`)
        .set(AUTH_HEADER)
        .send({
          name: seedUsers[1].name,
          email: seedUsers[1].email,
          password: seedUsers[1].password,
          identityType: 'Kartu Pelajar',
          identityNumber: seedUsers[1].identityNumber,
          address: seedUsers[1].address
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if email or identityNumber is already registered', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/users`)
        .set(AUTH_HEADER)
        .send({
          name: seedUsers[1].name,
          email: seedUsers[0].email,
          password: seedUsers[1].password,
          identityType: seedUsers[1].identityType,
          identityNumber: seedUsers[0].identityNumber,
          address: seedUsers[1].address
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 401 if user not authenticated', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/users`)
        .send({
          name: seedUsers[1].name,
          email: seedUsers[1].email,
          password: seedUsers[1].password,
          identityType: seedUsers[1].identityType,
          identityNumber: seedUsers[1].identityNumber,
          address: seedUsers[1].address
        });

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    afterAll(async () => {
      await request(app).post(`${BASE_API}/users`).set(AUTH_HEADER).send({
        name: seedUsers[1].name,
        email: seedUsers[1].email,
        password: seedUsers[1].password,
        identityType: seedUsers[1].identityType,
        identityNumber: seedUsers[1].identityNumber,
        address: seedUsers[1].address
      });
    });
  },
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
      expect(body.data[0]).toHaveProperty('password');
      expect(body.data[0].name).toBe(seedUsers[0].name);
      expect(body.data[0].email).toBe(seedUsers[0].email);
      expect(body.data[0].password).toBe(seedUsers[0].password);
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
      expect(body.data).toHaveProperty('password');
      expect(body.data).toHaveProperty('profile');
      expect(body.data.profile).toHaveProperty('id');
      expect(body.data.profile).toHaveProperty('identityType');
      expect(body.data.profile).toHaveProperty('identityNumber');
      expect(body.data.profile).toHaveProperty('address');
      expect(body.data.profile).toHaveProperty('userId');
      expect(body.data.name).toBe(seedUsers[0].name);
      expect(body.data.email).toBe(seedUsers[0].email);
      expect(body.data.password).toBe(seedUsers[0].password);
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
