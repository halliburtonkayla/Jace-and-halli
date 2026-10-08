import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync} from 'node:fs';
import {ANIMALS,SECTIONS,nextAnimal} from '../client/zoo/data.mjs';
test('six complete habitats provide thirty distinct animal stops with artwork and video options',()=>{
 assert.equal(ANIMALS.length,30);assert.equal(new Set(ANIMALS.map(a=>a.id)).size,30);assert.equal(SECTIONS.length,6);
 for(const s of SECTIONS){assert.equal(ANIMALS.filter(a=>a.section===s.id).length,5);assert.ok(statSync(new URL('../assets/zoo/'+s.id+'.webp',import.meta.url)).size>10000);}
 for(const a of ANIMALS){assert.ok(a.description.length>70);assert.ok(a.diet&&a.sound&&a.soundLabel);assert.equal(new URL(a.video.url).protocol,'https:');assert.ok(a.x>0&&a.x<100&&a.y>0&&a.y<100);if(a.video.id){assert.match(a.video.id,/^[\w-]{11}$/);assert.ok(a.video.end>a.video.start);}}
});
test('guided route visits every animal once, crosses habitat boundaries, and reverses correctly',()=>{
 let a=ANIMALS[0];const route=new Set();for(let n=0;n<30;n++){route.add(a.id);const next=nextAnimal(a.id);assert.equal(nextAnimal(next.id,-1),a);a=next;}assert.equal(route.size,30);assert.equal(a,ANIMALS[0]);assert.notEqual(ANIMALS[4].section,nextAnimal(ANIMALS[4].id).section);
});
