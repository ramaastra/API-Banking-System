const authSpecTest = require('./auth.test');
const userSpecTest = require('./user.test');
const accountSpecTest = require('./account.test');
const transactionSpecTest = require('./transaction.test');
const { baseApi } = require('../helpers');

describe(`POST ${baseApi}/auth/register`, authSpecTest.register);
describe(`POST ${baseApi}/auth/login`, authSpecTest.login);
describe(`POST ${baseApi}/auth/authenticate`, authSpecTest.authenticate);

describe(`GET ${baseApi}/users`, userSpecTest.getAll);
describe(`GET ${baseApi}/users/{id}`, userSpecTest.getById);

describe(`POST ${baseApi}/accounts`, accountSpecTest.create);
describe(`GET ${baseApi}/accounts`, accountSpecTest.getAll);
describe(`GET ${baseApi}/accounts/{id}`, accountSpecTest.getById);

describe(`POST ${baseApi}/transactions`, transactionSpecTest.create);
describe(`GET ${baseApi}/transactions`, transactionSpecTest.getAll);
describe(`GET ${baseApi}/transactions/{id}`, transactionSpecTest.getById);
