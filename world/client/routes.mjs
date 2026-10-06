import { LOCATIONS } from './locations.mjs';

const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
export function routeTo(player, id) {
  const place = LOCATIONS.find(p=>p.id===id);
  if (!place) return null;
  const door={x:place.x,y:place.y+45};
  // Door approach stays in front of building collision bounds, on the connected paths.
  const points=[{x:player.x,y:player.y},{x:0,y:player.y},{x:0,y:door.y},door];
  return { id, name:place.name, points:points.filter((p,i)=>i===0||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>12), index:1, arrived:false };
}
export function updateRoute(player, route) {
  if (!route || player.scene!=='world') return route;
  while(route.index<route.points.length-1 && Math.hypot(player.x-route.points[route.index].x,player.y-route.points[route.index].y)<24)route.index++;
  const end=route.points.at(-1);
  route.arrived=Math.hypot(player.x-end.x,player.y-end.y)<48;
  return route;
}
export function guidedInput(player, input, route, assist) {
  if(!route||!assist||player.vehicle==='mower'||player.scene!=='world')return {...input};
  if(input.brake || Math.abs(input.steer)>.15 || !input.gas)return {...input};
  if(route.arrived)return {gas:0,brake:1,steer:0};
  const target=route.points[route.index]||route.points.at(-1);
  const desired=Math.atan2(target.x-player.x,-(target.y-player.y));
  const error=Math.atan2(Math.sin(desired-player.angle),Math.cos(desired-player.angle));
  const turning=Math.abs(error)>1.0;
  return {gas:turning?0:input.gas,brake:turning||Math.abs(error)>.35&&player.speed>65?1:0,steer:clamp(error*1.4,-1,1)};
}
export function routeDots(player,route) {
  if(!route||route.arrived)return [];
  const points=[{x:player.x,y:player.y},...route.points.slice(route.index)],dots=[];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],distance=Math.hypot(b.x-a.x,b.y-a.y);
    for(let d=18;d<distance;d+=25){const t=d/distance;dots.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}
  }
  return dots.slice(0,80);
}
