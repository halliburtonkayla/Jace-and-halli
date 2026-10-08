import {RaceRenderer} from '../racing/render.mjs?v=monster-hook-1';
import {SEGMENT} from '../racing/config.mjs?v=race-1';
const truckImage=new Image(),paintCache=new Map();truckImage.src=new URL('../../assets/park/truck-rear-v1.png',import.meta.url);
export const truckReady=new Promise(resolve=>{truckImage.onload=()=>resolve(true);truckImage.onerror=()=>resolve(false);});
function paintedTruck(color){if(paintCache.has(color))return paintCache.get(color);const c=document.createElement('canvas');c.width=c.height=480;const ctx=c.getContext('2d');ctx.drawImage(truckImage,0,0,480,480);const pixels=ctx.getImageData(0,0,480,480),d=pixels.data,target=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));for(let i=0;i<d.length;i+=4){if(d[i+2]>d[i]+30&&d[i+2]>d[i+1]+12&&d[i+3]>0){const light=d[i+2]/255,white=d[i]/255;for(let k=0;k<3;k++)d[i+k]=Math.min(255,target[k]*light+white*70);}}ctx.putImageData(pixels,0,0);paintCache.set(color,c);return c;}

function shape(c,p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function box(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
export function drawTruck(c,x,y,width,car,color=car.color,steer=0,brake=false,spin=0){
 if(truckImage.complete&&truckImage.naturalWidth){const h=width*.94;c.save();c.translate(x,y);c.rotate(steer*.035);c.fillStyle='#0c14234a';c.beginPath();c.ellipse(0,0,width*.55,width*.065,0,0,Math.PI*2);c.fill();const bounce=Math.sin(spin*9)*Math.min(2,width*.008);c.drawImage(paintedTruck(color),-width/2,-h+bounce,width,h);c.translate(0,-h*.52+bounce);c.fillStyle='#fff4bf';if(car.design===1){c.fillRect(-width*.042,-h*.07,width*.027,h*.15);c.fillRect(width*.014,-h*.07,width*.027,h*.15);}else if(car.design===2){for(const xx of[-.13,0,.13]){c.save();c.translate(xx*width,0);c.scale(width/700,width/700);shape(c,[[0,-18],[5,-5],[19,-5],[8,3],[12,18],[0,10],[-12,18],[-8,3],[-19,-5],[-5,-5]],'#fff6cc');c.restore();}}else{c.save();c.scale(width/340,width/340);shape(c,[[-5,-17],[22,-17],[3,-2],[15,-2],[-19,20],[-6,2],[-20,2]],'#fff4bf');c.restore();}c.restore();return;}

 c.save();c.translate(x,y);c.rotate(steer*.035);c.scale(width/250,width/250);
 c.fillStyle='#08132055';c.beginPath();c.ellipse(0,0,128,17,0,0,Math.PI*2);c.fill();
 // Front tires sit behind the lifted body; rear tires show moving chevron tread.
 for(const side of[-1,1]){box(c,side*85-23,-118,46,65,16,'#151d25');box(c,side*105-27,-74,54,77,17,'#152029');box(c,side*105-24,-68,9,62,5,'#73818b');c.save();c.beginPath();c.roundRect(side*105-27,-74,54,77,17);c.clip();for(let k=-1;k<9;k++){const yy=-76+(k*12+spin*50)%95;c.strokeStyle='#3c4a53';c.lineWidth=5;c.beginPath();c.moveTo(side*105-20,yy);c.lineTo(side*105,yy+8);c.lineTo(side*105+23,yy);c.stroke();}c.restore();}
 c.strokeStyle='#a8b5bb';c.lineWidth=6;c.beginPath();c.moveTo(-108,-33);c.lineTo(108,-33);c.moveTo(-80,-20);c.lineTo(38,-85);c.moveTo(80,-20);c.lineTo(-38,-85);c.stroke();
 for(const side of[-1,1]){c.strokeStyle='#f5b956';c.lineWidth=5;c.beginPath();c.moveTo(side*73,-28);c.lineTo(side*57,-81);c.stroke();}
 const g=c.createLinearGradient(-95,-170,80,-48);g.addColorStop(0,'#fff4da');g.addColorStop(.2,color);g.addColorStop(.75,color);g.addColorStop(1,'#284559');
 shape(c,[[-91,-67],[-86,-111],[-62,-147],[62,-147],[88,-112],[96,-66],[80,-46],[-79,-46]],g);
 box(c,-57,-156,114,13,7,color);shape(c,[[-58,-141],[-69,-108],[70,-108],[57,-141]],'#1d3b4c');shape(c,[[-51,-136],[-60,-115],[47,-136]],'#a2d9de');
 shape(c,[[-85,-102],[86,-102],[90,-73],[-89,-73]],'#22313b');shape(c,[[-72,-98],[70,-98],[60,-81],[-62,-81]],'#485d63');
 box(c,-91,-76,184,26,7,g);box(c,-78,-54,158,12,4,'#a9bac2');box(c,-28,-53,56,13,4,'#2a404e');
 c.fillStyle='#fff2c6';if(car.design===1){c.fillRect(-14,-75,10,24);c.fillRect(6,-75,10,24);}else if(car.design===2){for(const xx of[-42,0,42]){c.save();c.translate(xx,-64);shape(c,[[0,-10],[3,-3],[10,-3],[5,2],[7,9],[0,5],[-7,9],[-5,2],[-10,-3],[-3,-3]],'#fff3b0');c.restore();}}else shape(c,[[-7,-75],[17,-75],[2,-65],[14,-65],[-16,-52],[-6,-64],[-18,-64]],'#fff3b0');
 box(c,-89,-72,20,10,3,brake?'#ffb4a8':'#e44842');box(c,71,-72,20,10,3,brake?'#ffb4a8':'#e44842');
 box(c,-61,-164,122,7,3,'#344b58');for(let i=0;i<4;i++)box(c,-53+i*31,-177,15,15,6,'#fff3c7');
 c.restore();
}
export class MonsterRenderer extends RaceRenderer{
 constructor(canvas){super(canvas,{drawVehicle:drawTruck});this.detail=145;}
 setTrack(track){super.setTrack(track);for(const r of track.ramps||[]){this.segments[Math.floor(r.s/SEGMENT)].objects.push({type:'ramp',x:r.x,height:1.5,width:r.width});}}
 roadStrip(a,b,index,start){super.roadStrip(a,b,index,start);const c=this.c;for(const xx of[-4,-2,2,4]){c.strokeStyle='#674b3433';c.lineWidth=Math.max(.5,a.scale*.08);c.beginPath();c.moveTo(a.x+xx*a.scale,a.y);c.lineTo(b.x+xx*b.scale,b.y);c.stroke();}if(a.y-b.y>1){for(let k=0;k<18;k++){const f=(Math.sin(index*73+k*19)+1)/2,px=a.x+(f-.5)*this.track.halfWidth*1.9*a.scale;const py=b.y+(a.y-b.y)*((k*7%17)/17);c.fillStyle=k%2?'#ffe3b022':'#3d281829';c.fillRect(px,py,Math.max(.6,a.scale*.05),Math.max(.4,(a.y-b.y)*.07));}}}
 object(o,p,time){if(o.type==='stand'){const c=this.c,s=p.scale,h=o.height*s,x=p.x,y=p.y,w=h*2.1;if(h<3||x<-w||x>this.w+w)return;c.save();const g=c.createLinearGradient(x-w/2,y-h,x+w/2,y);g.addColorStop(0,'#394558');g.addColorStop(.5,'#78838b');g.addColorStop(1,'#243044');shape(c,[[x-w/2,y],[x-w/2,y-h*.35],[x+w/2,y-h],[x+w/2,y]],g);for(let row=0;row<9;row++){const yy=y-h*.035-row*h*.085,xx=x-w*.43+row*w*.085,ww=w*(.86-row*.085);box(c,xx,yy,ww,Math.max(1,h*.035),1,row%2?'#8399a8':'#bac5c9');for(let j=0;j<14;j++){const cx=xx+j*ww/14;c.fillStyle=['#e7b7a1','#e4cb87','#e49c91','#729ec0'][j%4];c.beginPath();c.ellipse(cx,yy-h*.025,Math.max(1,s*.18),Math.max(1,s*.26),0,0,Math.PI*2);c.fill();}}shape(c,[[x-w*.56,y-h*.42],[x+w*.49,y-h*1.07],[x+w*.58,y-h*.99],[x-w*.49,y-h*.33]],'#c4c8c2');c.strokeStyle='#bac8cf';c.lineWidth=Math.max(1,s*.15);for(const xx of[x-w*.46,x+w*.46]){c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y-h*.6);c.stroke();}c.restore();return;}if(o.type!=='ramp')return super.object(o,p,time);const c=this.c,w=o.width*p.scale,h=o.height*p.scale;if(p.z<5||w<2)return;shape(c,[[p.x-w/2,p.y],[p.x-w/2,p.y-h],[p.x+w/2,p.y-h],[p.x+w/2,p.y]],'#684528');shape(c,[[p.x-w/2,p.y],[p.x-w/2,p.y-h],[p.x+w/2,p.y-h],[p.x+w*.65,p.y+h*.6],[p.x-w*.65,p.y+h*.6]],'#d09a58');c.strokeStyle='#ffe8a6';c.lineWidth=Math.max(2,p.scale*.14);c.beginPath();c.moveTo(p.x-w*.55,p.y+h*.2);c.lineTo(p.x+w*.55,p.y+h*.2);c.stroke();}
}
