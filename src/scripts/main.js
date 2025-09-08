// Import our custom CSS
import '/styles/styles.scss';

// Import all of Bootstrap's JS
import 'bootstrap';

const colorNames = [
  'gray',
  'red',
  'yellow',
  'orange',
  'green',
  'teal',
  'blue',
  'cyan',
  'indigo',
  'purple',
  'pink',
];
const colorVariants = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

let colourHexes = {};

const swatchDOM = (colorName, paletteIndex) => {
  const template = `
  <div 
    class="swatch bd-${colorName}" 
    title="${colorName}" 
    data-name="${colorName}" 
    data-palette-index="${paletteIndex}"
  ></div>`;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template.trim();
  return tempDiv.firstChild;
};

const colourRowDOM = (color) => {
  const template = `
    <div class="row">
        <div class="col-4 label">${color.charAt(0).toUpperCase() + color.slice(1)}s</div>
        <div class="col-8 variants"></div>
    </div>
    `;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template.trim();
  return tempDiv;
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
  const randomColourFrom = colourKeys[Math.floor(Math.random() * colourKeys.length)];
  const randomColourTo = colourKeys[Math.floor(Math.random() * colourKeys.length)];

  selectColor(0, randomColourFrom);
  selectColor(1, randomColourTo);

  updateGradient(randomColourFrom, randomColourTo);
}

function createSwatchForRow(colorRow, paletteIndex, colourName) {
  const swatch = swatchDOM(colourName, paletteIndex);
  swatch.addEventListener('click', () => selectColor(paletteIndex, colourName));
  colorRow.querySelector('.variants').appendChild(swatch);
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
  colorNames.forEach((color) => {
    // Create a row and label for each colour
    const colorRow = colourRowDOM(color);

    colorVariants.forEach((variant) => {
      const colourName = `${color}-${variant}`;
      createSwatchForRow(colorRow, paletteIndex, colourName);
    });

    swatchContainer.appendChild(colorRow);
  });
}

// When a colour swatch is clicked, add it to the large swatch with pallette index
function selectColor(paletteIndex, colorName) {
  // get the large swatch elements
  const largeSwatches = document.querySelectorAll('.swatch-lg');
  if (largeSwatches.length < 2) return;

  const selectedSwatch = largeSwatches[paletteIndex];
  const selectedColourClass = `bd-${colorName}`;

  // Remove any existing swatch colour classes
  selectedSwatch.className = 'swatch-lg';
  // Add the new class
  selectedSwatch.classList.add(selectedColourClass);

  selectedSwatch.dataset.name = colorName;
  selectedSwatch.title = colorName;

  // Update the gradient preview
  const swatchFromColour = largeSwatches[0].getAttribute('data-name');
  const swatchToColour = largeSwatches[1].getAttribute('data-name');

  updateGradient(swatchFromColour, swatchToColour);
}

function updateGradient(colourFrom, colourTo) {
  // Update the gradient preview (body) based on the selected colours
  const colourFromHex = colourHexes[colourFrom];
  const colourToHex = colourHexes[colourTo];

  const gradientCssName = `linear-gradient(to right, $${colourFrom}, $${colourTo})`;
  const gradientCssHex = `linear-gradient(to right, ${colourFromHex}, ${colourToHex})`;
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
}

// Initialize the colour swatches on page load
createColorSwatches();

// Set an initial gradient
shuffleColors();

// Set up the shuffle button
const shuffleButton = document.querySelector('.btn-shuffle');
if (shuffleButton) {
  shuffleButton.addEventListener('click', shuffleColors);
}
