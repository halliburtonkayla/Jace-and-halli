import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
export const token=()=>randomBytes(32).toString('base64url');
export const digest=s=>createHash('sha256').update(s).digest('hex');
export function hashPassword(password,salt=randomBytes(16).toString('hex')) {return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function checkPassword(password,hash) {const [salt,key]=hash.split(':');return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex'));}
export function openStore(dir){
 mkdirSync(dir,{recursive:true,mode:0o700});const db=new DatabaseSync(join(dir,'family.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY,name TEXT NOT NULL,mode TEXT NOT NULL,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY,role TEXT NOT NULL,profile TEXT,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS invites (hash TEXT PRIMARY KEY,profile TEXT NOT NULL,expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);`);
 return db;
}
export function initialize(db,password){
 if(password.length<14)throw Error('Use a parent passphrase of at least 14 characters.');
 if(db.prepare('SELECT value FROM settings WHERE key=?').get('parent'))throw Error('Parent account already exists; initialization never overwrites it.');
 db.prepare('INSERT INTO settings VALUES (?,?)').run('parent',hashPassword(password));
 for(const [id,name,mode] of [['jace','Jace','preschool'],['halli','Halli','toddler'],['mommy','Mommy','adult'],['unique','Unique','older']])db.prepare('INSERT INTO profiles VALUES (?,?,?,?)').run(id,name,mode,JSON.stringify({pops:0,inventory:[],preferences:{sound:true},characterAsset:null}));
}
