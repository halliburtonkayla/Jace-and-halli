import {CARS,TRACKS,ordinal,formatTime} from './config.mjs?v=race-1';
import {RaceEngine} from './engine.mjs?v=family-race-1';
import {RaceReplica} from './network.mjs?v=family-race-1';
import {RaceRenderer,drawCar} from './render.mjs?v=family-race-1';
import {RaceAudio} from './audio.mjs?v=race-1';
import {DrivingInput} from './controls.mjs?v=race-1';

const root=document.getElementById('moto'),$=id=>document.getElementById(id),embedded=parent!==window;
root.innerHTML=`
 <canvas id="race-view" aria-label="Chase camera showing your car, the moving race track, and seven computer racers"></canvas>
 <nav class="race-top" aria-label="Racing navigation"><div><button id="race-world">Back to Our World</button><button id="race-arcade">Arcade</button></div><span class="race-wordmark">NEON CITY<br>RACERS</span><div><button id="race-sound" aria-pressed="true">Sound on</button><button id="race-pause" hidden>Pause</button></div></nav>
 <div id="race-hud" class="race-hud" hidden><div class="race-place"><b id="race-position">8th</b><small>/ 8</small></div><div class="race-laps"><b id="race-lap">LAP 1 / 3</b><small id="race-track-label">NEON CITY</small></div><div class="race-speed"><b id="race-mph">0</b><small>MPH</small></div></div>
 <div id="race-timing" class="race-timing" hidden><div>TIME <span id="race-time">0:00.00</span></div><div>BEST <span id="race-best">—</span></div><div>LAST <span id="race-last">—</span></div></div>
 <div id="race-banner" aria-live="assertive"></div><div id="race-toast" role="status" hidden></div>
 <div id="race-controls" class="race-controls" hidden><div class="race-steering"><button class="race-control" data-drive="left" aria-label="Hold to steer left"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 16 22 3v9h7v8h-7v9z"/></svg>LEFT</button><button class="race-control" data-drive="right" aria-label="Hold to steer right"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m28 16-18-13v9H3v8h7v9z"/></svg>RIGHT</button></div><div class="race-pedals"><button class="race-control brake-pedal" data-drive="brake" aria-label="Hold brake"><span class="race-pedal-bars" aria-hidden="true"></span>BRAKE</button><button class="race-control gas-pedal" data-drive="gas" aria-label="Hold gas"><span class="race-pedal-bars" aria-hidden="true"></span>GAS</button></div></div>
 <div class="race-hold-hint" id="race-hint" hidden>HOLD GAS + an arrow to steer · Brake for turns</div>
 <section class="race-dialog" id="race-garage" aria-label="Choose your car and track">
  <div class="race-garage-heading"><div><div class="race-eyebrow">JACE & HALLI’S WORLD / ARCADE</div><h1>NEON CITY<br><span>RACERS</span></h1></div><div class="race-driver"><span id="race-driver-name">Jace</span><br>8 CARS · 3 LAPS</div></div>
  <div class="race-selection"><div><h2>01 / Choose your ride</h2><div class="race-car-hero"><canvas id="race-car-preview" width="600" height="260"></canvas></div><div id="race-car-name" class="race-car-name"></div><div id="race-car-options" class="race-car-options"></div><div id="race-stats" class="race-stats"></div></div><div><h2>02 / Pick a track</h2><div id="race-track-options" class="race-track-options"></div><p id="race-track-description"></p></div></div>
  <div class="race-garage-bottom"><label><input id="race-assist" type="checkbox" checked>Gentle steering help</label><button class="race-primary" id="race-start" disabled>Loading track…</button></div><p class="race-help">Hold the pedals and arrows. Keyboard: WASD or arrow keys.<br>Seven computer racers. Your own driving.</p>
 </section>
 <section id="race-pause-menu" class="race-dialog" aria-label="Race paused" hidden><h2>Taking a pit stop?</h2><p>Your race is paused.</p><button id="race-resume" class="race-primary">KEEP RACING</button><button id="race-garage-back">Change car or track</button></section>
 <section id="race-results" class="race-dialog" aria-label="Race results" hidden><div class="race-eyebrow">NEON CITY RACERS</div><h2 id="race-finish-title">Finish!</h2><div class="race-results-summary"><div>YOUR TIME<b id="race-finish-time"></b></div><div>BEST LAP<b id="race-finish-best"></b></div></div><ol id="race-result-list" class="race-result-list"></ol><p class="race-results-laps" id="race-results-laps"></p><p class="race-results-laps" id="race-save-status"></p><div class="race-result-actions"><button class="race-primary" id="race-again">RACE AGAIN</button><button id="race-change-car">CHANGE CAR</button><button id="race-change-track">CHANGE TRACK</button><button id="race-results-world">BACK TO OUR WORLD</button></div></section>`;

