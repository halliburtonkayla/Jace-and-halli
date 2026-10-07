import {SEGMENT,clamp,wrap,lerp,roadAt,makeTrack} from './config.mjs?v=race-1';
const TAU=Math.PI*2;
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
export function drawCar(c,x,y,width,car,color=car.color,steer=0,brake=false,spin=0){
 c.save();c.translate(x,y);c.rotate(steer*.025);c.scale(width/200,width/200);const truck=car.kind==='truck',race=car.kind==='race',muscle=car.kind==='muscle';
 oval(c,0,-3,105,14,'#04071666');
 const wheelH=truck?53:33,wheelY=truck?-53:-35;
 for(const side of[-1,1]){round(c,side*77-15,wheelY,30,wheelH,10,'#101724');round(c,side*77-12,wheelY+3,6,wheelH-6,3,'#5e6975');c.save();c.beginPath();c.roundRect(side*77-15,wheelY,30,wheelH,10);c.clip();c.strokeStyle='#6b738077';c.lineWidth=2;for(let i=0;i<7;i++){c.beginPath();c.moveTo(side*77-13,wheelY+((i*9+spin*70)%wheelH));c.lineTo(side*77+13,wheelY+((i*9+spin*70)%wheelH)-5);c.stroke();}c.restore();}
 const lift=truck?-19:0;c.translate(0,lift);
 const body=c.createLinearGradient(0,-97,0,-9);body.addColorStop(0,'#f7fdff');body.addColorStop(.17,color);body.addColorStop(.73,color);body.addColorStop(1,'#24384c');
 c.fillStyle=body;c.beginPath();c.moveTo(-88,-18);c.quadraticCurveTo(-99,-36,-86,-62);c.lineTo(-60,-99);c.quadraticCurveTo(-51,-110,0,-111);c.quadraticCurveTo(51,-110,60,-99);c.lineTo(86,-62);c.quadraticCurveTo(99,-36,88,-18);c.quadraticCurveTo(0,-5,-88,-18);c.fill();
 poly(c,[[-57,-97],[-75,-66],[75,-66],[57,-97]],'#1a2d43');poly(c,[[-52,-94],[-65,-71],[64,-71],[52,-94]],'#45677d');poly(c,[[-49,-94],[-57,-83],[35,-94]],'#b5e7ee');
 c.strokeStyle='#071a32aa';c.lineWidth=3;c.beginPath();c.moveTo(-82,-59);c.quadraticCurveTo(0,-67,82,-59);c.stroke();
 poly(c,[[-86,-52],[-75,-40],[75,-40],[86,-52]],color);
 if(muscle){poly(c,[[-21,-108],[-20,-65],[-7,-66],[-7,-110]],'#171d30');poly(c,[[7,-110],[7,-66],[20,-65],[21,-108]],'#171d30');}
 if(race){round(c,-60,-68,7,20,2,'#142139');round(c,53,-68,7,20,2,'#142139');round(c,-95,-79,190,13,5,'#182234');round(c,-89,-81,178,5,2,color);}
 round(c,-85,-38,170,15,6,'#192638');round(c,-32,-31,64,14,4,'#0e1725');round(c,-14,-29,28,10,2,'#e6eff2');
 c.save();c.shadowBlur=brake?20:7;c.shadowColor='#ff435c';const lights=brake?'#ff7b7b':'#f14661';if(muscle){for(const side of[-1,1])for(let i=0;i<3;i++)round(c,side*58-16+i*11,-47,7,10,2,lights);}else{round(c,-80,-47,52,8,4,lights);round(c,28,-47,52,8,4,lights);}c.restore();
 c.strokeStyle='#ffffff99';c.lineWidth=2;c.beginPath();c.moveTo(-84,-55);c.quadraticCurveTo(-47,-60,-35,-55);c.moveTo(35,-55);c.quadraticCurveTo(47,-60,84,-55);c.stroke();
 round(c,-99,-77,16,9,4,color);round(c,83,-77,16,9,4,color);
 for(const side of[-1,1]){oval(c,side*61,-24,10,5,'#a9bac7');oval(c,side*61,-24,6,3,'#132130');}
 if(truck){round(c,-55,-117,110,9,3,'#273747');for(let i=0;i<4;i++)round(c,-48+i*27,-126,15,14,5,'#fcf1bf');round(c,-82,-15,164,12,5,'#8fa9b0');}
 c.restore();
}

