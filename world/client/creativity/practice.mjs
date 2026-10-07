import {drawMotif,W,H} from './catalog.mjs?v=studio-2';
export const WORDS=['ball','cup','dog','cat','eat','more','up','down','yes','no','please','thank you'];
export const SIGHT=['I','a','see','the','my','like','we','go','to','can'];
const LETTERS={A:'M0 100L50 0L100 100M23 55H77',B:'M5 100V0H48C113 0 113 49 48 49H5M48 49C118 49 118 100 48 100H5',C:'M95 12C-21-38-21 138 95 88',D:'M5 100V0H34C120 0 120 100 34 100Z',E:'M95 0H5V100H95M5 50H78',F:'M95 0H5V100M5 50H78',G:'M95 16C-19-33-20 136 95 88V55H58',H:'M5 0V100M95 0V100M5 50H95',I:'M10 0H90M50 0V100M10 100H90',J:'M18 0H90M70 0V75Q70 117 12 85',K:'M5 0V100M95 0L5 50L95 100',L:'M5 0V100H95',M:'M5 100V0L50 60L95 0V100',N:'M5 100V0L95 100V0',O:'M50 0C-14 0-14 100 50 100C114 100 114 0 50 0Z',P:'M5 100V0H50C116 0 116 53 50 53H5',Q:'M50 0C-14 0-14 100 50 100C114 100 114 0 50 0ZM65 74L100 108',R:'M5 100V0H50C116 0 116 50 50 50H5M50 50L98 100',S:'M93 15C20-28-29 47 48 50C128 51 90 127 6 84',T:'M0 0H100M50 0V100',U:'M5 0V66C5 114 95 114 95 66V0',V:'M0 0L50 100L100 0',W:'M0 0L23 100L50 40L77 100L100 0',X:'M0 0L100 100M100 0L0 100',Y:'M0 0L50 52L100 0M50 52V100',Z:'M0 0H100L0 100H100'};
const DIGITS={0:LETTERS.O,1:'M20 24L50 0V100M15 100H85',2:'M5 25C7-7 93-7 94 26Q95 45 10 100H98',3:'M10 12C87-32 122 47 50 49C125 48 109 135 5 86',4:'M78 100V0L5 68H100',5:'M95 0H10V48C116 13 127 127 8 89',6:'M89 12C-21-24-14 99 44 100C115 111 111 41 49 43Q9 40 11 78',7:'M0 0H100L32 100',8:'M50 49C-21 46-6-12 50 0C106-12 121 46 50 49C-18 49-14 116 50 100C114 116 118 49 50 49Z',9:'M11 88C121 124 114 1 56 0C-15-11-11 59 51 57Q91 60 89 22'};
export const PRACTICES=[{id:'blank',title:'Blank whiteboard'},{id:'upper',title:'ABC · uppercase'},{id:'lower',title:'abc · lowercase'},{id:'number',title:'Numbers'},{id:'shape',title:'Shapes'},{id:'color',title:'Colors'},{id:'name',title:'My name'},{id:'lines',title:'Tracing paths'},{id:'word',title:'Picture & word'},{id:'sight',title:'First sight words'},{id:'match',title:'Shape matching'}];
export const SHAPES=['circle','square','triangle','star','heart'];
export function practiceLabel(practice,name){const {id,value}=practice;if(id==='upper'||id==='lower')return 'Trace '+value;if(id==='number')return 'Trace '+value;if(id==='name')return 'Let’s write '+name;if(id==='shape')return 'Trace a '+value;if(id==='word'||id==='sight')return value;if(id==='lines')return 'Follow the path';if(id==='color')return 'Draw with '+value;if(id==='match')return 'Find the '+value;return 'Make something wonderful';}
function shape(c,id){if(id==='circle'){c.beginPath();c.arc(480,345,150,0,Math.PI*2);c.stroke();}else if(id==='square'){c.strokeRect(330,195,300,300);}else if(id==='triangle'){const p=new Path2D('M480 175L665 495H295Z');c.stroke(p);}else{c.save();c.translate(310,175);c.scale(3.4,3.4);drawMotif(c,id,null);c.restore();}}
function letterPath(c,text){const s=Math.min(2.9,750/(text.length*126)),width=text.length*126*s;c.save();c.translate((W-width)/2+12*s,210);c.scale(s,s);c.lineWidth/=s;for(const char of text.toUpperCase()){const d=LETTERS[char]||DIGITS[char];if(d)c.stroke(new Path2D(d));c.translate(126,0);}c.restore();}
export function drawPractice(c,practice,name,{mask=false}={}){
 const {id,value}=practice;c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=mask?'#000':'#b6c4ce';c.fillStyle=mask?'#000':'#c1cdd6';c.lineWidth=mask?22:7;
 if(!mask)c.setLineDash([6,13]);
 if(id==='upper'||id==='number'||id==='name')letterPath(c,id==='name'?name:value);
 else if(id==='lower'||id==='sight'){c.font=`bold ${id==='lower'?360:Math.min(235,790/Math.max(1,String(value).length)*1.6)}px ui-rounded, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.strokeText(value,W/2,H/2+20);}
 else if(id==='shape')shape(c,value);
 else if(id==='lines'){const paths=['M135 350H825','M135 350Q230 160 340 350T550 350T825 350','M135 430L300 220L470 430L640 220L825 430','M135 350C250 115 670 610 825 270'];c.stroke(new Path2D(paths[Number(value)||0]));}
 if(!mask){c.setLineDash([]);if(id==='word'){
 const motif={ball:'ball',cup:'cup',dog:'dog',cat:'cat',eat:'apple',more:'ball',up:'up',down:'down',yes:'yes',no:'no',please:'hand','thank you':'heart'}[value]||'star';c.save();c.translate(360,130);c.scale(2.4,2.4);drawMotif(c,motif,'white');c.restore();c.fillStyle='#23495e';c.font='bold 65px sans-serif';c.textAlign='center';c.fillText(value,480,490);
 }if(id==='color'){c.strokeStyle='#c1cdd6';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.arc(260+i*220,345,86,0,Math.PI*2);c.stroke();}}
 if(id!=='blank'&&id!=='match'){c.fillStyle='#597786';c.font='600 25px sans-serif';c.textAlign='center';c.fillText(practiceLabel(practice,name),480,62);}}
 c.restore();
}
// Coverage accumulates only touched target cells, with interpolation to account for fast swipes.
export class TraceCoverage{
 constructor(image,w=W,h=H){this.w=w;this.h=h;this.targets=new Set();this.hit=new Set();this.cols=Math.ceil(w/8);for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8)if(image[(y*w+x)*4+3]>100)this.targets.add(Math.floor(y/8)*this.cols+Math.floor(x/8));}
 mark(x,y,radius=18){const r=Math.min(28,Math.max(14,radius));for(let py=Math.max(0,y-r);py<Math.min(this.h,y+r);py+=4)for(let px=Math.max(0,x-r);px<Math.min(this.w,x+r);px+=4){if(Math.hypot(px-x,py-y)>r)continue;const k=Math.floor(py/8)*this.cols+Math.floor(px/8);if(this.targets.has(k))this.hit.add(k);}}
 segment(a,b,radius){const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/5));for(let i=0;i<=n;i++)this.mark(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,radius);}
 get progress(){return this.targets.size?this.hit.size/this.targets.size:0;}
}
