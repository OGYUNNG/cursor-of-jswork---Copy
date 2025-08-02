// ===== MOBILE MENU TOGGLE =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
}

// ===== BUSINESS LOAN CALCULATOR =====
const loanAmount = document.getElementById('loan-amount');
const amountDisplay = document.getElementById('amount-display');
const loanTerm = document.getElementById('loan-term');
const interestRate = document.getElementById('interest-rate');
const paymentAmount = document.getElementById('payment-amount');

function calculatePayment() {
  if (!loanAmount || !loanTerm || !interestRate || !paymentAmount) return;

  const principal = parseFloat(loanAmount.value);
  const term = parseFloat(loanTerm.value) * 12; // Convert years to months
  const rate = parseFloat(interestRate.value) / 100 / 12; // Monthly interest

  const payment = principal * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1);

  amountDisplay.textContent = '$' + principal.toLocaleString();
  paymentAmount.textContent = '$' + (isFinite(payment) ? payment.toFixed(2) : '0.00');
}

if (loanAmount && loanTerm && interestRate) {
  loanAmount.addEventListener('input', calculatePayment);
  loanTerm.addEventListener('change', calculatePayment);
  interestRate.addEventListener('input', calculatePayment);

  // Initialize on page load
  calculatePayment();
}
