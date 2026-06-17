const { AUTH_ERRORS } = require('../constants/errors');
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(AUTH_ERRORS.FORBIDDEN.status).json({
      error: AUTH_ERRORS.FORBIDDEN.message,
      code: AUTH_ERRORS.FORBIDDEN.code,
    });
  }
  next();
};
module.exports = adminMiddleware;