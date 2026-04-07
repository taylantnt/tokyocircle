const fs = require('fs');

let content = fs.readFileSync('a.js', 'utf8');

// 1. Replace `{ url: "..." }` with `{ id: "..." }`
content = content.replace(/\{\s*url:\s*"([^"]+)"\s*\}/g, (match, url) => {
    let id = '';
    if (url.includes('cloudinary.com')) {
        const parts = url.split('/');
        let lastPart = parts[parts.length - 1];
        if (lastPart.includes('?')) {
            lastPart = lastPart.split('?')[0];
        }
        id = lastPart.split('.')[0]; // remove extension
    } else if (url.includes('glitch.global') || url.includes('glitch.me')) {
        const parts = url.split('/');
        let lastPart = parts[parts.length - 1];
        if (lastPart.includes('?')) {
            lastPart = lastPart.split('?')[0];
        }
        id = lastPart.split('.')[0]; // remove extension
    } else if (!url.startsWith('http')) {
        // already an ID maybe?
        id = url;
    } else {
        return match; // don't touch unknown URLs
    }
    return `{ id: "${id}" }`;
});

// 2. Update getThumbnailUrl
const newThumbnailUrl = `function getThumbnailUrl(urlOrId) {
    if (!urlOrId) return '';
    if (!urlOrId.startsWith('http')) {
        return \`https://res.cloudinary.com/drnh8zy84/image/upload/q_auto,f_auto,c_fill,w_400,h_400/\${urlOrId}.jpg\`;
    }
    if (!urlOrId.includes('cloudinary.com')) return urlOrId;
    
    if (urlOrId.includes('/q_auto/f_auto/')) {
        return urlOrId.replace('/q_auto/f_auto/', '/q_auto,f_auto,c_fill,w_400,h_400/');
    }
    
    if (urlOrId.includes('/upload/')) {
        return urlOrId.replace('/upload/', '/upload/q_auto,f_auto,c_fill,w_400,h_400/');
    }
    
    return urlOrId;
}`;

content = content.replace(/function getThumbnailUrl\(url\) \{[\s\S]*?return url;\n\}/, newThumbnailUrl);

// 3. Update getViewerUrl
const newViewerUrl = `function getViewerUrl(urlOrId) {
    if (!urlOrId) return '';
    if (!urlOrId.startsWith('http')) {
        return \`https://res.cloudinary.com/drnh8zy84/image/upload/q_auto,f_auto,w_1200/\${urlOrId}.jpg\`;
    }
    if (!urlOrId.includes('cloudinary.com')) return urlOrId;
    
    if (urlOrId.includes('/q_auto/f_auto/')) {
        return urlOrId.replace('/q_auto/f_auto/', '/q_auto,f_auto,w_1200/');
    }
    
    if (urlOrId.includes('/upload/')) {
        return urlOrId.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
    }
    
    return urlOrId;
}`;

content = content.replace(/function getViewerUrl\(url\) \{[\s\S]*?return url;\n\}/, newViewerUrl);

// 4. Update the places where photo.url is used
content = content.replace(/getThumbnailUrl\(photo\.url\)/g, "getThumbnailUrl(photo.id || photo.url)");
content = content.replace(/getViewerUrl\(state\.currentImages\[state\.currentIndex\]\.url\)/g, "getViewerUrl(state.currentImages[state.currentIndex].id || state.currentImages[state.currentIndex].url)");
content = content.replace(/getThumbnailUrl\(album\.photos\[0\]\.url\)/g, "getThumbnailUrl(album.photos[0].id || album.photos[0].url)");

fs.writeFileSync('a.js', content);
console.log('Done refactoring a.js');
