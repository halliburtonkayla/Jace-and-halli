import {CARS,TRACKS,LAPS,clamp,wrap,roadAt} from './config.mjs?v=race-1';
const PAINT=['#f063a2','#fdbe46','#906fe8','#55d99c','#f17450','#dbe6fa','#47bfd3'];
export class RaceEngine{
 constructor({car='comet',track='neon',name='Jace',assist=true,seed=341}={}){this.seed=seed;this.name=name;this.assist=assist;this.configure(car,track);}
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 configure(car,track){this.car=CARS.find(c=>c.id===car)||CARS[0];this.track=TRACKS.find(t=>t.id===track)||TRACKS[0];this.reset();}
 reset(){this.phase='grid';this.elapsed=0;this.countdown=3;this.events=[];this.finishOrder=[];this.collisions=0;this.racers=[];
  for(let i=0;i<8;i++){const player=i===7,car=player?this.car:CARS[i%CARS.length];this.racers.push({id:player?'player':'racer-'+(i+1),name:player?this.name:'Racer '+(i+1),player,car,color:player?car.color:PAINT[i],s:-4-Math.floor(i/2)*9,x:i%2?2.15:-2.15,v:0,heading:0,steer:0,lap:1,nextLap:1,lapStart:0,lapTimes:[],finishTime:null,hit:0,braking:false,pace:player?1:.83+i*.025,decision:0,targetX:(i%2?1:-1)*(1.1+i*.15),passed:false});}
  this.player=this.racers[7];this.rank=8;
 }
 start(){this.reset();this.phase='countdown';this.events.push({type:'count',value:3});}
 emit(type,values={}){this.events.push({type,...values});}
 consumeEvents(){const events=this.events;this.events=[];return events;}
 order(){return this.racers.slice().sort((a,b)=>a.finishTime!==null&&b.finishTime!==null?a.finishTime-b.finishTime:a.finishTime!==null?-1:b.finishTime!==null?1:b.s-a.s);}
 ai(r){
  const curve=roadAt(this.track,r.s+45).curvature;
  let desired=r.car.max*r.pace*(1-Math.min(.23,Math.abs(curve)*52));
  r.decision-=1/60;
  const ahead=this.racers.filter(o=>o!==r&&o.finishTime===null).map(o=>({r:o,d:wrap(o.s-r.s,this.track.length)})).filter(o=>o.d>0&&o.d<42).sort((a,b)=>a.d-b.d)[0];
  if(r.decision<=0){r.decision=.65+this.random()*.8;r.targetX=clamp(curve*700+(this.random()-.5)*1.3,-3.6,3.6);
   if(ahead&&Math.abs(ahead.r.x-r.x)<2.7){const left=clamp(ahead.r.x-2.8,-4.5,4.5),right=clamp(ahead.r.x+2.8,-4.5,4.5);const clearance=x=>Math.min(10,...this.racers.filter(o=>o!==r&&Math.abs(o.s-r.s)<30).map(o=>Math.abs(o.x-x)));r.targetX=clearance(left)>clearance(right)?left:right;}
  }
  if(ahead&&ahead.d<10&&Math.abs(ahead.r.x-r.x)<2)desired=Math.min(desired,ahead.r.v*.92);
  const gain=(.01+.038/(1+r.v/20))*r.car.handling;
  const targetHeading=Math.atan2(r.targetX-r.x,22);
  const yawRate=(targetHeading-r.heading)*2.8+roadAt(this.track,r.s).curvature*r.v*.2;
  return {gas:r.v<desired?1:.12,brake:r.v>desired+3?.42:0,steer:clamp(yawRate*2.8/Math.max(8,r.v)/gain,-1,1)};
 }
 tick(dt,input={gas:0,brake:0,steer:0}){
  dt=clamp(dt,0,1/30);if(this.phase==='grid'||this.phase==='complete')return;
  if(this.phase==='countdown'){const previous=Math.ceil(this.countdown);this.countdown-=dt;if(Math.ceil(this.countdown)!==previous&&this.countdown>0)this.emit('count',{value:Math.ceil(this.countdown)});if(this.countdown<=0){this.phase='racing';this.emit('go');}return;}
  const oldElapsed=this.elapsed;this.elapsed+=dt;
  for(const r of this.racers){
   const controls=r.player&&r.finishTime===null?input:this.ai(r);const gas=clamp(Number(controls.gas)||0,0,1),brake=clamp(Number(controls.brake)||0,0,1),steer=clamp(Number(controls.steer)||0,-1,1);
   r.hit=Math.max(0,r.hit-dt);r.braking=brake>.1;r.steer+=(steer-r.steer)*Math.min(1,dt*8);
   const road=roadAt(this.track,r.s),slope=(roadAt(this.track,r.s+3).elevation-road.elevation)/3;
   const offroad=Math.abs(r.x)>this.track.halfWidth-.3,drag=1.4+r.v*r.v*.00072+(offroad?9:0);
   r.v=clamp(r.v+(gas*r.car.accel*(1-.35*r.v/r.car.max)-brake*28-drag-slope*3.5)*dt,0,r.car.max);
   const gain=(.01+.038/(1+r.v/20))*r.car.handling,assistance=!r.player||this.assist;
   r.heading+=(r.v/2.8*Math.tan(r.steer*gain)-road.curvature*r.v*(assistance?.2:1))*dt;
   r.heading*=Math.exp(-dt*(assistance?1.8:.7)*(1-Math.abs(r.steer)*.45));r.heading=clamp(r.heading,-.6,.6);
   const oldS=r.s;r.x+=Math.sin(r.heading)*r.v*dt;r.s+=Math.max(0,Math.cos(r.heading))*r.v*dt;
   const edge=this.track.halfWidth+1.1-r.car.width*.5;
   if(Math.abs(r.x)>edge){r.x=Math.sign(r.x)*edge;r.heading=-Math.sign(r.x)*.045;if(!r.hit){r.v*=.69;r.hit=.65;this.collisions++;if(r.player)this.emit('crash',{strength:.5});}}
   if(r.finishTime===null&&r.s>=r.nextLap*this.track.length){const crossing=oldElapsed+dt*clamp((r.nextLap*this.track.length-oldS)/Math.max(.001,r.s-oldS),0,1);r.lapTimes.push(crossing-r.lapStart);r.lapStart=crossing;r.nextLap++;r.lap=Math.min(LAPS,r.nextLap);
    if(r.nextLap>LAPS){r.finishTime=crossing;this.finishOrder.push(r.id);if(r.player){this.phase='results';this.emit('finish',{position:this.finishOrder.length,time:crossing});}}
    else if(r.player)this.emit('lap',{lap:r.lap,time:r.lapTimes.at(-1)});
   }
  }
  this.contacts();const rank=this.order().findIndex(r=>r.player)+1;if(rank!==this.rank&&this.elapsed>3&&this.player.finishTime===null)this.emit('position',{rank,better:rank<this.rank});this.rank=rank;
  if(this.racers.every(r=>r.finishTime!==null))this.phase='complete';
 }
 contacts(){
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const a=this.racers[i],b=this.racers[j];if(a.finishTime!==null||b.finishTime!==null||a.hit||b.hit)continue;const ds=wrap(a.s-b.s+this.track.length/2,this.track.length)-this.track.length/2,dx=a.x-b.x,width=(a.car.width+b.car.width)*.47;
   if(Math.abs(ds)<4.5&&Math.abs(dx)<width){const behind=ds<0?a:b,front=ds<0?b:a;const closing=Math.max(0,behind.v-front.v);behind.v=Math.max(0,behind.v*(closing>5?.7:.89));front.v=Math.max(0,front.v*.96);const side=dx===0?1:Math.sign(dx);a.x+=side*.22;b.x-=side*.22;a.heading+=side*.045;b.heading-=side*.045;a.hit=b.hit=.65;this.collisions++;if(a.player||b.player)this.emit('crash',{strength:clamp(closing/40,.15,.65)});}
  }
 }
}
