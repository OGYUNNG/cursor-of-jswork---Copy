// Socket.io connection
let socket;
let currentUser;
let userAccounts = [];
let userBalance = 0;

// API Base URL
const API_BASE = 'https://cursor-of-jswork-copy-backend.onrender.com';

// Initialize Socket.io connection
function initializeSocket() {
  // Get user info from localStorage (set during login)
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    console.log('No user info found, using fallback chat');
    return;
  }

  currentUser = JSON.parse(userInfo);
  
  // Connect to Socket.io server
  socket = io('https://cursor-of-jswork-copy-backend.onrender.com', {
    auth: {
      token: localStorage.getItem('jwtToken')
    }
  });

  // Register user with socket
  socket.emit('register', {
    role: 'user',
    userId: currentUser._id || currentUser.id,
    name: currentUser.name || currentUser.username
  });

  // Listen for incoming messages
  socket.on('admin-reply', (message) => {
    addChatMessage(message.message, 'admin');
  });

  // Listen for connection status
  socket.on('connect', () => {
    console.log('Connected to chat server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from chat server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    console.log('Falling back to localStorage chat');
  });
}

// Fetch user data from database
async function fetchUserData() {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.log('No user info found');
      return;
    }

    const user = JSON.parse(userInfo);
    const userId = user._id || user.id;

    // Fetch user details from database
    const response = await fetch(`${API_BASE}/users/${userId}`);
    
    if (response.ok) {
      const userData = await response.json();
      currentUser = userData;
      
      // Update user accounts and balance
      userBalance = parseFloat(userData.account_balance) || 0;
      
      // Create account objects
      userAccounts = [
        {
          type: 'Primary Checking',
          number: userData.account_number || '•••• 4567',
          balance: userBalance,
          icon: 'fas fa-university'
        },
        {
          type: 'Savings',
          number: '•••• 8910',
          balance: userBalance * 0.3, // Simulate savings as 30% of checking
          icon: 'fas fa-piggy-bank'
        }
      ];

      // Update UI with real data
      updateUserInterface();
      
      console.log('User data loaded:', userData);
    } else {
      console.error('Failed to fetch user data');
      // Use fallback data
      useFallbackData();
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Use fallback data
    useFallbackData();
  }
}

// Update UI with real user data
function updateUserInterface() {
  // Update account selector with real data
  updateAccountSelector();
  
  // Update transfer summary
  updateTransferSummary();
  
  // Update user info in header if available
  updateUserHeader();
}

// Update account selector with real account data
function updateAccountSelector() {
  const accountSelector = document.querySelector('.account-selector');
  if (!accountSelector) return;

  accountSelector.innerHTML = '';
  
  userAccounts.forEach((account, index) => {
    const accountOption = document.createElement('div');
    accountOption.className = `account-option ${index === 0 ? 'active' : ''}`;
    accountOption.onclick = () => selectAccount(index);
    
    accountOption.innerHTML = `
      <div class="account-type">
        <i class="${account.icon}"></i>
        ${account.type}
      </div>
      <div class="account-number">${account.number}</div>
      <div class="account-balance">$${formatCurrency(account.balance)}</div>
    `;
    
    accountSelector.appendChild(accountOption);
  });
}

// Select account function
function selectAccount(index) {
  // Remove active class from all accounts
  document.querySelectorAll('.account-option').forEach(option => {
    option.classList.remove('active');
  });
  
  // Add active class to selected account
  document.querySelectorAll('.account-option')[index].classList.add('active');
  
  // Update transfer summary
  updateTransferSummary();
}

// Update transfer summary with real data
function updateTransferSummary() {
  const activeAccount = document.querySelector('.account-option.active');
  if (!activeAccount) return;

  const accountType = activeAccount.querySelector('.account-type').textContent.trim();
  const accountNumber = activeAccount.querySelector('.account-number').textContent;
  
  // Update summary items
  const summaryFrom = document.querySelector('.summary-item .summary-value');
  if (summaryFrom) {
    summaryFrom.textContent = `${accountType} ${accountNumber}`;
  }
  
  // Update amount if entered
  const amountInput = document.getElementById('amount');
  if (amountInput && amountInput.value) {
    updateSummaryAmount(amountInput.value);
  }
}

