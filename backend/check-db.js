// Check database connection and table status
const db = require('./db');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check if users table exists
    const usersTableExists = await db.schema.hasTable('users');
    console.log('📋 Users table exists:', usersTableExists);
    
    if (usersTableExists) {
      // Count users
      const userCount = await db('users').count('* as count');
      console.log('👥 Number of users:', userCount[0].count);
      
      // Show table structure
      const columns = await db('users').columnInfo();
      console.log('📊 Users table columns:', Object.keys(columns));
    }
    
    // Check if messages table exists
    const messagesTableExists = await db.schema.hasTable('messages');
    console.log('💬 Messages table exists:', messagesTableExists);
    
    if (messagesTableExists) {
      // Count messages
      const messageCount = await db('messages').count('* as count');
      console.log('📨 Number of messages:', messageCount[0].count);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase(); 