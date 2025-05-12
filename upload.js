// Upload Page JavaScript

// Firebase and Cloudinary configuration
const firebaseConfig = {
  apiKey: "AIzaSyCARVdEDsQFKtNLfii8vf544sUEbYk1lL4",
  authDomain: "photo-uploader-e391e.firebaseapp.com",
  projectId: "photo-uploader-e391e",
  storageBucket: "photo-uploader-e391e.appspot.com",
  messagingSenderId: "543805502137",
  appId: "1:543805502137:web:41ccc19dbe37fcd4f92168",
  measurementId: "G-PWMM8LQ3L1"
};

const CLOUD_NAME = 'drnh8zy84';       // Cloudinary cloud name
const UPLOAD_PRESET = 'demo_preset';  // Upload preset

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const gallery = document.getElementById('gallery');
const loadingMessage = document.getElementById('loadingMessage');
const emptyGallery = document.getElementById('emptyGallery');
const talentType = document.getElementById('talentType');
const photographerSelect = document.getElementById('photographerSelect');
const photographerName = document.getElementById('photographerName');
const eventName = document.getElementById('eventName');
const fileUpload = document.getElementById('fileUpload');
const dropArea = document.getElementById('dropArea');
const selectedFileElement = document.getElementById('selectedFile');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const talentTypeFilters = document.getElementById('talentTypeFilters');
const photographerFilters = document.getElementById('photographerFilters');
const categorySelect = document.getElementById('categorySelect');
const slideshow = document.getElementById('slideshow');

// Store talent types
const talentTypes = ['photographer', 'hmu', 'model'];

// Store photographers list and categories
let photographers = ['all'];
let categories = [];
let currentTalentTypeFilter = 'all';
let currentPhotographerFilter = 'all';
let selectedFile = null;

// Add autocomplete logic for artist name
let artistNames = [];
let canonicalArtistMap = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Create back to top button
    const createBackToTopButton = () => {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.setAttribute('aria-label', 'Return to top of page');
        backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(backToTopBtn);

        // Add styles for the button
        const style = document.createElement('style');
        style.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--pastel-purple), var(--pastel-pink));
                color: white;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
                z-index: 998;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .back-to-top.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .back-to-top:hover {
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
                transform: translateY(-3px);
            }

            .back-to-top i {
                font-size: 1.2rem;
            }

            @media (max-width: 768px) {
                .back-to-top {
                    bottom: 20px;
                    right: 20px;
                    width: 45px;
                    height: 45px;
                }
            }
        `;
        document.head.appendChild(style);

        return backToTopBtn;
    };

    // Initialize back to top button only if not already present
    if (!document.getElementById('back-to-top')) {
      const backToTopBtn = createBackToTopButton();
      window.addEventListener('scroll', () => {
          if (window.scrollY > 300) {
              backToTopBtn.classList.add('show');
          } else {
              backToTopBtn.classList.remove('show');
          }
      });
      backToTopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({
              top: 0,
              behavior: 'smooth'
          });
      });
    }

  // Initialize slideshow
  initSlideshow();
  
  // Initialize dark mode toggle
  initDarkModeToggle();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize tips modal
  initTipsModal();
  
  // --- Only run old filter setup if old containers exist (upload section) ---
  if (typeof createTalentTypeFilters === 'function' && talentTypeFilters && photographerFilters) {
    createTalentTypeFilters();
    fetchPhotographers();
    setupTalentTypeSelection();
  }

  // --- Only run new community gallery filter code if new filter elements exist ---
  if (document.getElementById('talentTypeDropdown') && document.getElementById('artistNameDropdown')) {
    fetchCommunityGalleryImages();
  } else {
    // Fallback: fetch and display gallery for upload section
    fetchGalleryImages();
  }
  
  // Fetch categories
  fetchCategories();
  
  // Setup file upload UI
  setupFileUpload();
  
  // Setup artist autocomplete
  fetchArtistNames();
  setupArtistAutocomplete();
  
  // Setup form submission
  setupFormSubmission();
});

// Initialize slideshow with uploaded photos
function initSlideshow() {
  // First load default images in case there are no uploaded photos yet
  const defaultSlideshowImages = [
    ''
  ];
  
  // Create initial image elements with default images
  defaultSlideshowImages.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Slideshow image ${index + 1}`;
    img.className = index === 0 ? 'active' : '';
    img.loading = 'eager'; // Load first images eagerly
    slideshow.appendChild(img);
  });
  
  // Try to fetch uploaded photos for the slideshow
  fetchSlideshowImages();
  
  // Rotate images every 5 seconds with fade effect
  let currentSlide = 0;
  setInterval(() => {
    const images = slideshow.querySelectorAll('img');
    if (images.length > 0) {
      images[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % images.length;
      images[currentSlide].classList.add('active');
    }
  }, 7000); // Changed from 5000 to 7000 for a more relaxed slideshow pace
}

