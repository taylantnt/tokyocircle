const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
let lastThemeColorUpdate = 0;

if (motion.matches) {
  const themeColorMeta = document.getElementById('theme-color');
  const navbar = document.querySelector('.navbar');
  let hue = 0;

  function updateColors(time) {
    // Smoothly increment hue (approx 10 degrees per second to match photowalks)
    hue = (hue + 0.1) % 360;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const currentColor = isDarkMode ? `hsl(${hue}, 30%, 25%)` : `hsl(${hue}, 40%, 90%)`;

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
        themeColorMeta.setAttribute('content', currentColor);
      }
      lastThemeColorUpdate = time;
    }
    
    requestAnimationFrame(updateColors);
  }

  requestAnimationFrame(updateColors);
}