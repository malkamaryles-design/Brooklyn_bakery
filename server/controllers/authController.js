const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');
const { AUTH_ERRORS, sendError } = require('../constants/errors');
const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return sendError(res, AUTH_ERRORS.MISSING_FIELDS);
  }
  try {
    const result = await authService.registerUser(name, email, password);
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, AUTH_ERRORS.EMAIL_EXISTS);
    }
    throw err;
  }
});
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  if (!result) return sendError(res, AUTH_ERRORS.INVALID_CREDENTIALS);
  res.json(result);
});
const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  if (!user) return sendError(res, AUTH_ERRORS.USER_NOT_FOUND);
  res.json(user);
});
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user.userId, req.body);
  if (!user) return sendError(res, AUTH_ERRORS.USER_NOT_FOUND);
  res.json(user);
});
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'סיסמה חדשה חייבת להכיל לפחות 6 תווים' });
  }
  const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'הסיסמה שונתה בהצלחה' });
});
const requestReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'אימייל נדרש' });
  const result = await authService.requestPasswordReset(email);
  res.json({ success: true, message: 'אם האימייל קיים במערכת, נשלח קישור לאיפוס' });
});
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'טוקן וסיסמה חדשה (6+ תווים) נדרשים' });
  }
  const result = await authService.resetPasswordWithToken(token, newPassword);
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ success: true, message: 'הסיסמה אופסה בהצלחה' });
});
module.exports = { register, login, me, updateProfile, changePassword, requestReset, resetPassword };