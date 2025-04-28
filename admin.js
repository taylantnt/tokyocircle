// Admin Panel JavaScript

// Admin password
const ADMIN_PASSWORD = 'circle2025';

// DOM Elements for authentication
const loginContainer = document.getElementById('loginContainer');
const adminInterface = document.getElementById('adminInterface');
const loginForm = document.getElementById('loginForm');

// Check authentication status
function checkAuth() {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
  if (isAuthenticated === 'true') {
    loginContainer.style.display = 'none';
    adminInterface.style.display = 'block';
    loadPhotos('pending');
    loadStatistics();
  }
}

// Handle login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminAuthenticated', 'true');
    loginContainer.style.display = 'none';
    adminInterface.style.display = 'block';
    loadPhotos('pending');
    loadStatistics();
  } else {
    alert('Incorrect password');
  }
});

// Handle logout
function logout() {
  sessionStorage.removeItem('adminAuthenticated');
  loginContainer.style.display = 'flex';
  adminInterface.style.display = 'none';
  document.getElementById('adminPassword').value = '';
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCARVdEDsQFKtNLfii8vf544sUEbYk1lL4",
  authDomain: "photo-uploader-e391e.firebaseapp.com",
  projectId: "photo-uploader-e391e",
  storageBucket: "photo-uploader-e391e.appspot.com",
  messagingSenderId: "543805502137",
  appId: "1:543805502137:web:41ccc19dbe37fcd4f92168",
  measurementId: "G-PWMM8LQ3L1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const pendingPhotos = document.getElementById('pendingPhotos');
const noPending = document.getElementById('noPending');
const pendingCount = document.getElementById('pendingCount');
const approvedCount = document.getElementById('approvedCount');
const rejectedCount = document.getElementById('rejectedCount');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dark mode toggle
  initDarkModeToggle();
  
  // Check authentication and load initial content
  checkAuth();
  
  // Load statistics
  loadStatistics();
});

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

// Load photos by status
async function loadPhotos(status = 'pending') {
  try {
    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      link.classList.remove('active');
      if (link.textContent.toLowerCase().includes(status)) {
        link.classList.add('active');
      }
    });

    const snapshot = await db.collection('photos')
      .where('status', '==', status)
      .get();
    
    pendingPhotos.innerHTML = '';
    
    if (snapshot.empty) {
      noPending.style.display = 'block';
      return;
    }
    
    noPending.style.display = 'none';
    
    snapshot.forEach(doc => {
      const photo = doc.data();
      const photoCard = createPhotoCard(doc.id, photo);
      pendingPhotos.appendChild(photoCard);
    });
  } catch (err) {
    console.error('Error loading pending photos:', err);
    showNotification('Error loading pending photos', 'error');
  }
}

// Create photo card element
function createPhotoCard(id, photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  
  const actionButtons = photo.status === 'pending' 
    ? `<button class="approve-btn" onclick="approvePhoto('${id}')"><i class="fas fa-check"></i> Approve</button>
       <button class="reject-btn" onclick="rejectPhoto('${id}')"><i class="fas fa-times"></i> Reject</button>`
    : '';

  card.innerHTML = `
    <img src="${photo.imageUrl}" alt="Photo by ${photo.photographer}">
    <div class="photo-info">
      <h3>${photo.photographer}</h3>
      <p><strong>Category:</strong> ${photo.category}</p>
      ${photo.event ? `<p><strong>Event:</strong> ${photo.event}</p>` : ''}
      <p><strong>Uploaded:</strong> ${new Date(photo.timestamp).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${photo.status.charAt(0).toUpperCase() + photo.status.slice(1)}</p>
    </div>
    <div class="photo-actions">
      ${actionButtons}
      <button class="delete-btn" onclick="confirmDeletePhoto('${id}')"><i class="fas fa-trash"></i> Delete</button>
    </div>
  `;
  
  return card;
}

// Approve photo
async function approvePhoto(id) {
  try {
    await db.collection('photos').doc(id).update({
      status: 'approved',
      moderatedAt: Date.now()
    });
    
    showNotification('Photo approved successfully', 'success');
    loadPhotos('pending');
    loadStatistics();
  } catch (err) {
    console.error('Error approving photo:', err);
    showNotification('Error approving photo', 'error');
  }
}

// Reject photo
async function rejectPhoto(id) {
  try {
    await db.collection('photos').doc(id).update({
      status: 'rejected',
      moderatedAt: Date.now()
    });
    
    showNotification('Photo rejected', 'success');
    loadPhotos('pending');
    loadStatistics();
  } catch (err) {
    console.error('Error rejecting photo:', err);
    showNotification('Error rejecting photo', 'error');
  }
}

// Load statistics
async function loadStatistics() {
  try {
    const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
      db.collection('photos').where('status', '==', 'pending').get(),
      db.collection('photos').where('status', '==', 'approved').get(),
      db.collection('photos').where('status', '==', 'rejected').get()
    ]);
    
    pendingCount.textContent = pendingSnap.size;
    approvedCount.textContent = approvedSnap.size;
    rejectedCount.textContent = rejectedSnap.size;
  } catch (err) {
    console.error('Error loading statistics:', err);
  }
}

// Delete photo
async function deletePhoto(id) {
  try {
    await db.collection('photos').doc(id).delete();
    showNotification('Photo deleted successfully', 'success');
    loadPhotos(currentPhotoStatus);
    loadStatistics();
  } catch (err) {
    console.error('Error deleting photo:', err);
    showNotification('Error deleting photo', 'error');
  }
}

// Confirm delete photo
function confirmDeletePhoto(id) {
  if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
    deletePhoto(id);
  }
}

// Track current photo status
let currentPhotoStatus = 'pending';

// Show notification
function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? 'var(--pastel-green)' : 'var(--pastel-red)'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}