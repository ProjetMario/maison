import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import { XMLParser } from 'fast-xml-parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const build = JSON.parse(await readFile(path.join(dist, 'seo-build.json'), 'utf8'));
const property = JSON.parse(await readFile(path.join(root, 'src/data/property.json'), 'utf8'));
const allFiles = await readdir(dist, { recursive: true });
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const failures = [];
const attr = (node, key) => node.attrs?.find(item => item.name === key)?.value;
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
function nodes(node) { return [node, ...(node.childNodes ?? []).flatMap(nodes)]; }

for (const file of allFiles.filter(file => file.endsWith('.html') && !file.startsWith('videos/'))) {
  const urlPath = file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -10)}` : `/${file}`;
  const html = await readFile(path.join(dist, file), 'utf8');
  const elements = nodes(parse(html));
  const find = tag => elements.filter(node => node.tagName === tag);
  const meta = name => find('meta').find(node => attr(node, 'name') === name);
  try {
    const title = text(find('title')[0]);
    const description = attr(meta('description'), 'content');
    assert.equal(find('h1').length, 1, 'one H1 required');
    assert.ok(title && !titles.has(title), 'unique title required');
    assert.ok(description && !descriptions.has(description), 'unique description required');
    titles.add(title); descriptions.add(description);
    const canonical = attr(find('link').find(node => attr(node, 'rel') === 'canonical'), 'href');
    const expectedPath = urlPath === '/404.html' ? '/404/' : urlPath;
    assert.equal(canonical, new URL(expectedPath, build.origin).href, 'wrong canonical');
    assert.equal(attr(find('html')[0], 'lang'), urlPath.startsWith('/en/') ? 'en' : 'fr');
    assert.equal(attr(meta('robots'), 'content').includes('noindex'), !build.indexable || file === '404.html');
    for (const image of find('img')) assert.ok(attr(image, 'alt')?.trim(), 'image missing alt');
    for (const script of find('script').filter(node => attr(node, 'type') === 'application/ld+json')) {
      const data = JSON.parse(text(script));
      assert.equal(data['@context'], 'https://schema.org');
      for (const entity of data['@graph']) if (entity.offers) assert.equal(entity.offers.price, property.price);
    }
    for (const node of [...find('a'), ...find('img'), ...find('script'), ...find('source')]) {
      const value = attr(node, node.tagName === 'a' ? 'href' : 'src');
      if (!value || !value.startsWith('/') || value.startsWith('//')) continue;
      const pathname = decodeURIComponent(new URL(value, build.origin).pathname);
      const target = path.join(dist, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
      try { await access(target); } catch {
        await access(path.join(dist, pathname, 'index.html'));
      }
    }
    pages.set(urlPath, { alternates: find('link').filter(node => attr(node, 'rel') === 'alternate').map(node => ({lang: attr(node,'hreflang'), url: attr(node,'href')})) });
  } catch (error) { failures.push(`${file}: ${error.message}`); }
}
for (const [urlPath, page] of pages) {
  for (const alternate of page.alternates) {
    const other = pages.get(new URL(alternate.url).pathname);
    if (!other || !other.alternates.some(item => item.url === new URL(urlPath, build.origin).href)) failures.push(`${urlPath}: missing reciprocal hreflang ${alternate.url}`);
  }
}
const sitemap = new XMLParser({ ignoreAttributes: false }).parse(await readFile(path.join(dist, 'sitemap.xml'), 'utf8'));
const sitemapRows = sitemap.urlset.url ? [].concat(sitemap.urlset.url) : [];
const expected = build.indexable ? [...pages.keys()].filter(url => url !== '/404.html').map(url => new URL(url, build.origin).href) : [];
assert.deepEqual(sitemapRows.map(row => row.loc).sort(), expected.sort(), 'sitemap does not match indexable pages');
assert.equal(pages.size, 14 + 4 * build.batch + (build.areaPages ?? 0), 'unexpected page count (includes 404)');
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.equal(robots.includes('Disallow: /'), !build.indexable);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`SEO checks passed: ${pages.size - 1} content pages; batch ${build.batch}; ${build.indexable ? 'indexable production' : 'noindex preview'}.`);
