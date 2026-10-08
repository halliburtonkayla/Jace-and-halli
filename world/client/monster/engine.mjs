import {RaceEngine} from '../racing/engine.mjs?v=family-race-1';
import {TRACKS,wrap,clamp} from '../racing/config.mjs?v=race-1';
export const PAINTS=['#ef6340','#56baf2','#a8d95c','#e887bf','#a990ec','#ffd461'];
export const DESIGNS=['Lightning','Racing stripes','Stars'];
export const CIRCUITS=TRACKS.filter(t=>t.id!=='neon').map((t,i)=>({...t,id:t.id,name:['Dino Dirt Trail','Stadium Jump Jam','Seaside Speedway','Country Mud Run'][i],banner:'MONSTER TRUCK RALLY',length:[1600,1440,1680,1760][i],halfWidth:9,road:['#a7764f','#ad8057'],ramps:[{s:240,x:-3,width:5},{s:600,x:2.8,width:5},{s:1080,x:0,width:6}]}));
export function truck(color=PAINTS[0],design=0){return{id:'monster',name:'My Monster Truck',kind:'truck',color,design,accel:17,max:65,handling:1.12,width:2.65};}
export class MonsterRace extends RaceEngine{
 constructor({track='speedway',players=1,paints=[PAINTS[0],PAINTS[1]],designs=[0,1],assist=true,cruise=false}={}){
  super({car:'monster',track,assist});this.track=CIRCUITS.find(t=>t.id===track)||CIRCUITS[1];this.car=truck(paints[0],designs[0]);this.start();this.shared=true;this.cruise=cruise;
  this.racers.forEach((r,i)=>Object.assign(r,{id:'truck-'+i,name:i===0?'Jace':i===1&&players===2?'Halli':'Truck '+(i+1),human:i<players,player:false,car:truck(i<players?paints[i]:PAINTS[i%6],i<players?designs[i]:i%3),assist,color:i<players?paints[i]:PAINTS[i%6],jump:0,vy:0,jumps:0,autopilot:false,pace:.76+i*.022}));
  this.player=this.racers[0];this.players=players;if(cruise)for(const r of this.racers)r.nextLap=Infinity;
 }
 tick(dt,inputs){const before=this.racers.map(r=>r.s);super.tick(dt,inputs);if(this.phase==='countdown'||this.phase==='grid')return;
  for(let i=0;i<this.racers.length;i++){const r=this.racers[i];for(const ramp of this.track.ramps){const crossing=Math.floor((r.s-ramp.s)/this.track.length)>Math.floor((before[i]-ramp.s)/this.track.length);if(crossing&&Math.abs(r.x-ramp.x)<ramp.width/2&&r.v>12&&r.jump===0){r.vy=clamp(r.v*.13,3,8);r.jump=.01;r.jumps++;}}
   if(r.jump>0){r.vy-=13*dt;r.jump=Math.max(0,r.jump+r.vy*dt);if(r.jump===0){r.vy=0;if(r.human)this.emit('land');}}
   if(this.cruise&&r.finishTime!==null){r.finishTime=null;r.nextLap+=100000;r.lap=1;}
  }
  if(this.cruise&&this.phase==='complete')this.phase='racing';
 }
 view(i=0){const p=this.racers[i];return{...this,player:p,car:p.car,racers:this.racers.map(r=>({...r,player:r.id===p.id})),rank:this.order().findIndex(r=>r.id===p.id)+1,order:()=>this.order()};}
}
