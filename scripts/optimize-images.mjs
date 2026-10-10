#!/usr/bin/env node

/**
 * Image optimization script for production
 * Converts images to WebP and optimized JPEG formats
 * Reduces file size and improves web performance
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '../public/images');

async function optimizeImages() {
  const headshot = join(publicDir, 'headshot.jpg');

  try {
    console.log('🖼️  Optimizing images...');

    // WebP 800px
    await sharp(headshot)
      .resize(800, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(publicDir, 'headshot-800.webp'));
    console.log('✓ headshot-800.webp created');

    // WebP 400px
    await sharp(headshot)
      .resize(400, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(publicDir, 'headshot-400.webp'));
    console.log('✓ headshot-400.webp created');

    // JPEG 800px (fallback)
    await sharp(headshot)
      .resize(800, { withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(join(publicDir, 'headshot-800.jpg'));
    console.log('✓ headshot-800.jpg created');

    console.log('✅ Image optimization complete');
  } catch (err) {
    console.error('❌ Image optimization failed:', err.message);
    process.exit(1);
  }
}

optimizeImages();
