import {DriveGame} from './engine.mjs?v=drive-1';
import {WorldRenderer} from './render.mjs?v=drive-1';
import {DrivingInput} from '../racing/controls.mjs?v=race-1';
import {RaceAudio} from '../racing/audio.mjs?v=race-1';
const $=id=>document.getElementById(id),mode=document.body.dataset.game==='farm'?'farm':'town',farm=mode==='farm';
const embedded=parent!==window,audio=new RaceAudio(),input=new DrivingInput();
let profile='driver',game,renderer,wheelPointer=null,wheelValue=0,started=false,saveTimer=0,uiTime=0,contextReceived=false;
const key=()=>`jhw-driving.v1.${profile}.${mode}`;
function load(){try{return JSON.parse(localStorage.getItem(key()))||{};}catch{return {};}}
function save(){try{localStorage.setItem(key(),JSON.stringify(game.save()));}catch{}}
function send(type,body={}){if(embedded)parent.postMessage({channel:'jhw-driving',type,...body},location.origin);}
const wheelSVG='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40"/><path d="M14 38 L43 48 M86 38 L57 48 M50 57 V90"/><circle class="hub" cx="50" cy="50" r="12"/></svg>';
document.body.innerHTML=`<main id="drive-shell"><canvas id="view" aria-label="${farm?'Tractor farm driving view':'Drive through Jace and Halli’s World'}"></canvas>
 <header class="drive-bar"><button id="exit" aria-label="Back to our town">‹ <span>Our town</span></button><div class="brand"><small>JACE & HALLI’S WORLD</small><strong>${farm?'Tractor Farm':'Town Driving'}</strong></div><div class="top-actions"><button id="camera" aria-label="Switch driving camera">${farm?'Cab view':'Chase view'}</button><button id="sound" aria-label="Toggle sound">Sound on</button><button id="pause" aria-label="Pause game">Ⅱ</button></div></header>
 <section class="mission"><span class="mission-tag">${farm?'FARM JOB':'FREE DRIVE'}</span><strong id="objective">${farm?'PLOW the field':'Every road is yours'}</strong><span id="status"></span><div class="progress-track" ${farm?'':'hidden'}><i id="progress"></i></div></section>
 <button id="map-button" aria-label="Open driving map"><canvas id="mini-map" width="180" height="180"></canvas><span>${farm?'FARM MAP':'WHERE TO?'}</span></button>
 <div id="toast" role="status" aria-live="polite"></div><div class="speed"><strong id="speed">0</strong><small>km/h</small></div>
 <div class="steering"><div id="wheel" role="slider" tabindex="0" aria-label="Steering wheel. Drag left or right, or use arrow keys." aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0">${wheelSVG}</div><span>SLIDE TO STEER</span></div>
 <div class="drive-center"><button id="tool" ${farm?'':'hidden'}>Tool DOWN</button><button id="enter" hidden>Enter</button><span id="direction"></span></div>
 <div class="pedals"><button id="reverse" aria-label="Hold to back up">BACK<br><small>hold</small></button><button id="brake">BRAKE</button><button id="gas">GAS</button></div>
 <dialog id="menu"><div class="intro-art"><span>${farm?'FARM ADVENTURE':'LET’S EXPLORE'}</span></div><span class="eyebrow">JACE & HALLI’S WORLD</span><h1 id="menu-title">${farm?'Take the wheel.':'Let’s go for a drive.'}</h1><p id="menu-copy">${farm?'You’re in the tractor cab! Plow, plant, harvest, and haul your crop to the barn.':'Steer anywhere. Explore the streets, discover your favorite places, and park to go inside.'}</p><div class="instruction"><span>1. Hold GAS</span><span>2. Slide the wheel</span><span>3. BRAKE to stop</span></div><button id="start" class="primary">${farm?'START TRACTOR':'START DRIVING'}</button><div class="menu-extra"><button id="reset">Back to the road</button><button id="menu-exit">Back to our town</button></div><small class="keys">Keyboard: arrows / WASD · B back up · C camera · Space pause</small></dialog>
 <dialog id="map-dialog"><div class="dialog-head"><h2>${farm?'Your farm':'Where shall we go?'}</h2><button id="close-map" aria-label="Close map">×</button></div><canvas id="big-map" width="520" height="520"></canvas><p>${farm?'The colored field shows your work. Deliver harvested wheat at the barn.':'Pick a place to guide your drive. Follow the streets to its golden parking pad.'}</p><div id="place-list"></div></dialog>
 <dialog id="complete"><span class="eyebrow">DELIVERY COMPLETE</span><h1>You did it, farmer!</h1><p>You plowed, planted, harvested, and delivered a whole field.</p><strong id="delivery-count"></strong><button id="again" class="primary">FARM AGAIN</button><button id="complete-exit">Back to our town</button></dialog></main>`;
