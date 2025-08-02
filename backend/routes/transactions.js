const express = require('express');
const router = express.Router();
const txController = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, txController.getAll);
router.post('/', auth, txController.create);
router.put('/:id', auth, role('admin'), txController.update);
router.delete('/:id', auth, role('admin'), txController.delete);

module.exports = router; 