// Fetch uploaded photos for slideshow
async function fetchSlideshowImages() {
  try {
    const snapshot = await db.collection("photos")
      .where('status', '==', 'approved')
      .get();
    
    if (snapshot.empty) {
      return; // Keep default images if no photos are uploaded
    }
    
    // Get all photos from the database
    const photos = [];
    snapshot.forEach(doc => {
      photos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // If we have photos, clear the default slideshow images
    if (photos.length > 0) {
      slideshow.innerHTML = '';
      
      // Randomly select up to 6 photos for the slideshow
      const shuffledPhotos = shuffleArray(photos).slice(0, Math.min(6, photos.length));
      
      // Add the selected photos to the slideshow
      shuffledPhotos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo.imageUrl;
        img.alt = `Photo by ${photo.photographer}`;
        img.className = index === 0 ? 'active' : '';
        img.loading = 'eager'; // Load first image eagerly
        slideshow.appendChild(img);
      });
    }
  } catch (err) {
    console.error('Error fetching slideshow images:', err);
  }
}

// Helper function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Initialize dark mode toggle
function initDarkModeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  }
  
  // Toggle dark mode
  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });
}

// Initialize mobile menu
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  

}

// Initialize tips modal
function initTipsModal() {
  const tipsBtn = document.getElementById('tips-btn');
  const tipsModal = document.getElementById('tips-modal');
  const closeModal = document.getElementById('close-modal');
  
  if (tipsBtn && tipsModal && closeModal) {
    // Open modal when tips button is clicked
    tipsBtn.addEventListener('click', function() {
      tipsModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    });
    
    // Close modal when close button is clicked
    closeModal.addEventListener('click', function() {
      tipsModal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close modal when clicking outside the modal content
    tipsModal.addEventListener('click', function(e) {
      if (e.target === tipsModal) {
        tipsModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && tipsModal.classList.contains('active')) {
        tipsModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  }
}

// Create talent type filters
function createTalentTypeFilters() {
  // Create talent type filters container if it doesn't exist
  if (!talentTypeFilters) {
    const filtersContainer = photographerFilters.parentElement;
    const talentFiltersDiv = document.createElement('div');
    talentFiltersDiv.id = 'talentTypeFilters';
    talentFiltersDiv.className = 'gallery-filters talent-type-filters';
    filtersContainer.insertBefore(talentFiltersDiv, photographerFilters);
    
    // Add a title for the talent type filters
    const talentFilterTitle = document.createElement('h3');
    talentFilterTitle.textContent = 'Filter by Talent Type:';
    talentFilterTitle.className = 'filter-title';
    filtersContainer.insertBefore(talentFilterTitle, talentFiltersDiv);
    
    // Add a title for the photographer filters
    const photographerFilterTitle = document.createElement('h3');
    photographerFilterTitle.textContent = 'Filter by Name:';
    photographerFilterTitle.className = 'filter-title';
    filtersContainer.insertBefore(photographerFilterTitle, photographerFilters);
  }
  
  // Get the talent type filters container
  const talentTypeFiltersContainer = document.getElementById('talentTypeFilters');
  talentTypeFiltersContainer.innerHTML = '';
  
  // Add 'All Talents' filter button
  const allTalentsBtn = document.createElement('button');
  allTalentsBtn.className = 'filter-btn active';
  allTalentsBtn.setAttribute('data-talent-type', 'all');
  allTalentsBtn.textContent = 'All Talents';
  allTalentsBtn.addEventListener('click', function() {
    filterByTalentType('all');
  });
  talentTypeFiltersContainer.appendChild(allTalentsBtn);
  
  // Add filter button for each talent type
  const talentTypeLabels = {
    'photographer': 'Photographers',
    'hmu': 'Hair & Makeup Artists',
    'model': 'Models'
  };
  
  talentTypes.forEach(type => {
    const filterBtn = document.createElement('button');
    filterBtn.className = 'filter-btn';
    filterBtn.setAttribute('data-talent-type', type);
    filterBtn.textContent = talentTypeLabels[type];
    filterBtn.addEventListener('click', function() {
      filterByTalentType(type);
    });
    talentTypeFiltersContainer.appendChild(filterBtn);
  });
}

// Fetch photographers from database
async function fetchPhotographers(talentTypeFilter = 'all') {
  await fetchArtistNames(talentTypeFilter);
  if (typeof originalFetchPhotographers === 'function') {
    await originalFetchPhotographers(talentTypeFilter);
  }
}

// Setup talent type selection
function setupTalentTypeSelection() {
  talentType.addEventListener('change', function() {
    // Update the photographer label based on talent type
    const talentLabels = {
      'photographer': 'Photographer',
      'hmu': 'Hair & Makeup Artist',
      'model': 'Model'
    };
    
    const selectedType = this.value;
    if (selectedType) {
      const nameLabel = document.querySelector('label[for="photographerName"]');
      nameLabel.innerHTML = `${talentLabels[selectedType]} Name <span class="required">*</span>`;
      
      // Fetch photographers of the selected talent type
      fetchPhotographers(selectedType);
    }
  });
}

// Fetch categories from database
async function fetchCategories() {
  try {
    // Get existing options from the dropdown (skip the first one which is the placeholder)
    const existingOptions = Array.from(categorySelect.options)
      .slice(1) // Skip the first placeholder option
      .map(option => option.value.toLowerCase());
    
    // Fetch categories from database
    const snapshot = await db.collection("categories").get();
    categories = [];
    
    // Process categories from database
    snapshot.forEach(doc => {
      const category = doc.data().name;
      categories.push(category);
      
      // Only add to dropdown if it doesn't already exist
      if (!existingOptions.includes(category.toLowerCase())) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      }
    });
    
    // If no categories exist in database, add default ones
    if (categories.length === 0) {
      const defaultCategories = ['Portrait', 'Landscape', 'Street', 'Architecture', 'Nature', 'Event',];
      defaultCategories.forEach(category => {
        // Add to database
        db.collection("categories").add({
          name: category
        });
        
        // Don't need to add to dropdown as they're already in the HTML
      });
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// --- Community Gallery Filter Redesign ---
// Elements for new filter UI
const talentTypeDropdown = document.getElementById('talentTypeDropdown');
const artistNameDropdown = document.getElementById('artistNameDropdown');
const clearAllFiltersBtn = document.getElementById('clearAllFilters');
const activeFiltersDiv = document.getElementById('activeFilters');
const resultsCountDiv = document.getElementById('resultsCount');

// Store all loaded photos for filtering
let allCommunityPhotos = [];

// Fetch community gallery images and store for filtering
async function fetchCommunityGalleryImages() {
  try {
    loadingMessage.style.display = 'flex';
    gallery.innerHTML = '';
    emptyGallery.style.display = 'none';
    resultsCountDiv.style.display = 'none';

    const snapshot = await db.collection("photos")
      .where('status', '==', 'approved')
      .get();

    if (snapshot.empty) {
      loadingMessage.style.display = 'none';
      emptyGallery.style.display = 'block';
      return;
    }

    allCommunityPhotos = [];
    snapshot.forEach(doc => {
      allCommunityPhotos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by timestamp (newest first)
    allCommunityPhotos.sort((a, b) => b.timestamp - a.timestamp);

    // Populate artist dropdown
    populateArtistDropdown();

    // Display filtered photos
    displayCommunityFilteredGallery();
    loadingMessage.style.display = 'none';
  } catch (err) {
    console.error('Error fetching gallery images:', err);
    loadingMessage.style.display = 'none';
  }
}

// Populate artist name dropdown based on current talent type filter
function populateArtistDropdown() {
  let filtered = allCommunityPhotos;
  if (currentTalentTypeFilter !== 'all') {
    filtered = filtered.filter(photo => photo.talentType === currentTalentTypeFilter);
  }
  // Get unique artist names
  const names = Array.from(new Set(filtered.map(photo => photo.photographer))).sort();
  artistNameDropdown.innerHTML = '<option value="all">All Artists</option>';
  names.forEach(name => {
    if (name && name.trim()) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      artistNameDropdown.appendChild(opt);
    }
  });
}

// Display community gallery based on current filters
function displayCommunityFilteredGallery() {
  let photos = allCommunityPhotos;
  if (currentTalentTypeFilter !== 'all') {
    photos = photos.filter(photo => photo.talentType === currentTalentTypeFilter);
  }
  if (currentPhotographerFilter !== 'all') {
    photos = photos.filter(photo => photo.photographer === currentPhotographerFilter);
  }

  // Show result count
  resultsCountDiv.style.display = 'block';
  resultsCountDiv.textContent = `${photos.length} result${photos.length === 1 ? '' : 's'} found`;

  // Show/hide empty state
  if (photos.length === 0) {
    emptyGallery.style.display = 'block';
    gallery.innerHTML = '';
    return;
  } else {
    emptyGallery.style.display = 'none';
  }

  // Render gallery
  gallery.innerHTML = '';
  photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = `Photo by ${photo.photographer}`;
    img.loading = 'lazy';
    img.addEventListener('click', () => {
      currentViewerPhotos = photos.slice(); // Always fresh copy
      currentPhotoIndex = index;
      openPhotoViewer(currentPhotoIndex);
    });
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    // Make info section clickable
    info.addEventListener('click', () => {
      currentViewerPhotos = photos.slice(); // Always fresh copy
      currentPhotoIndex = index;
      openPhotoViewer(currentPhotoIndex);
    });
    // Add "Uploaded by" label
    const uploadedBy = document.createElement('div');
    uploadedBy.className = 'uploaded-by';
    uploadedBy.textContent = 'Uploaded by';
    info.appendChild(uploadedBy);
    const title = document.createElement('h3');
    title.textContent = photo.photographer;
    info.appendChild(title);
    const talentTypeLabels = {
      'photographer': 'Photographer',
      'hmu': 'Hair & Makeup Artist',
      'model': 'Model'
    };
    const talentType = document.createElement('p');
    talentType.textContent = photo.talentType ? talentTypeLabels[photo.talentType] || 'Talent' : 'Photographer';
    talentType.className = 'gallery-item-talent-type';
    info.appendChild(talentType);
    // Removed event and category display
    item.appendChild(img);
    item.appendChild(info);
    gallery.appendChild(item);
  });
  setTimeout(() => {
    gallery.style.opacity = '1';
  }, 50);
  updateActiveFiltersUI();
}

// Update active filter chips UI
function updateActiveFiltersUI() {
  const chips = [];
  if (currentTalentTypeFilter !== 'all') {
    const label = {
      'photographer': 'Photographer',
      'hmu': 'Hair & Makeup',
      'model': 'Model'
    }[currentTalentTypeFilter] || currentTalentTypeFilter;
    chips.push(`<span class="active-filter-chip" data-type="talent"><span>${label}</span><button class="remove-chip" title="Remove talent filter">&times;</button></span>`);
  }
  if (currentPhotographerFilter !== 'all') {
    chips.push(`<span class="active-filter-chip" data-type="artist"><span>${currentPhotographerFilter}</span><button class="remove-chip" title="Remove artist filter">&times;</button></span>`);
  }
  activeFiltersDiv.innerHTML = chips.join('');
  activeFiltersDiv.style.display = chips.length ? 'flex' : 'none';

  // Add event listeners for chip removal
  activeFiltersDiv.querySelectorAll('.active-filter-chip').forEach(chip => {
    chip.querySelector('.remove-chip').addEventListener('click', () => {
      if (chip.getAttribute('data-type') === 'talent') {
        currentTalentTypeFilter = 'all';
        talentTypeDropdown.value = 'all';
        populateArtistDropdown();
      }
      if (chip.getAttribute('data-type') === 'artist') {
        currentPhotographerFilter = 'all';
        artistNameDropdown.value = 'all';
      }
      displayCommunityFilteredGallery();
      updateClearAllBtn();
    });
  });
  updateClearAllBtn();
}

// Update clear all button visibility
function updateClearAllBtn() {
  if (currentTalentTypeFilter !== 'all' || currentPhotographerFilter !== 'all') {
    clearAllFiltersBtn.style.display = 'inline-block';
  } else {
    clearAllFiltersBtn.style.display = 'none';
  }
}

// Event listeners for dropdowns and clear button
if (talentTypeDropdown && artistNameDropdown && clearAllFiltersBtn) {
  talentTypeDropdown.addEventListener('change', function() {
    currentTalentTypeFilter = this.value;
    currentPhotographerFilter = 'all';
    artistNameDropdown.value = 'all';
    populateArtistDropdown();
    displayCommunityFilteredGallery();
    updateClearAllBtn();
  });
  artistNameDropdown.addEventListener('change', function() {
    currentPhotographerFilter = this.value;
    displayCommunityFilteredGallery();
    updateClearAllBtn();
  });
  clearAllFiltersBtn.addEventListener('click', function() {
    currentTalentTypeFilter = 'all';
    currentPhotographerFilter = 'all';
    talentTypeDropdown.value = 'all';
    artistNameDropdown.value = 'all';
    populateArtistDropdown();
    displayCommunityFilteredGallery();
    updateClearAllBtn();
  });
}

// Photo viewer elements
const photoViewer = document.getElementById('photoViewer');
const viewerImage = document.getElementById('viewerImage');
const closeViewer = document.getElementById('closeViewer');
const prevPhoto = document.getElementById('prevPhoto');
const nextPhoto = document.getElementById('nextPhoto');
const thumbnailStrip = document.getElementById('thumbnailStrip');

// Photo viewer state
let currentPhotoIndex = 0;
let currentViewerPhotos = [];

// Display gallery images
function displayGallery(photos) {
  // Only show loading spinner if this section is visible
  const communitySection = document.getElementById('community-gallery-section');
  if (communitySection && communitySection.style.display !== 'none') {
    loadingMessage.style.display = 'block';
    console.log('Loader shown (displayGallery)');
  } else {
    loadingMessage.style.display = 'none';
    console.log('Loader hidden (displayGallery, not visible)');
  }
  gallery.innerHTML = '';
  
  // Filter photos by talent type if needed
  if (currentTalentTypeFilter !== 'all') {
    photos = photos.filter(photo => photo.talentType === currentTalentTypeFilter);
  }
  
  // Filter photos by photographer if needed
  if (currentPhotographerFilter !== 'all') {
    photos = photos.filter(photo => photo.photographer === currentPhotographerFilter);
  }
  
  if (photos.length === 0) {
    emptyGallery.style.display = 'block';
    gallery.style.opacity = '1'; // Ensure gallery is visible even when empty
    loadingMessage.style.display = 'none';
    console.log('Loader hidden (no photos)');
    return;
  }
  
  emptyGallery.style.display = 'none';
  
  photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = `Photo by ${photo.photographer}`;
    img.loading = 'lazy';
    
    // Make image clickable
    img.addEventListener('click', () => {
      currentViewerPhotos = photos.slice(); // Always fresh copy
      currentPhotoIndex = photos.findIndex(p => p.imageUrl === photo.imageUrl);
      openPhotoViewer(currentPhotoIndex);
    });
    
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    
    // Make info section clickable
    info.addEventListener('click', () => {
      currentViewerPhotos = photos.slice(); // Always fresh copy
      currentPhotoIndex = photos.findIndex(p => p.imageUrl === photo.imageUrl);
      openPhotoViewer(currentPhotoIndex);
    });
    
    const title = document.createElement('h3');
    title.textContent = photo.photographer;
    
    // Add talent type label
    const talentTypeLabels = {
      'photographer': 'Photographer',
      'hmu': 'Hair & Makeup Artist',
      'model': 'Model'
    };
    const talentType = document.createElement('p');
    talentType.textContent = photo.talentType ? talentTypeLabels[photo.talentType] || 'Talent' : 'Photographer';
    talentType.className = 'gallery-item-talent-type';
    
    info.appendChild(title);
    info.appendChild(talentType);
    // Removed event and category display
    
    item.appendChild(img);
    item.appendChild(info);
    
    gallery.appendChild(item);
  });
  
  // Remove fade-in effect: gallery is always visible
  loadingMessage.style.display = 'none';
  console.log('Loader hidden (gallery rendered)');
}

// Hide left/right arrows on mobile
function updateNavArrowsForMobile() {
  if (window.innerWidth <= 768) {
    if (prevPhoto) prevPhoto.style.display = 'none';
    if (nextPhoto) nextPhoto.style.display = 'none';
  } else {
    if (prevPhoto) prevPhoto.style.display = currentPhotoIndex > 0 ? 'block' : 'none';
    if (nextPhoto) nextPhoto.style.display = currentPhotoIndex < currentViewerPhotos.length - 1 ? 'block' : 'none';
  }
}
window.addEventListener('resize', updateNavArrowsForMobile);

// Call on open
function openPhotoViewer(index) {
  currentPhotoIndex = index;
  updatePhotoViewer();
  photoViewer.classList.add('active');
  document.body.classList.add('photo-viewer-active');
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';
  document.body.style.overscrollBehavior = 'contain';
  // Prevent background scroll on mobile
  document.body.addEventListener('touchmove', preventBodyScroll, { passive: false });
  // Use consolidated keyboard navigation
  if (window.setupKeyboardNavigation) {
    window.setupKeyboardNavigation();
  }
  updateNavArrowsForMobile();
}

function preventBodyScroll(e) {
  e.preventDefault();
}

// Update photo viewer content
function updatePhotoViewer() {
  const photo = currentViewerPhotos[currentPhotoIndex];
  viewerImage.src = photo.imageUrl;
  viewerImage.alt = `Photo by ${photo.photographer}`;
  
  // Update navigation buttons
  prevPhoto.style.display = currentPhotoIndex > 0 ? 'block' : 'none';
  nextPhoto.style.display = currentPhotoIndex < currentViewerPhotos.length - 1 ? 'block' : 'none';
  
  // Update thumbnails
  updateThumbnails();
  updateNavArrowsForMobile();
}

// Update thumbnail strip
function updateThumbnails() {
  thumbnailStrip.innerHTML = '';
  
  // Container for thumbnails
  const thumbsContainer = document.createElement('div');
  thumbsContainer.className = 'thumbnail-container';
  thumbnailStrip.appendChild(thumbsContainer);

  currentViewerPhotos.forEach((photo, index) => {
    const thumb = document.createElement('div');
    thumb.className = `photo-viewer-thumbnail-wrapper${index === currentPhotoIndex ? ' active' : ''}`;
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', `View photo ${index + 1}`);
    thumb.setAttribute('data-index', index);

    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = `Thumbnail ${index + 1}`;
    img.className = 'photo-viewer-thumbnail';
    thumb.appendChild(img);

    // Click/keyboard navigation only
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentPhotoIndex !== index) {
        currentPhotoIndex = index;
        updatePhotoViewer();
      }
    });
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (currentPhotoIndex !== index) {
          currentPhotoIndex = index;
          updatePhotoViewer();
        }
      }
    });
    thumbsContainer.appendChild(thumb);
  });

  // Center active thumbnail
  setTimeout(() => {
    const activeThumb = thumbnailStrip.querySelector('.photo-viewer-thumbnail-wrapper.active');
    if (activeThumb) {
      const stripRect = thumbnailStrip.getBoundingClientRect();
      const thumbRect = activeThumb.getBoundingClientRect();
      const scrollLeft = (activeThumb.offsetLeft + thumbRect.width/2) - (stripRect.width/2);
      thumbnailStrip.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, 0);
}

// Add navigation for prev/next buttons (community gallery viewer)
let swipeLock = false;
if (prevPhoto && nextPhoto) {
  prevPhoto.addEventListener('click', function(e) {
    if (swipeLock) return;
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      currentPhotoIndex--;
      updatePhotoViewer();
    }
  });
  nextPhoto.addEventListener('click', function(e) {
    if (swipeLock) return;
    e.stopPropagation();
    if (currentPhotoIndex < currentViewerPhotos.length - 1) {
      currentPhotoIndex++;
      updatePhotoViewer();
    }
  });
}
// --- Swipe support for photo viewer ---
(function() {
  if (!photoViewer || !viewerImage) return;

  const state = {
    isTouching: false,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
    moved: false,
    swipeJustHappened: false,
    lastTouchTime: 0,
  };

  const MIN_SWIPE_DISTANCE = 50;

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    isTouching = true;
    swipeJustHappened = false;
    moved = false;
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
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > MIN_SWIPE_DISTANCE) {
      // Horizontal swipe
      e.preventDefault();
      swipeJustHappened = true;
      swipeLock = true;
      setTimeout(() => { swipeLock = false; }, 350); // lock out button for 350ms
      if (dx < 0) {
        // Swipe left: next photo
        if (currentPhotoIndex < currentViewerPhotos.length - 1) {
          currentPhotoIndex++;
          updatePhotoViewer();
        }
      } else {
        // Swipe right: previous photo
        if (currentPhotoIndex > 0) {
          currentPhotoIndex--;
          updatePhotoViewer();
        }
      }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > MIN_SWIPE_DISTANCE) {
      // Vertical swipe
      if (dy > 0) {
        // Swipe down: close viewer
        swipeJustHappened = true;
        closePhotoViewer();
        lastTouchTime = Date.now();
      }
    }
  }
  // Attach to both overlay and image for robustness
  [photoViewer, viewerImage].forEach(el => {
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
  });
  // Make close button easier to tap on mobile
  if (window.innerWidth <= 768) {
    closeViewer.style.minWidth = '48px';
    closeViewer.style.minHeight = '48px';
    closeViewer.style.padding = '12px';
    closeViewer.style.margin = '8px';
    closeViewer.style.zIndex = '10001';
    closeViewer.style.touchAction = 'manipulation';
  }
})();

