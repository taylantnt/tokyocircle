// Popup functionality for Circle website

document.addEventListener('DOMContentLoaded', function() {
    // Create popup elements and add them to the body
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.display = 'none';
    
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';
    
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.setAttribute('aria-label', 'Close popup');
    
    const popupTitle = document.createElement('h3');
    popupTitle.className = 'popup-title';
    
    const popupText = document.createElement('div');
    popupText.className = 'popup-text';
    
    const popupButton = document.createElement('a');
    popupButton.className = 'btn rainbow-btn popup-button';
    popupButton.setAttribute('target', '_blank');
    popupButton.setAttribute('rel', 'noopener noreferrer');
    
    // Assemble popup structure
    popupContent.appendChild(closeButton);
    popupContent.appendChild(popupTitle);
    popupContent.appendChild(popupText);
    popupContent.appendChild(popupButton);
    popupContainer.appendChild(popupContent);
    popupOverlay.appendChild(popupContainer);
    document.body.appendChild(popupOverlay);
    
    // LINE popup content
    const lineRules = `
        <p><strong>Before joining our LINE group, please note:</strong></p>
        <ul>
            <li><i class="fas fa-check-circle"></i> Be respectful to all members</li>
            <li><i class="fas fa-check-circle"></i> Share your photography and experiences</li>
            <li><i class="fas fa-check-circle"></i> No spam or promotional content</li>
            <li><i class="fas fa-check-circle"></i> English is our primary language</li>
            <li><i class="fas fa-check-circle"></i> Introduce yourself when you join</li>
        </ul>
    `;
    
    // Meetup popup content
    const meetupRules = `
        <p><strong>Before joining our Meetup events, please note:</strong></p>
        <ul>
            <li><i class="fas fa-check-circle"></i> RSVP accurately and cancel if you can't attend</li>
            <li><i class="fas fa-check-circle"></i> Arrive on time for scheduled events</li>
            <li><i class="fas fa-check-circle"></i> Bring your own camera equipment</li>
            <li><i class="fas fa-check-circle"></i> Follow the event leader's instructions</li>
            <li><i class="fas fa-check-circle"></i> Share your photos with the group after events</li>
        </ul>
    `;
    
    // Get the buttons
    const lineButton = document.querySelector('.line-btn');
    const meetupButton = document.querySelector('.meetup-btn');
    
    // Store original URLs
    const lineUrl = lineButton ? lineButton.getAttribute('href') : '';
    const meetupUrl = meetupButton ? meetupButton.getAttribute('href') : '';
    
    // Prevent default navigation and show popup for LINE button
    if (lineButton) {
        lineButton.addEventListener('click', function(e) {
            e.preventDefault();
            popupTitle.textContent = 'LINE Group Rules';
            popupText.innerHTML = lineRules;
            popupButton.textContent = 'I Agree, Join LINE Group';
            popupButton.setAttribute('href', lineUrl);
            popupOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }
    
    // Prevent default navigation and show popup for Meetup button
    if (meetupButton) {
        meetupButton.addEventListener('click', function(e) {
            e.preventDefault();
            popupTitle.textContent = 'Meetup Event Rules';
            popupText.innerHTML = meetupRules;
            popupButton.textContent = 'I Agree, See Events';
            popupButton.setAttribute('href', meetupUrl);
            popupOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }
    
    // Close popup when clicking the close button
    closeButton.addEventListener('click', function() {
        popupOverlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close popup when clicking outside the popup content
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
    
    // Close popup when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupOverlay.style.display === 'flex') {
            popupOverlay.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
});