// Update summary amount
function updateSummaryAmount(amount) {
  const summaryAmount = document.querySelector('.summary-item:nth-child(3) .summary-value');
  const summaryTotal = document.querySelector('.total-value');
  
  if (summaryAmount) {
    summaryAmount.textContent = `$${formatCurrency(parseFloat(amount))}`;
  }
  
  if (summaryTotal) {
    summaryTotal.textContent = `$${formatCurrency(parseFloat(amount))}`;
  }
}

// Update user header with real data
function updateUserHeader() {
  const userProfile = document.querySelector('.user-profile');
  if (userProfile && currentUser) {
    // Add user name tooltip or update icon
    userProfile.title = currentUser.name || currentUser.username;
  }
}

// Format currency
function formatCurrency(amount) {
  return parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Filter banks based on search input
function filterBanks() {
  const searchInput = document.getElementById('bank-search');
  const bankSelect = document.getElementById('bank-name');
  
  if (!searchInput || !bankSelect) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // If search is empty, show all options
  if (searchTerm === '') {
    Array.from(bankSelect.options).forEach(option => {
      option.style.display = '';
    });
    return;
  }
  
  // Filter options based on search term
  Array.from(bankSelect.options).forEach(option => {
    const bankName = option.text.toLowerCase();
    const bankValue = option.value.toLowerCase();
    
    if (bankName.includes(searchTerm) || bankValue.includes(searchTerm)) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  });
  
  // If no matches found, show a message
  const visibleOptions = Array.from(bankSelect.options).filter(option => 
    option.style.display !== 'none' && option.value !== ''
  );
  
  if (visibleOptions.length === 0) {
    // Add a "no results" option if it doesn't exist
    let noResultsOption = bankSelect.querySelector('option[value="no-results"]');
    if (!noResultsOption) {
      noResultsOption = document.createElement('option');
      noResultsOption.value = 'no-results';
      noResultsOption.text = 'No banks found matching your search';
      noResultsOption.disabled = true;
      bankSelect.appendChild(noResultsOption);
    }
    noResultsOption.style.display = '';
  } else {
    // Remove "no results" option if it exists
    const noResultsOption = bankSelect.querySelector('option[value="no-results"]');
    if (noResultsOption) {
      noResultsOption.remove();
    }
  }
}

// Clear bank search
function clearBankSearch() {
  const searchInput = document.getElementById('bank-search');
  const bankSelect = document.getElementById('bank-name');
  const searchResultsInfo = document.getElementById('search-results-info');
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  if (bankSelect) {
    // Reset to first option
    bankSelect.selectedIndex = 0;
    
    // Show all options
    Array.from(bankSelect.options).forEach(option => {
      option.style.display = '';
    });
  }
  
  if (searchResultsInfo) {
    searchResultsInfo.textContent = '';
  }
  
  // Update search results info
  updateSearchResults();
}

// Update search results information
function updateSearchResults() {
  const searchInput = document.getElementById('bank-search');
  const bankSelect = document.getElementById('bank-name');
  const searchResultsInfo = document.getElementById('search-results-info');
  
  if (!searchInput || !bankSelect || !searchResultsInfo) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    const totalBanks = Array.from(bankSelect.options).filter(option => option.value !== '').length;
    searchResultsInfo.textContent = `Showing all ${totalBanks} banks`;
    return;
  }
  
  const visibleOptions = Array.from(bankSelect.options).filter(option => 
    option.style.display !== 'none' && option.value !== '' && option.value !== 'no-results'
  );
  
  if (visibleOptions.length === 0) {
    searchResultsInfo.textContent = 'No banks found matching your search';
  } else if (visibleOptions.length === 1) {
    searchResultsInfo.textContent = `Found 1 bank matching "${searchTerm}"`;
  } else {
    searchResultsInfo.textContent = `Found ${visibleOptions.length} banks matching "${searchTerm}"`;
  }
}

