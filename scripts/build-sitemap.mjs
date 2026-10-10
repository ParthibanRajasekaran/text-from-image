// Build sitemap.xml from route list
import { readFileSync, writeFileSync } from 'fs';

// Use VITE_SITE_URL from env or fallback
const siteUrl = process.env.VITE_SITE_URL || 'https://getrendercheck.com';

// Every route the app prerenders (ROUTES in router.tsx), so the sitemap cannot drift from the site.
const routerSource = readFileSync(new URL('../router.tsx', import.meta.url), 'utf8');
const block = routerSource.match(/export const ROUTES = \{([\s\S]*?)\} as const/);
if (!block) throw new Error('Could not find ROUTES in router.tsx');
const routes = [...block[1].matchAll(/:\s*'(\/[^']*)'/g)].map((m) => m[1]);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${siteUrl}${r}</loc>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : r.includes('privacy') || r.includes('terms') || r.includes('security') ? '0.3' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync('./public/sitemap.xml', xml);
console.log(`✓ Sitemap generated with ${routes.length} routes at ${siteUrl}`);