export class RaceRenderer{
 constructor(canvas,{reducedMotion=false}={}){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.cameraX=0;this.detail=170;this.quality=1;this.reducedMotion=reducedMotion;this.track=null;this.frames=0;this.average=16;}
 resize(w,h,dpr=1){this.w=w;this.h=h;const ratio=Math.min(dpr,1.6)*this.quality;this.canvas.width=Math.round(w*ratio);this.canvas.height=Math.round(h*ratio);this.c.setTransform(ratio,0,0,ratio,0,0);}
 setTrack(track){this.track=track;this.segments=makeTrack(track);this.skyline=this.makeSkyline();this.cameraX=0;}
 makeSkyline(){return Array.from({length:34},(_,i)=>({x:i/34,y:Math.abs(Math.sin(i*13+this.track.seed))*.13+.04,w:.025+Math.abs(Math.sin(i*7))*.025}));}
 project(x,y,z){const scale=this.focal/Math.max(.1,z);return {x:this.w*.5+(x-this.cameraX)*scale,y:this.horizon-(y-this.cameraY)*scale,scale,z};}
 sky(game){const c=this.c,w=this.w,h=this.h,t=this.track,grad=c.createLinearGradient(0,0,0,this.horizon+50);grad.addColorStop(0,t.sky[0]);grad.addColorStop(.63,t.sky[1]);grad.addColorStop(1,t.sky[2]);c.fillStyle=grad;c.fillRect(0,0,w,h);
  if(t.theme==='city'){oval(c,w*.78,h*.14,18,18,'#fdecd1');for(let i=0;i<35;i++)oval(c,((i*113)%997)/997*w,((i*89)%157)/157*h*.24,1,1,'#fffc');}
  else{oval(c,w*.78,h*.15,27,27,'#fff5cd');for(let i=0;i<5;i++){const x=wrap(i*w*.31-game.player.heading*w*.2,w*1.3)-w*.15,y=h*(.12+(i%3)*.04);oval(c,x,y,w*.05,10,'#fff7');oval(c,x+w*.035,y+3,w*.08,9,'#fff6');}}
  const shift=game.player.heading*w*.6;for(let row=0;row<3;row++){const points=[[0,this.horizon+10]];for(let i=0;i<=25;i++){const x=i*w/25,yy=this.horizon-h*(.035+row*.015)-Math.abs(Math.sin(i*.45+row*2+game.player.s/17000))*h*(.055-row*.012);points.push([x,yy]);}points.push([w,this.horizon+10]);poly(c,points,t.theme==='city'?['#22223e','#393451','#4b4860'][row]:['#809fa4','#88b4a1','#9cc49b'][row]);}
  if(t.theme==='city'){for(let i=0;i<this.skyline.length;i++){const b=this.skyline[i],x=wrap(b.x*w*1.5-shift,w*1.5)-w*.25,y=this.horizon-b.y*h;c.fillStyle=i%2?'#202c4b':'#293752';c.fillRect(x,y,b.w*w,b.y*h);if(this.detail>100){c.fillStyle=i%3?'#aecde47a':'#fca2c56a';for(let k=0;k<6;k++)c.fillRect(x+5+(k%2)*b.w*w*.4,y+8+Math.floor(k/2)*15,3,6);}}}
  if(t.theme==='beach'){c.fillStyle='#70cfda';c.fillRect(0,this.horizon-4,w,55);c.strokeStyle='#ecfff4';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(0,this.horizon+8+i*11);c.lineTo(w,this.horizon+8+i*11);c.stroke();}}
 }
 roadStrip(a,b,index,start){const c=this.c,track=this.track,half=track.halfWidth;const odd=Math.floor(index/3)%2,edge=odd?track.edge[0]:track.edge[1];
  c.fillStyle=track.ground[odd];c.fillRect(0,b.y,this.w,Math.max(0,a.y-b.y+1));
  const band=(x1,x2,color)=>poly(c,[[a.x+a.scale*x1,a.y+.5],[a.x+a.scale*x2,a.y+.5],[b.x+b.scale*x2,b.y-.5],[b.x+b.scale*x1,b.y-.5]],color);
  band(-half-1.2,half+1.2,edge);band(-half,half,track.road[odd]);
  band(-half+.2,-half+.29,'#f4efe499');band(half-.29,half-.2,'#f4efe499');
  if(Math.floor(index/2)%3!==0)for(const x of[-half*.5,0,half*.5])band(x-.047,x+.047,'#e4e8edb8');
  if(start){for(let x=-half;x<half;x+=half/8)band(x,x+half/8,(Math.round(x/(half/8))+index)%2?'#faf6de':'#151d2b');}
  if(track.theme==='city'&&index%3===0){band(-half-.9,-half-.76,'#7cdef5');band(half+.76,half+.9,'#f386d2');}
 }
 object(obj,p,time){const c=this.c,s=p.scale,h=obj.height*s,x=p.x,y=p.y,t=this.track;if(h<2||x<-h*2||x>this.w+h*2)return;c.save();
  if(obj.type==='building'){const w=h*(.38+(obj.seed%3)*.08),side=obj.side;const face=c.createLinearGradient(x-w*.5,0,x+w*.5,0);face.addColorStop(0,'#20324e');face.addColorStop(.7,'#29465f');face.addColorStop(1,'#355871');c.fillStyle=face;c.fillRect(x-w*.5,y-h,w,h);poly(c,[[x+side*w*.5,y-h],[x+side*w*.73,y-h*.9],[x+side*w*.73,y],[x+side*w*.5,y]],'#182d47');c.fillStyle='#466076';c.fillRect(x-w*.54,y-h,w*1.08,Math.max(1,s*.3));c.fillStyle=obj.seed%3===0?'#f8c387':'#91cde0';if(h>35){const step=Math.max(5,s*2.8);for(let yy=y-h+step;yy<y-5;yy+=step)for(let xx=x-w*.4;xx<x+w*.38;xx+=step*.65){if(Math.sin(Math.round((xx-x+w*.4)/(step*.65))*13+Math.round((yy-y+h-step)/step)*17+obj.seed)>-.4)c.fillRect(xx,yy,Math.max(1,step*.2),Math.max(2,step*.4));}}if(obj.seed%3===0&&h>70){round(c,x-w*.45,y-h*.65,w*.9,h*.11,2,'#e96d9a');c.fillStyle='#fff4e4';c.font=`800 ${Math.max(6,h*.045)}px system-ui`;c.textAlign='center';c.fillText('CITY',x,y-h*.57);}}
  else if(obj.type==='lamp'){c.strokeStyle=t.theme==='city'?'#435474':'#79878c';c.lineWidth=Math.max(1,s*.19);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.lineTo(x+s*obj.side*-2.2,y-h);c.stroke();const lx=x+s*obj.side*-2.2;c.fillStyle='#fff2bb';c.fillRect(lx-s*.8,y-h,s*1.6,Math.max(2,s*.2));if(t.theme==='city'){const g=c.createRadialGradient(lx,y-h,1,lx,y-h,s*3);g.addColorStop(0,'#fff4d4aa');g.addColorStop(1,'#fff4d400');oval(c,lx,y-h,s*3,s*3,g);}}
  else if(obj.type==='gantry'){const half=t.halfWidth*s;c.fillStyle='#58647c';c.fillRect(p.x-half-2*s,y-h,s*.4,h);c.fillRect(p.x+half+1.6*s,y-h,s*.4,h);round(c,p.x-half-2*s,y-h,half*2+4*s,h*.23,s*.15,'#19213b');c.fillStyle='#ecf8f4';c.textAlign='center';c.font=`900 ${Math.max(5,h*.09)}px system-ui`;c.fillText('NEON CITY RACERS',p.x,y-h*.84);for(let i=0;i<12;i++)c.fillRect(p.x-half+i*half/6,y-h*.75,half/12,h*.04);}
  else if(obj.type==='tree'){const w=h*.38;c.fillStyle='#856d4d';c.fillRect(x-w*.085,y-h*.65,w*.17,h*.65);const g=c.createRadialGradient(x-w*.2,y-h*.75,2,x,y-h*.5,h*.52);g.addColorStop(0,t.theme==='dino'?'#acd783':'#a2c47b');g.addColorStop(.5,t.theme==='dino'?'#4f9153':'#609653');g.addColorStop(1,'#35694b');oval(c,x-w*.36,y-h*.62,w*.64,h*.3,g);oval(c,x+w*.29,y-h*.69,w*.67,h*.3,g);oval(c,x,y-h*.86,w*.55,h*.2,g);}
  else if(obj.type==='palm'){c.strokeStyle='#b28e64';c.lineWidth=Math.max(2,s*.45);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-h*.13,y-h*.5,x,y-h);c.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.strokeStyle=i%2?'#459d75':'#67b990';c.lineWidth=Math.max(2,s*.9);c.beginPath();c.moveTo(x,y-h);c.quadraticCurveTo(x+Math.cos(a)*h*.3,y-h-Math.abs(Math.sin(a))*h*.22,x+Math.cos(a)*h*.48,y-h+h*.14);c.stroke();}if(obj.seed%3===0)oval(c,x+h*.45,y-h*.7+Math.sin(time*.001+obj.seed)*s,2*s,2*s,'#b8edfb88');}
  else if(obj.type==='barn'){const w=h*.8;round(c,x-w/2,y-h*.7,w,h*.7,2,'#b75742');poly(c,[[x-w*.6,y-h*.7],[x,y-h],[x+w*.6,y-h*.7]],'#465363');round(c,x-w*.22,y-h*.5,w*.44,h*.5,2,'#693a31');c.strokeStyle='#f1e0b4';c.lineWidth=Math.max(1,s*.2);c.strokeRect(x-w*.22,y-h*.5,w*.44,h*.5);c.beginPath();c.moveTo(x-w*.22,y-h*.5);c.lineTo(x+w*.22,y);c.moveTo(x+w*.22,y-h*.5);c.lineTo(x-w*.22,y);c.stroke();}
  else if(obj.type==='stand'){const w=h*2;poly(c,[[x-w/2,y],[x-w/2,y-h*.35],[x+w/2,y-h],[x+w/2,y]],'#504b65');for(let row=0;row<5;row++){const yy=y-h*.08-row*h*.14;round(c,x-w*.38+row*w*.11,yy,w*(.76-row*.11),Math.max(2,h*.07),1,row%2?'#e5a16c':'#d5c5a6');}c.strokeStyle='#eee7c4';c.lineWidth=Math.max(1,s*.2);c.beginPath();c.moveTo(x-w/2,y-h*.4);c.lineTo(x+w/2,y-h*1.06);c.stroke();}
  else if(obj.type==='dinosaur'){c.translate(x,y);c.scale(h/110,h/110);const g=c.createLinearGradient(-30,-80,30,0);g.addColorStop(0,'#bfdc74');g.addColorStop(1,'#4b965a');oval(c,0,-32,37,23,g);for(const xx of[-19,15])round(c,xx,-28,11,30,5,'#548e51');c.strokeStyle='#7ab963';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(19,-41);c.quadraticCurveTo(40,-80,32,-97);c.stroke();oval(c,38,-99+Math.sin(time*.0008)*1.5,15,9,g);oval(c,44,-101,2,2,'#253c34');c.lineWidth=12;c.beginPath();c.moveTo(-30,-34);c.quadraticCurveTo(-53,-26,-68,-47);c.stroke();}
  else{const w=h*1.1;c.fillStyle='#737a74';c.fillRect(x-s*.13,y-h,s*.26,h);round(c,x-w/2,y-h,w,h*.42,s*.2,obj.type==='beach-sign'?'#db85ac':'#e8d8a6');c.fillStyle='#294657';c.textAlign='center';c.font=`900 ${Math.max(6,h*.13)}px system-ui`;c.fillText(obj.type==='beach-sign'?'BUBBLE BEACH':'CURVES AHEAD',x,y-h*.75);}
  c.restore();
 }
 draw(game,time,dt=1/60){
  if(!this.w||!this.h)return;if(this.track!==game.track)this.setTrack(game.track);const c=this.c,p=game.player,w=this.w,h=this.h;
  this.focal=w*.92;this.horizon=h*.34;this.cameraX+=((p.x-p.heading*2)-this.cameraX)*Math.min(1,dt*5);this.cameraY=roadAt(game.track,p.s).elevation+clamp(h*.38*14/this.focal,2.5,10.5);
  this.sky(game);const base=Math.floor(p.s/SEGMENT)-2,fraction=wrap(p.s,SEGMENT)/SEGMENT;let x=0,dx=-this.segments[wrap(base,this.segments.length)].curve*(fraction+2),maxY=h;const visible=[];
  for(let n=0;n<this.detail;n++){const index=wrap(base+n,this.segments.length),seg=this.segments[index],z=n*SEGMENT-fraction*SEGMENT-2,a=this.project(x,seg.y,z),b=this.project(x+dx,seg.y2,z+SEGMENT);const clip=maxY;visible.push({seg,a,b,clip,worldX:x,z});x+=dx;dx+=seg.curve;if(z<1||b.y>=maxY||b.y>=a.y)continue;this.roadStrip(a,b,index,index<2);maxY=b.y;}
  for(let n=visible.length-1;n>=0;n--){const v=visible[n];if(v.z<2)continue;c.save();c.beginPath();c.rect(0,0,w,Math.max(0,v.clip));c.clip();
   if(n<this.detail*.8)for(const obj of v.seg.objects){const q=this.project(v.worldX+obj.x,v.seg.y,v.z);this.object(obj,q,time);}
   for(const r of game.racers){if(r.player)continue;const relative=wrap(r.s-p.s+14,game.track.length);if(relative<v.z||relative>=v.z+SEGMENT||relative<3)continue;const f=(relative-v.z)/SEGMENT,q={x:lerp(v.a.x,v.b.x,f)+r.x*lerp(v.a.scale,v.b.scale,f),y:lerp(v.a.y,v.b.y,f),scale:lerp(v.a.scale,v.b.scale,f)};drawCar(c,q.x,q.y,q.scale*3.1,r.car,r.color,r.steer,r.braking,r.s*.05);}
   c.restore();
  }
  const py=this.horizon+(this.cameraY-roadAt(game.track,p.s).elevation)*this.focal/14,px=w/2+(p.x-this.cameraX)*this.focal/14,carWidth=this.focal/14*(p.car.kind==='truck'?3.6:3.1);
  if(!this.reducedMotion&&p.v>45){c.strokeStyle='#d8f7ff26';c.lineWidth=1;for(let i=0;i<10;i++){const side=i%2?1:-1,xx=w/2+side*w*(.43+(i%3)*.03),yy=wrap(time*.1+i*h*.12,h);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+side*12,yy+30);c.stroke();}}
  drawCar(c,px,py,carWidth,p.car,p.color,p.steer,p.braking,p.s*.05);
  if(p.hit>0){c.fillStyle=`rgba(255,171,111,${p.hit*.09})`;c.fillRect(0,0,w,h);}
  const fog=c.createLinearGradient(0,this.horizon-12,0,this.horizon+28);fog.addColorStop(0,this.track.fog+'00');fog.addColorStop(.35,this.track.fog+'55');fog.addColorStop(1,this.track.fog+'00');c.fillStyle=fog;c.fillRect(0,this.horizon-12,w,40);
 }
 noteFrame(ms){this.average=this.average*.98+ms*.02;if(++this.frames>150&&this.average>27&&this.detail>100){this.detail=100;this.quality=.8;this.resize(this.w,this.h,globalThis.devicePixelRatio||1);this.frames=0;} }
}
