// Versioned sheets: older saved pictures keep their original background.
export const ILLUSTRATED=new Map();
export const ILLUSTRATED_FILES={'truck-v2':'monster-truck-v2.webp','dino-v2':'dinosaur-v2.webp'};
let loading;
export function prepareIllustratedSheets(){
 if(loading)return loading;
 loading=Promise.all(Object.entries(ILLUSTRATED_FILES).map(([id,file])=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>{ILLUSTRATED.set(id,image);resolve();};image.onerror=()=>resolve();image.src=new URL('../../assets/creativity/'+file,import.meta.url).href;
 })));return loading;
}
