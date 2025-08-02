// Test register route
const fetch = require('node-fetch');

async function testRegisterRoute() {
  try {
    console.log('🔍 Testing register route...');
    
    const testData = {
      name: 'Test User',
      username: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    };
    
    console.log('📤 Sending POST request to /register...');
    console.log('Request data:', testData);
    
    const response = await fetch('http://localhost:3100/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    
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

testRegisterRoute(); 