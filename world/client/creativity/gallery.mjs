import {validateDocument,MAX_DOCUMENT_BYTES} from './document.mjs?v=studio-1';
export const MAX_PICTURES=40;
export class ArtworkStore{
 constructor({indexedDB=globalThis.indexedDB}={}){this.indexedDB=indexedDB;this.opening=null;}
 open(){if(!this.indexedDB)return Promise.reject(Error('Artwork storage is unavailable. Download the picture to keep a copy.'));if(!this.opening)this.opening=new Promise((resolve,reject)=>{const r=this.indexedDB.open('jace-halli-world.art.v1',1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('pictures',{keyPath:'key'});s.createIndex('profile','profile');r.result.createObjectStore('drafts',{keyPath:'profile'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Artwork storage could not open. Download a copy instead.'));r.onblocked=()=>reject(Error('Close another older world tab, then try saving again.'));});return this.opening;}
 async run(mode,fn,store='pictures'){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode),request=fn(tx.objectStore(store));let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(Error('The picture could not be saved. Storage may be full. Download a copy instead.'));});}
 async draft(profile,document){if(document)return this.run('readwrite',s=>s.put({profile,document:validateDocument(document)}),'drafts');return this.run('readonly',s=>s.get(profile),'drafts');}
 async list(profile){const rows=await this.run('readonly',s=>s.index('profile').getAll(profile));return rows.sort((a,b)=>b.updated-a.updated).map(({id,title,updated,mode})=>({id,title,updated,mode}));}
 async get(profile,id){if(typeof id!=='string'||id.length>80)throw Error('Choose a saved picture.');const row=await this.run('readonly',s=>s.get(profile+'/'+id));if(!row)throw Error('This picture is not in your gallery.');return row;}
 async put(profile,{id,title,document}){if(typeof id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(id))throw Error('Invalid picture ID.');const clean=validateDocument(document);const existing=await this.list(profile);if(existing.length>=MAX_PICTURES&&!existing.some(p=>p.id===id))throw Error('Your gallery has 40 pictures. Keep drawing and download this one.');const row={key:profile+'/'+id,profile,id,title:String(title||'My picture').slice(0,60),updated:Date.now(),mode:clean.mode,document:clean};await this.run('readwrite',s=>s.put(row));return {id,title:row.title,updated:row.updated,mode:row.mode};}
}
// A selected, host-approved profile is the authority. Client-supplied profile IDs are ignored.
export class GalleryService{
 constructor(store=new ArtworkStore()){this.store=store;this.uploads=new Map();}
 async request(device,profile,path,body={}){
 if(!profile)throw Error('Choose an approved profile first.');
 for(const [k,v]of this.uploads)if(Date.now()-v.at>120000)this.uploads.delete(k);
 if(path==='art-list')return {pictures:await this.store.list(profile)};
 if(path==='art-read'){const row=await this.store.get(profile,body.id),text=JSON.stringify(row.document),offset=Number(body.offset)||0;if(!Number.isInteger(offset)||offset<0||offset>text.length)throw Error('Invalid picture part.');return {id:row.id,title:row.title,text:text.slice(offset,offset+2700),total:text.length};}
 if(path==='art-begin'){
 if(!Number.isInteger(body.length)||body.length<2||body.length>MAX_DOCUMENT_BYTES||typeof body.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(body.id))throw Error('Invalid picture size.');
 this.uploads.set(device,{profile,id:body.id,title:String(body.title||'My picture').slice(0,60),length:body.length,text:'',at:Date.now()});return {ok:true};}
 const u=this.uploads.get(device);if(!u||u.profile!==profile)throw Error('Start saving the picture again.');
 if(path==='art-part'){if(typeof body.text!=='string'||body.text.length>2700||body.offset!==u.text.length||u.text.length+body.text.length>u.length)throw Error('Invalid picture part.');u.text+=body.text;u.at=Date.now();return {ok:true};}
 if(path==='art-finish'){if(u.text.length!==u.length)throw Error('Some picture parts are missing.');let doc;try{doc=JSON.parse(u.text);}catch{throw Error('Invalid picture.');}const result=await this.store.put(profile,{id:u.id,title:u.title,document:doc});this.uploads.delete(device);return result;}
 throw Error('Unknown gallery request.');
 }
 forget(device){this.uploads.delete(device);}
}
export async function saveToRoom(room,id,title,document){const text=JSON.stringify(validateDocument(document));await room.request('art-begin',{id,title,length:text.length});for(let offset=0;offset<text.length;offset+=2700){await room.request('art-part',{offset,text:text.slice(offset,offset+2700)});if(!room.host)await new Promise(r=>setTimeout(r,85));}return room.request('art-finish',{});}
export async function readFromRoom(room,id){let text='',total=1,title='';while(text.length<total){const part=await room.request('art-read',{id,offset:text.length});if(!part.text||part.total>MAX_DOCUMENT_BYTES)throw Error('Picture could not load.');text+=part.text;total=part.total;title=part.title;if(!room.host)await new Promise(r=>setTimeout(r,85));}return {id,title,document:validateDocument(JSON.parse(text))};}
