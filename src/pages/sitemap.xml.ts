import type { APIRoute } from 'astro';
import { pages, absoluteUrl, alternatives, indexable } from '../data/seo';
import { publishedGuides } from '../data/guides';
import { areaPaths } from '../data/area';
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const GET: APIRoute = () => {
  const paths = indexable ? [...Object.keys(pages), ...publishedGuides.map(guide => `/guides/${guide.slug}/`), ...areaPaths] : [];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${paths.map(path => `<url><loc>${escape(absoluteUrl(path))}</loc>${alternatives(path).map(link => `<xhtml:link rel="alternate" hreflang="${link.lang}" href="${escape(absoluteUrl(link.path))}"/>`).join('')}</url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
