const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'notion-images');

// Get all JPG files
const files = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));

console.log(`Found ${files.length} JPG files to convert...`);

Promise.all(
  files.map(async (file) => {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace('.jpg', '.webp'));

    await sharp(inputPath)
      .resize(800, null, { // Resize to max width 800px
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`✓ Converted ${file} → ${file.replace('.jpg', '.webp')}`);
  })
).then(() => {
  console.log('\n✅ All images converted successfully!');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
