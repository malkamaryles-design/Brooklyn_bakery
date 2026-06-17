const { createUser, findByEmail, findById, findByIdWithPassword, updateById, updatePassword, setResetToken, findByResetToken } = require('../models/userModel');
const signToken = require('../utils/signToken');
const crypto = require('crypto');
const registerUser = async (name, email, password) => {
  const user = await createUser({ email, password, name });
  const token = signToken(user);
  return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } };
};
const loginUser = async (email, password) => {
  const user = await findByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    return null;
  }
  const token = signToken(user);
  return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role } };
};
const getMe = async (userId) => {
  return findById(userId);
};
const updateUserProfile = async (userId, { name, email, phone }) => {
  const updates = {};
  if (name?.trim())  updates.name = name.trim();
  if (email?.trim()) updates.email = email.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  return updateById(userId, updates);
};
const changePassword = async (userId, currentPassword, newPassword) => {
  const fullUser = await findByIdWithPassword(userId);
  if (!fullUser) return { success: false, error: 'משתמש לא נמצא' };
  const isMatch = await fullUser.comparePassword(currentPassword);
  if (!isMatch) return { success: false, error: 'הסיסמה הנוכחית שגויה' };
  await updatePassword(userId, newPassword);
  return { success: true };
};
const requestPasswordReset = async (email) => {
  const user = await findByEmail(email);
  if (!user) return { success: false, error: 'אימייל לא נמצא במערכת' };
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); 
  await setResetToken(email, token, expiry);
  return { success: true, token, userEmail: user.email, userName: user.name };
};
const resetPasswordWithToken = async (token, newPassword) => {
  const user = await findByResetToken(token);
  if (!user) return { success: false, error: 'קישור לא תקין או פג תוקף' };
  await updatePassword(user._id, newPassword);
  return { success: true };
};
module.exports = { registerUser, loginUser, getMe, updateUserProfile, changePassword, requestPasswordReset, resetPasswordWithToken };