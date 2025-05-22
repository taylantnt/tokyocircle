// language-switcher.js - Handles language switching functionality

document.addEventListener('DOMContentLoaded', function() {
    let currentLang = localStorage.getItem('language') || 'en';

    const languageToggle = document.getElementById('languageToggle');
    const languageDropdown = document.querySelector('.language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    const currentLanguageSpan = document.querySelector('.current-language'); // Used by dropdown version

    function updateToggleLinkState(newCurrentLang) {
        if (languageToggle) {
            // Set data-lang to the language it will switch TO
            languageToggle.setAttribute('data-lang', newCurrentLang === 'en' ? 'ja' : 'en');
        }
    }

    // Initialize toggle link state (data-lang attribute)
    updateToggleLinkState(currentLang);

    // Apply initial translations to the whole page
    // This will also set the text of languageToggle via its data-i18n attribute
    applyTranslations(currentLang);

    // Check if all elements for the dropdown-based switcher are present
    if (languageToggle && languageDropdown && languageOptions.length > 0 && currentLanguageSpan) {
        // Setup for dropdown-based switcher
        
        // Set initial text for the span that shows current language (e.g., "English")
        // Assumes a key like 'current_language_display' in translations
        if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang].current_language_display) {
            currentLanguageSpan.textContent = translations[currentLang].current_language_display;
        } else {
            currentLanguageSpan.textContent = currentLang.toUpperCase(); // Fallback: "EN" or "JA"
        }

        // Set active class on the correct language option in the dropdown
        languageOptions.forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === currentLang);
        });

        // Event listener for the main toggle to show/hide dropdown
        languageToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            languageToggle.classList.toggle('active');
            languageDropdown.classList.toggle('show');
        });

        // Event listeners for dropdown options to switch language
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const langToSwitchTo = option.getAttribute('data-lang');
                switchLanguage(langToSwitchTo);
                languageDropdown.classList.remove('show'); // Hide dropdown
                languageToggle.classList.remove('active'); // Deactivate toggle
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (languageDropdown.classList.contains('show') &&
                !languageToggle.contains(e.target) &&
                !languageDropdown.contains(e.target)) {
                languageDropdown.classList.remove('show');
                languageToggle.classList.remove('active');
            }
        });

    } else if (languageToggle) {
        // Setup for simple two-way toggle link (if dropdown elements are not found)
        languageToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const langToSwitchTo = languageToggle.getAttribute('data-lang');
            switchLanguage(langToSwitchTo);
        });
    }

    function switchLanguage(newLang) {
        localStorage.setItem('language', newLang);
        currentLang = newLang; // Update script's current language state

        updateToggleLinkState(currentLang); // Update toggle's data-lang attribute

        // Update active state for dropdown options (if they exist)
        if (languageOptions.length > 0) {
            languageOptions.forEach(opt => {
                opt.classList.toggle('active', opt.getAttribute('data-lang') === newLang);
            });
        }
        
        // Update current language display span (if it exists for dropdown version)
        if (currentLanguageSpan) {
            if (typeof translations !== 'undefined' && translations[newLang] && translations[newLang].current_language_display) {
                currentLanguageSpan.textContent = translations[newLang].current_language_display;
            } else {
                currentLanguageSpan.textContent = newLang.toUpperCase(); // Fallback
            }
        }

        applyTranslations(newLang); // Apply translations to the whole page
    }
  
  // Function to apply translations to the page
  function applyTranslations(lang) {
    // Ensure translations object is available
    if (typeof translations === 'undefined') {
      console.error('Translations object is not defined. Cannot apply translations.');
      // Optionally, set HTML lang attribute even if translations are missing
      document.documentElement.setAttribute('lang', lang);
      return;
    }

    // Set the HTML lang attribute for proper font selection
    document.documentElement.setAttribute('lang', lang);
    
    // Get all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      // Check if specific language and key exist within the loaded translations
      if (translations[lang] && typeof translations[lang][key] !== 'undefined') {
        // Handle different element types
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          if (element.getAttribute('placeholder')) {
            element.setAttribute('placeholder', translations[lang][key]);
          } else {
            element.value = translations[lang][key];
          }
        } else if (element.tagName === 'META') {
          element.setAttribute('content', translations[lang][key]);
        } else if (
          element.querySelector('i,svg') &&
          (element.classList.contains('nav-link') || element.classList.contains('btn') || element.classList.contains('rainbow-btn'))
        ) {
          // For nav links/buttons with icons, update only the text node after the icon
          const icon = element.querySelector('i,svg');
          let textNode = null;
          for (let node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
              textNode = node;
              break;
            }
          }
          if (textNode) {
            textNode.textContent = ' ' + translations[lang][key];
          } else {
            // If no text node, create one after the icon
            const newTextNode = document.createTextNode(' ' + translations[lang][key]);
            if (icon.nextSibling) {
                element.insertBefore(newTextNode, icon.nextSibling);
            } else {
                element.appendChild(newTextNode);
            }
          }
        } else {
          element.textContent = translations[lang][key];
        }
      } else {
        // Log more specific warnings
        if (!translations[lang]) {
          console.warn(`Translations for language '${lang}' not found. Cannot translate key: ${key}`);
        } else {
          console.warn(`Translation missing for key: '${key}' in language: '${lang}'`);
        }
      }
    });
    
    // Log the current language state
    console.log('Language switched to:', lang);
    if (translations[lang]) {
      console.log('Current translations for ' + lang + ':', translations[lang]);
    } else {
      console.log(`Current translations: No translations found for language '${lang}'.`);
    }
  }
});

