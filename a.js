// Initialize mobile menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// Initialize Intersection Observer for page title
const pageTitleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            pageTitleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Observe page title
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.page-title').forEach(pageTitle => {
        pageTitleObserver.observe(pageTitle);
    });
    
    // Initialize back-to-top button
    const backToTopBtn = document.getElementById('back-to-top');
    
    // Show button when user scrolls down 300px
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    // Scroll to top when button is clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Gallery configuration with performance optimizations
const config = {
    lazyLoadOffset: 200, // Increased offset for earlier loading
    transitionDuration: 300,
    cacheDuration: 1000 * 60 * 30, // Extended to 30 minutes
    retryAttempts: 2, // Reduced retry attempts
    retryDelay: 800, // Slightly reduced delay
    batchSize: 5 // Number of images to load in parallel
};

// Optimized image cache implementation
class ImageCache {
    constructor(duration = config.cacheDuration) {
        this.cache = new Map();
        this.duration = duration;
        this.preloadQueue = new Set();
    }

    set(key, value) {
        if (this.cache.size > 100) { // Prevent memory leaks
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
        return value;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        if (Date.now() - entry.timestamp > this.duration) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    preload(urls) {
        urls.forEach(url => {
            if (!this.preloadQueue.has(url) && !this.get(url)) {
                this.preloadQueue.add(url);
                loadImage(url).catch(() => {});
            }
        });
    }

    clear() {
        this.cache.clear();
        this.preloadQueue.clear();
    }
}

// Create image cache instance
const imageCache = new ImageCache();

// Utility functions
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const retry = async (fn, attempts = config.retryAttempts, delay = config.retryDelay) => {
    try {
        return await fn();
    } catch (error) {
        if (attempts <= 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, attempts - 1, delay * 2);
    }
};

// Image loading with retry and caching
const loadImage = async (url, fallbackUrl = null) => {
    const cachedImage = imageCache.get(url);
    if (cachedImage) return cachedImage;

    const img = new Image();
    
    try {
        await retry(() => new Promise((resolve, reject) => {
            img.onload = () => {
                img.classList.add('loaded');
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        }));
        return imageCache.set(url, img);
    } catch (error) {
        console.warn(error);
        if (fallbackUrl) {
            img.src = fallbackUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });
        }
        return img;
    }
};

// Optimized lazy loading implementation
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: `${config.lazyLoadOffset}px`,
            threshold: 0.1,
            ...options
        };
        
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
        this.loadingElements = new Set();
        this.loadQueue = [];
        this.isProcessing = false;
    }

    observe(element) {
        if (element) {
            this.observer.observe(element);
            // Preload next batch of images
            const nextImages = this.getNextImages(element, config.batchSize);
            if (nextImages.length) {
                imageCache.preload(nextImages);
            }
        }
    }

    unobserve(element) {
        if (element) this.observer.unobserve(element);
    }

    getNextImages(element, count) {
        const images = [];
        let current = element;
        while (current && images.length < count) {
            current = current.nextElementSibling;
            if (current && current.dataset.src) {
                images.push(current.dataset.src);
            }
        }
        return images;
    }

    async processQueue() {
        if (this.isProcessing || !this.loadQueue.length) return;
        
        this.isProcessing = true;
        const batch = this.loadQueue.splice(0, config.batchSize);
        
        await Promise.all(batch.map(async ({ element, url }) => {
            try {
                const img = await loadImage(url, ERROR_IMAGE);
                if (element.parentNode) { // Check if element still exists
                    element.src = img.src;
                    element.classList.add('loaded');
                }
            } catch (error) {
                console.warn('Error in lazy loading:', error);
                if (element.parentNode) {
                    element.src = ERROR_IMAGE;
                }
            } finally {
                this.loadingElements.delete(element);
                this.unobserve(element);
            }
        }));
        
        this.isProcessing = false;
        if (this.loadQueue.length) {
            requestAnimationFrame(() => this.processQueue());
        }
    }

    async handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.loadingElements.has(entry.target)) {
                const url = entry.target.dataset.src;
                if (!url) return;

                this.loadingElements.add(entry.target);
                this.loadQueue.push({ element: entry.target, url });
            }
        });

        if (!this.isProcessing) {
            this.processQueue();
        }
    }
}

