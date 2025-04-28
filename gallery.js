document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle with improved transitions
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    // Toggle dark mode with smooth transition (matching index page)
    themeToggle.addEventListener('change', function() {
        // Get all sections and important elements that need transition
        const sections = document.querySelectorAll('.section');
        const footer = document.querySelector('.footer');
        const footerElements = document.querySelectorAll('.footer-content, .footer-about, .footer-links, .footer-contact, .footer-bottom, .footer-social a');
        const navLinks = document.querySelectorAll('.nav-links a');
        const buttons = document.querySelectorAll('.btn, button');
        const images = document.querySelectorAll('img');
        
        // Apply transitions to all elements before toggling the theme
        document.body.style.transition = 'background-color 0.6s ease, color 0.6s ease';
        document.body.classList.add('transition-active');
        
        // Apply navbar transition
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.transition = 'background 0.6s ease, backdrop-filter 0.6s ease';
        }
        
        // Apply footer transition
        if (footer) {
            footer.style.transition = 'background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease';
        }
        
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
            document.body.style.transition = '';
            document.body.classList.remove('transition-active');
            
            // Remove all inline transitions
            if (navbar) navbar.style.transition = '';
            if (footer) footer.style.transition = '';
            
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

    // Mobile navigation setup with improved accessibility
    // Mobile menu functionality
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
            allNavbars.forEach(navbar => {
                if (navbar !== this.closest('.navbar')) {
                    navbar.classList.remove('active');
                }
            });
            
            // Set aria-expanded attribute for accessibility
            mobileMenuBtn.setAttribute('aria-expanded', 
                mobileMenuBtn.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
        });
    }
    
    if (mobileMenuBtn && navLinks) {
        // Add ARIA attributes
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
        navLinks.setAttribute('role', 'navigation');
        navLinks.setAttribute('aria-label', 'Main navigation');

        // Set custom property for staggered animation
        document.querySelectorAll('.nav-links a').forEach((link, index) => {
            link.style.setProperty('--i', index);
            // Add keyboard navigation
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });

        // Improved mobile menu toggle
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
            document.body.classList.toggle('menu-open');

            // Focus management
            if (!isExpanded) {
                const firstLink = navLinks.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            }
        });

        // Improved resize handler with cleanup
        let resizeTimer;
        window.addEventListener('resize', () => {
            document.body.classList.add('resize-animation-stopper');
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                document.body.classList.remove('resize-animation-stopper');
            }, 400);

            if (window.innerWidth > 768) {
                setTimeout(() => {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('menu-open');
                }, 300);
            }
        });
    }

    // Improved gallery data management with lazy loading
    const galleryData = { main: [] };
    const categories = [
        'Nature', 'Urban', 'Portraits', 'Street', 'Architecture', 'Landscapes', 
        'Night Sky', 'Black & White', 'Macro', 'Wildlife', 'Travel', 'Food',
        'Minimalist', 'Abstract', 'Candid', 'Cityscape', 'Events', 'Fashion',
        'Flowers', 'Vintage', 'Beach', 'Sports', 'Bokeh', 'Rainy Days',
        'Sunsets', 'Spiritual', 'Seasonal', 'Nightlife', 'Traditional', 'Creative'
    ];

    // Generate gallery data with improved image loading
    categories.forEach(category => {
        const images = [];
        for (let i = 1; i <= 50; i++) {
            images.push({
                url: `https://picsum.photos/800/800?${category.toLowerCase()}${i}`,
                loaded: false,
                element: null
            });
        }
        galleryData.main.push({
            type: 'folder',
            name: category,
            images: images
        });
    });

    const gallery = document.getElementById('gallery');
    const viewer = document.querySelector('.viewer');
    const viewerImg = document.querySelector('.viewer-img');
    const pageTitle = document.querySelector('.page-title');
    let currentImages = [];
    let currentIndex = 0;
    let history = [];
    let backBtn = null;
    let isNavigating = false;

    // Replace placeholder image paths with data URLs
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
    const ERROR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlZmVmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2RjMzU0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

    // Initialize Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const url = img.dataset.src;
                if (url) {
                    loadImage(img, url).catch(error => {
                        console.error('Error loading image:', error);
                        img.src = 'path/to/fallback-image.jpg'; // Add a fallback image
                    });
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    // Image loading helper
    function loadImage(img, url) {
        return new Promise((resolve, reject) => {
            img.src = url;
            img.onload = () => {
                img.classList.add('loaded');
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        });
    }

    // Initialize gallery with error handling
    async function initGallery() {
        try {
            await loadGallery('main');
        } catch (error) {
            console.error('Error initializing gallery:', error);
            gallery.innerHTML = '<p class="error-message">Failed to load gallery. Please try again later.</p>';
        }
    }

    // Create back button with improved state management
    function createBackButton() {
        if (!backBtn) {
            const backCell = document.createElement('div');
            backCell.className = 'back-cell';
            backCell.style.position = 'relative';
            
            backBtn = document.createElement('button');
            backBtn.className = 'back-btn';
            backBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            backBtn.setAttribute('aria-label', 'Go back to previous folder');
            
            // Prevent rapid clicking
            backBtn.addEventListener('click', async () => {
                if (isNavigating || history.length === 0) return;
                isNavigating = true;
                
                try {
                    const prevCategory = history.pop();
                    await loadGallery(prevCategory);
                } catch (error) {
                    console.error('Error navigating back:', error);
                    history.push(prevCategory); // Restore history state on error
                } finally {
                    isNavigating = false;
                }
            });
            
            backCell.appendChild(backBtn);
            return backCell;
        }
        return backBtn.parentElement;
    }

    // Improved gallery loading with error handling and loading states
    async function loadGallery(category) {
        try {
            gallery.classList.add('loading');
            const items = category === 'main' ? galleryData[category] : currentImages;
            await fadeOutGallery();
            
            gallery.innerHTML = '';
            
            if (category !== 'main' && history.length > 0) {
                const backCell = createBackButton();
                gallery.appendChild(backCell);
                setTimeout(() => backBtn.classList.add('visible'), 100);
            } else if (backBtn) {
                backBtn.classList.remove('visible');
            }
            
            items.forEach((item, index) => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                
                const img = createGalleryImage(item, index, category);
                container.appendChild(img);
                
                if (item.type === 'folder') {
                    const title = document.createElement('div');
                    title.className = 'folder-title';
                    title.textContent = item.name;
                    container.appendChild(title);
                }
                
                gallery.appendChild(container);
                fadeInImage(img, index);
            });
        } catch (error) {
            console.error('Error loading gallery:', error);
            gallery.innerHTML = '<p class="error-message">Failed to load gallery content. Please try again later.</p>';
        } finally {
            gallery.classList.remove('loading');
        }
    }

    // Improved image creation with lazy loading
    function createGalleryImage(item, index, category) {
        const img = document.createElement('img');
        img.classList.add('fade-in');
        
        // Set the source based on whether it's a folder or an image
        if (item.type === 'folder') {
            img.dataset.src = item.images[0].url;
            img.src = PLACEHOLDER_IMAGE;
            
            // Store click handler for cleanup
            img.clickHandler = () => {
                history.push(category);
                loadFolder(item.images, item.name);
            };
        } else {
            img.dataset.src = item.url;
            img.src = PLACEHOLDER_IMAGE;
            
            // Store click handler for cleanup
            img.clickHandler = () => {
                openViewer(currentImages, index);
            };
        }
        
        img.addEventListener('click', img.clickHandler);
        imageObserver.observe(img);
        
        return img;
    }

    // Improved folder loading with cleanup
    async function loadFolder(images, folderName) {
        try {
            gallery.classList.add('loading');
            await fadeOutGallery();
            
            // Cleanup old event listeners
            cleanup();
            
            gallery.innerHTML = '';
            currentImages = images;
            
            const backCell = createBackButton();
            gallery.appendChild(backCell);
            setTimeout(() => backBtn.classList.add('visible'), 100);
            
            images.forEach((image, index) => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                
                const img = document.createElement('img');
                img.classList.add('fade-in');
                img.dataset.src = image.url;
                img.src = PLACEHOLDER_IMAGE;
                
                img.clickHandler = () => openViewer(currentImages, index);
                img.addEventListener('click', img.clickHandler);
                imageObserver.observe(img);
                
                container.appendChild(img);
                gallery.appendChild(container);
                fadeInImage(img, index);
            });
        } catch (error) {
            console.error('Error loading folder:', error);
            gallery.innerHTML = '<p class="error-message">Failed to load folder content. Please try again later.</p>';
        } finally {
            gallery.classList.remove('loading');
        }
    }

    // Cleanup function for event listeners and references
    function cleanup() {
        const images = gallery.querySelectorAll('img');
        images.forEach(img => {
            img.removeEventListener('click', img.clickHandler);
            imageObserver.unobserve(img);
        });
        currentImages = [];
    }

    // Gallery transitions
    async function fadeOutGallery() {
        const images = Array.from(gallery.querySelectorAll('img'));
        images.forEach(img => img.classList.add('fade-out'));
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    function fadeInImage(img, index) {
        setTimeout(() => {
            img.classList.remove('fade-in');
        }, index * 50);
    }

    // Improved viewer with error handling and touch events
    async function loadViewerImage(imageData, direction = null) {
        try {
            const currentImg = viewerImg;
            
            // Start preloading next/prev images immediately to minimize delay
            const nextIndex = (currentIndex + 1) % currentImages.length;
            const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            
            // Preload both next and previous images silently
            Promise.all([
                preloadImage(currentImages[nextIndex].url),
                preloadImage(currentImages[prevIndex].url)
            ]).catch(console.error); // Don't await, let it happen in background

            // Add slide out animation
            if (direction === 'next') {
                currentImg.classList.add('slide-out-left');
            } else if (direction === 'prev') {
                currentImg.classList.add('slide-out-right');
            }
            
            // Wait for slide out animation
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Reset all animation classes
            currentImg.className = 'viewer-img';
            
            // Set the new image source
            currentImg.src = imageData.url;
            
            // Force browser reflow
            void currentImg.offsetWidth;
            
            // Add slide in animation
            if (direction === 'next') {
                currentImg.classList.add('slide-in-right');
            } else if (direction === 'prev') {
                currentImg.classList.add('slide-in-left');
            }
            
            // Add loaded class immediately
            requestAnimationFrame(() => {
                currentImg.classList.add('loaded');
            });
            
            // Update thumbnails
            updateThumbnails();
            
        } catch (error) {
            console.error('Error loading viewer image:', error);
            viewerImg.src = ERROR_IMAGE;
        }
    }

    // Add thumbnail functionality
    function updateThumbnails() {
        const thumbnailsContainer = document.querySelector('.viewer-thumbnails');
        thumbnailsContainer.innerHTML = '';
        
        // Create thumbnails for current folder/category
        currentImages.forEach((image, index) => {
            const thumb = document.createElement('img');
            thumb.src = image.url;
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.className = `viewer-thumbnail${index === currentIndex ? ' active' : ''}`;
            
            thumb.addEventListener('click', () => {
                currentIndex = index;
                loadViewerImage(currentImages[currentIndex]);
            });
            
            thumbnailsContainer.appendChild(thumb);
        });
        
        // Scroll active thumbnail into view
        const activeThumb = thumbnailsContainer.querySelector('.viewer-thumbnail.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function openViewer(images, index) {
        currentIndex = index;
        currentImages = images;
        viewer.classList.add('active');
        loadViewerImage(images[currentIndex]);
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Initial thumbnails update
        updateThumbnails();
    }

    function closeViewer() {
        viewer.classList.remove('active');
        viewerImg.src = '';
        viewerImg.classList.remove('loaded');
        // Cleanup
        document.removeEventListener('keydown', handleKeyboardNavigation);
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Keyboard navigation
    function handleKeyboardNavigation(e) {
        if (!viewer.classList.contains('active')) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                navigate(-1);
                break;
            case 'ArrowRight':
                navigate(1);
                break;
            case 'Escape':
                closeViewer();
                break;
        }
    }

    // Improved navigation with loading states
    async function navigate(direction) {
        if (viewerImg.classList.contains('loading')) return;
        
        const newIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
        
        try {
            currentIndex = newIndex;
            await loadViewerImage(currentImages[currentIndex], direction > 0 ? 'next' : 'prev');
        } catch (error) {
            console.error('Error navigating images:', error);
        }
    }

    // Improved touch events with error handling
    let touchStartX = 0;
    let touchStartY = 0;
    
    viewer.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    viewer.addEventListener('touchend', e => {
        if (viewerImg.classList.contains('loading')) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - e.changedTouches[0].clientY);
        
        // Ensure horizontal swipe
        if (Math.abs(diffX) > 50 && diffY < 50) {
            navigate(diffX > 0 ? 1 : -1);
        }
    }, { passive: true });

    // Navigation controls
    document.querySelector('.close-btn').addEventListener('click', closeViewer);
    document.querySelector('.prev').addEventListener('click', () => navigate(-1));
    document.querySelector('.next').addEventListener('click', () => navigate(1));

    // Initialize gallery
    initGallery();
});

// Add preloader function at the top of the file
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

// Add preloader cache
const preloadCache = new Map();