// Gentle game sound imitations, not field recordings. Quiet animals use habitat audio.
export class ZooAudio{
 constructor(){this.enabled=false;this.ctx=null;this.nodes=[];this.timer=null;}
 unlock(){this.enabled=true;const C=window.AudioContext||window.webkitAudioContext;if(C){this.ctx??=new C();this.ctx.resume().catch(()=>{});}}
 stop(){clearTimeout(this.timer);window.speechSynthesis?.cancel();for(const n of this.nodes){try{n.stop()}catch{}}this.nodes=[];}
 mute(){this.stop();this.enabled=false;}
 speak(text){if(!this.enabled||!window.speechSynthesis)return false;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.88;u.pitch=1.08;u.volume=.8;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang==='en-US'&&/Samantha|Jenny|Aria/.test(v.name))||voices.find(v=>v.lang==='en-US')||null;speechSynthesis.speak(u);return true;}
 tone(start,duration,freq,end,type='sine',volume=.08){if(!this.ctx||!this.enabled)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime+start;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.03);this.nodes.push(o);o.onended=()=>{this.nodes=this.nodes.filter(n=>n!==o);o.disconnect();g.disconnect();};}
 noise(duration,frequency=800,volume=.08){if(!this.ctx||!this.enabled)return;const c=this.ctx,b=c.createBuffer(1,c.sampleRate*duration,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length);const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=b;f.type='lowpass';f.frequency.value=frequency;g.gain.value=volume;n.connect(f);f.connect(g);g.connect(c.destination);n.start();this.nodes.push(n);n.onended=()=>{this.nodes=this.nodes.filter(x=>x!==n);n.disconnect();f.disconnect();g.disconnect();};}
 call(kind){this.stop();if(!this.enabled)return;
 switch(kind){
 case 'roar':this.noise(1.3,400,.14);for(let i=0;i<8;i++)this.tone(i*.1,.5,105-i*4,45,'sawtooth',.025);break;
 case 'trumpet':this.tone(0,.7,280,600,'sawtooth',.035);this.tone(.45,.7,590,190,'triangle',.07);break;
 case 'bray':this.tone(0,.4,350,700,'triangle');this.tone(.45,.6,190,80,'sawtooth',.03);break;
 case 'squawk':for(let i=0;i<3;i++)this.tone(i*.3,.2,1100,420,'sawtooth',.035);break;
 case 'honk':for(let i=0;i<2;i++)this.tone(i*.5,.4,320,220,'sawtooth',.04);break;
 case 'hoot':this.tone(0,.4,380,330);this.tone(.5,.65,320,270);break;
 case 'croak':for(let i=0;i<5;i++)this.tone(i*.18,.14,260,90,'triangle');break;
 case 'hiss':this.noise(1.2,7000,.06);break;
 case 'snort':this.noise(.5,750,.12);break;
 case 'grunt':for(let i=0;i<3;i++)this.tone(i*.3,.25,150,65,'sawtooth',.04);break;
 case 'hum':this.tone(0,1,140,115,'sine',.08);break;
 case 'squeak':for(let i=0;i<3;i++)this.tone(i*.26,.18,800,1600,'sine',.055);break;
 default:this.noise(1.4,350,.09);for(let i=0;i<8;i++)this.tone(i*.16,.12,300+Math.random()*500,140,'sine',.025);
 }
 }
}
