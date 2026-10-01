import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import geolib from 'geolib';

const source = 'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,departement,region,centre,surface,population&format=json';
const response = await fetch(source, { signal: AbortSignal.timeout(60000) });
assert.ok(response.ok, `Source unavailable: ${response.status}`);
const body = await response.text();
const rows = JSON.parse(body);
const valid = rows.filter(row => row.centre?.coordinates?.length === 2 && row.departement?.code && row.region?.nom && Number.isFinite(row.surface) && row.surface > 0 && Number.isInteger(row.population) && row.population >= 0);
const base = valid.find(row => row.code === '73329' && row.nom === 'Voglans');
assert.ok(base, 'Voglans is missing from the source.');
const distance = (row, target = base) => Math.round(geolib.getDistance(row.centre.coordinates, target.centre.coordinates) / 100) / 10;
const simplify = row => ({ code: row.code, name: row.nom, postcodes: row.codesPostaux, department: row.departement, region: row.region, coordinates: row.centre.coordinates, areaKm2: Math.round(row.surface) / 100, population: row.population });
// One directory and 1,999 commune sheets: exactly 2,000 additional pages.
const towns = valid.filter(row => row.code !== base.code && row.centre.coordinates[1] > 41 && row.centre.coordinates[1] < 52 && row.centre.coordinates[0] > -6 && row.centre.coordinates[0] < 10)
  .map(row => ({ row, km: distance(row) })).sort((a, b) => a.km - b.km || a.row.code.localeCompare(b.row.code)).slice(0, 1999);
assert.equal(towns.length, 1999);
const anchors = ['73065', '73008', '74010', '38185', '69123'].map(code => valid.find(row => row.code === code)).filter(Boolean);
assert.equal(anchors.length, 5, 'Regional reference towns missing.');
const data = { source, retrievedAt: new Date().toISOString(), sourceSha256: createHash('sha256').update(body).digest('hex'), selection: '1999 communes de France les plus proches du centre de Voglans, hors Voglans, parmi les fiches completes de la source.', base: simplify(base), anchors: anchors.map(simplify), towns: towns.map(({ row, km }) => ({ ...simplify(row), km, distances: anchors.map(anchor => ({ code: anchor.code, km: distance(row, anchor) })) })) };
await writeFile(new URL('../src/data/area-snapshot.json', import.meta.url), `${JSON.stringify(data)}\n`);
console.log(JSON.stringify({ sheets: towns.length, additionalPages: towns.length + 1, departments: new Set(towns.map(({row}) => row.departement.code)).size, maxDistanceKm: towns.at(-1).km, source }));
