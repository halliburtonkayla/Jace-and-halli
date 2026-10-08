// The owner's approved illustrated town is primary. Experimental renderers stay opt-in.
const view = new URLSearchParams(location.search).get('view');
const use3D = view === '3d', illustrated = !['3d','legacy'].includes(view);
const { Renderer } = await import(illustrated ? './render-illustrated.mjs?v=illustrated-1' : use3D ? './render-3d.mjs?v=town-1' : './render.mjs?v=3');
import { Sound } from './audio.mjs';
import { LOCATIONS } from './locations.mjs';
import { drawPortrait, drawFamily, CHARACTER_ART } from './characters.mjs';
import { routeTo, updateRoute, guidedInput, routeDots } from './routes.mjs';
import { FamilyRoom } from './room.mjs?v=halloween-1';
import {TownView} from './town-view.mjs?v=bubble-1';
import {BowlingView} from './bowling-view.mjs?v=family-3';
import {SCENES} from './town-destinations.mjs?v=zoo-tour-1';
import {PLACES as DRIVE_PLACES} from './driving/world.mjs?v=drive-1';
const room=new FamilyRoom();
let pendingTheater=new URLSearchParams(location.search).get('activity')==='theater';
let pendingDrivePlace=new URLSearchParams(location.search).get('drivePlace');
let pendingFamilyRace=new URLSearchParams(location.search).get('race')==='family',racingOpen=false;
function sendRacing(body){if(racingOpen)$('classic-frame').contentWindow?.postMessage({channel:'jhw-racing',...body},location.origin);}
room.addEventListener('snapshot',e=>sendRacing({type:'race-state',state:e.detail.racing}));
room.addEventListener('lost',()=>sendRacing({type:'race-lost'}));
let artCenter=null,artOpening=false,pendingArt=new URLSearchParams(location.search).get('activity')==='art';
const $=id=>document.getElementById(id),renderer=new Renderer($('world')),sound=new Sound();
document.body.classList.toggle('illustrated',illustrated);
const townView=illustrated?new TownView($('play'),{visit:id=>action('visit',{destination:id}),art:station=>openArt(station),classic:openClassic,say:text=>{sound.unlock();sound.say(text,true);}}):null;
const bowlingView=illustrated?new BowlingView($('play'),{action,sound}):null;
let route=null,assist=false;
let me=null,data=null,bubbles=[],snapshot={players:[],npcs:[],cut:[],tag:{}},events=null,role='',profiles=[],online=false,busy=false,lastIt=null,input={gas:0,brake:0,steer:0},inputBusy=false;
document.querySelector('.build-note').textContent=use3D?'New town · buildings are growing into playable places':'Legacy development view';
drawFamily($('family-welcome'));
async function api(path,body){return room.request(path,body);}
function show(id){['welcome','profiles','play'].forEach(x=>$(x).classList.toggle('hidden',x!==id));}
async function load(){try{const r=await api('me');role=r.role;profiles=r.profiles;$('room-lobby').classList.toggle('hidden',!room.host);if(r.selected){const resumed=await api('resume',{});me=resumed.player;data=resumed.data;bubbles=resumed.bubbles;sound.mute(data.preferences.sound);$('parent').classList.toggle('hidden',!room.host);$('back').textContent='Profiles';$('room-lobby').classList.toggle('hidden',!room.host);show('play');updateUI();connect();return;}show('profiles');$('profile-list').replaceChildren();for(const p of profiles){const b=document.createElement('button');b.className='profile';b.setAttribute('aria-label','Play as '+p.name);const portrait=document.createElement(CHARACTER_ART[p.id]?'canvas':'span');portrait.className='portrait';if(CHARACTER_ART[p.id]){portrait.width=240;portrait.height=300;drawPortrait(portrait,p.id);}else portrait.textContent=p.name[0].toUpperCase();const n=document.createElement('b');n.textContent=p.name.toUpperCase();const a=document.createElement('small');a.textContent=p.mode==='toddler'?'TOUCH & EXPLORE':p.mode==='preschool'?'PLAY & DISCOVER':p.mode==='adult'?'FAMILY ADVENTURES':'EXPLORE TOGETHER';b.append(portrait,n,a);b.onclick=()=>select(p.id);$('profile-list').append(b);}}catch{show('welcome');}}
async function createRoom(){try{sound.unlock();$('login-error').textContent='Starting your family room…';await room.create();await load();$('lobby-code').textContent='Room code: '+room.code;}catch(e){$('login-error').textContent=e.message;}};
$('create-room').onclick=()=>{pendingArt=false;createRoom();};
$('start-art').onclick=()=>{pendingArt=true;createRoom();};
$('join-profile').onchange=()=>$('join-guest').classList.toggle('hidden',$('join-profile').value!=='guest');
$('join-room').onsubmit=async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{sound.unlock();$('login-error').textContent='Connecting…';await room.join($('room-code').value,$('join-profile').value,$('join-guest').value);await load();}catch(e){$('login-error').textContent=e.message;}finally{button.disabled=false;}};
if(location.hash.startsWith('#room=')){$('room-code').value=location.hash.slice(6);$('join-details').open=true;history.replaceState(null,'',location.pathname+location.search);}
room.addEventListener('status',e=>{$('login-error').textContent=e.detail;$('room-status').textContent=e.detail;});
room.addEventListener('ready',()=>{$('lobby-code').textContent='Room code: '+room.code;$('share-code').value=room.code;});
room.addEventListener('requests',()=>{renderRequests();if(room.host&&room.pending.size&&!$('admin').open)$('admin').showModal();});
room.addEventListener('lost',e=>{stop();theaterOpen=false;togetherOpen=false;$('classic-frame-panel').classList.add('hidden');$('classic-frame').src='about:blank';sharedMenu.close();show('welcome');$('login-error').textContent=e.detail;});

