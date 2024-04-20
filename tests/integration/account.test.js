const request = require('supertest');
const app = require('../../index');
const seedAccounts = require('../data/accounts.json');
const { truncateAccountTable, getAuthHeader } = require('../helpers');

const BASE_API = '/api/v1';

module.exports = {
  create: () => {
    let authHeader;
    let fetchedUsers;

    beforeAll(async () => {
      await truncateAccountTable();

      authHeader = await getAuthHeader();

      const { body: fetchedUsersResponse } = await request(app)
        .get(`${BASE_API}/users`)
        .set(authHeader);
      fetchedUsers = fetchedUsersResponse.data;
    });

    test('should show status code 201 and return the created account record', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/accounts`)
        .set(authHeader)
        .send({
          bankName: seedAccounts[0].bankName,
          bankAccountNumber: seedAccounts[0].bankAccountNumber,
          balance: seedAccounts[0].balance,
          userId: fetchedUsers[0].id
        });

      expect(statusCode).toBe(201);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('bankName');
      expect(body.data).toHaveProperty('bankAccountNumber');
      expect(body.data).toHaveProperty('balance');
      expect(body.data).toHaveProperty('userId');
      expect(body.data).toHaveProperty('user');
      expect(body.data.bankName).toBe(seedAccounts[0].bankName);
      expect(body.data.bankAccountNumber).toBe(
        seedAccounts[0].bankAccountNumber
      );
      expect(body.data.balance).toBe(seedAccounts[0].balance);
      expect(body.data.userId).toBe(fetchedUsers[0].id);
      expect(body.data.user).toEqual(fetchedUsers[0]);
    });

    test('should show status code 400 if one of the required fields is missing in the request body', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/accounts`)
        .set(authHeader)
        .send({
          bankName: seedAccounts[1].bankName,
          bankAccountNumber: null,
          balance: seedAccounts[1].balance,
          userId: fetchedUsers[1].id
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if bankAccountNumber is already registered', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/accounts`)
        .set(authHeader)
        .send({
          bankName: seedAccounts[1].bankName,
          bankAccountNumber: seedAccounts[0].bankAccountNumber,
          balance: seedAccounts[1].balance,
          userId: fetchedUsers[1].id
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if there is no existing user with corresponding userId', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/accounts`)
        .set(authHeader)
        .send({
          bankName: seedAccounts[1].bankName,
          bankAccountNumber: seedAccounts[1].bankAccountNumber,
          balance: seedAccounts[1].balance,
          userId: 1e5
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
        .post(`${BASE_API}/accounts`)
        .send({
          bankName: seedAccounts[1].bankName,
          bankAccountNumber: seedAccounts[1].bankAccountNumber,
          balance: seedAccounts[1].balance,
          userId: fetchedUsers[1].id
        });

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    afterAll(async () => {
      await request(app).post(`${BASE_API}/accounts`).set(authHeader).send({
        bankName: seedAccounts[1].bankName,
        bankAccountNumber: seedAccounts[1].bankAccountNumber,
        balance: seedAccounts[1].balance,
        userId: fetchedUsers[1].id
      });
    });
  },
  getAll: () => {
    let authHeader;
    let fetchedUsers;

    beforeAll(async () => {
      authHeader = await getAuthHeader();

      const { body: fetchedUsersResponse } = await request(app)
        .get(`${BASE_API}/users`)
        .set(authHeader);
      fetchedUsers = fetchedUsersResponse.data;
    });

    test('should show status code 200 and return all account records found', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/accounts`)
        .set(authHeader);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('bankName');
      expect(body.data[0]).toHaveProperty('bankAccountNumber');
      expect(body.data[0]).toHaveProperty('balance');
      expect(body.data[0]).toHaveProperty('userId');
      expect(body.data[0].bankName).toBe(seedAccounts[0].bankName);
      expect(body.data[0].bankAccountNumber).toBe(
        seedAccounts[0].bankAccountNumber
      );
      expect(body.data[0].balance).toBe(seedAccounts[0].balance);
      expect(body.data[0].userId).toBe(fetchedUsers[0].id);
    });

    test('should show status code 401 if user not authenticated', async () => {
      const { statusCode, body } = await request(app).get(
        `${BASE_API}/accounts`
      );

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });
  },
  getById: () => {
    let authHeader;
    let fetchedAccounts;

    beforeAll(async () => {
      authHeader = await getAuthHeader();

      const { body: fetchedAccountsResponse } = await request(app)
        .get(`${BASE_API}/accounts`)
        .set(authHeader);
      fetchedAccounts = fetchedAccountsResponse.data;
    });

    test('should show status code 200 and return the corresponding account data', async () => {
      const { body: fetchedUserResponse } = await request(app)
        .get(`${BASE_API}/users/${fetchedAccounts[0].userId}`)
        .set(authHeader);

      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/accounts/${fetchedAccounts[0].id}`)
        .set(authHeader);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('bankName');
      expect(body.data).toHaveProperty('bankAccountNumber');
      expect(body.data).toHaveProperty('balance');
      expect(body.data).toHaveProperty('userId');
      expect(body.data).toHaveProperty('user');
      expect(body.data.user).toHaveProperty('id');
      expect(body.data.user).toHaveProperty('name');
      expect(body.data.user).toHaveProperty('email');
      expect(body.data.user).toHaveProperty('profile');
      expect(body.data.bankName).toBe(seedAccounts[0].bankName);
      expect(body.data.bankAccountNumber).toBe(
        seedAccounts[0].bankAccountNumber
      );
      expect(body.data.balance).toBe(seedAccounts[0].balance);
      expect(body.data.userId).toBe(fetchedAccounts[0].userId);
      expect(body.data.user).toEqual(fetchedUserResponse.data);
    });

    test('should show status code 400 if there is no record found with the corresponding account id', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/accounts/${1e5}`)
        .set(authHeader);

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 401 if user not authenticated', async () => {
      const { statusCode, body } = await request(app).get(
        `${BASE_API}/accounts/${fetchedAccounts[0].id}`
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
