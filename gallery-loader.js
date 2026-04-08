// Helper function to handle IDs vs full URLs
function getImageUrl(urlOrId) {
    if (!urlOrId) return '';
    if (urlOrId.startsWith('http')) return urlOrId;
    
    // Cloudinary performance optimization:
    // q_auto: automatic quality compression (WebP/AVIF depending on browser)
    // f_auto: automatic format selection
    // c_fill, w_800: resize to a max width of 800px (perfect for gallery cards while keeping it crisp)
    // Note: Added v1/ to the path to bust Cloudinary's aggressive edge cache for recently uploaded files
    return `https://res.cloudinary.com/drnh8zy84/image/upload/q_auto,f_auto,c_fill,w_800/v1/${urlOrId}.jpg`;
}

function loadGallery(category) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    gallery.classList.remove('show');

    // Make sure galleryData is defined (loaded via creatives-data.js)
    const items = (typeof galleryData !== 'undefined' && galleryData[category]) ? galleryData[category] : [];

    gallery.innerHTML = items.map(item => {
        const imageUrl = getImageUrl(item.image);
        const content = `
            <div class="gallery-item">
                <img src="${imageUrl}" alt="${item.caption}" loading="lazy" decoding="async">
                <div class="caption">${item.caption}</div>
            </div>
        `;
        
        return item.link ? 
            `<a href="${item.link}" style="text-decoration: none; color: inherit;">${content}</a>` : 
            content;
    }).join('');

    // Trigger fade-in animations
    requestAnimationFrame(() => {
        gallery.classList.add('show');
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 100);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup category link clicks
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.category-link').forEach(btn => {
                btn.classList.remove('active');
            });
            link.classList.add('active');
            loadGallery(link.dataset.category);
        });
    });

    // Load initial gallery if a default active link exists, otherwise default to 'models'
    const activeLink = document.querySelector('.category-link.active');
    if (activeLink) {
        loadGallery(activeLink.dataset.category);
    } else {
        const firstLink = document.querySelector('.category-link');
        if (firstLink) {
            firstLink.classList.add('active');
            loadGallery(firstLink.dataset.category);
        } else {
            loadGallery('models'); // Fallback
        }
    }
});
