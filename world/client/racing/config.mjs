export const VERSION=1, LAPS=3, SEGMENT=8;
export const CARS=[
 {id:'comet',name:'Comet GT',kind:'sport',color:'#25c6ee',max:72,accel:14.5,handling:1.12,width:2.05,speedStars:4,accelStars:4,handlingStars:5},
 {id:'spark',name:'Spark Racer',kind:'race',color:'#f9cb40',max:77,accel:12.8,handling:.98,width:2.1,speedStars:5,accelStars:3,handlingStars:4},
 {id:'thunder',name:'Thunder Muscle',kind:'muscle',color:'#f16854',max:70,accel:16.2,handling:.85,width:2.25,speedStars:4,accelStars:5,handlingStars:3},
 {id:'monster',name:'Little Monster',kind:'truck',color:'#97d553',max:65,accel:13.5,handling:1.03,width:2.5,speedStars:3,accelStars:4,handlingStars:4},
];
export const TRACKS=[
 {id:'neon',name:'Neon City',subtitle:'Bright lights. Big city racing.',theme:'city',length:2560,halfWidth:6.8,curve:1,hills:1,sky:['#040b25','#2e315a','#ef8190'],road:['#30364b','#353d52'],edge:['#ed65c8','#5ad9ef'],ground:['#202744','#232d4a'],fog:'#454868',accent:'#76e5fb',seed:7},
 {id:'dino',name:'Dinosaur Valley',subtitle:'Follow the river past the dinosaurs.',theme:'dino',length:2720,halfWidth:7.2,curve:.85,hills:1.6,sky:['#4eafe3','#91d8ed','#e5f3c5'],road:['#62676a','#696f6b'],edge:['#fff3d6','#f38c5d'],ground:['#4d914e','#589d50'],fog:'#a8ce9e',accent:'#abe785',seed:18},
 {id:'speedway',name:'Monster Truck Speedway',subtitle:'Wide turns under stadium lights.',theme:'stadium',length:2400,halfWidth:8,curve:.73,hills:.45,sky:['#311d48','#925366','#e7a784'],road:['#766054','#80675a'],edge:['#eee5cb','#ee694e'],ground:['#885f41','#996d49'],fog:'#b58672',accent:'#ffb369',seed:32},
 {id:'beach',name:'Bubble Beach',subtitle:'Ocean bends and a sparkling boardwalk.',theme:'beach',length:2560,halfWidth:7.1,curve:.78,hills:.8,sky:['#56bce8','#a4e6ef','#fff6d6'],road:['#5b7684','#627c88'],edge:['#f693c2','#f8f0df'],ground:['#eadba4','#f2e3b7'],fog:'#c4e9e4',accent:'#ffabd4',seed:41},
 {id:'country',name:'Country Road',subtitle:'Rolling hills, barns, and sunny fields.',theme:'country',length:2800,halfWidth:6.7,curve:.8,hills:1.7,sky:['#68b0e6','#b9e0f1','#fff3c8'],road:['#6b7071','#727775'],edge:['#faf1d7','#d9aa64'],ground:['#77a355','#85ad61'],fog:'#c3d4ab',accent:'#dded8a',seed:53},
];
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const wrap=(v,length)=>(v%length+length)%length;
export const lerp=(a,b,t)=>a+(b-a)*t;
export const ordinal=n=>n+(n===1?'st':n===2?'nd':n===3?'rd':'th');
export const formatTime=seconds=>Number.isFinite(seconds)?Math.floor(seconds/60)+':'+(seconds%60).toFixed(2).padStart(5,'0'):'—';

// The curvature and height functions join smoothly at the lap seam.
export function roadAt(track,s){
 const t=wrap(s,track.length)/track.length,angle=t*Math.PI*2;
 const gate=Math.sin(Math.PI*clamp(t/.075,0,1)/2)**2*Math.sin(Math.PI*clamp((1-t)/.075,0,1)/2)**2;
 const curvature=track.curve*gate*(Math.sin(angle*2)*.0015+Math.sin(angle*3+.2)*.001+Math.sin(angle*5)*.0003);
 const elevation=track.hills*(Math.sin(angle-Math.PI/2)*7+Math.sin(angle*3-Math.PI/2)*2.5+9.5);
 return {curvature,elevation,zone:t<.28?'Downtown':t<.52?'Riverside':t<.78?'Skyline bends':'Home straight'};
}

export function makeTrack(track){
 const count=track.length/SEGMENT,segments=[];
 for(let i=0;i<count;i++){const s=i*SEGMENT,a=roadAt(track,s),b=roadAt(track,s+SEGMENT),objects=[];
  const pseudo=(Math.sin(i*127.1+track.seed*311.7)*43758.5453)%1,random=Math.abs(pseudo);
  if(i%5===0)for(const side of[-1,1])objects.push({type:track.theme==='city'?'building':track.theme==='beach'?'palm':track.theme==='stadium'?'stand':track.theme==='country'&&(i%25===0)?'barn':'tree',side,x:side*(track.halfWidth+4+random*10),height:track.theme==='city'?13+random*34:track.theme==='stadium'?9:5+random*6,seed:i+side+track.seed});
  if(i%8===0)objects.push({type:'lamp',x:-(track.halfWidth+1.6),side:-1,height:9,seed:i});
  if(i%40===15)objects.push({type:track.theme==='dino'?'dinosaur':track.theme==='beach'?'beach-sign':'sign',x:track.halfWidth+3.7,side:1,height:track.theme==='dino'?9:5,seed:i});
  if(i===0)objects.push({type:'gantry',x:0,height:8,seed:i});
  segments.push({index:i,s,y:a.elevation,y2:b.elevation,curve:a.curvature*SEGMENT*SEGMENT,objects});
 }
 return segments;
}
