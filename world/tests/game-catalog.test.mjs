import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {GAME_PAGES} from '../client/game-catalog.mjs';
const root=new URL('../../',import.meta.url);
test('every existing activity page has a game-menu link',()=>{
 const linked=new Set(GAME_PAGES.map(x=>x.file.split('#')[0]));
 for(const file of readdirSync(root).filter(x=>x.endsWith('.html')&&x!=='index.html'))assert.ok(linked.has(file),`Missing game link: ${file}`);
 assert.equal(new Set(GAME_PAGES.map(x=>x.file)).size,GAME_PAGES.length);
 for(const entry of GAME_PAGES){const [file,tab]=entry.file.split('#');assert.ok(existsSync(new URL(file,root)),entry.file);assert.ok(existsSync(new URL(`../assets/scenes/${entry.image}-v1.webp`,import.meta.url)),entry.image);if(tab){const html=readFileSync(new URL(file,root),'utf8');assert.ok(html.includes(`data-tab="${tab}"`),entry.file);assert.ok(html.includes('game-deeplink.js'),entry.file);}}
});

const {PLACE_LINKS,activitiesForPlace}=await import('../client/place-activities.mjs');
test('every place has valid activities or an explicit unfinished status',async()=>{
 const {PLACE_NOTES}=await import('../client/place-activities.mjs');
 for(const id of ['zoo','train','circus','candy','store','church','school','theater'])assert.ok(PLACE_LINKS.some(p=>p.id===id));
 for(const place of PLACE_LINKS){if(['classic','theater'].includes(place.id))continue;const items=activitiesForPlace(place.id);assert.ok(items.length||PLACE_NOTES[place.id],place.id);for(const item of items)assert.ok(item?.file,place.id);}
});
