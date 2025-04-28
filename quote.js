document.addEventListener('DOMContentLoaded', () => {
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    body.classList.add('dark-mode');
    themeToggle.checked = true;
  }
  
  // Toggle theme when the switch is clicked
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    // Set custom property for staggered animation
    document.querySelectorAll('.nav-links a').forEach((link, index) => {
      link.style.setProperty('--i', index);
    });

    // Add a body class when mobile menu is active for additional styling
    mobileMenuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });

    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }
  
  // Add active class to body when menu is open to ensure blur effect works
    document.body.classList.toggle('active', navLinks.classList.contains('active'));
    
    // Update aria-expanded
    const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true' || false;
    mobileMenuBtn.setAttribute('aria-expanded', !expanded);
  
    // Ensure only one navbar is active
    const allNavbars = document.querySelectorAll('.navbar');
    allNavbars.forEach(navbar => {
      if (navbar !== this.closest('.navbar')) {
        navbar.classList.remove('active');
      }
    });
  });
  
  // Close mobile menu when clicking on links
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        mobileMenuBtn.click();
      }
    });
  });
  
  // Stop animations during window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-animation-stopper');
    }, 400);
  });
  
  // Form validation and submission
  const quoteForm = document.getElementById('quote-form');
  const formFields = quoteForm.querySelectorAll('input, textarea, select');
  
  // Simple form validation
  function validateForm() {
    let valid = true;
    
    formFields.forEach(field => {
      if (field.hasAttribute('required') && !field.value.trim()) {
        valid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    
    return valid;
  }
  
  // Show success message after form submission
  function showSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <h3>Thank you for your request!</h3>
      <p>We'll get back to you within 24-48 hours with a custom quote.</p>
    `;
    
    // Replace form with success message
    quoteForm.style.opacity = '0';
    setTimeout(() => {
      quoteForm.parentNode.replaceChild(successMsg, quoteForm);
      successMsg.style.opacity = '1';
    }, 300);
  }
  
  // Handle form submission
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData(quoteForm);
    
    try {
      const response = await fetch(quoteForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        showSuccessMessage();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was a problem submitting your form. Please try again later.');
    }
  });
  
  // Handle real-time validation
  formFields.forEach(field => {
    field.addEventListener('blur', () => {
      if (field.hasAttribute('required') && !field.value.trim()) {
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
  });
  
  // Add loading animation
  window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  });
});