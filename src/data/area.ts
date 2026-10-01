import snapshot from './area-snapshot.json';

export const areaEnabled = process.env.INCLUDE_AREA_PAGES === 'true';
export const area = snapshot;
export type Town = typeof snapshot.towns[number];
export const slug = (town: Pick<Town, 'name' | 'code'>) => `${town.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${town.code.toLowerCase()}`;
export const townPath = (town: Town) => `/reperes/${slug(town)}/`;
export const areaPaths = areaEnabled ? ['/reperes/', ...area.towns.map(townPath)] : [];
export const number = (value: number, digits = 0) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(value);
export const density = (town: { population: number; areaKm2: number }) => Math.round(town.population / town.areaKm2);
export const mapUrl = (town: { coordinates: number[] }) => `https://www.openstreetmap.org/?mlat=${town.coordinates[1]}&mlon=${town.coordinates[0]}#map=12/${town.coordinates[1]}/${town.coordinates[0]}`;
export const routeUrl = (town: Town) => `https://www.google.com/maps/dir/?api=1&origin=${town.coordinates[1]},${town.coordinates[0]}&destination=${area.base.coordinates[1]},${area.base.coordinates[0]}`;
export const sourceUrl = (town: { code: string }) => `https://geo.api.gouv.fr/communes/${town.code}?fields=nom,code,codesPostaux,departement,region,centre,surface,population`;
