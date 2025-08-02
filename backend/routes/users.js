const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role('admin'), userController.getAll);
router.post('/', auth, role('admin'), userController.create);
router.put('/:id', auth, role('admin'), userController.update);
router.delete('/:id', auth, role('admin'), userController.delete);

module.exports = router; 