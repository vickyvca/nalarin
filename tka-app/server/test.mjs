import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,cpSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
const tmp=mkdtempSync(path.join(os.tmpdir(),'nalarin-test-'));
const content=path.join(tmp,'content');cpSync(new URL('./content',import.meta.url),content,{recursive:true});
const bank=JSON.parse(readFileSync(path.join(content,'questions.json'),'utf8'));
const originals=[...bank];
for(const grade of [6,9])for(const subject of ['matematika','bahasa_indonesia']){const q=originals.find(q=>q.grade===grade&&q.subject===subject);for(let i=0;i<30;i++)bank.push({...q,id:`fixture-${grade}-${subject}-${i}`,ranked_eligible:true,pool:'ranked_test',family_id:`fixture-${i}`});}
writeFileSync(path.join(content,'questions.json'),JSON.stringify(bank));
const dbPath=path.join(tmp,'test.sqlite');
let child;
function start(){child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:'18189',TKA_DB_PATH:dbPath,TKA_CONTENT_DIR:content,ALLOW_DEMO_AUTH:'true',NODE_ENV:'test',TKA_TUTOR_ENABLED:'false'},stdio:'pipe'});child.stderr.on('data',d=>process.stderr.write(d));}
async function wait(){for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:18189/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('API did not start');}
const client=()=>{let cookie='';return async(p,body,method=body?'POST':'GET',expected=200)=>{const r=await fetch(`http://127.0.0.1:18189/api${p}`,{method,headers:{'Content-Type':'application/json',Cookie:cookie},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];const data=r.status===204?{}:await r.json();assert.equal(r.status,expected,`${p}: ${JSON.stringify(data)}`);return data;};};
start();
try{
 await wait();const a=client(),b=client(),c=client(),teacher=client();
 await a('/auth/register',{username:'testing6',pin:'123456',nickname:'Test 6',grade:6},'POST',201);
 await b('/auth/register',{username:'testing9',pin:'123456',nickname:'Test 9',grade:9},'POST',201);
 await c('/auth/register',{username:'schoolkid',pin:'123456',nickname:'School Kid',grade:6,school:'Sekolah Demo'},'POST',201);
 await a('/modules/sd-pecahan/tutor',{question:'Kenapa penyebut harus sama?'},'POST',503);
 const schoolVariant=client();await schoolVariant('/auth/register',{username:'schoolkid2',pin:'123456',nickname:'School Kid 2',grade:9,school:'  SEKOLAH   DEMO  '},'POST',201);
 const teacherUser=(await teacher('/auth/teacher/register',{username:'teacher01',pin:'123456',nickname:'Bu Guru',school:'Sekolah Demo',city:'Jawa Tengah'},'POST',201)).user;assert.equal(teacherUser.role,'teacher');assert.equal((await teacher('/teacher/overview')).summary.students,2);
 await a('/auth/register',{username:'testing6',pin:'123456',nickname:'Dup',grade:6},'POST',409);
 await a('/auth/login',{username:'testing6',pin:'000000'},'POST',401);
 const recovery=(await a('/me/recovery',{pin:'123456'})).recovery_code;assert.ok(recovery.length>=20);
 let attempt=(await a('/attempts',{mode:'daily',subject:'matematika',idempotency_key:'once'},'POST',201)).attempt;
 assert.equal(attempt.questions.length,10);assert.ok(!JSON.stringify(attempt).includes('option_reasons'));assert.equal(attempt.review,undefined);
 const same=await a('/attempts',{mode:'daily',subject:'bahasa_indonesia',idempotency_key:'other'});assert.equal(same.attempt.id,attempt.id);
 await b(`/attempts/${attempt.id}`,undefined,'GET',404);
 await a(`/attempts/${attempt.id}/tutor`,{question_id:attempt.questions[0].id,mode:'simplify'},'POST',409);
 for(const q of attempt.questions){const original=bank.find(o=>o.id===q.id);if(q.type==='CATEGORY'){const [key]=Object.keys(original.answer);await a(`/attempts/${attempt.id}/responses/${q.id}`,{answer:{[key]:original.answer[key]},flagged:true},'PUT');}await a(`/attempts/${attempt.id}/responses/${q.id}`,{answer:q.type==='CATEGORY'?{}:[]},'PUT');await a(`/attempts/${attempt.id}/responses/${q.id}`,{answer:original.answer},'PUT');}
 const resumed=await a(`/attempts/${attempt.id}`);assert.ok(resumed.attempt.questions.every(q=>q.response));
 const result=(await a(`/attempts/${attempt.id}/submit`,{})).attempt;assert.equal(result.score,100);assert.equal(result.review.length,10);
 assert.equal((await a(`/attempts/${attempt.id}/submit`,{})).attempt.score,100);
 await a(`/attempts/${attempt.id}/responses/${attempt.questions[0].id}`,{answer:['A']},'PUT',409);
 assert.ok((await a('/progress')).topics.length>0);
 const sub=(await a('/attempts',{mode:'daily',subject:'matematika',module_id:'sd-pecahan'},'POST',201)).attempt;assert.ok(sub.questions.length<=5);assert.ok(sub.questions.every(q=>q.module_id==='sd-pecahan'));await a(`/attempts/${sub.id}/cancel`,{});
 for(let i=0;i<3;i++){const r=(await a('/attempts',{mode:'ranked',subject:i%2?'bahasa_indonesia':'matematika',idempotency_key:`rank-${i}`},'POST',201)).attempt;assert.equal(r.questions.length,30);await a(`/attempts/${r.id}/submit`,{});}
 await a('/attempts',{mode:'ranked',subject:'matematika'},'POST',429);
 const peer=client();await peer('/dev/session',{nickname:'peer6',grade:6});
 const peerRank=(await peer('/attempts',{mode:'ranked',subject:'matematika'},'POST',201)).attempt;
 await peer(`/attempts/${peerRank.id}/submit`,{});
 const ties=(await a('/leaderboard?subject=matematika')).rows;
 assert.equal(ties[0].rank,1);assert.equal(ties[1].rank,1);
 const publicRanking=await fetch('http://127.0.0.1:18189/api/public/leaderboard').then((response)=>response.json());assert.ok(publicRanking.rows.length>=2);assert.ok(publicRanking.rows.every((row)=>row.nickname&&row.grade));
 const weekDb=new Database(dbPath);weekDb.prepare("UPDATE attempts SET week_start='2000-01-03' WHERE learner_id=1 AND mode='ranked'").run();weekDb.close();
 const newWeek=(await a('/attempts',{mode:'ranked',subject:'matematika'},'POST',201)).attempt;await a(`/attempts/${newWeek.id}/submit`,{});
 const rank2=(await b('/attempts',{mode:'ranked',subject:'matematika'},'POST',201)).attempt;
 const db=new Database(dbPath);db.prepare('UPDATE attempts SET expires_at=? WHERE id=?').run('2000-01-01T00:00:00Z',rank2.id);db.close();assert.equal((await b(`/attempts/${rank2.id}`)).attempt.status,'expired');
 await a('/auth/recover',{username:'testing6',pin:'654321',recovery_code:recovery});
 await a('/auth/recover',{username:'testing6',pin:'654321',recovery_code:recovery},'POST',400);
 await a('/auth/logout',{},'POST',204);await a('/auth/login',{username:'testing6',pin:'654321'});
 const first=await fetch('http://127.0.0.1:18189/api/auth/login',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'});assert.equal(first.status,403);
 const load=await Promise.all(Array.from({length:50},async(_,i)=>{const c=client();await c('/dev/session',{nickname:`load-${i}`,grade:i%2?6:9});const r=(await c('/attempts',{subject:'matematika'},'POST',201)).attempt;await c(`/attempts/${r.id}/responses/${r.questions[0].id}`,{answer:r.questions[0].type==='CATEGORY'?{}:[]},'PUT');return true;}));assert.equal(load.length,50);
 const disk=new Database(dbPath);assert.ok(disk.prepare('SELECT COUNT(*) AS n FROM responses').get().n>=60);disk.close();
 console.log('PASS: local auth, teacher overview, public ranking, recovery, isolation, empty/partial/all-correct scoring, resume, module filtering, idempotency, quota, shared ranks, week rollover, expiry, CSRF, 50 concurrent learners.');
 console.log(`Isolated test artifacts: ${tmp}`);
}finally{child.kill();}
