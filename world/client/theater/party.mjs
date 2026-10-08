export function watchParty({video,choose,getMovies,getSelected,getLoaded,send}){
 let active=false,state=null,received=0,blocked=false,applying=false;
 const line=document.createElement('p');line.id='watch-together-status';line.setAttribute('role','status');line.style.cssText='text-align:center;margin:0;padding:8px 12px;color:#ffe1a5;background:#21132b;font:13px/1.4 system-ui;';document.querySelector('header').after(line);
 const seek=document.createElement('input');seek.type='range';seek.min=0;seek.step=1;seek.value=0;seek.setAttribute('aria-label','Shared movie position');seek.hidden=true;seek.style.cssText='width:min(90%,600px);display:block;margin:8px auto;';document.querySelector('.movie-panel').append(seek);
 function command(op,extra={}){send('command',{body:{op,movie:state?.movie,...extra}});}
 function target(){return Math.min(state?.duration||0,(state?.position||0)+(state?.playing?(performance.now()-received)/1000:0));}
 async function sync(){if(!active||!state||!state.movie||!getLoaded()||getSelected()?.id!==state.movie||video.readyState<1||applying)return;applying=true;try{
  const time=target();seek.max=state.duration;seek.value=time;seek.hidden=false;
  if(Number.isFinite(time)&&Math.abs(video.currentTime-time)>1.2)video.currentTime=Math.min(time,Number.isFinite(video.duration)?video.duration:time);
  if(state.playing&&!document.hidden){if(video.paused&&!blocked){try{await video.play();}catch{blocked=true;document.getElementById('play').textContent='JOIN MOVIE';document.getElementById('status').textContent='Tap JOIN MOVIE to watch at the family’s current spot.';}}}else if(!video.paused)video.pause();
 }finally{applying=false;}}
 function apply(next){if(!active||!next)return;if(state&&next.revision<state.revision)return;state=next;received=performance.now();line.textContent='Watching together: '+(next.members.map(m=>m.name).join(', ')||'Take a seat')+'. Play, pause and rewind are shared.';if(next.movie&&getMovies().length&&getSelected()?.id!==next.movie){const m=getMovies().find(m=>m.id===next.movie);if(m){blocked=false;choose(m);}}sync();}
 video.addEventListener('loadedmetadata',()=>sync());video.addEventListener('canplay',()=>sync());document.addEventListener('visibilitychange',()=>{if(!document.hidden){blocked=false;sync();}});
 seek.onchange=()=>command('seek',{position:Number(seek.value)});
 return {get active(){return active;},start(next){active=true;video.controls=false;apply(next);},apply,sync,choose(movie){command('choose',{movie:movie.id});},play(){blocked=false;if(state?.playing){if(video.paused)sync();else command('pause');}else{video.play().catch(()=>{});command('play');}},rewind(){command('seek',{position:Math.max(0,target()-10)});},lobby(){line.textContent='The family movie continues. Pick a movie to change it for everyone.';},lost(){active=false;video.pause();line.textContent='The family room disconnected. Return to Our World to rejoin.';},refresh(){if(state)apply(state);}};
}
