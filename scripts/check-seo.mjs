import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const build = JSON.parse(await readFile(path.join(dist, 'seo-build.json'), 'utf8'));
const property = JSON.parse(await readFile(path.join(root, 'src/data/property.json'), 'utf8'));
const allFiles = await readdir(dist, { recursive: true });
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const previewPaths = new Set(allFiles.includes('plan-3d/index.html') ? ['/plan-3d/'] : []);
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
    assert.equal(attr(meta('robots'), 'content').includes('noindex'), !build.indexable || file === '404.html' || previewPaths.has(urlPath));
    for (const image of find('img')) assert.ok(attr(image, 'alt')?.trim(), 'image missing alt');
    for (const script of find('script').filter(node => attr(node, 'type') === 'application/ld+json')) {
      const data = JSON.parse(text(script));
      assert.equal(data['@context'], 'https://schema.org');
      const graph = data['@graph'];
      for (const entity of graph) {
        if (entity.offers) assert.equal(entity.offers.price, property.price);
        if (entity.mainEntity?.['@id']) assert.ok(graph.some(item => item['@id'] === entity.mainEntity['@id']), 'mainEntity is not defined in schema');
        if (entity['@type'] === 'BreadcrumbList' && urlPath.startsWith('/reperes/') && urlPath !== '/reperes/') {
          assert.equal(entity.itemListElement[1].item, `${build.origin}/reperes/`, 'geographic breadcrumb missing directory');
        }
        if (entity['@type'] === 'Dataset') {
          assert.ok(entity.citation?.length >= 2, 'geographic data missing sources');
          assert.ok(entity.spatialCoverage?.geo?.latitude, 'geographic data missing coordinates');
        }
      }
    }
    for (const node of [...find('a'), ...find('img'), ...find('script'), ...find('source')]) {
      const value = attr(node, node.tagName === 'a' ? 'href' : 'src');
      if (!value || !value.startsWith('/') || value.startsWith('//')) continue;
      const pathname = decodeURIComponent(new URL(value, build.origin).pathname);
      if (node.tagName === 'a' && !path.extname(pathname)) assert.ok(pathname.endsWith('/'), `noncanonical link: ${value}`);
      const target = path.join(dist, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
      try { await access(target); } catch {
        await access(path.join(dist, pathname, 'index.html'));
      }
    }
    pages.set(urlPath, { alternates: find('link').filter(node => attr(node, 'rel') === 'alternate' && attr(node, 'hreflang')).map(node => ({lang: attr(node,'hreflang'), url: attr(node,'href')})) });
  } catch (error) { failures.push(`${file}: ${error.message}`); }
}
for (const [urlPath, page] of pages) {
  for (const alternate of page.alternates) {
    const other = pages.get(new URL(alternate.url).pathname);
    if (!other || !other.alternates.some(item => item.url === new URL(urlPath, build.origin).href)) failures.push(`${urlPath}: missing reciprocal hreflang ${alternate.url}`);
  }
}
const xmlParser = new XMLParser({ ignoreAttributes: false });
const sitemapXML = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
assert.equal(XMLValidator.validate(sitemapXML), true, 'invalid sitemap XML');
const sitemap = xmlParser.parse(sitemapXML);
const sitemapRows = sitemap.urlset.url ? [].concat(sitemap.urlset.url) : [];
const expected = build.indexable ? [...pages.keys()].filter(url => url !== '/404.html' && !previewPaths.has(url)).map(url => new URL(url, build.origin).href) : [];
assert.deepEqual(sitemapRows.map(row => row.loc).sort(), expected.sort(), 'sitemap does not match indexable pages');
for (const row of sitemapRows) assert.ok(row.lastmod && Date.parse(row.lastmod) <= Date.now(), 'invalid or future lastmod');
const indexXML = await readFile(path.join(dist, 'sitemap-index.xml'), 'utf8');
assert.equal(XMLValidator.validate(indexXML), true, 'invalid sitemap index XML');
const groups = [].concat(xmlParser.parse(indexXML).sitemapindex.sitemap ?? []);
const groupedURLs = [];
for (const group of groups) {
  const url = new URL(group.loc);
  assert.equal(url.origin, build.origin);
  const groupXML = await readFile(path.join(dist, url.pathname), 'utf8');
  assert.equal(XMLValidator.validate(groupXML), true, 'invalid group sitemap XML');
  const rows = [].concat(xmlParser.parse(groupXML).urlset.url ?? []);
  assert.ok(rows.length > 0 && rows.length <= 50000);
  for (const row of rows) assert.ok(row.lastmod && Date.parse(row.lastmod) <= Date.now(), 'invalid group lastmod');
  groupedURLs.push(...rows.map(row => row.loc));
}
assert.deepEqual(groupedURLs.sort(), expected.sort(), 'grouped sitemaps do not partition indexable pages');
assert.equal(pages.size, 14 + 4 * build.batch + (build.areaPages ?? 0) + previewPaths.size, 'unexpected page count (includes 404 and local previews)');
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.equal(robots.includes('Disallow: /'), !build.indexable);
const feedXML = await readFile(path.join(dist, 'feed.xml'), 'utf8');
assert.equal(XMLValidator.validate(feedXML), true, 'invalid RSS feed XML');
const feedItems = [].concat(xmlParser.parse(feedXML).rss.channel.item ?? []);
assert.equal(feedItems.length, build.indexable ? 1 + 4 * build.batch : 0, 'wrong feed item count');
for (const item of feedItems) assert.ok(expected.includes(item.link), 'feed links to a noncanonical content page');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`SEO checks passed: ${pages.size - 1 - previewPaths.size} content pages; ${previewPaths.size} local preview; batch ${build.batch}; ${build.indexable ? 'indexable production' : 'noindex preview'}.`);
