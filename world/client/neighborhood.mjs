import { LOCATIONS, LAWN } from './locations.mjs';
import { addTownLandmarks } from './town-landmarks.mjs?v=town-1';

// Presentation units only. The game continues to own its original x/y coordinates.
export const WORLD_SCALE = .05;
export const position3D = (x, y, height = 0) => ({ x: x * WORLD_SCALE, y: height, z: y * WORLD_SCALE });
export const heading3D = angle => -angle;

export function createNeighborhood(T, makeCanvas = () => document.createElement('canvas')) {
  const root = new T.Group();
  const materials = new Map(), geometries = new Map(), textures = new Set();
  const greenery = [], grassCells = [], blossoms = [];
  const material = (color, roughness = .8) => {
    const key = `${color}/${roughness}`;
    if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness }));
    return materials.get(key);
  };
  function mesh(parent, geometry, mat, x, y, z) {
    const m = new T.Mesh(geometry, typeof mat === 'string' || typeof mat === 'number' ? material(mat) : mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function roundGeometry(w, h, d, r = .08) {
    const key = `box/${w}/${h}/${d}/${r}`;
    if (geometries.has(key)) return geometries.get(key);
    r = Math.min(r, w / 3, h / 3, d / 3);
    const shape = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r;
    const a = w - r * 2, b = h - r * 2;
    shape.moveTo(x, y); shape.lineTo(x + a, y); shape.lineTo(x + a, y + b); shape.lineTo(x, y + b); shape.closePath();
    const g = new T.ExtrudeGeometry(shape, { depth: d - 2 * r, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: r, bevelThickness: r });
    g.translate(0, 0, -d / 2 + r); geometries.set(key, g); return g;
  }
  function box(parent, w, h, d, color, x, y, z, radius = .06) { return mesh(parent, roundGeometry(w, h, d, radius), color, x, y, z); }
  function sphere(parent, rx, ry, rz, color, x, y, z) {
    if (!geometries.has('sphere')) geometries.set('sphere', new T.SphereGeometry(1, 12, 9));
    const m = mesh(parent, geometries.get('sphere'), color, x, y, z); m.scale.set(rx, ry, rz); return m;
  }
  function cylinder(parent, radius, height, color, x, y, z, top = radius) {
    const key = `cyl/${radius}/${height}/${top}`;
    if (!geometries.has(key)) geometries.set(key, new T.CylinderGeometry(top, radius, height, 10));
    return mesh(parent, geometries.get(key), color, x, y, z);
  }
  function surfaceTexture(kind) {
    const c = makeCanvas(); c.width = c.height = 128; const ctx = c.getContext('2d');
    ctx.fillStyle = kind === 'grass' ? '#77ae53' : kind === 'road' ? '#596774' : '#e8d6b4'; ctx.fillRect(0, 0, 128, 128);
    let seed = 423;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = rnd() > .5 ? 'rgba(255,255,220,.12)' : 'rgba(15,44,27,.12)';
      ctx.fillRect(rnd() * 128, rnd() * 128, 1, kind === 'grass' ? 3 : 1);
    }
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; textures.add(t); return t;
  }
  const groundMat = new T.MeshStandardMaterial({ map: surfaceTexture('grass'), roughness: 1 });
  groundMat.map.repeat.set(70, 70); materials.set('ground', groundMat);
  const ground = mesh(root, new T.PlaneGeometry(180, 180), groundMat, 0, -.035, 0); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  geometries.set('ground', ground.geometry);
  const roadMat = new T.MeshStandardMaterial({ color: '#6a7682', map: surfaceTexture('road'), roughness: 1 });
  roadMat.map.repeat.set(2, 20); materials.set('road', roadMat);
  // Continuous streets, raised sidewalks and curb edges; side paths reach existing doors.
  box(root, 63, .18, 6.3, '#e6d9bd', 0, .015, 0);
  box(root, 6.3, .18, 55, '#e6d9bd', 0, .018, -1);
  box(root, 63, .07, 4.1, roadMat, 0, .105, 0, .015);
  box(root, 4.1, .075, 55, roadMat, 0, .11, -1, .015);
  for (let i = -29; i < 30; i += 2.4) if (Math.abs(i) > 3) {
    box(root, .9, .014, .065, '#fff0b3', i, .157, 0, .005);
    if (i > -26 && i < 25) box(root, .065, .014, .9, '#fff0b3', 0, .162, i, .005);
  }
  for (let i = 0; i < 6; i++) {
    box(root, .35, .015, 3.5, '#f6f3dc', -1.65 + i * .65, .168, 3.9, .005);
    box(root, 3.5, .015, .35, '#f6f3dc', -3.9, .168, -1.65 + i * .65, .005);
  }
  for (let x = -28; x <= 28; x += 1.5) if (Math.abs(x) > 3.3) {
    box(root, .015, .012, .92, '#c7b99e', x, .114, 2.62, .003);
    box(root, .015, .012, .92, '#c7b99e', x, .114, -2.62, .003);
  }
  function textTexture(text, background = '#fff9e9', color = '#214851') {
    const c = makeCanvas(); c.width = 512; c.height = 128; const ctx = c.getContext('2d');
    ctx.fillStyle = background; ctx.fillRect(0, 0, 512, 128); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(9, 9, 494, 110);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 40px sans-serif'; ctx.fillText(text, 256, 65, 455);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; textures.add(tex); return tex;
  }
  function sign(parent, text, x, y, z, w = 4) {
    box(parent, w + .16, 1.15, .2, '#f6ebd3', x, y, z, .09);
    const mat = new T.MeshBasicMaterial({ map: textTexture(text) }); materials.set(`sign-${text}`, mat);
    const plane = mesh(parent, new T.PlaneGeometry(w, 1), mat, x, y, z + .112); plane.castShadow = false;
    geometries.set(`sign-${text}`, plane.geometry);
  }
  function roof(parent, w, depth, height, color, y) {
    const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(0, height); s.lineTo(w / 2, 0); s.closePath();
    const geo = new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSegments: 2, bevelSize: .035, bevelThickness: .035 }); geo.translate(0, 0, -depth / 2);
    geometries.set(`roof-${w}-${depth}-${height}`, geo); return mesh(parent, geo, color, 0, y, 0);
  }
  function windowPane(parent, x, y, z, color = '#b3dbe5') {
    box(parent, 1.24, 1.35, .18, '#fff7de', x, y, z, .065);
    box(parent, 1.01, 1.13, .10, color, x, y, z + .105, .07);
    box(parent, .065, 1.14, .07, '#fff7de', x, y, z + .17, .012);
    box(parent, 1.03, .065, .07, '#fff7de', x, y, z + .17, .012);
    box(parent, 1.43, .12, .32, '#f6ebcf', x, y - .69, z + .04, .03);
  }
  function flower(parent, x, z, color, scale = 1) {
    cylinder(parent, .025 * scale, .36 * scale, '#46763f', x, .26 * scale, z);
    for (let p = 0; p < 5; p++) sphere(parent, .105 * scale, .075 * scale, .095 * scale, color, x + Math.cos(p * 1.256) * .11 * scale, .47 * scale, z + Math.sin(p * 1.256) * .11 * scale);
    sphere(parent, .064 * scale, .055 * scale, .064 * scale, '#ffc853', x, .51 * scale, z);
  }
  function fence(parent, x, z, length, axis = 'x', color = '#fff4d7', gap = 0) {
    const group = new T.Group(); group.position.set(x, 0, z); if (axis === 'z') group.rotation.y = Math.PI / 2; parent.add(group);
    for (let p = -length / 2; p <= length / 2; p += .55) if (Math.abs(p) > gap) {
      box(group, .22, 1.1, .13, color, p, .58, 0, .04);
      sphere(group, .115, .10, .08, color, p, 1.12, 0);
    }
    if (!gap) for (const y of [.33, .84]) box(group, length, .12, .11, color, 0, y, -.045, .03);
    else for (const y of [.33, .84]) for (const side of [-1, 1]) box(group, length / 2 - gap, .12, .11, color, side * (length / 4 + gap / 2), y, -.045, .03);
  }
  function tree(x, z, size = 1, shade = '#4f984e') {
    const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(size); root.add(g);
    cylinder(g, .25, 2.8, '#9c7450', 0, 1.4, 0, .15);
    const limb = cylinder(g, .13, 1.5, '#9c7450', -.33, 2.25, 0, .065); limb.rotation.z = -.6;
    const limb2 = cylinder(g, .12, 1.25, '#9c7450', .35, 2.4, .12, .065); limb2.rotation.z = .6;
    for (let i = 0; i < 7; i++) {
      const angle = i * 2.4;
      sphere(g, .95, 1.03, .86, i % 3 === 0 ? '#75b754' : shade, Math.sin(angle) * .88, 3.1 + (i % 3) * .4, Math.cos(angle) * .65);
    }
    greenery.push(g); return g;
  }
  function lamp(x, z) {
    cylinder(root, .07, 2.8, '#396771', x, 1.4, z);
    cylinder(root, .21, .12, '#396771', x, .12, z);
    box(root, .38, .56, .38, '#fff4cb', x, 2.84, z, .08);
    box(root, .53, .12, .53, '#396771', x, 3.16, z, .04);
  }
  for (const l of LOCATIONS) {
    const g = new T.Group(); g.name = `destination:${l.id}`;
    g.position.set(l.x * WORLD_SCALE, 0, (l.y - 35) * WORLD_SCALE); root.add(g);
    const pathZ = (l.y + 32) * WORLD_SCALE, length = Math.abs(l.x * WORLD_SCALE) - 3;
    box(root, length, .10, 1.18, '#e6d3af', Math.sign(l.x) * (3 + length / 2), .055, pathZ, .035);
    box(g, 1.65, .12, 2.5, '#e6d3af', 0, .07, 3.1, .035);
    if (l.id === 'garden') {
      // Conservatory with a real roof, framing and garden beds, at the existing interaction bounds.
      box(g, 7.9, .32, 4.5, '#eadad7', 0, .16, 0, .14);
      box(g, 7.5, 2.35, 4.0, '#a7d7d1', 0, 1.48, 0, .16);
      roof(g, 8.1, 4.55, 1.6, '#9f79b8', 2.75);
      for (const x of [-3.5, -1.75, 0, 1.75, 3.5]) box(g, .14, 2.5, .18, '#fff8ea', x, 1.53, 2.1, .035);
      for (const y of [.43, 1.55, 2.67]) box(g, 7.2, .14, .18, '#fff8ea', 0, y, 2.1, .035);
      sign(g, 'Bubble Garden', 0, 3.28, 2.39, 4.2);
      for (const x of [-2.75, 2.75]) {
        box(g, 1.8, .45, 1.2, '#c98d72', x, .28, 3.0, .13);
        for (let j = 0; j < 4; j++) flower(g, x - .65 + j * .4, 3, j % 2 ? '#e997c4' : '#fff2b8', 1.2);
      }
      fence(g, 0, 4.6, 10, 'x', '#e9d5f1', 1.1);
    } else if (l.id === 'yard') {
      box(g, 5, 2.45, 3.0, '#83b7b1', 0, 1.27, .15, .10);
      roof(g, 5.5, 3.55, 1.5, '#46777f', 2.53);
      box(g, 1.6, 1.92, .2, '#f5d69a', -.6, 1.03, 1.74, .07);
      box(g, .07, 1.89, .05, '#ab8a62', -.6, 1.03, 1.87, .01);
      windowPane(g, 1.3, 1.6, 1.70);
      sign(g, "Jace's Backyard", 0, 3.08, 1.96, 4.5);
    } else {
      const home = l.id === 'home';
      box(g, 7.8, .34, 4.45, '#ddd4be', 0, .17, 0, .15);
      box(g, 7.5, 2.95, 4.1, home ? '#f3d8ae' : '#83bcd6', 0, 1.82, 0, .13);
      for (let y = .65; y < 3.2; y += .32) box(g, 7.45, .028, .06, home ? '#dfbf91' : '#649dbd', 0, y, 2.086, .006);
      roof(g, 8.5, 4.85, 2.05, home ? '#5c7079' : '#476a9f', 3.32);
      if(home){
        // Porch, columns and roof courses echo the approved family-home exterior.
        box(g,7.6,.26,2.2,'#ead9b7',0,.25,3.1,.06);
        for(const x of[-3.35,-1.7,1.7,3.35])box(g,.16,2.65,.16,'#fff2d8',x,1.65,3.9,.03);
        roof(g,8.2,2.5,.85,'#647782',3.01).position.z=3.05;
        for(let n=0;n<7;n++) for(const side of[-1,1]){
          const seam=box(g,.035,.045,4.84,'#8b9a9c',side*(.25+n*.56),5.35-(.25+n*.56)*2.05/4.25,0,.007);
        }
      }
      for (const x of [-3.65, 3.65]) box(g, .18, 2.98, .18, '#fff6db', x, 1.85, 2.1, .035);
      box(g, 1.28, 2.15, .2, home ? '#619faa' : '#edb851', 0, 1.39, 2.2, .11);
      sphere(g, .065, .065, .07, '#d8a948', .39, 1.29, 2.32);
      box(g, 2.2, .2, 1.4, '#efdbb8', 0, .2, 2.7, .075);
      box(g, 2.5, .15, 1.6, '#ddc69d', 0, .1, 2.9, .075);
      windowPane(g, -2.15, 1.95, 2.13); windowPane(g, 2.15, 1.95, 2.13);
      cylinder(g, .39, .13, '#fff4dc', 0, 4.12, 2.49).rotation.x = Math.PI / 2;
      cylinder(g, .27, .15, '#8bc4d4', 0, 4.12, 2.51).rotation.x = Math.PI / 2;
      sign(g, home ? 'Our Family Home' : 'Game House', 0, 2.99, 2.43, home ? 3.5 : 3.1);
      if (home) box(g, .75, 1.55, .65, '#edc598', -2.25, 4.22, -.8, .07);
      for (const x of [-2.7, 2.7]) {
        box(g, 1.4, .36, .65, home ? '#c88b6b' : '#f2cc73', x, .48, 2.65, .09);
        for (let j = 0; j < 3; j++) flower(g, x - .4 + j * .4, 2.65, home ? '#ea8f9c' : '#f6df6f', .9);
      }
    }
    // Paths, destination names and the door all use the same logical coordinates.
    lamp(l.x * WORLD_SCALE - 1.5, (l.y + 45) * WORLD_SCALE);
  }
  // Grass is a single instanced draw call; each cell corresponds to the authoritative cut set.
  const cols = Math.ceil(LAWN.w / LAWN.cell), rows = Math.ceil(LAWN.h / LAWN.cell), perCell = 10;
  const blade = new T.ConeGeometry(.045, .34, 3); blade.translate(0, .17, 0); geometries.set('grassBlade', blade);
  const grass = new T.InstancedMesh(blade, material('#4f902f'), cols * rows * perCell); grass.castShadow = false; grass.receiveShadow = true;
  grass.instanceMatrix.setUsage(T.DynamicDrawUsage); root.add(grass);
  const dummy = new T.Object3D();
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const cell = { key: `${x},${y}`, indices: [], transforms: [] };
    for (let n = 0; n < perCell; n++) {
      const index = (y * cols + x) * perCell + n;
      const xx = (LAWN.x + x * LAWN.cell + (n * 7.31 % 13)) * WORLD_SCALE;
      const zz = (LAWN.y + y * LAWN.cell + (n * 5.87 % 13)) * WORLD_SCALE;
      dummy.position.set(xx, .035, zz); dummy.rotation.set(.14, n * 2.4, .12); dummy.scale.setScalar(.85 + ((x + y + n) % 4) * .17); dummy.updateMatrix();
      grass.setMatrixAt(index, dummy.matrix); cell.indices.push(index); cell.transforms.push(dummy.matrix.clone());
    }
    grassCells.push(cell);
  }
  grass.computeBoundingSphere();
  fence(root, -22.5, 10.5, 13, 'z', '#f5e8c9'); fence(root, -14.7, 18.0, 15.6, 'x', '#f5e8c9');
  for (const [x, z, s] of [[-25,-14,1.4],[-23,-4,.9],[-7,-16,1.15],[7,-19,1.4],[24,-15,1.2],[25,-3,1],[-27,15,1.2],[23,19,1.1],[7,20,1.0],[-6,16,.8],[-25,-22,1.4],[22,-23,1.5],[30,13,1.5],[-32,5,1.4]]) tree(x,z,s);
  for (const x of [-2.7, 2.7]) for (const z of [-16,-6,9,19]) lamp(x,z);
  // Flower borders, sculpted background hills and clouds give depth without a backdrop image.
  for (let i = 0; i < 14; i++) flower(root, 9 + i * .55, -4.1, i % 2 ? '#f1a5c6' : '#f6e090');
  for (let i = 0; i < 13; i++) {
    const a = i * Math.PI * 2 / 13;
    sphere(root, 12, 3.5 + i % 4, 10, i % 2 ? '#83b876' : '#94c382', Math.sin(a) * 60, -1.0, Math.cos(a) * 58);
  }
  const clouds = new T.Group(); root.add(clouds);
  for (const [x,y,z] of [[-25,18,-38],[20,20,-45],[40,17,20],[-40,21,15]]) {
    sphere(clouds, 4, 1, 1.6, '#fff8e9', x,y,z); sphere(clouds, 2.5,1.7,1.7,'#fffdf3',x+1,y+.8,z);
  }
  const town=addTownLandmarks(T,{root,box,sphere,cylinder,mesh,material,geometries,materials,textures,makeCanvas,roof,windowPane,sign,tree,flower,lamp,fence});
  // Batch static scenery by material. Hundreds of detailed pieces become a few dozen draws.
  root.updateMatrixWorld(true);
  const batches = new Map();
  root.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh) return;
    let g = object.geometry.clone().applyMatrix4(object.matrixWorld);
    if (g.index) { const indexed = g; g = indexed.toNonIndexed(); indexed.dispose(); }
    if (!batches.has(object.material)) batches.set(object.material, []);
    batches.get(object.material).push(g);
  });
  for (const child of [...root.children]) if (child !== grass) root.remove(child);
  for (const [mat, parts] of batches) {
    const merged = new T.BufferGeometry();
    for (const attribute of ['position', 'normal', 'uv']) {
      const size = attribute === 'uv' ? 2 : 3;
      const count = parts.reduce((sum, part) => sum + part.getAttribute('position').count, 0);
      const values = new Float32Array(count * size); let offset = 0;
      for (const part of parts) { const data = part.getAttribute(attribute)?.array; if (data) values.set(data, offset); offset += part.getAttribute('position').count * size; }
      merged.setAttribute(attribute, new T.BufferAttribute(values, size));
    }
    merged.computeBoundingSphere(); geometries.set(`batch-${batches.size}-${mat.uuid}`, merged);
    const batch = new T.Mesh(merged, mat); batch.castShadow = mat !== groundMat && mat !== roadMat; batch.receiveShadow = true; root.add(batch);
    for (const part of parts) part.dispose();
  }
  root.add(town.dynamic);
  let previousCut = '';
  function updateGrass(cut) {
    const signature = cut.join('|'); if (signature === previousCut) return; previousCut = signature;
    const set = new Set(cut); const hidden = new T.Matrix4().makeScale(0, 0, 0);
    for (const cell of grassCells) cell.indices.forEach((i,n) => grass.setMatrixAt(i, set.has(cell.key) ? hidden : cell.transforms[n]));
    grass.instanceMatrix.needsUpdate = true;
  }
  function dispose() { for (const g of new Set(geometries.values())) g.dispose(); for (const m of new Set(materials.values())) m.dispose(); for (const t of textures) t.dispose(); }
  return { root, updateGrass, animate:town.animate, landmarks:town.landmarks, dispose, box, sphere, cylinder, material, textTexture, meshes: { grass }, grassCells, greenery, blossoms };
}
