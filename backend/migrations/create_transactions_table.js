// Migration to create transactions table
const db = require('../db');

async function createTransactionsTable() {
  try {
    // Check if transactions table already exists
    const tableExists = await db.schema.hasTable('transactions');

    if (!tableExists) {
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
    } else {
      console.log('ℹ️ Transactions table already exists');
    }
  } catch (error) {
    console.error('❌ Error creating transactions table:', error);
    throw error;
  }
}

// Run the migration
createTransactionsTable()
  .then(() => {
    console.log('✅ Transaction migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Transaction migration failed:', error);
    process.exit(1);
  }); 