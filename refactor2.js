const fs = require('fs');

let content = fs.readFileSync('a.js', 'utf8');

// Apply the user's manual changes (fixing any syntax errors along the way)

const manualChanges = [
    // Akihabara
    {
        old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/aki1\.jpeg[^"]*"\s*\}/,
        new: '{ url: "https://res.cloudinary.com/drnh8zy84/image/upload/q_auto/f_auto/v1775505112/aki1_biufkz.jpg" }'
    },
    {
        old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/aki2\.jpeg[^"]*"\s*\}/,
        new: '{ url: "https://res.cloudinary.com/drnh8zy84/image/upload/q_auto/f_auto/v1775505122/aki2_aniqqo.jpg" }'
    },
    {
        old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/aki3\.jpeg[^"]*"\s*\}/,
        new: '{ url: "https://res.cloudinary.com/drnh8zy84/image/upload/q_auto/f_auto/v1775505132/aki3_tthows.jpg" }'
    },
    // Shimokitazawa
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo1\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo2\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-3" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo3\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-2" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo4\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-4" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo5\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-5" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo6\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-6" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo7\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-7" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo8\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-8" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo9\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-9" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/shimo10\.jpeg[^"]*"\s*\}/, new: '{ id: "shimo-10" }' },
    // Kichijoji
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kichi8\.jpeg[^"]*"\s*\}/, new: '{ id: "kichi" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kichi2\.jpeg[^"]*"\s*\}/, new: '{ id: "kichi-2" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kichi3\.jpeg[^"]*"\s*\}/, new: '{ id: "kichi-3" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kichi4\.jpeg[^"]*"\s*\}/, new: '{ id: "kichi-4" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kichi5\.jpeg[^"]*"\s*\}/, new: '{ id: "kichi-5" }' },
    // Kabukicho
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kabu1\.jpeg[^"]*"\s*\}/, new: '{ id: "kabu-1" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kabu2\.jpeg[^"]*"\s*\}/, new: '{ id: "kabu-2" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kabu3\.jpeg[^"]*"\s*\}/, new: '{ id: "kabu-3" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/kabu4\.jpeg[^"]*"\s*\}/, new: '{ id: "kabu-4" }' },
    // Hanzomon - User's partial edit that broke the syntax
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/hanzo1\.jpeg[^"]*"\s*\}/, new: '{ id: "hanzo-1" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/hanzo2\.jpeg[^"]*"\s*\}/, new: '{ id: "hanzo-2" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/hanzo3\.jpeg[^"]*"\s*\}/, new: '{ id: "hanzo-3" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/hanzo4\.jpeg[^"]*"\s*\}/, new: '{ id: "hanzo-4" }' },
    { old: /\{\s*url:\s*"https:\/\/cdn\.glitch\.global\/a0def4c3-e1ef-4dec-a1b4-5c1abf13ecce\/hanzo5\.jpeg[^"]*"\s*\}/, new: '{ id: "hanzo-5" }' }
];

manualChanges.forEach(change => {
    content = content.replace(change.old, change.new);
});

// 1. Replace ALL `{ url: "..." }` with `{ id: "..." }`
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
        id = url;
    } else {
        return match;
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