const soloGame=new RaceEngine(),renderer=new RaceRenderer($('race-view'),{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches}),audio=new RaceAudio(),driving=new DrivingInput();
let game=soloGame;
let active=false,paused=false,garage=true,last=0,accumulator=0,toastUntil=0,goUntil=0,uiAt=0,resultSent=false,contextReceived=false,profile='local',records={},frame=0,clock=null,paintLast=0,sessionId='';
const bridge=(type,body={})=>{if(embedded)parent.postMessage({channel:'jhw-racing',type,...body},location.origin);};
let multiplayer=false,myId='',roomCode='',inputSequence=0,inputAt=0,seenRace=-1,priorFamily=null,lobbySignature='',familyLaunching=false;
const replica=new RaceReplica(),requests=new Map();
$('race-garage').insertAdjacentHTML('beforeend','<button id="race-family" class="race-family-button">RACE WITH FAMILY</button>');
root.insertAdjacentHTML('beforeend',`<section id="race-family-lobby" class="race-dialog" aria-label="Family race starting grid" hidden>
 <div class="race-eyebrow">NEON CITY RACERS / FAMILY ROOM</div><h2>Race together</h2>
 <p id="race-room-code"></p><p>Everyone opens Racing in the same approved family room. Pick your cars, tap READY, then the race leader starts.</p>
 <ol id="race-family-roster" class="race-result-list"></ol>
 <div class="family-choices"><label>Your car<select id="family-car"></select></label><label>Shared track<select id="family-track"></select></label></div>
 <p id="family-status" role="status"></p><div class="family-actions"><button id="family-ready" class="race-primary">I’M READY</button><button id="family-start" class="race-primary">START FAMILY RACE</button><button id="family-invite">Invite / approve family</button><button id="family-solo">Back to solo racing</button></div>
 <p>8 cars · 3 laps · Computer racers fill empty seats. Keep the hosting device open and awake.</p></section><div id="family-connection" role="status" hidden></div>`);
