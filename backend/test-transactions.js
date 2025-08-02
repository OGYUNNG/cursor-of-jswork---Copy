// Test script for transaction functionality
const db = require('./db');

async function testTransactions() {
  try {
    console.log('🧪 Testing Transaction Functionality...\n');

    // 1. Check if transactions table exists
    console.log('1. Checking transactions table...');
    const tableExists = await db.schema.hasTable('transactions');
    if (tableExists) {
      console.log('✅ Transactions table exists');
    } else {
      console.log('❌ Transactions table does not exist');
      console.log('Run: npm run migrate-transactions');
      return;
    }

    // 2. Check if users table exists and has data
    console.log('\n2. Checking users table...');
    const usersTableExists = await db.schema.hasTable('users');
    if (!usersTableExists) {
      console.log('❌ Users table does not exist');
      return;
    }

    const users = await db('users').select('id', 'name', 'account_number', 'account_balance').limit(3);
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('Create some users first');
      return;
    }

    console.log(`✅ Found ${users.length} users`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.account_number}): $${user.account_balance}`);
    });

    // 3. Test creating a transaction
    console.log('\n3. Testing transaction creation...');
    const testUser = users[0];
    const testTransaction = {
      user_id: testUser.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      description: 'Test transaction',
      category: 'Test',
      amount: 100.00,
      status: 'completed'
    };

    const [newTransaction] = await db('transactions').insert(testTransaction).returning('*');
    console.log('✅ Transaction created successfully');
    console.log(`   - ID: ${newTransaction.id}`);
    console.log(`   - Amount: $${newTransaction.amount}`);
    console.log(`   - Status: ${newTransaction.status}`);

    // 4. Test updating user balance
    console.log('\n4. Testing balance update...');
    const oldBalance = testUser.account_balance;
    await db('users')
      .where('id', testUser.id)
      .update({
        account_balance: db.raw(`account_balance + ${testTransaction.amount}`),
        updated_at: db.fn.now()
      });

    const updatedUser = await db('users').where('id', testUser.id).first();
    console.log(`✅ Balance updated: $${oldBalance} → $${updatedUser.account_balance}`);

    // 5. Test fetching transactions
    console.log('\n5. Testing transaction retrieval...');
    const allTransactions = await db('transactions')
      .join('users', 'transactions.user_id', 'users.id')
      .select(
        'transactions.*',
        'users.name as user_name',
        'users.account_number as user_account'
      );

    console.log(`✅ Found ${allTransactions.length} transactions`);
    allTransactions.forEach(tx => {
      console.log(`   - ${tx.user_name} (${tx.user_account}): $${tx.amount} - ${tx.description}`);
    });

    // 6. Test transaction statistics
    console.log('\n6. Testing transaction statistics...');
    const stats = await db('transactions')
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed_transactions', ['completed']),
        db.raw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending_transactions', ['pending']),
        db.raw('SUM(amount) as total_amount')
      )
      .first();

    console.log('✅ Transaction statistics:');
    console.log(`   - Total: ${stats.total_transactions}`);
    console.log(`   - Completed: ${stats.completed_transactions}`);
    console.log(`   - Pending: ${stats.pending_transactions}`);
    console.log(`   - Total Amount: $${parseFloat(stats.total_amount || 0).toFixed(2)}`);

    // 7. Clean up test data
    console.log('\n7. Cleaning up test data...');
    await db('transactions').where('id', newTransaction.id).del();
    
    // Reset user balance
    await db('users')
      .where('id', testUser.id)
      .update({
        account_balance: oldBalance,
        updated_at: db.fn.now()
      });

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All transaction tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Open admin.html in your browser');
    console.log('3. Go to the "Manage Transactions" section');
    console.log('4. Try creating, editing, and deleting transactions');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testTransactions(); 