// Close photo viewer and clean up event listeners
function closePhotoViewer() {
  photoViewer.classList.remove('active');
  document.body.classList.remove('photo-viewer-active');
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  document.body.style.overscrollBehavior = '';
  
  // Remove background scroll prevention
  document.body.removeEventListener('touchmove', preventBodyScroll, { passive: false });
  
  // Clean up keyboard navigation
  if (window.cleanupKeyboardNavigation) {
    window.cleanupKeyboardNavigation();
  }

  // Reset state
  currentPhotoIndex = 0;
  currentViewerPhotos = [];

  // Remove focus from thumbnails
  const activeThumbnail = thumbnailStrip.querySelector('.photo-viewer-thumbnail-wrapper.active');
  if (activeThumbnail) {
    activeThumbnail.blur();
  }
}

// Add keyboard navigation
window.setupKeyboardNavigation = function() {
  const handleKeyboard = (e) => {
    if (!photoViewer.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }

    switch (e.key) {
      case 'Escape':
        closePhotoViewer();
        break;
      case 'ArrowLeft':
        if (currentPhotoIndex > 0) {
          currentPhotoIndex--;
          updatePhotoViewer();
        }
        break;
      case 'ArrowRight':
        if (currentPhotoIndex < currentViewerPhotos.length - 1) {
          currentPhotoIndex++;
          updatePhotoViewer();
        }
        break;
      case 'Home':
        e.preventDefault();
        currentPhotoIndex = 0;
        updatePhotoViewer();
        break;
      case 'End':
        e.preventDefault();
        currentPhotoIndex = currentViewerPhotos.length - 1;
        updatePhotoViewer();
        break;
    }
  };

  document.addEventListener('keydown', handleKeyboard);
  window.cleanupKeyboardNavigation = () => {
    document.removeEventListener('keydown', handleKeyboard);
  };
};

