import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFile(path.join(root, file), 'utf8');
const build = JSON.parse(await read('dist/seo-build.json'));
assert.ok(build.indexable, 'IndexNow only accepts an indexable production build.');
const key = (await read('public/2349814d7c8b2ae2401f69925a5ab30e.txt')).trim();
const keyLocation = `${build.origin}/${key}.txt`;
const parsed = new XMLParser().parse(await read('dist/sitemap.xml'));
const urls = [].concat(parsed.urlset.url ?? []).map(row => row.loc);
const statePath = '.seo/indexnow-state.json';
let previous = {};
try { previous = JSON.parse(await read(statePath)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const next = {};
for (const url of urls) {
  assert.equal(new URL(url).origin, build.origin);
  const html = await read(`dist${new URL(url).pathname}index.html`);
  next[url] = createHash('sha256').update(html).digest('hex');
}
const changed = urls.filter(url => next[url] !== previous[url]);
const removed = Object.keys(previous).filter(url => !(url in next));
const urlList = [...changed, ...removed];
async function readLive(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url, { ...options, headers: { Connection: 'close' }, signal: AbortSignal.timeout(20000) });
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}
async function verifyUrls(list, check) {
  let cursor = 0;
  let verified = 0;
  await Promise.all(Array.from({ length: Math.min(4, list.length) }, async () => {
    while (cursor < list.length) {
      const url = list[cursor++];
      await check(url);
      verified++;
      if (verified % 250 === 0) console.log(`Verified ${verified}/${list.length} live URLs.`);
    }
  }));
}
if (!process.argv.includes('--submit')) {
  console.log(JSON.stringify({ dryRun: true, changed, removed }, null, 2));
} else if (!urlList.length) {
  console.log('No changed URLs to submit.');
} else {
  const liveKey = await readLive(keyLocation);
  assert.ok(liveKey.ok && (await liveKey.text()).trim() === key, 'The production key is not deployed.');
  const liveBuild = await readLive(`${build.origin}/seo-build.json`);
  assert.ok(liveBuild.ok, 'Production build metadata is unavailable.');
  assert.deepEqual(await liveBuild.json(), build, 'Deploy the matching production build before submitting.');
  await verifyUrls(changed, async url => {
    const live = await readLive(url);
    assert.ok(live.ok && !live.headers.get('x-robots-tag')?.includes('noindex'), `Page unavailable or noindex: ${url}`);
    const html = await live.text();
    assert.equal(createHash('sha256').update(html).digest('hex'), next[url], `Live page differs from the build: ${url}`);
  });
  await verifyUrls(removed, async url => {
    const live = await readLive(url, { redirect: 'manual' });
    assert.ok([301, 302, 307, 308, 404, 410].includes(live.status), `Removed URL still serves content: ${url}`);
  });
  const response = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: new URL(build.origin).host, key, keyLocation, urlList }), signal: AbortSignal.timeout(20000) });
  assert.ok([200, 202].includes(response.status), `IndexNow rejected the submission (${response.status}): ${await response.text()}`);
  await mkdir(path.join(root, '.seo'), { recursive: true });
  await writeFile(path.join(root, statePath), JSON.stringify(next, null, 2));
  await writeFile(path.join(root, '.seo/indexnow-receipt.json'), JSON.stringify({
    receivedAt: new Date().toISOString(), status: response.status, origin: build.origin,
    submitted: urlList.length, verifiedLivePages: changed.length, removed: removed.length,
    build, guaranteesIndexing: false,
  }, null, 2));
  console.log(`IndexNow received ${urlList.length} URLs (HTTP ${response.status}). This does not guarantee indexing.`);
}
