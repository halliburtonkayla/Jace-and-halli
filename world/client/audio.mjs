export class Sound{
 constructor(){this.enabled=true;this.context=null;this.engine=null;this.lastSpeech=0;this.pauseTimer=null;}
 unlock(){this.context ||= new (window.AudioContext||window.webkitAudioContext)();this.context.resume();}
 tone(freq=440,length=.12){if(!this.enabled||!this.context)return;const c=this.context,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.6,c.currentTime+length);g.gain.setValueAtTime(.09,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+length);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+length);}
 say(text,force=false){if(!this.enabled||!('speechSynthesis'in window)||!force&&Date.now()-this.lastSpeech<7000)return;this.lastSpeech=Date.now();clearTimeout(this.pauseTimer);speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.85;speechSynthesis.speak(u);}
 prompt(){if(!this.enabled||Date.now()-this.lastSpeech<7000)return;this.say('Pop!',true);this.pauseTimer=setTimeout(()=>this.say('Your turn. Say pop.',true),2000);}
 motor(player){if(!this.context)return;const c=this.context;if(!this.engine){const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.connect(g).connect(c.destination);g.gain.value=0;o.start();this.engine={o,g};}const active=this.enabled&&player?.scene==='world'&&player?.vehicle!=='walk'&&player?.engine;this.engine.g.gain.setTargetAtTime(active ? .018 : 0,c.currentTime,.1);this.engine.o.frequency.setTargetAtTime(player?.vehicle==='mower'?75+(player.speed||0)*.15:45+(player?.speed||0)*.4,c.currentTime,.08);}
 mute(enabled){this.enabled=enabled;if(!enabled){clearTimeout(this.pauseTimer);if('speechSynthesis'in window)speechSynthesis.cancel();}}
}