// Filter gallery by talent type
function filterByTalentType(talentType) {
  currentTalentTypeFilter = talentType;
  currentPhotographerFilter = 'all'; // Reset photographer filter when changing talent type
  
  // Update active button for talent type
  document.querySelectorAll('#talentTypeFilters .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-talent-type') === talentType);
  });
  
  // Reset photographer filter buttons
  document.querySelectorAll('#photographerFilters .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-photographer') === 'all');
  });
  
  // Fetch photographers of the selected talent type for the filter
  if (talentType !== 'all') {
    fetchPhotographers(talentType);
  } else {
    fetchPhotographers();
  }
  
  // Add fade-out effect before changing content
  gallery.style.opacity = '0';
  gallery.style.transition = 'opacity 0.3s ease';
  
  // Wait for fade-out to complete before fetching new images
  setTimeout(() => {
    // Fetch and display filtered images
    fetchCommunityGalleryImages();
  }, 300);
}

// Filter gallery by photographer
function filterByPhotographer(photographer) {
  currentPhotographerFilter = photographer;
  
  // Update active button for photographer
  document.querySelectorAll('#photographerFilters .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-photographer') === photographer);
  });
  
  // Add fade-out effect before changing content
  gallery.style.opacity = '0';
  gallery.style.transition = 'opacity 0.3s ease';
  
  // Wait for fade-out to complete before fetching new images
  setTimeout(() => {
    // Fetch and display filtered images
    fetchCommunityGalleryImages();
  }, 300);
}

