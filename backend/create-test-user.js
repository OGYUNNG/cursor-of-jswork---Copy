const bcrypt = require('bcryptjs');
const db = require('./db');

async function createTestUser() {
  console.log('👤 Creating Test User for Dashboard...\n');

  try {
    // Check if test user already exists
    const existingUser = await db('users').where({ username: 'test@example.com' }).first();
    
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Account Number: ${existingUser.account_number}`);
      console.log(`   Balance: $${existingUser.account_balance}`);
      return existingUser;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const accountNumber = 'ACC' + Math.random().toString().slice(2, 10);
    
    const [newUser] = await db('users').insert({
      name: 'Test User',
      username: 'test@example.com',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      account_number: accountNumber,
      account_balance: 5000.00,
      profile_picture: null
    }).returning(['id', 'name', 'username', 'email', 'role', 'account_number', 'account_balance', 'profile_picture']);

    console.log('✅ Test user created successfully:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Account Number: ${newUser.account_number}`);
    console.log(`   Balance: $${newUser.account_balance}`);
    console.log('\n📝 Login Credentials:');
    console.log(`   Username: test@example.com`);
    console.log(`   Password: password123`);

    return newUser;

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

// Run the function
createTestUser()
  .then(() => {
    console.log('\n✅ Test user setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }); 