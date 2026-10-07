// One coordinate system: x east, z south, angle 0 looks north (-z).
export const ROADS = [-92, 0, 92];
export const PLACES = [
 {id:'home',name:'Our Home',x:-44,z:61,w:29,d:22,h:10,color:'#ecbb83',roof:'#617c87',kind:'home',stop:[-44,81],visit:'home'},
 {id:'garden',name:'Bubble Garden',x:43,z:61,w:28,d:22,h:6,color:'#c9a4d8',roof:'#bb74ab',kind:'garden',stop:[43,81],visit:'garden'},
 {id:'arcade',name:'Bowling & Arcade',x:44,z:-26,w:30,d:23,h:12,color:'#8972b7',roof:'#665581',kind:'arcade',stop:[44,-9],visit:'arcade'},
 {id:'school',name:'Our School',x:-43,z:-118,w:31,d:22,h:11,color:'#dda573',roof:'#657b85',kind:'school',stop:[-43,-100],visit:'school'},
 {id:'classic',name:'Game House',x:-45,z:-26,w:27,d:22,h:10,color:'#70b9ae',roof:'#577c8b',kind:'shop',stop:[-45,-9],visit:'classic'},
 {id:'arena',name:'Monster Trucks',x:128,z:-118,w:29,d:23,h:8,color:'#d9a665',roof:'#736957',kind:'arena',stop:[128,-100],visit:'arena'},
 {id:'farm',name:'Jace’s Tractor Farm',x:-132,z:59,w:30,d:22,h:12,color:'#c95d50',roof:'#66747a',kind:'barn',stop:[-132,81],file:'tractor-farm.html'},
 {id:'movies',name:'Movie Theater',x:44,z:-119,w:30,d:22,h:12,color:'#d8838d',roof:'#76596f',kind:'cinema',stop:[44,-100],visit:'theater'},
 {id:'creativity',name:'Color & Create',x:130,z:60,w:27,d:22,h:10,color:'#e2a4be',roof:'#a174a8',kind:'shop',stop:[130,81],art:'coloring'},
 {id:'race',name:'Neon City Racers',x:129,z:-25,w:30,d:23,h:11,color:'#68a9c5',roof:'#465b79',kind:'race',stop:[129,-9],file:'arcade-new.html#race'},
];
export const FIELD = {x:-24,z:-44,cols:6,rows:9,size:8};
export function makeWorld(mode='town') {
 const farm=mode==='farm',places=farm?[{id:'barn',name:'Harvest Barn',x:64,z:33,w:28,d:24,h:13,color:'#c35c47',roof:'#61716b',kind:'barn',stop:[46,53]}]:PLACES;
 const trees=[];
 for(let i=0;i<120;i++) {
  const x=Math.sin(i*49.31)*170,z=Math.cos(i*78.27)*170;
  if(farm ? (Math.abs(x)<40&&z<75&&z>-70)||(x>35&&z>10&&z<80) : ROADS.some(v=>Math.abs(x-v)<17||Math.abs(z-v)<17))continue;
  if(places.some(p=>Math.abs(x-p.x)<p.w/2+8&&Math.abs(z-p.z)<p.d/2+8))continue;
  trees.push({x,z,h:8+(i%5)*1.6,seed:i});
 }
 return {mode,places,trees,bounds:178,obstacles:places.map(p=>({x:p.x,z:p.z,rx:p.w/2+1,rz:p.d/2+1})).concat(trees.map(t=>({x:t.x,z:t.z,rx:1.25,rz:1.25})))};
}
export function onRoad(x,z){return ROADS.some(v=>Math.abs(x-v)<10||Math.abs(z-v)<10)||Math.abs(Math.abs(x)-164)<10||Math.abs(Math.abs(z)-164)<10;}
export function cellCenter(i){return {x:FIELD.x+(i%FIELD.cols+.5)*FIELD.size,z:FIELD.z+(Math.floor(i/FIELD.cols)+.5)*FIELD.size};}
