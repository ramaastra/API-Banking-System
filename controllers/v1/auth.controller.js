const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  }
};
