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
          }
        });
      } else {
        users = await prisma.user.findMany();
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
        res.status(400).json({
          status: false,
          message: 'id params is required with the value of an integer',
          data: null
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      if (!user) {
        res.status(400).json({
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
  },
  create: async (req, res, next) => {
    try {
      const { name, email, password, identityType, address } = req.body;
      const identityNumber = parseInt(req.body.identityNumber);

      if (!name || !email || !password || !identityNumber || !address) {
        res.status(400).json({
          status: false,
          message: `field 'name', 'email', 'password', 'identityType', 'identityNumber', and 'address' are required`,
          data: null
        });
      }

      const validIdentityTypes = ['KTP', 'SIM', 'Passport'];
      if (!validIdentityTypes.includes(identityType)) {
        res.status(400).json({
          status: false,
          message: `field identityType should have value of 'KTP', 'SIM', or 'Passport'`,
          data: null
        });
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          profile: {
            create: {
              identityType,
              identityNumber,
              address
            }
          }
        },
        include: {
          profile: true
        }
      });

      res.status(200).json({
        status: true,
        message: 'successfully create new user data with corresponding profile',
        data: user
      });
    } catch (error) {
      if (
        error.name === 'PrismaClientKnownRequestError' &&
        error.code === 'P2002'
      ) {
        res.status(400).json({
          status: false,
          message: `already found a user profile record with corresponding identity number`,
          data: null
        });
      }
      next(error);
    }
  }
};
