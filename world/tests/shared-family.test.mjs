import test from 'node:test';
import assert from 'node:assert/strict';
import {FamilyRoom} from '../client/room.mjs';
import {MovieSession} from '../client/theater/session.mjs';
import {TogetherSession} from '../client/together-session.mjs';
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

test('Mommy joins a child-hosted room; movie state reaches a late-arriving Unique',async()=>{
 const host=new FamilyRoom({PeerClass:FakePeer,storage:memory()}),mommy=new FamilyRoom({PeerClass:FakePeer,storage:memory()}),unique=new FamilyRoom({PeerClass:FakePeer,storage:memory()});
 try{await host.create();clearInterval(host.timer);await host.request('select',{profile:'jace'});host.game.cinema.configure([{id:'movie',duration:180}]);await mommy.join(host.code,'mommy');await mommy.request('select',{profile:'mommy'});await mommy.request('cinema',{op:'join'});await mommy.request('cinema',{op:'choose',movie:'movie'});await mommy.request('cinema',{op:'seek',movie:'movie',position:90});await mommy.request('cinema',{op:'play',movie:'movie'});
 await unique.join(host.code,'unique');await unique.request('select',{profile:'unique'});const joined=await unique.request('cinema',{op:'join'});assert.equal(joined.movie,'movie');assert.ok(joined.position>=90&&joined.position<92);assert.equal(joined.playing,true);assert.deepEqual(joined.members.map(m=>m.name),['Mommy','Unique']);await unique.request('cinema',{op:'pause',movie:'movie'});const next=once(mommy,'snapshot');host.broadcast();assert.equal((await next).cinema.playing,false);await assert.rejects(unique.request('select',{profile:'mommy'}),/profile/);
 }finally{unique.close();mommy.close();host.close();}
});
test('movie timeline advances on host clock, bounds seeks, preserves late-join position and pauses empty rooms',()=>{
 const s=new MovieSession();s.configure([{id:'a',duration:200},{id:'b',duration:100}]);const a={id:'a',name:'Mommy'},b={id:'b',name:'Unique'};s.request(a,{op:'join'},0);s.request(a,{op:'choose',movie:'a'},0);s.request(a,{op:'play',movie:'a'},1000);assert.equal(s.request(b,{op:'join'},91000).position,90);s.request(b,{op:'pause',movie:'a'},91000);assert.equal(s.snapshot(100000).position,90);s.request(b,{op:'seek',movie:'a',position:70},100000);s.request(a,{op:'play',movie:'a'},100000);s.leave(a.id,110000);assert.equal(s.snapshot(120000).position,90);s.leave(b.id,120000);assert.equal(s.snapshot(150000).position,90);assert.equal(s.snapshot().playing,false);assert.throws(()=>s.request({id:'x'},{op:'play',movie:'a'}),/Enter/);s.request(a,{op:'join'},150000);assert.throws(()=>s.request(a,{op:'choose',movie:'unknown'}),/library/);s.request(a,{op:'choose',movie:'b'},150000);assert.throws(()=>s.request(a,{op:'seek',movie:'a',position:50}),/changed/);assert.throws(()=>s.request(a,{op:'seek',movie:'b',position:NaN}),/valid/);
});
test('shared board enforces turns and late join receives exact board and drawing',async()=>{
 const host=new FamilyRoom({PeerClass:FakePeer,storage:memory()}),child=new FamilyRoom({PeerClass:FakePeer,storage:memory()});try{await host.create();clearInterval(host.timer);await host.request('select',{profile:'mommy'});await host.request('together',{op:'join'});await host.request('together',{op:'four',column:2});await child.join(host.code,'halli');await child.request('select',{profile:'halli'});const s=await child.request('together',{op:'join'});assert.equal(s.four.cells[37],'r');await assert.rejects(host.request('together',{op:'four',column:3}),/turn/);await child.request('together',{op:'four',column:3});await host.request('together',{op:'stroke',stroke:{a:{x:2,y:3},b:{x:5,y:9},c:'#ff0000'}});const next=once(child,'snapshot');host.broadcast();const shared=(await next).together;assert.equal(shared.four.cells[38],'y');assert.equal(shared.strokes.length,1);}finally{child.close();host.close();}
});
test('matching mismatch closes on host clock and invalid stroke cannot change shared page',()=>{
 const s=new TogetherSession(),p={id:'a',name:'Jace'};s.request(p,{op:'join'},0);const other=s.match.cards.findIndex(c=>c!==s.match.cards[0]);s.request(p,{op:'match',index:0},0);s.request(p,{op:'match',index:other},0);assert.equal(s.snapshot(800).match.open.length,2);assert.equal(s.snapshot(1000).match.open.length,0);assert.throws(()=>s.request(p,{op:'stroke',stroke:{a:{x:Infinity,y:0},b:{x:0,y:0},c:'#fff000'}}),/Invalid/);assert.equal(s.strokes.length,0);
});
test('shared playpark sends viewer-specific hide-and-seek positions over serialized room transport',async()=>{
 const host=new FamilyRoom({PeerClass:FakePeer,storage:memory()}),guest=new FamilyRoom({PeerClass:FakePeer,storage:memory()});
 try{await host.create();clearInterval(host.timer);await host.request('select',{profile:'mommy'});await guest.join(host.code,'unique');await guest.request('select',{profile:'unique'});await host.request('playpark',{op:'join',game:'hide'});await guest.request('playpark',{op:'join',game:'hide'});await host.request('playpark',{op:'action',name:'start'});const next=once(guest,'snapshot');host.broadcast();const received=(await next).playpark;assert.equal(received.side,1);assert.ok(Number.isFinite(received.members[1].x));assert.equal(host.game.snapshot().playpark.members[1].x,undefined);await guest.request('playpark',{op:'input',x:1,z:0});host.game.tick(.1);const moved=once(guest,'snapshot');host.broadcast();assert.ok((await moved).playpark.members[1].x>received.members[1].x);await guest.request('playpark',{op:'join',game:'cook'});const cooking=once(guest,'snapshot');host.broadcast();assert.equal((await cooking).playpark.game,'cook');assert.equal(host.game.snapshot().playpark.game,'hide');}finally{guest.close();host.close();}
});
