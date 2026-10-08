export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Swept hits keep fast toddler swipes from skipping bubbles between pointer events.
export function sweptHit(a,b,c,r){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?clamp(((c.x-a.x)*dx+(c.y-a.y)*dy)/l,0,1):0;return Math.hypot(c.x-a.x-t*dx,c.y-a.y-t*dy)<=r;}
export function tossVelocity(a,b,elapsed){const t=Math.max(.016,elapsed);return {vx:clamp((b.x-a.x)/t,-1200,1200),vy:clamp((b.y-a.y)/t,-1400,900)};}
export function stepFoam(b,dt,w,floor){b.vy+=500*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*.65;}if(b.x>w-b.r){b.x=w-b.r;b.vx=-Math.abs(b.vx)*.65;}if(b.y>floor-b.r){b.y=floor-b.r;b.vy=-Math.abs(b.vy)*.48;b.vx*=.85;}return b;}
