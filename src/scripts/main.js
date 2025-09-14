// Import our custom CSS
import '/styles/styles.scss';

// Import all of Bootstrap's JS
import 'bootstrap';

const colorNames = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'indigo',
  'purple',
  'pink',
];
const colorVariants = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

let colourHexes = {};

const swatchDOM = (colorName, paletteIndex, angleDeg, level) => {
  const template = `
  <div 
    class="swatch bd-${colorName}" 
    title="${colorName}" 
    data-name="${colorName}" 
    data-palette-index="${paletteIndex}"
  ></div>`;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template.trim();

  const dom = tempDiv.firstChild;
  dom.style.setProperty('--angle', `${angleDeg}deg`);
  dom.style.setProperty('--radius', `${level}em`);

  return dom;
};

// Utility function to convert RGB to HEX
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return result
    ? `#${result
        .map((x) => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')}`
    : null;
}

// Utility function to remove indentation from multiline strings
function dedent(str) {
  return str.replace(/^[ \t]+/gm, '').trim();
}

function shuffleColors() {
  const colourKeys = Object.keys(colourHexes);
  const randomColourStart = colourKeys[Math.floor(Math.random() * colourKeys.length)];
  const randomColourMiddle = colourKeys[Math.floor(Math.random() * colourKeys.length)];
  const randomColourEnd = colourKeys[Math.floor(Math.random() * colourKeys.length)];

  selectColor(0, randomColourStart);
  selectColor(1, randomColourMiddle);
  selectColor(2, randomColourEnd);

  // Update the gradient preview
  updateGradient(randomColourStart, randomColourMiddle, randomColourEnd);
}

function createSwatchForContainer(container, paletteIndex, colourName, angleDeg, level) {
  const swatch = swatchDOM(colourName, paletteIndex, angleDeg, level);
  swatch.addEventListener('click', () => selectColor(paletteIndex, colourName));
  container.appendChild(swatch);
  return swatch;
}

function createColorSwatches() {
  const selector = '.palette';
  const swatchContainers = document.querySelectorAll(selector);
  swatchContainers.forEach((swatchContainer, paletteIndex) => {
    populateSwatches(swatchContainer, paletteIndex);
  });

  // Update the colourHexes object with hex values for each colour
  const allSwatches = document.querySelectorAll('.swatch');
  allSwatches.forEach((swatch) => {
    const colorName = swatch.getAttribute('data-name');
    const swatchRGB = getComputedStyle(swatch).backgroundColor;
    const swatchHex = rgbToHex(swatchRGB);
    colourHexes[colorName] = swatchHex;
  });
}

function populateSwatches(swatchContainer, paletteIndex) {
  if (!swatchContainer) return;
  swatchContainer.innerHTML = ''; // Clear any existing swatches

  // For each colour name (e.g. red, blue, green)
  colorNames.forEach((color, nameIndex) => {
    const angleDeg = Math.round((360 / colorNames.length) * nameIndex);
    colorVariants.forEach((variant, variantIndex) => {
      const level = colorVariants.length - variantIndex; // reverse order
      const colourName = `${color}-${variant}`;
      createSwatchForContainer(swatchContainer, paletteIndex, colourName, angleDeg, level);
    });

    // swatchContainer.appendChild(colorRow);
  });
}

function setSwatchToColour(swatchIndex, colourName) {
  const largeSwatches = document.querySelectorAll('.swatch-lg');
  if (largeSwatches.length <= swatchIndex) return;

  const swatch = largeSwatches[swatchIndex];
  swatch.className = 'swatch-lg'; // Reset classes
  swatch.classList.add(`bd-${colourName}`);
  swatch.dataset.name = colourName;
  swatch.title = colourName;
}

function updateGradient(...colours) {
  // Update the gradient preview (body) based on the selected colours
  const hexes = colours.map((color) => colourHexes[color]);
  const colourNames = colours.map((color) => `$${color}`);

  const gradientCssName = `linear-gradient(to right, ${colourNames.join(', ')})`;
  const gradientCssHex = `linear-gradient(to right, ${hexes.join(', ')})`;
  document.body.style.background = gradientCssHex;

  // Update the CSS code display
  const cssCodeDisplay = document.querySelector('.css-code');
  if (cssCodeDisplay) {
    cssCodeDisplay.textContent = dedent(`
    background: ${gradientCssName};

    /* OR */

    background: ${gradientCssHex};
    `).trim();
  }

  // Update the URL parameters
  // e.g. ?colour=red-500&colour=blue-500&colour=green-500

  // Set the URL parameters
  const urlParams = new URLSearchParams();
  colours.forEach((color) => {
    urlParams.append('colour', color);
  });

  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

  // Update the URL without reloading the page
  //   window.history.replaceState({}, '', newUrl);

  // Add the URL to the back history
  window.history.pushState({}, '', newUrl);
}

// When a colour swatch is clicked, add it to the large swatch with pallette index
function selectColor(paletteIndex, colorName) {
  setSwatchToColour(paletteIndex, colorName);

  // Get the colours from the large swatches and update the gradient
  const largeSwatches = document.querySelectorAll('.swatch-lg');
  const chosenColours = Array.from(largeSwatches).map((swatch) => swatch.getAttribute('data-name'));
  updateGradient(...chosenColours);
}

// Initialize the colour swatches on page load
createColorSwatches();

// Check for URL parameters to set initial colours or shuffle
const urlParams = new URLSearchParams(window.location.search);
const coloursFromUrl = urlParams.getAll('colour');
if (coloursFromUrl.length > 0) {
  // If there are URL parameters, use them to set the colours
  coloursFromUrl.forEach((color, index) => {
    setSwatchToColour(index, color);
  });

  updateGradient(...coloursFromUrl);
} else {
  // If no URL parameters, shuffle the colours
  shuffleColors();
}

// Set up the shuffle button
const shuffleButton = document.querySelector('.btn-shuffle');
if (shuffleButton) {
  shuffleButton.addEventListener('click', shuffleColors);
}
