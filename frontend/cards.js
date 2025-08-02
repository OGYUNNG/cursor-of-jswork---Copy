// API Base URL
const API_BASE = 'http://localhost:3100';

// User data variables
let currentUser = null;
let userBalance = 0;
let userTransactions = [];

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
      
      // Update user balance
      userBalance = parseFloat(userData.account_balance) || 0;
      
      // Update UI with real data
      updateUserInterface();
      
      // Fetch user transactions
      await fetchUserTransactions(userId);
      
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

// Fetch user transactions from database
async function fetchUserTransactions(userId) {
  try {
    const response = await fetch(`${API_BASE}/transactions?user_id=${userId}`);
    
    if (response.ok) {
      const transactions = await response.json();
      userTransactions = transactions;
      updateTransactionTable(transactions);
    } else {
      console.error('Failed to fetch transactions');
      // Use fallback transactions
      useFallbackTransactions();
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    // Use fallback transactions
    useFallbackTransactions();
  }
}

// Update UI with real user data
function updateUserInterface() {
  // Update card holder name
  updateCardHolderName();
  
  // Update account balance
  updateAccountBalance();
  
  // Update user profile
  updateUserProfile();
  
  // Update card number (masked)
  updateCardNumber();
}

// Update card holder name
function updateCardHolderName() {
  const cardNameElements = document.querySelectorAll('.card-name + div');
  if (currentUser && cardNameElements.length > 0) {
    const userName = currentUser.name || currentUser.username || 'USER';
    cardNameElements.forEach(element => {
      element.textContent = userName.toUpperCase();
    });
  }
}

// Update account balance
function updateAccountBalance() {
  const balanceElements = document.querySelectorAll('.stat-value');
  if (balanceElements.length > 0) {
    const formattedBalance = formatCurrency(userBalance);
    balanceElements[0].textContent = formattedBalance; // Available Balance
  }
  
  // Update credit limit (set to 2x balance for demo)
  const creditLimit = userBalance * 2;
  if (balanceElements.length > 2) {
    balanceElements[2].textContent = formatCurrency(creditLimit); // Credit Limit
  }
  
  // Update spent amount (random for demo)
  const spentAmount = Math.random() * userBalance * 0.3;
  if (balanceElements.length > 1) {
    balanceElements[1].textContent = formatCurrency(spentAmount); // Spent this month
  }
  
  // Update progress bar
  updateProgressBar(spentAmount, creditLimit);
}

// Update user profile
function updateUserProfile() {
  const userProfile = document.querySelector('.user-profile');
  if (userProfile && currentUser) {
    // Add user name tooltip
    userProfile.title = currentUser.name || currentUser.username;
    
    // If user has profile picture, display it
    if (currentUser.profile_picture) {
      userProfile.innerHTML = `<img src="${API_BASE}${currentUser.profile_picture}" alt="${currentUser.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      // Show initials
      const initials = (currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase();
      userProfile.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">${initials}</div>`;
    }
  }
}

// Update card number (masked)
function updateCardNumber() {
  const cardNumberElements = document.querySelectorAll('.card-number');
  if (currentUser && cardNumberElements.length > 0) {
    const accountNumber = currentUser.account_number || '1234';
    const lastFour = accountNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${lastFour}`;
    
    cardNumberElements.forEach(element => {
      element.textContent = maskedNumber;
    });
  }
}

// Update progress bar
function updateProgressBar(spent, limit) {
  const percent = (spent / limit) * 100;
  const progressBar = document.querySelector('.progress');
  
  if (progressBar) {
    progressBar.style.width = `${Math.min(percent, 100)}%`;
  }
}

// Update transaction table with real data
function updateTransactionTable(transactions) {
  const tbody = document.querySelector('.transaction-table tbody');
  if (!tbody) return;
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  if (transactions.length === 0) {
    // Show no transactions message
    const noTransactionsRow = document.createElement('tr');
    noTransactionsRow.innerHTML = `
      <td colspan="4" style="text-align: center; padding: 2rem; color: #6b7280;">
        No transactions found
      </td>
    `;
    tbody.appendChild(noTransactionsRow);
    return;
  }
  
  // Add transaction rows
  transactions.slice(0, 10).forEach(transaction => { // Show last 10 transactions
    const row = document.createElement('tr');
    
    const date = new Date(transaction.created_at || transaction.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const amount = parseFloat(transaction.amount || 0);
    const isExpense = amount < 0;
    const formattedAmount = formatCurrency(Math.abs(amount));
    
    const merchantIcon = getMerchantIcon(transaction.description || transaction.merchant || 'Unknown');
    const merchantName = transaction.description || transaction.merchant || 'Unknown';
    
    row.innerHTML = `
      <td>${date}</td>
      <td>
        <div class="transaction-merchant">
          <div class="merchant-icon">${merchantIcon}</div>
          <div>${merchantName}</div>
        </div>
      </td>
      <td class="transaction-amount ${isExpense ? 'negative' : 'positive'}">${isExpense ? '-' : '+'}${formattedAmount}</td>
      <td><span class="status-badge status-completed">Completed</span></td>
    `;
    
    tbody.appendChild(row);
  });
}

// Get merchant icon based on transaction description
function getMerchantIcon(description) {
  const desc = description.toLowerCase();
  
  if (desc.includes('amazon') || desc.includes('online') || desc.includes('shopping')) return '🛒';
  if (desc.includes('gas') || desc.includes('fuel') || desc.includes('petrol')) return '⛽';
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('dining')) return '🍽️';
  if (desc.includes('coffee') || desc.includes('starbucks')) return '☕';
  if (desc.includes('uber') || desc.includes('lyft') || desc.includes('transport')) return '🚗';
  if (desc.includes('netflix') || desc.includes('streaming') || desc.includes('entertainment')) return '📺';
  if (desc.includes('gym') || desc.includes('fitness')) return '💪';
  if (desc.includes('medical') || desc.includes('health')) return '🏥';
  if (desc.includes('salary') || desc.includes('income') || desc.includes('deposit')) return '💰';
  if (desc.includes('transfer')) return '💸';
  
  return '💳';
}

// Format currency
function formatCurrency(amount) {
  return parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Use fallback data when database is not available
function useFallbackData() {
  currentUser = {
    name: 'John Doe',
    username: 'johndoe',
    account_balance: 5250.00,
    account_number: '1234567890'
  };
  
  userBalance = 5250.00;
  updateUserInterface();
  useFallbackTransactions();
}

// Use fallback transactions
function useFallbackTransactions() {
  const fallbackTransactions = [
    {
      description: 'Amazon',
      amount: -49.99,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      description: 'Gas Station',
      amount: -35.50,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      description: 'Restaurant',
      amount: -85.00,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      description: 'Salary Deposit',
      amount: 2500.00,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];
  
  updateTransactionTable(fallbackTransactions);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  fetchUserData();
});

// --- Card Actions ---
const freezeBtn = document.querySelector('.btn-primary');
const virtualCardBtn = document.querySelector('.btn-outline');

if (freezeBtn) {
  freezeBtn.addEventListener('click', () => {
    alert('Your card has been frozen.');
    freezeBtn.textContent = 'Card Frozen';
    freezeBtn.disabled = true;
  });
}

if (virtualCardBtn) {
  virtualCardBtn.addEventListener('click', () => {
    alert('A virtual card has been generated and sent to your email.');
  });
}

// --- Transaction Filter ---
const filterButtons = document.querySelectorAll('.filter-btn');
const transactions = document.querySelectorAll('.transaction-table tbody tr');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.textContent;

    transactions.forEach(row => {
      const amount = row.querySelector('.transaction-amount');
      if (!amount) return;
      
      const amountText = amount.textContent;
      if (filter === 'All') {
        row.style.display = '';
      } else if (filter === 'Income' && amountText.includes('+')) {
        row.style.display = '';
      } else if (filter === 'Expenses' && amountText.includes('-')) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
});

// --- Toggle Switches Feedback (Optional) ---
const toggles = document.querySelectorAll('.toggle-switch input');
toggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    const label = toggle.closest('.control-item')?.querySelector('.control-label')?.textContent;
    if (toggle.checked) {
      console.log(`${label} enabled`);
    } else {
      console.log(`${label} disabled`);
    }
  });
});
