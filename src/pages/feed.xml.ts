import type { APIRoute } from 'astro';
import property from '../data/property.json';
import { absoluteUrl, indexable, pages } from '../data/seo';
import { publishedGuides } from '../data/guides';
import { lastModified } from '../data/sitemap';

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const GET: APIRoute = () => {
  const items = indexable ? [
    { ...pages['/maison-vue-lac-bourget/'], path: '/maison-vue-lac-bourget/' },
    ...publishedGuides.map(guide => ({ ...guide, path: `/guides/${guide.slug}/` })),
  ] : [];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(property.name)}</title><link>${absoluteUrl('/')}</link><description>${escape(pages['/guides/'].description)}</description><language>fr</language><lastBuildDate>${new Date(lastModified('/guides/')).toUTCString()}</lastBuildDate><atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>${items.map(item => `<item><title>${escape(item.title)}</title><link>${absoluteUrl(item.path)}</link><guid isPermaLink="true">${absoluteUrl(item.path)}</guid><description>${escape(item.description)}</description></item>`).join('')}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
