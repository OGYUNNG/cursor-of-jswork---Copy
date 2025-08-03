// Database connection for PostgreSQL using Knex
const knex = require('knex');

// Parse DATABASE_URL if available (for production/Render)
let connectionConfig;
if (process.env.DATABASE_URL) {
  // Parse the DATABASE_URL for production
  const url = new URL(process.env.DATABASE_URL);
  connectionConfig = {
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading slash
    ssl: { rejectUnauthorized: false } // Required for Render PostgreSQL
  };
} else {
  // Use individual environment variables for local development
  connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'kluverto',
    database: process.env.DB_NAME || 'logins'
  };
}

const db = knex({
  client: 'pg',
  connection: connectionConfig,
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