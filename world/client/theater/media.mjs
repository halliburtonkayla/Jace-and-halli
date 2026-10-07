export async function loadMovie(media,baseURL,{signal,onProgress=()=>{}}={}){
 if(media.src)return {url:new URL(media.src,baseURL).href,revoke:()=>{}};
 if(media.format!=='base64-parts'||!Array.isArray(media.parts)||!media.parts.length)throw Error('This movie is not ready yet.');
 const bytes=new Array(media.parts.length);let next=0,done=0;
 async function worker(){while(next<media.parts.length){const i=next++,url=new URL(media.base+media.parts[i],baseURL);const r=await fetch(url,{signal});if(!r.ok)throw Error('The movie could not download. Please try again.');const raw=atob((await r.text()).trim()),part=new Uint8Array(raw.length);for(let k=0;k<raw.length;k++)part[k]=raw.charCodeAt(k);bytes[i]=part;done+=part.length;onProgress(Math.min(100,Math.round(done/media.bytes*100)));}}
 await Promise.all(Array.from({length:6},worker));signal?.throwIfAborted();
 const blob=new Blob(bytes,{type:media.type||'video/mp4'});
 if(blob.size!==media.bytes)throw Error('The download was incomplete. Please try again.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');
 if(hash!==media.sha256)throw Error('The movie download needs to be retried.');
 const url=URL.createObjectURL(blob);return {url,revoke:()=>URL.revokeObjectURL(url)};
}
