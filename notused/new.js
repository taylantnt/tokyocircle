document.addEventListener('DOMContentLoaded', function () {
  // Language toggle functionality
  const languageToggle = document.getElementById('languageToggle');
  const navLinks = document.querySelectorAll('[data-en][data-jp]');

  function updateLanguage(isJapanese) {
    navLinks.forEach(element => {
      element.textContent = isJapanese ? element.dataset.jp : element.dataset.en;
    });
  }

  languageToggle.addEventListener('click', function() {
    const isJapanese = languageToggle.classList.toggle('jp');
    updateLanguage(isJapanese);
  });

  // Category buttons functionality
  const buttons = document.querySelectorAll('#styles button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      // Update form based on selected category
      updateFormFields(this.dataset.category);
    });
  });

  // File upload functionality
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileUpload');
  const preview = document.getElementById('preview');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add('highlight');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove('highlight');
    });
  });

  dropArea.addEventListener('drop', handleDrop);
  dropArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFiles);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files: files } });
  }

  function handleFiles(e) {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
          preview.classList.add('active');
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Form submission
  const uploadForm = document.getElementById('uploadForm');
  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle form submission here
    // You can add your API call or data processing logic
  });

  // Update form fields based on selected category
  function updateFormFields(category) {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    
    const categories = {
      photographer: ['Portrait', 'Landscape', 'Street', 'Event'],
      videographer: ['Short Film', 'Music Video', 'Documentary', 'Event'],
      model: ['Fashion', 'Portrait', 'Commercial', 'Art'],
      hmu: ['Bridal', 'Fashion', 'Special Effects', 'Editorial']
    };

    const options = categories[category] || [];
    categorySelect.appendChild(new Option('Select a category', '', true, true));
    options.forEach(option => {
      categorySelect.appendChild(new Option(option, option));
    });
  }

  // Initialize gallery display
  function initGallery() {
    const gallery = document.getElementById('gallery');
    // Add your gallery initialization logic here
  }

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu functionality
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  });

  // Initialize the page
  initGallery();
});