for(const c of CARS)$('family-car').add(new Option(c.name,c.id));
for(const t of TRACKS)$('family-track').add(new Option(t.name,t.id));
function raceRequest(body){return new Promise((resolve,reject)=>{const requestId=crypto.randomUUID(),timer=setTimeout(()=>{requests.delete(requestId);reject(Error('The hosting device has not replied. Keep it open and awake.'));},6500);requests.set(requestId,{resolve,reject,timer});bridge('race-command',{requestId,body});});}
async function familyCommand(body){try{await raceRequest(body);$('family-status').textContent='';}catch(e){$('family-status').textContent=e.message;toast(e.message);}}
async function joinFamily(){
 if(!contextReceived){location.assign(new URL('index.html?race=family',location.href).href);return;}
 if(familyLaunching)return;familyLaunching=true;
 try{await audio.unlock();await raceRequest({op:'join',car:soloGame.car.id,assist:$('race-assist').checked});multiplayer=true;garage=true;paused=false;seenRace=-1;lobbySignature='';release();$('race-garage').hidden=true;$('race-results').hidden=true;$('race-family-lobby').hidden=false;setPlayingUI(false);$('race-room-code').textContent='Family room · '+roomCode;if(replica.latest?.members.some(m=>m.id===myId))familyState(replica.latest);}
 catch(e){toast(e.message);}finally{familyLaunching=false;}
}
function leaveFamily(){if(multiplayer)raceRequest({op:'leave'}).catch(()=>{});multiplayer=false;paused=false;game=soloGame;priorFamily=null;$('race-family-lobby').hidden=true;$('family-connection').hidden=true;$('race-pause-menu').querySelector('p').textContent='Your race is paused.';$('race-again').textContent='RACE AGAIN';$('race-pause').textContent='Pause';}
function familyState(state){
 if(!multiplayer)return;
 const member=state.members.find(m=>m.id===myId);
 if(!member){leaveFamily();showGarage();toast('You left the family starting grid.');return;}
 if(state.phase==='lobby'){
  garage=true;game=soloGame;paused=false;setPlayingUI(false);$('race-results').hidden=true;$('race-pause-menu').hidden=true;$('race-family-lobby').hidden=false;$('race-banner').textContent='';
  const signature=JSON.stringify([state.members,state.track,state.captain]);if(signature===lobbySignature)return;lobbySignature=signature;
  $('race-family-roster').replaceChildren();
  for(const [i,m]of state.members.entries()){const row=document.createElement('li');for(const text of [ordinal(i+1),m.name+(m.id===myId?' · you':'')+(m.id===state.captain?' · leader':''),m.ready?'READY':'Choosing…']){const span=document.createElement('span');span.textContent=text;row.append(span);}$('race-family-roster').append(row);}
  const computers=document.createElement('li');computers.className='family-computers';computers.textContent=(8-state.members.length)+' computer racers';$('race-family-roster').append(computers);
  $('family-car').value=member.car;$('family-track').value=state.track;$('family-track').disabled=state.captain!==myId;
  $('family-ready').textContent=member.ready?'READY ✓ · tap to change':'I’M READY';$('family-ready').setAttribute('aria-pressed',String(member.ready));
  $('family-start').hidden=state.captain!==myId;$('family-start').disabled=!state.members.every(m=>m.ready);
  $('family-status').textContent=state.captain===myId?'You are the race leader. Start when everyone is ready.':'Waiting for '+state.members.find(m=>m.id===state.captain)?.name+' to start.';
  soloGame.configure(member.car,state.track);renderer.setTrack(soloGame.track);seenRace=-1;return;
 }
 if(state.race!==seenRace){seenRace=state.race;inputSequence=0;resultSent=false;garage=false;paused=false;priorFamily=null;release();$('race-family-lobby').hidden=true;$('race-results').hidden=true;$('race-pause-menu').hidden=true;$('race-garage').hidden=true;setPlayingUI(true);$('race-pause').textContent='Pit stop';$('race-pause-menu').querySelector('p').textContent='The family race continues. A computer drives your car until you return.';$('race-again').textContent='NEXT FAMILY RACE';audio.engineStart();}
}
function familyTick(now){
 if(!multiplayer)return;
 if(!garage&&now-inputAt>80){inputAt=now;raceRequest({op:'input',race:seenRace,seq:++inputSequence,...driving.value(),paused:paused||document.hidden}).catch(()=>{});}
 const stale=now-(replica.receivedAt||0)>2200;
 $('family-connection').hidden=!stale;$('family-connection').textContent='Waiting for the hosting device. Keep its screen open and awake.';
 if(garage)return;
 const view=replica.sample(myId,now);if(!view)return;game=view;game.name=view.player.name;
 $('race-track-label').textContent=game.track.name.toUpperCase();
 const p=game.player,phase=replica.latest.phase,count=Math.ceil(game.countdown),prev=priorFamily;
 if(phase==='countdown'&&prev?.count!==count&&count>0)audio.event({type:'count',value:count});
 if(prev?.phase==='countdown'&&phase!=='countdown'){audio.event({type:'go'});goUntil=now+950;toast('GO! Race together!');}
 if(prev&&p.lap>prev.lap)audio.event({type:'lap'});
 if(prev&&game.rank<prev.rank&&game.elapsed>3){audio.event({type:'position',better:true});toast(ordinal(game.rank)+' place!');}
 if(prev&&p.hit>prev.hit+.1)audio.event({type:'crash'});
 if(p.finishTime!==null&&prev?.finish==null)audio.event({type:'finish'});
 priorFamily={phase,count,lap:p.lap,rank:game.rank,hit:p.hit,finish:p.finishTime};
 root.dataset.familyRace=String(seenRace);root.dataset.familyPlayers=String(replica.latest.members.length);
}
$('race-family').onclick=joinFamily;
$('family-ready').onclick=()=>familyCommand({op:'ready',ready:!replica.latest?.members.find(m=>m.id===myId)?.ready});
$('family-start').onclick=()=>familyCommand({op:'start'});
$('family-car').onchange=()=>familyCommand({op:'car',car:$('family-car').value,assist:$('race-assist').checked});
$('family-track').onchange=()=>familyCommand({op:'track',track:$('family-track').value});
$('family-solo').onclick=()=>{leaveFamily();showGarage();};
$('family-invite').onclick=()=>bridge('room');
function setSound(enabled,notify=false){audio.setEnabled(enabled);$('race-sound').textContent=enabled?'Sound on':'Sound off';$('race-sound').setAttribute('aria-pressed',String(enabled));if(notify&&contextReceived)bridge('sound',{enabled});}
function release(){driving.clear();root.querySelectorAll('[data-drive]').forEach(b=>b.classList.remove('pressed'));}
function resize(){if(!active)return;const r=root.getBoundingClientRect();renderer.resize(r.width,r.height,devicePixelRatio||1);drawPreview();}
function activate(value){active=value;document.body.classList.toggle('racing-open',value);bridge('active',{active:value});if(value){resize();bridge('context');last=0;paintLast=0;if(clock===null)clock=setInterval(()=>simulate(performance.now()),1000/60);if(!frame)frame=requestAnimationFrame(loop);}else{if(multiplayer){leaveFamily();showGarage();}release();audio.quiet();pause();if(frame)cancelAnimationFrame(frame);if(clock!==null)clearInterval(clock);clock=null;frame=0;last=0;}}
function drawPreview(){const canvas=$('race-car-preview'),c=canvas.getContext('2d');c.clearRect(0,0,600,260);drawCar(c,300,245,380,game.car);}
function choose(car=game.car.id,track=game.track.id){game.configure(car,track);renderer.setTrack(game.track);$('race-car-name').textContent=game.car.name;$('race-track-description').textContent=game.track.subtitle;$('race-track-label').textContent=game.track.name.toUpperCase();$('race-stats').replaceChildren();for(const [title,key]of[['Speed','speedStars'],['Acceleration','accelStars'],['Handling','handlingStars']]){const label=document.createElement('span'),meter=document.createElement('meter');label.textContent=title;meter.min=0;meter.max=5;meter.value=game.car[key];meter.setAttribute('aria-label',title+' '+game.car[key]+' out of 5');$('race-stats').append(label,meter);}root.querySelectorAll('[data-car]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.car===game.car.id)));root.querySelectorAll('[data-track]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.track===game.track.id)));drawPreview();updateHUD();}
for(const car of CARS){const b=document.createElement('button'),canvas=document.createElement('canvas');b.dataset.car=car.id;b.setAttribute('aria-label',car.name);canvas.width=160;canvas.height=88;drawCar(canvas.getContext('2d'),80,81,124,car);b.append(canvas);b.onclick=()=>choose(car.id);$('race-car-options').append(b);}
for(const track of TRACKS){const b=document.createElement('button'),swatch=document.createElement('span'),name=document.createElement('span');b.dataset.track=track.id;swatch.className='race-track-swatch';swatch.style.setProperty('--track-color',track.accent);name.textContent=track.name;b.append(swatch,name);b.onclick=()=>choose(game.car.id,track.id);$('race-track-options').append(b);}
function setPlayingUI(value){for(const id of['race-hud','race-timing','race-controls','race-hint','race-pause'])$(id).hidden=!value;}
async function start(){if(multiplayer){await familyCommand({op:'reset'});return;}await audio.unlock();release();paused=false;garage=false;resultSent=false;sessionId=globalThis.crypto?.randomUUID?.()||String(Date.now());game.assist=$('race-assist').checked;game.start();$('race-garage').hidden=true;$('race-results').hidden=true;$('race-pause-menu').hidden=true;setPlayingUI(true);$('race-hint').hidden=false;goUntil=0;last=0;accumulator=0;audio.engineStart();updateHUD();}
function pause(){if(garage||!['racing','countdown'].includes(game.phase))return;paused=true;release();audio.quiet();$('race-pause-menu').hidden=false;$('race-banner').textContent='';}
function resume(){audio.unlock();paused=false;release();$('race-pause-menu').hidden=true;last=0;accumulator=0;}
function showGarage(focus){if(multiplayer){familyCommand({op:'reset'});return;}garage=true;paused=false;release();audio.quiet();game.reset();$('race-garage').hidden=false;$('race-results').hidden=true;$('race-pause-menu').hidden=true;$('race-banner').textContent='';$('race-toast').hidden=true;setPlayingUI(false);choose();if(focus)$(focus).querySelector('button')?.focus();}
function backToWorld(){leaveFamily();release();audio.quiet();if(contextReceived)bridge('exit');else location.assign(new URL('index.html',location.href).href);}
function toast(text){$('race-toast').textContent=text;$('race-toast').hidden=false;toastUntil=performance.now()+2000;}
function bestLap(){const laps=game.player.lapTimes;return Math.min(...laps,records[game.track.id]?.bestLap||Infinity);}
function updateHUD(){const p=game.player;$('race-position').textContent=ordinal(game.rank);$('race-lap').textContent='LAP '+p.lap+' / 3';$('race-mph').textContent=Math.round(p.v*2.23694);$('race-time').textContent=formatTime(p.finishTime??game.elapsed);$('race-best').textContent=formatTime(bestLap());$('race-last').textContent=formatTime(p.lapTimes.at(-1));root.dataset.phase=paused?'paused':game.phase;root.dataset.distance=p.s.toFixed(1);root.dataset.lateral=p.x.toFixed(2);root.dataset.collisions=String(game.collisions);root.dataset.steering=p.steer.toFixed(2);root.dataset.input=JSON.stringify(driving.value());}
function results(){const p=game.player;setPlayingUI(false);$('race-results').hidden=false;$('race-banner').textContent='';$('race-finish-title').textContent=p.dnf?'Race complete':ordinal(game.rank)+' place!';$('race-finish-time').textContent=formatTime(p.finishTime);$('race-finish-best').textContent=formatTime(Math.min(...p.lapTimes));$('race-results-laps').textContent=p.lapTimes.map((t,i)=>'Lap '+(i+1)+' · '+formatTime(t)).join('   /   ');$('race-result-list').replaceChildren();for(const [i,r]of game.order().entries()){const row=document.createElement('li'),position=document.createElement('b'),name=document.createElement('span'),time=document.createElement('time');position.textContent=ordinal(i+1);name.textContent=r.name;if(!r.player&&!r.human){const badge=document.createElement('small');badge.textContent=r.withdrawn?' · left, computer driving':' · computer';name.append(badge);}time.textContent=r.dnf?'DNF':r.finishTime===null?'Racing…':formatTime(r.finishTime);if(r.player)row.className='player';row.append(position,name,time);$('race-result-list').append(row);}
 if(multiplayer){resultSent=true;$('race-save-status').textContent=p.dnf?'Race ended after six minutes. Finish next time!':'Best times saved by the hosting device to '+game.name+'’s profile.';return;}
 if(!resultSent){resultSent=true;const result={id:sessionId,track:game.track.id,car:game.car.id,laps:p.lapTimes.slice(),position:game.rank};const previous=records[result.track];records[result.track]={bestLap:Math.min(previous?.bestLap||Infinity,...result.laps),bestRace:Math.min(previous?.bestRace||Infinity,p.finishTime),races:(previous?.races||0)+1};if(contextReceived){$('race-save-status').textContent='Saving to '+game.name+'’s profile…';bridge('result',{result});}else{try{localStorage.setItem('jhw.racing.local.v1',JSON.stringify(records));$('race-save-status').textContent='Best times saved on this device.';}catch{$('race-save-status').textContent='This device could not save your best times.';}}}
}
// Physics has its own fixed-step clock: a throttled redraw must not slow the race.
function simulate(now){if(!active)return;const elapsed=last?Math.min(.25,(now-last)/1000):0;last=now;familyTick(now);if(!multiplayer&&!garage&&!paused&&!document.hidden){accumulator+=elapsed;let steps=0;while(accumulator>=1/60&&steps++<16){game.tick(1/60,driving.value());accumulator-=1/60;}for(const event of game.consumeEvents()){audio.event(event);if(event.type==='go'){goUntil=now+950;toast('GO! Hold GAS and steer');}if(event.type==='lap')toast('Lap '+event.lap+' · Keep racing!');if(event.type==='position'&&event.better)toast(ordinal(event.rank)+' place!');if(event.type==='finish'){release();results();}}}
 audio.update(game.player,!paused&&!garage&&['racing','countdown'].includes(game.phase));if(now-uiAt>90){updateHUD();if(['results','complete'].includes(game.phase)&&!garage)results();uiAt=now;}$('race-banner').textContent=paused||garage?'':game.phase==='countdown'?Math.max(1,Math.ceil(game.countdown)):now<goUntil?'GO!':'';if(now>toastUntil)$('race-toast').hidden=true;if(game.elapsed>12)$('race-hint').hidden=true;}
