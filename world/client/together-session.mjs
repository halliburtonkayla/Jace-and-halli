const symbols=['🦖','🦕','🚗','⭐','🎈','🧸','🐶','🍎'];
export class TogetherSession {
 constructor(){this.members=new Map();this.revision=0;this.resetFour();this.resetMatch();this.strokes=[];this.hideAt=0;}
 resetFour(){this.four={cells:Array(42).fill(''),turn:'r',over:false,winner:''};}
 resetMatch(){const cards=[...symbols,...symbols];for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}this.match={cards,open:[],done:[]};this.hideAt=0;}
 leave(id){this.members.delete(id);this.revision++;}
 request(p,b,now=Date.now()){
  if(b.op==='join'){this.members.set(p.id,{id:p.id,name:p.name});return this.snapshot(now);}
  if(b.op==='leave'){this.leave(p.id);return this.snapshot(now);}
  if(!this.members.has(p.id))throw Error('Enter Play Together first.');
  if(b.op==='four'){
   const seat=[...this.members.keys()].indexOf(p.id),turn=this.four.turn==='r'?0:1;
   if(this.members.size>1&&seat!==turn)throw Error('Wait for your turn.');if(this.four.over)throw Error('Start a new game.');if(!Number.isInteger(b.column)||b.column<0||b.column>6)throw Error('Choose a column.');
   let row=5;while(row>=0&&this.four.cells[row*7+b.column])row--;if(row<0)throw Error('That column is full.');this.four.cells[row*7+b.column]=this.four.turn;
   const a=this.four.cells;for(let r=0;r<6;r++)for(let c=0;c<7;c++)if(a[r*7+c]&&[[1,0],[0,1],[1,1],[1,-1]].some(([dc,dr])=>[0,1,2,3].every(n=>c+dc*n>=0&&c+dc*n<7&&r+dr*n>=0&&r+dr*n<6&&a[(r+dr*n)*7+c+dc*n]===a[r*7+c])))this.four.winner=a[r*7+c];this.four.over=Boolean(this.four.winner)||a.every(Boolean);if(!this.four.over)this.four.turn=this.four.turn==='r'?'y':'r';
  }else if(b.op==='reset-four')this.resetFour();
  else if(b.op==='match'){
   this.tick(now);const i=b.index;if(!Number.isInteger(i)||i<0||i>15||this.match.done.includes(i)||this.match.open.includes(i)||this.match.open.length===2)throw Error('Choose a closed card.');this.match.open.push(i);if(this.match.open.length===2){const [a,c]=this.match.open;if(this.match.cards[a]===this.match.cards[c]){this.match.done.push(a,c);this.match.open=[];}else this.hideAt=now+900;}
  }else if(b.op==='reset-match')this.resetMatch();
  else if(b.op==='stroke'){const s=b.stroke;if(!s||!/^#[a-f\d]{6}$/i.test(s.c)||![s.a?.x,s.a?.y,s.b?.x,s.b?.y].every(Number.isFinite)||[s.a,s.b].some(p=>p.x<0||p.x>900||p.y<0||p.y>560))throw Error('Invalid brush stroke.');if(this.strokes.length>=1200)throw Error('Our picture is full. Clear the page to start another.');this.strokes.push({a:{x:s.a.x,y:s.a.y},b:{x:s.b.x,y:s.b.y},c:s.c});}
  else if(b.op==='clear')this.strokes=[];
  else throw Error('Unknown together action.');this.revision++;return this.snapshot(now);
 }
 tick(now){if(this.hideAt&&now>=this.hideAt){this.match.open=[];this.hideAt=0;this.revision++;}}
 snapshot(now=Date.now()){this.tick(now);return {revision:this.revision,members:[...this.members.values()],four:this.four,match:this.match,strokes:this.strokes};}
}
