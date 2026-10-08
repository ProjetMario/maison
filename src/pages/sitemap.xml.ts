import type { APIRoute } from 'astro';
import { contentPaths, urlset, xmlResponse } from '../data/sitemap';
export const GET: APIRoute = () => xmlResponse(urlset(contentPaths));
