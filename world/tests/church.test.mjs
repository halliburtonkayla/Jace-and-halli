import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {LESSONS,SONGS,nextLesson,OPENING_PRAYER,CLOSING_PRAYER} from '../client/church/data.mjs';
const root=new URL('../../',import.meta.url);
test('five different lessons, complete questions and safe bounded video segments',()=>{
 assert.equal(LESSONS.length,5);assert.equal(new Set(LESSONS.map(l=>l.id)).size,5);
 for(const l of LESSONS){assert.match(l.video.id,/^[\w-]{11}$/);assert.ok(l.video.seconds>0&&l.video.seconds<300);assert.equal(l.video.end-l.video.start,l.video.seconds);assert.equal(l.quiz.length,3);assert.ok(l.story.length>=4);for(const q of l.quiz){assert.equal(q.choices.length,3);assert.ok(q.answer>=0&&q.answer<3);assert.match(q.reply,new RegExp(`^${'ABC'[q.answer]}`));}}
});
test('shuffle cycles never repeat a lesson until all five have been visited; no boundary repeat',()=>{
 let state={},last=null;for(let round=0;round<50;round++){const seen=new Set();for(let i=0;i<5;i++){const result=nextLesson(state);assert.notEqual(result.lesson.id,last);assert.ok(!seen.has(result.lesson.id));seen.add(result.lesson.id);last=result.lesson.id;state=result.state;}assert.equal(seen.size,5);}
});
test('invalid saved rotation is recovered without changing other family storage',()=>{const r=nextLesson({bag:['missing','missing'],last:'creation'},()=>0);assert.ok(LESSONS.includes(r.lesson));assert.notEqual(r.lesson.id,'creation');assert.equal(r.state.bag.length,4);});
test('same short prayers and only the requested song verses are configured',()=>{assert.ok(OPENING_PRAYER.split(/\s+/).length<=32);assert.ok(CLOSING_PRAYER.split(/\s+/).length<=32);assert.notEqual(OPENING_PRAYER,CLOSING_PRAYER);for(const s of Object.values(SONGS)){assert.ok(s.end-s.start<=40);assert.equal(s.lyrics.length,4);}});
test('church is connected to the existing town and approved scene, with same-room exit',()=>{
 const town=readFileSync(new URL('world/client/town-view.mjs',root),'utf8');assert.match(town,/if\(id==='church'\)\{this.classic\('church.html'\)/);
 const app=readFileSync(new URL('world/client/free-app.mjs',root),'utf8');assert.match(app,/e.source!==\$\('classic-frame'\).contentWindow/);assert.match(app,/jhw-church/);
 for(const path of ['church.html','world/assets/church/sanctuary.webp','world/assets/church/crowd-murmur.mp3'])assert.ok(existsSync(new URL(path,root)));
});
