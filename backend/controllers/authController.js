const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, account } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, account });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        name: user.name, 
        role: user.role, 
        account: user.account,
        balance: user.balance || 0
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 