const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const request = require('supertest');
const app = require('../../index');
const seedUsers = require('../data/users.json');

const BASE_API = '/api/v1';

module.exports = {
  truncateUserTable: async () => {
    await prisma.user.deleteMany();
  },
  truncateAccountTable: async () => {
    await prisma.bankAccount.deleteMany();
  },
  truncateTransactionTable: async () => {
    await prisma.transaction.deleteMany();
  },
  getAuthHeader: async () => {
    const { body: loginResponse } = await request(app)
      .post(`${BASE_API}/auth/login`)
      .send({
        email: seedUsers[0].email,
        password: seedUsers[0].password
      });
    const header = { Authorization: `Bearer ${loginResponse.data.token}` };
    return header;
  }
};
