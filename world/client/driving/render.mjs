import {ROADS,FIELD,cellCenter} from './world.mjs?v=drive-1';
import {drawCar} from '../racing/render.mjs?v=race-1';
const TAU=Math.PI*2;
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fill();};
const round=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
function shade(hex,n){const v=parseInt(hex.slice(1),16);return '#'+[v>>16,(v>>8)&255,v&255].map(c=>Math.min(255,Math.max(0,Math.round(c*n))).toString(16).padStart(2,'0')).join('');}
export class WorldRenderer {
 constructor(canvas,game){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.game=game;this.static=[];this.makeWorld();this.resize();}
 resize(){this.w=this.canvas.clientWidth;this.h=this.canvas.clientHeight;this.ratio=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.w*this.ratio);this.canvas.height=Math.round(this.h*this.ratio);this.c.setTransform(this.ratio,0,0,this.ratio,0,0);}
 face(points,color,list=this.static){const center=points.reduce((s,p)=>s.map((v,i)=>v+p[i]/points.length),[0,0,0]);list.push({points,color,center});}
 ground(x,z,w,d,color,y=.01,list=this.static){this.face([[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2]],color,list);list[list.length-1].ground=y;}
 box(x,y,z,w,h,d,color,list=this.static){const a=x-w/2,b=x+w/2,n=z-d/2,s=z+d/2,t=y+h;
  this.face([[a,y,s],[b,y,s],[b,t,s],[a,t,s]],color,list);this.face([[b,y,n],[a,y,n],[a,t,n],[b,t,n]],shade(color,.82),list);
  this.face([[a,y,n],[a,y,s],[a,t,s],[a,t,n]],shade(color,.8),list);this.face([[b,y,s],[b,y,n],[b,t,n],[b,t,s]],shade(color,.92),list);
  this.face([[a,t,n],[a,t,s],[b,t,s],[b,t,n]],shade(color,1.15),list);
 }
 roof(p){const {x,z,w,d,h}=p,r=h+6,ww=w/2+1.3,dd=d/2+1.2;
  this.face([[x-ww,h,z-dd],[x+ww,h,z-dd],[x+ww,r,z],[x-ww,r,z]],shade(p.roof,.9));
  this.face([[x-ww,r,z],[x+ww,r,z],[x+ww,h,z+dd],[x-ww,h,z+dd]],p.roof);
  this.face([[x-ww,h,z-dd],[x-ww,h,z+dd],[x-ww,r,z]],shade(p.color,.84));
  this.face([[x+ww,h,z+dd],[x+ww,h,z-dd],[x+ww,r,z]],p.color);
  for(let dz=-dd;dz<dd;dz+=1.5){const yy=h+6*(1-Math.abs(dz)/dd);this.face([[x-ww,yy+.05,z+dz],[x+ww,yy+.05,z+dz],[x+ww,yy+.05,z+dz+.08],[x-ww,yy+.05,z+dz+.08]],shade(p.roof,1.12));}
 }
 building(p){const {x,z,w,d,h}=p,front=z+d/2;
  this.ground(x,z,w+7,d+8,'#d8c9ac',.025);this.box(x,.1,z,w+1,.65,d+1,'#bba98e');this.box(x,.7,z,w,h-.7,d,p.color);
  this.box(x,h-.25,z,w+1,.5,d+1,'#fff0d3');this.box(x,1,z,w+.35,.4,d+.35,'#f4deb4');
  if(['home','barn','school'].includes(p.kind))this.roof(p);else this.box(x,h+.2,z,w+1,.7,d+1,p.roof);
  // Front windows: inset frames, glass, mullions, shutters and sill planters.
  for(const xx of [-w*.32,w*.32]){
   this.box(x+xx,2.5,front+.18,4.4,4.4,.4,'#fff1d5');this.box(x+xx,2.85,front+.43,3.6,3.7,.1,'#6fa7b5');
   this.face([[x+xx-1.6,6.35,front+.5],[x+xx+.8,6.35,front+.5],[x+xx-1.6,3.2,front+.5]],'#c4e4e4');
   this.box(x+xx,2.85,front+.54,.16,3.7,.07,'#ecedd5');this.box(x+xx,4.5,front+.54,3.6,.15,.07,'#ecedd5');
   for(const side of[-1,1])this.box(x+xx+side*2.65,2.5,front+.15,.8,4.4,.24,p.roof);
   this.box(x+xx,2,front+.7,4.6,.65,1.2,'#987450');
   for(let i=0;i<5;i++)this.static.push({type:'flower',center:[x+xx-1.8+i*.9,2.9,front+.8],size:.65,color:i%2?'#ec739c':'#fbe58c'});
  }
  this.box(x,.6,front+.2,4.7,6.3,.4,'#f8dfb9');this.box(x,.7,front+.45,3.9,5.9,.1,p.kind==='barn'?'#733e32':'#506f79');
  this.box(x,3,front+.52,3.1,2.7,.06,'#9dccd0');this.box(x+1.35,2.4,front+.61,.24,.55,.12,'#e9c46d');
  // Side windows add depth while driving around a building.
  for(const side of[-1,1])for(const zz of [-d*.27,d*.27]){
   this.box(x+side*(w/2+.1),3,z+zz,.18,3.5,4,'#fff1d5');this.box(x+side*(w/2+.23),3.3,z+zz,.1,2.9,3.4,'#81b3c2');
  }
  if(p.kind==='barn'){
   this.box(x,.7,front+.5,11,8,.3,'#763e32');this.box(x,1,front+.71,.3,7.5,.12,'#fff0c9');
   this.face([[x-5,1,front+.73],[x-4.6,1,front+.73],[x+5,8,front+.73],[x+4.6,8,front+.73]],'#f5deb5');
   this.face([[x+5,1,front+.74],[x+4.6,1,front+.74],[x-5,8,front+.74],[x-4.6,8,front+.74]],'#f5deb5');
  }else if(!['home','school'].includes(p.kind)){
   for(let i=0;i<12;i++){const a=x-w*.46+i*w*.92/12,b=a+w*.92/12;
    this.face([[a,7.4,front+.6],[b,7.4,front+.6],[b,6.6,front+3.7],[a,6.6,front+3.7]],i%2?'#fff5db':p.color);
    this.face([[a,6.6,front+3.7],[b,6.6,front+3.7],[b,6,front+3.7],[a,6,front+3.7]],i%2?'#e9d6b5':shade(p.color,.85));
   }
  }
  this.static.push({type:'sign',center:[x,h-1,front+.9],label:p.name,size:w*.93,color:p.kind==='cinema'?'#793b61':'#fff4d6'});
  if(p.kind==='cinema'||p.kind==='arcade'||p.kind==='race')for(let i=0;i<14;i++)this.static.push({type:'light',center:[x-w*.44+i*w*.88/13,7.9,front+1],size:.24,color:'#ffedaa'});
  if(p.kind==='home'){this.box(x-7,h,z+1,3,7,3,'#b67c61');for(const xx of [-w*.44,w*.44])this.box(x+xx,.2,front+5,.6,6,.6,'#f4deaf');this.ground(x,front+4,w+2,8,'#cda576',.1);}
  if(p.kind==='school'){this.box(x,h,z+2,6,5,4,'#efc589');this.static.push({type:'clock',center:[x,h+2.8,z+4.1],size:2});}
 }
 makeWorld(){const farm=this.game.mode==='farm';
  // Subdivided ground and road tiles give near-plane clipping stable depth.
  for(let x=-180;x<180;x+=20)for(let z=-180;z<180;z+=20)this.ground(x+10,z+10,20,20,((x+z)/20)%2?'#90b96a':'#94bc6e',-.06);
  if(!farm){
   for(const v of [...ROADS,-164,164])for(let t=-180;t<180;t+=12){
    this.ground(t+6,v,12,25,'#d2c5ab',0);this.ground(v,t+6,25,12,'#d2c5ab',0);
   }
   for(const v of [...ROADS,-164,164])for(let t=-180;t<180;t+=12){
    this.ground(t+6,v,12,19,'#69777a',.025);this.ground(v,t+6,19,12,'#69777a',.025);
    if(![...ROADS,-164,164].some(k=>Math.abs(t+6-k)<13)){this.ground(t+5,v,5,.22,'#f4e7b9',.05);this.ground(v,t+5,.22,5,'#f4e7b9',.05);}
   }
   for(const v of ROADS)for(const t of ROADS)for(let i=0;i<6;i++){this.ground(v-7+i*2.8,t+12,1.3,3,'#f0e9d2',.06);}
  }else{
   for(let z=-170;z<170;z+=14){this.ground(-40,z,11,14,'#c6a97c',.02);this.ground(37,z,11,14,'#c6a97c',.02);}
   for(let x=-160;x<160;x+=14)this.ground(x,61,14,13,'#c6a97c',.02);
   // A farm fence, opening at the driveway.
   for(let x=-86;x<100;x+=8){if(x>30&&x<78)continue;this.box(x,0,-78,.65,3.3,.65,'#eee0b9');for(const y of[1.1,2.3])this.box(x+4,y,-78,8,.28,.3,'#e9d8b0');}
   this.box(-61,0,-28,7,20,7,'#a4b6ad');this.static.push({type:'tree',center:[-61,24,-28],size:5,seed:3,silo:true});
  }
  for(const p of this.game.world.places)this.building(p);
  for(const t of this.game.world.trees)this.static.push({type:'tree',center:[t.x,0,t.z],size:t.h,seed:t.seed});
  // Lampposts and flower beds beside the town streets.
  if(!farm)for(const z of[-66,-42,24,48,118,143])for(const x of[-13,13]){
   this.box(x,0,z,.3,6,.3,'#576968');this.box(x,5.4,z,1,1.4,1,'#fff0ba');this.box(x,6.8,z,1.3,.25,1.3,'#596865');
  }
 }
 camera(){const p=this.game.player,farm=this.game.mode==='farm',cab=this.game.camera==='cab',back=cab?0:12;
  this.cx=p.x-Math.sin(p.angle)*back;this.cz=p.z+Math.cos(p.angle)*back;this.focal=Math.max(this.w*.77,this.h*.74);this.cy=cab?(farm?3.7:2.1):this.h*.42*back/this.focal;
  this.sin=Math.sin(p.angle);this.cos=Math.cos(p.angle);this.focal=Math.max(this.w*.77,this.h*.74);this.horizon=this.h*(cab?.43:.36);
 }
 toCamera(p){const dx=p[0]-this.cx,dz=p[2]-this.cz;return [dx*this.cos+dz*this.sin,p[1]-this.cy,dx*this.sin-dz*this.cos];}
 project(p){return [this.w/2+p[0]*this.focal/p[2],this.horizon-p[1]*this.focal/p[2]];}
 clip(points){let out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ai=a[2]>=.6,bi=b[2]>=.6;if(ai)out.push(a);if(ai!==bi){const t=(.6-a[2])/(b[2]-a[2]);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}return out;}
 sky(){const c=this.c,w=this.w,h=this.h,g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#74b9d9');g.addColorStop(.5,'#d1e6d0');g.addColorStop(1,'#9cbd77');c.fillStyle=g;c.fillRect(0,0,w,h);
  oval(c,w*.76,h*.16,25,25,'#fff3c9');
  for(let i=0;i<7;i++){const x=((i*.24-this.game.player.angle*.14)%1.6+1.6)%1.6*w-w*.3,y=h*(.1+i%3*.045);oval(c,x,y,w*.052,14,'#ffffff91');oval(c,x+w*.04,y+6,w*.075,11,'#ffffff91');}
  for(let row=0;row<3;row++){c.beginPath();c.moveTo(0,this.horizon+20);for(let i=0;i<=40;i++){const x=i*w/40,y=this.horizon-14-Math.abs(Math.sin(i*.16+row*2+this.game.player.angle))*h*(.13-row*.026);c.lineTo(x,y);}c.lineTo(w,this.horizon+20);c.fillStyle=['#86b8b2','#89b9a1','#98be82'][row];c.fill();}
 }
 sprite(o,p){const c=this.c,s=this.focal/p[2],xy=this.project(p),x=xy[0],y=xy[1],h=o.size*s;
  if(x<-h||x>this.w+h||h<.5)return;
  if(o.type==='tree'){
   if(o.silo){oval(c,x,y,h,h*.55,'#ced4bd');return;}
   oval(c,x,y,h*.38,h*.055,'#37614323');c.fillStyle='#8b7953';c.fillRect(x-h*.045,y-h*.65,h*.09,h*.65);
   const g=c.createRadialGradient(x-h*.14,y-h*.8,h*.02,x,y-h*.61,h*.45);g.addColorStop(0,'#bdcf80');g.addColorStop(.45,'#6da467');g.addColorStop(1,'#3d7857');
   oval(c,x-h*.19,y-h*.6,h*.3,h*.26,g);oval(c,x+h*.2,y-h*.65,h*.29,h*.29,g);oval(c,x,y-h*.88,h*.28,h*.25,g);
  }else if(o.type==='sign'){
   const hh=h*.17;round(c,x-h/2,y-hh/2,h,hh,Math.min(8,s*.5),o.color);c.strokeStyle='#a3896344';c.lineWidth=Math.max(1,s*.08);c.stroke();c.fillStyle=o.color==='#793b61'?'#fff3b8':'#3b525b';c.font=`900 ${Math.max(3,h*.061)}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText(o.label,x,y,h*.94);
  }else if(o.type==='clock'){oval(c,x,y,h,h,'#fff3ce');c.strokeStyle='#3c555c';c.lineWidth=Math.max(1,h*.07);c.beginPath();c.moveTo(x,y-h*.7);c.lineTo(x,y);c.lineTo(x+h*.45,y);c.stroke();}
  else if(o.type==='flower'){oval(c,x,y,h,h*.5,o.color);oval(c,x,y,h*.3,h*.3,'#e6ba57');}
  else if(o.type==='light'){oval(c,x,y,h,h,o.color);}
  else if(o.type==='wheat'){
   c.strokeStyle=o.grown?'#c79539':'#629447';c.lineWidth=Math.max(1,s*.07);
   for(let j=0;j<4;j++){const xx=x+(j-1.5)*s*.29,hh=h*(.8+(j%2)*.2);c.beginPath();c.moveTo(xx,y);c.lineTo(xx+s*.13,y-hh);c.stroke();
    if(o.grown){oval(c,xx+s*.13,y-hh,s*.16,hh*.23,'#efd477');oval(c,xx-s*.04,y-hh*.8,s*.14,hh*.17,'#e1bb55');}else{oval(c,xx-s*.1,y-hh*.65,s*.2,hh*.18,'#8ebe61');}}
  }
 }
 dynamic(){const list=[],g=this.game,p=g.player;
  if(g.mode==='farm'){
   for(let i=0;i<g.cells.length;i++){
    const q=cellCenter(i),v=g.cells[i],size=FIELD.size;this.ground(q.x,q.z,size-.12,size-.12,['#aa9970','#806044','#8b6949','#c0a573'][v],.055,list);
    for(let r=0;r<4;r++)this.ground(q.x-3+r*2,q.z,.18,size-.25,v===0?'#9c8862':v===3?'#d6b765':'#63482f',.065,list);
    if(v===2)for(let j=0;j<8;j++)list.push({type:'wheat',center:[q.x-3+(j%4)*2,0,q.z-2+Math.floor(j/4)*4],size:g.phase===1?.75:2.1,grown:g.phase>=2});
   }
   // Barn delivery pad.
   this.ground(46,53,15,13,'#e4cb77',.075,list);
   if(g.camera==='chase')this.tractor(list);
  }else{
   for(const place of g.world.places){const [x,z]=place.stop,color=g.visited.has(place.id)?'#81c2b1':'#eedf9e';this.ground(x,z,8,4,color,.07,list);}
   // Bubble Garden: floating dimensional bubbles over its real location.
   for(let i=0;i<9;i++)list.push({type:'light',center:[35+(i%3)*7,9+Math.sin(g.time*.6+i)*2+Math.floor(i/3)*3,59],size:1.2,color:['#bfe9efaa','#f4c5e599','#f4e6aeaa'][i%3]});
  }
  return list;
 }
 tractor(list){const p=this.game.player,local=[],x=0,z=0;
  this.box(x,1,z,2.7,1.4,5,'#45824a',local);this.box(0,1.9,-1.4,2.2,1.2,3,'#65a057',local);this.box(0,2.4,1,2.3,2.4,2.3,'#9ec3b3',local);this.box(0,4.8,1,3,.3,3,'#e6d7a1',local);
  for(const xx of[-1.7,1.7]){this.box(xx,.3,1.7,1,2.6,2.6,'#283b35',local);this.box(xx,.3,-1.8,.7,1.6,1.6,'#283b35',local);this.box(xx*1.32,1,1.7,.07,1.2,1.2,'#dac26a',local);}
  if(this.game.work&&this.game.phase<3){this.box(0,.3,4,8,.4,1.5,'#a77741',local);for(let x=-3.6;x<4;x+=1.2)this.box(x,0,4,.2,.8,2,'#586f6b',local);}
  if(this.game.phase>=2){this.box(0,.6,7,3.8,1,5,'#967349',local);for(const xx of[-2,2])this.box(xx,.1,7,.6,1.7,2,'#2f4037',local);for(let i=0;i<Math.ceil(this.game.load/9);i++)this.box((i%2-.5)*1.6,1.6,5.5+Math.floor(i/2)*1.4,1.4,.9,1.2,'#dfc06b',local);}
  for(const f of local){f.points=f.points.map(([xx,y,zz])=>[p.x+xx*Math.cos(p.angle)-zz*Math.sin(p.angle),y,p.z+xx*Math.sin(p.angle)+zz*Math.cos(p.angle)]);f.center=f.points.reduce((s,q)=>s.map((v,i)=>v+q[i]/f.points.length),[0,0,0]);list.push(f);}
 }
 cockpit(){const c=this.c,w=this.w,h=this.h,farm=this.game.mode==='farm',p=this.game.player;
  const hood=c.createLinearGradient(0,h*.69,0,h);hood.addColorStop(0,farm?'#95bc66':'#8fb6df');hood.addColorStop(.15,farm?'#639546':'#5581b7');hood.addColorStop(1,farm?'#355b3f':'#243f68');
  c.fillStyle=hood;c.beginPath();c.moveTo(w*.4,h*.68);c.quadraticCurveTo(w*.5,h*.65,w*.6,h*.68);c.lineTo(w*.76,h);c.lineTo(w*.24,h);c.closePath();c.fill();
  c.strokeStyle='#f5f1bf88';c.lineWidth=3;c.beginPath();c.moveTo(w*.41,h*.69);c.lineTo(w*.3,h);c.moveTo(w*.59,h*.69);c.lineTo(w*.7,h);c.stroke();
  if(farm){
   // Exhaust and cab frame give a stable first-person sense of the tractor.
   round(c,w*.616,h*.43,w*.016,h*.36,3,'#334846');round(c,w*.613,h*.425,w*.022,h*.018,3,'#53605b');
   for(const side of[0,1]){c.fillStyle='#40534e';c.beginPath();c.moveTo(w*(side?.985:.015),0);c.lineTo(w*(side?.96:.04),0);c.lineTo(w*(side?.88:.12),h*.88);c.lineTo(w*(side?.94:.06),h*.88);c.fill();}
   c.fillStyle='#44594ee8';c.fillRect(0,0,w,h*.02);
  }
  const dash=c.createLinearGradient(0,h*.87,0,h);dash.addColorStop(0,'#667567');dash.addColorStop(.12,'#2b4540');dash.addColorStop(1,'#172e2e');round(c,w*.18,h*.88,w*.64,h*.18,30,dash);
  const radius=Math.min(w*.1,h*.14),wx=w*.5,wy=h*.96;
  oval(c,wx,wy-radius*.9,radius*.57,radius*.35,'#152e31');c.fillStyle='#d7edd1';c.font=`800 ${Math.max(12,radius*.3)}px system-ui`;c.textAlign='center';c.fillText(Math.round(Math.abs(p.v)*3.6),wx,wy-radius*.86);
  c.save();c.translate(wx,wy);c.rotate(p.steer*.9);c.strokeStyle='#122727';c.lineWidth=radius*.18;c.beginPath();c.arc(0,0,radius,0,TAU);c.stroke();c.strokeStyle='#bcc6ac';c.lineWidth=radius*.11;c.beginPath();c.arc(0,0,radius*.97,Math.PI*1.08,Math.PI*1.85);c.stroke();
  for(let i=0;i<3;i++){const a=i*TAU/3+Math.PI/2;c.strokeStyle='#52665e';c.lineWidth=radius*.14;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);c.stroke();}oval(c,0,0,radius*.26,radius*.26,'#a7b68c');c.restore();
 }
 draw(){if(!this.w||!this.h)return;this.camera();this.sky();const c=this.c,queue=[];
  for(const o of [...this.static,...this.dynamic()]){
   const center=this.toCamera(o.center);if(center[2]<-25||center[2]>290||Math.abs(center[0])>center[2]*1.6+40)continue;
   if(o.points){const points=this.clip(o.points.map(p=>this.toCamera(p)));if(points.length<3)continue;const screen=points.map(p=>this.project(p));if(screen.every(p=>p[0]<0)||screen.every(p=>p[0]>this.w)||screen.every(p=>p[1]<0)||screen.every(p=>p[1]>this.h))continue;queue.push({o,center,screen});}
   else if(center[2]>.6)queue.push({o,center});
  }
  queue.sort((a,b)=>{const ag=a.o.ground!==undefined,bg=b.o.ground!==undefined;if(ag!==bg)return ag?-1:1;if(ag&&a.o.ground!==b.o.ground)return a.o.ground-b.o.ground;return b.center[2]-a.center[2];});
  for(const {o,center,screen}of queue){if(screen){c.fillStyle=o.color;c.beginPath();screen.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}else this.sprite(o,center);}
  const g=this.game;
  if(g.camera==='cab')this.cockpit();else if(g.mode==='town')drawCar(c,this.w/2,this.h*.78,3.6*this.focal/12,{kind:'truck',color:'#497acb'},'#497acb',g.player.steer,g.player.v<1,g.player.distance*.2);
  if(g.hit){c.fillStyle=`rgba(243,207,118,${g.hit*.1})`;c.fillRect(0,0,this.w,this.h);}
 }
 map(canvas,large=false){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,s=w/390,ox=w/2,oz=h/2,g=this.game;c.clearRect(0,0,w,h);c.fillStyle='#d3deb8';c.fillRect(0,0,w,h);c.strokeStyle='#879897';c.lineWidth=19*s;
  if(g.mode==='town')for(const v of [...ROADS,-164,164]){c.beginPath();c.moveTo(0,oz+v*s);c.lineTo(w,oz+v*s);c.moveTo(ox+v*s,0);c.lineTo(ox+v*s,h);c.stroke();}
  else{c.fillStyle='#ba9b61';c.fillRect(ox+FIELD.x*s,oz+FIELD.z*s,FIELD.cols*FIELD.size*s,FIELD.rows*FIELD.size*s);g.cells.forEach((v,i)=>{const q=cellCenter(i);c.fillStyle=['#ae9563','#74543d','#ceba61','#b99e6b'][v];c.fillRect(ox+(q.x-4)*s,oz+(q.z-4)*s,8*s,8*s);});}
  for(const p of g.world.places){round(c,ox+(p.x-p.w/2)*s,oz+(p.z-p.d/2)*s,p.w*s,p.d*s,2,p.color);if(g.targetId===p.id){c.strokeStyle='#d99034';c.lineWidth=3;c.strokeRect(ox+(p.x-p.w/2-4)*s,oz+(p.z-p.d/2-4)*s,(p.w+8)*s,(p.d+8)*s);}if(large){c.fillStyle='#263d3c';c.font='bold 12px system-ui';c.textAlign='center';c.fillText(p.name,ox+p.x*s,oz+(p.z+p.d/2+9)*s);}}
  const p=g.player;c.save();c.translate(ox+p.x*s,oz+p.z*s);c.rotate(p.angle);c.fillStyle='#fff7d6';c.strokeStyle='#215e70';c.lineWidth=2;c.beginPath();c.moveTo(0,-8);c.lineTo(6,6);c.lineTo(0,3);c.lineTo(-6,6);c.closePath();c.fill();c.stroke();c.restore();
 }
}
