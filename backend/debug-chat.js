const io = require('socket.io-client');

console.log('🔍 Testing Chat Server Connection...\n');

// Test Socket.io connection
const socket = io('https://cursor-of-jswork-copy-backend.onrender.com');

socket.on('connect', () => {
  console.log('✅ Successfully connected to chat server');
  console.log('   Socket ID:', socket.id);
  
  // Test user registration
  socket.emit('register', {
    role: 'user',
    userId: 'test-user-123',
    name: 'Test User'
  });
  
  console.log('✅ User registration sent');
  
  // Test message sending
  setTimeout(() => {
    socket.emit('user-message', {
      message: 'Hello from debug script!',
      userId: 'test-user-123',
      userName: 'Test User',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Test message sent');
  }, 1000);
  
  // Disconnect after 3 seconds
  setTimeout(() => {
    console.log('🔌 Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 3000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from chat server');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

// Listen for admin replies
socket.on('admin-reply', (data) => {
  console.log('📨 Received admin reply:', data);
});

// Listen for admin notifications
socket.on('admin-notified', (data) => {
  console.log('📢 Admin notification:', data);
});

console.log('⏳ Attempting to connect...'); 