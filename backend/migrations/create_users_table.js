// Migration to create users table
const db = require('../db');

async function createUsersTable() {
  try {
    // Check if users table already exists
    const tableExists = await db.schema.hasTable('users');
    
    if (!tableExists) {
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('username').unique().notNullable();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
        table.index('username');
        table.index('role');
      });
      
      console.log('✅ Users table created successfully');
    } else {
      console.log('ℹ️ Users table already exists');
      
      // Check table structure
      const columns = await db('users').columnInfo();
      console.log('📊 Users table columns:', Object.keys(columns));
    }
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }
}

// Run the migration
createUsersTable()
  .then(() => {
    console.log('✅ Users table migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Users table migration failed:', error);
    process.exit(1);
  }); 