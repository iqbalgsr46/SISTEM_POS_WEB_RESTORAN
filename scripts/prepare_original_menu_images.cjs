const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const downloadsDir = 'C:/Users/tbiqb/Downloads';
const menuDir = path.join(__dirname, '..', 'public', 'images', 'menu');

const items = [
  { orig: 'Fusion Cheese Bites.png', target: 'fusion-cheese-bites' },
  { orig: 'Rocket Pop Chicken.png', target: 'rocket-pop-chicken' },
  { orig: 'Mars Potato Wedges.png', target: 'mars-potato-wedges' },
  { orig: 'Orbit Crunch.png', target: 'orbit-crunch' },
  { orig: 'Neuralink Enoki.png', target: 'neuralink-enoki' },
];

async function processImages() {
  for (const item of items) {
    const src = path.join(downloadsDir, item.orig);
    if (!fs.existsSync(src)) {
      console.error('Source not found:', src);
      continue;
    }

    // The original 1536x1024 photo has the dish centered.
    // Crop coordinates that capture the complete bowl, greaseproof paper, food, and sauce bowl with balanced margins:
    // left: 140, top: 90, width: 1256, height: 844
    // Resize to standard menu dimension 650x437
    const pngPath = path.join(menuDir, `${item.target}.png`);
    const webpPath = path.join(menuDir, `${item.target}.webp`);

    console.log(`Processing ${item.orig} -> ${item.target}...`);

    await sharp(src)
      .extract({ left: 140, top: 90, width: 1256, height: 844 })
      .resize(650, 437)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(pngPath);

    await sharp(pngPath)
      .webp({ quality: 90 })
      .toFile(webpPath);

    console.log(`Saved ${pngPath} and ${webpPath}`);
  }
}

processImages().catch(console.error);
