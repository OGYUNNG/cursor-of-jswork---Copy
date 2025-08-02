// Scroll to Top Button
window.addEventListener('scroll', () => {
  const scrollBtn = document.getElementById('scrollToTop');
  if (window.scrollY > 400) {
    scrollBtn.style.display = 'block';
  } else {
    scrollBtn.style.display = 'none';
  }
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Animate on scroll (fade-in)
const fadeIns = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

fadeIns.forEach(el => observer.observe(el));

// Click alert for Learn More button
const foundationBtn = document.querySelector('.btn-secondary');
if (foundationBtn) {
  foundationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to our Foundation page...');
  });
}