function loop(now){frame=0;if(!active)return;const dt=paintLast?Math.min(.25,(now-paintLast)/1000):1/60;paintLast=now;renderer.draw(game,now,dt);renderer.noteFrame(dt*1000);frame=requestAnimationFrame(loop);}

root.querySelectorAll('[data-drive]').forEach(button=>{button.addEventListener('pointerdown',e=>{if(garage||paused||!['countdown','racing'].includes(game.phase))return;e.preventDefault();audio.unlock();button.setPointerCapture(e.pointerId);driving.press(e.pointerId,button.dataset.drive);button.classList.add('pressed');if(button.dataset.drive==='brake'&&game.player.v>40)audio.haptic(15);});const end=e=>{driving.release(e.pointerId);button.classList.toggle('pressed',[...driving.pointers.values()].includes(button.dataset.drive));};button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('lostpointercapture',end);button.addEventListener('contextmenu',e=>e.preventDefault());});
const driveKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD']);window.addEventListener('keydown',e=>{if(!active||garage)return;if(e.code==='Escape'){paused?resume():pause();return;}if(driveKeys.has(e.code)){e.preventDefault();if(!paused)driving.key(e.code,true);}});window.addEventListener('keyup',e=>{if(active&&driveKeys.has(e.code)){e.preventDefault();driving.key(e.code,false);}});window.addEventListener('blur',()=>{release();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){release();pause();}});window.addEventListener('resize',resize);new ResizeObserver(resize).observe(root);
$('race-start').onclick=start;$('race-again').onclick=start;$('race-pause').onclick=pause;$('race-resume').onclick=resume;$('race-garage-back').onclick=()=>showGarage();$('race-change-car').onclick=()=>showGarage('race-car-options');$('race-change-track').onclick=()=>showGarage('race-track-options');$('race-world').onclick=backToWorld;$('race-results-world').onclick=backToWorld;$('race-arcade').onclick=()=>document.querySelector('[data-tab="skee"]').click();$('race-sound').onclick=()=>{audio.unlock();setSound(!audio.enabled,true);};
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.tab==='moto')));
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.channel!=='jhw-racing')return;const message=e.data;
 if(message.type==='race-reply'){const pending=requests.get(message.requestId);if(pending){clearTimeout(pending.timer);requests.delete(message.requestId);message.error?pending.reject(Error(message.error)):pending.resolve(message.result);}return;}
 if(message.type==='race-state'){if(replica.receive(message.state,performance.now()))familyState(message.state);return;}
 if(message.type==='race-lost'){if(multiplayer){leaveFamily();showGarage();toast('The family room disconnected. Rejoin from Our World.');}return;}
 if(message.type==='context'){myId=message.playerId||'';roomCode=message.roomCode||'';$('family-invite').hidden=!message.isHost;contextReceived=true;profile=String(message.profile||'local');game.name=String(message.name||'Jace').slice(0,24);$('race-driver-name').textContent=game.name;if(garage&&!multiplayer){game.reset();$('race-assist').checked=message.mode!=='older';}records=message.records&&typeof message.records==='object'?message.records:{};setSound(message.sound!==false);if(location.hash==='#family'&&!multiplayer&&!familyLaunching)joinFamily();}if(message.type==='saved')$('race-save-status').textContent=message.ok?'Best times saved to '+game.name+'’s profile.':'Could not save right now. Your race results are still here.';});
try{records=JSON.parse(localStorage.getItem('jhw.racing.local.v1')||'{}')||{};}catch{records={};}
choose();$('race-start').disabled=false;$('race-start').textContent='START RACE';if(['#moto','#race','#family'].includes(location.hash))document.querySelector('[data-tab="moto"]').click();
