import {test} from 'node:test';import assert from 'node:assert/strict';
import {makePlayer,step,cutGrass,nearby} from '../server/simulation.mjs';
const p=()=>makePlayer('test',{id:'jace',name:'Jace',mode:'preschool'},{pops:0});
test('car cannot move before start, responds to gas, brake and steering',()=>{const a=p();a.vehicle='car';a.input={gas:1,brake:0,steer:.7};step(a,.1);assert.equal(a.speed,0);a.engine=true;for(let i=0;i<20;i++)step(a,.05);assert.ok(a.speed>0);assert.notEqual(a.angle,0);assert.notEqual(a.x,0);const old=a.speed;a.input={gas:0,brake:1,steer:0};step(a,.1);assert.ok(a.speed<old);});
test('grass is awarded only for unique patches under a moving powered mower',()=>{const a=p(),cut=new Set();a.x=-300;a.y=290;a.vehicle='mower';a.speed=50;cutGrass(a,cut);assert.equal(cut.size,0);a.engine=true;cutGrass(a,cut);assert.ok(cut.size>0);const n=cut.size;cutGrass(a,cut);assert.equal(cut.size,n);a.x+=80;cutGrass(a,cut);assert.ok(cut.size>n);});
test('doorway requires physical proximity',()=>{const a=p();assert.equal(nearby(a),undefined);a.x=280;a.y=-125;assert.equal(nearby(a).id,'garden');});
