// Build sitemap.xml from route list
import { writeFileSync } from 'fs';
// Use Vite env or fallback
const siteUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL ? import.meta.env.VITE_SITE_URL : 'https://freetextfromimage.com';
const routes = [
  '/',
  '/image-to-text',
  '/extract-text-from-image',
  '/copy-text-from-image',
  '/jpg-to-word',
  '/jpg-to-excel',
  '/privacy-policy',
  '/terms',
  '/about',
  '/contact'
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r => `  <url><loc>${siteUrl}${r}</loc></url>`).join('\n')}\n</urlset>`;
writeFileSync('./public/sitemap.xml', xml);
