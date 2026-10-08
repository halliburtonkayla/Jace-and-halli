const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function createTrip(destination,mode='drive',halli=false){return {distance:0,speed:0,length:destination.distance,mode,halli,signalAt:destination.distance*.4,signalWait:0,signalClear:false,atRed:false,arrived:false,horns:0,bubbles:0,stops:0,stoppedCleanly:false};}
export function tickTrip(s,input,dt){
 if(s.arrived)return;dt=clamp(dt,0,.1);const auto=s.mode==='ride';let gas=input.gas?1:0,brake=input.brake?1:0;
 const remaining=s.length-s.distance;const signalGap=s.signalAt-s.distance;
 if(auto){gas=1;brake=0;}
 if((auto||s.halli)&&((!s.signalClear&&signalGap<110)||(remaining<140))){gas=0;brake=1;}
 const target=gas?85:0;s.speed=clamp(s.speed+(gas?30:-13)*dt-(brake?75*dt:0),0,85);
 if(!s.signalClear&&signalGap<.5){s.atRed=true;s.speed=0;s.distance=s.signalAt;s.signalWait+=dt;if(s.signalWait>=2.8){s.signalClear=true;s.atRed=false;s.stops++;}}
 else {const next=s.distance+s.speed*dt;if(!s.signalClear&&next>=s.signalAt){s.distance=s.signalAt;s.speed=0;s.atRed=true;}else s.distance=Math.min(s.length,next);}
 // Toddlers can stop early: roll the last few metres gently under station assistance.
 if((auto||s.halli)&&!s.atRed&&s.speed<2&&remaining<140){s.speed=Math.min(17,remaining*.6+2);s.distance=Math.min(s.length,s.distance+s.speed*dt);}
 if((auto||s.halli)&&!s.signalClear&&!s.atRed&&signalGap<110&&s.speed<2){s.distance=Math.min(s.signalAt,s.distance+12*dt);}
 if(s.distance>=s.length){s.stoppedCleanly=brake>0||s.speed<20;s.speed=0;s.arrived=true;s.stops++;}
}