// Gallery state management
const state = {
    currentImages: [],
    currentIndex: 0,
    currentView: 'albums',
    isTransitioning: false
};

// Constants
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
const ERROR_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlZmVmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2RjMzU0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

// Gallery data with proper file extensions
const albums = [ 
    { 
        title: "Shibamata Walk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shibamata1.jpeg?v=1746637235233" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shibamata2.jpeg?v=1746637235233" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shibamata3.jpeg?v=1746637235233" }
        ] 
    }, 
    { 
        title: "Kanda Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kanda1?v=1746211508651" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kanda2?v=1746211508651" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kanda3?v=1746211508651" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kanda4?v=1746211508651" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kanda5?v=1746211508651" }
        ] 
    },
    { 
        title: "Akihabara Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/aki1?v=1746291680107" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/aki2?v=1746291680107" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/aki3?v=1746291680107" }
        ] 
    },
    { 
        title: "Shimokitazawa Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo1.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo2.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo3.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo4.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo5.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo6.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo7.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo8.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo9.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo10.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo11.jpeg?v=1746638645681" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo12.jpeg?v=1746638645681" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo13.jpeg?v=1746638645681" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shimo14.jpeg?v=1746638645681" }
        ] 
    },
    { 
        title: "Kichijoji Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi8.jpeg?v=1746641501739" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi2.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi3.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi4.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi5.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi1.jpeg" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi6.jpeg?v=1746641501739" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi7.jpeg?v=1746641501739" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi9.jpeg?v=1746641501739" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi10.jpeg?v=1746641501739" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi11.jpeg?v=1746641501739" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kichi12.jpeg?v=1746641501739" }

        ] 
    },
    { 
        title: "Ochanomizu Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ocha1.jpeg?v=1746639271898" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ocha2.jpeg?v=1746639271898" }
        ] 
    },
    { 
        title: "Hanzomon Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo1.jpeg?v=1746639380873" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo2.jpeg?v=1746639380873" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo3.jpeg?v=1746639380873" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo4.jpeg?v=1746639380873" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo5.jpeg?v=1746639380873" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo6.jpeg?v=1746639380873" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hanzo7.jpeg?v=1746639380873" }

        ] 
    },
    { 
        title: "Hibiya Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hibi1.jpeg?v=1746639761941" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hibi2.jpeg?v=1746639761941" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hibi3.jpeg?v=1746639761941" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hibi4.jpeg?v=1746639761941" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hibi5.jpeg?v=1746639761941" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hibi6.jpeg?v=1746639761941" }
        ] 
    },
    { 
        title: "Tokyo Station Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/tok2.jpeg?v=1746640003247" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/tok1.jpeg?v=1746640003376" }
        ] 
    },
    { 
        title: "Shinjuku Gyoen Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shinju1.jpeg?v=1746640078052" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shinju2.jpeg?v=1746640078052" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shinju3.jpeg?v=1746640078052" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/shinju4.jpeg?v=1746640078052" }
        ] 
    },
    { 
        title: "Mizumoto Kouen Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/mizu1.jpeg?v=1746640201484" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/mizu2.jpeg?v=1746640201484" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/mizu3.jpeg?v=1746640201484" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/mizu4.jpeg?v=1746640201484" }
        ] 
    },
    { 
        title: "Yurakucho Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/yura3.jpeg?v=1746640333010" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/yura2.jpeg?v=1746640333010" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/yura1.jpeg?v=1746640333010" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/yura4.jpeg?v=1746640333010" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/yura5.jpeg?v=1746640333010" }
        ] 
    },
    { 
        title: "Tokyo International Forum", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/inter4.jpeg?v=1746640462017" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/inter3.jpeg?v=1746640462017" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/inter2.jpeg?v=1746640462017" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/inter1.jpeg?v=1746640462017" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/inter5.jpeg?v=1746640462017" }
        ] 
    },
    { 
        title: "Kabukicho Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kabu1.jpeg?v=1746640604139" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kabu2.jpeg?v=1746640604139" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kabu3.jpeg?v=1746640604139" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kabu4.jpeg?v=1746640604139" }
        ] 
    },
    { 
        title: "Kiba Kouen Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba4.jpeg?v=1746640711316" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba5.jpeg?v=1746640711316" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba3.jpeg?v=1746640711316" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba2.jpeg?v=1746640711316" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba1.jpeg?v=1746640711316" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba6.jpeg?v=17466423203836" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba7.jpeg?v=17466423203836" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba8.jpeg?v=17466423203836" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/kiba9.jpeg?v=17466423203836" }

        ] 
    },
    { 
        title: "Circle Exhibition", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex3.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex2.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex1.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex4.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex5.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex6.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex7.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex8.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex9.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex10.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex11.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex12.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex13.jpeg?v=1746640988677" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/ex14.jpeg?v=1746640988677" }
        ] 
    },
    { 
        title: "Halloween Party", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/halo1.jpeg?v=1746641222096" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/halo2.jpeg?v=1746641222096" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/halo3.jpeg?v=1746641222096" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/halo4.jpeg?v=1746641222096" }
        ] 
    },
    { 
        title: "Hie Shrine Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie4.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie3.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie2.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie1.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie5.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie6.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie7.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie8.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie9.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie10.jpeg?v=1746641316647" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hie11.jpeg?v=1746641316647" }
        ] 
    },
    { 
        title: "Harajuku Photowalk", 
        photos: [ 
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hara4.jpeg?v=1746641805001" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hara3.jpeg?v=1746641805001" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hara2.jpeg?v=1746641805001" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hara1.jpeg?v=1746641805001" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hara5.jpeg?v=1746641805001" },
            { url: "https://cdn.glitch.global/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce/hara6.jpeg?v=1746641805001" },
        ] 
    }
];

