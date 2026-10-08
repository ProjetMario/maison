import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from 'parse5';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const property = JSON.parse(await readFile(path.join(root, 'src/data/property.json'), 'utf8'));
const reportName = process.argv.find(arg => arg.startsWith('--report='))?.slice(9) ?? 'audit-live';
assert.match(reportName, /^[a-z0-9-]+$/);
const verifyBuild = process.argv.includes('--verify-build');
const origin = property.origin;
const parser = new XMLParser({ ignoreAttributes: false });
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
function elements(node, list = []) {
  if (node.tagName) list.push(node);
  for (const child of node.childNodes ?? []) elements(child, list);
  return list;
}
async function request(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(20000) });
      if (response.status >= 500 && attempt < 2) {
        await response.body?.cancel();
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}
const sitemapResponse = await request(`${origin}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, 'Sitemap must return HTTP 200');
const sitemapXML = await sitemapResponse.text();
assert.equal(XMLValidator.validate(sitemapXML), true, 'Sitemap must be valid XML');
const sitemap = parser.parse(sitemapXML);
const rows = [].concat(sitemap.urlset?.url ?? []);
assert.ok(rows.length > 0, 'Empty sitemap');
const urls = rows.map(row => row.loc);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
for (const row of rows) {
  assert.equal(new URL(row.loc).origin, origin, 'Wrong sitemap origin');
  assert.ok(new URL(row.loc).pathname.endsWith('/'), 'Noncanonical sitemap path');
  if (row.lastmod) assert.ok(Date.parse(row.lastmod) <= Date.now(), 'Invalid or future lastmod');
}
const robotsResponse = await request(`${origin}/robots.txt`);
const robots = await robotsResponse.text();
assert.equal(robotsResponse.status, 200);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
assert.ok(!/^Disallow:\s*\/\s*$/mi.test(robots), 'Site blocks crawlers');
const report = { checkedAt: new Date().toISOString(), origin, sitemapCount: urls.length, robots, pages: [], issues: [], warnings: [] };
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const row = { url, issues: [], warnings: [] };
    try {
      const response = await request(url);
      row.status = response.status;
      row.headerRobots = response.headers.get('x-robots-tag');
      row.contentType = response.headers.get('content-type');
      const html = await response.text();
      row.bytes = Buffer.byteLength(html);
      if (response.status !== 200) row.issues.push(`HTTP ${response.status}`);
      if (!row.contentType?.includes('text/html')) row.issues.push('Not HTML');
      if (/noindex|none/i.test(row.headerRobots ?? '')) row.issues.push('Header prevents indexing');
      const nodes = elements(parse(html));
      const find = tag => nodes.filter(node => node.tagName === tag);
      row.title = text(find('title')[0] ?? {});
      row.description = attr(find('meta').find(node => attr(node, 'name') === 'description') ?? {}, 'content');
      row.canonical = attr(find('link').find(node => attr(node, 'rel') === 'canonical') ?? {}, 'href');
      row.robots = find('meta').filter(node => ['robots', 'googlebot', 'bingbot'].includes(attr(node, 'name'))).map(node => attr(node, 'content')).join(';');
      row.h1 = find('h1').map(text);
      if (!row.title) row.issues.push('Missing title');
      if (!row.description) row.issues.push('Missing description');
      if (row.canonical !== url) row.issues.push(`Wrong canonical: ${row.canonical}`);
      if (/noindex|none/i.test(row.robots)) row.issues.push('Meta prevents indexing');
      if (row.h1.length !== 1) row.issues.push(`${row.h1.length} H1 headings`);
      row.alternates = find('link').filter(node => attr(node, 'rel') === 'alternate' && attr(node, 'hreflang')).map(node => ({ lang: attr(node, 'hreflang'), url: attr(node, 'href') }));
      row.links = [...new Set(find('a').map(node => attr(node, 'href')).filter(Boolean).flatMap(href => {
        try {
          const linked = new URL(href, url);
          if (linked.origin !== origin) return [];
          if (!linked.pathname.endsWith('/') && !path.extname(linked.pathname)) row.warnings.push(`Link without trailing slash: ${linked.pathname}`);
          return [linked.origin + linked.pathname];
        } catch { return []; }
      }))];
      row.schemaTypes = [];
      for (const script of find('script').filter(node => attr(node, 'type') === 'application/ld+json')) {
        try {
          const data = JSON.parse(text(script));
          if (data['@context'] !== 'https://schema.org') row.issues.push('Invalid schema context');
          for (const entity of data['@graph'] ?? [data]) row.schemaTypes.push(entity['@type']);
        } catch { row.issues.push('Invalid structured-data JSON'); }
      }
      for (const image of find('img')) if (!attr(image, 'alt')?.trim()) row.issues.push('Image has no alt text');
      if (verifyBuild) {
        const local = await readFile(path.join(root, 'dist', new URL(url).pathname, 'index.html'));
        if (createHash('sha256').update(html).digest('hex') !== createHash('sha256').update(local).digest('hex')) row.issues.push('Published page differs from verified build');
      }
    } catch (error) { row.issues.push(error.message); }
    report.pages.push(row);
    if (report.pages.length % 250 === 0) console.log(`Checked ${report.pages.length}/${urls.length} URLs.`);
  }
}));
report.pages.sort((a, b) => a.url.localeCompare(b.url));
const pages = new Map(report.pages.map(page => [page.url, page]));
const titles = new Map();
const descriptions = new Map();
for (const page of report.pages) {
  for (const [field, seen] of [['title', titles], ['description', descriptions]]) {
    if (seen.has(page[field])) page.issues.push(`Duplicate ${field} with ${seen.get(page[field])}`);
    else if (page[field]) seen.set(page[field], page.url);
  }
  for (const alternate of page.alternates ?? []) {
    if (!pages.get(alternate.url)?.alternates?.some(other => other.url === page.url)) page.issues.push(`Nonreciprocal alternate: ${alternate.url}`);
  }
  for (const link of page.links ?? []) {
    const normalized = link.endsWith('/') ? link : `${link}/`;
    if (!pages.has(normalized) && !path.extname(new URL(link).pathname)) page.issues.push(`Internal link outside sitemap: ${link}`);
  }
  report.issues.push(...page.issues.map(issue => ({ url: page.url, issue })));
  report.warnings.push(...page.warnings.map(issue => ({ url: page.url, issue })));
}
const reachable = new Set();
const queue = [`${origin}/`];
while (queue.length) {
  const url = queue.shift();
  if (reachable.has(url)) continue;
  reachable.add(url);
  for (const link of pages.get(url)?.links ?? []) {
    const normalized = link.endsWith('/') ? link : `${link}/`;
    if (pages.has(normalized) && !reachable.has(normalized)) queue.push(normalized);
  }
}
for (const url of urls) if (!reachable.has(url)) report.issues.push({ url, issue: 'Orphaned from homepage' });
report.summary = { checked: report.pages.length, http200: report.pages.filter(page => page.status === 200).length, reachable: urls.filter(url => reachable.has(url)).length, issues: report.issues.length, warnings: report.warnings.length };
await mkdir(path.join(root, '.seo'), { recursive: true });
await writeFile(path.join(root, '.seo', `${reportName}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary));
if (report.issues.length) console.log(JSON.stringify(report.issues.slice(0, 20), null, 2));
process.exitCode = report.issues.length ? 1 : 0;
