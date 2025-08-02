document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu functionality
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeSidebarBtn = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');

  // Toggle mobile menu
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
  });

  // Close mobile menu
  closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.add('-translate-x-full');
    }
  });

  const form = document.getElementById('create-user-form');
  const userTable = document.getElementById('userTable');
  const messageBox = document.getElementById('message-box');

  const API_BASE = 'http://localhost:3100';
  const socket = io('http://localhost:3100');

  // Register admin with socket
  socket.emit('register', {
    role: 'admin',
    userId: 'admin',
    name: 'Admin'
  });

  // Show success/error messages
  const showMessage = (msg, isError = false) => {
    messageBox.textContent = msg;
    messageBox.className = isError
      ? 'text-red-600 font-semibold mb-2'
      : 'text-green-600 font-semibold mb-2';
    setTimeout(() => {
      messageBox.textContent = '';
      messageBox.className = '';
    }, 4000);
  };

  // Validate form inputs
  const validateForm = () => {
    const fields = ['name', 'username', 'email', 'password', 'role'];
    let valid = true;
    fields.forEach((id) => {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        input.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        valid = false;
      } else {
        input.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
      }
    });
    
    // Validate email format
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        valid = false;
      }
    }
    
    return valid;
  };

  // Chat functionality
  let activeChats = new Map(); // Track active chat sessions
  let currentChatUser = null;

  // ✅ Update chat notification indicator
  const updateChatNotification = () => {
    const chatNotification = document.getElementById('chatNotification');
    if (!chatNotification) return;
    
    // Count total unread messages
    let totalUnread = 0;
    activeChats.forEach(chat => {
      if (chat.messages && chat.messages.length > 0) {
        totalUnread += chat.messages.length;
      }
    });
    
    if (totalUnread > 0) {
      chatNotification.textContent = totalUnread > 99 ? '99+' : totalUnread.toString();
      chatNotification.classList.remove('hidden');
    } else {
      chatNotification.classList.add('hidden');
    }
  };

  // Display chat messages in the chat window
  const addAdminChatMessage = (data, isFromUser = false) => {
    const chatBox = document.getElementById('admin-chat-messages');
    if (!chatBox) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = isFromUser 
      ? 'text-left text-green-700 mb-2' 
      : 'text-right text-blue-700 mb-2';
    
    const time = new Date().toLocaleTimeString();
    msgDiv.innerHTML = `
      <div class="inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${isFromUser ? 'bg-gray-100' : 'bg-blue-100'}">
        <div class="text-sm">${data.message}</div>
        <div class="text-xs text-gray-500 mt-1">${time}</div>
      </div>
    `;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  // Update connected users list
  const updateConnectedUsers = (users) => {
    const userListElement = document.getElementById('connected-users');
    if (!userListElement) return;

    userListElement.innerHTML = '';
    users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.className = 'p-2 border-b cursor-pointer hover:bg-gray-50';
      userDiv.setAttribute('data-user-id', user.userId);
      
      // ✅ Show message count and status
      const messageCount = user.messages ? user.messages.length : 0;
      const hasNewMessages = messageCount > 0;
      
      userDiv.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-medium">${user.name}</div>
            <div class="text-sm text-gray-500">ID: ${user.userId}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-green-500">● Online</div>
            ${hasNewMessages ? `<div class="text-xs bg-red-500 text-white rounded-full px-2 py-1 mt-1">${messageCount} msg</div>` : ''}
          </div>
        </div>
      `;
      userDiv.onclick = () => selectUserForChat(user);
      userListElement.appendChild(userDiv);
    });
  };

  // Select user for chat
  const selectUserForChat = (user) => {
    currentChatUser = user;
    const chatHeader = document.getElementById('chat-header');
    if (chatHeader) {
      chatHeader.textContent = `Chat with ${user.name}`;
    }
    
    // Clear chat messages
    const chatBox = document.getElementById('admin-chat-messages');
    if (chatBox) {
      chatBox.innerHTML = '';
      
      // ✅ Display all messages from this user
      if (user.messages && user.messages.length > 0) {
        user.messages.forEach(msg => {
          addAdminChatMessage(msg, true);
        });
      }
    }
    
    // ✅ Update UI to show selected user and clear message indicators
    document.querySelectorAll('.user-item').forEach(item => {
      item.classList.remove('bg-blue-100');
    });
    
    // Add selected styling
    const userElement = document.querySelector(`[data-user-id="${user.userId}"]`);
    if (userElement) {
      userElement.classList.add('bg-blue-100');
      
      // ✅ Clear message count indicator
      const messageIndicator = userElement.querySelector('.bg-red-500');
      if (messageIndicator) {
        messageIndicator.remove();
      }
    }
    
    // ✅ Clear messages from the user's chat history (they've been displayed)
    if (user.messages) {
      user.messages.length = 0;
    }
    
    // ✅ Update notification indicator
    updateChatNotification();
  };

  // Send admin chat message
  window.sendMessage = () => {
    const input = document.getElementById('admin-chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    if (!currentChatUser) {
      showMessage('Please select a user to chat with', true);
      return;
    }

    // Send message to specific user
    socket.emit('admin-reply', {
      userId: currentChatUser.userId,
      message: message
    });

    addAdminChatMessage({ message }, false);
    input.value = '';
  };

  // Handle Enter key in chat input
  const chatInput = document.getElementById('admin-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        window.sendMessage();
      }
    });
  }

  // Socket event handlers
  socket.on('connect', () => {
    console.log('✅ Admin connected to chat server');
    showMessage('Connected to chat server');
  });

  socket.on('disconnect', () => {
    console.log('❌ Admin disconnected from chat server');
    showMessage('Disconnected from chat server', true);
  });

  // Handle new messages from users
  socket.on('new-message', data => {
    console.log('📬 Message from user:', data);
    
    // Add to active chats
    if (!activeChats.has(data.userId)) {
      activeChats.set(data.userId, {
        userId: data.userId,
        name: data.from,
        messages: []
      });
    }
    
    const chat = activeChats.get(data.userId);
    chat.messages.push(data);
    
    // ✅ Always display the message in admin chat window
    addAdminChatMessage(data, true);
    
    // ✅ Show notification for new message
    showMessage(`New message from ${data.from}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`);
    
    // ✅ Update chat notification indicator
    updateChatNotification();
    
    // ✅ Update connected users list with notification
    updateConnectedUsers(Array.from(activeChats.values()));
    
    // ✅ Auto-select the user if no current chat is active
    if (!currentChatUser) {
      selectUserForChat(chat);
    }
  });

  // Handle user connections
  socket.on('user-connected', (user) => {
    console.log('👤 User connected:', user);
    activeChats.set(user.userId, {
      userId: user.userId,
      name: user.name,
      messages: []
    });
    updateConnectedUsers(Array.from(activeChats.values()));
    showMessage(`${user.name} connected`);
  });

  // Handle user disconnections
  socket.on('user-disconnected', (user) => {
    console.log('👤 User disconnected:', user);
    activeChats.delete(user.userId);
    updateConnectedUsers(Array.from(activeChats.values()));
    showMessage(`${user.name} disconnected`, true);
  });

  // Handle reply confirmations
  socket.on('reply-sent', (data) => {
    console.log('✅ Reply sent to user:', data);
  });

  // Handle reply errors
  socket.on('reply-error', (data) => {
    console.log('❌ Reply error:', data);
    showMessage(`Failed to send message: ${data.error}`, true);
  });

  // Handle typing indicators
  socket.on('user-typing', (data) => {
    if (currentChatUser && currentChatUser.userId === data.userId) {
      const typingIndicator = document.getElementById('typing-indicator');
      if (typingIndicator) {
        typingIndicator.textContent = data.isTyping ? `${data.userName} is typing...` : '';
      }
    }
  });

  // Create editable input field
  const createEditableInput = (value) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500';
    input.setAttribute('aria-label', 'Editable field');
    return input;
  };

  // Create editable row for a user
  const createUserRow = (user) => {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';

    // Photo column with profile picture
    const photoCell = document.createElement('td');
    photoCell.className = 'p-3';
    if (user.profile_picture) {
      photoCell.innerHTML = `<img src="http://localhost:3100${user.profile_picture}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover" />`;
    } else {
      const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      photoCell.innerHTML = `<div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">${initials}</div>`;
    }

    // Name column (editable)
    const nameCell = document.createElement('td');
    nameCell.className = 'p-3';
    const nameInput = createEditableInput(user.name);
    nameCell.appendChild(nameInput);

    // Email column (editable)
    const emailCell = document.createElement('td');
    emailCell.className = 'p-3';
    const emailInput = createEditableInput(user.email || user.username);
    emailCell.appendChild(emailInput);

    // Username column
    const usernameCell = document.createElement('td');
    usernameCell.className = 'p-3';
    usernameCell.textContent = user.username;

    // Account column
    const accountCell = document.createElement('td');
    accountCell.className = 'p-3';
    accountCell.textContent = user.account_number || 'N/A';

    // Balance column (editable)
    const balanceCell = document.createElement('td');
    balanceCell.className = 'p-3';
    const balanceInput = createEditableInput(user.account_balance || '0.00');
    balanceInput.type = 'number';
    balanceInput.step = '0.01';
    balanceCell.appendChild(balanceInput);

    // Actions column
    const actionsCell = document.createElement('td');
    actionsCell.className = 'p-3';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2';
    saveBtn.onclick = () => updateUser(user.id, nameInput.value, emailInput.value, user.role, balanceInput.value);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700';
    deleteBtn.onclick = () => deleteUser(user.id);

    actionsCell.appendChild(saveBtn);
    actionsCell.appendChild(deleteBtn);

    row.append(photoCell, nameCell, emailCell, usernameCell, accountCell, balanceCell, actionsCell);
    userTable.appendChild(row);
  };

  // Update user in DB
  const updateUser = async (id, name, username, role, balance) => {
    try {
      // Update user info
      const userResponse = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, role })
      });

      // Update balance
      const balanceResponse = await fetch(`${API_BASE}/users/${id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_balance: parseFloat(balance) })
      });

      if (userResponse.ok && balanceResponse.ok) {
        showMessage('User updated successfully');
        fetchUsers();
      } else {
        showMessage('Failed to update user', true);
      }
    } catch (error) {
      console.error('Update error:', error);
      showMessage('Error updating user', true);
    }
  };

  // Delete user from DB
  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('User deleted successfully');
        fetchUsers();
      } else {
        showMessage('Failed to delete user', true);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('Error deleting user', true);
    }
  };

  // Fetch users from DB
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const users = await response.json();
      
      userTable.innerHTML = '';
      users.forEach(createUserRow);
      
      // Update statistics
      updateUserStatistics(users);
    } catch (error) {
      console.error('Fetch error:', error);
      showMessage('Error fetching users', true);
    }
  };

  // Update user statistics
  const updateUserStatistics = (users) => {
    const totalUsers = users.length;
    const totalBalance = users.reduce((sum, user) => sum + (parseFloat(user.account_balance) || 0), 0);
    const avgBalance = totalUsers > 0 ? totalBalance / totalUsers : 0;
    const highBalanceUsers = users.filter(user => (parseFloat(user.account_balance) || 0) > 10000).length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
    document.getElementById('avgBalance').textContent = `$${avgBalance.toFixed(2)}`;
    document.getElementById('highBalanceUsers').textContent = highBalanceUsers;
  };

  // Profile picture upload functionality
  const uploadBtn = document.getElementById('uploadBtn');
  const profilePicture = document.getElementById('profilePicture');
  const profilePreview = document.getElementById('profilePreview');
  const previewImage = document.getElementById('previewImage');
  const removePhoto = document.getElementById('removePhoto');
  let selectedFile = null;

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      profilePicture.click();
    });
  }

  if (profilePicture) {
    profilePicture.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          showMessage('File size must be less than 5MB', true);
          return;
        }
        
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          profilePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePhoto) {
    removePhoto.addEventListener('click', () => {
      selectedFile = null;
      profilePicture.value = '';
      profilePreview.classList.add('hidden');
      previewImage.src = '';
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
        
      if (!validateForm()) {
        showMessage('Please fill in all fields', true);
        return;
      }

      const formData = new FormData();
      formData.append('name', document.getElementById('name').value.trim());
      formData.append('username', document.getElementById('username').value.trim());
      formData.append('email', document.getElementById('email').value.trim());
      formData.append('password', document.getElementById('password').value.trim());
      formData.append('role', document.getElementById('role').value);
      
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      try {
        const response = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          body: formData // Send as FormData for file upload
        });

        if (response.ok) {
          showMessage('User created successfully');
          form.reset();
          selectedFile = null;
          if (profilePreview) profilePreview.classList.add('hidden');
          if (previewImage) previewImage.src = '';
          fetchUsers();
        } else {
          const error = await response.json();
          showMessage(error.error || 'Failed to create user', true);
        }
      } catch (error) {
        console.error('Create error:', error);
        showMessage('Error creating user', true);
      }
    });
  }

  // Initialize
  fetchUsers();

  // Logout function
  function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/login.html';
  }

  // Make logout available globally
  window.logout = logout;

  // Add missing functions referenced in HTML
  window.filterUsers = () => {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const rows = userTable.querySelectorAll('tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  };

  window.sortUsers = () => {
    const sortBy = document.getElementById('sortUsers').value;
    const rows = Array.from(userTable.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'name':
          aValue = a.cells[1]?.textContent || '';
          bValue = b.cells[1]?.textContent || '';
          break;
        case 'balance':
          aValue = parseFloat(a.cells[4]?.textContent?.replace(/[^0-9.-]/g, '') || 0);
          bValue = parseFloat(b.cells[4]?.textContent?.replace(/[^0-9.-]/g, '') || 0);
          break;
        case 'account':
          aValue = a.cells[3]?.textContent || '';
          bValue = b.cells[3]?.textContent || '';
          break;
        default:
          return 0;
  }

      return aValue > bValue ? 1 : -1;
    });
    
    rows.forEach(row => userTable.appendChild(row));
  };

  window.exportUsers = () => {
    const rows = userTable.querySelectorAll('tr');
    let csv = 'Name,Email,Account,Balance\n';
    
    rows.forEach(row => {
      const name = row.cells[1]?.textContent || '';
      const email = row.cells[2]?.textContent || '';
      const account = row.cells[3]?.textContent || '';
      const balance = row.cells[4]?.textContent || '';
      csv += `${name},${email},${account},${balance}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  window.approveTransfer = (id) => {
    showMessage(`Transfer ${id} approved`);
  };

  window.rejectTransfer = (id) => {
    showMessage(`Transfer ${id} rejected`);
  };

  // Transaction Management Functions
  let transactions = [];

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      if (response.ok) {
        transactions = await response.json();
        renderTransactions();
        updateTransactionStats();
      } else {
        showMessage('Failed to fetch transactions', true);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('Error fetching transactions', true);
    }
  };

  // Render transactions in the table
  const renderTransactions = () => {
    const txTable = document.getElementById('txTable');
    if (!txTable) return;

    txTable.innerHTML = '';
    
    if (transactions.length === 0) {
      document.getElementById('noTxMessage').classList.remove('hidden');
      return;
    }

    document.getElementById('noTxMessage').classList.add('hidden');

    transactions.forEach(transaction => {
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      
      row.innerHTML = `
        <td class="p-2">${transaction.user_account || 'N/A'}</td>
        <td class="p-2">${transaction.date}</td>
        <td class="p-2">${transaction.time}</td>
        <td class="p-2">${transaction.description}</td>
        <td class="p-2">${transaction.category}</td>
        <td class="p-2">$${parseFloat(transaction.amount).toFixed(2)}</td>
        <td class="p-2">
          <span class="px-2 py-1 rounded text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
            ${transaction.status}
          </span>
        </td>
        <td class="p-2">
          <button onclick="editTransaction(${transaction.id})" class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
          <button onclick="deleteTransaction(${transaction.id})" class="text-red-600 hover:text-red-800">Delete</button>
        </td>
      `;
      
      txTable.appendChild(row);
    });
  };

  // Update transaction statistics
  const updateTransactionStats = () => {
    const total = transactions.length;
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const pending = transactions.filter(tx => tx.status === 'pending').length;
    const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // You can add these stats to the UI if needed
    console.log(`Transactions: ${total} total, ${completed} completed, ${pending} pending, $${totalAmount.toFixed(2)} total amount`);
  };

  // Create new transaction
  const createTransaction = async (transactionData) => {
    try {
      console.log('Sending transaction data to server:', transactionData); // Debug log
      console.log('API_BASE:', API_BASE); // Debug log
      
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const newTransaction = await response.json();
        console.log('New transaction created:', newTransaction); // Debug log
        transactions.unshift(newTransaction);
        renderTransactions();
        updateTransactionStats();
        showMessage('Transaction created successfully');
        return true;
      } else {
        const error = await response.json();
        console.error('Server error:', error); // Debug log
        showMessage(error.error || 'Failed to create transaction', true);
        return false;
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      showMessage('Error creating transaction', true);
      return false;
    }
  };

  // Edit transaction
  window.editTransaction = async (id) => {
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) return;

    // For now, we'll use a simple prompt approach
    // You can enhance this with a modal form
    const newAmount = prompt('Enter new amount:', transaction.amount);
    if (newAmount === null) return;

    try {
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(newAmount) })
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        const index = transactions.findIndex(tx => tx.id === id);
        if (index !== -1) {
          transactions[index] = updatedTransaction;
          renderTransactions();
          updateTransactionStats();
        }
        showMessage('Transaction updated successfully');
      } else {
        const error = await response.json();
        showMessage(error.error || 'Failed to update transaction', true);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage('Error updating transaction', true);
    }
  };

  // Delete transaction
  window.deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        transactions = transactions.filter(tx => tx.id !== id);
        renderTransactions();
        updateTransactionStats();
        showMessage('Transaction deleted successfully');
      } else {
        const error = await response.json();
        showMessage(error.error || 'Failed to delete transaction', true);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showMessage('Error deleting transaction', true);
    }
  };

  // Filter transactions
  window.filterTransactions = () => {
    const searchTerm = document.getElementById('txSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#txTable tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  };

  // Export transactions
  window.exportTransactions = () => {
    let csv = 'Account,Date,Time,Description,Category,Amount,Status\n';
    
    transactions.forEach(transaction => {
      csv += `${transaction.user_account || 'N/A'},${transaction.date},${transaction.time},${transaction.description},${transaction.category},${transaction.amount},${transaction.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle transaction form submission
  const addTransactionForm = document.getElementById('addTransactionForm');
  console.log('Transaction form found:', addTransactionForm); // Debug log
  
  if (addTransactionForm) {
    addTransactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Transaction form submitted'); // Debug log
      
      const transactionData = {
        user_account: document.getElementById('txUserAccount').value.trim(),
        date: document.getElementById('txDate').value,
        time: document.getElementById('txTime').value,
        description: document.getElementById('txDescription').value.trim(),
        category: document.getElementById('txCategory').value.trim(),
        amount: parseFloat(document.getElementById('txAmount').value),
        status: document.getElementById('txStatus').value
      };

      console.log('Transaction data:', transactionData); // Debug log

      // Validate required fields
      if (!transactionData.user_account || !transactionData.date || !transactionData.time || 
          !transactionData.description || !transactionData.category || !transactionData.amount) {
        showMessage('Please fill in all required fields', true);
        console.log('Validation failed'); // Debug log
        return;
      }

      console.log('Validation passed, creating transaction...'); // Debug log
      const success = await createTransaction(transactionData);
      if (success) {
        addTransactionForm.reset();
        console.log('Transaction created successfully'); // Debug log
      }
    });
  } else {
    console.error('Transaction form not found!'); // Debug log
  }

  // Initialize transactions
  fetchTransactions();
});
