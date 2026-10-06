import test from 'node:test';
import assert from 'node:assert/strict';
import { position3D, heading3D, WORLD_SCALE } from '../client/neighborhood.mjs';
import { LOCATIONS } from '../client/locations.mjs';

test('3D presentation preserves doorway coordinates and all movement headings', () => {
  for (const location of LOCATIONS) {
    const point = position3D(location.x, location.y + 45);
    assert.equal(point.x / WORLD_SCALE, location.x);
    assert.equal(point.z / WORLD_SCALE, location.y + 45);
    assert.equal(point.y, 0);
  }
  for (const angle of [0, Math.PI / 2, Math.PI, -Math.PI / 2, 17]) {
    const rotation = heading3D(angle);
    // The model faces local -Z, rotated around Three's +Y.
    assert.ok(Math.abs(-Math.sin(rotation) - Math.sin(angle)) < 1e-10);
    assert.ok(Math.abs(-Math.cos(rotation) + Math.cos(angle)) < 1e-10);
  }
});
