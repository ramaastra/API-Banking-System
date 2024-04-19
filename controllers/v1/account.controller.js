const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const accounts = await prisma.bankAccount.findMany();

      res.status(200).json({
        status: true,
        message: `successfully fetched ${accounts.length} account records`,
        data: accounts
      });
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const accountId = parseInt(req.params.id);

      if (!accountId) {
        res.status(400).json({
          status: false,
          message: 'id params is required with the value of an integer',
          data: null
        });
      }

      const account = await prisma.bankAccount.findUnique({
        where: { id: accountId },
        include: {
          user: {
            include: { profile: true }
          }
        }
      });

      if (!account) {
        res.status(400).json({
          status: false,
          message: `cannot find account record with id ${accountId}`,
          data: null
        });
      }

      res.status(200).json({
        status: true,
        message: `successfully fetched account record with id ${accountId}`,
        data: account
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { bankName } = req.body;
      const bankAccountNumber = parseInt(req.body.bankAccountNumber);
      const userId = parseInt(req.body.userId);
      const balance = req.body.balance || 0;

      if (!bankName || !bankAccountNumber || !userId) {
        res.status(400).json({
          status: false,
          message: `field 'bankName', 'bankAccountNumber', and 'userId' are required`,
          data: null
        });
      }

      const account = await prisma.bankAccount.create({
        data: {
          bankName,
          bankAccountNumber,
          balance,
          userId
        },
        include: { user: true }
      });

      res.status(201).json({
        status: true,
        message: 'successfully created new account data',
        data: account
      });
    } catch (error) {
      if (error.name === 'PrismaClientKnownRequestError') {
        switch (error.code) {
          case 'P2002':
            res.status(400).json({
              status: false,
              message:
                'already found an account record with corresponding bankAccountNumber',
              data: null
            });
            break;
          case 'P2003':
            res.status(400).json({
              status: false,
              message: 'cannot create account for user that did not exists',
              data: null
            });
            break;
          default:
            res.status(500).json({
              status: false,
              message: 'internal server error',
              data: null
            });
            break;
        }
      }
      next(error);
    }
  }
};
