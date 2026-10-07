import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {LOCATIONS} from '../client/locations.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('normal and shared-room entry selects the new 3D town, not the rejected renderer',()=>{
 const source=read('../client/free-app.mjs');
 assert.match(source,/get\('view'\) !== 'legacy'/);
 assert.match(source,/render-3d\.mjs\?v=town-1/);
 const html=read('../../index.html');
 assert.doesNotMatch(html,/href="\?view=3d"/);
 assert.match(html,/approved-world-v1\.webp/);
 assert.match(html,/id="town-map"/);
 assert.ok(statSync(new URL('../assets/town/approved-world-v1.webp',import.meta.url)).size<600000);
});

test('new town landmarks do not change activity IDs, doors or saved coordinates',()=>{
 assert.deepEqual(LOCATIONS.map(p=>[p.id,p.x,p.y,p.action]),[
  ['home',-300,-180,'home'],['garden',280,-170,'bubbles'],['yard',-300,70,'mower'],['classic',270,240,'classic']
 ]);
 const source=read('../client/town-landmarks.mjs');
 for(const name of['welcome-arch','fountain-plaza','church','zoo','circus','station-train'])assert.ok(source.includes('town:'+name));
 assert.doesNotMatch(source,/localStorage|indexedDB|fetch\(|request\(/);
});

test('graphics failure is explicit and preserves access to real activities',()=>{
 const source=read('../client/render-3d.mjs');
 const message=source.slice(source.indexOf('message(text'),source.indexOf('get playable'));
 assert.match(message,/town-open-art/);assert.match(message,/town-open-classic/);
 assert.doesNotMatch(message,/useCompatibility/);
 assert.match(source,/not driving gameplay/);
 assert.match(read('../client/free-app.mjs'),/renderer.playable===false\?\{gas:0,brake:1,steer:0\}/);
});
