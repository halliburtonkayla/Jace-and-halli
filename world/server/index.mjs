import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { resolve,dirname,extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openStore,token,digest,checkPassword } from './store.mjs';
import { makePlayer,step,cutGrass,nearby,publicPlayer,clamp } from './simulation.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),client=resolve(root,'world/client');
const port=Number(process.env.PORT||8787),host=process.env.HOST||'127.0.0.1';
const origin=process.env.WORLD_ORIGIN||`http://localhost:${port}`,secure=new URL(origin).protocol==='https:';
if(process.env.NODE_ENV==='production'&&!secure)throw Error('WORLD_ORIGIN must be an HTTPS origin in production.');
const db=openStore(resolve(process.env.WORLD_DATA_DIR||'data')),players=new Map(),streams=new Map(),cut=new Set(JSON.parse(db.prepare('SELECT value FROM settings WHERE key=?').get('lawn')?.value||'[]')),attempts=new Map();
const NPCS=[{id:'npc-pip',name:'Pip · computer',x:90,y:60,angle:0,vehicle:'walk',scene:'world',npc:true},{id:'npc-rosie',name:'Rosie · computer',x:-90,y:60,angle:0,vehicle:'walk',scene:'world',npc:true}];
let tick=0,tag={active:false,it:null,cooldown:0};
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));}
function fail(status,message){const e=Error(message);e.status=status;throw e;}
async function body(req){let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>4096)fail(413,'Request too large.');chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{fail(400,'Invalid request.');}}
function session(req){const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jh_session='));if(!cookie)return null;const hash=digest(cookie.slice(11));const s=db.prepare('SELECT * FROM sessions WHERE hash=? AND expires>?').get(hash,Date.now());return s?{...s,hash}:null;}
function newSession(res,role,profile=null){const raw=token();db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(digest(raw),role,profile,Date.now()+7*86400000);res.setHeader('Set-Cookie',`jh_session=${raw}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure?'; Secure':''}`);}
function parent(s){if(s.role!=='parent')fail(403,'Mommy sign-in required.');}
function profile(id){return db.prepare('SELECT * FROM profiles WHERE id=?').get(id);}
function save(p){db.prepare('UPDATE profiles SET data=? WHERE id=?').run(JSON.stringify(p.data),p.profile);}
function leave(hash){const p=players.get(hash);if(p){save(p);players.delete(hash);}streams.get(hash)?.end();streams.delete(hash);}
function sceneBubbles(p){p.bubbles=Array.from({length:p.mode==='toddler'?5:8},()=>({id:token().slice(0,12),x:.12+Math.random()*.76,y:.15+Math.random()*.62,r:p.mode==='toddler'?.095:.065,color:Math.floor(Math.random()*4)}));}
function snapshot(){return {players:[...players.values()].map(publicPlayer),npcs:NPCS,cut:[...cut],tag,clock:tick};}
function emit(){const data=`data: ${JSON.stringify(snapshot())}\n\n`;for(const [hash,res] of streams){const s=db.prepare('SELECT expires FROM sessions WHERE hash=?').get(hash);if(!s||s.expires<Date.now()){leave(hash);continue;}if(!res.write(data)&&res.writableLength>100000)res.destroy();}}
function throttle(req){const key=req.socket.remoteAddress;const now=Date.now(),a=attempts.get(key)||{start:now,count:0};if(now-a.start>600000){a.start=now;a.count=0;}attempts.set(key,a);if(++a.count>12)fail(429,'Please wait before trying again.');}
const server=createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','SAMEORIGIN');
 res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 try{
 const url=new URL(req.url,origin),path=url.pathname,s=session(req);
 if(req.method==='POST'&&req.headers.origin!==origin)fail(403,'Unapproved request origin.');
 if(path==='/api/login'&&req.method==='POST'){throttle(req);const b=await body(req),hash=db.prepare('SELECT value FROM settings WHERE key=?').get('parent');if(typeof b.password!=='string'||b.password.length>256||!hash||!checkPassword(b.password,hash.value))fail(401,'Sign-in unsuccessful.');if(s)leave(s.hash);newSession(res,'parent');return json(res,200,{ok:true});}
 if(path==='/api/invite/accept'&&req.method==='POST'){throttle(req);const b=await body(req);if(typeof b.token!=='string')fail(400,'Invitation required.');const i=db.prepare('SELECT * FROM invites WHERE hash=? AND used=0 AND expires>?').get(digest(b.token),Date.now());if(!i)fail(401,'Invitation expired or already used.');db.prepare('UPDATE invites SET used=1 WHERE hash=?').run(i.hash);newSession(res,'device',i.profile);return json(res,200,{ok:true});}
 if(path==='/api/me'){if(!s)return json(res,401,{error:'Please ask Mommy to sign in or invite this device.'});const rows=s.role==='parent'?db.prepare('SELECT id,name,mode FROM profiles').all():db.prepare('SELECT id,name,mode FROM profiles WHERE id=?').all(s.profile);return json(res,200,{role:s.role,profiles:rows,selected:players.get(s.hash)?.profile});}
 if(path.startsWith('/api/')){
 if(!s)fail(401,'Please sign in.');
 if(path==='/api/logout'&&req.method==='POST'){leave(s.hash);db.prepare('DELETE FROM sessions WHERE hash=?').run(s.hash);res.setHeader('Set-Cookie','jh_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true});}
 if(path==='/api/invites'&&req.method==='POST'){parent(s);const b=await body(req);let id=b.profile;if(b.guestName){if(typeof b.guestName!=='string'||b.guestName.length>24)fail(400,'Guest name is too long.');id='guest-'+token().slice(0,8);db.prepare('INSERT INTO profiles VALUES (?,?,?,?)').run(id,b.guestName,'preschool',JSON.stringify({pops:0,inventory:[],preferences:{sound:true},characterAsset:null}));}if(!profile(id)||id==='mommy')fail(400,'Choose a child, Unique, or approved guest.');const t=token();db.prepare('INSERT INTO invites VALUES (?,?,?,0)').run(digest(t),id,Date.now()+3600000);return json(res,200,{token:t,expiresIn:3600,profile:id});}
 if(path==='/api/devices'&&req.method==='GET'){parent(s);return json(res,200,{devices:db.prepare('SELECT hash,role,profile,expires FROM sessions').all().map(d=>({...d,current:d.hash===s.hash}))});}
 if(path==='/api/revoke'&&req.method==='POST'){parent(s);const b=await body(req);if(typeof b.hash!=='string'||b.hash===s.hash)fail(400,'Use sign out for the current device.');leave(b.hash);db.prepare('DELETE FROM sessions WHERE hash=?').run(b.hash);return json(res,200,{ok:true});}
 if(path==='/api/select'&&req.method==='POST'){const b=await body(req),pr=profile(b.profile);if(!pr||(s.role!=='parent'&&s.profile!==pr.id))fail(403,'Profile unavailable on this device.');if([...players.entries()].some(([h,p])=>h!==s.hash&&p.profile===pr.id))fail(409,'This profile is already playing on another device.');leave(s.hash);const p=makePlayer(s.hash.slice(0,12),pr,JSON.parse(pr.data));players.set(s.hash,p);if(pr.id!=='mommy'&&s.role==='parent')db.prepare('UPDATE sessions SET role=?,profile=? WHERE hash=?').run('device',pr.id,s.hash);return json(res,200,{player:publicPlayer(p),data:p.data,bubbles:p.bubbles});}
 if(path==='/api/resume'&&req.method==='POST'){const current=players.get(s.hash);if(!current)fail(409,'Choose a profile first.');current.scene='world';return json(res,200,{player:publicPlayer(current),data:current.data,bubbles:current.bubbles});}
 const p=players.get(s.hash);if(!p)fail(409,'Choose a profile first.');p.lastSeen=Date.now();
 if(path==='/api/events'&&req.method==='GET'){streams.get(s.hash)?.end();res.writeHead(200,{'Content-Type':'text/event-stream','Connection':'keep-alive','X-Accel-Buffering':'no'});streams.set(s.hash,res);res.write(`data: ${JSON.stringify(snapshot())}\n\n`);req.on('close',()=>{if(streams.get(s.hash)===res)streams.delete(s.hash);});return;}
 if(path==='/api/input'&&req.method==='POST'){const b=await body(req);p.input={gas:clamp(Number(b.gas)||0,0,1),brake:clamp(Number(b.brake)||0,0,1),steer:clamp(Number(b.steer)||0,-1,1)};p.inputAt=Date.now();return json(res,200,{ok:true});}
 if(path==='/api/action'&&req.method==='POST'){const b=await body(req);
 if(b.action==='vehicle'&&p.scene==='world'){p.vehicle=p.vehicle==='car'?'walk':'car';p.engine=false;p.speed=0;}
 else if(b.action==='start')p.engine=!p.engine;
 else if(b.action==='enter'&&p.scene==='world'){const l=nearby(p);if(!l)fail(409,'Move closer to a doorway.');if(l.action==='mower'){p.vehicle='mower';p.x=-300;p.y=290;p.engine=false;p.speed=0;}else{p.scene=l.action;p.speed=0;p.input={gas:0,brake:0,steer:0};if(p.scene==='bubbles')sceneBubbles(p);}}
 else if(b.action==='exit'){p.scene='world';p.speed=0;if(p.vehicle==='mower')p.vehicle='walk';}
 else if(b.action==='tag'&&p.scene==='world'){tag={active:!tag.active,it:p.id,cooldown:Date.now()+2500};}
 else if(b.action==='preferences'){if(typeof b.sound!=='boolean')fail(400,'Invalid preference.');p.data.preferences.sound=b.sound;save(p);}
 else if(b.action==='pop'&&p.scene==='bubbles'){const bubble=p.bubbles.find(x=>x.id===b.id);if(!bubble)fail(409,'Bubble already popped.');p.bubbles=p.bubbles.filter(x=>x!==bubble);p.data.pops++;save(p);p.bubbles.push({id:token().slice(0,12),x:.12+Math.random()*.76,y:.15+Math.random()*.62,r:p.mode==='toddler'?.095:.065,color:Math.floor(Math.random()*4)});}
 else fail(400,'Action unavailable.');
 return json(res,200,{player:publicPlayer(p),data:p.data,bubbles:p.bubbles});}
 fail(404,'Unknown action.');
 }
 let file;
 if(path==='/'||path==='/index.html')file=resolve(client,'index.html');
 else if(path.startsWith('/client/'))file=resolve(client,decodeURIComponent(path.slice(8)));
 else if(path.startsWith('/classic/')){if(!s){res.writeHead(302,{Location:'/'});return res.end();}const name=decodeURIComponent(path.slice(9)||'index.html');file=resolve(root,name);if(!file.startsWith(root+'/')||(!['.html','.jpg','.png','.mp3'].includes(extname(file)))||name.startsWith('world/'))fail(404,'Not found.');}
 else fail(404,'Not found.');
 if(!path.startsWith('/classic/')&&file!==resolve(client,'index.html')&&!file.startsWith(client+'/'))fail(404,'Not found.');
 if(!(await stat(file)).isFile())fail(404,'Not found.');
 let content=await readFile(file);const ext=extname(file);
 if(path==='/classic/together.html'){let html=content.toString().replace('<script src="https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js"></script>','');html=html.replace("let peer=null", "document.getElementById('host').disabled=true;document.getElementById('join').disabled=true;document.getElementById('room').disabled=true;let peer=null");html=html.replace('For separate iPads/phones, one person taps Create Room and tells the others the 5-letter code.','Classic cooperative games currently support one-device play here. Private shared-world play uses approved family sessions.');content=Buffer.from(html);}
 if(path.startsWith('/classic/')&&ext==='.html'){content=Buffer.from(content.toString().replace('</body>','<a href="/" style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;background:white;color:#17335c;padding:10px 16px;border-radius:18px;font:bold 15px Arial;text-decoration:none">Return to Our World</a></body>'));}
 const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.mp3':'audio/mpeg'};
 if(!path.startsWith('/classic/'))res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'");
 res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});res.end(content);
 }catch(e){json(res,e.status||((e.code==='ENOENT')?404:500),{error:e.status?e.message:'Request could not be completed.'});if(!e.status&&e.code!=='ENOENT')console.error(e);}
});
const interval=setInterval(()=>{tick++;for(const [h,p] of players){if(Date.now()-p.lastSeen>30000){leave(h);continue;}if(Date.now()-(p.inputAt||0)>450)p.input={gas:0,brake:0,steer:0};step(p,.05);const before=cut.size;cutGrass(p,cut);if(cut.size!==before){p.data.grassCut=(p.data.grassCut||0)+cut.size-before;save(p);db.prepare('INSERT OR REPLACE INTO settings VALUES (?,?)').run('lawn',JSON.stringify([...cut]));}}
 NPCS.forEach((n,i)=>{const target=tag.active&&tag.it===n.id?[...players.values()].find(p=>p.scene==='world'):null;if(target){n.angle=Math.atan2(target.x-n.x,-(target.y-n.y));n.x+=Math.sin(n.angle)*2;n.y-=Math.cos(n.angle)*2;}else{n.x=Math.cos(tick/110+i*3)*130;n.y=70+Math.sin(tick/110+i*3)*100;}});
 if(tag.active&&Date.now()>tag.cooldown){const all=[...players.values()].filter(p=>p.scene==='world'&&p.vehicle==='walk').concat(NPCS),it=all.find(p=>p.id===tag.it);if(it){const hit=all.find(p=>p.id!==it.id&&Math.hypot(p.x-it.x,p.y-it.y)<28);if(hit){tag.it=hit.id;tag.cooldown=Date.now()+2500;}}}
 if(tick%2===0)emit();if(tick%1200===0){db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());for(const [key,a] of attempts)if(Date.now()-a.start>600000)attempts.delete(key);}
},50);
server.listen(port,host,()=>console.log(`Family world running at ${origin}. Persistent data: ${process.env.WORLD_DATA_DIR||'data'}`));
function shutdown(){clearInterval(interval);for(const h of players.keys())leave(h);server.close(()=>{db.close();process.exit(0);});}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
