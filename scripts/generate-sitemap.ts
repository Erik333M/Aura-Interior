/**
 * Generates sitemap.xml and robots.txt into apps/web/public/.
 *
 * Reads the seed catalogue rather than the database so it runs in CI without a
 * live Postgres/SQLite connection — the catalogue file is the source of truth
 * for slugs either way.
 *
 * Every URL is emitted three times, once per locale, with reciprocal
 * xhtml:link alternates. Without those, three URLs serving the same content get
 * treated as duplicates and only one is indexed.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { categories } from '../apps/api/prisma/data/categories.js';
import { products } from '../apps/api/prisma/data/products.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'apps', 'web', 'public');

const SITE = (process.env['VITE_SITE_URL'] ?? 'https://aurainterior.am').replace(/\/$/, '');
const LOCALES = ['hy', 'ru', 'en'] as const;

interface Entry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

function entries(): Entry[] {
  const list: Entry[] = [
    { path: '', changefreq: 'weekly', priority: '1.0' },
    { path: '/catalogue', changefreq: 'daily', priority: '0.9' },
    { path: '/interior-design', changefreq: 'monthly', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  ];

  for (const p of products) {
    list.push({ path: `/catalogue/${p.slug}`, changefreq: 'weekly', priority: '0.8' });
  }

  // Category-filtered catalogue views are real landing pages for
  // "beds Yerevan"-style queries, so they belong in the sitemap.
  for (const c of categories) {
    if (c.isService) continue;
    list.push({ path: `/catalogue?categories=${c.slug}`, changefreq: 'weekly', priority: '0.7' });
  }

  return list;
}

const xmlEscape = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildSitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls: string[] = [];

  for (const entry of entries()) {
    for (const locale of LOCALES) {
      const loc = `${SITE}/${locale}${entry.path}`;
      const alternates = [
        ...LOCALES.map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(`${SITE}/${l}${entry.path}`)}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(`${SITE}/hy${entry.path}`)}"/>`,
      ].join('\n');

      urls.push(
        [
          '  <url>',
          `    <loc>${xmlEscape(loc)}</loc>`,
          alternates,
          `    <lastmod>${today}</lastmod>`,
          `    <changefreq>${entry.changefreq}</changefreq>`,
          `    <priority>${entry.priority}</priority>`,
          '  </url>',
        ].join('\n'),
      );
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls.join('\n'),
    '</urlset>',
    '',
  ].join('\n');
}

function buildRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Internal tool and personal lists — no value in the index.',
    'Disallow: /admin',
    'Disallow: /*/wishlist',
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const sitemap = buildSitemap();
  await writeFile(path.join(OUT, 'sitemap.xml'), sitemap);
  await writeFile(path.join(OUT, 'robots.txt'), buildRobots());

  const count = (sitemap.match(/<url>/g) ?? []).length;
  console.log(
    `✔ sitemap.xml — ${count} URLs (${entries().length} pages × ${LOCALES.length} locales)`,
  );
  console.log('✔ robots.txt');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
