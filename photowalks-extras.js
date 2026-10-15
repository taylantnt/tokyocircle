  document.addEventListener('DOMContentLoaded', function() {
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

                  // Keep the parallax movement, but let CSS own the section shadow.
                  // This prevents scroll-time JS from overriding the stacked card shadow.
                  section.style.transform = `translateY(${translateY}px)`;
                  section.style.removeProperty('box-shadow');
                  section.style.transition = 'transform 0.3s ease-out';

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
          // Note: .section-header is intentionally excluded so headers stay glued
          // to their section content (prevents uneven spacing between sections)
          const elementsToAnimate = document.querySelectorAll('.slide-content, .event-card, .step, .founder-card, .stat-item');

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
