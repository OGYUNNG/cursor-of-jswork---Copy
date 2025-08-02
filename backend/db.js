// Database connection for PostgreSQL using Knex
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'kluverto',
    database: process.env.DB_NAME || 'logins'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
});

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ PostgreSQL database connected successfully');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = db; 