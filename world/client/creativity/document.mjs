import {SHEETS,STAMPS,PALETTE,W,H} from './catalog.mjs';
import {PRACTICES} from './practice.mjs';
export const MAX_DOCUMENT_BYTES=180000;
export function validateDocument(value){
 if(!value||value.version!==1||!['coloring','whiteboard'].includes(value.mode))throw Error('This picture format is not supported.');
 if(value.mode==='coloring'&&!SHEETS.some(p=>p.id===value.sheet))throw Error('Choose a coloring page.');
 if(value.mode==='whiteboard'&&(!PRACTICES.some(p=>p.id===value.practice?.id)||typeof value.practice.value!=='string'||value.practice.value.length>24))throw Error('Choose a practice board.');
 if(!Array.isArray(value.ops)||value.ops.length>450)throw Error('Save this picture and start a fresh page.');
 let points=0;
 const clean={version:1,mode:value.mode,sheet:value.mode==='coloring'?value.sheet:'',practice:value.mode==='whiteboard'?{id:value.practice.id,value:value.practice.value}:null,ops:[]};
 for(const op of value.ops){
 if(!['stroke','fill','stamp','clear'].includes(op.type))throw Error('Unknown drawing tool.');
 if(op.type==='clear'){clean.ops.push({type:'clear'});continue;}
 if(!PALETTE.some(p=>p[1]===op.color))throw Error('Choose a palette color.');
 if(!Number.isFinite(op.size)||op.size<2||op.size>(op.type==='stamp'?300:100))throw Error('Choose a brush size.');
 const c={type:op.type,color:op.color,size:op.size};
 if(op.type==='stroke'){
 if(!['crayon','marker','brush','pencil','eraser'].includes(op.tool)||!Array.isArray(op.points)||op.points.length<1)throw Error('Invalid stroke.');
 points+=op.points.length;if(points>18000)throw Error('This picture is full. Save it and start another.');c.tool=op.tool;c.points=op.points.map(p=>{if(!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite)||p[0]<0||p[0]>W||p[1]<0||p[1]>H||p[2]<.1||p[2]>1)throw Error('Invalid drawing point.');return [...p];});
 }else{if(!Number.isFinite(op.x)||!Number.isFinite(op.y)||op.x<0||op.x>W||op.y<0||op.y>H)throw Error('Invalid drawing position.');c.x=op.x;c.y=op.y;if(op.type==='stamp'){if(!STAMPS.includes(op.stamp))throw Error('Choose an approved stamp.');c.stamp=op.stamp;}}
 clean.ops.push(c);
 }
 if(JSON.stringify(clean).length>MAX_DOCUMENT_BYTES)throw Error('This picture is full. Save it and start another.');return clean;
}
export function newDocument(mode='whiteboard',sheet='truck',practice={id:'blank',value:''}){return {version:1,mode,sheet:mode==='coloring'?sheet:'',practice:mode==='whiteboard'?practice:null,ops:[]};}
export class DrawingHistory{
 constructor(doc=newDocument()){this.document=validateDocument(doc);this.redoOps=[];}
 add(op){const next=validateDocument({...this.document,ops:[...this.document.ops,op]});this.document=next;this.redoOps=[];}
 undo(){const op=this.document.ops.pop();if(op)this.redoOps.push(op);return !!op;}
 redo(){const op=this.redoOps.pop();if(op)this.document.ops.push(op);return !!op;}
}