// Update selected bank information
function updateSelectedBank() {
  const bankSelect = document.getElementById('bank-name');
  const searchResultsInfo = document.getElementById('search-results-info');
  
  if (!bankSelect || !searchResultsInfo) return;
  
  const selectedOption = bankSelect.options[bankSelect.selectedIndex];
  
  if (selectedOption && selectedOption.value && selectedOption.value !== 'no-results') {
    searchResultsInfo.textContent = `Selected: ${selectedOption.text}`;
    
    // Update transfer summary if bank selection is part of the form
    updateTransferSummary();
  } else if (selectedOption && selectedOption.value === 'no-results') {
    searchResultsInfo.textContent = 'No banks found matching your search';
  } else {
    searchResultsInfo.textContent = '';
  }
}

// Enhanced filter banks function with better performance
function filterBanks() {
  const searchInput = document.getElementById('bank-search');
  const bankSelect = document.getElementById('bank-name');
  
  if (!searchInput || !bankSelect) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // If search is empty, show all options
  if (searchTerm === '') {
    Array.from(bankSelect.options).forEach(option => {
      option.style.display = '';
    });
    updateSearchResults();
    return;
  }
  
  let matchCount = 0;
  
  // Filter options based on search term
  Array.from(bankSelect.options).forEach(option => {
    if (option.value === '') return; // Skip placeholder option
    
    const bankName = option.text.toLowerCase();
    const bankValue = option.value.toLowerCase();
    
    if (bankName.includes(searchTerm) || bankValue.includes(searchTerm)) {
      option.style.display = '';
      matchCount++;
    } else {
      option.style.display = 'none';
    }
  });
  
  // Handle no results
  if (matchCount === 0) {
    // Add a "no results" option if it doesn't exist
    let noResultsOption = bankSelect.querySelector('option[value="no-results"]');
    if (!noResultsOption) {
      noResultsOption = document.createElement('option');
      noResultsOption.value = 'no-results';
      noResultsOption.text = 'No banks found matching your search';
      noResultsOption.disabled = true;
      bankSelect.appendChild(noResultsOption);
    }
    noResultsOption.style.display = '';
  } else {
    // Remove "no results" option if it exists
    const noResultsOption = bankSelect.querySelector('option[value="no-results"]');
    if (noResultsOption) {
      noResultsOption.remove();
    }
  }
  
  // Update search results info
  updateSearchResults();
}

// Use fallback data when database is not available
function useFallbackData() {
  userAccounts = [
    {
      type: 'Primary Checking',
      number: '•••• 4567',
      balance: 8245.50,
      icon: 'fas fa-university'
    },
    {
      type: 'Savings',
      number: '•••• 8910',
      balance: 12100.00,
      icon: 'fas fa-piggy-bank'
    }
  ];
  
  userBalance = 8245.50;
  updateUserInterface();
}

// Initialize Socket.io on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeSocket();
  fetchUserData(); // Fetch user data from database
});

