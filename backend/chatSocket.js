const Message = require('./models/Message');

module.exports = (io) => {
  // Track connected users and their socket IDs
  const connectedUsers = new Map();
  let adminSocket = null;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user registration and room joining
    socket.on('register', (data) => {
      const { role, userId, name } = data;
      
      if (role === 'admin') {
        adminSocket = socket;
        socket.join('admin');
        console.log('🧑‍💼 Admin registered:', socket.id);
      } else {
        // Store user connection info
        connectedUsers.set(userId, {
          socketId: socket.id,
          name: name || 'User',
          role: 'user'
        });
        
        socket.join(userId);
        console.log(`👤 User ${name} (${userId}) joined room ${userId}`);
        
        // Notify admin of new user connection
        if (adminSocket) {
          adminSocket.emit('user-connected', {
            userId,
            name: name || 'User',
            socketId: socket.id
          });
        }
      }
    });

    // Handle user joining their room
    socket.on('join', ({ userId }) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });

    // Handle chat messages
    socket.on('message', async (msg) => {
      try {
        const message = await Message.create({
          from: msg.from,
          to: msg.to,
          content: msg.content,
          timestamp: msg.timestamp
        });
        
        // Emit message to recipient
        io.to(msg.to).emit('message', message);
        console.log(`Message sent from ${msg.from} to ${msg.to}`);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle user messages to admin
    socket.on('user-message', async (data) => {
      const { message, userId, userName, timestamp } = data;
      
      try {
        // Save message to database
        const savedMessage = await Message.create({
          from: userId,
          to: 'admin',
          content: message,
          timestamp: timestamp || new Date().toISOString()
        });
        
        // Notify admin of new message
        if (adminSocket) {
          adminSocket.emit('new-message', {
            from: userName || 'User',
            message: message,
            userId: userId,
            userSocketId: socket.id,
            timestamp: timestamp || new Date().toISOString(),
            messageId: savedMessage.id
          });
        }
        
        console.log(`User message saved and forwarded to admin: ${message}`);
      } catch (error) {
        console.error('Error handling user message:', error);
        socket.emit('message-error', {
          error: 'Failed to send message. Please try again.'
        });
      }
    });

    // Handle admin replies to users
    socket.on('admin-reply', ({ userId, message }) => {
      const userInfo = connectedUsers.get(userId);
      
      if (userInfo) {
        // Send message to specific user
        io.to(userInfo.socketId).emit('admin-reply', { 
          message,
          timestamp: new Date().toISOString()
        });
        
        // Confirm to admin that message was sent
        socket.emit('reply-sent', { userId, message });
        
        console.log(`Admin reply sent to user ${userId}: ${message}`);
      } else {
        console.log(`User ${userId} not found or disconnected`);
        socket.emit('reply-error', { userId, error: 'User not found or disconnected' });
      }
    });

    // Handle admin messages (for admin chat interface)
    socket.on('admin-message', (data) => {
      const { message, from } = data;
      
      // Broadcast admin message to all connected users
      io.emit('admin-message', {
        from: 'admin',
        message: message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Admin message broadcast: ${message}`);
    });

    // Handle chat notifications (new chat sessions)
    socket.on('chatNotification', (notification) => {
      // Broadcast to admin room
      io.to('admin').emit('chatNotification', notification);
      console.log('Chat notification sent to admin:', notification);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { userId, isTyping } = data;
      
      if (adminSocket) {
        adminSocket.emit('user-typing', {
          userId,
          isTyping,
          userName: connectedUsers.get(userId)?.name || 'User'
        });
      }
    });

    // Handle admin typing indicator
    socket.on('admin-typing', (data) => {
      const { userId, isTyping } = data;
      const userInfo = connectedUsers.get(userId);
      
      if (userInfo) {
        io.to(userInfo.socketId).emit('admin-typing', { isTyping });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove user from tracking
      for (const [userId, userInfo] of connectedUsers.entries()) {
        if (userInfo.socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userInfo.name} (${userId}) disconnected`);
          
          // Notify admin of user disconnection
          if (adminSocket) {
            adminSocket.emit('user-disconnected', {
              userId,
              name: userInfo.name
            });
          }
          break;
        }
      }
      
      // Handle admin disconnection
      if (socket === adminSocket) {
        console.log('❌ Admin disconnected');
        adminSocket = null;
      }
    });
  });
}; 