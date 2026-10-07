// Pointer IDs are independent: children can hold gas and steer with two fingers.
export class DrivingInput {
 constructor(){this.pointers=new Map();this.keys=new Set();}
 press(id,control){this.pointers.set(id,control);}
 release(id){this.pointers.delete(id);}
 key(code,down){if(down)this.keys.add(code);else this.keys.delete(code);}
 clear(){this.pointers.clear();this.keys.clear();}
 value(){const has=(name,codes)=>[...this.pointers.values()].includes(name)||codes.some(c=>this.keys.has(c));return {gas:has('gas',['ArrowUp','KeyW'])?1:0,brake:has('brake',['ArrowDown','KeyS'])?1:0,steer:Number(has('right',['ArrowRight','KeyD']))-Number(has('left',['ArrowLeft','KeyA']))};}
}
