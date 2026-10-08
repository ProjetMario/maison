import type { APIRoute, GetStaticPaths } from 'astro';
import { sitemapGroups, urlset, xmlResponse } from '../data/sitemap';

export const getStaticPaths: GetStaticPaths = () => sitemapGroups.map(group => ({ params: { group: group.name }, props: { paths: group.paths } }));
export const GET: APIRoute = ({ props }) => xmlResponse(urlset(props.paths));
