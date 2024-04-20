const request = require('supertest');
const app = require('../../index');
const seedTransactions = require('../data/transactions.json');
const { truncateTransactionTable, getAuthHeader } = require('../helpers');

const BASE_API = '/api/v1';

module.exports = {
  create: () => {
    let authHeader;
    let fetchedAccounts;
    let fetchedUsers;

    beforeAll(async () => {
      authHeader = await getAuthHeader();
      await truncateTransactionTable();

      const { body: fetchedAccountsResponse } = await request(app)
        .get(`${BASE_API}/accounts`)
        .set(authHeader);
      fetchedAccounts = fetchedAccountsResponse.data;

      const { body: fetchedUsersResponse } = await request(app)
        .get(`${BASE_API}/users`)
        .set(authHeader);
      fetchedUsers = fetchedUsersResponse.data;
    });

    test('should show status code 201 and return the created transaction record', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/transactions`)
        .set(authHeader)
        .send({
          sourceAccountId: fetchedAccounts[0].id,
          destinationAccountId: fetchedAccounts[1].id,
          amount: seedTransactions[0].amount
        });

      expect(statusCode).toBe(201);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('sourceAccountId');
      expect(body.data).toHaveProperty('destinationAccountId');
      expect(body.data).toHaveProperty('amount');
      expect(body.data).toHaveProperty('sourceAccount');
      expect(body.data).toHaveProperty('destinationAccount');
      expect(body.data.sourceAccountId).toBe(fetchedAccounts[0].id);
      expect(body.data.destinationAccountId).toBe(fetchedAccounts[1].id);
      expect(body.data.amount).toBe(seedTransactions[0].amount);
      expect(body.data.sourceAccount).toEqual({
        ...fetchedAccounts[0],
        balance: fetchedAccounts[0].balance - seedTransactions[0].amount,
        user: fetchedUsers[0]
      });
      expect(body.data.destinationAccount).toEqual({
        ...fetchedAccounts[1],
        balance: fetchedAccounts[1].balance + seedTransactions[0].amount,
        user: fetchedUsers[1]
      });
    });

    test('should show status code 400 if one of the required fields is missing in the request body', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/transactions`)
        .set(authHeader)
        .send({
          sourceAccountId: fetchedAccounts[1].id,
          destinationAccountId: fetchedAccounts[0].id,
          amount: null
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if sourceAccountId and destinationAccountId have the same value', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/transactions`)
        .set(authHeader)
        .send({
          sourceAccountId: fetchedAccounts[0].id,
          destinationAccountId: fetchedAccounts[0].id,
          amount: seedTransactions[1].amount
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if there is no existing acount with corresponding sourceAccountId', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/transactions`)
        .set(authHeader)
        .send({
          sourceAccountId: 1e5,
          destinationAccountId: fetchedAccounts[1].id,
          amount: seedTransactions[1].amount
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if there is no existing acount with corresponding destinationAccountId', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/transactions`)
        .set(authHeader)
        .send({
          sourceAccountId: fetchedAccounts[0].id,
          destinationAccountId: 1e5,
          amount: seedTransactions[1].amount
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    test('should show status code 400 if the amount to send is insufficient from source account', async () => {
      const { statusCode, body } = await request(app)
        .post(`${BASE_API}/transactions`)
        .set(authHeader)
        .send({
          sourceAccountId: fetchedAccounts[1].id,
          destinationAccountId: fetchedAccounts[0].id,
          amount: 1e10
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
        .post(`${BASE_API}/transactions`)
        .send({
          sourceAccountId: fetchedAccounts[1].id,
          destinationAccountId: fetchedAccounts[0].id,
          amount: seedTransactions[1].amount
        });

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(false);
      expect(body.data).toBe(null);
    });

    afterAll(async () => {
      await request(app).post(`${BASE_API}/transactions`).set(authHeader).send({
        sourceAccountId: fetchedAccounts[1].id,
        destinationAccountId: fetchedAccounts[0].id,
        amount: seedTransactions[1].amount
      });
    });
  },
  getAll: () => {
    let authHeader;

    beforeAll(async () => {
      authHeader = await getAuthHeader();
    });

    test('should show status code 200 and return all transaction records found', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/transactions`)
        .set(authHeader);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('sourceAccountId');
      expect(body.data[0]).toHaveProperty('destinationAccountId');
      expect(body.data[0]).toHaveProperty('amount');
      expect(body.data[0].amount).toBe(seedTransactions[0].amount);
    });

    test('should show status code 401 if user not authenticated', async () => {
      const { statusCode, body } = await request(app).get(
        `${BASE_API}/transactions`
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
    let fetchedTransactions;
    const fetchedAccounts = [];

    beforeAll(async () => {
      authHeader = await getAuthHeader();

      const { body: fetchedTransactionsResponse } = await request(app)
        .get(`${BASE_API}/transactions`)
        .set(authHeader);
      fetchedTransactions = fetchedTransactionsResponse.data;

      const { body: fetchedSourceAccountResponse } = await request(app)
        .get(`${BASE_API}/accounts/${fetchedTransactions[0].sourceAccountId}`)
        .set(authHeader);
      delete fetchedSourceAccountResponse.data.user.profile;
      fetchedAccounts.push(fetchedSourceAccountResponse.data);

      const { body: fetchedDestinationAccountResponse } = await request(app)
        .get(
          `${BASE_API}/accounts/${fetchedTransactions[0].destinationAccountId}`
        )
        .set(authHeader);
      delete fetchedDestinationAccountResponse.data.user.profile;
      fetchedAccounts.push(fetchedDestinationAccountResponse.data);
    });

    test('should show status code 200 and return the corresponding transaction data', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/transactions/${fetchedTransactions[0].id}`)
        .set(authHeader);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.status).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('sourceAccountId');
      expect(body.data).toHaveProperty('destinationAccountId');
      expect(body.data).toHaveProperty('amount');
      expect(body.data).toHaveProperty('sourceAccount');
      expect(body.data).toHaveProperty('destinationAccount');
      expect(body.data.sourceAccountId).toBe(fetchedAccounts[0].id);
      expect(body.data.destinationAccountId).toBe(fetchedAccounts[1].id);
      expect(body.data.amount).toBe(seedTransactions[0].amount);
      expect(body.data.sourceAccount).toEqual(fetchedAccounts[0]);
      expect(body.data.destinationAccount).toEqual(fetchedAccounts[1]);
    });

    test('should show status code 400 if there is no record found with the corresponding transaction id', async () => {
      const { statusCode, body } = await request(app)
        .get(`${BASE_API}/transactions/${1e5}`)
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
        `${BASE_API}/transactions/${fetchedTransactions[0].id}`
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