function stop(){artCenter?.dispose();artCenter=null;artOpening=false;events=null;me=null;online=false;input={gas:0,brake:0,steer:0};sound.motor(null);}
async function logout(){stop();await api('logout',{});$('admin').close();$('classic-frame-panel').classList.add('hidden');$('classic-frame').src='about:blank';show('welcome');}
$('profile-logout').onclick=logout;$('back').onclick=()=>{if(room.host&&room.game.players.has('host'))room.game.request('host','input',{gas:0,brake:1,steer:0});me=null;input={gas:0,brake:0,steer:0};sound.motor(null);room.selected=null;load();};
async function select(id){try{sound.unlock();const r=await api('select',{profile:id});me=r.player;data=r.data;bubbles=r.bubbles;route=null;assist=me.mode==='toddler';role=room.host?'parent':'device';sound.mute(data.preferences.sound);$('parent').classList.toggle('hidden',!room.host);$('back').textContent='Profiles';$('room-lobby').classList.toggle('hidden',!room.host);show('play');renderer.resize();updateUI();connect();if(pendingTheater){pendingTheater=false;await action('visit',{destination:'theater'});return;}if(pendingDrivePlace){const destination=DRIVE_PLACES.find(p=>p.id===pendingDrivePlace);pendingDrivePlace=null;if(destination?.visit)await action('visit',{destination:destination.visit});else if(destination?.art)openArt(destination.art);return;}if(pendingFamilyRace){pendingFamilyRace=false;openClassic('arcade-new.html#family');return;}if(pendingArt){pendingArt=false;openArt();return;}sound.say(illustrated?'Welcome to our world. Choose a picture at the bottom to play.':'Welcome to our world. Tap Where to, choose a place, then hold Go to travel.',true);}catch(e){$('profile-error').textContent=e.message;}}
function connect(){online=room.connected;}
room.addEventListener('snapshot',e=>{snapshot=e.detail;online=room.connected;$('connection').textContent=`${snapshot.players.length} family player${snapshot.players.length===1?'':'s'} · code ${room.code}`;const p=snapshot.players.find(p=>p.id===me?.id);if(p){me=p;updateUI();}if(snapshot.tag.active&&snapshot.tag.it!==lastIt){lastIt=snapshot.tag.it;sound.tone(650);sound.say(lastIt===me?.id?'You’re it!':'Run! You’re playing tag.',true);navigator.vibrate?.(30);}});

