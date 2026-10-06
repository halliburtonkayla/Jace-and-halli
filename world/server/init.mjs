import { openStore,initialize } from './store.mjs';
import { resolve } from 'node:path';
const password=process.env.WORLD_PARENT_PASSWORD;
if(!password){console.error('Set WORLD_PARENT_PASSWORD locally to a long parent passphrase, then run npm run init. Never commit it.');process.exit(1);}
const db=openStore(resolve(process.env.WORLD_DATA_DIR||'data'));try{initialize(db,password);console.log('Mommy account and four family profiles created.');}finally{db.close();}
