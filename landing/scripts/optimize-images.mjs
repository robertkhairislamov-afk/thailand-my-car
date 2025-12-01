import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = './src/assets';
const outputDir = './src/assets/optimized';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = [
  {
    name: '8703d1eade1f26db4f0daf0c4127ca966e251655.png',
    output: 'thailand-bg.webp',
    width: 1200, // Reduce resolution
    quality: 75
  },
  {
    name: '443c5c749ebfe974980617b9c917b81b051ddc82.png',
    output: 'logo.webp',
    width: 200,
    quality: 85
  },
  {
    name: '63ee1135d2de80d559031f3410debd4eccdd3ec3.png',
    output: 'saturway-bg.webp',
    width: 1200,
    quality: 75
  }
];

async function optimizeImages() {
  console.log('Starting image optimization...\n');

  for (const file of files) {
    const inputPath = path.join(assetsDir, file.name);
    const outputPath = path.join(outputDir, file.output);

    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = (inputStats.size / 1024).toFixed(2);

      await sharp(inputPath)
        .resize(file.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: file.quality })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSize = (outputStats.size / 1024).toFixed(2);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`✓ ${file.name}`);
      console.log(`  ${inputSize} KB → ${outputSize} KB (${savings}% saved)`);
      console.log(`  → ${file.output}\n`);
    } catch (err) {
      console.error(`✗ Error processing ${file.name}:`, err.message);
    }
  }

  // Also create fallback PNG versions (smaller)
  console.log('\nCreating PNG fallbacks...\n');

  for (const file of files) {
    const inputPath = path.join(assetsDir, file.name);
    const outputPath = path.join(outputDir, file.output.replace('.webp', '.png'));

    try {
      await sharp(inputPath)
        .resize(file.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .png({ quality: file.quality, compressionLevel: 9 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSize = (outputStats.size / 1024).toFixed(2);

      console.log(`✓ ${file.output.replace('.webp', '.png')} - ${outputSize} KB`);
    } catch (err) {
      console.error(`✗ Error:`, err.message);
    }
  }

  console.log('\n✓ Image optimization complete!');
}

optimizeImages();
