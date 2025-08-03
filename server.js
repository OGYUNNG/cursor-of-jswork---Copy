// server.js

// 1. Import express
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const PORT = 3000;
const knex = require('knex');
app.use(express.json());

app.use(cors(
  {origin: [ 'https://cursor-of-jswork-copy-backend.onrender.com',
    'https://cursor-of-jswork-copy-backend.onrender.com'] 
  , methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
  }
));

// Middleware to serve static files

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Dummy users
  const users = [
    { username: 'user123', password: 'pass123', role: 'user' },
    { username: 'admin123', password: 'adminpass', role: 'admin' }
  ];

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/signin', (req, res) => {
  db.select('name', 'password').from('logged')
    .where('name', '=', req.body.name)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].password);
      if (isValid) {
        return db.select('*').from('logged')
        .where('name', '=', req.body.name)
        .then(user => {
          res.json(user[0])
        })
        .catch(err => res.status(400).json('unable to get user'))
      }else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

// Optional: Redirect root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
// 4. Start the server
app.listen(3000, () => {
  console.log('Server running on https://cursor-of-jswork-copy-backend.onrender.com');
});
