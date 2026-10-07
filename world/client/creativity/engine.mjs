import {W,H,drawSheet,drawMotif,PALETTE} from './catalog.mjs?v=studio-1';
import {drawPractice,TraceCoverage} from './practice.mjs?v=studio-1';
import {DrawingHistory} from './document.mjs?v=studio-1';
const rgba=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255];
export function floodFill(ink,visible,w,h,x,y,color,boundary=null){
 x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=w||y>=h)return false;
 const start=(y*w+x)*4,target=Array.from(visible.slice(start,start+4));if(boundary&&boundary[start+3]>180&&boundary[start]<90&&boundary[start+1]<90&&boundary[start+2]<90)return false;
 const replacement=color==='rainbow'?null:rgba(color);if(replacement&&target.every((v,i)=>Math.abs(v-replacement[i])<4))return false;
 const visited=new Uint8Array(w*h),stack=new Uint32Array(w*h);let top=0,changed=false;const push=p=>{if(!visited[p]){visited[p]=1;stack[top++]=p;}};push(y*w+x);
 const palette=PALETTE.slice(0,7).map(p=>rgba(p[1]));
 while(top){const pixel=stack[--top];const k=pixel*4;
 if(boundary&&boundary[k+3]>180&&boundary[k]<90&&boundary[k+1]<90&&boundary[k+2]<90)continue;
 if(Math.abs(visible[k]-target[0])+Math.abs(visible[k+1]-target[1])+Math.abs(visible[k+2]-target[2])>75||visible[k+3]<200)continue;
 const col=replacement||palette[Math.floor((pixel%w+Math.floor(pixel/w))/60)%palette.length];ink.set(col,k);changed=true;
 const px=pixel%w;if(px>0)push(pixel-1);if(px<w-1)push(pixel+1);if(pixel>=w)push(pixel-w);if(pixel<w*(h-1))push(pixel+w);
 }return changed;
}
export class DrawingEngine{
 constructor(canvas,{makeCanvas=()=>document.createElement('canvas'),name='Jace',mode='preschool',feedback=()=>{},changed=()=>{}}={}){
 this.canvas=canvas;canvas.width=W;canvas.height=H;this.makeCanvas=makeCanvas;this.ctx=canvas.getContext('2d');this.ink=makeCanvas();this.base=makeCanvas();this.composite=makeCanvas();this.mask=makeCanvas();this.strokeLayer=makeCanvas();this.regionLayer=makeCanvas();for(const c of [this.ink,this.base,this.composite,this.mask,this.strokeLayer,this.regionLayer]){c.width=W;c.height=H;}this.name=name;this.ageMode=mode;this.feedback=feedback;this.changed=changed;this.color='#ed3348';this.tool='crayon';this.size=mode==='toddler'?35:18;this.inside=mode==='toddler';this.stamp='star';this.pointer=null;this.current=null;this.completed=false;this.history=new DrawingHistory();this.bind();this.rebuild();
 }
 load(doc){this.end();this.history=new DrawingHistory(doc);this.completed=false;this.rebuild();this.changed();}
 get document(){return structuredClone(this.history.document);}
 point(e){const r=this.canvas.getBoundingClientRect(),border=this.canvas.clientLeft||0;return [Math.round(Math.max(0,Math.min(W,(e.clientX-r.left-border)*W/(r.width-border*2)))),Math.round(Math.max(0,Math.min(H,(e.clientY-r.top-border)*H/(r.height-border*2)))),Math.round((e.pointerType==='pen'?Math.max(.1,e.pressure||.5):.7)*100)/100];}
 bind(){const c=this.canvas;
 c.onpointerdown=e=>{if(this.pointer!==null)return;e.preventDefault();c.setPointerCapture(e.pointerId);this.pointer=e.pointerId;const p=this.point(e);
 if(this.tapActivity?.(p)){this.pointer=null;return;}
 if(this.tool==='fill'){this.commit({type:'fill',x:p[0],y:p[1],size:this.size,color:this.color});this.pointer=null;return;}
 if(this.tool==='stamp'){this.commit({type:'stamp',stamp:this.stamp,x:p[0],y:p[1],size:Math.max(45,this.size*3),color:this.color});this.pointer=null;return;}
 this.current={type:'stroke',tool:this.tool,color:this.color,size:this.size,points:[p],...(this.inside&&this.history.document.mode==='coloring'&&this.tool!=='eraser'?{inside:true}:{})};this.stroke(this.current,0);this.touch(p,p);this.present();};
 c.onpointermove=e=>{if(e.pointerId!==this.pointer||!this.current)return;e.preventDefault();const events=e.getCoalescedEvents?.();for(const ev of events?.length?events:[e]){const p=this.point(ev),points=this.current.points,a=points.at(-1);if(Math.hypot(p[0]-a[0],p[1]-a[1])<2)continue;if(points.length>=1500){this.end();return;}points.push(p);this.stroke(this.current,points.length-1);this.touch(a,p);}this.present();};
 c.onpointerup=c.onpointercancel=e=>{if(e.pointerId===this.pointer)this.end();};
 c.onlostpointercapture=()=>this.end();
 }
 end(){this.pointer=null;if(!this.current)return;const op=this.current;this.current=null;try{this.history.add(op);this.changed();this.check();}catch(e){this.feedback(e.message,'notice');this.rebuild();}}
 touch(a,b){if(this.tool==='eraser')return;this.coverage?.segment(a,b,this.size/2);}
 check(){const doc=this.history.document;if(this.coverage?.targets.size&&this.coverage.progress>=(this.ageMode==='toddler'?.48:.68)&&!this.completed){this.completed=true;this.feedback('You did it!','celebrate');}else if(doc.mode==='whiteboard'&&doc.practice.id==='color'&&PALETTE.find(p=>p[0]===doc.practice.value)?.[1]===this.color&&this.tool!=='eraser'){this.feedback('Great job! '+doc.practice.value+'.','celebrate');}this.onProgress?.(this.coverage?.progress||0);}
 commit(op){this.end();try{this.history.add(op);this.apply(op);this.present();this.changed();this.check();}catch(e){this.feedback(e.message,'notice');}}
 region(op){if(this.regionOp===op)return;this.regionOp=op;const mix=this.composite.getContext('2d');mix.fillStyle='#fff';mix.fillRect(0,0,W,H);mix.drawImage(this.base,0,0);const data=mix.getImageData(0,0,W,H),ctx=this.regionLayer.getContext('2d'),mask=ctx.createImageData(W,H);floodFill(mask.data,data.data,W,H,op.points[0][0],op.points[0][1],'#202027',this.base.getContext('2d').getImageData(0,0,W,H).data);ctx.putImageData(mask,0,0);}
 stroke(op,i){if(op.inside)this.region(op);const c=(op.inside?this.strokeLayer:this.ink).getContext('2d');if(op.inside)c.clearRect(0,0,W,H);const a=op.points[Math.max(0,i-1)],b=op.points[i];c.save();c.globalCompositeOperation=op.tool==='eraser'?'destination-out':'source-over';c.globalAlpha=op.tool==='pencil'?.55:op.tool==='crayon'?.78:op.tool==='marker'?.83:1;c.lineCap='round';c.lineJoin='round';c.lineWidth=op.size*(op.tool==='brush'?.5+b[2]:1);const color=op.color==='rainbow'?PALETTE[(i+Math.floor(a[0]/45))%7][1]:op.color;c.strokeStyle=color;c.fillStyle=color;
 if(i===0||a[0]===b[0]&&a[1]===b[1]){c.beginPath();c.arc(b[0],b[1],c.lineWidth/2,0,Math.PI*2);c.fill();}else{c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}
 if(op.tool==='crayon'){c.globalAlpha=.3;c.lineWidth=1;for(let n=-2;n<=2;n++){c.beginPath();c.moveTo(a[0]+n*2,a[1]+n);c.lineTo(b[0]+n*2,b[1]+n);c.stroke();}}
 c.restore();if(op.inside){c.save();c.globalCompositeOperation='destination-in';c.drawImage(this.regionLayer,0,0);c.restore();this.ink.getContext('2d').drawImage(this.strokeLayer,0,0);}}
 apply(op){const c=this.ink.getContext('2d');if(op.type==='clear'){c.clearRect(0,0,W,H);return;}
 if(op.type==='stroke'){for(let i=0;i<op.points.length;i++)this.stroke(op,i);}
 else if(op.type==='stamp'){c.save();c.translate(op.x-op.size/2,op.y-op.size/2);c.scale(op.size/100,op.size/100);let color=op.color;if(color==='rainbow'){color=c.createLinearGradient(0,0,100,100);PALETTE.slice(0,7).forEach((p,i)=>color.addColorStop(i/6,p[1]));}drawMotif(c,op.stamp,color);c.restore();}
 else if(op.type==='fill'){const mix=this.composite.getContext('2d');mix.fillStyle='#fff';mix.fillRect(0,0,W,H);mix.drawImage(this.ink,0,0);mix.drawImage(this.base,0,0);const im=c.getImageData(0,0,W,H),visible=mix.getImageData(0,0,W,H);floodFill(im.data,visible.data,W,H,op.x,op.y,op.color,this.base.getContext('2d').getImageData(0,0,W,H).data);c.putImageData(im,0,0);}
 }
 rebuild(){const d=this.history.document,b=this.base.getContext('2d'),m=this.mask.getContext('2d');b.clearRect(0,0,W,H);m.clearRect(0,0,W,H);
 if(d.mode==='coloring'){drawSheet(b,d.sheet);const lines=b.getImageData(0,0,W,H);for(let i=0;i<lines.data.length;i+=4){if(lines.data[i+3]&&lines.data[i]>245&&lines.data[i+1]>245&&lines.data[i+2]>245)lines.data[i+3]=0;}b.putImageData(lines,0,0);}else{drawPractice(b,d.practice,this.name);drawPractice(m,d.practice,this.name,{mask:true});}
 this.coverage=new TraceCoverage(m.getImageData(0,0,W,H).data);const c=this.ink.getContext('2d');c.clearRect(0,0,W,H);
 for(const op of d.ops){this.apply(op);if(op.type==='clear')this.coverage.hit.clear();if(op.type==='stroke'&&op.tool!=='eraser')for(let i=0;i<op.points.length;i++)this.coverage.segment(op.points[Math.max(0,i-1)],op.points[i],op.size/2);}
 this.present();this.onProgress?.(this.coverage.progress);
 }
 present(){const c=this.ctx;c.fillStyle='#fff';c.fillRect(0,0,W,H);c.drawImage(this.ink,0,0);c.drawImage(this.base,0,0);this.overlay?.(c);}
 undo(){this.end();if(this.history.undo()){this.completed=false;this.rebuild();this.changed();}}
 redo(){this.end();if(this.history.redo()){this.rebuild();this.changed();this.check();}}
 clear(){this.commit({type:'clear'});this.completed=false;this.rebuild();}
 dispose(){this.end();this.canvas.onpointerdown=this.canvas.onpointermove=this.canvas.onpointerup=this.canvas.onpointercancel=this.canvas.onlostpointercapture=null;}
}
