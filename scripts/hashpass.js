// hash-user.js
const bcrypt = require('bcryptjs');

const password = 'adminpass'; // Replace this

bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed password:', hash);
});