// Bank selection functionality
document.addEventListener('DOMContentLoaded', function() {
    const bankSelection = document.getElementById('bank-selection');
    const quickAmountButtons = document.querySelectorAll('.quick-amount');
    const amountInput = document.getElementById('amount');
    const summaryAmount = document.querySelector('.summary-item:nth-child(3) .summary-value');
    const summaryBank = document.querySelector('.summary-item:nth-child(2) .summary-value');
    const summaryAccount = document.querySelector('.summary-item:nth-child(2) .summary-value');

    // Update summary when bank is selected
    if (bankSelection) {
        bankSelection.addEventListener('change', updateSummary);
    }

    // Update summary when amount is changed
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            updateSummaryAmount(this.value);
            updateSummary();
        });
    }

    // Quick amount buttons
    quickAmountButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.textContent.replace('$', '').replace(',', '');
            if (amountInput) {
                amountInput.value = amount;
                updateSummaryAmount(amount);
                updateSummary();
            }
        });
    });

    function updateSummary() {
        const selectedBank = bankSelection ? bankSelection.value : '';
        const amount = amountInput ? amountInput.value : '';
        const accountNumber = document.getElementById('account-number') ? document.getElementById('account-number').value : '';

        if (summaryAmount && amount) {
            summaryAmount.textContent = `$${formatCurrency(parseFloat(amount))}`;
        }
        if (summaryBank && selectedBank) {
            summaryBank.textContent = selectedBank;
        }
        if (summaryAccount && accountNumber) {
            summaryAccount.textContent = accountNumber;
        }
    }

    // Tab switching functionality
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        // Show/hide bank selection based on tab
        const bankSelection = document.getElementById('bank-selection');
        if (bankSelection) {
            if (tabName === 'other-bank' || tabName === 'international') {
                bankSelection.style.display = 'block';
            } else {
                bankSelection.style.display = 'none';
            }
        }

        // Remove active class from all tabs
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Add active class to clicked tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    // Form submission
    const transferForm = document.querySelector('.transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const amount = parseFloat(amountInput ? amountInput.value : 0);
            const selectedBank = bankSelection ? bankSelection.value : '';
            const accountNumber = document.getElementById('account-number') ? document.getElementById('account-number').value : '';
            const memo = document.getElementById('memo') ? document.getElementById('memo').value : '';

            if (!amount || amount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            // Check if user has sufficient balance
            const activeAccount = document.querySelector('.account-option.active');
            if (activeAccount) {
                const balanceText = activeAccount.querySelector('.account-balance').textContent;
                const balance = parseFloat(balanceText.replace('$', '').replace(',', ''));
                
                if (amount > balance) {
                    alert('Insufficient funds in your account.');
                    return;
                }
            }

            if (selectedBank && !accountNumber) {
                alert('Please enter the account number.');
                return;
            }

            // Show review step
            showReviewStep();
        });
    }
});

function showReviewStep() {
    // Hide form and show review
    document.getElementById('transferForm').style.display = 'none';
    document.getElementById('reviewStep').style.display = 'block';
    
    // Update review details with form data
    updateReviewDetails();
}

function updateReviewDetails() {
    const amountInput = document.getElementById('amount');
    const memoInput = document.getElementById('memo');
    const recipientSelect = document.getElementById('recipient');
    const bankSelect = document.getElementById('bank-name');
    const accountNumberInput = document.getElementById('account-number');
    
    // Get active account
    const activeAccount = document.querySelector('.account-option.active');
    const fromAccount = activeAccount ? activeAccount.querySelector('.account-type').textContent.trim() + ' ' + activeAccount.querySelector('.account-number').textContent : 'Primary Checking •••• 4567';
    
    // Get recipient
    let toAccount = 'John Smith •••• 3456'; // Default
    if (recipientSelect && recipientSelect.value) {
        const selectedOption = recipientSelect.options[recipientSelect.selectedIndex];
        toAccount = selectedOption.text;
    }
    
    // Get amount
    const amount = amountInput ? amountInput.value : '0.00';
    
    // Get memo
    const memo = memoInput ? memoInput.value : '-';
    
    // Update review elements
    const reviewFrom = document.getElementById('reviewFrom');
    const reviewTo = document.getElementById('reviewTo');
    const reviewAmount = document.getElementById('reviewAmount');
    const reviewMemo = document.getElementById('reviewMemo');
    
    if (reviewFrom) reviewFrom.textContent = fromAccount;
    if (reviewTo) reviewTo.textContent = toAccount;
    if (reviewAmount) reviewAmount.textContent = `$${formatCurrency(parseFloat(amount))}`;
    if (reviewMemo) reviewMemo.textContent = memo;
}

function goBackToForm() {
    // Show form and hide review
    document.getElementById('transferForm').style.display = 'block';
    document.getElementById('reviewStep').style.display = 'none';
}

function confirmTransfer() {
    // Generate transfer ID
    const transferId = 'TXN' + Date.now();
    const transferIdElement = document.getElementById('transferId');
    if (transferIdElement) {
        transferIdElement.textContent = transferId;
    }

    // Hide review and show pending
    document.getElementById('reviewStep').style.display = 'none';
    document.getElementById('pendingStep').style.display = 'block';

    // Initialize live chat
    initializeLiveChat();

    // Notify admin of transfer chat
    notifyAdminOfTransferChat();

    // Simulate transfer processing
    simulateTransferProcessing();
}

