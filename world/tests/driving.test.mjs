import test from 'node:test';
import assert from 'node:assert/strict';
import {DriveGame} from '../client/driving/engine.mjs';
import {DrivingInput} from '../client/racing/controls.mjs';
import {FIELD,PLACES} from '../client/driving/world.mjs';
const advance=(g,input,n=120)=>{for(let i=0;i<n;i++)g.tick(input,1/60);};
test('town driving accelerates, turns freely in world space, brakes and reverses',()=>{
 const g=new DriveGame();g.active=true;advance(g,{gas:1},60);assert(g.player.z<127);assert(g.player.v>9);
 advance(g,{gas:1,steer:.6},90);assert(g.player.x>3);assert(g.player.angle>.4);
 advance(g,{brake:1},90);assert.equal(g.player.v,0);const at={...g.player};advance(g,{back:true},60);assert(g.player.v<0);assert(Math.hypot(g.player.x-at.x,g.player.z-at.z)>1);
 g.active=false;const before={...g.player};advance(g,{gas:1,steer:1});assert.deepEqual(g.player,before);
});
test('building collisions stop movement and recovery does not clear progress',()=>{
 const g=new DriveGame();g.active=true;const d=PLACES[0];Object.assign(g.player,{x:d.x,z:d.z+d.d/2+4,angle:0,v:30});advance(g,{gas:1},90);assert(g.player.z>=d.z+d.d/2+1.5);assert(g.events.includes('bump'));g.visited.add('home');g.safeReset();assert(g.visited.has('home'));assert.equal(g.player.v,0);
});
test('parking discovery is unique and driving elsewhere never awards visits',()=>{
 const g=new DriveGame();g.active=true;advance(g,{},600);assert.equal(g.visited.size,0);const p=PLACES[0];Object.assign(g.player,{x:p.stop[0],z:p.stop[1]});advance(g,{},600);assert.deepEqual([...g.visited],['home']);assert.equal(g.events.filter(e=>e==='visit').length,1);
});
test('gas and steering use separate fingers and cancellation releases only its control',()=>{
 const input=new DrivingInput();input.press(1,'gas');input.press(2,'right');assert.deepEqual(input.value(),{gas:1,brake:0,steer:1});input.release(2);assert.equal(input.value().gas,1);assert.equal(input.value().steer,0);input.clear();assert.equal(input.value().gas,0);
});
test('tractor jobs require moving over unique ground with the tool lowered',()=>{
 const g=new DriveGame('farm');assert.equal(g.camera,'cab');g.active=true;advance(g,{gas:1},300);assert(g.progress>0);assert(g.progress<g.total);const count=g.progress;g.player.v=0;advance(g,{},600);assert.equal(g.progress,count);g.work=false;advance(g,{gas:1},180);assert.equal(g.progress,count);
});
test('complete plow, plant, harvest and delivery survives reload without duplicate rewards',()=>{
 let g=new DriveGame('farm');g.active=true;
 for(let phase=0;phase<3;phase++){
  for(let col=0;col<FIELD.cols;col++){
   Object.assign(g.player,{x:FIELD.x+(col+.5)*FIELD.size,z:49,angle:0,v:0});advance(g,{gas:1},780);
  }
  assert.equal(g.phase,phase+1);const saved=JSON.parse(JSON.stringify(g.save()));g=new DriveGame('farm',saved);g.active=true;
 }
 assert.equal(g.load,g.total);Object.assign(g.player,{x:46,z:53,angle:0,v:0});advance(g,{},60);assert.equal(g.deliveries,1);assert.equal(g.active,false);
 const restored=new DriveGame('farm',g.save());restored.active=true;Object.assign(restored.player,{x:46,z:53,v:0});advance(restored,{},120);assert.equal(restored.deliveries,1);
 restored.newField();assert.equal(restored.phase,0);assert.equal(restored.progress,0);assert.equal(restored.load,0);assert.equal(restored.deliveries,1);
});
