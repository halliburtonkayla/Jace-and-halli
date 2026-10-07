import {makeWorld,onRoad,FIELD,cellCenter} from './world.mjs?v=drive-1';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TOTAL=FIELD.cols*FIELD.rows;
export class DriveGame {
 constructor(mode='town',saved={}) {
  this.mode=mode;this.world=makeWorld(mode);this.player={x:0,z:131,angle:0,v:0,steer:0,distance:0};
  if(mode==='farm')Object.assign(this.player,{x:-20,z:49});
  this.visited=new Set((Array.isArray(saved.visited)?saved.visited:[]).filter(id=>this.world.places.some(p=>p.id===id)));
  this.cells=Array(TOTAL).fill(0);this.phase=0;this.work=true;this.deliveries=clamp(Math.floor(Number(saved.deliveries)||0),0,9999);this.load=0;this.delivered=!!saved.delivered;this.hit=0;this.events=[];this.time=0;this.active=false;this.camera=mode==='farm'?'cab':'chase';
  if(mode==='farm'&&Array.isArray(saved.cells)&&saved.cells.length===TOTAL){this.cells=saved.cells.map(v=>clamp(Math.floor(Number(v)||0),0,3));this.phase=clamp(Math.floor(Number(saved.phase)||0),0,3);this.load=this.cells.filter(v=>v===3).length;}
 }
 get maxSpeed(){return this.mode==='farm'?11:30;}
 get progress(){return this.phase===3?TOTAL:this.cells.filter(v=>v>this.phase).length;}
 get total(){return TOTAL;}
 get target(){return this.world.places.find(p=>p.id===this.targetId);}
 get nearby(){const p=this.player;return this.world.places.find(d=>Math.hypot(p.x-d.stop[0],p.z-d.stop[1])<13);}
 get task(){return ['PLOW the field','PLANT the seeds','HARVEST the wheat','HAUL to the barn'][this.phase];}
 save(){return {visited:[...this.visited],cells:this.cells,phase:this.phase,deliveries:this.deliveries,delivered:this.delivered};}
 safeReset(){Object.assign(this.player,this.mode==='farm'?{x:-20,z:49,angle:0,v:0,steer:0}:{x:0,z:131,angle:0,v:0,steer:0});}
 newField(){this.delivered=false;this.cells.fill(0);this.phase=0;this.load=0;this.work=true;this.safeReset();}
 blocked(x,z){return Math.abs(x)>this.world.bounds||Math.abs(z)>this.world.bounds||this.world.obstacles.some(o=>Math.abs(x-o.x)<o.rx+1.6&&Math.abs(z-o.z)<o.rz+1.6);}
 tick(raw,dt){
  if(!this.active)return;dt=clamp(dt,0,.05);this.time+=dt;this.hit=Math.max(0,this.hit-dt);const p=this.player;
  const gas=clamp(Number(raw.gas)||0,0,1),brake=clamp(Number(raw.brake)||0,0,1),back=!!raw.back,steer=clamp(Number(raw.steer)||0,-1,1);
  p.steer+=(steer-p.steer)*Math.min(1,dt*9);
  const road=this.mode==='farm'||onRoad(p.x,p.z),limit=this.maxSpeed*(road?1:.55);
  if(brake)p.v*=Math.max(0,1-dt*8);else if(back)p.v=Math.max(-this.maxSpeed*.32,p.v-dt*9);else if(gas)p.v=Math.min(limit,p.v+dt*(this.mode==='farm'?4.5:10));else p.v*=Math.max(0,1-dt*.75);
  if(Math.abs(p.v)<.07&&!gas&&!back)p.v=0;
  // Bicycle-like turning: no rotating in place or lane snapping; reverse steering is physical.
  const turn=p.steer*p.v/(this.mode==='farm'?5.8:6.8)/(1+Math.abs(p.v)*.042);
  p.angle+=turn*dt;
  const dx=Math.sin(p.angle)*p.v*dt,dz=-Math.cos(p.angle)*p.v*dt;
  if(this.blocked(p.x+dx,p.z+dz)) {if(!this.hit)this.events.push('bump');this.hit=.55;p.v*=-.15;}
  else{p.x+=dx;p.z+=dz;p.distance+=Math.hypot(dx,dz);}
  if(this.mode==='town'){const dest=this.nearby;if(dest&&Math.abs(p.v)<7&&!this.visited.has(dest.id)){this.visited.add(dest.id);this.events.push('visit');}}
  else if(this.phase<3&&this.work&&Math.abs(p.v)>.4){
   // Work is tied to unique ground cells under the implement, never to a timer.
   const tx=p.x-Math.sin(p.angle)*3,tz=p.z+Math.cos(p.angle)*3;
   for(let i=0;i<TOTAL;i++){if(this.cells[i]!==this.phase)continue;const q=cellCenter(i),dx=q.x-tx,dz=q.z-tz;
    const lateral=dx*Math.cos(p.angle)+dz*Math.sin(p.angle),forward=dx*Math.sin(p.angle)-dz*Math.cos(p.angle);
    if(Math.abs(lateral)<4.9&&Math.abs(forward)<4.5){this.cells[i]++;if(this.phase===2)this.load++;this.events.push('crop');}
   }
   if(this.cells.every(v=>v>this.phase)){this.phase++;this.events.push('phase');if(this.phase===3)this.targetId='barn';}
  }else if(this.phase===3&&!this.delivered&&this.nearby?.id==='barn'&&Math.abs(p.v)<1.5){this.delivered=true;this.deliveries++;this.events.push('delivery');this.active=false;}
 }
}
