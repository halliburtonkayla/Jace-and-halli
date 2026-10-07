import { makePlayer, step, cutGrass, nearby, publicPlayer, clamp } from '../server/simulation.mjs';
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
    if (old) this.progress[old.profile] = old.data;
    const p = makePlayer(id, profile, this.progress[profile.id] || fresh());
    this.players.set(id, p);
    this.save();
    return this.reply(p);
  }
  leave(id) {
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
    if (path === 'resume') { p.scene = 'world'; return this.reply(p); }
    if (path === 'input') {
      p.input = { gas: clamp(Number(body.gas) || 0, 0, 1), brake: clamp(Number(body.brake) || 0, 0, 1), steer: clamp(Number(body.steer) || 0, -1, 1) };
      p.inputAt = Date.now();
      return { ok: true };
    }
    if (path !== 'action') throw Error('Unknown action.');
    const action = body.action;
    if (action === 'vehicle' && p.scene === 'world') { p.vehicle = p.vehicle === 'car' ? 'walk' : 'car'; p.engine = false; p.speed = 0; }
    else if (action === 'start' && p.scene === 'world' && p.vehicle !== 'walk') p.engine = !p.engine;
    else if (action === 'enter' && p.scene === 'world') {
      const location = nearby(p);
      if (!location) throw Error('Move closer to the door.');
      if (location.action === 'mower') { p.vehicle = 'mower'; p.x = -300; p.y = 290; p.engine = false; p.speed = 0; }
      else { p.scene = location.action; p.speed = 0; p.input = { gas: 0, brake: 0, steer: 0 }; if (p.scene === 'bubbles') this.makeBubbles(p); }
    } else if (action === 'exit') { p.scene = 'world'; p.speed = 0; p.engine = false; if (p.vehicle === 'mower') p.vehicle = 'walk'; }
    else if (action === 'tag' && p.scene === 'world' && p.vehicle === 'walk') this.tag = { active: !this.tag.active, it: p.id, cooldown: Date.now() + 2500 };
    else if(action==='creativity'&&p.scene!=='creativity'){p.artReturn=p.scene;p.scene='creativity';p.speed=0;p.engine=false;p.input={gas:0,brake:0,steer:0};}
    else if(action==='art-exit'&&p.scene==='creativity'){p.scene=p.artReturn||'world';p.artReturn=null;p.speed=0;p.input={gas:0,brake:0,steer:0};}
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
    this.clock++;
    let changed = false;
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
  snapshot() { return { players: [...this.players.values()].map(publicPlayer), npcs: this.npcs, cut: [...this.cut], tag: this.tag, clock: this.clock }; }
}