// Setup file upload UI
function setupFileUpload() {
  // Handle file selection
  fileUpload.addEventListener('change', handleFileSelect);
  
  // Handle drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    dropArea.classList.add('highlight');
  }
  
  function unhighlight() {
    dropArea.classList.remove('highlight');
  }
  
  dropArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      fileUpload.files = files;
      handleFileSelect();
    }
  }
  
  // Click on drop area to trigger file input
  dropArea.addEventListener('click', () => {
    fileUpload.click();
  });
  
  // Remove selected file
  removeFile.addEventListener('click', () => {
    fileUpload.value = '';
    selectedFileElement.classList.remove('active');
    selectedFile = null;
  });
}

// Handle file selection
function handleFileSelect() {
  if (fileUpload.files.length > 0) {
    const file = fileUpload.files[0];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      fileUpload.value = '';
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      alert('Only image files are allowed.');
      fileUpload.value = '';
      return;
    }
    
    // Display selected file
    fileName.textContent = file.name;
    selectedFileElement.classList.add('active');
    selectedFile = file;
  }
}

// Setup artist autocomplete
function setupArtistAutocomplete() {
  const input = document.getElementById('photographerName');
  const list = document.getElementById('artistAutocompleteList');
  let currentFocus = -1;

  input.addEventListener('input', function() {
    const val = this.value;
    list.innerHTML = '';
    list.classList.remove('show');
    if (!val) return;
    const suggestions = artistNames.filter(name => name.toLowerCase().includes(val.toLowerCase()));
    if (suggestions.length === 0) return;
    suggestions.forEach((name, idx) => {
      const div = document.createElement('div');
      div.className = 'artist-autocomplete-suggestion';
      // Highlight match
      const regex = new RegExp(`(${val})`, 'i');
      div.innerHTML = name.replace(regex, '<strong>$1</strong>');
      div.addEventListener('mousedown', function(e) {
        e.preventDefault();
        input.value = name;
        list.innerHTML = '';
        list.classList.remove('show');
      });
      list.appendChild(div);
    });
    list.classList.add('show');
    currentFocus = -1;
  });

  input.addEventListener('keydown', function(e) {
    let items = list.getElementsByClassName('artist-autocomplete-suggestion');
    if (e.key === 'ArrowDown') {
      currentFocus++;
      addActive(items);
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      addActive(items);
    } else if (e.key === 'Enter') {
      if (currentFocus > -1 && items[currentFocus]) {
        e.preventDefault();
        items[currentFocus].dispatchEvent(new Event('mousedown'));
      }
    }
  });

  document.addEventListener('click', function(e) {
    if (!list.contains(e.target) && e.target !== input) {
      list.innerHTML = '';
      list.classList.remove('show');
    }
  });

  function addActive(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add('active');
    items[currentFocus].scrollIntoView({block: 'nearest'});
  }
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('active');
    }
  }
}

