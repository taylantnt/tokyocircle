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
      // Enhanced Parallax Scrolling for Card Stack Effect
      // ======================
      const parallaxSections = document.querySelectorAll('.parallax-section');

      function handleParallax() {
          // Skip parallax processing during theme transitions
          if (document.body.classList.contains('transition-active')) {
              return;
          }

          let scrollPosition = window.scrollY;
          const viewportHeight = window.innerHeight;

          parallaxSections.forEach((section) => {
              const rect = section.getBoundingClientRect();

              // Only process sections that are near or in the viewport
              if (rect.top < viewportHeight + 300 && rect.bottom > -300) {
                  // Calculate how visible the section is
                  const distanceFromTop = scrollPosition - (rect.top + scrollPosition - viewportHeight/2);
                  const visiblePercentage = Math.min(
                      Math.max(0, (viewportHeight + scrollPosition - (rect.top + scrollPosition)) / (viewportHeight + rect.height)),
                      1
                  );

                  // Calculate relative position for parallax effect
                  const relativePosition = (rect.top / viewportHeight);

                  // Apply subtle 3D transform to the section
                  const translateY = Math.max(0, (1 - visiblePercentage) * 20);
                  const scale = 0.98 + (visiblePercentage * 0.02);

                  // Apply transforms with subtle shadow effect
                  section.style.transform = `translateY(${translateY}px)`;
                  section.style.boxShadow = `0 -${10 + visiblePercentage * 20}px 30px rgba(0, 0, 0, ${0.05 + visiblePercentage * 0.03})`;
                  section.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';

                  // Animate content within the section for depth effect
                  const container = section.querySelector('.container');
                  if (container) {
                      // Only apply movement effect, no opacity change
                      const contentMovement = Math.max(0, (1 - visiblePercentage) * 15);
                      container.style.transform = `translateY(${contentMovement}px)`;
                  }

                  // Section wave animation removed as per user preference
              }
          });

          // Create a subtle parallax effect for elements within sections
          const elementsToAnimate = document.querySelectorAll('.section-header, .slide-content, .event-card, .step, .founder-card, .stat-item');

          elementsToAnimate.forEach(element => {
              // Skip elements during theme transitions
              if (document.body.classList.contains('transition-active')) {
                  return;
              }

              const rect = element.getBoundingClientRect();

              // Only apply effect when element is in or near viewport
              if (rect.top < viewportHeight + 100 && rect.bottom > -100) {
                  // Calculate how visible the element is
                  const visiblePercentage = Math.min(
                      Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
                      1
                  );

                  // Apply subtle scale and translation effect
                  const scale = 0.95 + (visiblePercentage * 0.05);
                  const translateY = Math.max(0, (1 - visiblePercentage) * 20);

                  element.style.transform = `translateY(${translateY}px) scale(${scale})`;
                  element.style.transition = 'transform 0.4s ease-out';
              }
          });
      }

      // Initial call and event listener
      handleParallax();
      window.addEventListener('scroll', handleParallax);
      window.addEventListener('resize', handleParallax);

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
      // Gallery Slider
      // ======================
      const gallerySlider = document.querySelector('.gallery-slider');
      const slides = document.querySelectorAll('.slide');
      const prevBtn = document.querySelector('.prev-btn');
      const nextBtn = document.querySelector('.next-btn');
      const dotsContainer = document.querySelector('.dots-container');
      let currentSlide = 0;
      let autoSlideInterval;
      let isSliding = false; // Cooldown flag
      const slideCooldown = 500; // Cooldown time in ms

      if (gallerySlider && slides.length > 0 && prevBtn && nextBtn && dotsContainer) {
          // Initialize slider position
          gallerySlider.style.transform = 'translateX(0)';

          // Create dots
          slides.forEach((_, index) => {
              const dot = document.createElement('div');
              dot.classList.add('dot');
              if (index === 0) dot.classList.add('active');
              dot.addEventListener('click', () => {
                  if (!isSliding) {
                      goToSlide(index);
                      resetAutoSlideTimer();
                  }
              });
              dotsContainer.appendChild(dot);
          });

          const dots = document.querySelectorAll('.dot');

          // Navigation functions
          function goToSlide(index) {
              if (isSliding) return; // Prevent interactions during cooldown

              isSliding = true; // Set cooldown flag

              slides[currentSlide].classList.remove('active');
              dots[currentSlide].classList.remove('active');
              currentSlide = (index + slides.length) % slides.length;
              slides[currentSlide].classList.add('active');
              dots[currentSlide].classList.add('active');
              gallerySlider.style.transform = `translateX(-${currentSlide * 100}%)`;

              // Reset cooldown after transition completes
              setTimeout(() => {
                  isSliding = false;
              }, slideCooldown);
          }

          function nextSlide() {
              if (!isSliding) {
                  goToSlide(currentSlide + 1);
              }
          }

          function prevSlide() {
              if (!isSliding) {
                  goToSlide(currentSlide - 1);
              }
          }

          // Auto-advance functions
          function resetAutoSlideTimer() {
              stopAutoSlide();
              startAutoSlide();
          }

          function startAutoSlide() {
              // Clear any existing interval to avoid multiple timers
              clearInterval(autoSlideInterval);
              autoSlideInterval = setInterval(nextSlide, 5000);
          }

          function stopAutoSlide() {
              clearInterval(autoSlideInterval);
          }

          // Event listeners
          prevBtn.addEventListener('click', () => {
              if (!isSliding) {
                  prevSlide();
                  resetAutoSlideTimer();
              }
          });

          nextBtn.addEventListener('click', () => {
              if (!isSliding) {
                  nextSlide();
                  resetAutoSlideTimer();
              }
          });

          // Add touch/swipe support for mobile
          let touchStartX = 0;
          let touchEndX = 0;

          gallerySlider.addEventListener('touchstart', (e) => {
              touchStartX = e.changedTouches[0].screenX;
          }, { passive: true });

          gallerySlider.addEventListener('touchend', (e) => {
              if (isSliding) return; // Prevent swipe during cooldown

              touchEndX = e.changedTouches[0].screenX;
              const diffX = touchStartX - touchEndX;

              // Swipe threshold
              if (Math.abs(diffX) > 50) {
                  if (diffX > 0) {
                      // Swipe left, go to next slide
                      nextSlide();
                  } else {
                      // Swipe right, go to previous slide
                      prevSlide();
                  }
                  resetAutoSlideTimer();
              }
          }, { passive: true });

          gallerySlider.parentElement.addEventListener('mouseenter', stopAutoSlide);
          gallerySlider.parentElement.addEventListener('mouseleave', startAutoSlide);
          gallerySlider.parentElement.addEventListener('touchstart', stopAutoSlide, { passive: true });
          gallerySlider.parentElement.addEventListener('touchend', startAutoSlide, { passive: true });

          // Initialize
          startAutoSlide();
      }

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

      // ======================
      // Hover Effects
      // ======================
      document.querySelectorAll('.event-card').forEach(card => {
          card.style.transition = 'transform 0.3s ease';
          card.addEventListener('mouseenter', () => {
              card.style.transform = 'translateY(-10px) scale(1.02)';
          });

          card.addEventListener('mouseleave', () => {
              card.style.transform = 'translateY(0) scale(1)';
          });
      });

      // Add hover effects for join section cards
      document.querySelectorAll('.step').forEach(card => {
          card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
          card.addEventListener('mouseenter', () => {
              card.style.transform = 'translateY(-10px) scale(1.03)';
              card.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.1)';
              card.style.zIndex = '5';
          });

          card.addEventListener('mouseleave', () => {
              card.style.transform = 'translateY(0) scale(1)';
              card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              card.style.zIndex = '1';
          });
      });
  });