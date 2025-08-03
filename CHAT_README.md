# Real-Time Chat System for Frosst Bank

This implementation adds comprehensive real-time chat functionality to the Frosst Bank application, allowing users to communicate with administrators in real-time.

## Features

### ✅ Real-Time Messaging
- Instant message delivery between users and admins
- Message persistence using PostgreSQL
- Timestamp tracking for all messages

### ✅ User Management
- User registration and authentication
- Role-based access (user/admin)
- Connection status tracking

### ✅ Admin Interface
- Real-time user list with connection status
- Individual chat sessions with users
- Typing indicators
- Message history per user

### ✅ User Interface
- Floating chat widget on dashboard
- Connection status indicator
- Typing indicators
- Message timestamps

### ✅ Advanced Features
- Typing indicators for both users and admins
- Connection status monitoring
- Automatic reconnection handling
- Message delivery confirmation

## File Structure

```
backend/
├── chatSocket.js          # Socket.io chat logic
├── db.js                  # PostgreSQL database connection
├── models/
│   └── Message.js         # PostgreSQL message model
├── migrations/
│   └── create_messages_table.js  # Database migration
├── server.js              # Main server with socket integration
└── package.json           # Dependencies

frontend/
├── admin.html             # Admin dashboard with chat
├── admin.js               # Admin chat functionality
├── dashboard.html         # User dashboard with chat
├── dashboard.js           # User chat functionality
├── dashboard.css          # Chat styling
└── chat-test.html         # Test page for chat functionality
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
Ensure PostgreSQL is running and accessible. The Message model uses PostgreSQL for message persistence.

### 3. Run Migration
```bash
cd backend
npm run migrate
```

This will create the messages table in your PostgreSQL database.

### 4. Start the Server
```bash
cd backend
npm start
```

The server will run on `https://cursor-of-jswork-copy-backend.onrender.com`

### 5. Test the Chat System

#### For Users:
1. Open `frontend/dashboard.html` in a browser
2. The chat widget will appear in the bottom-right corner
3. Click the chat header to open the chat interface
4. Type messages and press Enter to send

#### For Admins:
1. Open `frontend/admin.html` in a browser
2. Navigate to the "Live Chat" section
3. Select a user from the "Connected Users" list
4. Type messages and click "Send" to reply

#### For Testing:
1. Open `frontend/chat-test.html` in a browser
2. This provides a standalone chat interface for testing

## API Endpoints

### Socket Events

#### User Events:
- `register` - Register user with role and ID
- `user-message` - Send message to admin
- `typing` - Send typing indicator
- `join` - Join user's personal room

#### Admin Events:
- `admin-reply` - Send reply to specific user
- `admin-message` - Broadcast message to all users
- `admin-typing` - Send typing indicator to user

#### System Events:
- `connect` - Socket connection established
- `disconnect` - Socket disconnection
- `chatNotification` - Notify admin of new chat session

## Message Flow

1. **User Registration**: When a user connects, they register with their role and ID
2. **Message Sending**: Users send messages via `user-message` event
3. **Admin Reception**: Admin receives messages via `new-message` event
4. **Admin Reply**: Admin sends replies via `admin-reply` event
5. **User Reception**: User receives admin replies via `admin-reply` event

## Features in Detail

### Connection Management
- Automatic user tracking with socket IDs
- Real-time connection status updates
- Graceful disconnection handling

### Message Persistence
- Messages stored in PostgreSQL using Knex
- Message schema includes sender, recipient, content, and timestamp
- Automatic message saving on send

### Typing Indicators
- Real-time typing status for both users and admins
- Debounced typing events (1-second delay)
- Visual indicators in chat interface

### Admin Interface
- Live user list with connection status
- Individual chat sessions per user
- Message history tracking
- User selection for targeted replies

### User Interface
- Floating chat widget
- Connection status indicator
- Message timestamps
- Responsive design

## Security Considerations

- User authentication required for chat access
- Role-based access control (user/admin)
- Input validation and sanitization
- CORS configuration for cross-origin requests

## Troubleshooting

### Common Issues:

1. **Socket Connection Failed**
   - Ensure server is running on port 3100
   - Check CORS configuration
   - Verify Socket.io client version compatibility

2. **Messages Not Delivering**
   - Check MongoDB connection
   - Verify user registration
   - Check browser console for errors

3. **Admin Interface Not Working**
   - Ensure admin role is properly set
   - Check user list population
   - Verify socket event handlers

### Debug Mode:
Enable console logging by adding `console.log` statements in the socket event handlers.

## Future Enhancements

- File/image sharing
- Message encryption
- Chat history pagination
- Push notifications
- Mobile app integration
- Voice/video chat
- Chat analytics and reporting

## Dependencies

### Backend:
- `express`: Web framework
- `socket.io`: Real-time communication
- `knex`: SQL query builder
- `pg`: PostgreSQL client
- `cors`: Cross-origin resource sharing
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication

### Frontend:
- `socket.io-client`: Socket.io client library
- `tailwindcss`: CSS framework (for admin interface)

## Support

For issues or questions about the chat system, check the browser console for error messages and refer to the Socket.io documentation for advanced configuration options. 