import {LAWN} from './locations.mjs';
const TAU=Math.PI*2;
export class Renderer{
 constructor(canvas){this.c=canvas;this.ctx=canvas.getContext('2d');this.bubbleHits=[];this.particles=[];this.images={};this.playable=true;this.resize();}
 resize(){const r=this.c.getBoundingClientRect();this.w=r.width||innerWidth;this.h=r.height||innerHeight;const d=Math.min(devicePixelRatio||1,2);this.c.width=this.w*d;this.c.height=this.h*d;this.ctx.setTransform(d,0,0,d,0,0);}
 setRoute(){}
 background(name){if(!this.images[name]){const im=new Image();im.src=new URL('../assets/scenes/'+name+'-v1.webp',import.meta.url);this.images[name]=im;}const im=this.images[name],c=this.ctx;if(im.complete&&im.naturalWidth){const s=Math.max(this.w/im.width,this.h/im.height),w=im.width*s,h=im.height*s;c.drawImage(im,(this.w-w)/2,(this.h-h)/2,w,h);}else{c.fillStyle='#294b39';c.fillRect(0,0,this.w,this.h);}}
 circle(x,y,r,color){const c=this.ctx;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
 text(text,x,y,size=18,color='#fff'){const c=this.ctx;c.font=`800 ${size}px ui-rounded,system-ui`;c.fillStyle=color;c.textAlign='center';c.fillText(text,x,y);}
 draw(snapshot,me,bubbles,data,time){if(!me)return;const c=this.ctx;c.clearRect(0,0,this.w,this.h);this.bubbleHits=[];if(me.scene==='bubbles'){this.background('bubbles');c.fillStyle='#14274124';c.fillRect(0,0,this.w,this.h);this.bubbles(bubbles,data,time);}else if(me.vehicle==='mower'){this.background('backyard');this.lawn(snapshot,me);}this.effects(time);}
 bubbles(bubbles,data,time){const c=this.ctx,w=this.w,h=this.h;const colors=['#ff79c2','#66baff','#ffe87b','#7becb0'];
  for(const b of bubbles){const r=Math.max(34,Math.min(80,b.r*Math.min(w,h)));const x=r+12+b.x*(w-2*r-24),top=105+r,bottom=Math.max(top+1,h-100-r),y=top+b.y*(bottom-top)+Math.sin(time*.0008+b.x*13)*7;
   c.save();c.shadowColor='#172d5866';c.shadowBlur=14;c.shadowOffsetY=6;const g=c.createRadialGradient(x-r*.35,y-r*.4,2,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.2,colors[b.color]+'bb');g.addColorStop(.76,colors[b.color]+'99');g.addColorStop(.9,'#e3f8fff0');g.addColorStop(1,colors[b.color]);this.circle(x,y,r,g);c.restore();c.strokeStyle='#ffffffed';c.lineWidth=2.5;c.beginPath();c.arc(x,y,r-3,0,TAU);c.stroke();c.strokeStyle='#fff';c.lineWidth=4;c.lineCap='round';c.beginPath();c.arc(x,y,r*.73,3.7,4.7);c.stroke();
   if(data.pops>=30){c.save();c.shadowColor='#243568';c.shadowBlur=4;this.text(['BALL','CAR','BABY','MORE'][b.color],x,y+5,Math.max(12,r*.29));c.restore();}
   this.bubbleHits.push({...b,x,y,r});
  }
 }
 lawn(snapshot,me){const c=this.ctx,w=Math.min(this.w-32,720),h=Math.min(this.h-270,w*.65),x=(this.w-w)/2,y=95;const sx=w/(LAWN.w+35),sy=h/(LAWN.h+35),point=(px,py)=>({x:x+17*sx+(px-LAWN.x)*sx,y:y+17*sy+(py-LAWN.y)*sy});
  c.save();c.shadowColor='#14271688';c.shadowBlur=24;c.fillStyle='#477539';c.beginPath();c.roundRect(x-8,y-8,w+16,h+16,22);c.fill();c.restore();c.save();c.beginPath();c.roundRect(x,y,w,h,15);c.clip();c.fillStyle='#92b958';c.fillRect(x,y,w,h);const cut=new Set(snapshot.cut);
  for(let gy=0;gy<17;gy++)for(let gx=0;gx<20;gx++){const p=point(LAWN.x+gx*14,LAWN.y+gy*14),done=cut.has(`${gx},${gy}`);c.fillStyle=done?(gx%2?'#a3c66d':'#92ba5c'):'#648c3e';c.fillRect(p.x,p.y,14*sx+1,14*sy+1);for(let i=0;i<6;i++){const dx=((gx*19+gy*37+i*7)%14)*sx,dy=((gx*31+gy*17+i*3)%14)*sy;c.strokeStyle=i%2?'#c1d785':'#43652d';c.lineWidth=1.3;c.beginPath();c.moveTo(p.x+dx,p.y+dy);c.lineTo(p.x+dx+2,p.y+dy-(done?2:7)*sy);c.stroke();}}
  for(const p of snapshot.players.filter(p=>p.vehicle==='mower')){const q=point(p.x,p.y);c.save();c.translate(q.x,q.y);c.rotate(p.angle);const s=Math.min(sx,sy)*.74;c.scale(s,s);c.fillStyle='#25302b';for(const xx of[-20,12])for(const yy of[-22,15]){c.beginPath();c.roundRect(xx,yy,9,16,3);c.fill();}const g=c.createLinearGradient(-18,0,18,0);g.addColorStop(0,'#a53032');g.addColorStop(.45,'#ef6f58');g.addColorStop(1,'#9c2929');c.fillStyle=g;c.beginPath();c.roundRect(-18,-32,36,58,12);c.fill();c.fillStyle='#24362e';c.beginPath();c.roundRect(-12,-1,24,17,6);c.fill();c.strokeStyle='#ffeea2';c.lineWidth=3;c.beginPath();c.arc(0,-9,7,0,TAU);c.stroke();c.fillStyle='#d8e0d1';c.fillRect(-28,22,56,9);c.restore();}c.restore();
  const total=20*17;this.text(Math.round(cut.size/total*100)+'% mowed',this.w/2,y+h+30,19);}
 pop(x,y){for(let i=0;i<24;i++)this.particles.push({x,y,vx:(Math.random()-.5)*260,vy:(Math.random()-.6)*230,born:performance.now(),color:['#fff0a3','#fff','#ff8ac5','#8bddff'][i%4]});}
 effects(t){this.particles=this.particles.filter(p=>t-p.born<850);for(const p of this.particles){const dt=(t-p.born)/1000;this.ctx.globalAlpha=1-dt/.85;this.circle(p.x+p.vx*dt,p.y+p.vy*dt+100*dt*dt,4,p.color);}this.ctx.globalAlpha=1;}
}
