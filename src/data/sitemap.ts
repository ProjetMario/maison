import { absoluteUrl, alternatives, indexable, pages } from './seo';
import { publishedGuides } from './guides';
import { area, areaEnabled, areaPaths, townPath } from './area';
import updates from './content-updates.json';

export const lastModified = (path: string) => path.startsWith('/reperes/') ? updates.area : updates.pages;
export const contentPaths = [...Object.keys(pages), ...publishedGuides.map(guide => `/guides/${guide.slug}/`), ...areaPaths];
export const sitemapGroups = [
  { name: 'maison', paths: [...Object.keys(pages), ...publishedGuides.map(guide => `/guides/${guide.slug}/`)] },
  ...(areaEnabled ? [{ name: 'reperes', paths: ['/reperes/'] }, ...[...new Set(area.towns.map(town => town.department.code))].sort().map(code => ({
    name: `reperes-${code}`,
    paths: area.towns.filter(town => town.department.code === code).map(townPath),
  }))] : []),
];
export const sitemapPath = (name: string) => `/sitemap-${name}.xml`;
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export function urlset(paths: string[]) {
  const rows = indexable ? paths : [];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${rows.map(path => `<url><loc>${escape(absoluteUrl(path))}</loc><lastmod>${lastModified(path)}</lastmod>${alternatives(path).map(link => `<xhtml:link rel="alternate" hreflang="${link.lang}" href="${escape(absoluteUrl(link.path))}"/>`).join('')}</url>`).join('')}</urlset>`;
}
export function sitemapIndex() {
  const groups = indexable ? sitemapGroups : [];
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${groups.map(group => `<sitemap><loc>${absoluteUrl(sitemapPath(group.name))}</loc><lastmod>${group.paths.map(lastModified).sort().at(-1)}</lastmod></sitemap>`).join('')}</sitemapindex>`;
}
export const xmlResponse = (xml: string) => new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
