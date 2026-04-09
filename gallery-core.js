// Initialize Intersection Observer for page title
const pageTitleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            pageTitleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Observe page title and initialize album name toggle
document.addEventListener('DOMContentLoaded', () => {
    // Previous page title code
    document.querySelectorAll('.page-title').forEach(pageTitle => {
        pageTitleObserver.observe(pageTitle);
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
            { id: "shibamata1_foizui" },
            { id: "shibamata3_a1cqr1" },
            { id: "shibamata2_iclamt" }
        ] 
    }, 
    { 
        title: "Kanda Photowalk", 
        photos: [ 
            { id: "kanda1" },
            { id: "kanda2" },
            { id: "kanda3" },
            { id: "kanda4" },
            { id: "kanda5" }
        ] 
    },
    { 
        title: "Akihabara Photowalk", 
        photos: [ 
            { id: "aki1_biufkz" },
            { id: "aki2_aniqqo" },
            { id: "aki3_tthows" }
        ] 
    },
    { 
        title: "Shimokitazawa Photowalk", 
        photos: [ 
            { id: "shimo" },
            { id: "shimo-3" },
            { id: "shimo-2" },
            { id: "shimo-4" },
            { id: "shimo-5" },
            { id: "shimo-6" },
            { id: "shimo-7" },
            { id: "shimo-8" },
            { id: "shimo-9" },
            { id: "shimo-10" },
            { id: "shimo-11" },
            { id: "shimo-12" },
            { id: "shimo-13" },
            { id: "shimo-14" }

        ] 
    },
    { 
        title: "Kichijoji Photowalk", 
        photos: [ 
            { id: "kichi" },
            { id: "kichi-2" },
            { id: "kichi-3" },
            { id: "kichi-4" },
            { id: "kichi-5" },
            { id: "kichi-6" },
            { id: "kichi-7" },
            { id: "kichi-8" },
            { id: "kichi-9" },
            { id: "kichi-10" },
            { id: "kichi-11" },
            { id: "kichi-12" }
        ] 
    },
    { 
        title: "Ochanomizu Photowalk", 
        photos: [ 
            { id: "ocha" },
            { id: "ocha-2" }
        ] 
    },
    { 
        title: "Hanzomon Photowalk", 
        photos: [ 
            { id: "hanzo" },
            { id: "hanzo-2" },
            { id: "hanzo-3" },
            { id: "hanzo-4" },
            { id: "hanzo-5" },
            { id: "hanzo-6" },
            { id: "hanzo-7" }

        ] 
    },
    { 
        title: "Hibiya Photowalk", 
        photos: [ 
            { id: "hibi" },
            { id: "hibi-2" },
            { id: "hibi-3" },
            { id: "hibi-4" },
            { id: "hibi-5" },
            { id: "hibi-6" }
        ] 
    },
    { 
        title: "Tokyo Station Photowalk", 
        photos: [ 
            { id: "tok-2" },
            { id: "tok" }
        ] 
    },
    { 
        title: "Shinjuku Gyoen Photowalk", 
        photos: [ 
            { id: "shinju" },
            { id: "shinju-2" },
            { id: "shinju-3" },
            { id: "shinju-4" }
        ] 
    },
    { 
        title: "Mizumoto Kouen Photowalk", 
        photos: [ 
            { id: "mizu" },
            { id: "mizu-2" },
            { id: "mizu-3" },
            { id: "mizu-4" }
        ] 
    },
    { 
        title: "Yurakucho Photowalk", 
        photos: [ 
            { id: "yura" },
            { id: "yura-2" },
            { id: "yura-3" },
            { id: "yura-4" },
            { id: "yura-5" }
        ] 
    },
    { 
        title: "Tokyo International Forum", 
        photos: [ 
            { id: "inter" },
            { id: "inter-4" },
            { id: "inter-3" },
            { id: "inter-2" },
            { id: "inter-5" }
        ] 
    },
    { 
        title: "Kabukicho Photowalk", 
        photos: [ 
            { id: "kabu" },
            { id: "kabu-2" },
            { id: "kabu-3" },
            { id: "kabu-4" }
        ] 
    },
    { 
        title: "Kiba Kouen Photowalk", 
        photos: [ 
            { id: "kiba" },
            { id: "kiba-5" },
            { id: "kiba-3" },
            { id: "kiba-2" },
            { id: "kiba-4" },
            { id: "kiba-6" },
            { id: "kiba-7" },
            { id: "kiba-8" },
            { id: "kiba-9" }

        ] 
    },
    { 
        title: "Circle Exhibition", 
        photos: [ 
            { id: "ex-3" },
            { id: "ex-2" },
            { id: "ex" },
            { id: "ex-4" },
            { id: "ex-5" },
            { id: "ex-6" },
            { id: "ex-7" },
            { id: "ex-8" },
            { id: "ex-9" },
            { id: "ex-10" },
            { id: "ex-11" },
            { id: "ex-12" },
            { id: "ex-13" },
            { id: "ex-14" } 
        ] 
    },
    { 
        title: "Halloween Party", 
        photos: [ 
            { id: "halo" },
            { id: "halo-2" },
            { id: "halo-3" },
            { id: "halo-4" }
        ] 
    },
    { 
        title: "Hie Shrine Photowalk", 
        photos: [ 
            { id: "hie-4" },
            { id: "hie-3" },
            { id: "hie-2" },
            { id: "hie" },
            { id: "hie-5" },
            { id: "hie-6" },
            { id: "hie-7" },
            { id: "hie-8" },
            { id: "hie-9" },
            { id: "hie-10" },
            { id: "hie-11" }
        ] 
    },
    { 
        title: "Harajuku Photowalk", 
        photos: [ 
            { id: "hara-4" },
            { id: "hara-3" },
            { id: "hara-2" },
            { id: "hara" },
            { id: "hara-5" },
            { id: "hara-6" },
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

    // Preload first few viewer images of the album for instant viewing
    const initialPreloadUrls = [];
    for (let i = 0; i < Math.min(3, album.photos.length); i++) {
        initialPreloadUrls.push(getViewerUrl(album.photos[i].id || album.photos[i].url));
    }
    imageCache.preload(initialPreloadUrls);

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
        img.dataset.src = getThumbnailUrl(photo.id || photo.url);
        img.alt = album.title;
        img.className = 'gallery2-thumb';

        container.appendChild(img);
        
        // Preload viewer image on hover or touchstart for instant loading
        const preloadViewerImage = () => {
            const viewerUrl = getViewerUrl(photo.id || photo.url);
            imageCache.preload([viewerUrl]);
        };
        container.addEventListener('mouseenter', preloadViewerImage, { once: true });
        container.addEventListener('touchstart', preloadViewerImage, { once: true, passive: true });

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

    // Ensure proper order: first add the body class, then show the viewer
    document.body.classList.add('viewer-active');
    viewer.classList.add('active');

    const photoIdOrUrl = state.currentImages[state.currentIndex].id || state.currentImages[state.currentIndex].url;
    const imgUrl = getViewerUrl(photoIdOrUrl);
    const thumbUrl = getThumbnailUrl(photoIdOrUrl);

    // Aggressively preload next and previous images in background
    if (state.currentImages.length > 1) {
        const nextIndex = (state.currentIndex + 1) % state.currentImages.length;
        const prevIndex = (state.currentIndex - 1 + state.currentImages.length) % state.currentImages.length;
        
        const nextUrl = getViewerUrl(state.currentImages[nextIndex].id || state.currentImages[nextIndex].url);
        const prevUrl = getViewerUrl(state.currentImages[prevIndex].id || state.currentImages[prevIndex].url);
        
        imageCache.preload([nextUrl, prevUrl]);
        
        // Also preload 2 images ahead if possible
        if (state.currentImages.length > 2) {
            const nextNextIndex = (state.currentIndex + 2) % state.currentImages.length;
            const nextNextUrl = getViewerUrl(state.currentImages[nextNextIndex].id || state.currentImages[nextNextIndex].url);
            imageCache.preload([nextNextUrl]);
        }
    }

    // Fast path: if high-res image is already cached, show it instantly with no flash
    const cachedImage = imageCache.get(imgUrl);
    if (cachedImage) {
        viewerImg.src = cachedImage.src;
        viewerImg.style.opacity = '1';
        loadingOverlay.style.display = 'none';
        updateImageCounter();
        return;
    }

    // Fallback: instantly show the thumbnail as a placeholder to prevent black flashes
    viewerImg.src = thumbUrl;
    viewerImg.style.opacity = '1';
    loadingOverlay.style.display = 'flex';
    updateImageCounter();

    try {
        const img = await loadImage(imgUrl, ERROR_IMAGE);
        viewerImg.src = img.src;
    } catch (error) {
        console.error('Error loading viewer image:', error);
        viewerImg.src = ERROR_IMAGE;
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Navigation functions
function getThumbnailUrl(urlOrId) {
    if (!urlOrId) return '';
    if (!urlOrId.startsWith('http')) {
        return `https://res.cloudinary.com/drnh8zy84/image/upload/q_auto,f_auto,c_fill,w_400,h_400/${urlOrId}.jpg`;
    }
    if (!urlOrId.includes('cloudinary.com')) return urlOrId;
    
    if (urlOrId.includes('/q_auto/f_auto/')) {
        return urlOrId.replace('/q_auto/f_auto/', '/q_auto,f_auto,c_fill,w_400,h_400/');
    }
    
    if (urlOrId.includes('/upload/')) {
        return urlOrId.replace('/upload/', '/upload/q_auto,f_auto,c_fill,w_400,h_400/');
    }
    
    return urlOrId;
}

function getViewerUrl(urlOrId) {
    if (!urlOrId) return '';
    if (!urlOrId.startsWith('http')) {
        return `https://res.cloudinary.com/drnh8zy84/image/upload/q_auto,f_auto,w_1200/${urlOrId}.jpg`;
    }
    if (!urlOrId.includes('cloudinary.com')) return urlOrId;
    
    if (urlOrId.includes('/q_auto/f_auto/')) {
        return urlOrId.replace('/q_auto/f_auto/', '/q_auto,f_auto,w_1200/');
    }
    
    if (urlOrId.includes('/upload/')) {
        return urlOrId.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
    }
    
    return urlOrId;
}

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
                img.dataset.src = getThumbnailUrl(album.photos[0].id || album.photos[0].url);
                img.alt = album.title;
                img.className = 'gallery2-thumb';
                
                const title = document.createElement('h3');
                title.textContent = album.title;
                title.className = 'album-name'; // Add class for toggle functionality

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
    // First remove body classes to ensure UI elements are restored
    document.body.classList.remove('viewer-active');
    // Then close the viewer
    viewer.classList.remove('active');
    // Restore body styles
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.overscrollBehavior = '';
    // Remove background scroll prevention
    document.body.removeEventListener('touchmove', preventBodyScroll, { passive: false });
    enableScroll();
}

// Function to prevent background scroll on mobile
function preventBodyScroll(e) {
    e.preventDefault();
}



// Add swipe gesture support for official gallery viewer
(function() {
    const viewer = document.querySelector('.viewer');
    const viewerImg = viewer ? viewer.querySelector('.viewer-img') : null;
    if (!viewer || !viewerImg) return;

    let startX = 0, startY = 0, endX = 0, endY = 0;
    let isTouching = false;
    const minSwipeDist = 50;

    function handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!isTouching) return;
        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;
        // Prevent horizontal scroll when swiping left/right
        if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        if (!isTouching) return;
        isTouching = false;
        const dx = endX - startX;
        const dy = endY - startY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDist) {
            // Horizontal swipe
            e.preventDefault();
            if (dx < 0) {
                // Swipe left: next photo
                showNextImage();
            } else {
                // Swipe right: previous photo
                showPrevImage();
            }
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDist) {
            // Vertical swipe
            if (dy > 0) {
                // Swipe down: close viewer
                officialCloseViewer();
            }
        }
    }

    // Attach to both overlay and image for robustness
    [viewer, viewerImg].forEach(el => {
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd, { passive: false });
    });
})();

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

    document.querySelector('.photo-viewer-close').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        officialCloseViewer();
    });

    // Close button touch and click handling
    (function() {
        const closeBtn = document.querySelector('.viewer .photo-viewer-close');
        if (closeBtn) {
            let swipeJustHappened = false;
            let lastTouchTime = 0;
            const TAP_TIME = 300;

            // Handle touch events for close button
            closeBtn.addEventListener('touchend', function(e) {
                if (swipeJustHappened) {
                    e.preventDefault();
                    swipeJustHappened = false;
                    return;
                }
                e.stopPropagation();
                officialCloseViewer();
                lastTouchTime = Date.now();
            }, { passive: false });

            // Handle click events for close button
            closeBtn.addEventListener('click', function(e) {
                // Prevent double fire if a touch just happened
                if (Date.now() - lastTouchTime < TAP_TIME) {
                    e.preventDefault();
                    return;
                }
                if (swipeJustHappened) {
                    e.preventDefault();
                    swipeJustHappened = false;
                    return;
                }
                e.stopPropagation();
                officialCloseViewer();
            });

            // Improve mobile touch target
            if (window.innerWidth <= 768) {
                closeBtn.style.minWidth = '48px';
                closeBtn.style.minHeight = '48px';
                closeBtn.style.padding = '12px';
                closeBtn.style.margin = '8px';
            }
        }
    })();

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

    // Close viewer on background click/tap with improved handling
    (function() {
        const viewer = document.querySelector('.viewer');
        if (!viewer) return;

        let moved = false;
        let touchStartTime = 0;
        const TAP_TIME = 300;

        viewer.addEventListener('touchstart', () => {
            moved = false;
            touchStartTime = Date.now();
        }, { passive: true });

        viewer.addEventListener('touchmove', () => {
            moved = true;
        }, { passive: true });

        viewer.addEventListener('touchend', (e) => {
            if (e.target !== viewer) return;
            if (moved || (Date.now() - touchStartTime) > TAP_TIME) {
                e.stopImmediatePropagation();
                e.preventDefault();
                return;
            }
            officialCloseViewer();
        }, { passive: false });

        // Regular click handler for desktop
        viewer.addEventListener('click', function(e) {
            if (e.target === viewer) {
                officialCloseViewer();
            }
        });
    })();
});

// Handle window resize
const handleResize = debounce(() => {
    document.body.classList.add('resize-animation-stopper');
    setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
}, 250);

window.addEventListener('resize', handleResize);