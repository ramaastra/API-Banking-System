const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.split(' ')[1]) {
    return res.status(401).json({
      status: false,
      message: 'not authorized',
      data: null
    });
  }

  const token = authorization.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(401).json({
        status: false,
        message: 'not authorized',
        data: null
      });
    }

    delete user.iat;

    req.user = user;
    next();
  });
};
