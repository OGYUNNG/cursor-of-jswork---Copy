// --- Mobile Menu Toggle ---
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.classList.toggle('active');
  document.body.classList.toggle('no-scroll');
});

// --- Close Menu on Nav Link Click ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
});

// --- Scroll to Top Button ---
const scrollBtn = document.getElementById('scrollToTopBtn');
window.onscroll = () => {
  if (scrollBtn) {
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }
};

if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Image Gallery Lightbox (Optional Enhancement) ---
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    const src = img.getAttribute('src');
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <img src="${src}" alt="Full View" />
      </div>
    `;
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
      document.body.classList.remove('no-scroll');
    });
  });
});

// --- Floating Chat Functionality ---
const floatingChatBtn = document.getElementById('floatingChatBtn');
const floatingChatWidget = document.getElementById('floatingChatWidget');
const chatWidgetClose = document.getElementById('chatWidgetClose');
const chatWidgetInput = document.getElementById('chatWidgetInput');
const chatWidgetSend = document.getElementById('chatWidgetSend');
const chatWidgetMessages = document.getElementById('chatWidgetMessages');

// Initialize Socket.io connection for chat
let socket;
try {
  socket = io('https://cursor-of-jswork-copy-backend.onrender.com');
  
  socket.on('connect', () => {
    console.log('✅ Connected to chat server');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Disconnected from chat server');
  });
  
  // Handle admin replies
  socket.on('admin-reply', (data) => {
    if (data && data.message) {
      addChatMessage(data.message, 'bot');
    }
  });
  
  // Handle admin typing indicator
  socket.on('admin-typing', (data) => {
    showTypingIndicator(data.isTyping);
  });
} catch (error) {
  console.log('Chat server not available');
}

// Toggle chat widget
if (floatingChatBtn) {
  floatingChatBtn.addEventListener('click', () => {
    floatingChatWidget.style.display = 'flex';
    floatingChatBtn.style.display = 'none';
    chatWidgetInput.focus();
    
    // Register user for chat if not already registered
    if (socket) {
      socket.emit('register', {
        role: 'user',
        userId: 'guest-' + Date.now(),
        name: 'Guest User'
      });
    }
    
    // ✅ Add welcome message to encourage user to start chat
    const existingMessages = chatWidgetMessages.querySelectorAll('.chat-widget-message');
    if (existingMessages.length === 0) {
      addChatMessage("Hi there! 👋 I'm here to help. Feel free to ask me anything or start a conversation with our admin team!", 'bot');
    }
    
    // Show typing indicator briefly to indicate chat is ready
    setTimeout(() => {
      showTypingIndicator(true);
      setTimeout(() => {
        showTypingIndicator(false);
      }, 1000);
    }, 500);
  });
}

// Close chat widget
if (chatWidgetClose) {
  chatWidgetClose.addEventListener('click', () => {
    floatingChatWidget.style.display = 'none';
    floatingChatBtn.style.display = 'flex';
  });
}

// Send message
function sendChatMessage() {
  const message = chatWidgetInput.value.trim();
  if (message === '') return;
  
  // Add user message to chat
  addChatMessage(message, 'user');
  
  // Clear input immediately for better UX
  chatWidgetInput.value = '';
  
  // Show "message sent" indicator
  showMessageStatus('Message sent');
  
  // Send to server
  if (socket) {
    socket.emit('user-message', {
      message: message,
      userId: 'guest-' + Date.now(),
      userName: 'Guest User',
      timestamp: new Date().toISOString()
    });
    
    // ✅ Show immediate feedback that admin has been notified
    setTimeout(() => {
      addChatMessage("Thanks! I've notified our admin team. They'll respond shortly.", 'bot');
    }, 1000);
    
    // Show typing indicator to indicate admin is processing
    setTimeout(() => {
      showTypingIndicator(true);
    }, 2000);
  } else {
    // If no socket connection, show offline message
    setTimeout(() => {
      addChatMessage('Sorry, chat is currently unavailable. Please try again later.', 'bot');
    }, 1000);
  }
}

// Add message to chat
function addChatMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-widget-message ${sender}`;
  
  const time = new Date().toLocaleTimeString();
  
  if (sender === 'user') {
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-user"></i>
      </div>
      <div class="message-content">
        <div class="message-text">${text}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="message-text">${text}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
  }
  
  chatWidgetMessages.appendChild(messageDiv);
  chatWidgetMessages.scrollTop = chatWidgetMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator(isTyping) {
  // Remove existing typing indicator
  const existingIndicator = chatWidgetMessages.querySelector('.typing-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  if (isTyping) {
    const indicator = document.createElement('div');
    indicator.className = 'chat-widget-message bot typing-indicator';
    indicator.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="message-text">Admin is typing...</div>
      </div>
    `;
    chatWidgetMessages.appendChild(indicator);
    chatWidgetMessages.scrollTop = chatWidgetMessages.scrollHeight;
  }
}

// Show message status (sent, delivered, etc.)
function showMessageStatus(status) {
  const statusDiv = document.createElement('div');
  statusDiv.className = 'message-status';
  statusDiv.innerHTML = `
    <div class="status-text">${status}</div>
  `;
  
  // Add to the last user message
  const lastUserMessage = chatWidgetMessages.querySelector('.chat-widget-message.user:last-child');
  if (lastUserMessage) {
    const messageContent = lastUserMessage.querySelector('.message-content');
    if (messageContent) {
      messageContent.appendChild(statusDiv);
      
      // Remove status after 3 seconds
      setTimeout(() => {
        if (statusDiv.parentNode) {
          statusDiv.remove();
        }
      }, 3000);
    }
  }
}

// Event listeners for chat
if (chatWidgetSend) {
  chatWidgetSend.addEventListener('click', sendChatMessage);
}

if (chatWidgetInput) {
  chatWidgetInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
}
