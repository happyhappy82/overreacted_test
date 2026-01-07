const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'notion-images');
const newDir = path.join(__dirname, 'public', 'notion-images-hq');

// Create new directory
if (!fs.existsSync(newDir)) {
  fs.mkdirSync(newDir);
}

// Get all WebP files to reconvert
const files = fs.readdirSync(imagesDir).filter(file => file.endsWith('.webp'));

console.log(`Found ${files.length} WebP files to reconvert with higher quality...`);
console.log('Creating high-quality versions in notion-images-hq/\n');

Promise.all(
  files.map(async (file) => {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(newDir, file);

    await sharp(inputPath)
      .resize(1200, null, { // Resize to max width 1200px (increased from 800px)
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 90 }) // Increased quality from 85 to 90
      .toFile(outputPath);

    console.log(`✓ Reconverted ${file} (1200px, quality 90)`);
  })
).then(() => {
  console.log('\n✅ All images reconverted with higher quality!');
  console.log('Settings: 1200px max width, quality 90');
  console.log('\nNew files created in: public/notion-images-hq/');
  console.log('Please manually replace the old files.');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