// Function to initialize page with i18n attributes
function initializeI18n() {
  // Common navigation elements
  const navLinks = document.querySelectorAll('.nav-links a:not(.language-toggle)');
  const navMapping = {
    'Home': 'nav_home',
    'About': 'nav_about',
    'Gallery': 'nav_gallery',
    'Events': 'nav_events',
    'Reviews': 'nav_reviews',
    'Join': 'nav_join',
    'Inquiry': 'nav_inquiry'
  };
  
  navLinks.forEach(link => {
    const text = link.textContent.trim();
    if (navMapping[text]) {
      link.setAttribute('data-i18n', navMapping[text]);
    }
  });
  
  // Page-specific initialization based on URL
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage.includes('inquiry')) {
    initializeInquiryPage();
  } else if (currentPage.includes('submit')) {
    initializeSubmitPage();
  } else if (currentPage.includes('photowalks')) {
    initializePhotowalksPage();
  } else if (currentPage.includes('creatives')) {
    initializeCreativesPage();
  }
}

// Initialize inquiry page elements with i18n attributes
function initializeInquiryPage() {
  // Page title and intro
  document.querySelector('.page-intro h1')?.setAttribute('data-i18n', 'inquiry_title');
  
  const introParas = document.querySelectorAll('.page-intro p');
  if (introParas.length > 0) {
    introParas[0]?.setAttribute('data-i18n', 'inquiry_intro_text1');
    if (introParas.length > 1) {
      introParas[1]?.setAttribute('data-i18n', 'inquiry_intro_text2');
    }
  }
  
  // Form labels and placeholders
  const formLabels = {
    'Your Name': 'inquiry_form_name',
    'Email Address': 'inquiry_form_email',
    'Phone Number': 'inquiry_form_phone',
    'Project Type': 'inquiry_form_project',
    'Budget Range': 'inquiry_form_budget',
    'Project Date': 'inquiry_form_date',
    'Project Details': 'inquiry_form_message'
  };
  
  document.querySelectorAll('.form-group label').forEach(label => {
    const text = label.textContent.trim();
    if (formLabels[text]) {
      label.setAttribute('data-i18n', formLabels[text]);
    }
  });
  
  // Submit button
  document.querySelector('.submit-btn')?.setAttribute('data-i18n', 'inquiry_form_submit');
}

