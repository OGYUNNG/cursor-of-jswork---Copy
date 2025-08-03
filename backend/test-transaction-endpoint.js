// Quick test for transaction endpoint
const fetch = require('node-fetch');

async function testTransactionEndpoint() {
  try {
    console.log('🧪 Testing transaction endpoint...\n');

    // Test GET /transactions
    console.log('1. Testing GET /transactions...');
    const getResponse = await fetch('https://cursor-of-jswork-copy-backend.onrender.com/transactions');
    console.log('Status:', getResponse.status);
    
    if (getResponse.ok) {
      const transactions = await getResponse.json();
      console.log('✅ GET /transactions working');
      console.log(`Found ${transactions.length} transactions`);
    } else {
      console.log('❌ GET /transactions failed');
      const error = await getResponse.text();
      console.log('Error:', error);
    }

    // Test POST /transactions
    console.log('\n2. Testing POST /transactions...');
    const testTransaction = {
      user_account: 'ACC12345678',
      date: '2024-01-15',
      time: '14:30:00',
      description: 'Test transaction',
      category: 'Test',
      amount: 100.00,
      status: 'completed'
    };

    const postResponse = await fetch('https://cursor-of-jswork-copy-backend.onrender.com/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTransaction)
    });

    console.log('Status:', postResponse.status);
    
    if (postResponse.ok) {
      const newTransaction = await postResponse.json();
      console.log('✅ POST /transactions working');
      console.log('Created transaction:', newTransaction);
    } else {
      console.log('❌ POST /transactions failed');
      const error = await postResponse.text();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the server is running on port 3100');
  }
}

testTransactionEndpoint(); 