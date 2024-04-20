const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      status: false,
      message: 'not authorized',
      data: null
    });
  }

  jwt.verify(authorization, JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(401).json({
        status: false,
        message: 'not authorized',
        data: null
      });
    }

    req.user = user;
    next();
  });
};
