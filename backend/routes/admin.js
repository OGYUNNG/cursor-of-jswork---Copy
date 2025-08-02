// routes/admin.js

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

module.exports = (db) => {
  const router = express.Router();

  // ✅ GET all users
  router.get('/users', async (req, res) => {
    try {
      const users = await db('logged').select('id', 'name', 'username', 'role');
      res.json({ success: true, users });
    } catch (err) {
      console.error('GET /admin/users error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // ✅ POST create user
  router.post(
    '/create-user',
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('username').notEmpty().withMessage('Username is required'),
      body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
      body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: errors.array() });
      }

      const { name, username, password, role } = req.body;

      try {
        const existingUser = await db('logged').where({ username }).first();
        if (existingUser) {
          return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db('logged')
          .insert({ name, username, password: hashedPassword, role })
          .returning(['id', 'name', 'username', 'role']);

        res.json({ success: true, user: newUser });
      } catch (err) {
        console.error('POST /admin/create-user error:', err);
        res.status(500).json({ success: false, message: 'Failed to create user' });
      }
    }
  );

  // ✅ PUT update user
  router.put(
    '/users/:id',
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('username').notEmpty().withMessage('Username is required'),
      body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid input', errors: errors.array() });
      }

      const { id } = req.params;
      const { name, username, role } = req.body;

      try {
        await db('logged').where({ id }).update({ name, username, role });
        res.json({ success: true });
      } catch (err) {
        console.error(`PUT /admin/users/${id} error:`, err);
        res.status(500).json({ success: false, message: 'Failed to update user' });
      }
    }
  );

  return router;
};
