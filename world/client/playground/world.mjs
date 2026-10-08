export const BOUNDS={x:34,z:30};
export const BASE={x:0,z:0,r:2.4};
export const EQUIPMENT=[
 {id:'jungle',name:'Jungle gym',kind:'jungle',x:-10,z:-11,w:7,d:6},
 {id:'slide',name:'Red slide',kind:'slide',x:1,z:-15,w:3.6,d:7},
 {id:'tunnel',name:'Crawl tunnel',kind:'tunnel',x:-19,z:-2,w:6,d:2.6},
 {id:'house',name:'Playhouse',kind:'house',x:19,z:-18,w:5,d:4},
 {id:'swing',name:'Swings',kind:'swing',x:-23,z:13,w:7,d:3},
 {id:'seesaw',name:'Seesaw',kind:'seesaw',x:10,z:-2,w:6,d:1.5},
 {id:'bench1',name:'Garden bench',kind:'bench',x:-6,z:8,w:3,d:1},
 {id:'bench2',name:'Court bench',kind:'bench',x:28,z:2,w:3,d:1},
 ...[[-27,-20],[-23,-11],[10,-23],[28,-24],[28,23],[-28,25],[-15,20],[7,20]].map(([x,z],i)=>({id:'tree'+i,name:'Shade tree '+(i+1),kind:'tree',x,z,w:1.4,d:1.4})),
 ...[[-16,-23],[-29,4],[12,-14],[23,-7],[31,15],[-16,9],[3,12]].map(([x,z],i)=>({id:'bush'+i,name:'Flower bushes '+(i+1),kind:'bush',x,z,w:3,d:2}))
];
// Entry points remain outside solid shells; looking inside uses an explicit interaction.
export const SPOTS=EQUIPMENT.filter(o=>o.kind!=='seesaw').map(o=>({id:o.id,name:o.name,kind:o.kind,x:o.x,z:o.z+o.d/2+1.05,cover:o}));
export const COURT={x:21,z:10,hoop:{x:21,y:3.05,z:5},spawn:{x:21,y:.25,z:14}};
export const SOCCER={x:-5,z:22,goal:{x:-5,z:28,w:6,h:2.5},spawn:{x:-5,y:.23,z:19}};
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function solid(x,z,pad=.38){return Math.abs(x)>BOUNDS.x-pad||Math.abs(z)>BOUNDS.z-pad||EQUIPMENT.some(o=>o.kind!=='bush'&&Math.abs(x-o.x)<o.w/2+pad&&Math.abs(z-o.z)<o.d/2+pad);}
export function occluded(a,b){const dx=b.x-a.x,dz=b.z-a.z;return EQUIPMENT.some(o=>{if(o.kind==='seesaw'||o.kind==='swing')return false;if(o.kind==='bush'&&!b.crouch)return false;let lo=0,hi=1;for(const [v,d,c,r]of[[a.x,dx,o.x,o.w/2],[a.z,dz,o.z,o.d/2]]){if(Math.abs(d)<1e-7){if(Math.abs(v-c)>r)return false;}else{const t=(c-r-v)/d,u=(c+r-v)/d;lo=Math.max(lo,Math.min(t,u));hi=Math.min(hi,Math.max(t,u));}}return lo<=hi&&hi>.02&&lo<.98;});}
const cell=(x,z)=>`${x},${z}`;
export function route(from,to){
 if(!Number.isFinite(to.x)||!Number.isFinite(to.z))return [];
 let tx=Math.round(clamp(to.x,-33,33)),tz=Math.round(clamp(to.z,-29,29));
 if(solid(tx,tz)){let best=null;for(let r=1;r<8&&!best;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const x=tx+dx,z=tz+dz;if(!solid(x,z)&&(!best||dist({x,z},to)<best.d))best={x,z,d:dist({x,z},to)};}if(!best)return [];tx=best.x;tz=best.z;}
 const sx=Math.round(from.x),sz=Math.round(from.z),start={x:sx,z:sz,g:0,f:0,key:cell(sx,sz)},open=[start],nodes=new Map([[start.key,start]]),closed=new Set();let end;
 for(let count=0;open.length&&count<6000;count++){let k=0;for(let i=1;i<open.length;i++)if(open[i].f<open[k].f)k=i;const n=open.splice(k,1)[0];if(n.x===tx&&n.z===tz){end=n;break;}closed.add(n.key);for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const x=n.x+dx,z=n.z+dz,key=cell(x,z);if(closed.has(key)||solid(x,z)||(dx&&dz&&(solid(n.x+dx,n.z)||solid(n.x,n.z+dz))))continue;const g=n.g+Math.hypot(dx,dz),old=nodes.get(key);if(old&&old.g<=g)continue;const next={x,z,key,g,f:g+Math.hypot(x-tx,z-tz),parent:n};if(old)open.splice(open.indexOf(old),1);nodes.set(key,next);open.push(next);}}
 const path=[];for(let n=end;n?.parent;n=n.parent)path.unshift({x:n.x,z:n.z});return path;
}
