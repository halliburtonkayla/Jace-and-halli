import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {LOCATIONS} from '../client/locations.mjs';
import {FamilyGame} from '../client/family-game.mjs';
import {TOWN_PLACES,SCENES} from '../client/town-destinations.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('normal entry uses the approved illustrated town; development renderers remain opt-in',()=>{
 const source=read('../client/free-app.mjs');
 assert.match(source,/illustrated = !\['3d','legacy'\].includes\(view\)/);
 assert.match(source,/illustrated \? '\.\/render-illustrated\.mjs/);
 const html=read('../../index.html');
 assert.doesNotMatch(html,/href="\?view=3d"/);
 assert.match(html,/approved-world-v1\.webp/);
 assert.match(html,/id="town-map"/);
 assert.ok(statSync(new URL('../assets/town/approved-world-v1.webp',import.meta.url)).size<600000);
});

test('illustrated destinations validate entry and preserve saved progress and activity return',()=>{
 let saved;const game=new FamilyGame({progress:{halli:{pops:23,grassCut:4,inventory:['truck'],preferences:{sound:false},characterAsset:null}}},state=>saved=structuredClone(state));
 game.select('h','halli');assert.throws(()=>game.request('h','action',{action:'visit',destination:'https://untrusted.example'}),/Choose a place/);
 for(const place of TOWN_PLACES){game.request('h','action',{action:'visit',destination:place.id,x:99999});const p=game.players.get('h');assert.equal(p.scene,place.scene);assert.equal(p.destination,place.id);assert.notEqual(p.x,99999);}
 game.request('h','action',{action:'visit',destination:'garden'});const bubble=game.players.get('h').bubbles[0];game.request('h','action',{action:'pop',id:bubble.id});game.request('h','action',{action:'creativity'});game.request('h','action',{action:'art-exit'});assert.equal(game.players.get('h').scene,'bubbles');game.request('h','action',{action:'exit'});assert.equal(game.players.get('h').destination,null);assert.equal(saved.progress.halli.pops,24);assert.deepEqual(saved.progress.halli.inventory,['truck']);assert.equal(saved.progress.halli.preferences.sound,false);
});

test('every room hotspot points to existing artwork, an existing activity, or an allowed town destination',()=>{
 for(const scene of Object.values(SCENES)){assert.ok(statSync(new URL('../assets/scenes/'+scene.image+'-v1.webp',import.meta.url)).size>1000);for(const spot of scene.spots){assert.ok(spot.x>0&&spot.x<100&&spot.y>0&&spot.y<100);if(spot.file)assert.ok(statSync(new URL('../../'+spot.file,import.meta.url)).size>0);if(spot.visit)assert.ok(spot.visit==='bowling'||TOWN_PLACES.some(p=>p.id===spot.visit));}}
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
