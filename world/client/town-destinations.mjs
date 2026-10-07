// Image coordinates are percentages of the owner's unchanged approved artwork.
// Only destinations with working activities have hotspots.
export const TOWN_PLACES = [
 {id:'home',name:'Our home',x:12,y:63,icon:'home',scene:'home'},
 {id:'yard',name:'Backyard',x:26,y:57,icon:'leaf',scene:'world'},
 {id:'garden',name:'Bubble garden',x:67,y:66,icon:'bubbles',scene:'bubbles'},
 {id:'arcade',name:'Bowling & arcade',x:72,y:37,icon:'bowling',scene:'arcade'},
 {id:'arena',name:'Monster trucks',x:81,y:17,icon:'truck',scene:'arena'},
 {id:'school',name:'School',x:14,y:38,icon:'pencil',scene:'school'},
 {id:'garage',name:'Driving games',x:48,y:85,icon:'car',scene:'garage'},
 {id:'classic',name:'Game House',x:62,y:28,icon:'game',scene:'classic'},
];
export const VISIT_IDS = new Set([...TOWN_PLACES.map(p=>p.id),'bowling']);
export const SCENES = {
 home:{title:'Our home',image:'home',ratio:1.5,hint:'Tap the art table, toys, books, or kitchen.',spots:[
  {x:64,y:63,label:'Color & draw',icon:'pencil',art:'coloring'},
  {x:33,y:83,label:'Story books',icon:'book',file:'family-library.html'},
  {x:72,y:83,label:'Play with blocks',icon:'game',file:'blocks.html'},
  {x:41,y:45,label:'Little chef',icon:'home',file:'little-chef.html'},
  {x:77,y:65,label:'Baby doll',icon:'heart',file:'halli-baby.html'},
  {x:59,y:45,label:'Backyard',icon:'leaf',visit:'yard'},
 ]},
 arcade:{title:'Bowling & arcade',image:'arcade',ratio:1672/941,hint:'Choose the bowling lanes or an arcade cabinet.',spots:[
  {x:74,y:61,label:'Let’s bowl',icon:'bowling',visit:'bowling'},
  {x:10,y:56,label:'Racing & skee-ball',icon:'car',file:'arcade-new.html'},
  {x:34,y:56,label:'Classic arcade',icon:'game',file:'arcade.html'},
 ]},
 arena:{title:'Monster truck arena',image:'arena',ratio:1.5,hint:'The original driving games are ready to play.',spots:[
  {x:35,y:74,label:'Drive a monster truck',icon:'truck',file:'monster-truck-drive.html'},
  {x:73,y:72,label:'Truck collection',icon:'truck',file:'monster-trucks.html'},
 ]},
 school:{title:'Our classroom',image:'school',ratio:1.5,hint:'Draw, build, and explore together.',spots:[
  {x:50,y:43,label:'Whiteboard',icon:'pencil',art:'whiteboard'},
  {x:23,y:72,label:'Blocks',icon:'game',file:'blocks.html'},
  {x:73,y:75,label:'Learning games',icon:'book',file:'learning.html'},
 ]},
 garage:{title:'Driving games',image:'backyard',ratio:1.5,hint:'Choose a vehicle. Each opens an existing driving game.',spots:[
  {x:22,y:70,label:'Town driving',icon:'car',file:'town-driving.html'},
  {x:51,y:76,label:'Tractor farm',icon:'leaf',file:'tractor-farm.html'},
  {x:80,y:70,label:'Construction drive',icon:'truck',file:'construction-drive.html'},
 ]},
 classic:{title:'Game House',image:'home',ratio:1.5,hint:'Your games, books, and art are all still here.',spots:[
  {x:34,y:67,label:'All Classic Games',icon:'game',file:'classic-home.html'},
  {x:64,y:61,label:'Coloring book',icon:'pencil',art:'coloring'},
  {x:35,y:82,label:'Family library',icon:'book',file:'family-library.html'},
  {x:82,y:58,label:'Classic whiteboard',icon:'pencil',file:'whiteboard.html'},
 ]},
};