// Initialize lazy loader
const lazyLoader = new LazyLoader();

// Gallery initialization
async function initGallery() {
    const gallery = document.getElementById('gallery2');
    if (!gallery) throw new Error('Gallery element not found');

    // Clear gallery and show loading state
    gallery.innerHTML = '<div class="loading-spinner show-spinner"></div>';
    
    // Initialize with albums view after a short delay
    setTimeout(() => {
        showAlbums();
        // Hide spinner after loading
        const spinner = gallery.querySelector('.loading-spinner');
        if (spinner) spinner.classList.remove('show-spinner');
    }, 300);
}

// Show album photos
async function showAlbumPhotos(album) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;

    // Scroll to the top of the gallery smoothly
    const gallery = document.getElementById('gallery2');
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const fragment = document.createDocumentFragment();
    
    // Update state
    state.currentView = 'photos';
    state.currentImages = album.photos;
    state.currentIndex = 0;

    // Create back button as first grid item
    const backContainer = document.createElement('div');
    backContainer.className = 'gallery2-album back-button';
    backContainer.setAttribute('role', 'button');
    backContainer.setAttribute('tabindex', '0');
    backContainer.setAttribute('aria-label', 'Back to albums');
    backContainer.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backContainer.addEventListener('click', showAlbums);
    backContainer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showAlbums();
        }
    });
    fragment.appendChild(backContainer);

    // Create photo containers
    for (const photo of album.photos) {
        const container = document.createElement('div');
        container.className = 'gallery2-album';
        container.setAttribute('role', 'button');
        container.setAttribute('tabindex', '0');
        container.setAttribute('aria-label', 'View photo');

        const img = document.createElement('img');
        img.src = PLACEHOLDER_IMAGE;
        img.dataset.src = photo.url;
        img.alt = album.title;
        img.className = 'gallery2-thumb';

        container.appendChild(img);
        container.addEventListener('click', () => {
            state.currentIndex = album.photos.indexOf(photo);
            showViewer();
        });

        fragment.appendChild(container);
        lazyLoader.observe(img);
    }

    // Animate transition
    gallery.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, config.transitionDuration));
    gallery.innerHTML = '';
    gallery.appendChild(fragment);
    gallery.style.opacity = '1';

    state.isTransitioning = false;
}

