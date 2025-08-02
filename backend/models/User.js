const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  account: { type: String, unique: true },
  profilePicture: String,
  balance: { type: Number, default: 0 }
});
module.exports = mongoose.model('User', userSchema); 