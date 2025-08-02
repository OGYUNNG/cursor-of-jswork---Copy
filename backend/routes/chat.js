const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.get('/messages', auth, chatController.getMessages);

module.exports = router; 