export class TrainAudio{
 constructor(){this.enabled=true;this.voiceName='';this.current=null;this.ctx=null;this.timers=new Set();this.token=0;}
 unlock(){const C=window.AudioContext||window.webkitAudioContext;if(C){this.ctx??=new C();this.ctx.resume().catch(()=>{});} }
 stop(){this.token++;for(const t of this.timers)clearTimeout(t);this.timers.clear();window.speechSynthesis?.cancel();this.current=null;}
 say(text,done){this.stop();if(!this.enabled){done?.();return false;}if(!window.speechSynthesis)return false;const voices=speechSynthesis.getVoices();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.88;u.pitch=1;u.volume=.85;u.voice=voices.find(v=>v.name===this.voiceName)||voices.find(v=>v.lang==='en-US'&&/Samantha|Aria|Jenny|Natural|Google US English/.test(v.name))||voices.find(v=>v.lang==='en-US')||null;const token=this.token;u.onend=()=>{if(token===this.token)done?.();};this.current=u;speechSynthesis.speak(u);return true;}
 later(fn,delay){const t=setTimeout(()=>{this.timers.delete(t);fn();},delay);this.timers.add(t);}
 tone(frequency,duration=.2,type='sine',volume=.07,delay=0){if(!this.enabled||!this.ctx)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.035);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
 horn(){for(const f of [261.6,329.6,392]){this.tone(f,.35,'triangle',.035);this.tone(f,.6,'triangle',.03,.5);}}
 pop(){this.tone(760,.12,'sine',.06);}
 ding(){this.tone(740,.18);this.tone(990,.3,'sine',.045,.16);}
}
