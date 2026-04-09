const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
let lastThemeColorUpdate = 0;

if (motion.matches) {
  const themeColorMeta = document.getElementById('theme-color');
  const navbar = document.querySelector('.navbar');
  let hue = 0;
  let currentSat = document.body.classList.contains('dark-mode') ? 30 : 40;
  let currentLight = document.body.classList.contains('dark-mode') ? 25 : 90;

  function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function updateColors(time) {
    // Smoothly increment hue (approx 10 degrees per second to match photowalks)
    hue = (hue + 0.1) % 360;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const targetSat = isDarkMode ? 30 : 40;
    const targetLight = isDarkMode ? 25 : 90;

    // Smoothly interpolate towards target (acts like a CSS ease transition)
    // 0.05 multiplier gives roughly a 0.6s ease-out feel at 60fps
    currentSat += (targetSat - currentSat) * 0.05;
    currentLight += (targetLight - currentLight) * 0.05;

    const currentColor = `hsl(${hue}, ${currentSat}%, ${currentLight}%)`;
    const currentHex = hslToHex(hue, currentSat, currentLight);

    // Update body background smoothly every frame
    document.body.style.backgroundColor = currentColor;

    // Make sure navbar EXACTLY matches the background at all times (no frosted glass)
    if (navbar) {
      navbar.style.background = currentColor;
      // Remove any backdrop filter that might make it look disconnected
      navbar.style.backdropFilter = 'none';
      navbar.style.webkitBackdropFilter = 'none';
    }

    // Throttle the theme-color meta tag update to avoid Safari's spam filter
    if (time - lastThemeColorUpdate > 800) {
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', currentHex);
      }
      lastThemeColorUpdate = time;
    }
    
    requestAnimationFrame(updateColors);
  }

  requestAnimationFrame(updateColors);

  // Update immediately on scroll or dark mode toggle without waiting for the 800ms throttle
  function forceThemeMetaColorUpdate() {
    if (themeColorMeta) {
      const isDarkMode = document.body.classList.contains('dark-mode');
      const hexColor = hslToHex(hue, isDarkMode ? 30 : 40, isDarkMode ? 25 : 90);
      themeColorMeta.setAttribute('content', hexColor);
      lastThemeColorUpdate = performance.now();
    }
  }

  // Watch for scroll events to update the meta tag when the navbar solidifies
  window.addEventListener('scroll', () => {
    forceThemeMetaColorUpdate();
  });

  // Watch for dark mode toggles on the body
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        forceThemeMetaColorUpdate();
      }
    });
  });
  observer.observe(document.body, { attributes: true });
}