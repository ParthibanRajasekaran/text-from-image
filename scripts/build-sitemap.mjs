// Build sitemap.xml from route list
import { writeFileSync } from 'fs';

// Use VITE_SITE_URL from env or fallback
const siteUrl = process.env.VITE_SITE_URL || 'https://freetextfromimage.com';

// All public routes (guides + legal pages)
const routes = [
  '/',
  '/image-to-text',
  '/extract-text-from-image',
  '/copy-text-from-image',
  '/jpg-to-word',
  '/jpg-to-excel',
  '/image-to-excel',
  '/privacy-policy',
  '/terms',
  '/about',
  '/contact'
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${siteUrl}${r}</loc>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : r.includes('privacy') || r.includes('terms') ? '0.3' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync('./public/sitemap.xml', xml);
console.log(`✓ Sitemap generated with ${routes.length} routes at ${siteUrl}`);
