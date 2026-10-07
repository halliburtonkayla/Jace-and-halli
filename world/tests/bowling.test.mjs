import test from 'node:test';
import assert from 'node:assert/strict';
import {BowlingLane,rollStatus,scoreRolls} from '../client/bowling-physics.mjs';
import {FamilyGame} from '../client/family-game.mjs';
test('bowling scores open frames, strike/spare bonuses and all tenth-frame bonus cases',()=>{
 assert.equal(scoreRolls(Array(20).fill(0)).total,0);
 assert.equal(scoreRolls(Array(20).fill(4)).total,80);
 assert.equal(scoreRolls(Array(21).fill(5)).total,150);
 assert.equal(scoreRolls(Array(12).fill(10)).total,300);
 assert.equal(scoreRolls([10,3,4]).total,24);
 assert.equal(scoreRolls([6,4,3,4]).total,20);
 const nine=Array(18).fill(0);
 assert.deepEqual(rollStatus([...nine,10,7]),{frame:10,ball:3,rack:false,done:false});
 assert.equal(rollStatus([...nine,10,10]).rack,true);
 assert.equal(rollStatus([...nine,3,7]).rack,true);
 assert.equal(rollStatus([...nine,3,4]).done,true);
 assert.equal(rollStatus([...nine,10,7,3]).done,true);
 assert.equal(rollStatus(Array(12).fill(10)).done,true);
});
test('ball movement, collisions and aiming determine actual pinfall; no client pin count is accepted',()=>{
 const throwAt=aim=>{const lane=new BowlingLane();lane.join({id:'j',name:'Jace',mode:'preschool'});lane.throw('j',{aim,power:.7,start:0});assert.equal(lane.members[0].rolls.length,0);for(let i=0;i<73;i++)lane.tick(.05);return lane;};
 const middle=throwAt(0),gutter=throwAt(1.2);assert.ok(middle.members[0].rolls[0]>0);assert.equal(gutter.members[0].rolls[0],0);assert.ok(middle.pins.some(p=>p.fallen));assert.ok(middle.pins.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite)));
 assert.throws(()=>middle.throw('j',{aim:0,power:1,start:0}),/turn/);
});
test('shared bowling uses approved players and stable turns when another family member arrives or leaves',()=>{
 const game=new FamilyGame();game.select('j','jace');game.select('h','halli');game.request('j','action',{action:'visit',destination:'bowling'});
 assert.throws(()=>game.request('h','action',{action:'bowl',aim:0,power:1,start:0}),/available/);
 game.request('j','action',{action:'bowl',aim:.1,power:.7,start:0});game.request('h','action',{action:'visit',destination:'bowling'});assert.equal(game.bowling.current().id,'j');assert.equal(game.bowling.phase,'rolling');
 assert.throws(()=>game.request('h','action',{action:'bowl',aim:0,power:1,start:0}),/turn/);
 game.request('h','action',{action:'exit'});assert.equal(game.bowling.current().id,'j');assert.equal(game.bowling.phase,'rolling');
 for(let i=0;i<75;i++)game.tick(.05);assert.equal(game.snapshot().bowling.members[0].rolls.length,1);
 game.request('j','action',{action:'exit'});assert.equal(game.bowling.members.length,0);
});
