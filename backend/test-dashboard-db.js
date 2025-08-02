const fetch = require('node-fetch');

async function testDashboardDatabase() {
  console.log('🧪 Testing Dashboard Database Connection...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing Server Connection...');
    const serverResponse = await fetch('http://localhost:3100/users');
    
    if (serverResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding:', serverResponse.status);
      return;
    }

    // Test 2: Get all users to see what's in the database
    console.log('\n2️⃣ Testing Database Users...');
    const usersResponse = await fetch('http://localhost:3100/users');
    const users = await usersResponse.json();
    
    console.log(`✅ Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('   Sample user data:');
      users.forEach((user, index) => {
        console.log(`   User ${index + 1}:`);
        console.log(`     ID: ${user.id}`);
        console.log(`     Name: ${user.name}`);
        console.log(`     Username: ${user.username}`);
        console.log(`     Account Number: ${user.account_number || 'N/A'}`);
        console.log(`     Balance: $${user.account_balance || 0}`);
        console.log(`     Profile Picture: ${user.profile_picture || 'None'}`);
        console.log('');
      });

      // Test 3: Test individual user fetch (dashboard functionality)
      const testUserId = users[0].id;
      console.log(`3️⃣ Testing Dashboard User Fetch (User ID: ${testUserId})...`);
      
      const userResponse = await fetch(`http://localhost:3100/users/${testUserId}`);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ User data fetched successfully for dashboard');
        console.log('   Dashboard Data:');
        console.log(`     Name: ${userData.name}`);
        console.log(`     Account Number: ${userData.account_number || 'N/A'}`);
        console.log(`     Balance: $${userData.account_balance || 0}`);
        console.log(`     Profile Picture: ${userData.profile_picture || 'None'}`);
      } else {
        console.log('❌ Failed to fetch user data:', userResponse.status);
        const errorData = await userResponse.json();
        console.log('   Error:', errorData.error);
      }
    } else {
      console.log('⚠️ No users found in database');
      console.log('   You may need to create a test user first');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDashboardDatabase(); 