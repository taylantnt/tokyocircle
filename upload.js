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
const photographerSelect = document.getElementById('photographerSelect');
const photographerName = document.getElementById('photographerName');
const eventName = document.getElementById('eventName');
const fileUpload = document.getElementById('fileUpload');
const dropArea = document.getElementById('dropArea');
const selectedFileElement = document.getElementById('selectedFile');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const photographerFilters = document.getElementById('photographerFilters');
const categorySelect = document.getElementById('categorySelect');
const slideshow = document.getElementById('slideshow');

// Store photographers list and categories
let photographers = ['all'];
let categories = [];
let currentFilter = 'all';
let selectedFile = null;

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

    // Initialize back to top button
    const backToTopBtn = createBackToTopButton();

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // Smooth scroll to top when button is clicked
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

  // Initialize slideshow
  initSlideshow();
  
  // Initialize dark mode toggle
  initDarkModeToggle();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize tips modal
  initTipsModal();
  
  // Fetch photographers and populate select
  fetchPhotographers();
  
  // Fetch categories
  fetchCategories();
  
  // Fetch gallery images
  fetchGalleryImages();
  
  // Setup file upload UI
  setupFileUpload();
  
  // Setup photographer selection
  setupPhotographerSelection();
  
  // Setup form submission
  setupFormSubmission();
});

// Initialize slideshow with uploaded photos
function initSlideshow() {
  // First load default images in case there are no uploaded photos yet
  const defaultSlideshowImages = [
    'https://source.unsplash.com/random/1600x900/?photography,camera',
    'https://source.unsplash.com/random/1600x900/?photography,portrait',
    'https://source.unsplash.com/random/1600x900/?photography,landscape',
    'https://source.unsplash.com/random/1600x900/?photography,street',
    'https://source.unsplash.com/random/1600x900/?photography,nature'
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
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
      document.body.classList.toggle('menu-open');
      document.body.classList.toggle('active', navLinks.classList.contains('active'));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.classList.remove('active');
      }
    });
  }
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

// Fetch photographers from database
async function fetchPhotographers() {
  try {
    const snapshot = await db.collection("photographers").get();
    photographers = ['all']; // Reset with 'all' option
    
    // Clear existing filter buttons
    photographerFilters.innerHTML = '';
    
    // Add 'All Photos' filter button
    const allFilterBtn = document.createElement('button');
    allFilterBtn.className = 'filter-btn active'; // Set as active by default
    allFilterBtn.setAttribute('data-photographer', 'all');
    allFilterBtn.textContent = 'All Photos';
    allFilterBtn.addEventListener('click', function() {
      filterGallery('all');
    });
    photographerFilters.appendChild(allFilterBtn);
    
    snapshot.forEach(doc => {
      const name = doc.data().name;
      photographers.push(name);
      
      // Add to select dropdown
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      photographerSelect.appendChild(option);
      
      // Add filter button
      const filterBtn = document.createElement('button');
      filterBtn.className = 'filter-btn';
      filterBtn.setAttribute('data-photographer', name);
      filterBtn.textContent = name;
      filterBtn.addEventListener('click', function() {
        filterGallery(name);
      });
      photographerFilters.appendChild(filterBtn);
    });
  } catch (err) {
    console.error('Error fetching photographers:', err);
  }
}

