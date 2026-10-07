import { test } from 'node:test';
import assert from 'node:assert/strict';
import {GalleryService,saveToRoom,readFromRoom} from '../client/creativity/gallery.mjs';
import {newDocument,validateDocument} from '../client/creativity/document.mjs';
import { FamilyGame } from '../client/family-game.mjs';
import { FamilyRoom, newCode, normalizeCode } from '../client/room.mjs';
class Events {
  constructor() { this.handlers = new Map(); }
  on(type, fn) { this.handlers.set(type, [...(this.handlers.get(type) || []), fn]); }
  emit(type, value) { for (const fn of this.handlers.get(type) || []) fn(value); }
}
class FakeConnection extends Events {
  constructor(peer) { super(); this.peer = peer; this.open = false; this.dataChannel = { bufferedAmount: 0 }; }
  send(message) { if (!this.open) throw Error('Closed channel'); const copy = JSON.parse(JSON.stringify(message)); queueMicrotask(() => this.other.emit('data', copy)); }
  close() { if (!this.open) return; this.open = false; this.other.open = false; this.emit('close'); this.other.emit('close'); }
}
class FakePeer extends Events {
  static registry = new Map();
  constructor(id) { super(); this.id = id || 'device-' + crypto.randomUUID(); this.connections = []; FakePeer.registry.set(this.id, this); queueMicrotask(() => this.emit('open', this.id)); }
  connect(id) { const host = FakePeer.registry.get(id); const mine = new FakeConnection(id), other = new FakeConnection(this.id); mine.other = other; other.other = mine; this.connections.push(mine); host.connections.push(other); queueMicrotask(() => { host.emit('connection', other); mine.open = other.open = true; other.emit('open'); mine.emit('open'); }); return mine; }
  destroy() { this.destroyed = true; FakePeer.registry.delete(this.id); for (const conn of this.connections) conn.close(); }
  reconnect() {}
}
const once = (target, type) => new Promise(resolve => target.addEventListener(type, e => resolve(e.detail), { once: true }));
const memory = () => { const values = new Map(); return { setItem: (k,v) => values.set(k,v), getItem: k => values.get(k) }; };
test('room codes are generated, not hardcoded access passwords', () => { const codes = new Set(Array.from({ length: 50 }, newCode)); assert.equal(codes.size, 50); assert.ok([...codes].every(code => /^[A-Z2-9]{10}$/.test(code))); assert.equal(normalizeCode('ab cd-234567'), 'ABCD234567'); });
test('bubble progression validates hits and keeps a fixed population, then persists', () => { let saved; const game = new FamilyGame({}, state => saved = structuredClone(state)); game.select('device','halli'); const p = game.players.get('device'); assert.throws(() => game.request('device','action',{ action: 'pop', id: 'fake' })); p.x = 280; p.y = -125; game.request('device','action',{ action: 'enter' }); assert.equal(p.bubbles.length,5); const id=p.bubbles[0].id; game.request('device','action',{ action:'pop',id }); assert.equal(p.bubbles.length,5); assert.equal(p.data.pops,1); assert.throws(()=>game.request('device','action',{ action:'pop',id })); game.leave('device'); const restored=new FamilyGame(saved); assert.equal(restored.select('next','halli').data.pops,1); });
test('host approves joining devices, locks profiles and broadcasts actual shared state', async () => {
 const storage=memory(),host=new FamilyRoom({PeerClass:FakePeer,storage}),child=new FamilyRoom({PeerClass:FakePeer,storage:memory()});
 try {
  await host.create(); await host.request('select',{profile:'mommy'}); const waiting=once(host,'requests'); const joining=child.join(host.code,'halli'); await waiting;
  assert.equal(child.connected,false); assert.equal(host.game.players.size,1); const pending=host.pendingList()[0]; assert.equal(pending.name,'Halli'); host.approve(pending.id); await joining;
  assert.equal(child.me().profiles[0].id,'halli'); assert.equal(child.me().profiles.length,1); await assert.rejects(child.request('select',{profile:'mommy'}),/approved/); const result=await child.request('select',{profile:'halli'}); assert.equal(result.player.mode,'toddler');
  await child.request('action',{action:'vehicle'}); await child.request('action',{action:'start'}); await child.request('input',{gas:1,steer:0,brake:0}); host.game.tick(.05); const received=once(child,'snapshot'); host.broadcast(); const state=await received; assert.equal(state.players.length,2); assert.ok(state.players.find(p=>p.profile==='halli').speed>0);
  const rejected=child.request('action',{action:'pop',id:'bogus'}); await assert.rejects(rejected,/available/);
  const lost=once(child,'lost'); host.deny(pending.id); await lost; assert.equal(host.game.players.size,1);
 } finally { child.close(); host.close(); }
 const loaded=new FamilyRoom({PeerClass:FakePeer,storage});try{await loaded.create();assert.equal(loaded.me().profiles.length,4);}finally{loaded.close();}
});
test('host clock stops controls after missed input instead of trusting remote positions',()=>{const game=new FamilyGame();game.select('device','jace');game.request('device','input',{gas:999,steer:999,x:500,y:500});const p=game.players.get('device');assert.equal(p.x,0);assert.equal(p.input.gas,1);assert.equal(p.input.steer,1);game.tick(.05,Date.now()+2000);assert.equal(p.speed,0);});

test('approved peer artwork round trip preserves profile isolation and shared world state',async()=>{
 const rows=new Map(),store={async list(profile){return [...rows.values()].filter(r=>r.profile===profile).map(({id,title})=>({id,title}));},async put(profile,row){rows.set(profile+'/'+row.id,{...row,profile,document:validateDocument(row.document)});return {id:row.id};},async get(profile,id){const row=rows.get(profile+'/'+id);if(!row)throw Error('Not in your gallery');return row;}};
 const host=new FamilyRoom({PeerClass:FakePeer,storage:memory(),galleryService:new GalleryService(store)}),child=new FamilyRoom({PeerClass:FakePeer,storage:memory()});
 try{await host.create();await host.request('select',{profile:'mommy'});const waiting=once(host,'requests'),joining=child.join(host.code,'halli');await waiting;host.approve(host.pendingList()[0].id);await joining;await child.request('select',{profile:'halli'});const doc=newDocument('coloring','bubbles');doc.ops.push({type:'fill',x:100,y:100,size:18,color:'#f476b8'});await saveToRoom(child,'halli-art','My bubbles',doc);assert.deepEqual((await readFromRoom(child,'halli-art')).document,doc);assert.equal((await child.request('art-list',{profile:'mommy'})).pictures.length,1);assert.equal((await host.request('art-list')).pictures.length,0);await assert.rejects(host.request('art-read',{id:'halli-art'}),/gallery/);assert.equal(host.game.snapshot().players.length,2);assert.equal(host.game.players.get('host').profile,'mommy');}finally{child.close();host.close();}
});