// Show viewer
async function showViewer() {
    const viewer = document.querySelector('.viewer');
    const viewerImg = viewer.querySelector('.viewer-img');
    const loadingOverlay = viewer.querySelector('.loading-overlay');

    viewer.classList.add('active');
    document.body.classList.add('viewer-active'); // Add viewer-active class to body
    loadingOverlay.style.display = 'flex';
    viewerImg.style.opacity = '0';

    try {
        const img = await loadImage(state.currentImages[state.currentIndex].url, ERROR_IMAGE);
        viewerImg.src = img.src;
        viewerImg.style.opacity = '1';
        updateImageCounter();
    } catch (error) {
        console.error('Error loading viewer image:', error);
        viewerImg.src = ERROR_IMAGE;
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Navigation functions
function showAlbums() {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    
    const gallery = document.getElementById('gallery2');
    const fragment = document.createDocumentFragment();
    
    // Update state
    state.currentView = 'albums';
    
    // Animate transition
    gallery.style.opacity = '0';
    
    setTimeout(async () => {
        gallery.innerHTML = '';
        
        try {
            // Create album containers
            const albumsFragment = document.createDocumentFragment();
            
            for (const album of albums) {
                const container = document.createElement('div');
                container.className = 'gallery2-album';
                container.setAttribute('role', 'button');
                container.setAttribute('tabindex', '0');
                container.setAttribute('aria-label', `View ${album.title} album`);

                const img = document.createElement('img');
                img.src = PLACEHOLDER_IMAGE;
                img.dataset.src = album.photos[0].url;
                img.alt = album.title;
                img.className = 'gallery2-thumb';
                
                const title = document.createElement('h3');
                title.textContent = album.title;

                container.appendChild(img);
                container.appendChild(title);

                container.addEventListener('click', () => showAlbumPhotos(album));
                container.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showAlbumPhotos(album);
                    }
                });

                albumsFragment.appendChild(container);
                lazyLoader.observe(img);
            }

            gallery.appendChild(albumsFragment);
            gallery.style.opacity = '1';
        } catch (error) {
            console.error('Error showing albums:', error);
            gallery.innerHTML = '<p class="error-message">Failed to load albums. Please try again later.</p>';
        } finally {
            state.isTransitioning = false;
        }
    }, config.transitionDuration);
}

function showNextImage() {
    if (state.isTransitioning) return;
    state.currentIndex = (state.currentIndex + 1) % state.currentImages.length;
    showViewer();
}

function showPrevImage() {
    if (state.isTransitioning) return;
    state.currentIndex = (state.currentIndex - 1 + state.currentImages.length) % state.currentImages.length;
    showViewer();
}

function updateImageCounter() {
    const counter = document.querySelector('.image-counter');
    if (counter) {
        counter.textContent = `${state.currentIndex + 1} / ${state.currentImages.length}`;
    }
}

// Handle touch gestures and scroll lock
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}

function handleTouchEnd() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                showNextImage(); // Swipe left for next
            } else {
                showPrevImage(); // Swipe right for previous
            }
        }
    } else {
        // Vertical swipe
        if (diffY < -minSwipeDistance) {
            officialCloseViewer(); // Swipe up to close
        }
    }
}

function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
}

function enableScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
}

function officialCloseViewer() {
    const viewer = document.querySelector('.viewer');
    viewer.classList.remove('active');
    document.body.classList.remove('viewer-active'); // Remove viewer-active class from body
    enableScroll();
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Touch event listeners for viewer (DISABLED to prevent double swipe navigation)
    // const viewer = document.querySelector('.viewer');
    // viewer.addEventListener('touchstart', handleTouchStart, false);
    // viewer.addEventListener('touchmove', handleTouchMove, false);
    // viewer.addEventListener('touchend', handleTouchEnd, false);

    await initGallery();

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeColorMeta = document.getElementById('theme-color');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
        if (themeColorMeta) themeColorMeta.setAttribute('content', '#1a1a1a');
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (themeColorMeta) themeColorMeta.setAttribute('content', '#1a1a1a');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (themeColorMeta) themeColorMeta.setAttribute('content', '#ffffff');
        }
    });

    // Viewer navigation
    document.querySelector('.next-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    document.querySelector('.prev-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });

    document.querySelector('.close-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        officialCloseViewer();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.viewer.active')) return;
        
        switch(e.key) {
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'Escape':
                officialCloseViewer();
                break;
        }
    });

    // Close viewer on background click
    document.querySelector('.viewer').addEventListener('click', function(e) {
        if (e.target === this) {
            officialCloseViewer();
        }
    });
});

// Handle window resize
const handleResize = debounce(() => {
    document.body.classList.add('resize-animation-stopper');
    setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
}, 250);

window.addEventListener('resize', handleResize);
// Back to top button functionality
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
    const handleScroll = () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    };

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', handleScroll);
}