// Fetch categories from database
async function fetchCategories() {
  try {
    const snapshot = await db.collection("categories").get();
    categories = [];
    
    snapshot.forEach(doc => {
      const category = doc.data().name;
      categories.push(category);
      
      // Add to select dropdown
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    
    // If no categories exist yet, add some default ones
    if (categories.length === 0) {
      const defaultCategories = ['Portrait', 'Landscape', 'Street', 'Architecture', 'Nature', 'Event'];
      defaultCategories.forEach(category => {
        // Add to database
        db.collection("categories").add({
          name: category
        });
        
        // Add to select dropdown
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// Fetch gallery images
async function fetchGalleryImages() {
  try {
    loadingMessage.style.display = 'flex';
    gallery.innerHTML = '';
    
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
    
    // Display photos
    displayGallery(photos);
    
    loadingMessage.style.display = 'none';
  } catch (err) {
    console.error('Error fetching gallery images:', err);
    loadingMessage.style.display = 'none';
  }
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
let currentCategoryPhotos = [];

// Display gallery images
function displayGallery(photos) {
  gallery.innerHTML = '';
  
  // Filter photos if needed
  if (currentFilter !== 'all') {
    photos = photos.filter(photo => photo.photographer === currentFilter);
  }
  
  if (photos.length === 0) {
    emptyGallery.style.display = 'block';
    gallery.style.opacity = '1'; // Ensure gallery is visible even when empty
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
      currentCategoryPhotos = photos.filter(p => p.category === photo.category);
      const categoryIndex = currentCategoryPhotos.findIndex(p => p.imageUrl === photo.imageUrl);
      openPhotoViewer(categoryIndex);
    });
    
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    
    const title = document.createElement('h3');
    title.textContent = photo.photographer;
    
    const details = document.createElement('p');
    details.textContent = photo.event || 'Personal Work';
    
    const category = document.createElement('p');
    category.textContent = photo.category || 'Uncategorized';
    category.className = 'gallery-item-category';
    
    info.appendChild(title);
    info.appendChild(details);
    info.appendChild(category);
    
    item.appendChild(img);
    item.appendChild(info);
    
    gallery.appendChild(item);
  });
  
  // Add fade-in effect after content is updated
  setTimeout(() => {
    gallery.style.opacity = '1';
  }, 50);
}

// Open photo viewer
function openPhotoViewer(index) {
  currentPhotoIndex = index;
  updatePhotoViewer();
  photoViewer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Update photo viewer content
function updatePhotoViewer() {
  const photo = currentCategoryPhotos[currentPhotoIndex];
  viewerImage.src = photo.imageUrl;
  viewerImage.alt = `Photo by ${photo.photographer}`;
  
  // Update navigation buttons
  prevPhoto.style.display = currentPhotoIndex > 0 ? 'block' : 'none';
  nextPhoto.style.display = currentPhotoIndex < currentCategoryPhotos.length - 1 ? 'block' : 'none';
  
  // Update thumbnails
  updateThumbnails();
}

// Update thumbnail strip
function updateThumbnails() {
  thumbnailStrip.innerHTML = '';
  currentCategoryPhotos.forEach((photo, index) => {
    const thumb = document.createElement('img');
    thumb.src = photo.imageUrl;
    thumb.alt = `Thumbnail ${index + 1}`;
    thumb.className = `photo-viewer-thumbnail${index === currentPhotoIndex ? ' active' : ''}`;
    thumb.addEventListener('click', () => {
      currentPhotoIndex = index;
      updatePhotoViewer();
    });
    thumbnailStrip.appendChild(thumb);
  });
}

// Close photo viewer
function closePhotoViewer() {
  photoViewer.classList.remove('active');
  document.body.style.overflow = '';
}

// Event listeners for photo viewer
closeViewer.addEventListener('click', closePhotoViewer);

prevPhoto.addEventListener('click', () => {
  if (currentPhotoIndex > 0) {
    currentPhotoIndex--;
    updatePhotoViewer();
  }
});

nextPhoto.addEventListener('click', () => {
  if (currentPhotoIndex < currentCategoryPhotos.length - 1) {
    currentPhotoIndex++;
    updatePhotoViewer();
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!photoViewer.classList.contains('active')) return;
  
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
      if (currentPhotoIndex < currentCategoryPhotos.length - 1) {
        currentPhotoIndex++;
        updatePhotoViewer();
      }
      break;
  }
});

// Close viewer when clicking outside the image
photoViewer.addEventListener('click', (e) => {
  if (e.target === photoViewer) {
    closePhotoViewer();
  }
});

// Filter gallery by photographer
function filterGallery(photographer) {
  currentFilter = photographer;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-photographer') === photographer);
  });
  
  // Add fade-out effect before changing content
  gallery.style.opacity = '0';
  gallery.style.transition = 'opacity 0.3s ease';
  
  // Wait for fade-out to complete before fetching new images
  setTimeout(() => {
    // Fetch and display filtered images
    fetchGalleryImages();
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

// Setup photographer selection logic
function setupPhotographerSelection() {
  // When selecting from dropdown
  photographerSelect.addEventListener('change', function() {
    if (this.value) {
      photographerName.value = this.value;
      photographerName.disabled = true;
    } else {
      photographerName.value = '';
      photographerName.disabled = false;
      photographerName.focus();
    }
  });
  
  // When typing in the name field
  photographerName.addEventListener('input', function() {
    // If the name matches an existing photographer, select it in the dropdown
    const matchingOption = Array.from(photographerSelect.options).find(option => 
      option.value.toLowerCase() === this.value.toLowerCase() && option.value !== '');
    
    if (matchingOption) {
      photographerSelect.value = matchingOption.value;
      this.value = matchingOption.value; // Ensure correct capitalization
      this.disabled = true;
    } else {
      photographerSelect.value = '';
    }
  });
}

// Setup form submission
function setupFormSubmission() {
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;
    
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(selectedFile);
      
      // Save to Firestore with pending status
      await saveToFirestore(imageUrl, 'pending');
      
      // Add photographer to database if new
      if (!photographers.includes(photographerName.value)) {
        await db.collection("photographers").add({
          name: photographerName.value
        });
      }
      
      // Reset form
      resetForm();
      
      // Refresh gallery
      fetchGalleryImages();
      
      // Show success message
      showNotification('Photo uploaded successfully and will appear in our gallery after approval.', 'success');
    } catch (err) {
      console.error('Error uploading photo:', err);
      showNotification('Error uploading photo. Please try again.', 'error');
    } finally {
      // Reset button
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

// Validate form
function validateForm() {
  let isValid = true;
  
  // Check photographer name
  if (!photographerName.value.trim()) {
    showFieldError(photographerName, 'Please enter your name');
    isValid = false;
  } else {
    clearFieldError(photographerName);
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
    
    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.secure_url) {
        resolve(data.secure_url);
      } else {
        reject(new Error('Failed to upload image'));
      }
    })
    .catch(err => reject(err));
  });
}

// Save to Firestore
async function saveToFirestore(imageUrl, status = 'pending') {
  return db.collection("photos").add({
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
  photographerName.disabled = false;
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