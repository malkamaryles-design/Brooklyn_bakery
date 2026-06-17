const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, default: '' },
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
});
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
const User = mongoose.model('User', userSchema);
const createUser          = async (data)   => User.create(data);
const findByEmail         = async (email)  => User.findOne({ email });  
const findById            = async (userId) => User.findById(userId).select('-password');
const findByIdWithPassword = async (userId) => User.findById(userId); 
const updateById          = async (userId, data) => User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
const updatePassword      = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) return null;
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
  return user;
};
const setResetToken       = async (email, token, expiry) => {
  return User.findOneAndUpdate({ email }, { resetToken: token, resetTokenExpiry: expiry }, { new: true });
};
const findByResetToken    = async (token) => {
  return User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
};
module.exports = { User, createUser, findByEmail, findById, findByIdWithPassword, updateById, updatePassword, setResetToken, findByResetToken };