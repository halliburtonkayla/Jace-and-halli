import { GalleryService } from './creativity/gallery.mjs?v=studio-1';
import { FAMILY, FamilyGame } from './family-game.mjs?v=creativity-1';
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newCode() { const bytes = new Uint8Array(10); crypto.getRandomValues(bytes); return [...bytes].map(v => alphabet[v % alphabet.length]).join(''); }
export function normalizeCode(value) { return String(value || '').toUpperCase().replace(/[\s-]/g, ''); }
const storageKey = 'jace-halli-world.family.v1';
export class FamilyRoom extends EventTarget {
  constructor({ PeerClass = globalThis.Peer, storage = globalThis.localStorage, galleryService = new GalleryService() } = {}) {
    super(); this.galleryService=galleryService; this.PeerClass = PeerClass; this.storage = storage; this.peer = null; this.host = false; this.game = null; this.connections = new Map(); this.pending = new Map(); this.requests = new Map(); this.profile = null; this.selected = null; this.code = ''; this.connected = false; this.timer = null; this.closing = false;
  }
  emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { detail })); }
  save(state) { try { this.storage?.setItem(storageKey, JSON.stringify(state)); } catch { this.emit('status', 'Progress cannot be saved on this browser. Play still works.'); } }
  read() { try { const value = JSON.parse(this.storage?.getItem(storageKey) || '{}'); return value.version === 1 ? value : {}; } catch { return {}; } }
  async create() {
    this.close(); this.closing = false; this.host = true; this.code = newCode(); this.game = new FamilyGame(this.read(), state => this.save(state)); this.connected = true;
    this.timer = setInterval(() => { this.game.tick(.05); if (this.game.clock % 2 === 0) this.broadcast(); }, 50);
    if (!this.PeerClass) { this.emit('status', 'One-device play is ready. Multiplayer library could not load; reconnect to the internet to open a shared room.'); return this.me(); }
    this.peer = new this.PeerClass('jh-world-' + this.code.toLowerCase(), { secure: true, debug: 0 });
    this.peer.on('connection', connection => this.receiveGuest(connection));
    this.peer.on('error', error => this.emit('status', error.type === 'unavailable-id' ? 'Room code was already taken. Start a new room.' : 'Shared connection is unavailable. One-device play still works.'));
    this.peer.on('open', () => { this.emit('status', 'Room ready. Keep this hosting page open while everyone plays.'); this.emit('ready', this.code); });
    this.peer.on('disconnected', () => { if(this.closing)return;this.emit('status', 'New joins are temporarily unavailable. Existing connections may continue.'); if (!this.peer.destroyed) this.peer.reconnect(); });
    return this.me();
  }
  async join(code, profile, guestName = '') {
    this.close(); this.closing = false; this.code = normalizeCode(code); this.host = false;
    if (!/^[A-Z2-9]{10}$/.test(this.code)) throw Error('Enter the 10-character family room code.');
    if (!FAMILY.some(p => p.id === profile && p.id !== 'mommy') && profile !== 'guest') throw Error('Choose Jace, Halli, Unique, or an approved guest.');
    if (profile === 'guest' && (!guestName.trim() || guestName.length > 24)) throw Error('Enter the guest’s first name.');
    if (!this.PeerClass) throw Error('The multiplayer library could not load. Check your internet connection.');
    this.peer = new this.PeerClass(undefined, { secure: true, debug: 0 });
    return new Promise((resolve, reject) => {
      let finished = false;
      const fail = message => { if (!finished) { finished = true; clearTimeout(timeout); this.close(); reject(Error(message)); } else if (!this.closing) { this.connected = false; this.emit('lost', message); } };
      const timeout = setTimeout(() => fail('No room response. Ask Mommy to keep her hosting page open, check the code, and try again.'), 45000);
      this.peer.on('error', () => fail('Could not reach the room. Check the code, host page, and Wi-Fi.'));
      this.peer.on('open', () => {
        const conn = this.peer.connect('jh-world-' + this.code.toLowerCase(), { reliable: true, serialization: 'json', metadata: { version: 1 } }); this.connection = conn;
        conn.on('open', () => { conn.send({ type: 'hello', profile, guestName }); this.emit('status', 'Waiting for Mommy to approve this device…'); });
        conn.on('data', message => {
          if (!message || typeof message !== 'object') return;
          if (message.type === 'approved') { this.profile = message.profile; this.connected = true; clearTimeout(timeout); finished = true; resolve(this.me()); }
          else if (message.type === 'declined') fail('Mommy did not approve this connection.');
          else if (message.type === 'snapshot' && this.connected) { this.lastSnapshot = Date.now(); this.emit('snapshot', message.state); }
          else if (message.type === 'reply') { const pending = this.requests.get(message.id); if (!pending) return; clearTimeout(pending.timeout); this.requests.delete(message.id); message.error ? pending.reject(Error(message.error)) : pending.resolve(message.result); }
        });
        conn.on('close', () => fail('The hosting device closed the room. Rejoin when Mommy opens a new room.'));
        conn.on('error', () => fail('The connection stopped. Check both devices and rejoin.'));
      });
    });
  }
  receiveGuest(conn) {
    if (this.connections.size + this.pending.size >= 8) { conn.close(); return; }
    const record = { conn, approved: false, profile: null, requested: null, lastRequest: 0, requestCount: 0, lastWindow: Date.now() };
    this.connections.set(conn.peer, record);
    const expire = setTimeout(() => { if (!record.approved) this.deny(conn.peer); }, 40000);
    conn.on('data', async message => {
      if (!message || typeof message !== 'object') return;
      try { if (JSON.stringify(message).length > 4096) { this.deny(conn.peer); return; } } catch { this.deny(conn.peer); return; }
      if (!record.approved) {
        if (message.type !== 'hello' || record.requested) return;
        const family = FAMILY.find(p => p.id === message.profile && p.id !== 'mommy');
        if (!family && message.profile !== 'guest') { this.deny(conn.peer); return; }
        const name = message.profile === 'guest' && typeof message.guestName === 'string' ? message.guestName.trim().slice(0, 24) : family?.name;
        if (!name) { this.deny(conn.peer); return; }
        record.requested = { id: conn.peer, profile: family?.id || 'guest', name };
        this.pending.set(conn.peer, record); this.emit('requests', this.pendingList()); return;
      }
      if (message.type !== 'request' || typeof message.id !== 'string' || message.id.length > 80) return;
      if (Date.now() - record.lastWindow > 1000) { record.lastWindow = Date.now(); record.requestCount = 0; }
      if (++record.requestCount > 35) return;
      try {
        if (!['select', 'input', 'action', 'resume','art-list','art-read','art-begin','art-part','art-finish'].includes(message.path)) throw Error('Unknown room request.');
        if (message.path === 'select' && message.body?.profile !== record.profile.id) throw Error('Use the profile Mommy approved.');
        const result = message.path.startsWith('art-') ? await this.galleryService.request(conn.peer,this.game.players.get(conn.peer)?.profile,message.path,message.body) : this.game.request(conn.peer, message.path, message.body);
        conn.send({ type: 'reply', id: message.id, result });
      } catch (error) { conn.send({ type: 'reply', id: message.id, error: error.message }); }
    });
    const closed = () => { clearTimeout(expire); this.galleryService.forget(conn.peer); this.connections.delete(conn.peer); this.pending.delete(conn.peer); this.game?.leave(conn.peer); this.emit('requests', this.pendingList()); };
    conn.on('close', closed); conn.on('error', closed);
  }
  pendingList() { return [...this.pending.values()].map(record => record.requested); }
  approve(id) {
    const record = this.pending.get(id); if (!record) throw Error('This join request expired.');
    record.profile = record.requested.profile === 'guest' ? this.game.guest(record.requested.name) : FAMILY.find(p => p.id === record.requested.profile);
    record.approved = true; this.pending.delete(id); record.conn.send({ type: 'approved', profile: record.profile }); this.emit('requests', this.pendingList());
  }
  deny(id) { const record = this.connections.get(id); if (!record) return; record.approved = false; this.game?.leave(id); try { if (record.conn.open) record.conn.send({ type: 'declined' }); } catch {} setTimeout(() => record.conn.close(), 100); this.pending.delete(id); this.emit('requests', this.pendingList()); }
  me() { return { role: this.host ? 'parent' : 'device', profiles: this.host ? this.game.profiles : [this.profile], selected: this.selected }; }
  async request(path, body) {
    if (!this.connected) throw Error('The room is disconnected. Rejoin to play together.');
    if (path === 'me') return this.me();
    if (path === 'logout') { this.close(); return { ok: true }; }
    if (this.host) { const result = path.startsWith('art-') ? await this.galleryService.request('host',this.game.players.get('host')?.profile,path,body) : this.game.request('host', path, body); if (path === 'select') this.selected = body.profile; return result; }
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => { const timeout = setTimeout(() => { this.requests.delete(id); reject(Error('The host did not respond. Keep the hosting page open.')); }, 6000); this.requests.set(id, { resolve, reject, timeout }); this.connection.send({ type: 'request', id, path, body }); if (path === 'select') this.selected = body.profile; });
  }
  broadcast() {
    const state = this.game.snapshot(); this.emit('snapshot', state);
    for (const record of this.connections.values()) if (record.approved && record.conn.open && (record.conn.dataChannel?.bufferedAmount || 0) < 64000) record.conn.send({ type: 'snapshot', state });
  }
  close() {
    this.closing = true; this.galleryService.uploads.clear(); clearInterval(this.timer); this.timer = null; this.game?.save(); this.connected = false;
    this.peer?.destroy(); this.peer = null; this.connection = null; this.connections.clear(); this.pending.clear();
    for (const r of this.requests.values()) { clearTimeout(r.timeout); r.reject(Error('Room closed.')); } this.requests.clear(); this.profile = null; this.selected = null;
  }
}