// Fetch artist names from database
async function fetchArtistNames(talentTypeFilter = 'all') {
  try {
    let query = db.collection("photographers");
    if (talentTypeFilter !== 'all') {
      query = query.where('talentType', '==', talentTypeFilter);
    }
    const snapshot = await query.get();
    artistNames = [];
    canonicalArtistMap = {};
    snapshot.forEach(doc => {
      const name = doc.data().name;
      if (name && name.trim()) {
        artistNames.push(name);
        canonicalArtistMap[name.toLowerCase()] = name;
      }
    });
    artistNames = Array.from(new Set(artistNames)).sort();
  } catch (err) {
    console.error('Error fetching artist names:', err);
  }
}

// Setup form submission
function setupFormSubmission() {
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateForm()) return;
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;
    try {
      // Upload image to Cloudinary (with progress)
      const imageUrl = await uploadToCloudinary(selectedFile);
      // Use normalized artist name
      const normalizedName = normalizeArtistName(photographerName.value);
      photographerName.value = normalizedName;
      // Save to Firestore with pending status
      await saveToFirestore(imageUrl, 'pending');
      // Add photographer to database if new (case-insensitive)
      if (!artistNames.map(n => n.toLowerCase()).includes(normalizedName.toLowerCase())) {
        await db.collection("photographers").add({
          name: normalizedName,
          talentType: talentType.value
        });
        artistNames.push(normalizedName);
        canonicalArtistMap[normalizedName.toLowerCase()] = normalizedName;
      }
      resetForm();
      if (document.getElementById('uploadForm')) fetchGalleryImages();
      showNotification('Photo uploaded successfully and will appear in our gallery after approval.', 'success');
    } catch (err) {
      console.error('Error uploading photo:', err);
      showNotification('Error uploading photo. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      hideUploadProgress();
    }
  });
}

