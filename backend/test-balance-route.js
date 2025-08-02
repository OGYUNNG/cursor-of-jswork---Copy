// Test balance update route
const fetch = require('node-fetch');

async function testBalanceRoute() {
  try {
    console.log('🔍 Testing balance update route...');
    
    const testData = {
      account_balance: 50000.00
    };
    
    console.log('📤 Sending PUT request to /users/1/balance...');
    console.log('Request data:', testData);
    
    const response = await fetch('http://localhost:3100/users/1/balance', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testBalanceRoute(); 