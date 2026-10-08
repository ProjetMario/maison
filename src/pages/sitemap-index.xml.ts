import type { APIRoute } from 'astro';
import { sitemapIndex, xmlResponse } from '../data/sitemap';
export const GET: APIRoute = () => xmlResponse(sitemapIndex());