function simulateTransferProcessing() {
    const statusItems = document.querySelectorAll('.status-item');
    let currentStep = 0;

    const processSteps = () => {
        if (currentStep < statusItems.length) {
            // Mark previous step as completed
            if (currentStep > 0) {
                statusItems[currentStep - 1].classList.remove('active');
                statusItems[currentStep - 1].classList.add('completed');
            }
            
            // Mark current step as active
            statusItems[currentStep].classList.add('active');
            
            // Add processing message
            if (currentStep === 0) {
                addChatMessage('Transfer submitted successfully. Processing your request...', 'system');
            } else if (currentStep === 1) {
                addChatMessage('Transfer is being processed by our system...', 'system');
            } else if (currentStep === 2) {
                addChatMessage('Transfer completed! Funds have been transferred.', 'system');
                // Mark final step as completed
                setTimeout(() => {
                    statusItems[currentStep].classList.remove('active');
                    statusItems[currentStep].classList.add('completed');
                }, 1000);
            }
            
            currentStep++;
            
            // Continue to next step after 3 seconds
            setTimeout(processSteps, 3000);
        }
    };

    // Start processing
    setTimeout(processSteps, 1000);
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function viewTransferHistory() {
    window.location.href = 'activity.html';
}

function initializeLiveChat() {
    const chatSection = document.querySelector('.live-chat-section');
    if (chatSection) {
        chatSection.style.display = 'block';
    }

    // Add initial message
    addChatMessage('Transfer initiated. A support agent will assist you shortly.', 'system');
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    
    let senderName = 'You';
    if (sender === 'admin') senderName = 'Support Agent';
    if (sender === 'system') senderName = 'System';

    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${senderName}:</strong> ${message}
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    if (!input) return;
    
    const message = input.value.trim();
    
    if (message === "") return;

    // Add user message to chat
    addChatMessage(message, 'user');

    // Send message via Socket.io
    if (socket && socket.connected) {
        socket.emit('user-message', {
            userId: currentUser._id || currentUser.id,
            userName: currentUser.name || currentUser.username,
            message: message,
            transferId: document.getElementById('transferId') ? document.getElementById('transferId').textContent : 'TXN-' + Date.now()
        });
    } else {
        // Fallback to localStorage
        sendTransferMessageToAdmin(message);
    }

    input.value = "";
}

function notifyAdminOfTransferChat() {
    const transferId = document.getElementById('transferId') ? document.getElementById('transferId').textContent : 'TXN-' + Date.now();
    
    // Send notification to admin via Socket.io
    if (socket && socket.connected) {
        socket.emit('user-message', {
            userId: currentUser._id || currentUser.id,
            userName: currentUser.name || currentUser.username,
            message: `New transfer initiated - ID: ${transferId}. User needs assistance.`,
            transferId: transferId
        });
    } else {
        // Fallback to localStorage
        const transferChatSession = {
            id: 'transfer-' + Date.now(),
            source: 'transfer',
            timestamp: new Date().toISOString(),
            status: 'active',
            transferId: transferId
        };
        localStorage.setItem('currentTransferChat', JSON.stringify(transferChatSession));
        localStorage.setItem('newTransferChat', 'true');
    }
}

// Fallback localStorage functions (for when Socket.io is not available)
function sendTransferMessageToAdmin(message) {
    const chatMessages = JSON.parse(localStorage.getItem('transferChatMessages') || '[]');
    chatMessages.push({
        from: 'user',
        message: message,
        timestamp: new Date().toISOString(),
        source: 'transfer'
    });
    localStorage.setItem('transferChatMessages', JSON.stringify(chatMessages));
    localStorage.setItem('newTransferMessage', 'true');
}

function checkForAdminTransferResponse() {
    const adminResponse = localStorage.getItem('adminResponseToTransferChat');
    if (adminResponse) {
        const response = JSON.parse(adminResponse);
        addChatMessage(response.message, 'admin');
        localStorage.removeItem('adminResponseToTransferChat');
    }
}

// Check for admin responses every 2 seconds (fallback)
setInterval(checkForAdminTransferResponse, 2000);

// Handle Enter key in chat
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
});
