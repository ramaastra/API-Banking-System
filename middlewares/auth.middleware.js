function auth(req, res, next) {
  const { authorization } = req.headers;

  if (authorization) {
    const authToken = authorization.split(' ')[1];
    if (authToken === 'qwerty123') {
      return next();
    }
  }

  return res.status(401).json({
    status: false,
    message: 'not authorized',
    data: null
  });
}

module.exports = auth;
