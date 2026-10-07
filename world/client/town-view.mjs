import {PLACE_LINKS,PLACE_NOTES,activitiesForPlace} from './place-activities.mjs?v=places-1';
import {GAME_PAGES} from './game-catalog.mjs?v=all-games-1';
import {TOWN_PLACES,SCENES} from './town-destinations.mjs?v=drive-1';
import {drawPortrait} from './characters.mjs';
const paths={
 film:'M3 5h20v16H3ZM8 5v16M18 5v16M3 10h5M3 16h5M18 10h5M18 16h5',
 home:'M3 12 12 4 21 12M6 10v11h12V10M10 21v-7h4v7',
 leaf:'M20 3C4 2 1 11 7 17c6 6 14 0 13-14ZM5 21 16 8',
 bubbles:'M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM22 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM19 3v3M17.5 4.5h3',
 bowling:'M6 3h4v3L9 9l3 7q2 6-4 6t-4-6l3-7-1-3ZM6 10h4M23 16a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM17 14h.1M20 14h.1M18 17h.1',
 truck:'M3 8h10v10H3ZM13 11h5l3 5v2h-8M8 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM22 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 pencil:'m4 16 12-12 4 4L8 20l-5 1ZM13 7l4 4M4 16l4 4',
 car:'M3 12l3-7h12l3 7v7H3ZM3 12h18M6 16h2M16 16h2M5 19v3M19 19v3',
 game:'M8 8h8c5 0 6 7 5 11-1 3-4 1-6-2H9c-2 3-5 5-6 2-1-4 0-11 5-11ZM7 10v6M4 13h6M16 12h.1M19 15h.1',
 book:'M12 6Q6 2 2 5v15q5-3 10 0 5-3 10 0V5q-4-3-10 1ZM12 6v14',
 heart:'M12 21 3 12C-3 3 8-1 12 7c4-8 15-4 9 5Z',
};
export const icon=name=>`<svg viewBox="0 0 26 26" aria-hidden="true"><path d="${paths[name]||paths.game}"/></svg>`;
export class TownView{
 constructor(parent,{visit,art,classic,say}){
  this.visit=visit;this.art=art;this.classic=classic;this.say=say;this.key=null;this.playersKey='';
  this.root=document.createElement('section');this.root.id='illustrated-town';this.root.setAttribute('aria-label','Explore Jace and Halli’s town');
  this.root.innerHTML='<div class="town-viewport" tabindex="0" aria-label="Town scene. Drag to look around."><div class="town-picture"><img draggable="false" alt=""><div class="town-presence" aria-label="Family playing here"></div></div></div><footer class="town-footer"><div class="dock-toolbar"><div class="dock-tabs" role="group" aria-label="Choose links"><strong>Our places</strong></div><p class="town-tip">Choose a picture below</p><button class="town-fit">See whole town</button></div><nav class="town-dock" aria-label="Places in our world"></nav></footer>';
  // Persistent theater entrance lives inside the illustrated town itself,
  // above the picture dock so it remains reachable on landscape iPads.
  this.watchMovie=document.createElement('button');
  this.watchMovie.type='button';
  this.watchMovie.className='town-watch-movie';
  this.watchMovie.textContent='🎬 WATCH JACE & HALLI’S MOVIE';
  this.watchMovie.setAttribute('aria-label','Watch Jace and Halli’s World movie');
  this.watchMovie.addEventListener('click',()=>this.classic('theater.html'));
  this.watchMovie.hidden=true;
  this.root.append(this.watchMovie);
  this.arcadeActions=document.createElement('nav');this.arcadeActions.className='town-arcade-actions';this.arcadeActions.setAttribute('aria-label','Play games in the bowling arcade');this.arcadeActions.hidden=true;
  for(const spot of SCENES.arcade.spots){const b=this.button(spot.label,spot.icon,()=>{if(spot.visit)this.visit(spot.visit);else if(spot.file)this.classic(spot.file);});b.className='town-arcade-game';this.arcadeActions.append(b);}
  this.root.append(this.arcadeActions);
  parent.prepend(this.root);this.viewport=this.root.querySelector('.town-viewport');this.picture=this.root.querySelector('.town-picture');this.img=this.root.querySelector('img');this.presence=this.root.querySelector('.town-presence');this.tip=this.root.querySelector('.town-tip');this.fitButton=this.root.querySelector('.town-fit');this.dock=this.root.querySelector('.town-dock');
  this.fitButton.onclick=()=>{this.fitted=!this.fitted;this.layout();};
  this.allGames=document.createElement('dialog');this.allGames.className='town-all-games';this.allGames.setAttribute('aria-label','All games and activities');
  this.allGames.innerHTML='<form method="dialog"><button>Close</button></form><h2>Activities</h2><p class="place-note"></p><label>Find a game <input type="search" placeholder="Search games"></label><div class="town-choices"></div><p class="game-search-empty" hidden>No games found. Try another name.</p>';
  this.root.append(this.allGames);
  for(const entry of this.gameEntries()){const b=this.button(entry.label,entry.icon,()=>{this.allGames.close();this.launch(entry);});b.dataset.label=entry.label.toLowerCase();this.allGames.querySelector('.town-choices').append(b);}
  this.allGames.querySelector('input').oninput=e=>{let count=0;for(const b of this.allGames.querySelectorAll('.town-choices button')){b.hidden=!b.dataset.label.includes(e.target.value.trim().toLowerCase());if(!b.hidden)count++;}this.allGames.querySelector('.game-search-empty').hidden=count>0;};

  this.showDock('places');
  this.viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;this.drag={x:e.clientX,y:e.clientY,left:this.viewport.scrollLeft,top:this.viewport.scrollTop};this.moved=false;});
  this.viewport.addEventListener('pointermove',e=>{if(!this.drag||e.buttons!==1)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.hypot(dx,dy)>7){this.moved=true;this.viewport.scrollLeft=this.drag.left-dx;this.viewport.scrollTop=this.drag.top-dy;}});
  this.viewport.addEventListener('click',e=>{if(this.moved){e.preventDefault();e.stopPropagation();this.moved=false;}},true);
  this.viewport.addEventListener('pointerup',()=>this.drag=null);this.viewport.addEventListener('pointerleave',()=>this.drag=null);
  this.observer=new ResizeObserver(()=>this.layout());this.observer.observe(this.viewport);
 }
 button(label,symbol,fn){const b=document.createElement('button');b.innerHTML=icon(symbol);const span=document.createElement('span');span.textContent=label;b.append(span);b.setAttribute('aria-label',label);b.onclick=fn;return b;}
 gameEntries(){
  const entries=new Map(GAME_PAGES.map(entry=>[entry.file,entry]));
  for(const scene of Object.values(SCENES))for(const spot of scene.spots){if(spot.visit&&spot.visit!=='bowling')continue;entries.set(spot.file||spot.art||spot.visit,{...spot,scene});}
  return [...entries.values()].sort((a,b)=>a.label.localeCompare(b.label));
 }
 launch(entry){if(entry.place){this.openPlace(entry.place);return;}this.say(entry.label);if(entry.visit)this.visit(entry.visit);else if(entry.art)this.art(entry.art);else this.classic(entry.file);}
 openPlace(id){
  const place=PLACE_LINKS.find(p=>p.id===id);this.say(place.name);
  if(id==='theater'){this.visit('theater');this.classic('theater.html');return;}
  if(place.scene&&!['world','bubbles'].includes(place.scene))this.visit(id);
  const items=id==='classic'?this.gameEntries():activitiesForPlace(id);
  if(id==='arcade')items.unshift({label:'Let’s bowl',icon:'bowling',visit:'bowling'});
  if(id==='garden')items.unshift({label:'Play in the bubble garden',icon:'bubbles',visit:'garden'});
  if(id==='yard')items.unshift({label:'Mow our backyard',icon:'leaf',visit:'yard'});
  this.allGames.querySelector('h2').textContent=place.name+(id==='classic'?' — all games':'');
  this.allGames.querySelector('.place-note').textContent=PLACE_NOTES[id]||'Choose an activity to play.';
  const choices=this.allGames.querySelector('.town-choices');choices.replaceChildren();
  for(const entry of items){const b=this.button(entry.label,entry.icon,()=>{this.allGames.close();this.launch(entry);});b.dataset.label=entry.label.toLowerCase();choices.append(b);}
  this.allGames.querySelector('input').value='';this.allGames.querySelector('label').hidden=items.length<10;this.allGames.querySelector('.game-search-empty').hidden=true;
  this.allGames.setAttribute('aria-label',place.name+' activities');this.allGames.showModal();
 }
 showDock(mode){
  this.dockMode=mode;this.dock.replaceChildren();this.dock.scrollLeft=0;
  this.dock.setAttribute('aria-label',mode==='places'?'Places in our world':'Games and activities');
  const entries=PLACE_LINKS.map(p=>({label:p.name,icon:p.icon,place:p.id,scene:SCENES[p.scene],image:p.id==='garden'?'bubbles':p.id==='yard'?'backyard':null,x:p.x,y:p.y}));
  for(const entry of entries){
   const b=this.button(entry.label,entry.icon,()=>{this.launch(entry);});
   b.className='dock-item';if(entry.place)b.dataset.destination=entry.place;
   const thumb=document.createElement('img');thumb.alt='';thumb.draggable=false;
   thumb.src=entry.scene||entry.image?new URL('../assets/scenes/'+(entry.image?entry.image+'-v1.webp':entry.scene.asset||entry.scene.image+'-v1.webp'),import.meta.url):new URL('../assets/town/approved-world-v1.webp',import.meta.url);
   if(!entry.scene&&!entry.image)thumb.style.objectPosition=entry.x+'% '+entry.y+'%';
   b.prepend(thumb);const tooltip=document.createElement('span');tooltip.className='dock-tooltip';tooltip.textContent=entry.label;tooltip.setAttribute('aria-hidden','true');b.append(tooltip);this.dock.append(b);
  }
  this.markDock();
 }
 markDock(){for(const b of this.dock.children){if(b.dataset.destination===this.destination)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');}}
 layout(){if(!this.ratio||!this.viewport.clientWidth)return;const w=this.viewport.clientWidth,h=this.viewport.clientHeight;const width=this.fitted?Math.min(w,h*this.ratio):Math.max(w,h*this.ratio);this.root.dataset.fitted=String(Boolean(this.fitted));this.picture.style.width=width+'px';this.picture.style.height=width/this.ratio+'px';this.picture.style.margin=this.fitted?'auto':'0 auto';this.fitButton.textContent=this.fitted?'Look closer':'See whole '+(this.key==='world'?'town':'room');if(this.recenter){this.viewport.scrollLeft=(width-w)/2;this.recenter=false;}}
 update(snapshot,me){
  const shown=me&&['world','home','arcade','arena','school','garage','classic','theater'].includes(me.scene)&&me.vehicle!=='mower';this.root.hidden=!shown;if(!shown)return;this.watchMovie.hidden=me.scene!=='theater';this.arcadeActions.hidden=me.scene!=='arcade';
  this.destination=me.destination;this.markDock();const key=me.scene;if(this.key!==key){this.key=key;this.playersKey='';this.fitted=false;this.recenter=true;
   const scene=SCENES[key];this.ratio=scene?.ratio||1672/941;this.img.src=key==='world'?new URL('../assets/town/approved-world-v1.webp',import.meta.url):new URL('../assets/scenes/'+(scene.asset||scene.image+'-v1.webp'),import.meta.url);this.img.alt=scene?.title||'Jace and Halli’s World: our connected town';this.tip.textContent='Choose a picture below';
   this.layout();

  }
  const visible=snapshot.players||[];const hash=visible.map(p=>p.id+':'+p.scene+':'+p.destination).join();if(hash===this.playersKey)return;this.playersKey=hash;this.presence.replaceChildren();
  visible.forEach((p,i)=>{if(key!=='world'&&p.scene!==key)return;const at=TOWN_PLACES.find(d=>d.id===p.destination);const badge=document.createElement('div');badge.className='town-player';badge.title=p.name+' · '+(at?.name||'Our town');badge.setAttribute('aria-label',badge.title);badge.style.left=(key==='world'?(at?.x||49):50)+i*2.5+'%';badge.style.top=(key==='world'?Math.min(94,(at?.y||65)+9):91)+'%';const portrait=document.createElement('canvas');portrait.width=90;portrait.height=120;drawPortrait(portrait,p.profile);const name=document.createElement('span');name.textContent=p.name;badge.append(portrait,name);this.presence.append(badge);});
 }
}
