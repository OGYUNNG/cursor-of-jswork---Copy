// server.js
require('dotenv').config(); // Load environment variables

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const app = express();
const server = http.createServer(app); // Wrap express with http server for socket.io
const PORT = process.env.PORT || 3100;

// ✅ Setup CORS using environment config
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:4000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Render PostgreSQL
  },
});

// ✅ Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ✅ Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ PostgreSQL Connection via centralized db module
const db = require('./db');

// ✅ Test DB connection
db.raw('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// ✅ Import and initialize chat socket functionality
const chatSocket = require('./chatSocket');
chatSocket(io);

// ✅ Create tables if they don't exist
const createTables = async () => {
  try {
    // Create users table if it doesn't exist
    const usersTableExists = await db.schema.hasTable('users');
    if (!usersTableExists) {
              await db.schema.createTable('users', (table) => {
          table.increments('id').primary();
          table.string('name').notNullable();
          table.string('username').unique().notNullable();
          table.string('email').unique().notNullable();
          table.string('password').notNullable();
          table.string('role').defaultTo('user');
          table.string('account_number').unique();
          table.decimal('account_balance', 15, 2).defaultTo(0.00);
          table.string('profile_picture');
          table.timestamp('created_at').defaultTo(db.fn.now());
          table.timestamp('updated_at').defaultTo(db.fn.now());
          table.index('username');
          table.index('email');
          table.index('role');
          table.index('account_number');
        });
      console.log('✅ Users table created successfully');
    }

    // Create messages table if it doesn't exist
    const messagesTableExists = await db.schema.hasTable('messages');
    if (!messagesTableExists) {
      await db.schema.createTable('messages', (table) => {
        table.increments('id').primary();
        table.string('from_user_id').notNullable();
        table.string('to_user_id').notNullable();
        table.text('content').notNullable();
        table.timestamp('timestamp').defaultTo(db.fn.now());
        table.index(['from_user_id', 'to_user_id']);
        table.index('timestamp');
      });
      console.log('✅ Messages table created successfully');
    }

    // Create transactions table if it doesn't exist
    const transactionsTableExists = await db.schema.hasTable('transactions');
    if (!transactionsTableExists) {
      await db.schema.createTable('transactions', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('date').notNullable();
        table.string('time').notNullable();
        table.string('description').notNullable();
        table.string('category').notNullable();
        table.decimal('amount', 15, 2).notNullable();
        table.enum('status', ['completed', 'pending']).defaultTo('completed');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        
        // Foreign key reference to users table
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index('user_id');
        table.index('date');
        table.index('category');
        table.index('status');
        table.index('created_at');
      });
      console.log('✅ Transactions table created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

// Run table creation
createTables();

// ✅ Login Route
app.post('/login', async (req, res) => {
  try {
  const { username, password } = req.body;

    // Query user from database
    const user = await db('users').where({ username }).first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    res.json({ 
      success: true,
      message: 'Login successful',
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Register Route with File Upload
app.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, username, email, password, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await db('users').where({ email }).first();
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate account number
    const accountNumber = 'ACC' + Math.random().toString().slice(2, 10);
    
    // Handle profile picture
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = `/uploads/${req.file.filename}`;
    }
    
    // Insert new user
    const [newUser] = await db('users').insert({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      account_number: accountNumber,
      account_balance: 0.00,
      profile_picture: profilePicturePath
    }).returning(['id', 'name', 'username', 'email', 'role', 'account_number', 'account_balance', 'profile_picture']);
    
    res.json({ 
      message: 'Registration successful',
      user: newUser
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get Users Route (Admin only)
app.get('/users', async (req, res) => {
  try {
    const users = await db('users').select('id', 'name', 'username', 'email', 'role', 'account_number', 'account_balance', 'profile_picture');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get User by ID Route (for dashboard)
app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db('users')
      .select('id', 'name', 'username', 'email', 'role', 'account_number', 'account_balance', 'profile_picture')
      .where('id', userId)
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update User Route
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, role } = req.body;
    
    await db('users')
      .where({ id })
      .update({ name, username, role });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete User Route
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('users').where({ id }).del();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update Account Balance Route
app.put('/users/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const { account_balance } = req.body;
    
    await db('users')
      .where({ id })
      .update({ account_balance });
    
    res.json({ message: 'Account balance updated successfully' });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get User Account Info Route
app.get('/users/:id/account', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await db('users')
      .select('id', 'name', 'username', 'account_number', 'account_balance')
      .where({ id })
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get account info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get Chat Messages Route
app.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const Message = require('./models/Message');
    
    const messages = await Message.findByUser(userId);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get Conversation Route
app.get('/messages/:user1Id/:user2Id', async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const Message = require('./models/Message');
    
    const messages = await Message.findConversation(user1Id, user2Id);
    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Transaction Routes
const transactionController = require('./controllers/transactionController');

// Get all transactions (admin) or user's transactions
app.get('/transactions', async (req, res) => {
  try {
    // For now, we'll return all transactions for admin
    // In a real app, you'd check authentication and role
    const Transaction = require('./models/Transaction');
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new transaction
app.post('/transactions', async (req, res) => {
  try {
    const Transaction = require('./models/Transaction');
    const transaction = await Transaction.create(req.body);
    res.json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update transaction
app.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const Transaction = require('./models/Transaction');
    const transaction = await Transaction.update(id, req.body);
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const Transaction = require('./models/Transaction');
    await Transaction.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transaction statistics
app.get('/transactions/stats', async (req, res) => {
  try {
    const Transaction = require('./models/Transaction');
    const stats = await Transaction.getTransactionStats();
    res.json(stats);
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions by account number
app.get('/transactions/account/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const Transaction = require('./models/Transaction');
    const transactions = await Transaction.findByAccount(accountNumber);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions by account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time chat`);
});
