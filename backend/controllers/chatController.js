const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  const { userId } = req.query;
  // Admin can fetch all, user can fetch only their own
  if (req.user.role === 'admin') {
    const msgs = await Message.find({ $or: [ { from: userId }, { to: userId } ] }).sort({ timestamp: 1 });
    res.json(msgs);
  } else {
    const msgs = await Message.find({ $or: [ { from: req.user.id }, { to: req.user.id } ] }).sort({ timestamp: 1 });
    res.json(msgs);
  }
}; 