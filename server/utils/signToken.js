const jwt = require('jsonwebtoken');            
const { JWT_SECRET } = require('../config/env'); 
const signToken = (user) => 
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }); 
module.exports = signToken; 