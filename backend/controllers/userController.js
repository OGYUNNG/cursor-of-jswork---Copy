const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.create = async (req, res) => {
  const { name, email, password, account, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash, account, role });
  await user.save();
  res.json(user);
};

exports.update = async (req, res) => {
  const { name, email, password, account, role } = req.body;
  const update = { name, email, account, role };
  if (password) update.password = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(user);
};

exports.delete = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}; 