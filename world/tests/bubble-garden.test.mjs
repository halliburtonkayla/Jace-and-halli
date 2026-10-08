import test from 'node:test';
import assert from 'node:assert/strict';
import {sweptHit,tossVelocity,stepFoam} from '../client/bubble-garden/physics.mjs';
test('a fast swipe pops bubbles anywhere along the path',()=>{assert.equal(sweptHit({x:0,y:50},{x:400,y:50},{x:200,y:50},30),true);assert.equal(sweptHit({x:0,y:50},{x:400,y:50},{x:200,y:100},30),false);assert.equal(sweptHit({x:0,y:0},{x:0,y:0},{x:5,y:0},10),true);});
test('toss follows the gesture and caps extreme event velocities',()=>{assert.deepEqual(tossVelocity({x:0,y:100},{x:40,y:60},.1),{vx:400,vy:-400});assert.deepEqual(tossVelocity({x:0,y:0},{x:500,y:-500},0),{vx:1200,vy:-1400});});
test('thrown foam bounces inside the play area and eventually settles',()=>{const b={x:98,y:195,r:10,vx:300,vy:200};stepFoam(b,.03,100,200);assert.equal(b.x,90);assert.equal(b.y,190);assert.ok(b.vx<0&&b.vy<0);for(let i=0;i<300;i++)stepFoam(b,.016,100,200);assert.ok(b.y<=190&&b.x>=10&&b.x<=90);assert.ok(Math.abs(b.vx)<1);});