function updateIllustratedUI(){
 const mowing=me.scene==='world'&&me.vehicle==='mower',garden=me.scene==='bubbles';
 document.body.classList.toggle('toddler',me.mode==='toddler');$('sound').textContent=sound.enabled?'Sound on':'Sound off';
 $('place').textContent=mowing?'Jace’s backyard':garden?'Bubble garden':me.scene==='bowling'?'Let’s bowl':SCENES[me.scene]?.title||'Our town';
 $('controls').classList.toggle('hidden',!mowing);$('world').classList.toggle('hidden',!mowing&&!garden);
 $('scene-exit').classList.toggle('hidden',me.scene==='world');$('scene-exit').textContent='Back to our town';
 $('bubble-score').classList.toggle('hidden',!garden);$('hint').classList.toggle('hidden',!garden&&!mowing);
 for(const id of['vehicle','enter','tag','camera-view'])$(id).classList.add('hidden');
 $('start').classList.toggle('hidden',!mowing);$('start').textContent=me.engine?'Stop mower':'Start mower';$('leave-mower').classList.toggle('hidden',!mowing);$('leave-mower').textContent='Back to town';$('gas').textContent='GAS';
 if(garden){const level=1+Math.min(2,Math.floor(data.pops/15));$('bubble-score').textContent=`Level ${level} · ${data.pops} pops`;$('hint').textContent=level===1?'Pop the big floating bubbles!':level===2?'Pop a color. Say its name!':'Pop for a surprise word!';}
 if(mowing)$('hint').textContent='Start the mower. Hold GAS and steer to cut the tall grass.';
 townView.update(snapshot,me);updateTheaterWatchButton();bowlingView.update(snapshot.bowling,me);sound.motor(mowing?me:null);
}
function updateUI(){if(!me)return;if(illustrated){updateIllustratedUI();return;}updateRoute(me,route);renderer.setRoute?.(routeDots(me,route));$('assistance').textContent='Help steer: '+(assist?'on':'off');$('directions').classList.toggle('hidden',me.scene!=='world');document.body.classList.toggle('toddler',me.mode==='toddler');$('sound').textContent=sound.enabled?'Sound on':'Sound off';const outside=me.scene==='world';$('controls').classList.toggle('hidden',!outside);$('scene-exit').classList.toggle('hidden',outside);$('home-panel').classList.toggle('hidden',me.scene!=='home');$('classic-panel').classList.toggle('hidden',me.scene!=='classic');$('bubble-score').classList.toggle('hidden',me.scene!=='bubbles');$('hint').classList.toggle('hidden',!outside&&me.scene!=='bubbles');$('place').textContent=me.scene==='bubbles'?'Halli’s Bubble Garden':me.scene==='home'?'Our Home':me.scene==='classic'?'Game House':'Our Neighborhood';
 $('gas').textContent=me.vehicle==='walk'?'GO':'GAS';$('start').classList.toggle('hidden',me.vehicle==='walk'||!outside);$('start').textContent=me.engine?'Stop':'Start';$('vehicle').textContent=me.vehicle==='walk'?'Ride car':'Walk';$('vehicle').classList.toggle('hidden',me.vehicle==='mower');$('leave-mower').classList.toggle('hidden',me.vehicle!=='mower');$('camera-view').classList.toggle('hidden',!outside||!use3D||Boolean(renderer.compatibility));$('tag').classList.toggle('hidden',me.vehicle!=='walk');$('tag').textContent=snapshot.tag.active?'Stop tag':'Play tag';const near=LOCATIONS.find(l=>Math.hypot(me.x-l.x,me.y-(l.y+45))<120);$('enter').classList.toggle('hidden',!near||!outside||me.vehicle==='mower');if(near)$('enter').textContent=near.action==='mower'?'Mow grass':`Enter ${near.name}`;
 if(me.scene==='bubbles'){const level=1+Math.min(2,Math.floor(data.pops/15));$('bubble-score').textContent=`Level ${level} · ${data.pops} pops`;$('hint').textContent=level===1?'Tap a bubble. Pop, pop, pop!':level===2?'Pop a color. Say its name!':'Pop for a surprise word!';}else $('hint').textContent=me.vehicle==='mower'?'Start the mower, hold GAS, and steer across tall grass.':near?`You found ${near.name}. Tap ${near.action==='mower'?'Mow grass':'Enter'}!`:me.vehicle==='walk'?(use3D&&!renderer.compatibility?'Hold GO to walk. Steer with the wheel. Drag the scenery to look around.':'Hold GO to walk. Turn the wheel. Arrow keys work too.'):me.engine?'Hold GAS and turn the wheel. BRAKE slows down.':'Tap START to start your car.';
 if(outside&&route&&!route.arrived&&me.vehicle!=='mower')$('hint').textContent='To '+route.name+' · '+(assist?'Hold '+(me.vehicle==='walk'?'GO':'GAS')+' to follow the golden path.':'Follow the golden path. Help steer is available in Where to.');
 if(me.scene==='world')$('place').textContent='Our Town';
 sound.motor(me);
}
async function action(action,extra={}){if(busy||!me)return;busy=true;try{sound.unlock();if(['visit','exit'].includes(action)){release();route=null;}const r=await api('action',{action,...extra});me=r.player;data=r.data;bubbles=r.bubbles;updateUI();renderer.resize();if(['enter','visit'].includes(action)&&me.scene==='bubbles')sound.say('Pop! Now you say pop.',true);if(action==='start')sound.tone(110,.2);}catch(e){$('hint').textContent=e.message;if(me.scene==='bowling')bowlingView.message.textContent=e.message;}finally{busy=false;}}
$('directions').onclick=()=>{release();$('destinations').showModal();};
for(const place of LOCATIONS){const b=document.createElement('button');b.textContent=place.id==='home'?'Our home · outside':place.name;b.onclick=()=>{route=routeTo(me,place.id);$('destinations').close();updateUI();sound.say('Let’s go to '+place.name+'. Hold Go or Gas and follow the golden path.',true);};$('destination-list').append(b);}
$('assistance').onclick=()=>{assist=!assist;updateUI();};
$('clear-route').onclick=()=>{route=null;renderer.setRoute?.([]);$('destinations').close();updateUI();};
$('camera-view').textContent=use3D?'Street view':'Town view';
$('camera-view').onclick=()=>{$('camera-view').textContent=renderer.toggleCamera?.()?'Street view':'Town view';};
$('town-overview')?.addEventListener('click',()=>{release();if(illustrated){if(me)action('exit');}else $('town-map').showModal();});
$('welcome-overview')?.addEventListener('click',()=>$('town-map').showModal());
window.addEventListener('town-open-art',()=>openArt());
window.addEventListener('town-open-classic',()=>{if(!me)return;release();$('classic-frame').src='classic-home.html';$('classic-frame-panel').classList.remove('hidden');});
$('vehicle').onclick=()=>action('vehicle');$('start').onclick=()=>action('start');$('enter').onclick=()=>action('enter');$('tag').onclick=()=>action('tag');['scene-exit','home-outside','classic-outside','leave-mower'].forEach(id=>$(id).onclick=()=>action('exit'));
$('sound').onclick=()=>{sound.mute(!sound.enabled);action('preferences',{sound:sound.enabled});updateUI();};
function pedal(id,key){const el=$(id);el.onpointerdown=e=>{e.preventDefault();el.setPointerCapture(e.pointerId);sound.unlock();input[key]=1;};el.onpointerup=el.onpointercancel=()=>{input[key]=0;};}pedal('gas','gas');pedal('brake','brake');
const wheel=$('wheel');let steering=false;function steer(e){const r=wheel.getBoundingClientRect();input.steer=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width*.42)));wheel.setAttribute('aria-valuenow',Math.round(input.steer*100));wheel.querySelector('svg').style.transform=`rotate(${input.steer*80}deg)`;}
wheel.onpointerdown=e=>{e.preventDefault();steering=true;wheel.setPointerCapture(e.pointerId);steer(e);};wheel.onpointermove=e=>{if(steering)steer(e);};wheel.onpointerup=wheel.onpointercancel=()=>{steering=false;input.steer=0;wheel.querySelector('svg').style.transform='';};
const keySet=new Set();function keys(){input.gas=keySet.has('ArrowUp')||keySet.has('w')?1:0;input.brake=keySet.has('ArrowDown')||keySet.has('s')?1:0;input.steer=(keySet.has('ArrowRight')||keySet.has('d')?1:0)-(keySet.has('ArrowLeft')||keySet.has('a')?1:0);}
addEventListener('keydown',e=>{if(!me||artCenter||artOpening||(illustrated&&me.vehicle!=='mower')||e.target.matches('input,textarea,select'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keySet.add(e.key);keys();}});addEventListener('keyup',e=>{keySet.delete(e.key);keys();});
function release(){keySet.clear();input={gas:0,brake:0,steer:0};sound.motor(null);}addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
setInterval(async()=>{if(!me||!online||inputBusy)return;inputBusy=true;try{const paused=document.hidden||artCenter||artOpening||!$('classic-frame-panel').classList.contains('hidden')||(illustrated&&me.vehicle!=='mower');await api('input',paused||renderer.playable===false?{gas:0,brake:1,steer:0}:guidedInput(me,input,route,assist));}catch{online=false;}finally{inputBusy=false;}},100);
$('world').onpointerdown=async e=>{if(me?.scene!=='bubbles'||busy)return;const r=$('world').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const b=renderer.bubbleHits.slice().reverse().find(b=>Math.hypot(x-b.x,y-b.y)<b.r);if(!b)return;const count=data.pops;await action('pop',{id:b.id});if(data.pops===count)return;renderer.pop(x,y);sound.tone(500+Math.random()*300);navigator.vibrate?.(15);if(data.pops<15)sound.prompt();else if(data.pops<30)sound.say(['Pink.','Blue.','Yellow.','Green.'][b.color]);else sound.say(['Ball. Roll a ball.','Car. Vroom, vroom!','Baby. Say baby.','More. Say more.'][b.color]);};
function renderRequests(){
 $('join-requests').replaceChildren();for(const request of room.pendingList()){const row=document.createElement('div'),name=document.createElement('b');name.textContent=request.name+' wants to join';const approve=document.createElement('button'),decline=document.createElement('button');approve.textContent='Approve';decline.textContent='Decline';approve.onclick=()=>{room.approve(request.id);devices();};decline.onclick=()=>room.deny(request.id);row.append(name,approve,decline);$('join-requests').append(row);}if(!room.pending.size)$('join-requests').textContent='No one is waiting to join.';
}
function devices(){
 $('device-list').replaceChildren();const host=document.createElement('div');host.textContent='This device is hosting the family room.';$('device-list').append(host);for(const [id,record]of room.connections){if(!record.approved)continue;const row=document.createElement('div'),name=document.createElement('span'),remove=document.createElement('button');name.textContent=record.profile.name;remove.textContent='Remove';remove.onclick=()=>{room.deny(id);setTimeout(devices,200);};row.append(name,remove);$('device-list').append(row);}
}
function openRoom(){if(!room.host)return;$('share-code').value=room.code;renderRequests();devices();$('admin').showModal();}
$('parent').onclick=openRoom;$('lobby-controls').onclick=openRoom;
async function share(){try{await navigator.clipboard.writeText(new URL('./',location.href).href+(racingOpen?'?race=family':'')+'#room='+room.code);$('admin-status').textContent='Room link copied. Open it on the other device.';}catch{$('share-code').value=room.code;$('share-code').select();$('admin-status').textContent='Share room code '+room.code;}}
$('copy-invite').onclick=share;$('lobby-share').onclick=share;
$('reset-yard').onclick=()=>{room.game.cut.clear();room.game.save();$('admin-status').textContent='Fresh grass is ready for mowing.';};
$('save-backup').onclick=()=>{room.game.save();const state={version:1,progress:room.game.progress,cut:[...room.game.cut],guests:room.game.profiles.filter(p=>p.id.startsWith('guest-'))},blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='jace-halli-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
async function openArt(station='coloring'){
 if(typeof station!=='string')station='coloring';
 if(artCenter||artOpening||!me)return;artOpening=true;release();sound.unlock();sound.motor(null);
 try{const r=await api('action',{action:'creativity'});me=r.player;data=r.data;const loader=document.createElement('div');loader.id='art-loader';loader.className='art-loading';loader.setAttribute('role','status');loader.textContent='Opening the Creativity Center…';$('play').append(loader);const {CreativityCenter,prepareIllustratedSheets}=await import('./creativity/center.mjs?v=illustrated-1');await prepareIllustratedSheets();
 if(!document.getElementById('art-style')){const link=document.createElement('link');link.id='art-style';link.rel='stylesheet';link.href=new URL('./creativity/center.css?v=5',import.meta.url).href;document.head.append(link);await new Promise(resolve=>{link.onload=link.onerror=resolve;});}
 artCenter=new CreativityCenter({parent:$('play'),room,sound,player:me,initialStation:illustrated?station:null,onClose:async()=>{artCenter=null;await action('art-exit');},onSoundChange:enabled=>action('preferences',{sound:enabled})});
 }catch(e){$('hint').textContent=e.message;if(me?.scene==='creativity')await action('art-exit');}finally{$('art-loader')?.remove();artOpening=false;}
}
$('create-art').onclick=openArt;$('classic-creativity').onclick=openArt;
function openClassic(file){if(file.startsWith('church.html')||file.startsWith('bubble-garden.html'))sound.mute(false);leavePark();if(togetherOpen){togetherOpen=false;api('together',{op:'leave'}).catch(()=>{});}if(theaterOpen){theaterOpen=false;api('cinema',{op:'leave'}).catch(()=>{});}$('classic-frame-panel').classList.remove('hidden');const url=new URL('../../'+file,import.meta.url);if(url.pathname.endsWith('/family-playpark.html'))url.searchParams.set('v','hide-2');if(url.pathname.endsWith('/arcade-new.html'))url.searchParams.set('v','all-games-1');if(url.pathname.endsWith('/together.html'))url.searchParams.set('v','family-3');if(url.pathname.endsWith('/theater.html'))url.searchParams.set('v','halloween-1');if(/\/(town-driving|tractor-farm)\.html$/.test(url.pathname))url.searchParams.set('v','drive-1');if(url.pathname.endsWith('/zoo.html')){url.searchParams.set('v','zoo-tour-1');url.searchParams.set('profile',me?.profile||'guest');}if(url.pathname.endsWith('/bubble-garden.html'))url.searchParams.set('v','bubble-1');if(url.pathname.endsWith('/church.html')){url.searchParams.set('v','church-7');$('classic-frame').setAttribute('allow','autoplay; fullscreen');$('classic-frame').referrerPolicy='strict-origin-when-cross-origin';}
$('classic-frame').src=url.href;input={gas:0,brake:1,steer:0};sound.motor(null);}
$('classic-open').onclick=()=>openClassic('classic-home.html');$('classic-whiteboard').onclick=()=>openClassic('whiteboard.html');$('classic-books').onclick=()=>openClassic('family-library.html');

function racingFrame(active){racingOpen=active;$('classic-frame-panel').style.paddingTop=active?'0':'';$('close-classic').hidden=active;}
$('close-classic').onclick=()=>{leavePark();if(togetherOpen){togetherOpen=false;api('together',{op:'leave'}).catch(()=>{});}if(theaterOpen){theaterOpen=false;api('cinema',{op:'leave'}).catch(()=>{});}if(me&&room.connected)api('race',{op:'leave'}).catch(()=>{});racingFrame(false);$('classic-frame-panel').classList.add('hidden');$('classic-frame').src='about:blank';sound.mute(data?.preferences.sound??true);updateUI();};
window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-racing'||!new URL($('classic-frame').src,location.href).pathname.endsWith('/arcade-new.html')||!me)return;
 const message=e.data,send=body=>e.source.postMessage({channel:'jhw-racing',...body},location.origin);
 if(message.type==='context')send({type:'context',profile:me.profile,name:me.name,mode:me.mode,sound:data.preferences.sound,records:data.racing||{},playerId:me.id,roomCode:room.code,isHost:room.host});
 if(message.type==='active'&&typeof message.active==='boolean'){racingFrame(message.active);if(!message.active)api('race',{op:'leave'}).catch(()=>{});}
 if(message.type==='room')openRoom();
 if(message.type==='race-command'&&typeof message.requestId==='string'&&message.requestId.length<80){try{const result=await api('race',message.body);send({type:'race-reply',requestId:message.requestId,result});}catch(error){send({type:'race-reply',requestId:message.requestId,error:error.message});}}
 if(message.type==='exit')$('close-classic').click();
 if(message.type==='sound'&&typeof message.enabled==='boolean'){sound.mute(message.enabled);await action('preferences',{sound:message.enabled});}
 if(message.type==='result'){try{const r=await api('action',{...message.result,action:'race-result'});data=r.data;send({type:'saved',ok:true});}catch{send({type:'saved',ok:false});}}
});
// Driving remains inside the existing activity iframe and family profile.
// Only the current same-origin frame can request allowlisted destinations.
window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-driving'||!me)return;
 let path;try{path=e.source.location.pathname;}catch{return;}
 if(!/\/(town-driving|tractor-farm)\.html$/.test(path))return;
 const m=e.data;
 if(m.type==='context')e.source.postMessage({channel:'jhw-driving',type:'context',profile:me.profile,sound:data.preferences.sound},location.origin);
 if(m.type==='active'){$('classic-frame-panel').style.paddingTop='0';$('close-classic').hidden=true;}
 if(m.type==='exit')$('close-classic').click();
 if(m.type==='sound'&&typeof m.enabled==='boolean'){sound.mute(m.enabled);await action('preferences',{sound:m.enabled});}
 if(m.type==='destination'){
  const destination=DRIVE_PLACES.find(p=>p.id===m.destination);if(!destination?.visit&&!destination?.art&&!destination?.file)return;if(destination.file){openClassic(destination.file);return;}
  $('close-classic').click();if(destination.art)openArt(destination.art);else await action('visit',{destination:destination.visit});
 }
});
$('classic-frame').onload=()=>{try{const path=$('classic-frame').contentWindow.location.pathname;if(!/\/(town-driving|tractor-farm|arcade-new|zoo|bubble-garden)\.html$/.test(path))racingFrame(false);const doc=$('classic-frame').contentDocument;if(!doc)return;doc.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href);if(u.origin===location.origin&&u.pathname.endsWith('/index.html'))a.href=new URL('../../classic-home.html',import.meta.url).href;else if(u.origin!==location.origin)a.target='_blank';});doc.querySelectorAll('[onclick]').forEach(el=>{const v=el.getAttribute('onclick');if(v.includes("'index.html'"))el.setAttribute('onclick',v.replaceAll("'index.html'","'classic-home.html'"));});}catch{}};
addEventListener('pagehide',()=>{if(room.host)room.game?.save();});
addEventListener('resize',()=>renderer.resize());$('create-room').disabled=false;$('start-art').disabled=false;$('login-error').textContent='';function loop(t){if(!artCenter&&!artOpening){if(!illustrated||me?.scene==='bubbles'||me?.vehicle==='mower')renderer.draw(snapshot,me,bubbles,data,t);bowlingView?.draw(t);}requestAnimationFrame(loop);}requestAnimationFrame(loop);show('welcome');

