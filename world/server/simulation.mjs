import { LOCATIONS,LAWN } from '../client/locations.mjs';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function makePlayer(id,profile,data){return {id,profile:profile.id,name:profile.name,mode:profile.mode,x:0,y:0,angle:0,speed:0,vehicle:'walk',engine:false,scene:'world',input:{gas:0,brake:0,steer:0},lastSeen:Date.now(),data,bubbles:[],popIds:new Set()};}
export function step(p,dt){
 if(p.scene!=='world')return;
 const {gas,brake,steer}=p.input,max=p.vehicle==='walk'?85:p.vehicle==='mower'?90:p.mode==='toddler'?105:160;
 p.speed=clamp(p.speed+(gas*105-brake*330-(!gas?80:0))*dt,0,max);
 if(!p.engine&&p.vehicle!=='walk')p.speed=0;
 p.angle+=steer*2.3*dt*(p.vehicle==='walk'?1:.35+p.speed/max);
 if(p.mode==='toddler'&&p.vehicle==='car'&&Math.abs(steer)<.08&&Math.abs(p.x)<85){const target=p.angle>Math.PI/2&&p.angle<Math.PI*1.5?Math.PI:0;p.angle+=(Math.atan2(Math.sin(target-p.angle),Math.cos(target-p.angle)))*dt;}
 const nx=clamp(p.x+Math.sin(p.angle)*p.speed*dt,-540,540),ny=clamp(p.y-Math.cos(p.angle)*p.speed*dt,-380,400);
 const collision=LOCATIONS.some(l=>Math.abs(nx-l.x)<85&&Math.abs(ny-(l.y-35))<48);
 if(!collision){p.x=nx;p.y=ny;}else p.speed=0;
 if(p.vehicle==='mower'){p.x=clamp(p.x,LAWN.x-10,LAWN.x+LAWN.w+10);p.y=clamp(p.y,LAWN.y-10,LAWN.y+LAWN.h+10);}
}
export function cutGrass(p,cut){if(p.vehicle!=='mower'||!p.engine||p.speed<3)return;for(let y=0;y<Math.ceil(LAWN.h/LAWN.cell);y++)for(let x=0;x<Math.ceil(LAWN.w/LAWN.cell);x++)if(Math.hypot(p.x-(LAWN.x+x*LAWN.cell),p.y-(LAWN.y+y*LAWN.cell))<28)cut.add(`${x},${y}`);}
export function nearby(p){return LOCATIONS.find(l=>Math.hypot(p.x-l.x,p.y-(l.y+45))<120);}
export function publicPlayer(p){return {id:p.id,profile:p.profile,name:p.name,mode:p.mode,x:p.x,y:p.y,angle:p.angle,speed:p.speed,vehicle:p.vehicle,engine:p.engine,scene:p.scene,destination:p.destination||null};}
