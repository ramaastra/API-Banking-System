const authSpecTest = require('./auth.test');
const userSpecTest = require('./user.test');
const accountSpecTest = require('./account.test');
const transactionSpecTest = require('./transaction.test');

const BASE_API = '/api/v1';

describe(`POST ${BASE_API}/auth/register`, authSpecTest.register);

describe(`GET ${BASE_API}/users`, userSpecTest.getAll);
describe(`GET ${BASE_API}/users/{id}`, userSpecTest.getById);

describe(`POST ${BASE_API}/accounts`, accountSpecTest.create);
describe(`GET ${BASE_API}/accounts`, accountSpecTest.getAll);
describe(`GET ${BASE_API}/accounts/{id}`, accountSpecTest.getById);

describe(`POST ${BASE_API}/transactions`, transactionSpecTest.create);
describe(`GET ${BASE_API}/transactions`, transactionSpecTest.getAll);
describe(`GET ${BASE_API}/transactions/{id}`, transactionSpecTest.getById);
