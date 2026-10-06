// Derived from the four separate approved sheets; directional artwork, not rigged models.
export const CHARACTER_ART = {
  "jace": {
    "file": "jace-views-v1.webp",
    "width": 2172,
    "height": 724,
    "frames": [
      [
        312,
        0,
        315,
        724
      ],
      [
        750,
        0,
        286,
        724
      ],
      [
        1157,
        0,
        290,
        724
      ],
      [
        1583,
        0,
        307,
        724
      ]
    ],
    "bytes": 914324,
    "height3D": 1.65
  },
  "halli": {
    "file": "halli-views-v1.webp",
    "width": 2172,
    "height": 724,
    "frames": [
      [
        197,
        0,
        308,
        724
      ],
      [
        649,
        0,
        337,
        724
      ],
      [
        1184,
        0,
        307,
        724
      ],
      [
        1668,
        0,
        321,
        724
      ]
    ],
    "bytes": 1073168,
    "height3D": 1.25
  },
  "mommy": {
    "file": "mommy-views-v1.webp",
    "width": 2172,
    "height": 724,
    "frames": [
      [
        201,
        0,
        339,
        724
      ],
      [
        707,
        0,
        253,
        724
      ],
      [
        1173,
        0,
        334,
        724
      ],
      [
        1686,
        0,
        257,
        724
      ]
    ],
    "bytes": 821980,
    "height3D": 2.5
  },
  "unique": {
    "file": "unique-views-v1.webp",
    "width": 2172,
    "height": 724,
    "frames": [
      [
        304,
        0,
        333,
        724
      ],
      [
        723,
        0,
        288,
        724
      ],
      [
        1140,
        0,
        316,
        724
      ],
      [
        1559,
        0,
        276,
        724
      ]
    ],
    "bytes": 962026,
    "height3D": 2.4
  }
};

const images = new Map();
export function characterURL(id) { const asset=CHARACTER_ART[id]; return asset ? new URL('../assets/characters/'+asset.file,import.meta.url).href : null; }
export function loadCharacter(id) {
 if(!CHARACTER_ART[id])return Promise.resolve(null);
 if(!images.has(id))images.set(id,new Promise(resolve=>{const image=new Image();image.decoding='async';image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=characterURL(id);}));
 return images.get(id);
}
export function viewFrame(angle, cameraBearing) {
 const relative=Math.atan2(Math.sin(cameraBearing-angle),Math.cos(cameraBearing-angle));
 return Math.abs(relative)<Math.PI/4?0:Math.abs(relative)>Math.PI*3/4?2:relative>0?1:3;
}
export async function drawPortrait(canvas,id) {
 const image=await loadCharacter(id);if(!image)return;
 const [x,y,w,h]=CHARACTER_ART[id].frames[0],ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);const height=canvas.height*.95,width=height*w/h;
 ctx.drawImage(image,x,y,w,h,(canvas.width-width)/2,canvas.height-height,width,height);
}
export async function drawFamily(canvas) {
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
 const people=[['jace',.12,.66],['mommy',.36,.98],['halli',.58,.53],['unique',.81,.92]];
 for(const [id,center,scale]of people){const im=await loadCharacter(id);if(!im)continue;const [x,y,w,h]=CHARACTER_ART[id].frames[0],height=canvas.height*scale,width=height*w/h;ctx.drawImage(im,x,y,w,h,canvas.width*center-width/2,canvas.height-height,width,height);}
}
