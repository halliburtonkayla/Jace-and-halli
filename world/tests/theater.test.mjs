import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadMovie} from '../client/theater/media.mjs';
test('published movie parts reconstruct the exact complete playback file',()=>{
 const url=new URL('../client/theater/movies.json',import.meta.url),manifest=JSON.parse(readFileSync(url));
 for(const movie of manifest.movies){const m=movie.media;const bytes=Buffer.concat(m.parts.map(part=>Buffer.from(readFileSync(new URL(m.base+part,url),'utf8'),'base64')));assert.equal(bytes.length,m.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),m.sha256);assert.equal(bytes.toString('ascii',4,8),'ftyp');assert.ok(Number.isFinite(movie.duration)&&movie.duration>0);if(movie.id==='world-adventure')assert.ok(movie.duration>170);if(movie.id==='happy-halloween')assert.equal(movie.duration,60);}
});
test('movie loader rejects incomplete media instead of offering broken playback',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>({ok:true,text:async()=>Buffer.from('incomplete').toString('base64')});
 try{await assert.rejects(loadMovie({format:'base64-parts',base:'./',parts:['one'],bytes:99},'https://example.com/movie/'),/incomplete/);}finally{globalThis.fetch=old;}
});