// Validate form
function validateForm() {
  let isValid = true;
  
  // Check talent type
  if (!talentType.value) {
    showFieldError(talentType, 'Please select your talent type');
    isValid = false;
  } else {
    clearFieldError(talentType);
  }
  
  // Check file
  if (!selectedFile) {
    showFieldError(fileUpload, 'Please select a photo to upload');
    isValid = false;
  } else {
    clearFieldError(fileUpload);
  }
  
  return isValid;
}

// Show field error
function showFieldError(field, message) {
  const formGroup = field.closest('.form-group');
  formGroup.classList.add('error');
  
  // Create or update error message
  let errorMsg = formGroup.querySelector('.error-message');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    formGroup.appendChild(errorMsg);
  }
  errorMsg.textContent = message;
}

// Clear field error
function clearFieldError(field) {
  const formGroup = field.closest('.form-group');
  formGroup.classList.remove('error');
  
  const errorMsg = formGroup.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}

// Upload image to Cloudinary
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.upload.addEventListener('progress', function(e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        showUploadProgress(percent);
      }
    });
    xhr.onload = function() {
      hideUploadProgress();
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error('Failed to upload image'));
        }
      } else {
        reject(new Error('Failed to upload image'));
      }
    };
    xhr.onerror = function() {
      hideUploadProgress();
      reject(new Error('Failed to upload image'));
    };
    xhr.send(formData);
    showUploadProgress(0);
  });
}

