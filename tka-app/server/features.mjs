import fs from 'node:fs';
import { readyPackages } from './packages.mjs';
import { voidedQuestions } from './content-review.mjs';

export function installFeatures(c) {
  const { app, db, questions, passages, availableQuestions, modules, requireLearner, requireSession, publicAttempt, expireIfNeeded, attemptRow, attemptQuestions, attemptResponses, isCorrect, weekStartWib, rankedCount, normalizeUsername, normalizePin, passwordDigest, passwordMatches, randomToken, hash, nowIso, setSession, publicUser, learnerRow, accountRow } = c;
  db.exec(`CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS tutor_answers (id TEXT PRIMARY KEY, learner_id INTEGER NOT NULL REFERENCES learners(id) ON DELETE CASCADE, question_id TEXT NOT NULL, day TEXT NOT NULL, answer TEXT, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS attempts_learner_status ON attempts(learner_id,status);
    CREATE INDEX IF NOT EXISTS attempts_ranking ON attempts(mode,grade,subject,week_start,status);`);
  function limit(key, max, period) {
    const t=Date.now();
    db.prepare('DELETE FROM request_limits WHERE reset_at <= ?').run(t);
    const row=db.prepare('SELECT * FROM request_limits WHERE key=?').get(key);
    if(row?.count >= max) return false;
    db.prepare('INSERT INTO request_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,t+period);
    return true;
  }
  app.use('/api/auth', (req,res,next)=> {
    if(req.method==='POST' && !limit(`auth:${req.ip}`, 60, 15*60000)) return res.status(429).json({message:'Terlalu banyak percobaan. Coba lagi dalam 15 menit.'});
    if(req.method==='POST' && ['login','recover'].some(x=>req.path.endsWith(x)) && !limit(`login:${normalizeUsername(req.body?.username)}`,10,15*60000)) return res.status(429).json({message:'Tunggu 15 menit sebelum mencoba akun ini lagi.'});
    if(req.method==='POST' && req.path.endsWith('register') && !limit(`register:${req.ip}`,30,3600000)) return res.status(429).json({message:'Batas pendaftaran tercapai. Coba lagi nanti.'});
    next();
  });
  app.post('/api/auth/recover', (req,res)=> {
    const username=normalizeUsername(req.body?.username), pin=normalizePin(req.body?.pin);
    const account=db.prepare('SELECT * FROM accounts WHERE username=?').get(username || '');
    const code=String(req.body?.recovery_code || '').trim().toUpperCase();
    if(!pin || !account?.recovery_hash || hash(code)!==account.recovery_hash) return res.status(400).json({message:'Username atau kode pemulihan belum cocok. Kode masuk baru harus 6 angka.'});
    const salt=randomToken();
    db.prepare('UPDATE accounts SET password_salt=?, password_hash=?, recovery_hash=NULL, updated_at=? WHERE id=?').run(salt,passwordDigest(pin,salt),nowIso(),account.id);
    db.prepare('DELETE FROM sessions WHERE account_id=?').run(account.id);
    const learner=db.prepare('SELECT * FROM learners WHERE account_id=? ORDER BY id LIMIT 1').get(account.id);
    setSession(res,account.id,learner?.id);
    res.json({user:publicUser(account,learner)});
  });
  app.post('/api/me/recovery', requireSession, (req,res)=> {
    if(!limit(`recovery:${req.session.account_id}`,6,15*60000)) return res.status(429).json({message:'Tunggu 15 menit sebelum membuat kode pemulihan lagi.'});
    const pin=normalizePin(req.body?.pin);
    if(!pin || !passwordMatches(pin,req.session.account.password_salt,req.session.account.password_hash)) return res.status(401).json({message:'Isi kode masuk sekarang untuk membuat kode pemulihan.'});
    const code=randomToken().slice(0,20).toUpperCase();
    db.prepare('UPDATE accounts SET recovery_hash=? WHERE id=?').run(hash(code),req.session.account_id);
    res.json({recovery_code:code});
  });
  app.get('/api/attempts', requireLearner, (req,res)=> {
    const rows=db.prepare("SELECT * FROM attempts WHERE learner_id=? AND status='active' ORDER BY started_at DESC").all(req.session.learner.id).map(expireIfNeeded);
    res.json({attempts:rows.filter(a=>a.status==='active').map(a=>publicAttempt(a))});
  });
  app.post('/api/attempts/:id/cancel',requireLearner,(req,res)=>{
    const a=attemptRow(req.params.id,req.session.learner.id);
    if(!a) return res.sendStatus(404);
    if(a.mode==='ranked') return res.status(409).json({message:'Sesi liga yang dimulai tetap memakai kesempatan. Selesaikan atau tunggu waktunya habis.'});
    db.prepare("UPDATE attempts SET status='cancelled' WHERE id=? AND status='active'").run(a.id);
    res.json({cancelled:true});
  });
  app.get('/api/progress',requireLearner,(req,res)=>{
    const learner=req.session.learner;
    const voided=voidedQuestions(db);
    const attempts=db.prepare("SELECT * FROM attempts WHERE learner_id=? AND status IN ('submitted','expired') ORDER BY submitted_at DESC LIMIT 100").all(learner.id);
    const topics=new Map(),seen=new Set();
    const since=new Date(Date.now()-30*86400000).toISOString();
    const evidenceAttempts=db.prepare("SELECT * FROM attempts WHERE learner_id=? AND status IN ('submitted','expired') ORDER BY started_at ASC").all(learner.id);
    for(const a of evidenceAttempts) {
      const responses=attemptResponses(a.id);
      for(const item of attemptQuestions(a.id)) {
        const q=item.question, key=q.subject==='matematika' ? q.family_id : q.id;
        if(voided.has(`${q.id}:${q.version}`))continue;
        if(seen.has(key)) continue;
        seen.add(key);
        if(a.submitted_at<since)continue;
        const id=`${q.subject}:${q.module_id}`;
        const r=topics.get(id)||{subject:q.subject,module_id:q.module_id,title:modules.find(m=>m.id===q.module_id)?.title||q.competency,samples:[]};
        r.samples.push({correct:isCorrect(q,responses.get(q.id)?.value)?1:0,session:a.id});if(r.samples.length>20)r.samples.shift();topics.set(id,r);
      }
    }
    const summary=['daily','ranked'].map(mode=>{const rows=attempts.filter(a=>a.mode===mode); return {mode,count:rows.length,average:rows.length?rows.reduce((s,a)=>s+a.score,0)/rows.length:null};});
    const topicRows=[...topics.values()].map(({samples,...t})=>{const total=samples.length,correct=samples.reduce((s,x)=>s+x.correct,0),sessions=new Set(samples.map(x=>x.session)).size;return {...t,total,correct,sessions,accuracy:100*correct/total,limited_data:total<10||sessions<2};});
    res.json({attempts:attempts.map(({id,mode,module_id,subject,score,total_count,correct_count,started_at,submitted_at,correction_note,ranking_invalid})=>({id,mode,module_id,subject,score,total_count,correct_count,started_at,submitted_at,correction_note,ranking_invalid})),summary,topics:topicRows,weekly_remaining:Math.max(0,3-rankedCount(learner.id,weekStartWib()))});
  });
  app.post('/api/attempts/:id/report',requireLearner,(req,res)=>{
    const a=attemptRow(req.params.id,req.session.learner.id);
    if(!a)return res.sendStatus(404);
    if(!['submitted','expired'].includes(expireIfNeeded(a).status))return res.status(409).json({message:'Laporan soal tersedia setelah sesi selesai.'});
    const item=attemptQuestions(a.id).find(i=>i.question_id===req.body?.question_id);
    if(!item||!['answer','unclear','explanation','display'].includes(req.body?.reason))return res.status(400).json({message:'Pilih soal dan alasan laporan.'});
    if(!limit(`report:${req.session.learner.id}`,10,86400000))return res.status(429).json({message:'Terima kasih. Batas laporan hari ini tercapai.'});
    const note=String(req.body?.note||'').trim().slice(0,500);
    db.prepare('INSERT OR IGNORE INTO content_reports(learner_id,attempt_id,question_id,question_version,reason,note,created_at) VALUES(?,?,?,?,?,?,?)').run(req.session.learner.id,a.id,item.question_id,item.question.version,req.body.reason,note,nowIso());
    res.json({message:'Terima kasih! Laporanmu tersimpan untuk diperiksa. Nilai berubah hanya jika soal terbukti perlu dikoreksi.'});
  });
  app.get('/api/leaderboard',requireLearner,(req,res)=>{
    const grade=req.session.learner.grade;
    const subject=req.query.subject==='bahasa_indonesia'?'bahasa_indonesia':'matematika';
    const school=req.query.school==='mine'?req.session.learner.school:null;
    const packs=readyPackages(availableQuestions(),passages,grade,subject);
    let rows=db.prepare("SELECT l.id AS learner_id,l.nickname,MAX(a.score) AS score FROM attempts a JOIN learners l ON a.learner_id=l.id WHERE a.grade=? AND a.subject=? AND a.week_start=? AND a.mode='ranked' AND a.ranking_invalid=0 AND a.status IN ('submitted','expired') AND l.ranking_opt_in=1 AND (? IS NULL OR l.school=?) GROUP BY l.id ORDER BY score DESC,l.id ASC LIMIT 100").all(grade,subject,weekStartWib(),school,school);
    if(req.query.school==='mine'&&!school) rows=[];
    let rank=0,previous=null;
    rows=rows.map((r,i)=>{if(r.score!==previous) rank=i+1;previous=r.score;return {rank,nickname:r.nickname,score:r.score,mine:r.learner_id===req.session.learner.id};});
    res.json({available:packs.length>=3,grade,subject,week_start:weekStartWib(),remaining:Math.max(0,3-rankedCount(req.session.learner.id,weekStartWib())),rows,experimental:true});
  });
  const enabled=()=>process.env.TKA_TUTOR_ENABLED==='true' && Boolean(process.env.MITSUKO_BASE_URL&&process.env.MITSUKO_API_KEY);
  app.get('/api/tutor/status',requireLearner,(_req,res)=>res.json({enabled:enabled(),display_name:'Kak Nara',daily_limit:20,per_question_limit:5}));
  const inFlight=new Set();
  app.post('/api/attempts/:id/tutor',requireLearner,async(req,res)=>{
    const a=attemptRow(req.params.id,req.session.learner.id);
    if(!a) return res.sendStatus(404);
    if(!['submitted','expired'].includes(expireIfNeeded(a).status)) return res.status(409).json({message:'Kak Nara bisa membantu setelah sesi selesai.'});
    if(!enabled()) return res.status(503).json({message:'Kak Nara belum tersedia. Pembahasan di bawah tetap bisa dibaca.'});
    const item=attemptQuestions(a.id).find(i=>i.question_id===req.body?.question_id);
    const mode=['simplify','example'].includes(req.body?.mode)?req.body.mode:null;
    if(!item||!mode) return res.status(400).json({message:'Pilih soal dan jenis penjelasan.'});
    const day=new Date(Date.now()+7*3600000).toISOString().slice(0,10);
    const id=hash(`${a.id}:${item.question_id}:${mode}:${day}`);
    const cached=db.prepare('SELECT answer FROM tutor_answers WHERE id=?').get(id);
    if(cached?.answer) return res.json({answer:cached.answer,cached:true});
    const count=db.prepare('SELECT COUNT(*) AS total,SUM(CASE WHEN question_id=? THEN 1 ELSE 0 END) AS per_question FROM tutor_answers WHERE learner_id=? AND day=?').get(item.question_id,req.session.learner.id,day);
    if(count.total>=20||count.per_question>=5||inFlight.has(req.session.learner.id)) return res.status(429).json({message:'Tunggu penjelasan sebelumnya atau lanjutkan latihan. Batas bantuan hari ini 20 penjelasan.'});
    if(!limit('tutor:global',200,86400000)) return res.status(429).json({message:'Kak Nara sedang istirahat. Baca pembahasan dasar dulu, ya.'});
    inFlight.add(req.session.learner.id);
    db.prepare('INSERT OR IGNORE INTO tutor_answers(id,learner_id,question_id,day,created_at) VALUES(?,?,?,?,?)').run(id,req.session.learner.id,item.question_id,day,nowIso());
    try {
      const prompt=fs.readFileSync(new URL('./persona.md',import.meta.url),'utf8');
      const q=item.question;
      const context={grade:a.grade,mode,stem:q.stem,passage:q.passage_snapshot?.text||null,options:q.options,answer:q.answer,explanation:q.explanation,learner_answer:attemptResponses(a.id).get(q.id)?.value||null};
      const response=await fetch(`${process.env.MITSUKO_BASE_URL.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MITSUKO_API_KEY}`},body:JSON.stringify({model:process.env.MITSUKO_MODEL||'mitsuko',messages:[{role:'system',content:prompt},{role:'user',content:JSON.stringify(context)}],max_tokens:650,stream:false}),signal:AbortSignal.timeout(45000)});
      if(!response.ok) throw new Error(`upstream_${response.status}`);
      const data=await response.json();
      const answer=data.choices?.[0]?.message?.content;
      if(typeof answer!=='string'||!answer.trim()||answer.length>8000) throw new Error('empty');
      db.prepare('UPDATE tutor_answers SET answer=? WHERE id=?').run(answer,id);
      res.json({answer});
    } catch (error) {
      const reason=/^upstream_\d+$/.test(error.message)?error.message:error.name==='TimeoutError'?'timeout':error.message==='empty'?'empty_response':error.name;
      console.warn('Nalarin tutor unavailable:',reason);
      res.status(503).json({message:'Kak Nara belum bisa menjawab sekarang. Pembahasan dasar tetap tersedia; coba lagi nanti.'});
    } finally { inFlight.delete(req.session.learner.id); }
  });
  app.post('/api/modules/:id/tutor',requireLearner,async(req,res)=>{
    const module=modules.find(item=>item.id===req.params.id&&item.grade===req.session.learner.grade);
    const question=String(req.body?.question||'').trim().slice(0,500);
    if(!module)return res.status(404).json({message:'Materi ini belum tersedia untuk kelasmu.'});
    if(!question)return res.status(400).json({message:'Tulis pertanyaanmu untuk Kak Nara.'});
    if(!enabled())return res.status(503).json({message:'Kak Nara belum tersedia. Baca ringkasan dan contoh di atas dulu, ya.'});
    const day=new Date(Date.now()+7*3600000).toISOString().slice(0,10);
    const key=`module-tutor:${req.session.learner.id}:${day}`;
    const count=db.prepare('SELECT count FROM request_limits WHERE key=?').get(key)?.count||0;
    if(count>=20)return res.status(429).json({message:'Batas bantuan Kak Nara hari ini sudah tercapai. Coba lagi besok, ya.'});
    if(inFlight.has(req.session.learner.id))return res.status(429).json({message:'Kak Nara masih menyiapkan jawaban sebelumnya.'});
    if(!limit(key,20,86400000)||!limit('tutor:global',200,86400000))return res.status(429).json({message:'Kak Nara sedang istirahat. Baca pembahasan dasar dulu, ya.'});
    inFlight.add(req.session.learner.id);
    try{
      const prompt=fs.readFileSync(new URL('./persona.md',import.meta.url),'utf8');
      const context={grade:req.session.learner.grade,module:{title:module.title,objective:module.objective,key_points:module.key_points,example:module.example,common_mistake:module.common_mistake},question};
      const response=await fetch(`${process.env.MITSUKO_BASE_URL.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MITSUKO_API_KEY}`},body:JSON.stringify({model:process.env.MITSUKO_MODEL||'mitsuko',messages:[{role:'system',content:prompt},{role:'user',content:JSON.stringify(context)}],max_tokens:500,stream:false}),signal:AbortSignal.timeout(45000)});
      if(!response.ok)throw new Error(`upstream_${response.status}`);
      const data=await response.json();
      const answer=data.choices?.[0]?.message?.content;
      if(typeof answer!=='string'||!answer.trim()||answer.length>8000)throw new Error('empty');
      res.json({answer});
    }catch(error){
      const reason=/^upstream_\d+$/.test(error.message)?error.message:error.name==='TimeoutError'?'timeout':error.message==='empty'?'empty_response':error.name;
      console.warn('Nalarin module tutor unavailable:',reason);
      res.status(503).json({message:'Kak Nara belum bisa menjawab sekarang. Coba baca contoh langkahnya lalu ulangi pertanyaanmu nanti.'});
    }finally{inFlight.delete(req.session.learner.id);}
  });
}