// Initialize submit page elements with i18n attributes
function initializeSubmitPage() {
  // Page title and intro
  document.querySelector('.form-header h1')?.setAttribute('data-i18n', 'submit_title');
  document.querySelector('.form-header p')?.setAttribute('data-i18n', 'submit_subtitle');
  
  // Form elements
  document.querySelector('label[for="talent-type"]')?.setAttribute('data-i18n', 'submit_form_type');
  
  const options = document.querySelectorAll('#talent-type option');
  if (options.length > 1) options[1]?.setAttribute('data-i18n', 'submit_form_type_photographer');
  if (options.length > 2) options[2]?.setAttribute('data-i18n', 'submit_form_type_model');
  if (options.length > 3) options[3]?.setAttribute('data-i18n', 'submit_form_type_makeup');
  
  document.querySelector('label[for="full-name"]')?.setAttribute('data-i18n', 'submit_form_name');
  document.querySelector('#full-name')?.setAttribute('data-i18n', 'submit_form_name_placeholder');
  
  document.querySelector('label[for="email"]')?.setAttribute('data-i18n', 'submit_form_email');
  document.querySelector('label[for="phone"]')?.setAttribute('data-i18n', 'submit_form_phone');
  
  document.querySelector('label[for="location"]')?.setAttribute('data-i18n', 'submit_form_location');
  document.querySelector('#location')?.setAttribute('data-i18n', 'submit_form_location_placeholder');
  
  document.querySelector('label[for="portfolio"]')?.setAttribute('data-i18n', 'submit_form_portfolio');
  document.querySelector('#portfolio')?.setAttribute('data-i18n', 'submit_form_portfolio_placeholder');
  
  document.querySelector('label[for="text"]')?.setAttribute('data-i18n', 'submit_form_social');
  document.querySelector('input[name="portfolio"][placeholder]')?.setAttribute('data-i18n', 'submit_form_social_placeholder');
  
  document.querySelector('label[for="experience"]')?.setAttribute('data-i18n', 'submit_form_experience');
  
  const expOptions = document.querySelectorAll('#experience option');
  if (expOptions.length > 1) expOptions[1]?.setAttribute('data-i18n', 'submit_form_experience_0');
  if (expOptions.length > 2) expOptions[2]?.setAttribute('data-i18n', 'submit_form_experience_3');
  if (expOptions.length > 3) expOptions[3]?.setAttribute('data-i18n', 'submit_form_experience_5');
  if (expOptions.length > 4) expOptions[4]?.setAttribute('data-i18n', 'submit_form_experience_10');
  
  document.querySelector('label[for="about"]')?.setAttribute('data-i18n', 'submit_form_about');
  document.querySelector('#about')?.setAttribute('data-i18n', 'submit_form_about_placeholder');
  
  document.querySelector('.submit-btn')?.setAttribute('data-i18n', 'submit_form_submit');
  
  // Requirements section
  document.querySelector('.requirements h3')?.setAttribute('data-i18n', 'submit_requirements_title');
  
  const reqItems = document.querySelectorAll('.requirements li');
  if (reqItems.length > 0) reqItems[0]?.setAttribute('data-i18n', 'submit_requirements_1');
  if (reqItems.length > 1) reqItems[1]?.setAttribute('data-i18n', 'submit_requirements_2');
  if (reqItems.length > 2) reqItems[2]?.setAttribute('data-i18n', 'submit_requirements_3');
  if (reqItems.length > 3) reqItems[3]?.setAttribute('data-i18n', 'submit_requirements_4');
  if (reqItems.length > 4) reqItems[4]?.setAttribute('data-i18n', 'submit_requirements_5');
}

