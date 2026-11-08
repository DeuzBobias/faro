import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';
import { existsSync } from 'node:fs';
const email=process.argv[2]?.trim().toLowerCase();
const role=process.argv[3]||'admin';
if(!['admin','doctor','psychologist'].includes(role))throw new Error('Choose admin, doctor, or psychologist.');
if(!email||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Usage: node scripts/local-admin.mjs admin@example.com');
if(!existsSync('.local/faro.sqlite'))throw new Error('Start FARO once before creating an administrator.');
const db=new DatabaseSync('.local/faro.sqlite');
try {
 const existing=db.prepare('SELECT user_id FROM local_accounts WHERE email=?').get(email);
 if(existing){db.prepare('UPDATE local_accounts SET role=?,active=1 WHERE email=?').run(role,email);db.prepare('DELETE FROM local_sessions WHERE user_id=?').run(existing.user_id);console.log(role+' role assigned. Use the existing password.');}
 else {const password=randomBytes(18).toString('base64url'),salt=randomBytes(16).toString('hex');const hash=salt+':'+scryptSync(password,salt,64).toString('hex');db.prepare('INSERT INTO local_accounts VALUES (?,?,?,?,?,?)').run('local-email:'+email,email,hash,role,1,new Date().toISOString());console.log(role+' email:',email);console.log('Local password:',password);}
} finally {db.close();}
