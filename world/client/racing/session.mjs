// One host-owned race per approved FamilyRoom. Clients submit controls, never positions/results.
import {RaceEngine} from './engine.mjs?v=family-race-1';
import {CARS,TRACKS,clamp} from './config.mjs?v=race-1';
const idle=()=>({gas:0,brake:1,steer:0});
export class RaceSession {
 constructor(onFinish=()=>{}){this.onFinish=onFinish;this.members=new Map();this.track='neon';this.captain=null;this.engine=null;this.sequence=0;this.serial=0;this.time=0;this.inputs=new Map();this.saved=new Set();}
 get phase(){return this.engine?.phase||'lobby';}
 request(player,body){
  const id=player.id,op=body.op;
  if(op==='leave'){this.leave(id);return {ok:true};}
  if(op==='join'){
   if(this.members.has(id))return {ok:true};
   if(this.engine)throw Error('This race is underway. Join after the racers return to the lobby.');
   if(this.members.size>=8)throw Error('The eight-car starting grid is full.');
   if(!CARS.some(c=>c.id===body.car))throw Error('Choose a racing car.');
   this.members.set(id,{id,profile:player.profile,name:player.name,car:body.car,assist:player.mode==='toddler'||body.assist!==false,ready:false});
   this.captain ||= id;return {ok:true};
  }
  const member=this.members.get(id);if(!member)throw Error('Join the family starting grid first.');
  if(op==='input'){
   if(!this.engine||body.race!==this.serial)return {ok:false};
   const old=this.inputs.get(id);if(!Number.isSafeInteger(body.seq)||body.seq<0||(old&&body.seq<=old.seq))return {ok:false};
   this.inputs.set(id,{seq:body.seq,at:this.time,paused:body.paused===true,controls:{gas:clamp(Number(body.gas)||0,0,1),brake:clamp(Number(body.brake)||0,0,1),steer:clamp(Number(body.steer)||0,-1,1)}});return {ok:true};
  }
  if(op==='reset'){
   if(id!==this.captain)throw Error('The race leader opens the next starting grid.');
   if(this.engine&&this.phase!=='complete')throw Error('Wait for this race to finish first.');
   this.engine=null;for(const m of this.members.values())m.ready=false;return {ok:true};
  }
  if(this.engine)throw Error('Car and track choices unlock after the race.');
  if(op==='car'){
   if(!CARS.some(c=>c.id===body.car))throw Error('Choose a racing car.');
   member.car=body.car;member.assist=player.mode==='toddler'||body.assist!==false;member.ready=false;
  }else if(op==='track'){
   if(id!==this.captain)throw Error('The race leader chooses the shared track.');
   if(!TRACKS.some(t=>t.id===body.track))throw Error('Choose a track.');
   this.track=body.track;for(const m of this.members.values())m.ready=false;
  }else if(op==='ready')member.ready=body.ready===true;
  else if(op==='start'){
   if(id!==this.captain)throw Error('The race leader starts the countdown.');
   if(![...this.members.values()].every(m=>m.ready))throw Error('Wait for everyone to tap READY.');
   this.start();
  }else throw Error('Unknown race request.');
  return {ok:true};
 }
 start(){
  this.serial++;this.inputs.clear();this.saved.clear();
  const game=this.engine=new RaceEngine({track:this.track,seed:341+this.serial});game.start();game.shared=true;
  const members=[...this.members.values()];
  for(let i=0;i<8;i++){
   const r=game.racers[i],m=members[i];r.player=false;r.human=Boolean(m);r.autopilot=false;
   if(m){Object.assign(r,{id:m.id,name:m.name,profile:m.profile,car:CARS.find(c=>c.id===m.car),assist:m.assist,pace:1});r.color=r.car.color;}
   else {r.id='computer-'+i;r.name='Racer '+(i-members.length+1);}
  }
  game.player=game.racers[0];
 }
 leave(id){
  this.members.delete(id);this.inputs.delete(id);
  const racer=this.engine?.racers.find(r=>r.id===id);
  if(racer){racer.human=false;racer.withdrawn=true;racer.autopilot=true;}
  if(this.captain===id)this.captain=this.members.keys().next().value||null;
  if(!this.members.size)this.engine=null;
 }
 tick(dt){
  this.time+=dt;const game=this.engine;if(!game||game.phase==='complete')return;
  const inputs={};
  for(const r of game.racers){const input=this.inputs.get(r.id),age=this.time-(input?.at??this.time-20);
   r.autopilot=Boolean(r.withdrawn||input?.paused||age>3);inputs[r.id]=age<.8?input.controls:idle();
  }
  // World transport runs at 20 Hz; driving retains its original 60 Hz integration.
  let remaining=Math.min(.25,Math.max(0,dt));while(remaining>1e-7){const step=Math.min(1/60,remaining);game.tick(step,inputs);remaining-=step;}
  game.consumeEvents();
  for(const r of game.order())if(r.human&&r.finishTime!==null&&!this.saved.has(r.id)){this.saved.add(r.id);this.onFinish(r,game,this.serial);}
  // A stuck racer cannot hold the room indefinitely. No invented finish times.
  if(game.elapsed>=360){for(const r of game.racers)if(r.finishTime===null)r.dnf=true;game.phase='complete';}
 }
 snapshot(){
  const g=this.engine;
  return {version:1,seq:++this.sequence,race:this.serial,phase:this.phase,captain:this.captain,track:this.track,members:[...this.members.values()].map(m=>({...m})),elapsed:g?.elapsed||0,countdown:g?.countdown||0,collisions:g?.collisions||0,
   racers:g?g.racers.map(r=>({id:r.id,name:r.name,profile:r.profile,car:r.car.id,color:r.color,human:r.human,autopilot:r.autopilot,withdrawn:r.withdrawn||false,dnf:r.dnf||false,s:r.s,x:r.x,v:r.v,heading:r.heading,steer:r.steer,braking:r.braking,hit:r.hit,lap:r.lap,lapTimes:r.lapTimes.slice(),finishTime:r.finishTime})):[]};
 }
}
