  document.addEventListener('DOMContentLoaded', function() {
      // ======================
      // Dark Mode Toggle with improved transitions
      // ======================
      const themeToggle = document.getElementById('theme-toggle');

      // Check for saved theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
          document.body.classList.add('dark-mode');
          themeToggle.checked = true;
      }
    
   // SCROLLED STATE //
document.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Skip adding the scrolled class if the page has dynamic hue-shifting backgrounds
  // which fully manage the navbar's appearance inline.
  if (document.body.classList.contains('photowalks-page') || document.body.classList.contains('gallery-page')) {
    return;
  }

  if (window.scrollY > 20) {
    navbar.classList.add('navbar-scrolled');
  } else {
    navbar.classList.remove('navbar-scrolled');
  }
});
    
      // Toggle dark mode with smooth transition
      themeToggle.addEventListener('change', function() {
          // Get all sections and important elements that need transition
          const sections = document.querySelectorAll('.section, .section-card');
          const sectionHeaders = document.querySelectorAll('.section-header h2, .section-header .section-description');
          const cards = document.querySelectorAll('.event-card, .step, .founder-card, .about-main-card, .creative-service-card, .creative-services-info, .hire-card, .review-card, .overall-rating');
          const heroElements = document.querySelectorAll('.hero-content, .hero-content h1, .hero-buttons, .subtitle');
          const footer = document.querySelector('.footer');
          const footerElements = document.querySelectorAll('.footer-content, .footer-about, .footer-links, .footer-contact, .footer-bottom, .footer-social a');
          const navLinks = document.querySelectorAll('.nav-links a');
          const buttons = document.querySelectorAll('.btn, button');
          const images = document.querySelectorAll('img');

          // Apply transitions to all elements before toggling the theme
          // We don't apply inline transition to body if it's photowalks or gallery page because they have a hue shifting loop that constantly updates background-color inline.
          // Adding an inline transition to body here would interfere with the requestAnimationFrame loop, causing it to snap instead of animate.
          if (!document.body.classList.contains('photowalks-page') && !document.body.classList.contains('gallery-page')) {
              document.body.style.transition = 'background-color 0.6s ease, color 0.6s ease';
          }
          document.body.classList.add('transition-active');

          // Apply navbar transition
          const navbar = document.querySelector('.navbar');
          if (navbar) {
              if (!document.body.classList.contains('photowalks-page') && !document.body.classList.contains('gallery-page')) {
                  navbar.style.transition = 'background-color 0.6s ease, backdrop-filter 0.6s ease';
              }
          }

          // Apply footer transition
          if (footer) {
              footer.style.transition = 'background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease';
          }

          // Apply transitions to sections
          sections.forEach(section => {
              section.style.transition = 'background-color 0.6s ease, color 0.6s ease, box-shadow 0.6s ease';
          });

          // Apply transitions to section headers
          sectionHeaders.forEach(header => {
              header.style.transition = 'color 0.6s ease, text-shadow 0.6s ease';
          });

          // Apply transitions to cards
          cards.forEach(card => {
              card.style.transition = 'background-color 0.6s ease, color 0.6s ease, box-shadow 0.6s ease, transform 0.6s ease';
          });

          // Apply transitions to hero elements
          heroElements.forEach(element => {
              element.style.transition = 'color 0.6s ease, text-shadow 0.6s ease';
          });

          // Apply transitions to footer elements
          footerElements.forEach(element => {
              element.style.transition = 'color 0.6s ease, background-color 0.6s ease';
          });

          // Apply transitions to nav links
          navLinks.forEach(link => {
              link.style.transition = 'color 0.6s ease, background-color 0.6s ease, border-color 0.6s ease';
          });

          // Apply transitions to buttons
          buttons.forEach(button => {
              button.style.transition = 'color 0.6s ease, background-color 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease';
          });

          // Apply transitions to images
          images.forEach(img => {
              img.style.transition = 'filter 0.6s ease, opacity 0.6s ease, box-shadow 0.6s ease';
          });

          // Toggle dark mode
          if (this.checked) {
              document.body.classList.add('dark-mode');
              localStorage.setItem('theme', 'dark');
          } else {
              document.body.classList.remove('dark-mode');
              localStorage.setItem('theme', 'light');
          }

          // Remove inline transitions after they're complete
          setTimeout(() => {
              if (!document.body.classList.contains('photowalks-page') && !document.body.classList.contains('gallery-page')) {
                  document.body.style.transition = '';
              }
              document.body.classList.remove('transition-active');

              // Remove all inline transitions
              if (navbar) navbar.style.transition = '';
              if (footer) footer.style.transition = '';

              sections.forEach(section => {
                  section.style.transition = '';
              });

              sectionHeaders.forEach(header => {
                  header.style.transition = '';
              });

              cards.forEach(card => {
                  card.style.transition = '';
              });

              heroElements.forEach(element => {
                  element.style.transition = '';
              });

              footerElements.forEach(element => {
                  element.style.transition = '';
              });

              navLinks.forEach(link => {
                  link.style.transition = '';
              });

              buttons.forEach(button => {
                  button.style.transition = '';
              });

              images.forEach(img => {
                  img.style.transition = '';
              });
          }, 600);
      });

      // ======================
      // Loader Animation
      // ======================
      const loader = document.querySelector('.loader');
      if (loader) {
          loader.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
              loader.style.opacity = '0';
              setTimeout(() => {
                  loader.style.display = 'none';
              }, 500);
          }, 1000);
      }

      // ======================
      // Mobile Navigation
      // ======================
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      const navLinks = document.querySelector('.nav-links');

      if (mobileMenuBtn && navLinks) {
          // Set custom property for staggered animation
          const navItems = document.querySelectorAll('.nav-links a');
          navItems.forEach((link, index) => {
              link.style.setProperty('--i', index);
          });

          // Add a body class when mobile menu is active for additional styling
          mobileMenuBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              navLinks.classList.toggle('active');
              this.classList.toggle('active');
              document.body.classList.toggle('menu-open');
              // Add active class to body when menu is open to ensure blur effect works
              document.body.classList.toggle('active', navLinks.classList.contains('active'));
              // Ensure only one navbar is active
              const allNavbars = document.querySelectorAll('.navbar');
              // Ensure only one navbar is active
              allNavbars.forEach(navbar => {
                  if (navbar !== this.closest('.navbar')) {
                      navbar.classList.remove('active');
                  }
              });
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
          navItems.forEach(link => {
              link.addEventListener('click', function() {
                  navLinks.classList.remove('active');
                  mobileMenuBtn.classList.remove('active');
                  document.body.classList.remove('menu-open');
              });
          });

          // Improved resize handler
          let resizeTimer;
          window.addEventListener('resize', () => {
              document.body.classList.add('resize-animation-stopper');
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(() => {
                  document.body.classList.remove('resize-animation-stopper');
              }, 400);

              if (window.innerWidth > 768) {
                  // Wait for transition to complete before removing active class
                  setTimeout(() => {
                      navLinks.classList.remove('active');
                      mobileMenuBtn.classList.remove('active');
                      document.body.classList.remove('menu-open');
                  }, 300);
              }
          });
      }

      // ======================
      // Smooth Scrolling
      // ======================
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function(e) {
              e.preventDefault();
              const targetId = this.getAttribute('href');
              const targetElement = document.querySelector(targetId);

              if (targetElement) {
                  const headerOffset = 80;
                  const elementPosition = targetElement.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                  window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                  });
              }
          });
      });

      // ======================
      // Back to Top Button
      // ======================
      const backToTopBtn = document.getElementById('back-to-top');
      if (backToTopBtn) {
          const handleScroll = () => {
              if (window.scrollY > 300) {
                  backToTopBtn.classList.add('show');
              } else {
                  backToTopBtn.classList.remove('show');
              }
          };

          window.addEventListener('scroll', handleScroll);
          
          backToTopBtn.addEventListener('click', (e) => {
              e.preventDefault();
              window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
              });
          });
      }
  });
