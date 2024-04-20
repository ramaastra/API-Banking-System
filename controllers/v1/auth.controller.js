const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateHash, compareHash } = require('../../libs/bcrypt');
const { JWT_SECRET } = process.env;

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, identityType, address } = req.body;
      const identityNumber = parseInt(req.body.identityNumber);

      if (!name || !email || !password || !identityNumber || !address) {
        return res.status(400).json({
          status: false,
          message: `field 'name', 'email', 'password', 'identityType', 'identityNumber', and 'address' are required`,
          data: null
        });
      }

      const validIdentityTypes = ['KTP', 'SIM', 'Passport'];
      if (!validIdentityTypes.includes(identityType)) {
        return res.status(400).json({
          status: false,
          message: `field identityType should have value of 'KTP', 'SIM', or 'Passport'`,
          data: null
        });
      }

      const hashedPassword = await generateHash(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profile: {
            create: {
              identityType,
              identityNumber,
              address
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true
        }
      });

      res.status(201).json({
        status: true,
        message: 'successfully create new user data with corresponding profile',
        data: user
      });
    } catch (error) {
      if (
        error.name === 'PrismaClientKnownRequestError' &&
        error.code === 'P2002'
      ) {
        return res.status(400).json({
          status: false,
          message:
            'already found a user profile record with corresponding email or identity number',
          data: null
        });
      }
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: 'invalid email or password',
          data: null
        });
      }

      const isPasswordCorrect = await compareHash(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: false,
          message: 'invalid email or password',
          data: null
        });
      }

      delete user.password;

      const token = jwt.sign(user, JWT_SECRET);

      res.status(200).json({
        status: true,
        message: 'login successfully',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  },
  authenticate: async (req, res, next) => {
    try {
      res.status(200).json({
        status: true,
        message: 'successfully authenticated',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }
};
