import {TOWN_PLACES} from './town-destinations.mjs?v=zoo-1';
import {GAME_PAGES} from './game-catalog.mjs?v=all-games-1';
export const PLACE_LINKS=[...TOWN_PLACES,
 {id:'train',name:'Train station',icon:'car',x:83,y:77},
 {id:'circus',name:'Circus',icon:'game',x:94,y:20},
 {id:'candy',name:'Candy shop',icon:'heart',x:94,y:39},
 {id:'store',name:'Toy store',icon:'game',x:92,y:43},
 {id:'church',name:'Church',icon:'home',x:32,y:23},
 {id:'park',name:'Park',icon:'leaf',x:77,y:57},
];
const groups={
 home:['halli-baby.html','halli-bath.html','little-chef.html','halli-kitchen.html','family-library.html','storytime.html','halli-playroom.html'],
 yard:['riding-mower.html','landscape-new.html','landscape.html','toolbox.html','halli-garden.html'],
 garden:['halli-bubbles.html','bubbles.html','halli-balloons.html','halli-garden.html','halli-lights.html'],
 arcade:['arcade-new.html#moto','arcade-new.html#skee','arcade-new.html#light','arcade.html#moto','arcade.html#skee','arcade.html#light','together.html#four','together.html#match','together.html#color'],
 arena:['monster-truck-drive.html','monster-trucks.html'],
 school:['learning.html','learning-tent.html','halli-abc.html','halli-counting.html','clicky-computer.html','whiteboard.html','art.html','blocks.html','halli-colors.html'],
 garage:['town-driving.html','tractor-farm.html','construction-drive.html','driving.html'],
 zoo:['halli-animals.html','dinosaurs.html'],train:[],
 circus:['halli-balloons.html','halli-peekaboo.html','halli-music.html','halli-stars.html'],
 candy:['little-chef.html','halli-kitchen.html'],store:['halli-baby.html','halli-playroom.html','blocks.html','toolbox.html'],
 church:['halli-music.html','art.html'],park:['halli-garden.html','halli-bubbles.html','together.html#four','together.html#match'],
};
export const PLACE_NOTES={train:'The train station is on our map. A train ride game has not been built yet.',church:'Music and coloring are ready here. A dedicated church activity has not been built yet.',candy:'Play in the kitchens here. A candy shop game has not been built yet.'};
export function activitiesForPlace(id){return (groups[id]||[]).map(file=>GAME_PAGES.find(g=>g.file===file));}
