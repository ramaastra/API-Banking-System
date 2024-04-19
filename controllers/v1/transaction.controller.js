const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const transactions = await prisma.transaction.findMany();

      res.status(200).json({
        status: true,
        message: `successfully fetched ${transactions.length} transaction records`,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const transactionId = parseInt(req.params.id);

      if (!transactionId) {
        return res.status(400).json({
          status: false,
          message: 'id params is required with the value of an integer',
          data: null
        });
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          sourceAccount: {
            include: { user: true }
          },
          destinationAccount: {
            include: { user: true }
          }
        }
      });

      if (!transaction) {
        return res.status(400).json({
          status: false,
          message: `cannot find transaction record with id ${transactionId}`,
          data: null
        });
      }

      res.status(200).json({
        status: true,
        message: `successfully fetched transaction record with id ${transactionId}`,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const sourceAccountId = parseInt(req.body.sourceAccountId);
      const destinationAccountId = parseInt(req.body.destinationAccountId);
      const amount = parseInt(req.body.amount);

      if (!sourceAccountId || !destinationAccountId || !amount) {
        return res.status(400).json({
          status: false,
          message: `field 'sourceAccountId', 'destinationAccountId', and 'amount' are required`,
          data: null
        });
      }

      if (sourceAccountId === destinationAccountId) {
        return res.status(400).json({
          status: false,
          message: `field 'sourceAccountId' and 'destinationAccountId' should not have the same value`,
          data: null
        });
      }

      const sourceAccount = await prisma.bankAccount.findUnique({
        where: { id: sourceAccountId }
      });

      if (!sourceAccount) {
        return res.status(400).json({
          status: false,
          message: `cannot create transaction with source account that does not exist`,
          data: null
        });
      }

      if (sourceAccount.balance < amount) {
        return res.status(400).json({
          status: false,
          message: `cannot create transaction from source account with id ${sourceAccountId} that has insufficient balance (current balance is ${sourceAccount.balance})`,
          data: null
        });
      }

      const updatedSourceAccount = await prisma.bankAccount.update({
        where: {
          id: sourceAccountId
        },
        data: {
          balance: {
            decrement: amount
          }
        },
        include: { user: true }
      });

      const updatedDestinationAccount = await prisma.bankAccount.update({
        where: {
          id: destinationAccountId
        },
        data: {
          balance: {
            increment: amount
          }
        },
        include: { user: true }
      });

      const transaction = await prisma.transaction.create({
        data: {
          sourceAccountId,
          destinationAccountId,
          amount
        }
      });

      res.status(201).json({
        status: true,
        message: 'successfully created new transaction record',
        data: {
          ...transaction,
          sourceAccount: updatedSourceAccount,
          destinationAccount: updatedDestinationAccount
        }
      });
    } catch (error) {
      if (
        error.name === 'PrismaClientKnownRequestError' &&
        error.code === 'P2025'
      ) {
        res.status(400).json({
          status: false,
          message:
            'cannot create transaction with destination account that does not exist',
          data: null
        });
      } else {
        res.status(500).json({
          status: false,
          message: 'internal server error',
          data: null
        });
        next(error);
      }
    }
  }
};
