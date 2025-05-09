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

// Global variables to track filters
let selectedTalentTypes = new Set();

// DOM Elements
const pendingPhotos = document.getElementById('pendingPhotos');
const noPending = document.getElementById('noPending');
const pendingCount = document.getElementById('pendingCount');
const approvedCount = document.getElementById('approvedCount');
const rejectedCount = document.getElementById('rejectedCount');

// Handle talent type filtering
function filterByTalent(checkbox) {
  if (checkbox.checked) {
    selectedTalentTypes.add(checkbox.value);
  } else {
    selectedTalentTypes.delete(checkbox.value);
  }
  
  const currentStatus = document.querySelector('.sidebar-menu a.active').textContent.toLowerCase().includes('approved') ? 'approved' : 
                       document.querySelector('.sidebar-menu a.active').textContent.toLowerCase().includes('rejected') ? 'rejected' : 'pending';
  
  loadPhotos(currentStatus);
  loadStatistics();
}

// Mobile sidebar functionality
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

// Handle stat card clicks
function handleStatCardClick(status) {
  loadPhotos(status);
  // Close sidebar if open on mobile
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dark mode toggle
  initDarkModeToggle();
  
  // Check authentication and load initial content
  checkAuth();
  
  // Load statistics
  loadStatistics();

  // Initialize mobile menu button
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  mobileMenuBtn.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', toggleSidebar);

  // Add click handlers to stat cards
  document.querySelector('.stat-card:nth-child(1)').addEventListener('click', () => handleStatCardClick('pending'));
  document.querySelector('.stat-card:nth-child(2)').addEventListener('click', () => handleStatCardClick('approved'));
  document.querySelector('.stat-card:nth-child(3)').addEventListener('click', () => handleStatCardClick('rejected'));
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

    // Build query with filters
    let query = db.collection('photos').where('status', '==', status);
    
    // Apply talent type filters if any are selected
    if (selectedTalentTypes.size > 0) {
      query = query.where('talentType', 'in', Array.from(selectedTalentTypes));
    }

    const snapshot = await query.get();
    
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

  // Get talent type label
  const talentTypeLabels = {
    'photographer': 'Photographer',
    'videographer': 'Videographer',
    'hmu': 'Hair & Makeup Artist',
    'model': 'Model'
  };
  const talentTypeLabel = photo.talentType ? talentTypeLabels[photo.talentType] || 'Talent' : 'Photographer';

  card.innerHTML = `
    <img src="${photo.imageUrl}" alt="${talentTypeLabel}: ${photo.photographer}">
    <div class="photo-info">
      <h3>${photo.photographer}</h3>
      <p><strong>Talent Type:</strong> ${talentTypeLabel}</p>
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

// ========== NEW ADMIN PANEL LOGIC ========== //

const PHOTOS_PER_PAGE = 20;
let currentStatus = 'pending';
let currentPage = 1;
let totalPages = 1;
let allPhotos = [];
let filteredPhotos = [];
let selectedPhotoIds = new Set();

// DOM Elements
const adminTabs = document.querySelectorAll('.admin-tab');
const adminSearch = document.getElementById('adminSearch');
const filterTalentType = document.getElementById('filterTalentType');
const filterCategory = document.getElementById('filterCategory');
const filterEvent = document.getElementById('filterEvent');
const adminBatchBar = document.getElementById('adminBatchBar');
const selectedCount = document.getElementById('selectedCount');
const adminPaginationTop = document.getElementById('adminPaginationTop');
const adminPaginationBottom = document.getElementById('adminPaginationBottom');
const pendingPhotosGrid = document.getElementById('pendingPhotos');
const tabPendingCount = document.getElementById('tabPendingCount');
const tabApprovedCount = document.getElementById('tabApprovedCount');
const tabRejectedCount = document.getElementById('tabRejectedCount');
const adminPhotoModal = document.getElementById('adminPhotoModal');
const adminPhotoModalClose = document.getElementById('adminPhotoModalClose');
const modalPhotoImg = document.getElementById('modalPhotoImg');
const modalPhotoArtist = document.getElementById('modalPhotoArtist');
const modalPhotoTalent = document.getElementById('modalPhotoTalent');
const modalPhotoCategory = document.getElementById('modalPhotoCategory');
const modalPhotoEvent = document.getElementById('modalPhotoEvent');
const modalPhotoDate = document.getElementById('modalPhotoDate');
const modalPhotoStatus = document.getElementById('modalPhotoStatus');
const modalApproveBtn = document.getElementById('modalApproveBtn');
const modalRejectBtn = document.getElementById('modalRejectBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');

// Tab switching
adminTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    adminTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentStatus = tab.dataset.status;
    currentPage = 1;
    selectedPhotoIds.clear();
    updateBatchBar();
    loadAndRenderPhotos();
  });
});

// Search and filter logic
[adminSearch, filterTalentType, filterCategory, filterEvent].forEach(input => {
  input.addEventListener('input', () => {
    currentPage = 1;
    selectedPhotoIds.clear();
    updateBatchBar();
    filterAndRenderPhotos();
  });
});

// Batch action buttons
adminBatchBar.querySelector('.batch-approve-btn').onclick = () => batchModerate('approved');
adminBatchBar.querySelector('.batch-reject-btn').onclick = () => batchModerate('rejected');
adminBatchBar.querySelector('.batch-delete-btn').onclick = () => batchDelete();

// Pagination controls
function renderPagination() {
  [adminPaginationTop, adminPaginationBottom].forEach(container => {
    container.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === currentPage ? 'active' : '';
      btn.onclick = () => {
        currentPage = i;
        selectedPhotoIds.clear();
        updateBatchBar();
        renderPhotoGrid();
      };
      container.appendChild(btn);
    }
  });
}

// Load and render photos from Firestore
async function loadAndRenderPhotos() {
  // Show loading state
  pendingPhotosGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  // Query all photos for current status
  let query = db.collection('photos').where('status', '==', currentStatus);
  const snapshot = await query.get();
  allPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  updateTabCounts();
  filterAndRenderPhotos();
}

// Update tab counts
async function updateTabCounts() {
  const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
    db.collection('photos').where('status', '==', 'pending').get(),
    db.collection('photos').where('status', '==', 'approved').get(),
    db.collection('photos').where('status', '==', 'rejected').get()
  ]);
  tabPendingCount.textContent = pendingSnap.size;
  tabApprovedCount.textContent = approvedSnap.size;
  tabRejectedCount.textContent = rejectedSnap.size;
}

// Filter and render photos
function filterAndRenderPhotos() {
  const search = adminSearch.value.trim().toLowerCase();
  const talent = filterTalentType.value;
  const category = filterCategory.value;
  const event = filterEvent.value.trim().toLowerCase();
  filteredPhotos = allPhotos.filter(photo => {
    let match = true;
    if (search) {
      match = (
        (photo.photographer && photo.photographer.toLowerCase().includes(search)) ||
        (photo.category && photo.category.toLowerCase().includes(search)) ||
        (photo.event && photo.event.toLowerCase().includes(search))
      );
    }
    if (talent && photo.talentType !== talent) match = false;
    if (category && photo.category !== category) match = false;
    if (event && (!photo.event || !photo.event.toLowerCase().includes(event))) match = false;
    return match;
  });
  totalPages = Math.max(1, Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  renderPhotoGrid();
}

// Render photo grid
function renderPhotoGrid() {
  pendingPhotosGrid.innerHTML = '';
  if (filteredPhotos.length === 0) {
    document.getElementById('noPending').style.display = '';
    renderPagination();
    return;
  }
  document.getElementById('noPending').style.display = 'none';
  const start = (currentPage - 1) * PHOTOS_PER_PAGE;
  const end = start + PHOTOS_PER_PAGE;
  const pagePhotos = filteredPhotos.slice(start, end);
  pagePhotos.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'admin-photo-card' + (selectedPhotoIds.has(photo.id) ? ' selected' : '');
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'admin-photo-checkbox';
    checkbox.checked = selectedPhotoIds.has(photo.id);
    checkbox.onclick = e => {
      e.stopPropagation();
      if (checkbox.checked) selectedPhotoIds.add(photo.id);
      else selectedPhotoIds.delete(photo.id);
      updateBatchBar();
      card.classList.toggle('selected', checkbox.checked);
    };
    card.appendChild(checkbox);
    // Image
    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = `${photo.photographer || ''}`;
    img.onclick = () => openPhotoModal(photo);
    card.appendChild(img);
    // Info
    const info = document.createElement('div');
    info.className = 'admin-photo-info';
    info.innerHTML = `
      <h3>${photo.photographer || ''}</h3>
      <p><strong>Talent:</strong> ${photo.talentType || ''}</p>
      <p><strong>Category:</strong> ${photo.category || ''}</p>
      <p><strong>Event:</strong> ${photo.event || ''}</p>
      <p><strong>Date:</strong> ${photo.timestamp ? new Date(photo.timestamp).toLocaleDateString() : ''}</p>
    `;
    card.appendChild(info);
    // Actions
    const actions = document.createElement('div');
    actions.className = 'admin-photo-actions';
    if (currentStatus === 'pending') {
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.onclick = e => { e.stopPropagation(); moderatePhoto(photo.id, 'approved'); };
      actions.appendChild(approveBtn);
      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Reject';
      rejectBtn.onclick = e => { e.stopPropagation(); moderatePhoto(photo.id, 'rejected'); };
      actions.appendChild(rejectBtn);
    }
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = e => { e.stopPropagation(); confirmDeletePhoto(photo.id); };
    actions.appendChild(deleteBtn);
    card.appendChild(actions);
    pendingPhotosGrid.appendChild(card);
  });
  renderPagination();
  updateBatchBar();
}

// Update batch bar
function updateBatchBar() {
  if (selectedPhotoIds.size > 0) {
    adminBatchBar.style.display = '';
    selectedCount.textContent = `${selectedPhotoIds.size} selected`;
  } else {
    adminBatchBar.style.display = 'none';
  }
}

// Batch moderate
async function batchModerate(newStatus) {
  if (selectedPhotoIds.size === 0) return;
  if (!confirm(`Are you sure you want to set status to ${newStatus} for ${selectedPhotoIds.size} photos?`)) return;
  const ids = Array.from(selectedPhotoIds);
  await Promise.all(ids.map(id => db.collection('photos').doc(id).update({ status: newStatus, moderatedAt: Date.now() })));
  showNotification(`Batch ${newStatus} successful`, 'success');
  selectedPhotoIds.clear();
  loadAndRenderPhotos();
}

// Batch delete
async function batchDelete() {
  if (selectedPhotoIds.size === 0) return;
  if (!confirm(`Are you sure you want to delete ${selectedPhotoIds.size} photos? This cannot be undone.`)) return;
  const ids = Array.from(selectedPhotoIds);
  await Promise.all(ids.map(id => db.collection('photos').doc(id).delete()));
  showNotification('Batch delete successful', 'success');
  selectedPhotoIds.clear();
  loadAndRenderPhotos();
}

// Moderate single photo
async function moderatePhoto(id, newStatus) {
  await db.collection('photos').doc(id).update({ status: newStatus, moderatedAt: Date.now() });
  showNotification(`Photo ${newStatus}`, 'success');
  loadAndRenderPhotos();
}

// Modal logic
let modalPhotoId = null;
function openPhotoModal(photo) {
  modalPhotoId = photo.id;
  modalPhotoImg.src = photo.imageUrl;
  modalPhotoArtist.textContent = photo.photographer || '';
  modalPhotoTalent.textContent = photo.talentType || '';
  modalPhotoCategory.textContent = photo.category || '';
  modalPhotoEvent.textContent = photo.event || '';
  modalPhotoDate.textContent = photo.timestamp ? new Date(photo.timestamp).toLocaleDateString() : '';
  modalPhotoStatus.textContent = photo.status || '';
  adminPhotoModal.style.display = 'flex';
}
adminPhotoModalClose.onclick = () => {
  adminPhotoModal.style.display = 'none';
  modalPhotoId = null;
};
modalApproveBtn.onclick = async () => {
  if (!modalPhotoId) return;
  await moderatePhoto(modalPhotoId, 'approved');
  adminPhotoModal.style.display = 'none';
};
modalRejectBtn.onclick = async () => {
  if (!modalPhotoId) return;
  await moderatePhoto(modalPhotoId, 'rejected');
  adminPhotoModal.style.display = 'none';
};
modalDeleteBtn.onclick = async () => {
  if (!modalPhotoId) return;
  if (!confirm('Are you sure you want to delete this photo?')) return;
  await db.collection('photos').doc(modalPhotoId).delete();
  showNotification('Photo deleted', 'success');
  adminPhotoModal.style.display = 'none';
  loadAndRenderPhotos();
};
window.onclick = function(event) {
  if (event.target === adminPhotoModal) {
    adminPhotoModal.style.display = 'none';
    modalPhotoId = null;
  }
};

// Initial load
if (adminTabs.length) {
  loadAndRenderPhotos();
}