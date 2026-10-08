import {ParkSession} from './playpark/session.mjs?v=hide-2';
import {TogetherSession} from './together-session.mjs?v=family-3';
import {MovieSession} from './theater/session.mjs?v=family-3';
import { makePlayer, step, cutGrass, nearby, publicPlayer, clamp } from '../server/simulation.mjs?v=illustrated-1';
import {TOWN_PLACES,VISIT_IDS} from './town-destinations.mjs?v=zoo-1';
import {BowlingLane} from './bowling-physics.mjs?v=family-3';
import {RaceSession} from './racing/session.mjs?v=family-race-1';
export const FAMILY = [
  { id: 'jace', name: 'Jace', mode: 'preschool' },
  { id: 'halli', name: 'Halli', mode: 'toddler' },
  { id: 'mommy', name: 'Mommy', mode: 'adult' },
  { id: 'unique', name: 'Unique', mode: 'older' },
];
const fresh = () => ({ pops: 0, grassCut: 0, inventory: [], preferences: { sound: true }, characterAsset: null });
const uid = () => globalThis.crypto.randomUUID();
export class FamilyGame {
  constructor(saved = {}, save = () => {}) {
    this.profiles = [...FAMILY, ...(saved.guests || [])];
    this.progress = saved.progress || {};
    this.cut = new Set(saved.cut || []);
    this.players = new Map();
    this.saveCallback = save;
    this.tag = { active: false, it: null, cooldown: 0 };
    this.clock = 0;
    this.bowling = new BowlingLane();this.cinema=new MovieSession();this.together=new TogetherSession();this.playpark=new ParkSession();
    this.racing = new RaceSession((r,g,serial)=>{
      const p=this.players.get(r.id);if(!p||p.profile!==r.profile)return;
      p.data.racing ||= {};const old=p.data.racing[g.track.id];
      p.data.racing[g.track.id]={bestLap:Math.min(old?.bestLap||Infinity,...r.lapTimes),bestRace:Math.min(old?.bestRace||Infinity,r.finishTime),races:(old?.races||0)+1,lastId:'family-'+serial+'-'+Date.now(),lastCar:r.car.id,lastPosition:g.order().findIndex(o=>o.id===r.id)+1};this.save();
    });
    this.npcs = [
      { id: 'npc-pip', name: 'Pip · computer', x: 90, y: 60, angle: 0, vehicle: 'walk', scene: 'world', npc: true },
      { id: 'npc-rosie', name: 'Rosie · computer', x: -90, y: 60, angle: 0, vehicle: 'walk', scene: 'world', npc: true },
    ];
  }
  save() {
    for (const p of this.players.values()) this.progress[p.profile] = p.data;
    this.saveCallback({ version: 1, progress: this.progress, cut: [...this.cut], guests: this.profiles.filter(p => p.id.startsWith('guest-')) });
  }
  guest(name) {
    const clean = typeof name === 'string' ? name.trim().slice(0, 24) : '';
    if (!clean) throw Error('Enter a guest’s first name.');
    const p = { id: 'guest-' + uid(), name: clean, mode: 'preschool' };
    this.profiles.push(p);
    this.save();
    return p;
  }
  select(id, profileId) {
    const profile = this.profiles.find(p => p.id === profileId);
    if (!profile) throw Error('Choose an approved profile.');
    if ([...this.players.entries()].some(([other, p]) => other !== id && p.profile === profileId)) throw Error('That profile is already playing.');
    const old = this.players.get(id);
    this.racing.leave(id);this.cinema.leave(id);this.together.leave(id);this.playpark.leave(id);
    if(old?.scene==='bowling')this.bowling.leave(id);
    if (old) this.progress[old.profile] = old.data;
    const p = makePlayer(id, profile, this.progress[profile.id] || fresh());
    this.players.set(id, p);
    this.save();
    return this.reply(p);
  }
  leave(id) {
    this.racing.leave(id);this.cinema.leave(id);this.together.leave(id);this.playpark.leave(id);
    this.bowling.leave(id);
    const p = this.players.get(id);
    if (p) this.progress[p.profile] = p.data;
    this.players.delete(id);
    if (this.tag.it === id) this.tag.active = false;
    this.save();
  }
  reply(p) { return { player: publicPlayer(p), data: p.data, bubbles: p.bubbles }; }
  request(id, path, body = {}) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('Invalid action.');
    if (path === 'select') return this.select(id, body.profile);
    const p = this.players.get(id);
    if (!p) throw Error('Choose a profile first.');
    p.lastSeen = Date.now();
    if(path==='playpark')return this.playpark.request(p,body);
    if(path==='together')return this.together.request(p,body);
    if(path==='cinema')return this.cinema.request(p,body);
    if(path==='race')return this.racing.request(p,body);
    if (path === 'resume') { if(p.scene==='bowling')this.bowling.leave(id);p.scene = 'world';p.destination=null; return this.reply(p); }
    if (path === 'input') {
      p.input = { gas: clamp(Number(body.gas) || 0, 0, 1), brake: clamp(Number(body.brake) || 0, 0, 1), steer: clamp(Number(body.steer) || 0, -1, 1) };
      p.inputAt = Date.now();
      return { ok: true };
    }
    if (path !== 'action') throw Error('Unknown action.');
    const action = body.action;
    if(action==='visit'){
      if(!VISIT_IDS.has(body.destination))throw Error('Choose a place in our town.');
      if(p.scene==='bowling'&&body.destination!=='bowling')this.bowling.leave(id);
      p.destination=body.destination;p.speed=0;p.engine=false;p.input={gas:0,brake:1,steer:0};p.vehicle='walk';
      p.scene=body.destination==='bowling'?'bowling':TOWN_PLACES.find(d=>d.id===body.destination).scene;
      if(body.destination==='yard'){p.vehicle='mower';p.x=-300;p.y=290;p.angle=0;}
      if(p.scene==='bubbles')this.makeBubbles(p);
      if(p.scene==='bowling')this.bowling.join(p);
    }
    else if(action==='bowl'&&p.scene==='bowling')this.bowling.throw(id,{aim:body.aim,power:body.power,start:body.start});
    else if(action==='ball-color'&&p.scene==='bowling')this.bowling.color(id,body.color);
    else if(action==='bowl-reset'&&p.scene==='bowling')this.bowling.reset(id);
    else if (action === 'vehicle' && p.scene === 'world') { p.vehicle = p.vehicle === 'car' ? 'walk' : 'car'; p.engine = false; p.speed = 0; }
    else if (action === 'start' && p.scene === 'world' && p.vehicle !== 'walk') p.engine = !p.engine;
    else if (action === 'enter' && p.scene === 'world') {
      const location = nearby(p);
      if (!location) throw Error('Move closer to the door.');
      if (location.action === 'mower') { p.vehicle = 'mower'; p.x = -300; p.y = 290; p.engine = false; p.speed = 0; }
      else { p.scene = location.action; p.speed = 0; p.input = { gas: 0, brake: 0, steer: 0 }; if (p.scene === 'bubbles') this.makeBubbles(p); }
    } else if (action === 'exit') { if(p.scene==='bowling')this.bowling.leave(id);p.scene = 'world';p.destination=null; p.speed = 0; p.engine = false;p.input={gas:0,brake:1,steer:0}; if (p.vehicle === 'mower') p.vehicle = 'walk'; }
    else if (action === 'tag' && p.scene === 'world' && p.vehicle === 'walk') this.tag = { active: !this.tag.active, it: p.id, cooldown: Date.now() + 2500 };
    else if(action==='creativity'&&p.scene!=='creativity'){if(p.scene==='bowling'){this.bowling.leave(id);p.artReturn='arcade';}else p.artReturn=p.scene;p.scene='creativity';p.speed=0;p.engine=false;p.input={gas:0,brake:0,steer:0};}
    else if(action==='art-exit'&&p.scene==='creativity'){p.scene=p.artReturn||'world';p.artReturn=null;p.speed=0;p.input={gas:0,brake:0,steer:0};}
    else if(action==='race-result'){
      if(this.racing.members.has(id))throw Error('Family race records are saved by the host.');
      // These are personal arcade records, not a trusted competitive leaderboard.
      if(!['neon','dino','speedway','beach','country'].includes(body.track)||!['comet','spark','thunder','monster'].includes(body.car)||typeof body.id!=='string'||body.id.length>80||!Array.isArray(body.laps)||body.laps.length!==3||body.laps.some(t=>!Number.isFinite(t)||t<20||t>3600)||!Number.isInteger(body.position)||body.position<1||body.position>8)throw Error('Invalid race result.');
      p.data.racing ||= {};const previous=p.data.racing[body.track];
      if(previous?.lastId!==body.id){p.data.racing[body.track]={bestLap:Math.min(previous?.bestLap||Infinity,...body.laps),bestRace:Math.min(previous?.bestRace||Infinity,body.laps.reduce((sum,t)=>sum+t,0)),races:(previous?.races||0)+1,lastId:body.id,lastCar:body.car,lastPosition:body.position};}
    }
    else if (action === 'preferences') { if (typeof body.sound !== 'boolean') throw Error('Invalid preference.'); p.data.preferences.sound = body.sound; }
    else if (action === 'pop' && p.scene === 'bubbles') {
      const bubble = p.bubbles.find(b => b.id === body.id);
      if (!bubble) throw Error('That bubble already popped.');
      p.bubbles = p.bubbles.filter(b => b !== bubble);
      p.data.pops++;
      p.bubbles.push(this.bubble(p));
    } else throw Error('That action is not available.');
    this.save();
    return this.reply(p);
  }
  bubble(p) { return { id: uid(), x: .12 + Math.random() * .76, y: .15 + Math.random() * .62, r: p.mode === 'toddler' ? .13 : .085, color: Math.floor(Math.random() * 4) }; }
  makeBubbles(p) { p.bubbles = Array.from({ length: p.mode === 'toddler' ? 5 : 8 }, () => this.bubble(p)); }
  tick(dt, now = Date.now()) {
    this.racing.tick(dt);this.playpark.tick(dt);
    this.clock++;
    this.bowling.tick(Math.min(.05,dt));
    let changed = false;
    if(this.bowling.phase==='complete'&&this.bowling.sequence!==this.lastBowlingResult){
      this.lastBowlingResult=this.bowling.sequence;
      for(const member of this.bowling.snapshot().members){const player=this.players.get(member.id);if(player){player.data.bowlingBest=Math.max(player.data.bowlingBest||0,member.score.total);player.data.bowlingGames=(player.data.bowlingGames||0)+1;changed=true;}}
    }
    for (const p of this.players.values()) {
      if (now - (p.inputAt || 0) > 500) p.input = { gas: 0, brake: 0, steer: 0 };
      step(p, Math.min(.05, dt));
      const before = this.cut.size;
      cutGrass(p, this.cut);
      if (before !== this.cut.size) { p.data.grassCut += this.cut.size - before; changed = true; }
    }
    this.npcs.forEach((n, i) => {
      const target = this.tag.active && this.tag.it === n.id ? [...this.players.values()].find(p => p.scene === 'world' && p.vehicle === 'walk') : null;
      if (target) { n.angle = Math.atan2(target.x - n.x, -(target.y - n.y)); n.x += Math.sin(n.angle) * 40 * dt; n.y -= Math.cos(n.angle) * 40 * dt; }
      else { n.x = Math.cos(this.clock / 110 + i * 3) * 130; n.y = 70 + Math.sin(this.clock / 110 + i * 3) * 100; }
    });
    if (this.tag.active && now > this.tag.cooldown) {
      const all = [...this.players.values()].filter(p => p.scene === 'world' && p.vehicle === 'walk').concat(this.npcs);
      const it = all.find(p => p.id === this.tag.it);
      const contact = it && all.find(p => p.id !== it.id && Math.hypot(p.x - it.x, p.y - it.y) < 28);
      if (contact) { this.tag.it = contact.id; this.tag.cooldown = now + 2500; }
    }
    if (changed) this.save();
  }
  snapshot(viewer="host") { return { playpark:this.playpark.snapshot(viewer), players: [...this.players.values()].map(publicPlayer), npcs: this.npcs, cut: [...this.cut], tag: this.tag, clock: this.clock, together:this.together.snapshot(),cinema:this.cinema.snapshot(),bowling:this.bowling.snapshot(), racing:this.racing.snapshot() }; }
}
