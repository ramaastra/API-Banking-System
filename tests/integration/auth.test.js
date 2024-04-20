const request = require('supertest');
const app = require('../../index');
const seedUsers = require('../data/users.json');
const dbHelper = require('../helpers/db');

const BASE_API = '/api/v1';

module.exports = {
  register: () => {
    beforeAll(async () => {
      await dbHelper.truncateUserTable();
    });

    test('should show status code 201 and return the created user record', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/auth/register`)
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

    test('should show status code 400 if one of the required fields is missing in the request body', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/auth/register`)
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
        .post(`${BASE_API}/auth/register`)
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
        .post(`${BASE_API}/auth/register`)
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

    afterAll(async () => {
      await request(app).post(`${BASE_API}/auth/register`).send({
        name: seedUsers[1].name,
        email: seedUsers[1].email,
        password: seedUsers[1].password,
        identityType: seedUsers[1].identityType,
        identityNumber: seedUsers[1].identityNumber,
        address: seedUsers[1].address
      });
    });
  },
  login: () => {
    test('should show status code 200 and return user object along with the login token', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/auth/login`)
        .send({
          email: seedUsers[0].email,
          password: seedUsers[0].password
        });

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('token');
      expect(body.data.user).toHaveProperty('id');
      expect(body.data.user).toHaveProperty('name');
      expect(body.data.user).toHaveProperty('email');
      expect(body.data.user.name).toBe(seedUsers[0].name);
      expect(body.data.user.email).toBe(seedUsers[0].email);
      expect(typeof body.data.token).toBe('string');
    });

    test('should show status code 400 if one of the required fields is missing in the request body', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/auth/login`)
        .send({
          email: seedUsers[0].email,
          password: null
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if email or password is invalid or unmatch', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/auth/login`)
        .send({
          email: seedUsers[0].email,
          password: seedUsers[1].password
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });
  },
  authenticate: () => {
    const AUTH_HEADER = {};

    beforeAll(async () => {
      const { body: loginResponse } = await request(app)
        .post(`${BASE_API}/auth/login`)
        .send({
          email: seedUsers[0].email,
          password: seedUsers[0].password
        });
      AUTH_HEADER['Authorization'] = `Bearer ${loginResponse.data.token}`;
    });

    test('should show status code 200 if user provided the valid token', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/auth/authenticate`)
        .set(AUTH_HEADER);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('user');
      expect(body.data.user).toHaveProperty('id');
      expect(body.data.user).toHaveProperty('name');
      expect(body.data.user).toHaveProperty('email');
      expect(body.data.user.name).toBe(seedUsers[0].name);
      expect(body.data.user.email).toBe(seedUsers[0].email);
    });
  }
};
