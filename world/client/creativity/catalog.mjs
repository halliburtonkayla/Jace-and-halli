import {ILLUSTRATED} from './illustrated.mjs?v=studio-1';
// Original vector line art: closed shapes for bucket fills; no emoji or remote assets.
export const W=960,H=640;
export const PALETTE=[['red','#ed3348'],['orange','#ff941c'],['yellow','#ffdc32'],['green','#23ad66'],['blue','#248ae8'],['purple','#8c4ed6'],['pink','#f476b8'],['brown','#965a36'],['black','#202027'],['white','#ffffff'],['gray','#90969f'],['rainbow','rainbow']];
export const SHEETS=[['truck-v2','Monster Truck Adventure'],['dino-v2','Dinosaur Friends'],['truck','Monster truck'],['dino','Friendly dinosaur'],['bubbles','Bubble garden'],['doll','Baby doll'],['dog','Puppy'],['cat','Kitten'],['zoo','Zoo friends'],['train','Our train'],['school','Our school'],['church','Our church'],['ark','Noah’s ark'],['playground','Playground'],['car','Family car'],['motorcycle','Motorcycle'],['cook','Little kitchen'],['food','Picnic lunch'],['shapes','Shape garden'],['letters','ABC balloons'],['numbers','Counting stars'],['spring','Spring flowers'],['summer','Summer treats'],['autumn','Autumn leaves'],['winter','Winter snow friend']].map(([id,title])=>({id,title}));
export const STAMPS=['star','heart','flower','bubble','ball','car','dino','dog','cat','train','cup','shoe','doll','butterfly'];
function path(c,d,fill='white'){c.beginPath();const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}c.stroke(p);}
function ellipse(c,x,y,rx,ry=rx,fill='white'){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}c.stroke();}
function rect(c,x,y,w,h,r=10,fill='white'){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}c.stroke();}
function line(c,d){path(c,d,null);}
export function drawMotif(c,id,color='white'){
 c.save();c.lineWidth=2;c.lineCap='round';c.lineJoin='round';c.strokeStyle='#252938';
 const p=d=>path(c,d,color),e=(x,y,rx,ry=rx)=>ellipse(c,x,y,rx,ry,color),r=(x,y,w,h,rr=8)=>rect(c,x,y,w,h,rr,color);
 if(id==='star'){p('M50 4L63 34L96 37L71 59L78 92L50 75L22 92L29 59L4 37L37 34Z');}
 else if(id==='heart'){p('M50 91C-13 51 0 5 29 12Q44 14 50 30Q57 10 76 12C112 19 99 60 50 91Z');}
 else if(id==='flower'){for(let i=0;i<6;i++){c.save();c.translate(50,45);c.rotate(i*Math.PI/3);e(0,-24,15,24);c.restore();}e(50,45,14);line(c,'M50 60V99');p('M50 85Q16 88 25 65Q43 68 50 85Z');}
 else if(id==='bubble'||id==='ball'){e(50,50,44);if(id==='bubble')line(c,'M23 41Q27 24 43 21');else{line(c,'M7 50H93M50 6V94M22 17Q65 50 22 83M78 17Q35 50 78 83');}}
 else if(id==='car'||id==='truck'){p('M9 59L22 32Q25 26 38 26H68L84 49H92Q98 50 98 60V78H3V63Z');p('M29 35H47V49H22Z');p('M55 35H68L78 49H55Z');e(25,79,id==='truck'?18:12);e(78,79,id==='truck'?18:12);e(25,79,5);e(78,79,5);r(4,59,9,8,2);}
 else if(id==='dino'){p('M13 82Q7 60 14 44Q19 34 45 46Q44 10 67 10Q93 9 92 33Q92 43 77 45L73 72L83 84V93H65L59 75H42L33 93H14L22 75Q4 85 2 71Z');e(78,24,3);line(c,'M75 37Q83 38 87 33');p('M14 46L21 29L31 44L37 29L45 47Z');}
 else if(id==='doll'){e(50,34,24,27);p('M27 53Q50 65 73 53L86 88H14Z');r(19,86,25,12,6);r(56,86,25,12,6);e(19,64,10);e(81,64,10);e(42,32,2);e(59,32,2);line(c,'M44 44Q50 49 56 44');p('M42 9L27 1V19L42 13L58 9L73 1V19L58 13Z');}
 else if(id==='dog'||id==='cat'){e(50,69,26,27);if(id==='cat'){p('M21 40L22 4L43 24L63 24L83 4L81 43Z');}else{ellipse(c,23,29,13,27,color);ellipse(c,77,29,13,27,color);}e(50,38,30,26);e(39,32,3);e(61,32,3);p('M43 42H57L50 49Z');line(c,'M50 49V53M50 53Q40 60 35 53M50 53Q60 60 65 53');e(32,92,14,6);e(69,92,14,6);if(id==='cat')line(c,'M74 71Q99 38 96 78Q91 96 73 87M14 43L35 46M15 53L34 50M66 46L89 43M66 50L88 54');}
 else if(id==='train'){r(4,42,88,38,6);r(49,13,35,36,4);r(58,21,18,18,2);r(15,21,14,22,3);e(20,82,12);e(50,82,12);e(80,82,12);line(c,'M7 60H45M50 61H85');}
 else if(id==='cup'){r(15,17,58,73,10);path(c,'M73 28H85Q99 28 98 46Q99 67 73 65V54Q86 53 86 43Q87 39 73 39Z',color);line(c,'M26 28H62');}
 else if(id==='shoe'){p('M15 8H55V48Q61 62 83 65Q97 68 96 84H4Q-1 62 12 56Z');line(c,'M6 75H94M23 24H52M21 34H52M21 45H54');}
 else if(id==='apple'){p('M46 26Q15 3 6 35Q-2 61 35 94Q50 82 64 94Q105 62 94 34Q85 5 55 26Z');line(c,'M51 27Q47 7 60 1');p('M53 19Q72-1 83 9Q79 26 53 19Z');}
 else if(id==='up'||id==='down'){if(id==='down'){c.translate(100,100);c.rotate(Math.PI);}p('M38 95V45H12L50 5L88 45H62V95Z');}
 else if(id==='yes'){e(50,50,44);p('M20 50L33 38L45 55L74 24L85 36L45 79Z');}
 else if(id==='no'){e(50,50,44);line(c,'M22 22L78 78');}
 else if(id==='hand'){p('M30 88L7 59Q1 50 10 47Q14 47 27 60V21Q27 9 36 14V48V12Q41 0 48 12V48V16Q54 5 61 16V49V25Q68 15 73 26V52L86 45Q100 44 94 57L74 88Z');}
 else if(id==='butterfly'){p('M46 45C-22 -10 -1 92 44 67C4 120 96 113 55 67C107 107 117 -4 55 45Z');ellipse(c,50,56,7,29,color);line(c,'M48 30L34 11M52 30L67 11');}
 else {e(50,50,40);}
 c.restore();
}
function motif(c,id,x,y,size,color='white'){c.save();c.translate(x,y);c.scale(size/100,size/100);drawMotif(c,id,color);c.restore();}
function sun(c){ellipse(c,810,85,42);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,`M${810+Math.cos(a)*53} ${85+Math.sin(a)*53}L${810+Math.cos(a)*68} ${85+Math.sin(a)*68}`);}}
function clouds(c){path(c,'M70 100Q49 73 72 59Q91 30 115 55Q150 28 168 67Q203 74 192 99Z');path(c,'M556 98Q536 68 565 60Q580 23 609 48Q641 26 659 63Q693 71 681 98Z');}
export function drawSheet(c,id){
 if(ILLUSTRATED.has(id)){c.drawImage(ILLUSTRATED.get(id),0,0,W,H);return;}
 if(id==='truck-v2')id='truck';if(id==='dino-v2')id='dino';
 c.save();c.lineWidth=4;c.strokeStyle='#252938';c.lineJoin='round';c.lineCap='round';
 if(['truck','car','motorcycle','train'].includes(id)){
 sun(c);clouds(c);line(c,'M15 545H945M15 588H945');for(let x=30;x<950;x+=130)rect(c,x,563,60,8,3);
 if(id==='motorcycle'){ellipse(c,287,448,95);ellipse(c,705,448,95);ellipse(c,287,448,34);ellipse(c,705,448,34);path(c,'M287 448L399 297L536 429L287 448Z');path(c,'M399 297L586 304L650 391L536 429Z');line(c,'M705 448L634 239L572 234');rect(c,372,272,158,24,12);path(c,'M648 277Q722 238 754 293Z');}
 else motif(c,id,220,90,500);
 if(id==='train'){rect(c,724,325,174,158,8);rect(c,751,351,48,54,4);rect(c,823,351,48,54,4);ellipse(c,763,503,29);ellipse(c,860,503,29);line(c,'M681 446H724');line(c,'M66 535L890 535');for(let x=80;x<900;x+=40)line(c,`M${x} 534V553`);}
 }
 else if(id==='dino'){sun(c);clouds(c);motif(c,'dino',300,140,380);line(c,'M40 555Q270 480 480 558Q660 509 910 555');path(c,'M69 540V226Q26 241 25 199Q39 162 78 190Q85 150 118 163Q149 197 119 222L89 236V540Z');ellipse(c,781,518,60,35);line(c,'M759 500L784 521L800 500');motif(c,'flower',760,345,105);}
 else if(id==='bubbles'){sun(c);for(const [x,y,r]of [[220,185,98],[465,100,62],[637,234,112],[359,366,84],[796,415,58]])motif(c,'bubble',x-r,y-r,r*2);for(let x=70;x<900;x+=140)motif(c,'flower',x,480,95);}
 else if(id==='doll'){motif(c,'doll',300,65,420);rect(c,98,455,165,110,18);motif(c,'heart',135,475,70);motif(c,'ball',675,442,125);motif(c,'butterfly',115,101,100);motif(c,'flower',744,88,112);}
 else if(id==='dog'||id==='cat'){motif(c,id,320,93,420);motif(c,'ball',142,438,114);path(c,'M692 498H886L865 551H713Z');line(c,'M700 508H879');motif(c,'heart',83,99,100);}
 else if(id==='zoo'){clouds(c);sun(c);motif(c,'cat',78,304,190);motif(c,'dog',665,297,204);ellipse(c,479,322,123,112);ellipse(c,392,234,48);ellipse(c,565,234,48);ellipse(c,479,353,85,62);ellipse(c,442,310,9);ellipse(c,516,310,9);path(c,'M461 344H497L479 362Z');line(c,'M479 361V378M479 378Q451 399 435 379M479 378Q507 399 523 379');rect(c,365,426,228,133,45);ellipse(c,393,551,48,20);ellipse(c,564,551,48,20);}
 else if(id==='school'||id==='church'){
 sun(c);clouds(c);rect(c,200,238,560,318,8);path(c,'M161 240L480 108L799 240Z');rect(c,432,415,95,141,8);for(const x of [255,598])for(const y of [282,395]){rect(c,x,y,90,77,6);line(c,`M${x+45} ${y}V${y+77}M${x} ${y+38}H${x+90}`);}if(id==='church'){path(c,'M445 196V76H430V54H445V26H468V54H488V76H468V196Z');}else{ellipse(c,479,291,42);line(c,'M479 261V291L505 310');}line(c,'M432 556L340 620M527 556L620 620');motif(c,'flower',92,425,110);motif(c,'flower',786,425,110);
 }
 else if(id==='ark'){sun(c);clouds(c);path(c,'M142 397H817Q777 560 480 550Q210 560 142 397Z');rect(c,301,255,360,142,10);path(c,'M261 255L480 131L701 255Z');for(let x=346;x<660;x+=103)ellipse(c,x,320,28);motif(c,'dog',202,242,150);motif(c,'cat',672,242,150);for(let y=562;y<632;y+=25)line(c,`M25 ${y}Q70 ${y-22} 120 ${y}T220 ${y}T320 ${y}T420 ${y}T520 ${y}T620 ${y}T720 ${y}T820 ${y}T940 ${y}`);}
 else if(id==='playground'){clouds(c);sun(c);path(c,'M93 551V159H480V551M126 551L205 199M438 551L363 199');line(c,'M221 180V433M345 180V433');rect(c,191,434,186,29,9);path(c,'M648 278H778L908 540H804L686 352H648Z');rect(c,617,145,161,133,8);path(c,'M584 145L697 60L810 145Z');line(c,'M625 551V278M647 365H703M647 426H735M647 487H765');motif(c,'ball',446,445,106);}
 else if(id==='cook'){rect(c,135,193,690,370,16);rect(c,191,313,278,219,14);rect(c,220,355,220,151,10);rect(c,530,333,254,199,12);line(c,'M657 333V532');for(let x=229;x<470;x+=92)ellipse(c,x,262,33,17);for(let x=228;x<760;x+=135)ellipse(c,x,305,9);path(c,'M551 190V99Q601 40 650 100V162H630V111Q601 87 574 111V190Z');motif(c,'cup',650,207,69);}
 else if(id==='food'){rect(c,85,137,789,436,25);ellipse(c,314,365,150);path(c,'M218 335Q219 223 314 223Q407 225 410 335Z');rect(c,215,340,198,32,10);path(c,'M215 372L244 393L274 377L307 393L343 377L380 393L413 377V406H215Z');rect(c,215,409,198,35,16);motif(c,'cup',563,270,182);path(c,'M727 425Q673 359 708 332Q729 317 746 341Q771 318 790 340Q822 372 766 425Z');line(c,'M746 341Q740 311 752 302');}
 else if(id==='shapes'){for(const [shape,x,y]of [['circle',195,180],['square',435,180],['triangle',675,180],['heart',195,415],['star',435,415],['flower',675,415]]){if(shape==='circle')ellipse(c,x+65,y+60,65);else if(shape==='square')rect(c,x,y,130,130,4);else if(shape==='triangle')path(c,`M${x+65} ${y}L${x+140} ${y+130}H${x-10}Z`);else motif(c,shape,x,y,130);line(c,`M${x+65} ${y+130}V${y+180}`);}}
 else if(id==='letters'){c.font='bold 130px sans-serif';c.textAlign='center';for(let i=0;i<3;i++){ellipse(c,235+i*244,260,104,150);c.strokeText('ABC'[i],235+i*244,299);line(c,`M${235+i*244} 410Q${185+i*244} 459 ${235+i*244} 504T${235+i*244} 593`);}}
 else if(id==='numbers'){c.font='bold 85px sans-serif';for(let i=0;i<5;i++){const x=90+i*164;c.strokeText(String(i+1),x+35,167);for(let k=0;k<=i;k++)motif(c,'star',x+(k%2)*67,204+Math.floor(k/2)*126,65);}}
 else if(id==='spring'){sun(c);clouds(c);for(let x=95;x<810;x+=180)motif(c,'flower',x,266,150);motif(c,'butterfly',300,100,130);}
 else if(id==='summer'){sun(c);rect(c,210,144,181,301,60);rect(c,275,445,49,123,20);path(c,'M496 329L749 329L622 577Z');ellipse(c,622,262,139,100);line(c,'M542 350L661 511M698 350L580 511');motif(c,'bubble',704,70,116);}
 else if(id==='autumn'){for(let i=0;i<7;i++){c.save();c.translate(150+(i%4)*190,150+Math.floor(i/4)*250);c.rotate((i%3-1)*.4);path(c,'M0 160L-66 100L-46 87L-86 29L-35 40L0-18L35 40L86 29L46 87L66 100Z');line(c,'M0-2V197M0 98L-49 62M0 115L49 80');c.restore();}}
 else if(id==='winter'){ellipse(c,480,441,130);ellipse(c,480,265,95);rect(c,380,172,200,18,8);rect(c,420,79,120,93,8);ellipse(c,450,240,6);ellipse(c,510,240,6);path(c,'M480 260L550 275L480 283Z');line(c,'M445 290Q480 320 515 290M354 421L189 318M606 421L773 318M221 339L199 280M731 338L764 283');for(let y=375;y<509;y+=50)ellipse(c,480,y,9);for(let x=80;x<920;x+=130)motif(c,'star',x,100+(x%3)*25,35);}
 c.restore();
}