window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-theater'||!new URL($('classic-frame').src,location.href).pathname.endsWith('/theater.html')||!me)return;
 if(e.data.type==='context'){try{const state=await api('cinema',{op:'join'});theaterOpen=true;e.source.postMessage({channel:'jhw-theater',type:'context',sound:data.preferences.sound,state},location.origin);}catch(error){e.source.postMessage({channel:'jhw-theater',type:'movie-error',error:error.message},location.origin);}}
 if(e.data.type==='command'&&theaterOpen){try{const state=await api('cinema',e.data.body);e.source.postMessage({channel:'jhw-theater',type:'movie-state',state},location.origin);}catch(error){e.source.postMessage({channel:'jhw-theater',type:'movie-error',error:error.message},location.origin);}}
 if(e.data.type==='sound'&&typeof e.data.enabled==='boolean'){sound.mute(e.data.enabled);await action('preferences',{sound:e.data.enabled});}
 if(e.data.type==='exit'){$('close-classic').click();await action('exit');}
});

// One-tap entrance to the movie library from the illustrated theater lobby.
const theaterWatchButton=document.createElement('button');
theaterWatchButton.id='theater-watch-movie';
theaterWatchButton.type='button';
theaterWatchButton.textContent='🎬 NOW SHOWING · WATCH MOVIE';
theaterWatchButton.setAttribute('aria-label','Open the movie theater and watch Jace and Halli’s World');
theaterWatchButton.style.cssText='position:absolute;z-index:35;bottom:105px;left:50%;transform:translateX(-50%);width:min(88vw,430px);min-height:62px;padding:12px 20px;border:3px solid #fff;border-radius:22px;background:#ffe16c;color:#342044;font-size:clamp(16px,3vw,23px);font-weight:900;box-shadow:0 8px 20px #0008;cursor:pointer;touch-action:manipulation;';
theaterWatchButton.hidden=true;
$('play').append(theaterWatchButton);
theaterWatchButton.onclick=()=>{if(me)openClassic('theater.html');};
function updateTheaterWatchButton(){const place=$('place').textContent.toLowerCase();theaterWatchButton.hidden=!me||me.scene!=='theater'||!$('classic-frame-panel').classList.contains('hidden');}
new MutationObserver(updateTheaterWatchButton).observe($('place'),{childList:true,subtree:true,characterData:true});
new MutationObserver(updateTheaterWatchButton).observe($('classic-frame-panel'),{attributes:true,attributeFilter:['class']});
updateTheaterWatchButton();

