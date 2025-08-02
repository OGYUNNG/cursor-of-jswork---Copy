// Smooth scroll for "Explore Products" button
document.querySelector('.btn-primary[href="#products"]').addEventListener('click', function(e) {
  e.preventDefault();
  const target = document.querySelector('#products');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
});

// Hover animation effect for quick-action and product cards
const cards = document.querySelectorAll('.action-card, .product-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'scale(1.02)';
    card.style.transition = 'transform 0.3s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'scale(1)';
  });
});

// Call to Action button behavior
document.querySelectorAll('.cta-buttons a').forEach(button => {
  button.addEventListener('click', () => {
    alert("Redirecting to: " + button.textContent);
  });
});

// Animate testimonial star ratings on load
document.addEventListener('DOMContentLoaded', () => {
  const ratings = document.querySelectorAll('.testimonial-card .rating');
  ratings.forEach((rating, i) => {
    const stars = rating.querySelectorAll('i');
    stars.forEach((star, index) => {
      setTimeout(() => {
        star.style.color = '#f5b301';
      }, index * 100 + i * 300);
    });
  });
});

// Sticky Header on scroll
const header = document.querySelector('.bank-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
});
