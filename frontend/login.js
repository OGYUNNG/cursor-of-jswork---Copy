// Toggle password visibility
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePassword.innerHTML = type === 'password'
    ? '<i class="fas fa-eye"></i>'
    : '<i class="fas fa-eye-slash"></i>';
});

// Handle form submission
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = passwordInput.value.trim();
  const rememberMe = document.getElementById('remember').checked;

  // Clear previous errors
  errorMessage.textContent = "";

  // Validate inputs
  if (!username) {
    errorMessage.textContent = "Please enter your Online ID.";
    return;
  }

  // Optional: Validate email-like input (can be removed if usernames are not emails)
  const isEmailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
  if (!isEmailLike && username.includes("@")) {
    errorMessage.textContent = "Please enter a valid email format.";
    return;
  }

  if (!password) {
    errorMessage.textContent = "Please enter your password.";
    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters long.";
    return;
  }

  // Send login request to backend
  fetch('https://cursor-of-jswork-copy-backend.onrender.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })  // FIXED: Use correct field
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {  // FIXED: Use `success` instead of `token`
        // Save user info to local storage
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      } else {
        errorMessage.textContent = data.message || 'Login failed';  // FIXED: Proper error field
      }
    })
    .catch(err => {
      console.error(err);
      errorMessage.textContent = "Something went wrong. Please try again.";
    });

  // Remember Online ID if checked
  if (rememberMe) {
    localStorage.setItem('savedUsername', username);
  } else {
    localStorage.removeItem('savedUsername');
  }
});

// Optional: Pre-fill username if remembered
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('savedUsername');
  if (saved) {
    document.getElementById('username').value = saved;
    document.getElementById('remember').checked = true;
  }
});
