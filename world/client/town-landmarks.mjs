// Scenery from the approved town layout. These are NOT activity launchers.
// Existing doorway coordinates and simulation limits deliberately stay unchanged.
export function addTownLandmarks(T, kit) {
  const {root,box,sphere,cylinder,mesh,material,geometries,materials,textures,makeCanvas,roof,windowPane,sign,tree,flower,lamp,fence}=kit;
  let serial=0;
  const geometry=g=>{geometries.set(`town-${serial++}`,g);return g;};
  const group=(name,x,z)=>{const g=new T.Group();g.name=name;g.position.set(x,0,z);root.add(g);return g;};
  const tube=(parent,points,r,color)=>mesh(parent,geometry(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),36,r,7,false)),color,0,0,0);
  const ring=(parent,r,t,color,x,y,z)=>{const m=mesh(parent,geometry(new T.TorusGeometry(r,t,8,48)),color,x,y,z);m.rotation.x=Math.PI/2;return m;};
  const cone=(parent,r,h,color,x,y,z)=>mesh(parent,geometry(new T.ConeGeometry(r,h,32)),color,x,y,z);
  function stonePillar(g,x,z) {
    box(g,1.45,.35,1.5,'#ab8869',x,.18,z,.07);
    box(g,1.1,4.65,1.12,'#c3a382',x,2.5,z,.05);
    for(let row=0;row<10;row++) for(let col=0;col<2;col++){
      const shade=['#d6bd9a','#cbb08b','#dfc8a6'][(row+col)%3];
      box(g,.51,.39,.08,shade,x+(col? .27:-.27),.5+row*.43,z+.58,.035);
      box(g,.08,.39,.5,shade,x+.58,.5+row*.43,z+(col?.27:-.27),.035);
    }
    box(g,1.45,.28,1.5,'#e9d5b6',x,4.9,z,.08);
    sphere(g,.38,.38,.38,'#be9365',x,5.32,z);
    box(g,.36,.68,.35,'#fff1aa',x,3.1,z+.77,.04);
    box(g,.53,.1,.5,'#384944',x,3.49,z+.77,.025);
    box(g,.45,.1,.45,'#384944',x,2.72,z+.77,.025);
  }
  const gate=group('town:welcome-arch',0,-5.1);
  stonePillar(gate,-4.55,0);stonePillar(gate,4.55,0);
  tube(gate,[[-4.55,4.35,0],[-3.5,5.1,0],[0,5.9,0],[3.5,5.1,0],[4.55,4.35,0]],.29,'#b27a43');
  tube(gate,[[-4.55,4.1,-.32],[-3.5,4.9,-.32],[0,5.6,-.32],[3.5,4.9,-.32],[4.55,4.1,-.32]],.15,'#e7c99b');
  const plate=makeCanvas();plate.width=1536;plate.height=480;const pc=plate.getContext('2d');
  pc.fillStyle='#fff8dc';pc.beginPath();pc.roundRect(20,30,1496,290,100);pc.fill();pc.strokeStyle='#d39a56';pc.lineWidth=15;pc.stroke();
  pc.font='900 128px sans-serif';pc.textBaseline='middle';pc.textAlign='center';pc.fillStyle='#228cc6';pc.fillText('JACE',260,179);pc.fillStyle='#ab7750';pc.fillText('&',512,179);pc.fillStyle='#e35c9d';pc.fillText('HALLI’S',1010,179);
  pc.fillStyle='#d69850';pc.beginPath();pc.roundRect(415,310,710,142,35);pc.fill();pc.fillStyle='#472d24';pc.font='900 105px sans-serif';pc.fillText('WORLD',768,385);
  const tex=new T.CanvasTexture(plate);tex.colorSpace=T.SRGBColorSpace;textures.add(tex);
  const signMat=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.1,roughness:.7,side:T.DoubleSide});materials.set('town:arch-sign',signMat);
  mesh(gate,geometry(new T.PlaneGeometry(9.6,3)),signMat,0,5.5,.33);
  cylinder(gate,.6,.19,'#ffcf52',0,7.2,0).rotation.x=Math.PI/2;
  for(let i=0;i<9;i++){const a=i*Math.PI/8;const ray=box(gate,.14,.5,.12,'#ffce58',Math.cos(a)*.95,7.2+Math.sin(a)*.95,0,.05);ray.rotation.z=a-Math.PI/2;}
  for(const x of [-5.4,5.4]) {lamp(x,-4.7);for(let n=0;n<5;n++)flower(root,x+(n%2)*.42,-4+n*.35,n%2?'#ec72a6':'#fff0ae',1.3);}

  // Plaza beyond the existing neighborhood boundary: no new collision/route IDs.
  const plaza=group('town:fountain-plaza',0,-25);
  cylinder(plaza,7.5,.14,'#e4ceb0',0,.08,0);
  ring(plaza,6.6,.3,'#f6e2bd',0,.22,0);
  cylinder(plaza,3.4,.25,'#cab99e',0,.25,0);
  cylinder(plaza,2.9,.3,'#68bed2',0,.4,0);
  ring(plaza,3,.2,'#f5e3c4',0,.57,0);
  cylinder(plaza,.42,2.6,'#e7d6ba',0,1.5,0,.3);
  cylinder(plaza,1.25,.17,'#e9d7b9',0,1.95,0,1.5);
  ring(plaza,1.46,.11,'#f6e8cf',0,2.07,0);
  cylinder(plaza,.55,.2,'#ece1c7',0,3.04,0,.75);
  sphere(plaza,.2,.26,.2,'#f5e8d4',0,3.27,0);
  const waterMat=new T.MeshStandardMaterial({color:'#afeafa',roughness:.15,metalness:.1,transparent:true,opacity:.78});materials.set('town:water',waterMat);
  const drops=new T.InstancedMesh(geometry(new T.SphereGeometry(.07,7,5)),waterMat,128);drops.name='town:flowing-water';drops.frustumCulled=false;
  const matrix=new T.Object3D();
  function animate(time){for(let i=0;i<128;i++){const phase=((time*.00045+i/16)%1),angle=Math.floor(i/16)*Math.PI/4;const radius=.28+phase*2.25;matrix.position.set(Math.cos(angle)*radius,3.3+2.7*phase-5.3*phase*phase,-25+Math.sin(angle)*radius);matrix.scale.set(.75,1.8,.75);matrix.updateMatrix();drops.setMatrixAt(i,matrix.matrix);}drops.instanceMatrix.needsUpdate=true;}
  for(let i=0;i<24;i++){const a=i*Math.PI/12;flower(root,Math.cos(a)*5.5,-25+Math.sin(a)*5.5,i%2?'#ed84ab':'#ffdb75',1.1);}

  function shop(name,x,z,color,w=8){
    const g=group('town:'+name,x,z);box(g,w+1,.3,5.8,'#d8c6a9',0,.15,0,.1);box(g,w,4.3,5,color,0,2.45,0,.12);
    box(g,w+.5,.25,5.4,'#fff0cc',0,4.7,0,.08);box(g,w+.5,.3,5.4,'#be9464',0,.46,0,.05);
    for(const xx of [-w*.3,w*.3]){windowPane(g,xx,2.2,2.58);windowPane(g,xx,3.8,2.58);}
    box(g,1.45,2.4,.16,'#304957',0,1.66,2.59,.06);box(g,1.12,1.65,.05,'#9ac8ce',0,1.95,2.69,.03);
    for(let i=0;i<8;i++){const aw=box(g,w/8, .16,1.7,i%2?'#fff4d4':color,-w/2+w/16+i*w/8,3.2,3.12,.03);aw.rotation.x=.18;}
    sign(g,name,0,4.52,2.83,w*.86);return g;
  }
  const bowling=shop('BOWLING & ARCADE',12,-29,'#7854c0',9);
  sphere(bowling,1.8,1.8,1.5,'#593896',0,5.8,0);
  for(const [x,y,s]of[[-2,5.9,.85],[0,6.4,1.1],[2,5.9,.85]]){
    const pin=new T.Group();pin.position.set(x,y,1.1);pin.scale.setScalar(s);pin.rotation.z=-x*.15;bowling.add(pin);
    const points=[[0,0],[.32,0],[.46,.35],[.42,.85],[.22,1.3],[.2,1.6],[.29,1.8],[.23,2.05],[0,2.13]].map(p=>new T.Vector2(...p));
    mesh(pin,geometry(new T.LatheGeometry(points,20)),'#fff8e8',0,0,0);cylinder(pin,.22,.13,'#ed609b',0,1.42,0);cylinder(pin,.215,.09,'#ed609b',0,1.61,0);
  }
  for(const x of[-4.2,4.2])box(bowling,.12,3.9,.1,'#8ae5eb',x,2.5,2.67,.03);
  const movies=shop('MOVIES',24,-26,'#cc7253',7);
  const reel=cylinder(movies,1.3,.35,'#f7cd78',0,6.1,.8);reel.rotation.x=Math.PI/2;
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;cylinder(movies,.29,.38,'#48505a',Math.sin(a)*.75,6.1+Math.cos(a)*.75,1.01).rotation.x=Math.PI/2;}
  for(let i=0;i<14;i++)sphere(movies,.085,.085,.07,'#fff0ac',-3.1+i*.48,3.55,3.94);
  const store=shop('TOYS & TREATS',34,-15,'#efa2bf',7);
  for(const x of[-2.7,2.7]){cylinder(store,.08,2.6,'#fff1cf',x,5.5,.8);const candy=cylinder(store,.75,.2,x<0?'#83d9d0':'#b9a0e2',x,6.6,.8);candy.rotation.x=Math.PI/2;for(let j=0;j<3;j++){const r=mesh(store,geometry(new T.TorusGeometry(.18+j*.18,.045,6,24)),j%2?'#fff1ca':'#e678a5',x,6.6,.94);}}
  const church=group('town:church',-12,-30);
  box(church,7,4,7,'#fff0d8',0,2,0,.09);roof(church,7.8,7.6,3,'#627a83',4);
  box(church,2.6,7,2.8,'#fff4de',0,3.5,3.6,.07);roof(church,3.2,3.3,1.7,'#5d7481',7);
  cone(church,1.1,3.5,'#58717e',0,9,3.6);box(church,.12,1.3,.12,'#e8bd61',0,11.3,3.6);box(church,.8,.12,.12,'#e8bd61',0,11.5,3.6);
  box(church,1.4,2.5,.2,'#a97754',0,1.3,5.1,.2);for(const x of[-2.4,2.4])windowPane(church,x,2.4,3.59,'#b3cbd8');sign(church,'CHURCH',0,4,5.1,2.6);
  const school=shop('SCHOOL',-27,-25,'#cd8962',10);roof(school,11,6.2,2.5,'#748086',4.9);box(school,3,3,2.1,'#e4ad72',0,6.2,1.9,.06);
  cylinder(school,.9,.12,'#fff7d5',0,6.5,3).rotation.x=Math.PI/2;box(school,.075,.58,.06,'#3e5258',0,6.7,3.1);box(school,.45,.075,.06,'#3e5258',.19,6.47,3.1);
  const zoo=group('town:zoo',-34,-40);for(const x of[-4.3,4.3]){box(zoo,1.7,5,2,'#b09a72',x,2.5,0,.24);sphere(zoo,1.9,1.1,1.5,'#8ca46a',x,5.2,0);}
  tube(zoo,[[-4.4,4.3,0],[-2.8,6.1,0],[0,6.5,0],[2.8,6.1,0],[4.4,4.3,0]],.65,'#a8956b');sign(zoo,'ZOO',0,5.5,.7,4.5);
  for(let i=0;i<11;i++)box(zoo,.12,3.5,.12,'#416958',-3.5+i*.7,1.75,.1,.03);

  const circus=group('town:circus',34,-39);cylinder(circus,5.5,3,'#fff3d7',0,1.5,0);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;const g=geometry(new T.ConeGeometry(6.2,4.5,4,1,false,a,Math.PI/8));mesh(circus,g,i%2?'#fff2d5':'#df6262',0,5.2,0);}
  cylinder(circus,.065,2,'#9f714a',0,8,0);box(circus,1.4,.7,.06,'#ed7771',.7,8.6,0,.04);sign(circus,'CIRCUS',0,2.7,5.6,4.8);
  const arena=group('town:monster-arena',23,-47);box(arena,17,.55,10,'#bd986b',0,.28,0,.4);sign(arena,'MONSTER TRUCKS',0,5.1,0,11);
  for(const x of[-6.3,6.3]){cylinder(arena,.15,7,'#62747b',x,3.5,-1);for(let n=0;n<4;n++)box(arena,.45,.5,.25,'#fff1c5',x-1+n*.65,6.8,-.8,.08);}
  const ramp=box(arena,4,.5,4,'#aa8257',-3,.8,2,.15);ramp.rotation.x=.3;

  const park=group('town:park',33,7);cylinder(park,6.3,.13,'#d9be82',0,.08,0);sign(park,'PARK',-3.3,1.7,4.5,3);
  const play=group('town:playground',33,7);for(const x of[-1.5,1.5])for(const z of[-1.5,1.5])cylinder(play,.12,3.6,'#cf8b46',x,1.8,z);
  box(play,3.3,.2,3.3,'#ebc278',0,2.1,0,.09);roof(play,4,4,1.8,'#df6f63',3.7);
  const slide=box(play,1.2,.15,4.8,'#f2c04f',0,1.1,3.45,.2);slide.rotation.x=.44;
  for(const x of[-.65,.65]){const edge=box(play,.15,.35,4.8,'#e3a936',x,1.21,3.45,.07);edge.rotation.x=.44;}
  tube(play,[[4,0,-2],[4.7,3.6,-2],[5.5,0,-2]],.1,'#518fa6');tube(play,[[4,0,2],[4.7,3.6,2],[5.5,0,2]],.1,'#518fa6');tube(play,[[4.7,3.6,-2],[4.7,3.6,2]],.11,'#518fa6');
  for(const z of[-.9,.9]){tube(play,[[4.7,3.6,z-.25],[4.7,.8,z-.25]],.025,'#788486');tube(play,[[4.7,3.6,z+.25],[4.7,.8,z+.25]],.025,'#788486');box(play,.6,.13,.75,'#edb758',4.7,.74,z,.08);}
  const station=shop('TRAIN STATION',28,27,'#d7b481',9);roof(station,10.5,6.3,3,'#596e79',4.85);
  // Continuous rails and sleepers, clearly scenery until ride gameplay is implemented.
  for(const z of[22.1,23.1])box(root,63,.1,.12,'#677982',0,.22,z,.015);
  for(let x=-30;x<=31;x+=.65)box(root,.2,.13,1.6,'#9f7954',x,.13,22.6,.025);
  const train=group('town:station-train',17,22.6);
  for(let i=0;i<3;i++) {box(train,2.5,1.7,1.8,i?'#d55f54':'#4d9cab',i*3,1.2,0,.23);box(train,2.8,.3,2.1,'#4e626d',i*3,2.2,0,.18);for(const x of[-.8,.8])for(const z of[-.96,.96]){const w=cylinder(train,.38,.13,'#3d4b55',i*3+x,.45,z);w.rotation.x=Math.PI/2;}for(const x of[-.66,.66])box(train,.48,.58,.07,'#f3cd73',i*3+x,1.5, .93,.06);}
  cylinder(train,.32,.8,'#425a68',-1.3,2.1,0);sphere(train,.58,.57,.7,'#efc861',-1.6,1.1,0);

  // Connect the skyline roads to the existing streets; planned areas stay outside play bounds.
  box(root,70,.14,6.6,'#e5d2af',0,.035,-20.8,.03);box(root,70,.06,4.5,'#657681',0,.135,-20.8,.01);
  for(let x=-33;x<35;x+=2.2)box(root,.9,.01,.07,'#f9dfa0',x,.173,-20.8,.005);
  for(const side of[-1,1]){box(root,6.6,.14,47,'#e5d2af',side*28,.035,.8,.03);box(root,4.5,.06,47,'#657681',side*28,.135,.8,.01);}
  for(const [x,z,s]of[[-20,-32,1.4],[-40,-23,1.7],[7,-37,1.5],[19,-36,1.2],[39,-25,1.8],[41,-5,1.4],[40,18,1.5],[18,28,1.2],[-31,25,1.2],[-40,8,1.5],[-8,-40,1.8]])tree(x,z,s);
  for(const x of[-23,-12,12,23])for(const z of[-20,22])lamp(x,z);
  // Added after scenery batching so the water stays animated.
  return {dynamic:drops,animate,landmarks:['welcome-arch','fountain','bowling','movies','store','church','school','zoo','circus','arena','park','station']};
}
