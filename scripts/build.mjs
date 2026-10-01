import { spawnSync } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const indexable = process.env.SITE_INDEXABLE === 'true' || (process.env.SITE_INDEXABLE !== 'false' && process.env.CONTEXT === 'production');
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/astro.js'), 'build'], { cwd: root, env: process.env, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await writeFile(path.join(root, 'dist/_headers'), indexable ? '' : '/*\n  X-Robots-Tag: noindex, nofollow\n');
const property = JSON.parse(await readFile(path.join(root, 'src/data/property.json'), 'utf8'));
await writeFile(path.join(root, 'dist/seo-build.json'), JSON.stringify({ origin: property.origin, indexable, batch: Math.min(3, Math.max(0, Number(process.env.CONTENT_BATCH ?? 1) || 0)), areaPages: process.env.INCLUDE_AREA_PAGES === 'true' ? 2000 : 0 }));
