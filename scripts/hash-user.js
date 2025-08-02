// hash-user.js
const bcrypt = require('bcryptjs');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'kluverto',
    database: 'logins'
  }
});

async function createUser(name, username, plainPassword, role = 'user') {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await db('logged').insert({
    name,
    username,
    password: hashedPassword,
    role
  });

  console.log(`✅ User ${username} added.`);
}

createUser('John Doe', 'johndoe', 'password123', 'user')
  .then(() => process.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
