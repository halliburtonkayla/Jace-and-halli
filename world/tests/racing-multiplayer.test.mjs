import test from 'node:test';
import assert from 'node:assert/strict';
import {FamilyGame} from '../client/family-game.mjs';
import {RaceReplica} from '../client/racing/network.mjs';
function room(){const game=new FamilyGame();game.select('a','jace');game.select('b','halli');const send=(id,body)=>game.request(id,'race',body);send('a',{op:'join',car:'comet'});send('b',{op:'join',car:'monster',assist:false});return {game,race:game.racing,send};}
function start(send){send('a',{op:'ready',ready:true});send('b',{op:'ready',ready:true});send('a',{op:'start'});}
test('approved profiles share one ready grid; only the leader selects track and starts',()=>{
 const {game,race,send}=room();assert.equal(race.members.size,2);assert.equal(race.members.get('b').assist,true);
 assert.throws(()=>send('stranger',{op:'join',car:'comet'}),/profile/);assert.throws(()=>send('b',{op:'track',track:'beach'}),/leader/);
 assert.throws(()=>send('a',{op:'start'}),/READY/);send('a',{op:'ready',ready:true});send('a',{op:'track',track:'beach'});assert.equal(race.members.get('a').ready,false);
 assert.throws(()=>game.request('a','action',{action:'race-result'}),/saved by the host/);start(send);assert.equal(race.engine.racers.filter(r=>r.human).length,2);assert.equal(race.engine.racers.filter(r=>!r.human).length,6);assert.equal(race.engine.track.id,'beach');assert.equal(race.engine.racers[1].car.id,'monster');
 game.select('c','unique');assert.throws(()=>send('c',{op:'join',car:'comet'}),/underway/);assert.throws(()=>send('a',{op:'car',car:'spark'}),/unlock/);
});
test('independent controls move only the assigned car; stale packets cannot teleport or finish',()=>{
 const {race,send}=room();start(send);for(let i=0;i<60;i++)race.tick(.05);
 const [a,b]=race.engine.racers;for(let i=0;i<40;i++){
 send('a',{op:'input',race:race.serial,seq:i,gas:1,steer:-.2,s:999999,lap:3,finishTime:1});send('b',{op:'input',race:race.serial,seq:i,brake:1});race.tick(.05);
 }
 assert.ok(a.v>15&&a.s>5);assert.equal(b.v,0);assert.ok(a.x< -2.15);assert.equal(a.lap,1);assert.equal(a.finishTime,null);
 send('a',{op:'input',race:race.serial,seq:1,brake:1});assert.equal(race.inputs.get('a').controls.gas,1);
 send('a',{op:'input',race:race.serial-1,seq:100,brake:1});assert.equal(race.inputs.get('a').seq,39);
 const speed=a.v;for(let i=0;i<6;i++)race.tick(.25);assert.ok(a.v<speed);
 for(let i=0;i<50;i++)race.tick(.05);assert.equal(a.autopilot,true);
});
test('human car collisions, three laps, shared finish times and profile records come from the host',()=>{
 let saves;const {game,race,send}=room();game.saveCallback=s=>saves=structuredClone(s);start(send);
 for(let i=0;i<60;i++)race.tick(.05);const [a,b]=race.engine.racers;a.s=100;b.s=103;a.x=b.x=0;a.v=60;b.v=20;race.engine.contacts();assert.ok(a.v<60);assert.ok(race.engine.collisions>0);
 // Fresh race, then drive both humans with real continuous inputs through all three laps.
 race.start();for(let i=0;i<5000&&race.phase!=='complete';i++){
 for(const r of race.engine.racers.filter(r=>r.human))send(r.id,{op:'input',race:race.serial,seq:i,...race.engine.ai(r)});
 race.tick(.05);
 }
 assert.equal(race.phase,'complete');const racers=race.snapshot().racers;assert.equal(racers.length,8);assert.ok(racers.every(r=>r.lapTimes.length===3&&r.finishTime>60));
 assert.equal(saves.progress.jace.racing.neon.races,1);assert.equal(saves.progress.halli.racing.neon.races,1);assert.notEqual(saves.progress.jace.racing.neon.bestRace,saves.progress.halli.racing.neon.bestRace);
 for(let i=0;i<30;i++)race.tick(.05);assert.equal(saves.progress.jace.racing.neon.races,1);
 assert.throws(()=>send('b',{op:'reset'}),/leader/);send('a',{op:'reset'});assert.equal(race.phase,'lobby');assert.equal(race.members.size,2);assert.ok([...race.members.values()].every(m=>!m.ready));
});
test('pit stop uses an explicit helper; departing racer yields leadership and never earns a false record',()=>{
 const {game,race,send}=room();start(send);send('a',{op:'input',race:race.serial,seq:1,paused:true});race.tick(.05);assert.equal(race.engine.racers[0].autopilot,true);
 game.leave('a');assert.equal(race.captain,'b');assert.equal(race.engine.racers[0].withdrawn,true);assert.equal(race.engine.racers[0].human,false);
 for(let i=0;i<5000&&race.phase!=='complete';i++)race.tick(.05);
 assert.equal(game.progress.jace.racing,undefined);assert.equal(game.players.get('b').data.racing.neon.races,1);
 game.leave('b');assert.equal(race.engine,null);assert.equal(race.members.size,0);
});
test('replicas interpolate approved host frames, reject reordered frames and keep each own chase camera',()=>{
 const {race,send}=room();start(send);const state=race.snapshot(),a=new RaceReplica(),b=new RaceReplica();
 a.receive(structuredClone(state),100);b.receive(structuredClone(state),100);race.engine.racers[0].s+=10;const next=race.snapshot();a.receive(next,200);b.receive(next,200);
 assert.equal(a.receive(state,210),false);assert.equal(a.sample('a',250).player.s,state.racers[0].s+5);
 assert.equal(a.sample('a',250).player.id,'a');assert.equal(b.sample('b',250).player.id,'b');assert.equal(a.sample('a',250).racers.filter(r=>r.player).length,1);
 assert.deepEqual(a.sample('a',250).order().map(r=>r.id),b.sample('b',250).order().map(r=>r.id));
 assert.equal(a.receive({...next,seq:999,track:'bogus'},220),false);
});
