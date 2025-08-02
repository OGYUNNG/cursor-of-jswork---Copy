// Migration to create messages table
const db = require('../db');

async function createMessagesTable() {
  try {
    // Check if messages table already exists
    const tableExists = await db.schema.hasTable('messages');
    
    if (!tableExists) {
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
    } else {
      console.log('ℹ️ Messages table already exists');
    }
  } catch (error) {
    console.error('❌ Error creating messages table:', error);
    throw error;
  }
}

// Run the migration
createMessagesTable()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 