// Save to Firestore
async function saveToFirestore(imageUrl, status = 'pending') {
  return db.collection("photos").add({
    talentType: talentType.value,
    photographer: photographerName.value.trim(),
    event: eventName.value.trim() || null,
    category: categorySelect.value || 'Uncategorized',
    imageUrl: imageUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    status: status,
    moderatedAt: null
  });
}

// Reset form
function resetForm() {
  uploadForm.reset();
  selectedFileElement.classList.remove('active');
  selectedFile = null;
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <p>${message}</p>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-hide after 5 seconds
  const hideTimeout = setTimeout(() => {
    hideNotification(notification);
  }, 5000);
  
  // Close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    clearTimeout(hideTimeout);
    hideNotification(notification);
  });
}

// Hide notification
function hideNotification(notification) {
  notification.classList.remove('show');
  notification.classList.add('hide');
  
  // Remove from DOM after animation
  setTimeout(() => {
    notification.remove();
  }, 300);
}

// Restore original fetchGalleryImages for upload section
async function fetchGalleryImages() {
  try {
    loadingMessage.style.display = 'flex';
    gallery.innerHTML = '';
    emptyGallery.style.display = 'none';

    const snapshot = await db.collection("photos")
      .where('status', '==', 'approved')
      .get();

    if (snapshot.empty) {
      loadingMessage.style.display = 'none';
      emptyGallery.style.display = 'block';
      return;
    }

    const photos = [];
    snapshot.forEach(doc => {
      photos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by timestamp (newest first)
    photos.sort((a, b) => b.timestamp - a.timestamp);

    displayGallery(photos);
    loadingMessage.style.display = 'none';
  } catch (err) {
    console.error('Error fetching gallery images:', err);
    loadingMessage.style.display = 'none';
  }
}

// Show upload progress
function showUploadProgress(percent) {
  const bar = document.getElementById('uploadProgressBar');
  const fill = document.getElementById('uploadProgressFill');
  const label = document.getElementById('uploadProgressLabel');
  if (bar && fill && label) {
    bar.classList.add('show');
    fill.style.width = percent + '%';
    label.textContent = percent + '%';
  }
}

function hideUploadProgress() {
  const bar = document.getElementById('uploadProgressBar');
  const fill = document.getElementById('uploadProgressFill');
  const label = document.getElementById('uploadProgressLabel');
  if (bar && fill && label) {
    bar.classList.remove('show');
    fill.style.width = '0%';
    label.textContent = '0%';
  }
}

// Normalize artist name
function normalizeArtistName(name) {
  const lower = name.trim().toLowerCase();
  return canonicalArtistMap[lower] || name.trim();
}

// Remove all previous closeViewer event listeners and logic
// Add a single, robust close button handler
const closeBtn = document.getElementById('closeViewer');
if (closeBtn) {
  closeBtn.onclick = function(e) {
    e.preventDefault();
    closePhotoViewer();
  };
  closeBtn.ontouchend = function(e) {
    e.preventDefault();
    closePhotoViewer();
  };
  // Make sure it's always visible and on top
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '16px';
  closeBtn.style.right = '16px';
  closeBtn.style.zIndex = '10001';
  closeBtn.style.minWidth = '48px';
  closeBtn.style.minHeight = '48px';
  closeBtn.style.padding = '12px';
  closeBtn.style.background = 'rgba(0,0,0,0.7)';
  closeBtn.style.color = '#fff';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.fontSize = '2rem';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';
  closeBtn.style.cursor = 'pointer';
}