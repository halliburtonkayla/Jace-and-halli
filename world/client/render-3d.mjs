import { createNeighborhood, position3D, heading3D, WORLD_SCALE } from './neighborhood.mjs';
import { LAWN } from './locations.mjs';

// Lazy-loaded after profile selection; pinned independently of the peer transport.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
const COLORS = { jace: '#309bd7', halli: '#ed84bc', mommy: '#dc6697', unique: '#a185d2' };

export class Renderer {
  constructor(canvas) {
    this.c = canvas; this.bubbleHits = []; this.ready = null; this.engine = null; this.failed = false;
    this.lastScene = null; this.lastPlayer = null; this.lastTime = 0; this.orbit = 0; this.highView = false;
    this.actors = new Map(); this.bubbleMeshes = new Map(); this.particles = [];
    this.overlay = document.createElement('canvas'); this.overlay.className = 'world-effects'; this.overlay.setAttribute('aria-hidden','true');
    canvas.after(this.overlay); this.ctx = this.overlay.getContext('2d');
    this.notice = document.createElement('div'); this.notice.className = 'render-notice hidden'; this.notice.setAttribute('role','status'); canvas.after(this.notice);
    this.resize(); this.bindLook();
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.contextLost = true; this.message('The 3D view paused. Waiting for it to recover…'); });
    canvas.addEventListener('webglcontextrestored', () => { this.contextLost = false; this.notice.classList.add('hidden'); });
  }
  message(text, retry = false) {
    this.notice.replaceChildren(document.createTextNode(text)); this.notice.classList.remove('hidden');
    if (retry) {
      const b = document.createElement('button'); b.textContent = 'Retry 3D view'; b.onclick = () => { this.failed = false; this.ready = null; this.prepare(); }; this.notice.append(b);
      const fallback = document.createElement('button'); fallback.textContent = 'Use the current playable view'; fallback.onclick = () => this.useCompatibility(); this.notice.append(fallback);
    }
  }
  get playable() { return Boolean(this.compatibility || this.engine && !this.contextLost); }
  async useCompatibility() {
    const { Renderer: CanvasRenderer } = await import('./render.mjs');
    if (!this.compatCanvas) { this.compatCanvas=document.createElement('canvas'); this.compatCanvas.className='world-effects'; this.c.after(this.compatCanvas); }
    this.compatibility=new CanvasRenderer(this.compatCanvas); this.notice.classList.add('hidden'); this.overlay.classList.add('hidden');
    this.c.dataset.renderer='canvas-compatibility'; this.c.dataset.viewReason='WebGL preview unavailable';
    const note=document.querySelector('.build-note'); if(note)note.textContent='Compatibility view · 3D preview unavailable on this device';
  }
  async prepare() {
    if (this.ready || this.failed) return this.ready;
    this.message('Opening our neighborhood…');
    this.ready = (async () => {
      try {
        const T = await import(THREE_URL); this.T = T;
        this.engine = new T.WebGLRenderer({ canvas: this.c, antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.engine.outputColorSpace = T.SRGBColorSpace; this.engine.toneMapping = T.ACESFilmicToneMapping; this.engine.toneMappingExposure = 1.15;
        this.engine.shadowMap.enabled = true; this.engine.shadowMap.type = T.PCFSoftShadowMap;
        this.scene = new T.Scene(); this.scene.background = new T.Color('#b9e1ee'); this.scene.fog = new T.Fog('#b9e1ee', 39, 100);
        this.camera = new T.PerspectiveCamera(55, this.w / this.h, .08, 150);
        this.scene.add(new T.HemisphereLight('#fff8e6', '#a4c28b', 2.2));
        const sun = new T.DirectionalLight('#fff3da', 3.0); sun.position.set(-20, 36, 16); sun.castShadow = true;
        sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 95 });
        sun.shadow.bias = -.001; sun.shadow.normalBias = .035; this.scene.add(sun);
        this.town = createNeighborhood(T); this.scene.add(this.town.root);
        this.cameraTarget = new T.Vector3(); this.cameraPosition = new T.Vector3(); this.smoothedPlayer = new T.Vector3();
        this.bubbleRoot = new T.Group(); this.scene.add(this.bubbleRoot);
        this.bubbleGeo = new T.SphereGeometry(1, 24, 16);
        this.bubbleMaterials = ['#ed93c1','#81c2e8','#f2d578','#9ddab1'].map(color => new T.MeshPhysicalMaterial({color,roughness:.13,metalness:.08,transparent:true,opacity:.53,clearcoat:1,side:T.FrontSide,depthWrite:false}));
        this.highlightMaterial = new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.78,depthWrite:false});
        this.markerGeometry = new T.TorusGeometry(.43,.035,8,28);
        this.traffic = [this.vehicle('#eab856'),this.vehicle('#9d8cce')]; this.traffic.forEach(v => this.scene.add(v));
        this.resize(); this.notice.classList.add('hidden'); this.c.dataset.renderer = 'webgl-3d'; this.failed = false;
      } catch (error) {
        console.error('Neighborhood renderer:', error); this.engine?.dispose(); this.engine = null; this.failed = true;
        this.message('The 3D preview needs WebGL 2 graphics. This device or connection could not open it. You can keep playing in the current view without leaving your room.', true);
      }
    })();
    return this.ready;
  }
  resize() {
    this.w = innerWidth; this.h = innerHeight; const d = Math.min(devicePixelRatio || 1, 1.5);
    this.overlay.width = this.w * d; this.overlay.height = this.h * d; this.ctx.setTransform(d,0,0,d,0,0);
    if (this.engine) { this.engine.setPixelRatio(d); this.engine.setSize(this.w,this.h,false); this.camera.aspect = this.w/this.h; this.camera.updateProjectionMatrix(); }
    this.compatibility?.resize();
  }
  bindLook() {
    let drag = null;
    this.c.addEventListener('pointerdown', e => { if (this.lastScene !== 'world') return; drag = {id:e.pointerId,x:e.clientX}; this.c.setPointerCapture(e.pointerId); });
    this.c.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; this.orbit -= (e.clientX-drag.x)*.007; drag.x = e.clientX; });
    const end = () => { drag = null; }; this.c.addEventListener('pointerup',end); this.c.addEventListener('pointercancel',end);
  }
  toggleCamera() { if(this.compatibility)return false; this.highView = !this.highView; this.orbit = 0; return this.highView; }
  vehicle(color, mower = false) {
    const T=this.T, g=new T.Group(), kit=this.town;
    const body=kit.box(g,mower?1.13:1.35,.48,mower?1.5:2.25,color,0,.66,0,.16);
    kit.box(g,1.16,.23,1.9,color,0,.48,0,.1);
    kit.box(g,1.08,.72,1.05,mower?'#51605e':color,0,1.18,.14,.16);
    if (!mower) {
      kit.box(g,.9,.45,.06,'#385f70',0,1.26,-.405,.07);
      kit.box(g,.89,.44,.06,'#577e8b',0,1.26,.69,.07);
      for(const x of [-.558,.558]) kit.box(g,.03,.43,.67,'#48717e',x,1.27,.13,.008);
      for(const x of [-.44,.44]) {kit.box(g,.29,.14,.08,'#fff1b1',x,.76,-1.135,.04);kit.box(g,.24,.12,.07,'#d86252',x,.7,1.13,.03);}
      kit.box(g,.63,.11,.06,'#344c59',0,.5,-1.155,.025);
      kit.box(g,1.3,.13,.12,'#dee7df',0,.36,1.1,.035);
    } else {
      kit.box(g,1.63,.19,1.0,'#5c6b5a',0,.21,.3,.07);
      kit.box(g,.56,.17,.5,'#353c3e',0,1.3,.1,.06);
      const handle=kit.cylinder(g,.035,.5,'#344849',0,1.42,-.28); handle.rotation.x=-.45;
    }
    g.userData.wheels=[];
    for(const x of [-.68,.68]) for(const z of [-.68,.7]) {
      const wheel = kit.cylinder(g,.3,.2,'#344650',x,.34,z); wheel.rotation.z=Math.PI/2; g.userData.wheels.push(wheel);
      const hub=kit.cylinder(g,.15,.215,'#c4d8d9',x,.34,z); hub.rotation.z=Math.PI/2;
    }
    g.userData.body=body; return g;
  }
  label(name,color) {
    const T=this.T, texture=this.town.textTexture(name,'#fff7e4',color);
    const mat=new T.SpriteMaterial({map:texture,depthTest:true,transparent:true});
    const sprite=new T.Sprite(mat); sprite.scale.set(2.0,.5,1); sprite.position.y=2.3; sprite.userData.ownedTexture=texture; return sprite;
  }
  actor(p) {
    const T=this.T, color=COLORS[p.profile]|| (p.npc?'#50877e':'#d4a84a'), g=new T.Group();
    // First-person walking avoids inventing family likenesses. Other walkers use explicit presence markers until approved rigs exist.
    if (p.vehicle !== 'walk') g.add(this.vehicle(color,p.vehicle==='mower'));
    else {
      const marker=new T.Mesh(this.markerGeometry,this.town.material(color)); marker.rotation.x=Math.PI/2; marker.position.y=.13; g.add(marker);
      g.userData.marker=marker;
    }
    g.userData.label=this.label(p.name,color); g.add(g.userData.label); g.userData.kind=p.vehicle;
    g.userData.tag=this.label('IT','#a95024'); g.userData.tag.position.y=2.95; g.userData.tag.scale.set(1,.35,1); g.add(g.userData.tag);
    this.scene.add(g); return g;
  }
  removeActor(g) {
    this.scene.remove(g);
    for(const key of ['label','tag']) {const s=g.userData[key]; s?.material.dispose(); s?.userData.ownedTexture?.dispose();}
  }
  draw(snapshot, me, bubbles, data, time) {
    if(this.compatibility){this.compatibility.draw(snapshot,me,bubbles,data,time);this.bubbleHits=this.compatibility.bubbleHits;return;}
    this.ctx.clearRect(0,0,this.w,this.h);
    if (!me) return;
    this.lastScene=me.scene;
    if (!this.engine) { if (!this.failed) this.prepare(); return; }
    if (this.contextLost || document.hidden) return;
    const T=this.T, dt=Math.min(.1, Math.max(.001,(time-this.lastTime)/1000)); this.lastTime=time;
    const isBubbles=me.scene==='bubbles'; this.bubbleRoot.visible=isBubbles;
    const all=[...snapshot.players,...snapshot.npcs].filter(p=>p.scene==='world');
    const visible=new Set();
    for(const p of all) {
      let g=this.actors.get(p.id);
      if(g?.userData.kind!==p.vehicle) {if(g)this.removeActor(g);g=this.actor(p);this.actors.set(p.id,g);}
      const target=position3D(p.x,p.y);
      g.position.lerp(new T.Vector3(target.x,target.y,target.z),1-Math.exp(-dt*16));
      g.rotation.y=heading3D(p.angle);
      g.visible=!isBubbles && !(p.id===me.id && p.vehicle==='walk');
      g.userData.tag.visible=Boolean(snapshot.tag.active && snapshot.tag.it===p.id);
      visible.add(p.id);
    }
    for(const [id,g] of this.actors) if(!visible.has(id)){this.removeActor(g);this.actors.delete(id);}
    this.town.updateGrass(snapshot.cut);
    // Ambient traffic follows the same streets, pausing at the intersection.
    this.traffic.forEach((car,i)=>{
      const phase=((snapshot.clock||0)*.033+i*29)%62, x=phase<30?phase-30:phase<32?0:phase-32;
      car.position.set(i?-x:x,0,i?1.03:-1.03);car.rotation.y=i?Math.PI/2:-Math.PI/2;car.visible=!isBubbles;
    });
    const target=position3D(me.x,me.y);
    const changed=this.lastPlayer!==me.id || this.wasBubble!==isBubbles;
    if(changed){this.smoothedPlayer.set(target.x,0,target.z);this.cameraAngle=me.angle;this.orbit=0;}
    this.smoothedPlayer.lerp(new T.Vector3(target.x,0,target.z),1-Math.exp(-dt*14));
    this.cameraAngle+=Math.atan2(Math.sin(me.angle-this.cameraAngle),Math.cos(me.angle-this.cameraAngle))*(1-Math.exp(-dt*5));
    if(isBubbles) {
      this.cameraPosition.set(14,2.8,-1.6);this.cameraTarget.set(14,2.8,-9);
    } else {
      const a=this.cameraAngle+this.orbit, walking=me.vehicle==='walk', distance=this.highView?14:walking?.1:5.8;
      const height=this.highView?11:walking?2:3.4;
      this.cameraPosition.set(this.smoothedPlayer.x-Math.sin(a)*distance,height,this.smoothedPlayer.z+Math.cos(a)*distance);
      this.cameraTarget.set(this.smoothedPlayer.x+Math.sin(a)*5,this.highView?.6:walking?1.8:1.25,this.smoothedPlayer.z-Math.cos(a)*5);
    }
    if(changed){this.camera.position.copy(this.cameraPosition);this.cameraTargetSmooth=this.cameraTarget.clone();}
    this.camera.position.lerp(this.cameraPosition,1-Math.exp(-dt*6));
    this.cameraTargetSmooth.lerp(this.cameraTarget,1-Math.exp(-dt*8));this.camera.lookAt(this.cameraTargetSmooth);this.camera.updateMatrixWorld();
    this.lastPlayer=me.id;this.wasBubble=isBubbles;
    this.updateBubbles(isBubbles?bubbles:[],time,data);
    this.engine.render(this.scene,this.camera);this.drawEffects(time);
    if(me.vehicle==='mower' && !isBubbles) this.badge(`${Math.round(snapshot.cut.length/(Math.ceil(LAWN.w/LAWN.cell)*Math.ceil(LAWN.h/LAWN.cell))*100)}% grass cut`,this.w/2,118);
    this.c.dataset.scene=me.scene; this.c.dataset.playerCount=String(snapshot.players.length);
    this.c.dataset.drawCalls=String(this.engine.info.render.calls);
  }
  updateBubbles(bubbles,time,data) {
    const T=this.T, ids=new Set();this.bubbleHits=[];
    for(const b of bubbles) {
      ids.add(b.id);let g=this.bubbleMeshes.get(b.id);
      if(!g){g=new T.Group();g.add(new T.Mesh(this.bubbleGeo,this.bubbleMaterials[b.color]));const shine=new T.Mesh(this.bubbleGeo,this.highlightMaterial);shine.position.set(-.32,.4,.84);shine.scale.set(.12,.23,.045);g.add(shine);this.bubbleRoot.add(g);this.bubbleMeshes.set(b.id,g);}
      const x=b.x*this.w, y=110+b.y*Math.max(120,this.h-230)+Math.sin(time*.001+b.x*9)*12, r=Math.max(34,b.r*Math.min(this.w,this.h));
      // Unproject the same screen coordinates used for touch detection. No viewport/hitbox mismatch.
      const vector=new T.Vector3(x/this.w*2-1,1-y/this.h*2,.4).unproject(this.camera);
      const direction=vector.sub(this.camera.position).normalize(), depth=4.2;
      const forward=new T.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion), distance=depth/direction.dot(forward);
      g.position.copy(this.camera.position).addScaledVector(direction,distance);
      const size=2*depth*Math.tan(this.camera.fov*Math.PI/360)*r/this.h;g.scale.setScalar(size);
      this.bubbleHits.push({...b,x,y,r});
      if(data?.pops>=30)this.badge(['BALL','CAR','BABY','MORE'][b.color],x,y,Math.max(12,r*.24));
    }
    for(const [id,g]of this.bubbleMeshes) if(!ids.has(id)){this.bubbleRoot.remove(g);this.bubbleMeshes.delete(id);}
  }
  badge(text,x,y,size=17) {
    const c=this.ctx;c.font=`800 ${size}px system-ui`;const w=c.measureText(text).width+26;
    c.fillStyle='#fff8eaeF';c.beginPath();c.roundRect(x-w/2,y-size,w,size+20,12);c.fill();c.textAlign='center';c.fillStyle='#274b59';c.fillText(text,x,y+4);
  }
  pop(x,y) {if(this.compatibility){this.compatibility.pop(x,y);return;}for(let i=0;i<20;i++)this.particles.push({x,y,vx:(Math.random()-.5)*210,vy:(Math.random()-.7)*230,born:performance.now(),color:['#f3ba51','#f197bf','#66bda2','#faf1d4'][i%4]});}
  drawEffects(time) {
    const c=this.ctx;this.particles=this.particles.filter(p=>time-p.born<900);
    for(const p of this.particles){const t=(time-p.born)/1000;c.globalAlpha=1-t/.9;c.fillStyle=p.color;c.beginPath();c.arc(p.x+p.vx*t,p.y+p.vy*t+110*t*t,4,0,Math.PI*2);c.fill();}c.globalAlpha=1;
  }
}
