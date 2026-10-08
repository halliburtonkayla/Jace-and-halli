import {createGame as basketball,action,updateGame} from './vendor/sports.mjs';
import {createGame as softball,act,tick as softballTick} from './vendor/softball.mjs';
export const GAMES={basketball:'Basketball',softball:'Softball',fishing:'Fishing Together',seesaw:'Seesaw Stars',hide:'Hide & Seek',swim:'Pool Party',cook:'Family Kitchen'};
export const SPOTS=[{x:-7,z:-5,name:'Big barrel',kind:'barrel'},{x:5,z:-6,name:'Berry bush',kind:'bush'},{x:-5,z:3,name:'Hay bales',kind:'hay'},{x:7,z:3,name:'Little barrel',kind:'barrel'},{x:0,z:-8,name:'Flower bush',kind:'bush'},{x:0,z:4,name:'Garden hut',kind:'hut'}];
export const HIDE_BOUND=28;
SPOTS.push(...[[-20,-18,'Orchard barrel','barrel'],[-14,-21,'Apple grove','bush'],[-23,-8,'Orchard hut','hut'],[-16,-10,'Tall hay','hay'],[17,-20,'Far meadow hut','hut'],[23,-14,'Meadow barrel','barrel'],[13,-13,'Wildflower bush','bush'],[20,-5,'Golden hay','hay'],[-20,15,'Garden barrel','barrel'],[-12,21,'Garden bush','bush'],[-23,23,'Garden cottage','hut'],[-14,12,'Hay corner','hay'],[14,15,'Picnic barrel','barrel'],[23,22,'Picnic hut','hut'],[21,11,'Rose bush','bush'],[10,23,'Picnic hay','hay'],[0,-22,'North barrel','barrel'],[0,21,'South bush','bush']].map(([x,z,name,kind])=>({x,z,name,kind})));
export const STATIONS=[{x:-6,z:-4,name:'Ingredients'},{x:0,z:-4,name:'Mixing counter'},{x:6,z:-4,name:'Stove'},{x:5,z:4,name:'Serving table'}];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const HEDGES=[{x:-3,z:-2,w:1.1,d:6},{x:3,z:2,w:1.1,d:5},{x:0,z:-7,w:5,d:.8}];
HEDGES.push(...[{x:-12,z:-15,w:8,d:1.2},{x:13,z:-8,w:1.2,d:10},{x:-17,z:18,w:1.2,d:8},{x:17,z:19,w:7,d:1.2},{x:-8,z:14,w:1.2,d:7},{x:9,z:-20,w:1.2,d:6}]);
// Occlusion is decided by the host, before sending each player's view.
export function hideOccluded(viewer,target){
 if(target.inside!=null||(target.hidden!=null&&SPOTS[target.hidden].kind==='bush'))return true;
 const dx=target.x-viewer.x,dz=target.z-viewer.z,len=dx*dx+dz*dz;
 for(const o of SPOTS){if(o.kind==='bush'&&target.stance!=='crouch')continue;const t=clamp(((o.x-viewer.x)*dx+(o.z-viewer.z)*dz)/(len||1),0,1);if(t>.01&&Math.hypot(viewer.x+t*dx-o.x,viewer.z+t*dz-o.z)<(o.kind==='hut'?1.3:o.kind==='hay'?1.2:1))return true;}
 for(const o of HEDGES){let lo=0,hi=1;for(const [a,d,c,r] of [[viewer.x,dx,o.x,o.w/2+.12],[viewer.z,dz,o.z,o.d/2+.12]]){if(Math.abs(d)<1e-8){if(Math.abs(a-c)>r){hi=-1;break;}}else{const u=(c-r-a)/d,v=(c+r-a)/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));}}if(lo<=hi&&hi>.01&&lo<.99)return true;}return false;
}
const recipes=[['Pancakes',['Flour','Milk','Eggs']],['Pizza',['Dough','Tomato','Cheese']],['Fruit salad',['Apple','Banana','Berries']]];
export class ParkSession {
 constructor(){this.time=0;this.members=new Map();this.games={};for(const game of Object.keys(GAMES))this.reset(game);}
 reset(game){this.games[game]=game==='basketball'?basketball(game):game==='softball'?softball({innings:1}):game==='hide'?{phase:'waiting',seeker:null,round:0,left:0,message:'Bring a friend, then start a round.'}:game==='seesaw'?{angle:0,velocity:0,energy:0,stars:0,message:'Pump when your seat is low. Fill the star meter together!'}:game==='fishing'?{caught:0,message:'Cast, wait for a bite, then hook and reel. Catch five together.'}:game==='swim'?{rings:Array.from({length:8},(_,i)=>({x:Math.cos(i*Math.PI/4)*5,z:Math.sin(i*Math.PI/4)*3})),score:0,message:'Collect all eight floating rings together.'}:{recipe:0,step:0,work:0,heat:0,flipped:false,served:0,message:'Bring ingredients to our shared recipe.'};}
 group(game){return [...this.members.values()].filter(p=>p.game===game);}
 leave(id){const p=this.members.get(id);if(!p)return;this.members.delete(id);if(p.game==='cook'&&p.carry==='plate')this.games.cook.step=4;if(p.game==='hide'){this.games.hide.phase='waiting';this.games.hide.message='A player left. Start a new round when everyone is ready.';}if(['basketball','softball'].includes(p.game))this.reset(p.game);}
 request(p,b){
  if(b.op==='join'){if(!Object.hasOwn(GAMES,b.game))throw Error('Choose a game.');if(this.members.get(p.id)?.game!==b.game){const group=this.group(b.game);if(group.length>=2&&['basketball','softball','seesaw'].includes(b.game))throw Error('Both seats are taken. Choose another shared game.');this.leave(p.id);this.members.set(p.id,{id:p.id,name:p.name,profile:p.profile,game:b.game,x:group.length*2-1,z:1,heading:0,input:{x:0,z:0},inputAt:0,cool:0,hidden:null,inside:null,stance:'stand',found:false,mode:'swim',animation:0,contribution:0,fish:{phase:'ready',progress:0,tension:.2,t:0,reeling:false}});if(['basketball','softball'].includes(b.game))this.reset(b.game);}return this.snapshot(p.id);}
  if(b.op==='leave'){this.leave(p.id);return this.snapshot(p.id);}
  const m=this.members.get(p.id);if(!m)throw Error('Open a shared activity first.');const g=this.games[m.game],group=this.group(m.game),side=group.indexOf(m);
  if(b.op==='input'){if(!Number.isFinite(b.x)||!Number.isFinite(b.z)||Math.abs(b.x)>1||Math.abs(b.z)>1)throw Error('Invalid movement.');m.input={x:b.x,z:b.z};m.inputAt=this.time;return {ok:true};}
  if(b.op==='reel'){m.fish.reeling=b.down===true;m.fish.reelAt=this.time;return {ok:true};}
  if(b.op!=='action'||typeof b.name!=='string')throw Error('Unknown play action.');
  if(this.time<m.cool)return {ok:true};m.cool=this.time+.16;
  if(m.game==='basketball'){if(!['primary','secondary','restart'].includes(b.name))throw Error('Choose a basketball control.');this.games.basketball=action(g,side,b.name);}
  if(m.game==='softball'){if(b.name==='restart')this.reset('softball');else if(['pitch','swing','style','advance','hold','switch','kind-fast','kind-change','kind-drop','throw-1','throw-2','throw-3','throw-4'].includes(b.name))act(g,side,b.name,{pitchId:b.pitchId,pitchT:b.pitchT});else throw Error('Choose a softball control.');}
  if(m.game==='hide'){
   if(b.name==='start'){if(group.length<2)throw Error('A friend needs to join Hide & Seek first.');if(['hiding','seeking'].includes(g.phase))throw Error('Finish this round first.');g.seeker=group[g.round%group.length].id;g.round++;g.phase='hiding';g.left=25;g.message='Hiders: explore the meadow and find cover! Seeker: count to twenty-five.';group.forEach((q,i)=>{q.hidden=null;q.inside=null;q.stance='stand';q.found=false;q.x=i*2-1;q.z=6;});}
   if(['crouch','enter','exit','hide'].includes(b.name)&&!m.found){
    if(m.id===g.seeker&&g.phase==='hiding')throw Error('Finish counting first.');
    if(b.name==='exit'){if(m.inside!=null){const o=SPOTS[m.inside];m.x=o.x;m.z=o.z+1.8;}m.inside=null;m.hidden=null;m.stance='stand';}
    else if(m.inside!=null)throw Error('Tap Come out before moving.');
    else if(b.name==='crouch'){m.stance=m.stance==='crouch'?'stand':'crouch';m.hidden=null;}
    else {if(m.id===g.seeker&&['hiding','seeking'].includes(g.phase))throw Error('You are the seeker. Search for your friends!');const inside=b.name==='enter';const i=SPOTS.findIndex(o=>distance(o,m)<2.6&&(inside?['barrel','hut'].includes(o.kind):true));if(i<0)throw Error(inside?'Walk close to a barrel or hut to get inside.':'Walk close to a bush, hay stack, barrel or hut.');const o=SPOTS[i];if(group.some(q=>q.id!==m.id&&q.inside===i))throw Error('This hiding spot is occupied. Try another.');m.hidden=i;m.stance='crouch';if(['barrel','hut'].includes(o.kind)){m.inside=i;m.x=o.x;m.z=o.z;}else if(o.kind==='bush'){m.x=o.x;m.z=o.z;} }
   }
   if(b.name==='search'&&m.id===g.seeker&&g.phase==='seeking'){let found=false;for(const q of group)if(q.id!==m.id&&!q.found&&distance(q,m)<2.8){q.found=true;q.hidden=null;if(q.inside!=null){q.z=SPOTS[q.inside].z+1.8;q.inside=null;}q.stance='stand';found=true;}g.message=found?'Found you!':'Nobody here. Try another hiding spot.';}
  }
  if(m.game==='fishing'){
   const f=m.fish;if(b.name==='cast'&&['ready','caught','miss'].includes(f.phase)){Object.assign(f,{phase:'cast',t:0,progress:0,tension:.22,reeling:false,x:clamp(m.x,-8,8),z:-8-Math.random()*8,bite:2+Math.random()*3});}
   if(b.name==='hook'){if(f.phase==='bite'){f.phase='fight';f.t=0;}else if(['waiting','cast'].includes(f.phase)){f.phase='miss';f.t=0;}}
  }
  if(m.game==='seesaw'&&b.name==='pump'){if(group.length<2)throw Error('A friend needs to join the other seat.');if(this.time<(m.pumpAt||0))return {ok:true};m.pumpAt=this.time+.7;const low=side===0?g.angle>-.08:g.angle<.08;if(low){g.velocity+=(side===0?-.65:.65);g.energy+=.14;m.contribution++;g.message='Good push! Now help the other seat.';}else g.message='Wait until your seat is low, then pump.';}
  if(m.game==='swim'){
   if(b.name==='under'){m.mode=m.mode==='under'?'swim':'under';m.animation=m.mode==='under'?5:0;}
   if(b.name==='circle'){m.mode='circle';m.animation=5;m.center={x:clamp(m.x,-4,4),z:clamp(m.z,-2,2)};}
   if(b.name==='dive'){if(distance(m,{x:0,z:5})>3)throw Error('Swim to the diving board at the near end.');m.mode='dive';m.animation=1.5;m.x=0;m.z=5;}
   if(b.name==='restart'&&!g.rings.length)this.reset('swim');
  }
  if(m.game==='cook'&&b.name==='put-down'&&m.carry!=='plate')m.carry=null;
  if(m.game==='cook'&&b.name.startsWith('ingredient-')){const i=Number(b.name.slice(11));if(!Number.isInteger(i)||i<0||i>2)throw Error('Choose an ingredient.');if(g.step>2)throw Error('Our ingredients are ready.');if(distance(m,STATIONS[0])>2.7)throw Error('Walk to the ingredients refrigerator.');if(i!==g.step)throw Error('The recipe needs '+recipes[g.recipe][1][g.step]+' next.');m.carry=recipes[g.recipe][1][i];m.actionUntil=this.time+.7;}
  if(m.game==='cook'&&b.name==='work'){
   const station=g.step<=3?1:g.step===4?2:3;
   if(distance(m,STATIONS[station])>2.7)throw Error('Move to '+STATIONS[station].name+'.');
   m.actionUntil=this.time+.65;
   if(g.step<3){if(m.carry!==recipes[g.recipe][1][g.step])throw Error('Pick up '+recipes[g.recipe][1][g.step]+' at the refrigerator first.');m.carry=null;g.step++;m.contribution++;}
   else if(g.step===3){g.work++;m.contribution++;if(g.work>=6)g.step=4;}
   else if(g.step===4){if(g.recipe===2||(g.heat>=5&&g.flipped)){g.step=5;m.carry='plate';m.contribution++;g.message='Carry the plate to the serving table.';}else if(g.heat>=2.5&&!g.flipped){g.flipped=true;g.message=g.recipe===0?'Pancakes flipped! Let the other side cook.':'Pizza turned! Let it finish baking.';}else{g.heat=Math.max(.01,g.heat);g.message='Cooking. Watch the pan and turn it halfway through.';}}
   else {if(m.carry!=='plate')throw Error('The chef holding the plate needs to serve it.');m.carry=null;g.served++;g.recipe=(g.recipe+1)%recipes.length;g.step=0;g.work=0;g.heat=0;g.flipped=false;m.contribution++;g.message='Served together! Next recipe is ready.';}

  }
  return this.snapshot(p.id);
 }
 tick(dt){dt=clamp(dt,0,.1);this.time+=dt;
  for(const game of Object.keys(GAMES)){const group=this.group(game),g=this.games[game];if(!group.length)continue;
   const inputs=group.map(p=>this.time-p.inputAt<.5?p.input:{x:0,z:0});const keys=inputs.map(i=>({left:i.x<-.15,right:i.x>.15,up:i.z<-.15,down:i.z>.15}));
   if(['basketball','softball'].includes(game)){g.cpu=group.length===1;for(let left=dt;left>0;left-=.02)(game==='basketball'?updateGame:softballTick)(g,keys,Math.min(.02,left));continue;}
   group.forEach((p,i)=>{const input=inputs[i],moving=Math.hypot(input.x,input.z)>.12;p.moving=moving;
    if(game!=='seesaw'&&!(game==='hide'&&g.phase==='hiding'&&p.id===g.seeker)&&!(game==='hide'&&(p.found||p.inside!=null))){
     if(moving){p.hidden=null;if(p.mode==='circle'){p.mode='swim';p.animation=0;}p.heading=Math.atan2(input.x,input.z);const n=Math.max(1,Math.hypot(input.x,input.z)),speed=game==='swim'?2.5:game==='hide'&&p.stance==='crouch'?1.8:4;const ox=p.x,oz=p.z;p.x=clamp(p.x+input.x/n*speed*dt,game==='hide'?-HIDE_BOUND:-9,game==='hide'?HIDE_BOUND:9);p.z=clamp(p.z+input.z/n*speed*dt,game==='hide'?-HIDE_BOUND:-9,game==='hide'?HIDE_BOUND:7);
      if(game==='hide'){for(const o of HEDGES){if(Math.abs(p.x-o.x)<o.w/2+.3&&Math.abs(p.z-o.z)<o.d/2+.3){if(Math.abs(ox-o.x)>=o.w/2+.3)p.x=ox;else p.z=oz;}}for(const o of SPOTS){const d=distance(p,o),r=o.kind==='hut'?1.2:o.kind==='barrel'?.95:.85;if(d<r&&d>.001){p.x=o.x+(p.x-o.x)/d*r;p.z=o.z+(p.z-o.z)/d*r;}}}
      if(game==='cook')for(const o of STATIONS)if(Math.abs(p.x-o.x)<1.8&&Math.abs(p.z-o.z)<1.05){if(Math.abs(ox-o.x)>=1.8)p.x=ox;else p.z=oz;}}
    }
    if(game==='fishing'){p.z=5;const f=p.fish;f.t+=dt;if(this.time-(f.reelAt||0)>.5)f.reeling=false;if(f.phase==='cast'&&f.t>.8){f.phase='waiting';f.t=0;}if(f.phase==='waiting'&&f.t>f.bite){f.phase='bite';f.t=0;}if(f.phase==='bite'&&f.t>2.5){f.phase='miss';f.t=0;}if(f.phase==='fight'){f.tension=clamp(f.tension+dt*(f.reeling?.32:-.43),0,1);f.progress=clamp(f.progress+dt*(f.reeling?.23:-.025),0,1);if(f.tension>=1){f.phase='miss';f.t=0;}else if(f.progress>=1){f.phase='caught';f.t=0;f.species=['Bluegill','Bass','Trout','Perch'][Math.floor(Math.random()*4)];g.caught++;p.contribution++;g.message=g.caught>=5?'Five fish together! Keep fishing or explore another game.':p.name+' caught a '+f.species+'!';}}}
    if(game==='swim'){p.x=clamp(p.x,-7,7);p.z=clamp(p.z,-5,5);if(p.animation>0){p.animation-=dt;if(p.mode==='circle'){p.heading=(5-p.animation)*Math.PI*2/2.5+Math.PI/2;p.x=p.center.x+Math.sin((5-p.animation)*Math.PI*2/2.5)*1.8;p.z=p.center.z+Math.cos((5-p.animation)*Math.PI*2/2.5)*1.8;}if(p.mode==='dive')p.z=5-(1.5-p.animation)*4;if(p.animation<=0)p.mode='swim';}g.rings=g.rings.filter(r=>{if(distance(r,p)<1){g.score++;p.contribution++;return false;}return true;});if(!g.rings.length)g.message='All eight rings collected together!';}
   });
   if(game==='hide'&&['hiding','seeking'].includes(g.phase)){g.left-=dt;if(g.phase==='hiding'&&g.left<=0){g.phase='seeking';g.left=120;g.message='Ready or not, here I come! Search near each hiding spot.';}if(g.phase==='seeking'){const seeker=group.find(p=>p.id===g.seeker);for(const p of group)if(p.id!==g.seeker&&!hideOccluded(seeker,p)&&distance(p,seeker)<1.25)p.found=true;if(group.filter(p=>p.id!==g.seeker).every(p=>p.found)){g.phase='done';g.message='Everyone found! Switch roles for the next round.';}else if(g.left<=0){g.phase='done';g.message='Hiders win! Switch roles for the next round.';}}}
   if(game==='seesaw'){g.velocity+=(-g.angle*2-g.velocity*.6)*dt;g.angle=clamp(g.angle+g.velocity*dt,-.5,.5);if(Math.abs(g.angle)>=.5)g.velocity*=-.4;if(g.energy>=1){g.energy-=1;g.stars++;g.message=g.stars>=5?'Five stars together! Keep swinging!':'You earned a star together!';}}
   if(game==='cook'&&g.step===4&&g.heat>0)g.heat=Math.min(5,g.heat+dt);
  }
 }
 snapshot(viewer){const mine=this.members.get(viewer);if(!mine)return {game:null,members:[]};const g=this.games[mine.game];const members=this.group(mine.game).map(p=>{const {input,inputAt,cool,pumpAt,center,fish,...safe}=p;const out={...safe,fish:{...fish}};delete out.fish.reelAt;delete out.fish.bite;if(mine.game==='hide'&&p.id!==viewer&&p.id!==g.seeker&&!p.found&&['hiding','seeking'].includes(g.phase)){out.hidden=null;out.inside=null;if(g.phase==='hiding'||hideOccluded(mine,p)){delete out.x;delete out.z;delete out.heading;out.concealed=true;}}return out;});return structuredClone({game:mine.game,time:this.time,side:members.findIndex(p=>p.id===viewer),members,state:g,recipe:mine.game==='cook'?recipes[g.recipe]:null});}
}
