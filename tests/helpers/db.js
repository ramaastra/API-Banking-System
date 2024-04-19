const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  truncateUserTable: async () => {
    await prisma.user.deleteMany();
  },
  truncateAccountTable: async () => {
    await prisma.bankAccount.deleteMany();
  },
  truncateTransactionTable: async () => {
    await prisma.transaction.deleteMany();
  }
};