window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-zoo'||!new URL($('classic-frame').src,location.href).pathname.endsWith('/zoo.html'))return;if(e.data.type==='active'){$('classic-frame-panel').style.paddingTop='0';$('close-classic').hidden=true;}if(e.data.type==='exit')$('close-classic').click();});

let theaterOpen=false;
room.addEventListener('snapshot',e=>{if(theaterOpen)$('classic-frame').contentWindow?.postMessage({channel:'jhw-theater',type:'movie-state',state:e.detail.cinema},location.origin);updateTogether(e.detail);});
room.addEventListener('lost',()=>{if(theaterOpen)$('classic-frame').contentWindow?.postMessage({channel:'jhw-theater',type:'room-lost'},location.origin);});
let togetherOpen=false;
window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-together'||!new URL($('classic-frame').src,location.href).pathname.endsWith('/together.html')||!me)return;
 try{if(e.data.type==='context'){const state=await api('together',{op:'join'});togetherOpen=true;e.source.postMessage({channel:'jhw-together',type:'context',id:me.id,state},location.origin);}else if(e.data.type==='command'&&togetherOpen){const state=await api('together',e.data.body);e.source.postMessage({channel:'jhw-together',type:'state',state},location.origin);}}
 catch(error){e.source.postMessage({channel:'jhw-together',type:'error',error:error.message},location.origin);}
});
room.addEventListener('snapshot',e=>{if(togetherOpen)$('classic-frame').contentWindow?.postMessage({channel:'jhw-together',type:'state',state:e.detail.together},location.origin);});
room.addEventListener('lost',()=>{if(togetherOpen)$('classic-frame').contentWindow?.postMessage({channel:'jhw-together',type:'lost'},location.origin);});
const sharedMenu=document.createElement('dialog');sharedMenu.className='town-all-games';sharedMenu.setAttribute('aria-label','Play Together');sharedMenu.innerHTML='<form method="dialog"><button>Close</button></form><h2>Play Together</h2><p class="family-share-code"></p><p class="family-now"></p><div class="shared-options"></div><p>Join this family room on the other phone, iPad or computer. Keep the device that started the room open.</p>';document.body.append(sharedMenu);
const sharedChoices=[...Object.entries({basketball:['Basketball','One-on-one shooting, dribbling and steals.'],softball:['Softball','Pitch, bat, field and run the bases.'],fishing:['Fishing Together','Two rods, one lake. Catch five together.'],seesaw:['Seesaw Stars','Time your pushes to earn stars together.'],hide:['Hide & Seek','Hide in the meadow. Take turns seeking.'],swim:['Pool Party','Dive, swim and collect rings together.'],cook:['Family Kitchen','Make and serve recipes together.']}).map(([id,[name,description]])=>[name,description,'family-playpark.html#'+id]),['Bowling','Take turns on the same lane.','bowling'],['Family racing','Race each other on the same track.','arcade-new.html#family'],['Connect Four','Two players, one shared board.','together.html#four'],['Matching','Find pairs together.','together.html#match'],['Color Together','Draw on the same page.','together.html#color'],['Watch Together','Join the family movie at its current spot.','theater.html']];
for(const [name,detail,target]of sharedChoices){const b=document.createElement('button');b.textContent=name;const small=document.createElement('small');small.textContent=detail;b.append(small);b.onclick=async()=>{sharedMenu.close();if(target==='bowling'){if(!$('classic-frame-panel').classList.contains('hidden'))$('close-classic').click();await action('visit',{destination:'bowling'});}else openClassic(target);};sharedMenu.querySelector('.shared-options').append(b);}
const sharedShortcut=document.createElement('button');sharedShortcut.id='play-together-shortcut';sharedShortcut.textContent='Play Together';sharedShortcut.onclick=()=>{updateTogether(snapshot);sharedMenu.showModal();};
(townView?.root.querySelector('.dock-toolbar')||$('play')).append(sharedShortcut);
function updateTogether(state){sharedMenu.querySelector('.family-share-code').textContent='Family code: '+room.code;const watching=state.cinema?.members||[],bowling=state.bowling?.members.filter(p=>!p.npc)||[];sharedMenu.querySelector('.family-now').textContent=[watching.length?'At the movies: '+watching.map(p=>p.name).join(', '):'',bowling.length?'Bowling: '+bowling.map(p=>p.name).join(', '):''].filter(Boolean).join(' · ')||'Pick an activity, then have everyone open the same choice.';}
const sharedStyle=document.createElement('style');sharedStyle.textContent='#play-together-shortcut{background:#f9d477;color:#183d35;border:2px solid #fff4c3;font-weight:900;min-height:44px;padding:8px 12px;border-radius:14px;white-space:nowrap}.shared-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.shared-options button{padding:16px;background:#fff0c9;color:#183d35;border:2px solid #d3b571;border-radius:16px;font:800 18px system-ui;min-height:95px}.shared-options small{display:block;font:13px/1.4 system-ui;margin-top:6px}.family-share-code{font-size:23px;font-weight:bold}.family-now{font-size:14px}@media(max-width:600px){.dock-toolbar .town-tip{display:none}#play-together-shortcut{font-size:12px}.shared-options button{font-size:15px;padding:10px}}';document.head.append(sharedStyle);

