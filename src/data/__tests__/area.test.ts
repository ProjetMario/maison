import { describe, it, expect } from 'vitest';
import { getDistance } from 'geolib';
import { area, density, slug, townPath, routeUrl, sourceUrl, nearbyTowns } from '../area';

describe('Sourced geographic sheets', () => {
  it('provides exactly 1,999 unique sheets plus a directory', () => {
    expect(area.towns).toHaveLength(1999);
    expect(new Set(area.towns.map(town => town.code)).size).toBe(1999);
    expect(new Set(area.towns.map(townPath)).size).toBe(1999);
    expect(area.towns.some(town => town.code === area.base.code)).toBe(false);
  });
  it('has traceable source metadata and complete numeric facts', () => {
    expect(new URL(area.source).hostname).toBe('geo.api.gouv.fr');
    expect(area.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(Number.isNaN(Date.parse(area.retrievedAt))).toBe(false);
    for (const town of area.towns) {
      expect(town.areaKm2).toBeGreaterThan(0);
      expect(town.population).toBeGreaterThanOrEqual(0);
      expect(town.postcodes.length).toBeGreaterThan(0);
      expect(town.coordinates).toHaveLength(2);
      expect(town.department.code).toBeTruthy();
      expect(townPath(town)).toMatch(/^\/reperes\/[a-z0-9-]+\/$/);
      expect(town.distances).toHaveLength(5);
    }
  });
  it('calculates distances consistently without treating them as road travel', () => {
    for (const town of area.towns) {
      expect(town.km).toBe(Math.round(getDistance(town.coordinates, area.base.coordinates) / 100) / 10);
      for (const item of town.distances) {
        const target = area.anchors.find(anchor => anchor.code === item.code)!;
        expect(item.km).toBe(Math.round(getDistance(town.coordinates, target.coordinates) / 100) / 10);
      }
    }
  });
  it('disambiguates homonyms and normalizes accents', () => {
    expect(slug({ name: 'Chambéry', code: '73065' })).toBe('chambery-73065');
    expect(slug({ name: 'Saint-Aubin', code: '01001' })).not.toBe(slug({ name: 'Saint-Aubin', code: '02001' }));
  });
  it('builds correct external links and density values', () => {
    const town = area.towns[0];
    const url = new URL(routeUrl(town));
    expect(url.searchParams.get('destination')).toBe(`${area.base.coordinates[1]},${area.base.coordinates[0]}`);
    expect(new URL(sourceUrl(town)).pathname).toBe(`/communes/${town.code}`);
    expect(density({ population: 200, areaKm2: 4 })).toBe(50);
  });
  it('links nearby towns using the distance from the selected town', () => {
    const town = area.towns.find(item => item.name === 'Chambéry')!;
    const neighbours = nearbyTowns(town);
    expect(neighbours).toHaveLength(6);
    expect(neighbours.some(item => item.town.code === town.code)).toBe(false);
    for (const item of neighbours) expect(item.distance).toBe(getDistance(town.coordinates, item.town.coordinates));
    const maximum = neighbours.at(-1)!.distance;
    for (const other of area.towns.filter(item => item.code !== town.code && !neighbours.some(neighbour => neighbour.town.code === item.code))) {
      expect(getDistance(town.coordinates, other.coordinates)).toBeGreaterThanOrEqual(maximum);
    }
  });
});
