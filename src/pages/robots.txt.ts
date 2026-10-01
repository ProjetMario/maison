import type { APIRoute } from 'astro';
import { absoluteUrl, indexable } from '../data/seo';
export const GET: APIRoute = () => new Response(indexable
  ? `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`
  : 'User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