function setup(){game=new DriveGame(mode,load());renderer=new WorldRenderer($('view'),game);updateUI();renderer.draw();renderer.map($('mini-map'));}
setup();
function speak(text){if(!audio.enabled||!globalThis.speechSynthesis)return;speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(text);s.rate=.92;s.volume=.65;speechSynthesis.speak(s);}
let toastTimer;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
function clear(){input.clear();wheelPointer=null;wheelValue=0;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));$('wheel').querySelector('svg').style.transform='';audio.quiet();}
function pause(show=true){game.active=false;game.player.v=0;clear();save();globalThis.speechSynthesis?.cancel();if(show&&!$('menu').open&&!$('complete').open&&!$('map-dialog').open){$('menu-title').textContent='Ready to keep going?';$('menu-copy').textContent=farm?'Your field is right where you left it.':'Choose your next turn and keep exploring.';$('start').textContent='KEEP DRIVING';$('menu').showModal();}}
function start(){if(game.delivered)game.newField();if($('menu').open)$('menu').close();clear();audio.unlock();audio.engineStart();game.active=true;started=true;send('active');speak(farm?`${game.task}. Hold gas and slide the steering wheel.`:'Let’s explore our world! Hold gas and slide the steering wheel.');}
$('start').onclick=start;$('pause').onclick=()=>pause();$('menu').addEventListener('cancel',e=>{e.preventDefault();start();});
function exit(){pause(false);if(embedded)send('exit');else location.href='index.html';}
for(const id of ['exit','menu-exit','complete-exit'])$(id).onclick=exit;
$('reset').onclick=()=>{game.safeReset();start();};
$('camera').onclick=()=>{game.camera=game.camera==='cab'?'chase':'cab';$('camera').textContent=game.camera==='cab'?'Cab view':'Chase view';renderer.draw();};
$('sound').onclick=()=>{audio.unlock();audio.setEnabled(!audio.enabled);$('sound').textContent=audio.enabled?'Sound on':'Sound off';if(!audio.enabled)globalThis.speechSynthesis?.cancel();send('sound',{enabled:audio.enabled});};
$('tool').onclick=()=>{game.work=!game.work;updateUI();speak(game.work?'Tool down. Ready to work!':'Tool lifted.');};
$('again').onclick=()=>{$('complete').close();game.newField();save();start();};
function pedal(id,control){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();if(!game.active)return;el.setPointerCapture(e.pointerId);input.press(e.pointerId,control);el.classList.add('held');audio.unlock();});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{input.release(e.pointerId);el.classList.remove('held');});}
pedal('gas','gas');pedal('brake','brake');pedal('reverse','back');
function steer(e){const r=$('wheel').getBoundingClientRect();wheelValue=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width*.4)));$('wheel').setAttribute('aria-valuenow',Math.round(wheelValue*100));$('wheel').querySelector('svg').style.transform=`rotate(${wheelValue*85}deg)`;}
$('wheel').addEventListener('pointerdown',e=>{e.preventDefault();if(!game.active||wheelPointer!==null)return;wheelPointer=e.pointerId;$('wheel').setPointerCapture(e.pointerId);steer(e);});$('wheel').addEventListener('pointermove',e=>{if(e.pointerId===wheelPointer)steer(e);});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('wheel').addEventListener(type,e=>{if(e.pointerId===wheelPointer){wheelPointer=null;wheelValue=0;$('wheel').querySelector('svg').style.transform='';$('wheel').setAttribute('aria-valuenow','0');}});
const drivingKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyB'];
addEventListener('keydown',e=>{if(drivingKeys.includes(e.code)&&game.active){e.preventDefault();input.key(e.code,true);}if(e.repeat)return;if(e.code==='KeyC')$('camera').click();if(e.code==='Space'&&!document.querySelector('dialog[open]')){e.preventDefault();pause();}});addEventListener('keyup',e=>input.key(e.code,false));
addEventListener('blur',()=>{if(started&&game.active)pause();else clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});addEventListener('pagehide',()=>{save();audio.quiet();globalThis.speechSynthesis?.cancel();});
function openMap(){pause(false);renderer.map($('big-map'),true);$('place-list').replaceChildren();for(const p of game.world.places){const b=document.createElement('button');b.textContent=p.name+(game.visited.has(p.id)?' · visited':'');b.onclick=()=>{game.targetId=p.id;closeMap();toast('Let’s drive to '+p.name);speak('Let’s drive to '+p.name);};$('place-list').append(b);}$('map-dialog').showModal();}
function closeMap(){if($('map-dialog').open)$('map-dialog').close();clear();if(started)game.active=true;else $('menu').showModal();}
$('map-button').onclick=openMap;$('close-map').onclick=closeMap;$('map-dialog').addEventListener('cancel',e=>{e.preventDefault();closeMap();});
function enter(){const p=game.nearby;if(!p||Math.abs(game.player.v)>2||farm)return;save();pause(false);if(embedded){send('destination',{destination:p.id});return;}if(p.file){location.href=p.file;return;}location.href='index.html?drivePlace='+encodeURIComponent(p.id);}
$('enter').onclick=enter;
function updateUI(){const p=game.player,near=game.nearby;$('speed').textContent=Math.round(Math.abs(p.v)*3.6);
 if(farm){$('objective').textContent=game.task;$('status').textContent=game.phase===3?'Park on the yellow pad by the barn to deliver.':`${game.progress} / ${game.total} patches · ${game.work?'Tool working':'Tool lifted'}`;$('progress').style.width=(game.progress/game.total*100)+'%';$('tool').textContent=game.work?'Tool DOWN':'Tool UP';$('tool').classList.toggle('lowered',game.work);$('tool').hidden=game.phase===3;}
 else{$('objective').textContent=near?near.name:game.target?'To '+game.target.name:'Every road is yours';$('status').textContent=`${game.visited.size} / ${game.world.places.length} places discovered`+(near?' · Brake to park':' · Take any turn');const playable=near&&(near.visit||near.file||near.art);$('enter').hidden=!playable||Math.abs(p.v)>2;if(playable)$('enter').textContent='Enter '+near.name;}
 if(game.target){const target=game.target,angle=Math.atan2(target.stop[0]-p.x,-(target.stop[1]-p.z))-p.angle,a=Math.atan2(Math.sin(angle),Math.cos(angle));$('direction').textContent=`${Math.abs(a)<.3?'↑':a>0?'↱':'↰'} ${Math.round(Math.hypot(target.stop[0]-p.x,target.stop[1]-p.z))} m`;}else $('direction').textContent='';
}
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.channel!=='jhw-driving')return;const m=e.data;if(m.type==='context'&&!contextReceived&&typeof m.profile==='string'){contextReceived=true;save();profile=m.profile.slice(0,80);setup();audio.setEnabled(m.sound!==false);$('sound').textContent=audio.enabled?'Sound on':'Sound off';if(started)game.active=true;}});
send('context');send('active');
let last=performance.now(),acc=0;
function frame(t){const dt=Math.min(.1,(t-last)/1000);last=t;acc+=dt;const raw=input.value();raw.steer=wheelPointer===null?raw.steer:wheelValue;raw.back=input.keys.has('KeyB')||[...input.pointers.values()].includes('back');while(acc>=1/60){game.tick(raw,1/60);acc-=1/60;}
 const events=game.events.splice(0);if(events.includes('bump'))audio.event({type:'crash'});if(events.includes('visit')){toast('You found '+game.nearby?.name+'!');audio.event({type:'lap'});save();}
 if(events.includes('phase')){toast(game.phase===3?'Harvest ready! Drive to the barn.':'Great work! Now '+game.task.toLowerCase()+'.');audio.event({type:'finish'});speak(game.phase===3?'Harvest ready! Drive to the barn and stop on the yellow pad.':'Great work! Now '+game.task.toLowerCase());save();}else if(events.includes('crop'))audio.tone(280+game.progress*4,.05,0,.07);
 if(events.includes('delivery')){save();clear();audio.event({type:'finish'});$('delivery-count').textContent=`${game.deliveries} harvest${game.deliveries===1?'':'s'} delivered`;$('complete').showModal();speak('You did it, farmer! Your harvest is delivered.');}
 audio.update({v:Math.abs(game.player.v),car:{max:game.maxSpeed},steer:game.player.steer,braking:raw.brake},game.active);renderer.draw();uiTime+=dt;saveTimer+=dt;if(uiTime>.12){updateUI();renderer.map($('mini-map'));uiTime=0;}if(saveTimer>4){if(game.active)save();saveTimer=0;}requestAnimationFrame(frame);
}
addEventListener('resize',()=>renderer.resize());$('menu').showModal();requestAnimationFrame(frame);
if(new URLSearchParams(location.search).has('qa'))Object.defineProperty(window,'driveSnapshot',{get:()=>({mode,time:game.time,active:game.active,camera:game.camera,player:{...game.player},phase:game.phase,progress:game.progress,visited:[...game.visited],profile})});