// Initialize photowalks page elements with i18n attributes
function initializePhotowalksPage() {
  // Hero section
  document.querySelector('.hero-content h1')?.setAttribute('data-i18n', 'photowalks_welcome');
  document.querySelector('.subtitle')?.setAttribute('data-i18n', 'photowalks_subtitle_small');
  
  const heroButtons = document.querySelectorAll('.hero-buttons .btn');
  if (heroButtons.length > 0) heroButtons[0]?.setAttribute('data-i18n', 'photowalks_btn_events');
  if (heroButtons.length > 1) heroButtons[1]?.setAttribute('data-i18n', 'photowalks_btn_photos');
  
  // About section
  document.querySelector('#about .section-header h2')?.setAttribute('data-i18n', 'photowalks_about_title');
  document.querySelector('#about .section-description')?.setAttribute('data-i18n', 'photowalks_about_subtitle');
  document.querySelector('.about-text-content h3')?.setAttribute('data-i18n', 'photowalks_about_heading');
  document.querySelector('.about-lead')?.setAttribute('data-i18n', 'photowalks_about_lead');
  
  const aboutParas = document.querySelectorAll('.about-text-content p:not(.about-lead):not(.about-tagline)');
  if (aboutParas.length > 0) aboutParas[0]?.setAttribute('data-i18n', 'photowalks_about_p1');
  if (aboutParas.length > 1) aboutParas[1]?.setAttribute('data-i18n', 'photowalks_about_p2');
  
  document.querySelector('.about-tagline')?.setAttribute('data-i18n', 'photowalks_about_tagline');
  
  // Stats
  const statLabels = document.querySelectorAll('.stat-label');
  if (statLabels.length > 0) statLabels[0]?.setAttribute('data-i18n', 'photowalks_stats_members');
  if (statLabels.length > 1) statLabels[1]?.setAttribute('data-i18n', 'photowalks_stats_walks');
  if (statLabels.length > 2) statLabels[2]?.setAttribute('data-i18n', 'photowalks_stats_photos');
  
  // Founders section
  document.querySelector('.founders .section-header h2')?.setAttribute('data-i18n', 'photowalks_founders_title');
  document.querySelector('.founders .section-description')?.setAttribute('data-i18n', 'photowalks_founders_subtitle');
  
  // Gallery section
  document.querySelector('#gallery .section-header h2')?.setAttribute('data-i18n', 'photowalks_gallery_title');
  document.querySelector('#gallery .section-description')?.setAttribute('data-i18n', 'photowalks_gallery_subtitle');
  
  // Events section
  document.querySelector('#events .section-header h2')?.setAttribute('data-i18n', 'photowalks_events_title');
  document.querySelector('#events .section-description')?.setAttribute('data-i18n', 'photowalks_events_subtitle');
  
  // Join section
  document.querySelector('#join h2')?.setAttribute('data-i18n', 'photowalks_join_title');
  document.querySelector('#join > .container > .join-content > p')?.setAttribute('data-i18n', 'photowalks_join_text');
  
  const steps = document.querySelectorAll('.step h3');
  if (steps.length > 0) steps[0]?.setAttribute('data-i18n', 'photowalks_join_step1');
  if (steps.length > 1) steps[1]?.setAttribute('data-i18n', 'photowalks_join_step2');
  if (steps.length > 2) steps[2]?.setAttribute('data-i18n', 'photowalks_join_step3');
  
  const stepTexts = document.querySelectorAll('.step p');
  if (stepTexts.length > 0) stepTexts[0]?.setAttribute('data-i18n', 'photowalks_join_step1_text');
  if (stepTexts.length > 1) stepTexts[1]?.setAttribute('data-i18n', 'photowalks_join_step2_text');
  if (stepTexts.length > 2) stepTexts[2]?.setAttribute('data-i18n', 'photowalks_join_step3_text');
}

