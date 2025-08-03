let currentUser;

// Check if user is authenticated (without JWT)
function checkAuth() {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    window.location.href = 'login.html';
    return null;
  }
  return true; // Just return true if user info exists
}

// Get user info from localStorage
function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(userInfo);
}

// Initialize Socket.io connection
const socket = io('https://cursor-of-jswork-copy-backend.onrender.com'); // ✅ Ensure backend is running on this port

// Get and store current user info
currentUser = getUserInfo();
if (currentUser) {
  socket.emit('register', {
    role: 'user',
    userId: currentUser._id || currentUser.id,
    name: currentUser.name,
  });
}

// DOM references
const chatBox = document.getElementById("chat-box");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");

// Socket connection status
socket.on('connect', () => {
  console.log('✅ Connected to chat server');
  updateChatStatus('connected');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from chat server');
  updateChatStatus('disconnected');
});

// Handle incoming messages from admin
socket.on('admin-reply', data => {
  if (data && data.message) {
    addMessage(data.message, "admin");
  }
});

// Handle admin typing indicator
socket.on('admin-typing', data => {
  showTypingIndicator(data.isTyping);
});

// Send message when Enter is pressed or send button is clicked
function handleChat(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Send message function
function sendMessage() {
    const message = chatInput.value.trim();
    if (message === "") return;

    addMessage(message, "user");

    // Send message to server for admin
    socket.emit('user-message', {
      message: message,
    userId: currentUser._id || currentUser.id,
    userName: currentUser.name,
      timestamp: new Date().toISOString()
    });

    chatInput.value = "";
  }

// Add click event for send button
document.addEventListener('DOMContentLoaded', function() {
  const sendButton = document.querySelector('.chat-send-btn');
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }
});

// Append message to chat box
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  
  const time = new Date().toLocaleTimeString();
  
  if (sender === "user") {
    msg.innerHTML = `
      <div class="message user">
        <div class="message-content">
          <div class="message-text">${text}</div>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;
  } else {
    msg.innerHTML = `
      <div class="bot-message">
        <div class="message-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          <div class="message-text">${text}</div>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;
  }
  
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update chat status
function updateChatStatus(status) {
  const statusElement = document.getElementById('chat-status');
  if (statusElement) {
    statusElement.textContent = status === 'connected' ? '🟢 Online' : '🔴 Offline';
  }
}

// Show typing indicator
function showTypingIndicator(isTyping) {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.style.display = isTyping ? 'block' : 'none';
    if (isTyping) {
      typingIndicator.textContent = 'Admin is typing...';
    } else {
      typingIndicator.textContent = '';
    }
  }
}

// Send typing indicator to admin
function sendTypingIndicator(isTyping) {
  socket.emit('typing', {
    userId: currentUser._id || currentUser.id,
    isTyping: isTyping
  });
}

// Toggle chat visibility
function toggleChat() {
  const chatContainer = document.querySelector('.chat-container');
  const chatBox = document.getElementById('chat-box');
  const toggleIcon = document.getElementById('chat-toggle-icon');
  
  if (chatContainer && chatBox) {
    const isOpen = chatBox.style.display !== 'none';
    
    if (isOpen) {
      chatBox.style.display = 'none';
      if (toggleIcon) {
        toggleIcon.className = 'fas fa-chevron-up';
      }
    } else {
      chatBox.style.display = 'flex';
      if (toggleIcon) {
        toggleIcon.className = 'fas fa-chevron-down';
      }
      
      // ✅ Add welcome message to encourage user to start chat
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages && chatMessages.children.length <= 1) {
        addMessage("Hi! I'd like to chat with an admin. How can you help me today?", "user");
        
        // Send the initial message to admin
        socket.emit('user-message', {
          message: "Hi! I'd like to chat with an admin. How can you help me today?",
          userId: currentUser._id || currentUser.id,
          userName: currentUser.name,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}
window.toggleChat = toggleChat; // ✅ Make available to inline HTML

// Notify admin that user opened chat
function notifyAdminOfDashboardChat() {
  if (!currentUser) return;

  socket.emit('chatNotification', {
    type: 'dashboard',
    userId: currentUser._id || currentUser.id,
    userName: currentUser.name,
    userAccount: currentUser.account,
    timestamp: new Date().toISOString()
  });
}

// Add typing event listeners
if (chatInput) {
  let typingTimer;
  
  chatInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    sendTypingIndicator(true);
    
    typingTimer = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  });
}

// Fetch user data from PostgreSQL database
async function fetchUserData() {
  try {
    const response = await fetch(`https://cursor-of-jswork-copy-backend.onrender.com/users/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      return userData;
    } else {
      console.error('Failed to fetch user data:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

// Render user profile with database data
async function renderUserProfile() {
  if (!currentUser) return;
  
  try {
    // Fetch fresh user data from database
    const userData = await fetchUserData();
    if (userData) {
      // Update currentUser with fresh data
      currentUser = { ...currentUser, ...userData };
    }
    
    // Update profile picture
    const profilePic = document.getElementById('userProfilePic');
    if (profilePic && currentUser.profile_picture) {
      profilePic.src = `https://cursor-of-jswork-copy-backend.onrender.com${currentUser.profile_picture}`;
    } else if (profilePic) {
      // Use first letter of name as fallback
      const initials = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
      profilePic.src = `https://via.placeholder.com/40/667eea/ffffff?text=${initials}`;
    }
    
    // Update user name
    const userName = document.getElementById('userName');
    if (userName) {
      userName.textContent = currentUser.name || 'User';
    }
    
    // Update account number
    const userAccount = document.getElementById('userAccount');
    if (userAccount) {
      userAccount.textContent = `Account: ${currentUser.account_number || 'N/A'}`;
    }
    
    // Update account balance
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
      const balance = currentUser.account_balance || 0;
      userBalance.textContent = formatCurrency(balance);
    }
    
    // Update welcome title
    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) {
      const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'User';
      welcomeTitle.textContent = `Welcome back, ${firstName}! 👋`;
    }
    
    console.log('✅ User profile updated with database data');
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
  }
}

// Refresh balance periodically
function refreshBalance() {
  setInterval(async () => {
    try {
      await renderUserProfile();
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
    }
  }, 30000); // Refresh every 30 seconds
}

// Fallback for unavailable loan
function loanUnavailable() {
  alert("🚫 Loan service is not available at the moment. Please try again later.");
}
window.loanUnavailable = loanUnavailable; // ✅ Expose to HTML

// API Helper (simplified without JWT)
async function apiCall(endpoint, options = {}) {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    window.location.href = 'login.html';
    return null;
  }

  const response = await fetch(`https://cursor-of-jswork-copy-backend.onrender.com/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (response.status === 401) {
    localStorage.removeItem('userInfo');
    window.location.href = 'login.html';
    return null;
  }

  return response.json();
}

// On page load
document.addEventListener('DOMContentLoaded', async function () {
  await renderUserProfile();
  refreshBalance();
});
