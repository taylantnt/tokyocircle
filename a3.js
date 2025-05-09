const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");

if (motion.matches) {
  const themeColorMeta = document.getElementById('theme-color');
  const navbar = document.querySelector('.navbar');
  let hue = 0;

  function getCurrentColor() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    return isDarkMode
      ? `hsl(${hue}, 30%, 25%)`
      : `hsl(${hue}, 40%, 90%)`;
  }

  function updateColors() {
    hue = (hue + 1) % 360;
    const color = getCurrentColor();

    document.body.style.background = color;
    if (navbar) navbar.style.background = color;
    if (themeColorMeta) themeColorMeta.setAttribute('content', color);
  }

  setInterval(updateColors, 100);
}