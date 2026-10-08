// The hosting device owns the clock. Device wall clocks never set playback time.
export class MovieSession {
 constructor(){this.members=new Map();this.movie=null;this.duration=0;this.position=0;this.playing=false;this.at=Date.now();this.revision=0;this.catalog=new Map();}
 configure(movies){this.catalog=new Map(movies.filter(m=>typeof m.id==='string'&&Number.isFinite(m.duration)&&m.duration>0).map(m=>[m.id,m.duration]));}
 time(now=Date.now()){return Math.min(this.duration,Math.max(0,this.position+(this.playing?Math.max(0,now-this.at)/1000:0)));}
 leave(id,now=Date.now()){this.members.delete(id);if(!this.members.size){this.position=this.time(now);this.at=now;this.playing=false;this.revision++;}}
 request(p,b,now=Date.now()){
  if(b.op==='join'){this.members.set(p.id,{id:p.id,name:p.name,profile:p.profile});return this.snapshot(now);}
  if(b.op==='leave'){this.leave(p.id,now);return this.snapshot(now);}
  if(!this.members.has(p.id))throw Error('Enter the shared movie theater first.');
  if(b.op==='choose'){if(!this.catalog.has(b.movie))throw Error('Choose a movie from our library.');this.movie=b.movie;this.duration=this.catalog.get(b.movie);this.position=0;this.playing=false;}
  else if(['play','pause','seek'].includes(b.op)){if(!this.movie)throw Error('Choose a movie first.');if(b.movie!==this.movie)throw Error('The family changed movies. Please wait for your screen to catch up.');this.position=this.time(now);if(b.op==='seek'){if(!Number.isFinite(b.position))throw Error('Choose a valid movie position.');this.position=Math.max(0,Math.min(this.duration,b.position));}else this.playing=b.op==='play';if(b.op==='play'&&this.position>=this.duration)this.position=0;}
  else throw Error('Unknown movie control.');
  this.at=now;this.revision++;return this.snapshot(now);
 }
 snapshot(now=Date.now()){const position=this.time(now);return {movie:this.movie,duration:this.duration,position,playing:this.playing&&position<this.duration,revision:this.revision,members:[...this.members.values()]};}
}
