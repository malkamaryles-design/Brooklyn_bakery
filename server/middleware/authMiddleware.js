const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { AUTH_ERRORS } = require('../constants/errors');
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(AUTH_ERRORS.NO_TOKEN.status).json({
      error: AUTH_ERRORS.NO_TOKEN.message,
      code: AUTH_ERRORS.NO_TOKEN.code,
    });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(AUTH_ERRORS.INVALID_TOKEN.status).json({
      error: AUTH_ERRORS.INVALID_TOKEN.message,
      code: AUTH_ERRORS.INVALID_TOKEN.code,
    });
  }
};
module.exports = authMiddleware;