const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function rollStatus(rolls){
 let i=0;
 for(let frame=1;frame<=9;frame++){
  if(rolls[i]===undefined)return {frame,ball:1,rack:true,done:false};
  if(rolls[i]===10){i++;continue;}
  if(rolls[i+1]===undefined)return {frame,ball:2,rack:false,done:false};
  i+=2;
 }
 const r=rolls.slice(i);
 if(!r.length)return {frame:10,ball:1,rack:true,done:false};
 if(r.length===1)return {frame:10,ball:2,rack:r[0]===10,done:false};
 if(r.length===2&&(r[0]===10||r[0]+r[1]===10))return {frame:10,ball:3,rack:r[0]===10?r[1]===10:true,done:false};
 return {frame:10,ball:r.length,rack:false,done:true};
}
export function scoreRolls(rolls){
 let total=0,i=0;const frames=[];
 for(let f=0;f<10&&i<rolls.length;f++){
  const strike=rolls[i]===10,spare=!strike&&rolls[i]+rolls[i+1]===10;
  const length=strike||spare?3:2;
  const chunk=rolls.slice(i,i+length);const complete=chunk.length===length;
  if(complete)total+=chunk.reduce((a,b)=>a+b,0);
  frames.push({mark:strike?'X':spare?'/':String(rolls[i]+(rolls[i+1]||0)),score:complete?total:null});
  i+=strike?1:2;
 }
 return {total,frames};
}
function rack(){const pins=[];for(let row=0;row<4;row++)for(let column=0;column<=row;column++)pins.push({id:pins.length,x:(column-row/2)*.36,y:13+row*.4,vx:0,vy:0,fallen:false,tilt:0});return pins;}
export class BowlingLane{
 constructor(){this.members=[];this.turn=0;this.pins=rack();this.ball=null;this.phase='ready';this.message='Swipe the ball toward the pins.';this.timer=0;this.sequence=0;}
 current(){return this.members[this.turn];}
 join(p){if(this.members.some(m=>m.id===p.id))return;this.members.push({id:p.id,name:p.name,mode:p.mode,rolls:[],color:'#a673ef',npc:false});if(this.members.length===1)this.members.push({id:'bowling-pip',name:'Pip · computer',mode:'preschool',rolls:[],color:'#54c4d3',npc:true});if(this.phase==='complete'){this.phase='ready';this.turn=this.members.length-1;this.pins=rack();this.timer=0;}}
 leave(id){if(!this.members.some(m=>m.id===id))return;const current=this.current()?.id;this.members=this.members.filter(m=>m.id!==id);if(this.members.every(m=>m.npc))this.members=[];this.turn=Math.max(0,this.members.findIndex(m=>m.id===current));if(current===id||!this.members.length){this.ball=null;this.pins=rack();this.phase='ready';this.timer=0;}this.message='Swipe the ball toward the pins.';}
 color(id,color){if(!['#a673ef','#ff72ad','#56bcee','#efbd4e','#68ca87'].includes(color))throw Error('Choose a ball color.');const m=this.members.find(m=>m.id===id);if(!m)throw Error('Enter the bowling lane first.');m.color=color;}
 throw(id,{aim=0,power=.7,start=0}={}){const m=this.current();if(!m||m.id!==id||this.phase!=='ready')throw Error('Wait for your turn.');if(![aim,power,start].every(Number.isFinite))throw Error('Try another swipe.');const x=clamp(start,-.7,.7),target=clamp(aim,-1.2,1.2);const speed=9+clamp(power,0,1)*6;this.ball={x,y:.5,vx:(target-x)/12.5*speed,vy:speed,color:m.color,gutter:false};this.phase='rolling';this.timer=0;this.message='Here it comes!';this.sequence++;}
 reset(id){if(!this.members.some(m=>m.id===id))throw Error('Enter the bowling lane first.');if(this.phase==='rolling')throw Error('Let the ball finish first.');for(const m of this.members)m.rolls=[];this.turn=0;this.pins=rack();this.ball=null;this.timer=0;this.phase='ready';this.sequence++;this.message='A fresh game. Let’s bowl!';}
 tick(dt){if(!this.members.length)return;this.timer+=dt;
  if(this.phase==='ready'&&this.current()?.npc&&this.timer>1.5){this.throw(this.current().id,{aim:(Math.random()-.5)*.8,power:.6,start:0});return;}
  if(this.phase==='result'&&this.timer>2){this.advance();return;}
  if(this.phase!=='rolling')return;
  for(let s=0;s<3;s++)this.step(dt/3);
  if(this.timer>3.6){const count=this.pins.filter(p=>p.fallen).length;const m=this.current();m.rolls.push(count);this.message=count===10?'Strike!':rollStatus(m.rolls).ball===1&&count>0?'Frame complete!':count+' pin'+(count===1?'':'s')+'!';const before=rollStatus(m.rolls.slice(0,-1));if(before.ball===2&&count+(m.rolls.at(-2)||0)===10)this.message='Spare!';this.phase='result';this.timer=0;this.sequence++;}
 }
 step(dt){const ball=this.ball;if(!ball)return;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(Math.abs(ball.x)>.97){ball.gutter=true;ball.x=clamp(ball.x,-1.12,1.12);ball.vx=0;}
  const collide=(a,b,ra,rb,massA,massB)=>{const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=ra+rb||d<.0001)return;const nx=dx/d,ny=dy/d,relative=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(relative>0){const impulse=1.45*relative/(1/massA+1/massB);a.vx-=impulse*nx/massA;a.vy-=impulse*ny/massA;b.vx+=impulse*nx/massB;b.vy+=impulse*ny/massB;if(Math.hypot(b.vx,b.vy)>.45)b.fallen=true;if(a.id!==undefined&&Math.hypot(a.vx,a.vy)>.45)a.fallen=true;}const overlap=(ra+rb-d)*.51;a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;};
  for(const p of this.pins){if(!ball.gutter&&ball.y<16)collide(ball,p,.19,.13,6,1);p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-1.7*dt);p.vy*=Math.exp(-1.7*dt);if(p.fallen)p.tilt=Math.min(1,p.tilt+dt*4);}
  for(let i=0;i<this.pins.length;i++)for(let j=i+1;j<this.pins.length;j++)collide(this.pins[i],this.pins[j],.15,.15,1,1);
 }
 advance(){const m=this.current(),status=rollStatus(m.rolls),before=rollStatus(m.rolls.slice(0,-1));this.ball=null;
  if(status.done||status.frame!==before.frame){const next=this.members.map((_,i)=>(this.turn+i+1)%this.members.length).find(i=>!rollStatus(this.members[i].rolls).done);if(next===undefined){this.phase='complete';this.message='Great bowling, everyone!';return;}this.turn=next;this.pins=rack();}
  else this.pins=status.rack?rack():this.pins.filter(p=>!p.fallen).map(p=>({...p,vx:0,vy:0}));
  this.phase='ready';this.timer=0;this.message=this.current().name+'’s turn';
 }
 snapshot(){return {members:this.members.map(m=>({...m,score:scoreRolls(m.rolls),status:rollStatus(m.rolls)})),current:this.current()?.id,pins:this.pins,ball:this.ball,phase:this.phase,message:this.message,sequence:this.sequence};}
}