// Initialize creatives page elements with i18n attributes
function initializeCreativesPage() {
  // Page intro
  document.querySelector('.page-intro h1')?.setAttribute('data-i18n', 'creatives_browse_title');
  
  const introParas = document.querySelectorAll('.page-intro p');
  if (introParas.length > 0) introParas[0]?.setAttribute('data-i18n', 'creatives_browse_text1');
  if (introParas.length > 1) introParas[1]?.setAttribute('data-i18n', 'creatives_browse_text2');
  
  // Category links
  const categoryLinks = document.querySelectorAll('.category-link');
  if (categoryLinks.length > 0) categoryLinks[0]?.setAttribute('data-i18n', 'creatives_category_models');
  if (categoryLinks.length > 1) categoryLinks[1]?.setAttribute('data-i18n', 'creatives_category_artists');
  if (categoryLinks.length > 2) categoryLinks[2]?.setAttribute('data-i18n', 'creatives_category_creatives');
  
  // Second page intro
  const pageIntros = document.querySelectorAll('.page-intro h1');
  if (pageIntros.length > 1) pageIntros[1]?.setAttribute('data-i18n', 'creatives_hire_title');
  
  const allIntroParas = document.querySelectorAll('.page-intro p');
  if (allIntroParas.length > 2) allIntroParas[2]?.setAttribute('data-i18n', 'creatives_hire_text');
  
  // Service cards
  const serviceCards = document.querySelectorAll('.service-card');
  
  // Photographers/Creatives card
  if (serviceCards.length > 0) {
    serviceCards[0].querySelector('h3')?.setAttribute('data-i18n', 'creatives_service_photographers_title');
    serviceCards[0].querySelector('p')?.setAttribute('data-i18n', 'creatives_service_photographers_text');
    
    const features1 = serviceCards[0].querySelectorAll('.service-features li');
    if (features1.length > 0) features1[0]?.setAttribute('data-i18n', 'creatives_service_photographers_feature1');
    if (features1.length > 1) features1[1]?.setAttribute('data-i18n', 'creatives_service_photographers_feature2');
    if (features1.length > 2) features1[2]?.setAttribute('data-i18n', 'creatives_service_photographers_feature3');
    if (features1.length > 3) features1[3]?.setAttribute('data-i18n', 'creatives_service_photographers_feature4');
    
    serviceCards[0].querySelector('.btn')?.setAttribute('data-i18n', 'creatives_service_photographers_btn');
  }
  
  // Models card
  if (serviceCards.length > 1) {
    serviceCards[1].querySelector('h3')?.setAttribute('data-i18n', 'creatives_service_models_title');
    serviceCards[1].querySelector('p')?.setAttribute('data-i18n', 'creatives_service_models_text');
    
    const features2 = serviceCards[1].querySelectorAll('.service-features li');
    if (features2.length > 0) features2[0]?.setAttribute('data-i18n', 'creatives_service_models_feature1');
    if (features2.length > 1) features2[1]?.setAttribute('data-i18n', 'creatives_service_models_feature2');
    if (features2.length > 2) features2[2]?.setAttribute('data-i18n', 'creatives_service_models_feature3');
    if (features2.length > 3) features2[3]?.setAttribute('data-i18n', 'creatives_service_models_feature4');
    
    serviceCards[1].querySelector('.btn')?.setAttribute('data-i18n', 'creatives_service_models_btn');
  }
  
  // Makeup card
  if (serviceCards.length > 2) {
    serviceCards[2].querySelector('h3')?.setAttribute('data-i18n', 'creatives_service_makeup_title');
    serviceCards[2].querySelector('p')?.setAttribute('data-i18n', 'creatives_service_makeup_text');
    
    const features3 = serviceCards[2].querySelectorAll('.service-features li');
    if (features3.length > 0) features3[0]?.setAttribute('data-i18n', 'creatives_service_makeup_feature1');
    if (features3.length > 1) features3[1]?.setAttribute('data-i18n', 'creatives_service_makeup_feature2');
    if (features3.length > 2) features3[2]?.setAttribute('data-i18n', 'creatives_service_makeup_feature3');
    if (features3.length > 3) features3[3]?.setAttribute('data-i18n', 'creatives_service_makeup_feature4');
    
    serviceCards[2].querySelector('.btn')?.setAttribute('data-i18n', 'creatives_service_makeup_btn');
  }
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeI18n();
});