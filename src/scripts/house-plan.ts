import type * as PC from 'playcanvas';
import { housePlan as plan, rooms, partitions, type FloorId, type PlanView } from '../data/house-plan';

export async function initHousePlan() {
  const canvas = document.querySelector<HTMLCanvasElement>('#plan-canvas');
  const scene = document.querySelector<HTMLElement>('#plan-scene');
  if (!canvas || !scene) return;
  const status = document.querySelector<HTMLElement>('#scene-status')!;
  const labelLayer = document.querySelector<HTMLElement>('#plan-labels')!;
  const controls = document.querySelectorAll<HTMLButtonElement | HTMLInputElement>('.plan-toolbar button, .plan-toolbar input, .camera-tools button');
  controls.forEach(control => { control.disabled = true; });
  let app: PC.Application | undefined;
  let device: PC.GraphicsDevice | undefined;
  let disposed = false;
  const abort = new AbortController();
  const cleanups: (() => void)[] = [];
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    abort.abort();
    cleanups.forEach(fn => fn());
    labelLayer.replaceChildren();
    if (app) app.destroy(); else device?.destroy();
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); }, { signal: abort.signal });
  document.addEventListener('astro:before-swap', cleanup, { once: true, signal: abort.signal });
  const fallback = (error: unknown) => {
    console.warn('Plan 3D unavailable:', error);
    scene.dataset.renderer = 'unavailable';
    status.hidden = true;
    canvas.hidden = true;
    labelLayer.hidden = true;
    document.querySelector<HTMLElement>('.camera-tools')!.hidden = true;
    document.querySelector<HTMLElement>('#plan-fallback')!.hidden = false;
    scene.setAttribute('aria-busy', 'false');
    controls.forEach(control => { control.disabled = true; });
  };

  try {
    const pc = await import('playcanvas');
    if (disposed) return;
    // These dev-only overrides exercise the actual fallback paths without affecting production.
    const isDev = (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV;
    const testRenderer = isDev ? new URLSearchParams(location.search).get('renderer') : null;
    if (testRenderer === 'none') throw new Error('Test: graphics unavailable');
    device = await pc.createGraphicsDevice(canvas, {
      deviceTypes: testRenderer === 'webgl2' ? [pc.DEVICETYPE_WEBGL2] : [pc.DEVICETYPE_WEBGPU, pc.DEVICETYPE_WEBGL2],
      antialias: true,
    });
    if (disposed) { device.destroy(); return; }
    app = new pc.Application(canvas, { graphicsDevice: device });
    const application = app;
    application.autoRender = false;
    device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    application.setCanvasResolution(pc.RESOLUTION_AUTO);
    application.scene.ambientLight = new pc.Color(0.48, 0.52, 0.49);
    application.scene.exposure = 1;
    const camera = new pc.Entity('Plan camera');
    camera.addComponent('camera', { projection: pc.PROJECTION_ORTHOGRAPHIC, clearColor: new pc.Color(0.929, 0.945, 0.937), nearClip: 0.1, farClip: 150 });
    camera.camera!.toneMapping = pc.TONEMAP_ACES;
    application.root.addChild(camera);
    const sun = new pc.Entity('Daylight');
    sun.addComponent('light', { type: 'directional', color: new pc.Color(1, 0.97, 0.9), intensity: 1.05, castShadows: true, shadowDistance: 45, shadowResolution: 2048, shadowBias: 0.25, normalOffsetBias: 0.08 });
    sun.setEulerAngles(48, -30, 0);
    application.root.addChild(sun);
    const fill = new pc.Entity('Soft fill');
    fill.addComponent('light', { type: 'directional', color: new pc.Color(0.88, 0.94, 1), intensity: 0.65 });
    fill.setEulerAngles(35, 140, 0);
    application.root.addChild(fill);

    const materials: PC.StandardMaterial[] = [];
    const mat = (hex: string, gloss = 0.12, opacity = 1) => {
      const m = new pc.StandardMaterial();
      m.diffuse = new pc.Color().fromString(hex);
      m.gloss = gloss;
      if (opacity < 1) { m.opacity = opacity; m.blendType = pc.BLEND_NORMAL; m.depthWrite = false; }
      m.update(); materials.push(m); return m;
    };
    const white = mat('#f4f4f0'), wallMat = mat('#e4e8e4'), wallCap = mat('#7d9287');
    const wood = mat('#c4a783'), woodLight = mat('#d6c3a5'), woodDark = mat('#ab906e');
    const tile = mat('#c6d3cf'), tileSeam = mat('#e3e9e6');
    const green = mat('#667f6c'), stone = mat('#ece9df'), metal = mat('#414d49', 0.65);
    const glass = mat('#a9d6d0', 0.8, 0.27), linen = mat('#e4ded3'), sage = mat('#829c87');
    const terracotta = mat('#b77662'), water = mat('#acc7c4', 0.7), dark = mat('#303937', 0.55);
    const leaves = mat('#526e4c'), rug = mat('#d9d7ca');
    const floorRoots = { upper: new pc.Entity('Upper floor'), lower: new pc.Entity('Lower floor') };
    const furnitureRoots = { upper: new pc.Entity('Upper furniture'), lower: new pc.Entity('Lower furniture') };
    const labels: { element: HTMLSpanElement; floor: FloorId; point: PC.Vec3; priority: number }[] = [];
    const render = () => { if (!disposed && !document.hidden) application.renderNextFrame = true; };

    function shape(parent: PC.Entity, name: string, x: number, y: number, z: number, w: number, h: number, d: number, material: PC.Material, type = 'box') {
      const e = new pc.Entity(name);
      e.addComponent('render', { type, castShadows: type !== 'plane', receiveShadows: true });
      e.render!.meshInstances.forEach(mesh => { mesh.material = material; });
      e.setLocalPosition(x - 5, y, z - 3.5);
      e.setLocalScale(w, h, d);
      parent.addChild(e);
      return e;
    }
    function box(parent: PC.Entity, x: number, y: number, z: number, w: number, h: number, d: number, material: PC.Material, name = 'Detail') {
      return shape(parent, name, x, y, z, w, h, d, material);
    }
    function wall(parent: PC.Entity, x: number, z: number, length: number, axis: 'x' | 'z', thickness = plan.partition) {
      const w = axis === 'x' ? length : thickness, d = axis === 'z' ? length : thickness;
      const cx = x + (axis === 'x' ? length / 2 : 0), cz = z + (axis === 'z' ? length / 2 : 0);
      box(parent, cx, plan.cutHeight / 2, cz, w, plan.cutHeight, d, wallMat, 'Cutaway wall');
      box(parent, cx, plan.cutHeight + 0.01, cz, w + 0.01, 0.025, d + 0.01, wallCap, 'Wall top');
      box(parent, cx, 0.04, cz, w + 0.02, 0.08, d + 0.02, white, 'Skirting');
    }
    function label(floor: FloorId, text: string, x: number, z: number, css = '', priority = 1) {
      const element = document.createElement('span');
      element.className = `room-label ${css}`;
      element.textContent = text;
      labelLayer.append(element);
      labels.push({ element, floor, point: new pc.Vec3(x - 5, 0.95, z - 3.5), priority });
    }
    function legs(parent: PC.Entity, x: number, z: number, w: number, d: number, height: number) {
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) box(parent, x + dx * (w / 2 - 0.08), height / 2, z + dz * (d / 2 - 0.08), 0.055, height, 0.055, woodDark, 'Furniture leg');
    }
    function plant(parent: PC.Entity, x: number, z: number, scale = 1) {
      shape(parent, 'Plant pot', x, 0.17 * scale, z, 0.3 * scale, 0.34 * scale, 0.3 * scale, stone, 'cylinder');
      for (let i = 0; i < 5; i++) shape(parent, 'Foliage', x + Math.cos(i * 2) * 0.1 * scale, (0.4 + i * 0.06) * scale, z + Math.sin(i * 2) * 0.1 * scale, 0.25 * scale, 0.4 * scale, 0.2 * scale, leaves, 'sphere');
    }
    function sink(parent: PC.Entity, x: number, z: number, width = 0.65) {
      box(parent, x, 0.37, z, width, 0.7, 0.46, woodLight, 'Vanity');
      box(parent, x, 0.75, z, width + 0.04, 0.08, 0.5, white, 'Basin');
      box(parent, x, 0.794, z, width * 0.65, 0.009, 0.3, water, 'Basin inset');
      box(parent, x, 0.86, z - 0.16, 0.035, 0.2, 0.035, metal, 'Tap');
      box(parent, x, 0.95, z - 0.1, 0.035, 0.03, 0.15, metal);
    }
    function shower(parent: PC.Entity, x: number, z: number, width: number, depth: number) {
      box(parent, x, 0.026, z, width, 0.05, depth, white, 'Walk-in shower tray');
      box(parent, x, 0.055, z, 0.06, 0.006, 0.32, metal, 'Shower drain');
      box(parent, x + width / 2, 0.65, z, 0.018, 1.3, depth, glass, 'Shower glass');
      box(parent, x - width / 2 + 0.06, 0.62, z, 0.035, 1.18, 0.035, metal, 'Shower riser');
      box(parent, x - width / 2 + 0.16, 1.22, z, 0.25, 0.035, 0.2, metal, 'Rain shower');
    }
    function bed(parent: PC.Entity, x: number, z: number, width: number, cover: PC.Material) {
      box(parent, x, 0.06, z + 0.1, width + 0.7, 0.03, 2.4, rug, 'Bedroom rug');
      box(parent, x, 0.22, z, width + 0.08, 0.32, 2.05, woodLight, 'Bed frame');
      box(parent, x, 0.43, z, width, 0.18, 2, white, 'Mattress');
      box(parent, x, 0.56, z - 1, width + 0.1, 0.9, 0.09, woodDark, 'Headboard');
      box(parent, x, 0.55, z + 0.28, width - 0.04, 0.09, 1.35, cover, 'Duvet');
      for (const dx of width > 1.2 ? [-0.37, 0.37] : [0]) box(parent, x + dx, 0.56, z - 0.65, 0.58, 0.13, 0.38, linen, 'Pillow');
      box(parent, x + width / 2 + 0.25, 0.25, z - 0.73, 0.35, 0.5, 0.4, woodLight, 'Nightstand');
      shape(parent, 'Bedside lamp', x + width / 2 + 0.25, 0.64, z - 0.73, 0.22, 0.23, 0.22, white, 'cylinder');
    }
    function wardrobe(parent: PC.Entity, x: number, z: number, w: number) {
      box(parent, x, 0.6, z, w, 1.2, 0.55, white, 'Cutaway wardrobe');
      for (let i = 0; i < Math.round(w / 0.45); i++) box(parent, x - w / 2 + 0.3 + i * 0.45, 0.65, z + 0.29, 0.018, 0.18, 0.018, metal, 'Wardrobe handle');
    }
    function door(parent: PC.Entity, x: number, z: number, angle: number) {
      const hinge = new pc.Entity('Open door');
      parent.addChild(hinge); hinge.setLocalPosition(x - 5, 0, z - 3.5); hinge.setLocalEulerAngles(0, angle, 0);
      // The door uses a local hinge so its leaf does not obstruct the opening.
      const leaf = new pc.Entity('Door leaf');
      leaf.addComponent('render', { type: 'box' }); leaf.render!.meshInstances[0].material = woodLight;
      leaf.setLocalScale(0.76, 0.75, 0.04); leaf.setLocalPosition(0.38, 0.375, 0); hinge.addChild(leaf);
    }
    function windowFront(parent: PC.Entity, x: number, width: number) {
      box(parent, x, 0.17, 6.875, width, 0.34, 0.25, wallMat, 'Window sill wall');
      box(parent, x, 0.68, 6.875, width, 0.025, 0.11, metal, 'Window top');
      box(parent, x, 0.35, 6.875, width, 0.04, 0.3, white, 'Window sill');
      box(parent, x, 0.51, 6.875, width, 0.3, 0.025, glass, 'Window glass');
      for (const dx of [-width / 2, 0, width / 2]) box(parent, x + dx, 0.51, 6.875, 0.035, 0.34, 0.07, metal, 'Window frame');
    }
    function stair(parent: PC.Entity, upper: boolean) {
      const s = plan.stair, rise = (plan.ceilingHeight + plan.slab) / 16;
      const start = upper ? -(plan.ceilingHeight + plan.slab) : 0;
      for (let i = 0; i < 8; i++) {
        box(parent, s.x + 0.36, start + rise * (i + 0.5), s.z + 2.6 - i * 0.27, 0.7, rise, 0.275, woodLight, 'Stair tread up');
        box(parent, s.x + 1.18, start + rise * (i + 8.5), s.z + 0.71 + i * 0.27, 0.7, rise, 0.275, woodLight, 'Stair return tread');
      }
      box(parent, s.x + 0.77, start + rise * 8 - 0.09, s.z + 0.25, 1.55, 0.18, 0.6, woodLight, 'Half landing');
      // Cutaway railing follows the upper opening, leaving the stair exit free.
      const railY = upper ? 0 : 2.7;
      for (let i = 0; i < 6; i++) box(parent, s.x, railY + 0.36, s.z + i * 0.53, 0.025, 0.72, 0.025, metal, 'Stair baluster');
      box(parent, s.x, railY + 0.72, s.z + 1.35, 0.035, 0.035, 2.7, metal, 'Stair handrail');
    }

    for (const floor of ['upper', 'lower'] as FloorId[]) {
      const root = floorRoots[floor], furniture = furnitureRoots[floor];
      application.root.addChild(root); root.addChild(furniture);
      // Split the upper slab around the real stair opening.
      if (floor === 'upper') {
        box(root, 4.075, -0.1, 3.5, 8.15, 0.2, 7, white, 'Upper slab');
        box(root, 9.075, -0.1, 5.125, 1.85, 0.2, 3.75, white, 'Upper slab front');
        box(root, 9.85, -0.1, 1.625, 0.3, 0.2, 3.25, white, 'Upper slab edge');
        box(root, 8.925, -0.1, 0.175, 1.55, 0.2, 0.35, white, 'Upper slab rear');
      } else box(root, 5, -0.1, 3.5, 10, 0.2, 7, white, 'Lower slab');
      for (let row = 0; row < 28; row++) {
        const z = 0.125 + row * 0.25;
        const width = floor === 'upper' && z > 0.35 && z < 3.25 ? 8.15 : 10;
        box(root, width / 2, 0.006, z, width - 0.004, 0.012, 0.245, row % 4 === 0 ? woodLight : wood, 'Parquet plank');
        for (let x = (row % 2 ? 1.2 : 2.4); x < width; x += 2.4) box(root, x, 0.014, z, 0.008, 0.003, 0.244, woodDark, 'Parquet joint');
      }
      wall(root, 0.125, 0, 7, 'z', 0.25); wall(root, 9.875, 0, 7, 'z', 0.25);
      if (floor === 'upper') { wall(root, 0.25, 0.125, 6, 'x', 0.25); wall(root, 7.2, 0.125, 2.55, 'x', 0.25); }
      else wall(root, 0.25, 0.125, 9.5, 'x', 0.25);
      for (const [x, width] of [[1.85, 2.5], [5.15, 2.5], [8.3, 2.4]]) windowFront(root, x, width);
      for (const [x, w] of [[0.25, 0.35], [3.1, 0.8], [6.4, 0.7], [9.5, 0.25]]) wall(root, x, 6.875, w, 'x', 0.25);
      partitions[floor].forEach(s => wall(root, s.x, s.z, s.length, s.axis));
      for (const room of rooms[floor]) {
        if (room.wet) {
          box(root, room.x + room.width / 2, 0.018, room.z + room.depth / 2, room.width, 0.018, room.depth, tile, room.name);
          for (let x = room.x + 0.5; x < room.x + room.width; x += 0.5) box(root, x, 0.029, room.z + room.depth / 2, 0.008, 0.003, room.depth, tileSeam);
          for (let z = room.z + 0.5; z < room.z + room.depth; z += 0.5) box(root, room.x + room.width / 2, 0.029, z, room.width, 0.003, 0.008, tileSeam);
        }
        label(floor, room.name, room.x + room.width / 2, room.z + room.depth * (room.bedroom ? 0.87 : 0.55), '', room.bedroom || room.id === 'living' ? 2 : 1);
      }
      stair(root, floor === 'upper');
      label(floor, floor === 'upper' ? 'NIVEAU HAUT' : 'NIVEAU BAS', 5, -0.85, 'floor-label', 4);
      label(floor, '10,00 m', 5, 7.8, 'dimension', 3);
      label(floor, '7,00 m', -0.8, 3.5, 'dimension', 3);
      label(floor, 'Escalier', 8.8, 3.15, '', 1);
      for (const z of [7.35, -0.35]) {
        box(root, 5, -0.08, z, 10, 0.012, 0.012, wallCap, 'Dimension line');
        for (const x of [0, 10]) box(root, x, -0.08, z, 0.012, 0.012, 0.2, wallCap);
      }
    }

    const upper = furnitureRoots.upper, lower = furnitureRoots.lower;
    // Upper living area.
    box(upper, 6.7, 0.045, 4.95, 3.7, 0.025, 2.65, rug, 'Living rug');
    box(upper, 6.05, 0.28, 4.5, 2.6, 0.43, 0.95, linen, 'Sofa base');
    box(upper, 6.05, 0.7, 4.13, 2.6, 0.58, 0.2, linen, 'Sofa back');
    for (const x of [4.84, 7.26]) box(upper, x, 0.53, 4.5, 0.19, 0.44, 0.95, linen, 'Sofa arm');
    for (let i = 0; i < 3; i++) box(upper, 5.2 + i * 0.84, 0.53, 4.55, 0.78, 0.14, 0.7, white, 'Seat cushion');
    box(upper, 5.15, 0.7, 4.37, 0.4, 0.32, 0.18, sage, 'Sofa cushion');
    box(upper, 6.95, 0.7, 4.37, 0.4, 0.32, 0.18, terracotta, 'Sofa cushion');
    shape(upper, 'Round coffee table', 6.5, 0.36, 5.55, 0.85, 0.07, 0.85, woodLight, 'cylinder');
    shape(upper, 'Table pedestal', 6.5, 0.18, 5.55, 0.35, 0.36, 0.35, woodDark, 'cylinder');
    box(upper, 9.35, 0.23, 4.95, 0.55, 0.46, 2.3, woodLight, 'TV console');
    box(upper, 9.4, 0.94, 4.95, 0.06, 0.72, 1.3, dark, 'Television');
    box(upper, 2.25, 0.78, 4.85, 1.55, 0.08, 0.86, woodLight, 'Dining table'); legs(upper, 2.25, 4.85, 1.55, 0.86, 0.74);
    for (const x of [1.7, 2.25, 2.8]) for (const z of [4.15, 5.55]) {
      box(upper, x, 0.44, z, 0.44, 0.08, 0.44, linen, 'Dining chair'); legs(upper, x, z, 0.44, 0.44, 0.4);
      box(upper, x, 0.68, z + (z < 4.8 ? -0.2 : 0.2), 0.44, 0.45, 0.07, linen, 'Chair back');
    }
    for (let i = 0; i < 5; i++) {
      box(upper, 0.65 + i * 0.63, 0.44, 0.62, 0.61, 0.88, 0.63, green, 'Kitchen cabinet');
      box(upper, 0.65 + i * 0.63, 0.65, 0.946, 0.23, 0.025, 0.025, metal, 'Kitchen handle');
    }
    box(upper, 1.9, 0.91, 0.62, 3.15, 0.06, 0.67, stone, 'Kitchen worktop');
    box(upper, 0.66, 0.94, 0.62, 0.52, 0.02, 0.4, metal, 'Kitchen sink');
    box(upper, 2.55, 0.948, 0.62, 0.59, 0.015, 0.43, dark, 'Induction hob');
    for (const x of [2.4, 2.7]) for (const z of [0.51, 0.73]) shape(upper, 'Hob ring', x, 0.96, z, 0.12, 0.006, 0.12, metal, 'cylinder');
    box(upper, 0.65, 0.77, 1.6, 0.65, 1.54, 0.7, white, 'Refrigerator');
    box(upper, 2.1, 0.44, 2.15, 1.55, 0.88, 0.75, green, 'Kitchen island');
    box(upper, 2.1, 0.91, 2.22, 1.7, 0.06, 0.95, stone, 'Island countertop');
    for (const x of [1.65, 2.4]) { shape(upper, 'Stool seat', x, 0.62, 2.98, 0.38, 0.07, 0.38, woodLight, 'cylinder'); legs(upper, x, 2.98, 0.34, 0.34, 0.59); }
    for (const y of [0.25, 0.7, 1.15]) { box(upper, 4.85, y, 0.52, 1.35, 0.05, 0.44, woodLight, 'Pantry shelf'); for (const x of [4.45, 4.85, 5.25]) box(upper, x, y + 0.12, 0.52, 0.22, 0.18, 0.27, linen, 'Pantry storage'); }
    shape(upper, 'Toilet bowl', 4.5, 0.28, 2.5, 0.4, 0.5, 0.6, white, 'capsule');
    box(upper, 4.5, 0.6, 2.14, 0.42, 0.45, 0.2, white, 'Toilet cistern');
    sink(upper, 5.25, 2.1, 0.44);
    wardrobe(upper, 7.45, 0.57, 0.9);
    plant(upper, 0.65, 6.25, 1.3); plant(upper, 9.3, 6.35, 1.1); plant(upper, 6, 0.6, 0.9);
    door(floorRoots.upper, 4, 0.6, -55); door(floorRoots.upper, 5.65, 2.7, 125);
    door(floorRoots.upper, 6.25, 0.125, -65);

    // Lower sleeping and service rooms.
    bed(lower, 1.4, 5.33, 1.55, sage); bed(lower, 4.95, 5.34, 1.35, linen); bed(lower, 8.12, 5.34, 1.2, terracotta);
    wardrobe(lower, 2.8, 4.23, 0.9); wardrobe(lower, 6.15, 4.24, 0.8); wardrobe(lower, 9.25, 4.24, 0.7);
    for (const x of [6.25, 9.35]) { box(lower, x, 0.72, 6.25, 0.65, 0.05, 0.65, woodLight, 'Bedroom desk'); legs(lower, x, 6.25, 0.65, 0.65, 0.7); }
    shower(lower, 0.82, 2.8, 0.93, 0.95); sink(lower, 1.23, 3.57, 0.45);
    // Tub rim is built around a recessed water surface, not a solid block.
    box(lower, 0.88, 0.22, 1.22, 0.85, 0.4, 1.68, white, 'Bathtub base');
    box(lower, 0.88, 0.43, 1.22, 0.65, 0.04, 1.43, water, 'Bathtub basin');
    for (const x of [0.49, 1.27]) box(lower, x, 0.48, 1.22, 0.1, 0.12, 1.68, white, 'Bathtub rim');
    for (const z of [0.42, 2.02]) box(lower, 0.88, 0.48, z, 0.85, 0.12, 0.1, white, 'Bathtub rim');
    shower(lower, 2.96, 0.87, 0.92, 1.06); sink(lower, 1.94, 0.58, 0.83);
    for (const x of [4.13, 4.85]) {
      box(lower, x, 0.45, 0.66, 0.65, 0.85, 0.65, white, 'Laundry appliance');
      const drum = shape(lower, 'Appliance glass door', x, 0.46, 1, 0.41, 0.025, 0.41, dark, 'cylinder'); drum.setLocalEulerAngles(90, 0, 0);
      box(lower, x, 0.77, 1, 0.28, 0.07, 0.015, metal, 'Appliance controls');
    }
    box(lower, 4.5, 0.9, 0.66, 1.5, 0.07, 0.7, woodLight, 'Laundry counter'); sink(lower, 5.7, 0.67, 0.65);
    plant(lower, 3.15, 6.35, 0.85); plant(lower, 6.35, 6.4, 0.7);
    for (const [x, z, a] of [[2.35, 2.25, 60], [4.95, 2.25, 60], [0.7, 3.85, -70], [2.45, 3.85, -70], [3.9, 3.85, -70], [7.1, 3.85, -70]]) door(floorRoots.lower, x, z, a);

    let view: PlanView = 'all', yaw = -12, pitch = 58, zoom = 1, panX = 0, panZ = 0, top = false;
    let mobile = scene.clientWidth < 700;
    let labelsVisible = true;
    const projected = new pc.Vec3();
    const caption = document.querySelector<HTMLElement>('#view-caption')!;
    const viewButtons = document.querySelectorAll<HTMLButtonElement>('[data-view]');
    function arrange() {
      mobile = scene!.clientWidth < 700;
      floorRoots.upper.enabled = view !== 'lower'; floorRoots.lower.enabled = view !== 'upper';
      floorRoots.upper.setLocalPosition(view === 'all' && !mobile ? -5.8 : 0, view === 'all' ? 0.7 : 0, view === 'all' && mobile ? -4.7 : 0);
      floorRoots.lower.setLocalPosition(view === 'all' && !mobile ? 5.8 : 0, 0, view === 'all' && mobile ? 4.7 : 0);
      caption.textContent = view === 'all' ? 'Deux niveaux' : view === 'upper' ? 'Niveau haut · Pièces de vie' : 'Niveau bas · Espace nuit';
      scene!.dataset.view = view;
      updateCamera();
    }
    function updateLabels() {
      const occupied: { left: number; right: number; top: number; bottom: number }[] = [];
      for (const item of [...labels].sort((a, b) => b.priority - a.priority)) {
        const enabled = floorRoots[item.floor].enabled && labelsVisible;
        item.element.hidden = !enabled;
        if (!enabled) continue;
        const world = floorRoots[item.floor].getWorldTransform().transformPoint(item.point);
        camera.camera!.worldToScreen(world, projected);
        // PlayCanvas returns CSS pixels, independently of the drawing-buffer resolution.
        const x = projected.x, y = projected.y;
        item.element.style.left = `${x}px`; item.element.style.top = `${y}px`;
        const w = item.element.offsetWidth, h = item.element.offsetHeight;
        const bounds = { left: x - w / 2 - 2, right: x + w / 2 + 2, top: y - h / 2 - 2, bottom: y + h / 2 + 2 };
        const overlap = occupied.some(b => bounds.left < b.right && bounds.right > b.left && bounds.top < b.bottom && bounds.bottom > b.top);
        const underTools = !mobile && bounds.right > scene!.clientWidth - 74 && bounds.top < 304;
        item.element.hidden = overlap || underTools || bounds.left < 0 || bounds.right > scene!.clientWidth || bounds.top < 0 || bounds.bottom > scene!.clientHeight - (mobile ? 65 : 0);
        if (!item.element.hidden) occupied.push(bounds);
      }
    }
    function updateCamera() {
      const rad = Math.PI / 180, p = (top ? 89.95 : pitch) * rad, y = (top ? 0 : yaw) * rad;
      const targetY = view === 'all' ? 0.3 : 0;
      camera.setPosition(panX + 40 * Math.sin(y) * Math.cos(p), targetY + 40 * Math.sin(p), panZ + 40 * Math.cos(y) * Math.cos(p));
      camera.lookAt(panX, targetY, panZ);
      const aspect = Math.max(0.2, scene!.clientWidth / scene!.clientHeight);
      const fit = view === 'all' ? (mobile ? Math.max(12.2, 7.1 / aspect) : Math.max(5.7, 13.4 / aspect)) : Math.max(5.3, 6.2 / aspect);
      camera.camera!.orthoHeight = fit * zoom;
      updateLabels(); render();
    }
    function reset() { yaw = -12; pitch = 58; zoom = 1; panX = panZ = 0; top = false; updateViewButtons(); updateCamera(); }
    function updateViewButtons() {
      document.querySelector('#view-top')!.setAttribute('aria-pressed', String(top));
      document.querySelector('#view-perspective')!.setAttribute('aria-pressed', String(!top));
    }
    const on = (target: EventTarget, type: string, handler: EventListener, options: AddEventListenerOptions = {}) => target.addEventListener(type, handler, { ...options, signal: abort.signal });
    for (const button of viewButtons) on(button, 'click', () => {
      view = button.dataset.view as PlanView;
      viewButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      zoom = 1; panX = panZ = 0; arrange();
    });
    on(document.querySelector('#show-furniture')!, 'change', event => {
      const enabled = (event.target as HTMLInputElement).checked;
      furnitureRoots.upper.enabled = furnitureRoots.lower.enabled = enabled; render();
    });
    on(document.querySelector('#show-labels')!, 'change', event => { labelsVisible = (event.target as HTMLInputElement).checked; updateLabels(); });
    on(document.querySelector('#view-top')!, 'click', () => { top = true; updateViewButtons(); updateCamera(); });
    on(document.querySelector('#view-perspective')!, 'click', () => { top = false; updateViewButtons(); updateCamera(); });
    function zoomBy(factor: number) { zoom = Math.max(0.4, Math.min(2.2, zoom * factor)); updateCamera(); }
    on(document.querySelector('#zoom-in')!, 'click', () => zoomBy(0.85));
    on(document.querySelector('#zoom-out')!, 'click', () => zoomBy(1.18));
    on(document.querySelector('#reset-camera')!, 'click', reset);
    const fullscreen = document.querySelector<HTMLButtonElement>('#fullscreen')!;
    fullscreen.hidden = !document.fullscreenEnabled;
    on(fullscreen, 'click', () => {
      const operation = document.fullscreenElement ? document.exitFullscreen() : document.querySelector<HTMLElement>('.plan-workspace')!.requestFullscreen();
      operation.catch(error => console.warn('Fullscreen unavailable', error));
    });
    on(canvas, 'wheel', event => { event.preventDefault(); zoomBy(Math.exp((event as WheelEvent).deltaY * 0.001)); }, { passive: false });
    on(canvas, 'contextmenu', event => event.preventDefault());
    const pointers = new Map<number, { x: number; y: number }>();
    on(canvas, 'pointerdown', event => {
      const e = event as PointerEvent;
      canvas!.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    on(canvas, 'pointermove', event => {
      const e = event as PointerEvent, previous = pointers.get(e.pointerId);
      if (!previous) return;
      const dx = e.clientX - previous.x, dy = e.clientY - previous.y;
      if (pointers.size >= 2) {
        const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)![1];
        const before = Math.hypot(previous.x - other.x, previous.y - other.y), after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        if (after > 0 && before > 0) zoom = Math.max(0.4, Math.min(2.2, zoom * before / after));
        panX -= dx * 0.006 * zoom; panZ -= dy * 0.006 * zoom;
      } else if (e.buttons === 2 || e.shiftKey || top) { panX -= dx * 0.012 * zoom; panZ -= dy * 0.012 * zoom; }
      else { yaw -= dx * 0.3; pitch = Math.max(30, Math.min(82, pitch + dy * 0.25)); }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); updateCamera();
    });
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) on(canvas, eventName, event => pointers.delete((event as PointerEvent).pointerId));
    on(canvas, 'keydown', event => {
      const e = event as KeyboardEvent;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '0'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === '0') return reset();
      if (e.key === '+' || e.key === '=') return zoomBy(0.9);
      if (e.key === '-') return zoomBy(1.1);
      if (e.key === 'ArrowLeft') yaw -= 8;
      if (e.key === 'ArrowRight') yaw += 8;
      if (e.key === 'ArrowUp') pitch = Math.min(82, pitch + 5);
      if (e.key === 'ArrowDown') pitch = Math.max(30, pitch - 5);
      updateCamera();
    });
    const resize = new ResizeObserver(() => {
      application.resizeCanvas(scene!.clientWidth, scene!.clientHeight);
      arrange();
    });
    resize.observe(scene); cleanups.push(() => resize.disconnect());
    on(document, 'visibilitychange', () => { if (!document.hidden) render(); });
    application.on('prerender', updateLabels);
    device.on('devicelost', () => { cleanup(); fallback(new Error('Graphics device lost')); });
    cleanups.push(() => materials.forEach(m => m.destroy()));
    application.resizeCanvas(scene.clientWidth, scene.clientHeight);
    arrange();
    application.start();
    application.once('frameend', () => {
      status.hidden = true;
      scene!.dataset.renderer = device!.deviceType;
      scene!.setAttribute('aria-busy', 'false');
      controls.forEach(control => { control.disabled = false; });
    });
    render();
  } catch (error) {
    cleanup(); fallback(error);
  }
}
