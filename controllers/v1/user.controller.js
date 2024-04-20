const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getAll: async (req, res, next) => {
    try {
      let users;

      if (req.query) {
        const { search: searchKeyword } = req.query;
        users = await prisma.user.findMany({
          where: {
            name: {
              contains: searchKeyword,
              mode: 'insensitive'
            }
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        });
      }

      res.status(200).json({
        status: true,
        message: `successfully fetched ${users.length} user records`,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: 'id params is required with the value of an integer',
          data: null
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true
        }
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: `cannot find user record with id ${userId}`,
          data: null
        });
      }

      res.status(200).json({
        status: true,
        message: `successfully fetched user record with id ${userId}`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
};