let playparkOpen=false;
function leavePark(){if(playparkOpen){playparkOpen=false;api('playpark',{op:'leave'}).catch(()=>{});}}
window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-playpark'||!new URL($('classic-frame').src,location.href).pathname.endsWith('/family-playpark.html')||!me)return;
 try{if(e.data.type==='context'){const state=await api('playpark',{op:'join',game:e.data.game});playparkOpen=true;e.source.postMessage({channel:'jhw-playpark',type:'context',id:me.id,state},location.origin);}else if(e.data.type==='command'&&playparkOpen){const state=await api('playpark',e.data.body);if(state.game)e.source.postMessage({channel:'jhw-playpark',type:'state',state},location.origin);}}
 catch(error){e.source.postMessage({channel:'jhw-playpark',type:'error',error:error.message},location.origin);}
});
room.addEventListener('snapshot',e=>{if(playparkOpen)$('classic-frame').contentWindow?.postMessage({channel:'jhw-playpark',type:'state',state:e.detail.playpark},location.origin);});
room.addEventListener('lost',()=>{playparkOpen=false;});

// Church stays inside the existing activity frame and returns to the same family room.
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-church')return;if(e.data.type==='exit')$('close-classic').click();});

// Halli's sensory play keeps the parent room alive; frame messages are source-checked.
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('classic-frame').contentWindow||e.data?.channel!=='jhw-bubbles'||!new URL($('classic-frame').src,location.href).pathname.endsWith('/bubble-garden.html'))return;if(e.data.type==='active'){$('classic-frame-panel').style.paddingTop='0';$('close-classic').hidden=true;}if(e.data.type==='exit')$('close-classic').click();});
