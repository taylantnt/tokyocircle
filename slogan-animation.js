// Array of slogans to display
const slogans = [
    "Run. Shoot. Share.",
    "Walk. Capture. Inspire.",
    "Explore. Shoot. Connect.",
    "Stroll. Snap. Share.",
    "Roam. Frame. Unite.",
    "Discover. Click. Grow.",
    "Move. Focus. Create.",
    "Wander. Photograph. Belong."
];

// Calculate max width for each word slot
function getMaxWordWidths() {
    // Split all slogans into arrays of words
    const splitSlogans = slogans.map(s => s.split(' '));
    // Find the maximum number of words in any slogan
    const maxWords = Math.max(...splitSlogans.map(arr => arr.length));
    // For each word slot, find the longest word
    const maxWordsArr = [];
    for (let i = 0; i < maxWords; i++) {
        let max = '';
        for (const arr of splitSlogans) {
            if (arr[i] && arr[i].length > max.length) {
                max = arr[i];
            }
        }
        maxWordsArr.push(max.toUpperCase());
    }
    return maxWordsArr;
}

function measureWordWidths(words, font) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    return words.map(word => ctx.measureText(word).width);
}

let currentIndex = 0;
const flipText = document.querySelector('.flip-text');

function getFontStyle(element) {
    const style = window.getComputedStyle(element);
    return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function createWordElement(word, widthPx) {
    const span = document.createElement('span');
    span.textContent = word.toUpperCase();
    span.style.display = 'inline-block';
    span.style.opacity = '1';
    span.style.transform = 'translateY(0)';
    span.style.clipPath = 'inset(0 0 0 0)';
    span.style.transition = 'none';
    if (widthPx) {
        span.style.width = widthPx + 'px';
        span.style.textAlign = 'center';
    }
    return span;
}

async function animateWordChange(oldSpan, newWord) {
    return new Promise(resolve => {
        oldSpan.style.transition = 'transform 0.4s, opacity 0.4s, clip-path 0.4s';
        oldSpan.style.transform = 'translateY(-20px)';
        oldSpan.style.opacity = '0';
        oldSpan.style.clipPath = 'inset(100% 0 0 0)';
        setTimeout(() => {
            oldSpan.textContent = newWord.toUpperCase();
            oldSpan.style.transition = 'none';
            oldSpan.style.transform = 'translateY(20px)';
            oldSpan.style.clipPath = 'inset(0 0 100% 0)';
            setTimeout(() => {
                oldSpan.style.transition = 'transform 0.4s, opacity 0.4s, clip-path 0.4s';
                oldSpan.style.opacity = '1';
                oldSpan.style.transform = 'translateY(0)';
                oldSpan.style.clipPath = 'inset(0 0 0 0)';
                setTimeout(resolve, 400);
            }, 20);
        }, 400);
    });
}

let maxWordWidthsPx = [];

function applyWordWidths(spans) {
    for (let i = 0; i < spans.length; i++) {
        if (maxWordWidthsPx[i]) {
            spans[i].style.width = maxWordWidthsPx[i] + 'px';
            spans[i].style.textAlign = 'center';
        }
    }
}

async function updateSlogan() {
    const nextIndex = (currentIndex + 1) % slogans.length;
    const oldWords = Array.from(flipText.children).filter(c => c.nodeType === Node.ELEMENT_NODE);
    const newWords = slogans[nextIndex].split(' ');

    // Add or remove spans to match word count
    while (oldWords.length < newWords.length) {
        const span = createWordElement('', maxWordWidthsPx[oldWords.length]);
        flipText.appendChild(span);
        if (oldWords.length !== newWords.length - 1) {
            flipText.appendChild(document.createTextNode(' '));
        }
        oldWords.push(span);
    }
    while (oldWords.length > newWords.length) {
        flipText.removeChild(oldWords.pop());
        if (flipText.lastChild && flipText.lastChild.nodeType === Node.TEXT_NODE) {
            flipText.removeChild(flipText.lastChild);
        }
    }

    applyWordWidths(oldWords);

    // Animate each word change in place
    for (let i = 0; i < newWords.length; i++) {
        if (oldWords[i].textContent !== newWords[i].toUpperCase()) {
            await animateWordChange(oldWords[i], newWords[i]);
        }
    }
    currentIndex = nextIndex;
}

// Set initial text and calculate widths
const initialWords = slogans[0].split(' ');
flipText.innerHTML = '';

// Wait for DOM to be ready and fonts to load
window.addEventListener('DOMContentLoaded', () => {
    // Get max word for each slot
    const maxWordsArr = getMaxWordWidths();
    // Get font style from flipText
    const font = getFontStyle(flipText);
    // Measure widths
    maxWordWidthsPx = measureWordWidths(maxWordsArr, font).map(w => Math.ceil(w + 8)); // add padding

    // Create initial word elements with fixed widths
    for (let i = 0; i < initialWords.length; i++) {
        const wordElement = createWordElement(initialWords[i], maxWordWidthsPx[i]);
        flipText.appendChild(wordElement);
        if (i !== initialWords.length - 1) {
            flipText.appendChild(document.createTextNode(' '));
        }
    }
});

// Start the animation cycle
setInterval(updateSlogan, 4000);