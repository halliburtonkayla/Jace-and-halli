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
