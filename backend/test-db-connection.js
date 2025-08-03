// Test database connection script
require('dotenv').config();
const db = require('./db');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 Environment:', process.env.NODE_ENV || 'development');
    
    if (process.env.DATABASE_URL) {
      console.log('✅ DATABASE_URL is set');
      // Parse and show connection info (without password)
      const url = new URL(process.env.DATABASE_URL);
      console.log('📍 Host:', url.hostname);
      console.log('🔌 Port:', url.port);
      console.log('👤 User:', url.username);
      console.log('🗄️ Database:', url.pathname.substring(1));
    } else {
      console.log('ℹ️ Using individual database environment variables');
      console.log('📍 Host:', process.env.DB_HOST || '127.0.0.1');
      console.log('🔌 Port:', process.env.DB_PORT || 5432);
      console.log('👤 User:', process.env.DB_USER || 'postgres');
      console.log('🗄️ Database:', process.env.DB_NAME || 'logins');
    }
    
    // Test the connection
    const result = await db.raw('SELECT 1 as test, current_database() as db_name, current_user as user');
    console.log('✅ Database connection successful!');
    console.log('📊 Test result:', result.rows[0]);
    
    // Test if tables exist
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:', tables.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error details:', error);
    process.exit(1);
  } finally {
    await db.destroy();
    console.log('🔌 Database connection closed');
  }
}

testConnection(); 