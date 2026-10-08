export type FloorId = 'upper' | 'lower';
export type PlanView = FloorId | 'all';
export type Wall = { x: number; z: number; length: number; axis: 'x' | 'z' };
export type Room = { id: string; name: string; x: number; z: number; width: number; depth: number; wet?: boolean; bedroom?: boolean };

// Conceptual dimensions in metres, independent of the published property data.
export const housePlan = {
  width: 10, depth: 7, exteriorWall: 0.25, partition: 0.1,
  ceilingHeight: 2.5, slab: 0.2, cutHeight: 0.85,
  stair: { x: 8.15, z: 0.35, width: 1.55, depth: 2.9 },
};

export const rooms: Record<FloorId, Room[]> = {
  upper: [
    { id: 'living', name: 'Séjour / repas', x: 0.25, z: 3.25, width: 9.5, depth: 3.5 },
    { id: 'kitchen', name: 'Cuisine ouverte', x: 0.25, z: 0.25, width: 3.7, depth: 2.95 },
    { id: 'pantry', name: 'Cellier', x: 4.05, z: 0.25, width: 1.55, depth: 1.45, wet: true },
    { id: 'wc', name: 'WC', x: 4.05, z: 1.8, width: 1.55, depth: 1.3, wet: true },
    { id: 'entry', name: 'Entrée', x: 5.7, z: 0.25, width: 2.3, depth: 2.95 },
  ],
  lower: [
    { id: 'primary', name: 'Chambre parentale', x: 0.25, z: 3.9, width: 3.25, depth: 2.85, bedroom: true },
    { id: 'bed2', name: 'Chambre 2', x: 3.6, z: 3.9, width: 3.1, depth: 2.85, bedroom: true },
    { id: 'bed3', name: 'Chambre 3', x: 6.8, z: 3.9, width: 2.95, depth: 2.85, bedroom: true },
    { id: 'ensuite', name: 'Douche italienne', x: 0.25, z: 2.3, width: 1.3, depth: 1.5, wet: true },
    { id: 'bath', name: 'Salle de bain', x: 0.25, z: 0.25, width: 3.25, depth: 1.95, wet: true },
    { id: 'laundry', name: 'Buanderie', x: 3.6, z: 0.25, width: 2.5, depth: 1.95, wet: true },
    { id: 'hall', name: 'Dégagement', x: 1.65, z: 2.3, width: 6.35, depth: 1.5 },
  ],
};

// Gaps in these segments are door openings; rooms never require crossing another bedroom.
export const partitions: Record<FloorId, Wall[]> = {
  upper: [
    { x: 4, z: 0.25, length: 0.35, axis: 'z' }, { x: 4, z: 1.4, length: 1.75, axis: 'z' },
    { x: 4, z: 1.75, length: 1.65, axis: 'x' }, { x: 4, z: 3.15, length: 1.65, axis: 'x' },
    { x: 5.65, z: 0.25, length: 1.65, axis: 'z' }, { x: 5.65, z: 2.7, length: 0.45, axis: 'z' },
  ],
  lower: [
    { x: 0.25, z: 2.25, length: 2.1, axis: 'x' }, { x: 3.15, z: 2.25, length: 0.4, axis: 'x' },
    { x: 3.55, z: 0.25, length: 2, axis: 'z' },
    { x: 3.55, z: 2.25, length: 1.4, axis: 'x' }, { x: 5.75, z: 2.25, length: 0.4, axis: 'x' },
    { x: 6.15, z: 0.25, length: 2, axis: 'z' },
    { x: 1.6, z: 2.25, length: 1.6, axis: 'z' },
    { x: 0.25, z: 3.85, length: 0.45, axis: 'x' }, { x: 1.5, z: 3.85, length: 0.95, axis: 'x' },
    { x: 3.25, z: 3.85, length: 0.3, axis: 'x' },
    { x: 3.55, z: 3.85, length: 0.35, axis: 'x' }, { x: 4.7, z: 3.85, length: 2.05, axis: 'x' },
    { x: 6.75, z: 3.85, length: 0.35, axis: 'x' }, { x: 7.9, z: 3.85, length: 1.85, axis: 'x' },
    { x: 3.55, z: 3.85, length: 2.9, axis: 'z' }, { x: 6.75, z: 3.85, length: 2.9, axis: 'z' },
  ],
};
