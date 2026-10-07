import {CARS,TRACKS,lerp,clamp} from './config.mjs?v=race-1';
// Render 100 ms behind the host; never advance laps, finishes, or collisions locally.
export class RaceReplica {
 constructor(){this.frames=[];this.latest=null;}
 receive(state,now){
  if(!state||state.version!==1||!Array.isArray(state.racers)||state.racers.length>8||!TRACKS.some(t=>t.id===state.track))return false;
  if(this.latest&&state.seq<=this.latest.seq)return false;
  if(this.latest?.race!==state.race||state.phase==='lobby')this.frames=[];
  this.latest=state;this.receivedAt=now;this.frames.push({state,at:now});if(this.frames.length>12)this.frames.shift();return true;
 }
 sample(id,now){
  if(!this.latest?.racers.length)return null;
  const target=now-100,frames=this.frames;
  let a=frames[0],b=a;for(const f of frames){if(f.at<=target)a=f;if(f.at>=target){b=f;break;}b=f;}
  const blend=a===b?1:clamp((target-a.at)/Math.max(1,b.at-a.at),0,1),state=this.latest;
  const racers=state.racers.map(r=>{
   const from=a.state.racers.find(o=>o.id===r.id)||r,to=b.state.racers.find(o=>o.id===r.id)||r,result={...r,car:CARS.find(c=>c.id===r.car)||CARS[0],player:r.id===id};
   for(const key of ['s','x','v','heading','steer'])result[key]=lerp(from[key],to[key],blend);
   return result;
  });
  const player=racers.find(r=>r.id===id);if(!player)return null;
  const order=()=>racers.slice().sort((a,b)=>a.finishTime!==null&&b.finishTime!==null?a.finishTime-b.finishTime:a.finishTime!==null?-1:b.finishTime!==null?1:b.s-a.s);
  return {racers,player,track:TRACKS.find(t=>t.id===state.track),car:player.car,rank:order().findIndex(r=>r.id===id)+1,elapsed:state.elapsed,countdown:state.countdown,collisions:state.collisions,phase:player.finishTime!==null?'results':state.phase,order};
 }
}
