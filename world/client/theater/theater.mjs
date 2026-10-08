import {watchParty} from './party.mjs?v=family-2';
import {loadMovie} from './media.mjs?v=cinema-1';
const $=id=>document.getElementById(id),video=$('film'),manifestURL=new URL('./movies.json',import.meta.url),embedded=parent!==window;
let movies=[],selected=null,download=null,loaded=null,context=false,muted=false,loading=false;
function send(type,extra={}){if(embedded)parent.postMessage({channel:'jhw-theater',type,...extra},location.origin);}
const party=watchParty({video,choose,getMovies:()=>movies,getSelected:()=>selected,getLoaded:()=>loaded,send});
function mute(value){muted=value;video.muted=value;$('sound').textContent=value?'Sound off':'Sound on';$('sound').setAttribute('aria-pressed',String(value));}
function reset(){download?.abort();download=null;loading=false;video.pause();video.removeAttribute('src');video.load();loaded?.revoke();loaded=null;document.body.classList.remove('watching');$('rewind').disabled=$('fullscreen').disabled=true;}
function lobby(){reset();$('auditorium').hidden=true;$('lobby').hidden=false;selected=null;}
async function choose(movie){
 reset();selected=movie;$('lobby').hidden=true;$('auditorium').hidden=false;$('movie-title').textContent=movie.title;video.poster=new URL(movie.poster,manifestURL).href;video.setAttribute('aria-label',movie.title);$('loading').hidden=false;$('loading').value=0;$('status').textContent='Getting your movie ready…';$('play').disabled=true;$('play').textContent='Loading movie…';loading=true;
 const controller=download=new AbortController();
 try{const result=await loadMovie(movie.media,manifestURL,{signal:controller.signal,onProgress:n=>{if(download!==controller)return;$('loading').value=n;$('status').textContent='Loading your movie · '+n+'%';}});if(download!==controller){result.revoke();return;}loaded=result;video.src=result.url;video.load();$('play').disabled=false;$('play').textContent='PLAY MOVIE';$('status').textContent='Your movie is ready. Tap PLAY MOVIE.';$('loading').hidden=true;$('rewind').disabled=$('fullscreen').disabled=false;}
 catch(e){if(controller.signal.aborted)return;controller.abort();$('status').textContent=e.message;$('loading').hidden=true;$('play').disabled=false;$('play').textContent='TRY AGAIN';}
 finally{if(download===controller)loading=false;}
}
$('play').onclick=async()=>{if(!selected||loading)return;if(!loaded){choose(selected);return;}if(party.active){party.play();return;}if(!video.paused){video.pause();return;}try{if(video.ended)video.currentTime=0;await video.play();}catch{$('status').textContent='Tap the play triangle on the movie screen to begin.';}};
video.addEventListener('playing',()=>{document.body.classList.add('watching');$('play').textContent='PAUSE MOVIE';$('status').textContent='Enjoy the show!';});
video.addEventListener('pause',()=>{document.body.classList.remove('watching');if(loaded&&!video.ended)$('play').textContent='KEEP WATCHING';});
video.addEventListener('ended',()=>{document.body.classList.remove('watching');$('play').textContent='WATCH AGAIN';$('status').textContent='The end! Watch again or choose a movie.';});
video.addEventListener('error',()=>{if(!loaded)return;$('status').textContent='This browser could not play the movie. Try again or use Safari or Chrome.';$('play').textContent='TRY AGAIN';loaded.revoke();loaded=null;});
$('rewind').onclick=()=>{if(party.active){party.rewind();return;}video.currentTime=Math.max(0,video.currentTime-10);};
$('fullscreen').onclick=async()=>{try{if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();else if(video.requestFullscreen)await video.requestFullscreen();else $('status').textContent='Turn your device sideways for a bigger picture.';}catch{$('status').textContent='Turn your device sideways for a bigger picture.';}};
$('movie-list').onclick=()=>{if(party.active){$('auditorium').hidden=true;$('lobby').hidden=false;party.lobby();}else lobby();};$('sound').onclick=()=>{mute(!muted);send('sound',{enabled:!muted});};
$('exit').onclick=()=>{reset();if(context)send('exit');else location.assign(new URL('index.html',location.href));};
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});addEventListener('pagehide',reset);
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.channel!=='jhw-theater')return;if(e.data.type==='context'){context=true;mute(e.data.sound===false);party.start(e.data.state);}if(e.data.type==='movie-state')party.apply(e.data.state);if(e.data.type==='movie-error')$('status').textContent=e.data.error;if(e.data.type==='room-lost')party.lost();});send('context');
try{const r=await fetch(manifestURL);if(!r.ok)throw Error();const data=await r.json();movies=data.movies||[];for(const movie of movies){const button=document.createElement('button'),poster=document.createElement('img'),title=document.createElement('strong'),desc=document.createElement('span');button.className='movie-ticket';button.setAttribute('aria-label','Watch '+movie.title);poster.src=new URL(movie.poster,manifestURL);poster.alt='';title.textContent=movie.title;desc.textContent='WATCH MOVIE · '+Math.round(movie.duration/60)+' minutes';button.append(poster,title,desc);button.onclick=()=>{if(party.active){$('lobby').hidden=true;$('auditorium').hidden=false;party.choose(movie);}else choose(movie);};$('movies').append(button);}$('library-status').textContent=movies.length?'Pick your movie and take a seat.':'More family movies are coming.';}catch{$('library-status').textContent='The movie library could not open. Please reload and try again.';}

party.refresh();
