import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routeTo,updateRoute,guidedInput} from '../client/routes.mjs';
import {LOCATIONS} from '../client/locations.mjs';
import {makePlayer,step,nearby} from '../server/simulation.mjs';
import {CHARACTER_ART,viewFrame} from '../client/characters.mjs';
test('assisted travel reaches all four destinations by walking and driving without teleporting',()=>{
 for(const mode of ['toddler','preschool'])for(const vehicle of ['walk','car'])for(const location of LOCATIONS){
 const p=makePlayer('test',{id:'halli',name:'Halli',mode},{});p.vehicle=vehicle;p.engine=true;
 const route=routeTo(p,location.id);
 for(let i=0;i<2400&&!route.arrived;i++){updateRoute(p,route);p.input=guidedInput(p,{gas:1,brake:0,steer:0},route,true);const x=p.x,y=p.y;step(p,.05);assert.ok(Math.hypot(p.x-x,p.y-y)<=8.01);}
 assert.equal(route.arrived,true,`${mode} ${vehicle} ${location.id}`);assert.equal(nearby(p)?.id,location.id);
 }
});
test('route guidance requires held gas and respects manual steering and brake',()=>{
 const p=makePlayer('test',{id:'halli',mode:'toddler'},{}),r=routeTo(p,'garden');
 for(const input of [{gas:0,brake:0,steer:0},{gas:1,brake:1,steer:0},{gas:1,brake:0,steer:-1}])assert.deepEqual(guidedInput(p,input,r,true),input);
});
test('four distinct family atlases have bounded directional frames',()=>{
 assert.equal(new Set(Object.values(CHARACTER_ART).map(a=>a.file)).size,4);
 for(const a of Object.values(CHARACTER_ART))for(const [x,y,w,h]of a.frames){assert.ok(x>=0&&y>=0&&x+w<=a.width&&y+h<=a.height);}
 assert.equal(viewFrame(0,0),0);assert.equal(viewFrame(0,Math.PI),2);
});
