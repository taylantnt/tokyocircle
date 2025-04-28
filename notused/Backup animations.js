document.addEventListener('DOMContentLoaded', () => {
    // Scroll-triggered animations
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.dataset.animation || 'fade-in';
                entry.target.classList.add('animate', animationType);
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Initialize Rellax.js for parallax effect
    const rellax = new Rellax('.parallax', {
        speed: -2,
        center: true,
        wrapper: null,
        round: true,
        vertical: true,
        horizontal: false
    });

    console.log('Rellax initialized for parallax elements.');
});

// Show/hide back-to-top button
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Hide loading screen after page load
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        console.log('Page loaded. Hiding loading screen.');
        loadingScreen.style.display = 'none';
    } else {
        console.error('Loading screen element not found.');
    }
});