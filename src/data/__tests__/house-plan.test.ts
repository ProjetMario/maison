import { describe, expect, it } from 'vitest';
import { housePlan, rooms, partitions, type FloorId } from '../house-plan';

describe('Conceptual house plan', () => {
  it('keeps the confirmed footprint and exactly three bedrooms downstairs', () => {
    expect([housePlan.width, housePlan.depth]).toEqual([10, 7]);
    expect(rooms.lower.filter(room => room.bedroom)).toHaveLength(3);
    expect(rooms.upper.some(room => room.bedroom)).toBe(false);
    expect(rooms.lower.map(room => room.id)).toEqual(expect.arrayContaining(['primary', 'bed2', 'bed3', 'ensuite', 'bath', 'laundry']));
    expect(rooms.upper.map(room => room.id)).toEqual(expect.arrayContaining(['living', 'kitchen', 'pantry', 'wc']));
  });

  for (const floor of ['upper', 'lower'] as FloorId[]) {
    it(`fits ${floor} rooms and partitions within the exterior envelope`, () => {
      for (const room of rooms[floor]) {
        expect(room.x).toBeGreaterThanOrEqual(housePlan.exteriorWall);
        expect(room.z).toBeGreaterThanOrEqual(housePlan.exteriorWall);
        expect(room.x + room.width).toBeLessThanOrEqual(housePlan.width - housePlan.exteriorWall + 1e-8);
        expect(room.z + room.depth).toBeLessThanOrEqual(housePlan.depth - housePlan.exteriorWall + 1e-8);
      }
      for (const wall of partitions[floor]) {
        expect(wall.x + (wall.axis === 'x' ? wall.length : 0)).toBeLessThanOrEqual(housePlan.width);
        expect(wall.z + (wall.axis === 'z' ? wall.length : 0)).toBeLessThanOrEqual(housePlan.depth);
      }
    });

    it(`does not overlap rooms or fill the shared stair opening on ${floor}`, () => {
      const rectangles = [...rooms[floor], { ...housePlan.stair }];
      for (let i = 0; i < rectangles.length; i++) {
        for (const other of rectangles.slice(i + 1)) {
          const room = rectangles[i];
          const overlapX = Math.min(room.x + room.width, other.x + other.width) - Math.max(room.x, other.x);
          const overlapZ = Math.min(room.z + room.depth, other.z + other.depth) - Math.max(room.z, other.z);
          expect(overlapX > 1e-8 && overlapZ > 1e-8).toBe(false);
        }
      }
    });
  }
});
