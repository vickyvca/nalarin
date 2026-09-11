export function installContentTables(db){db.exec(`
 CREATE TABLE IF NOT EXISTS content_reports(id INTEGER PRIMARY KEY,learner_id INTEGER NOT NULL REFERENCES learners(id) ON DELETE CASCADE,attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,question_id TEXT NOT NULL,question_version INTEGER NOT NULL,reason TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'open',created_at TEXT NOT NULL,UNIQUE(learner_id,question_id,question_version));
 CREATE TABLE IF NOT EXISTS content_decisions(question_id TEXT NOT NULL,question_version INTEGER NOT NULL,status TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(question_id,question_version));
 CREATE TABLE IF NOT EXISTS score_adjustments(id INTEGER PRIMARY KEY,attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,question_id TEXT NOT NULL,question_version INTEGER NOT NULL,previous_score REAL,new_score REAL,reason TEXT NOT NULL,created_at TEXT NOT NULL);
 `);}
export function correctAnswer(q,value){
 if(value===null||value===undefined)return false;
 if(q.type==='PGK_CATEGORY')return !Array.isArray(value)&&Object.keys(value).length===Object.keys(q.answer).length&&Object.entries(q.answer).every(([k,v])=>value[k]===v);
 return Array.isArray(value)&&value.length===q.answer.length&&[...value].sort().join('|')===[...q.answer].sort().join('|');
}
export function voidedQuestions(db){return new Map(db.prepare("SELECT * FROM content_decisions WHERE status='void'").all().map(d=>[`${d.question_id}:${d.question_version}`,d.reason]));}
export function calculateScore(items,responses,voided){
 const valid=items.filter(i=>!voided.has(`${i.question.id}:${i.question.version}`));
 const correct=valid.filter(i=>correctAnswer(i.question,responses.get(i.question.id)?.value)).length;
 return {correct,total:valid.length,score:valid.length?100*correct/valid.length:0,voided:items.length-valid.length,ranking_invalid:items.length-valid.length>items.length*.1};
}
export function voidQuestion(db,id,version,reason){
 if(!reason||reason.length<10)throw Error('A concrete correction reason is required');
 installContentTables(db);
 return db.transaction(()=>{
  const affected=db.prepare('SELECT DISTINCT a.* FROM attempts a JOIN attempt_questions q ON q.attempt_id=a.id WHERE q.question_id=? AND q.question_version=?').all(id,version);
  const now=new Date().toISOString();
  db.prepare("INSERT INTO content_decisions VALUES(?,?,'void',?,?) ON CONFLICT(question_id,question_version) DO UPDATE SET reason=excluded.reason").run(id,version,reason,now);
  const voided=voidedQuestions(db);
  for(const a of affected){
   const items=db.prepare('SELECT snapshot_json FROM attempt_questions WHERE attempt_id=? ORDER BY position').all(a.id).map(q=>({question:JSON.parse(q.snapshot_json)}));
   const responses=new Map(db.prepare('SELECT * FROM responses WHERE attempt_id=?').all(a.id).map(r=>[r.question_id,{value:JSON.parse(r.answer_json)}]));
   const result=calculateScore(items,responses,voided);
   const note=`${result.voided} soal dibatalkan setelah pemeriksaan. Nilai dihitung dari ${result.total} soal.${result.ranking_invalid&&a.mode==='ranked'?' Sesi dikeluarkan dari peringkat.':''}`;
   db.prepare('UPDATE attempts SET score=?,correct_count=?,total_count=?,ranking_invalid=?,correction_note=? WHERE id=?').run(['submitted','expired'].includes(a.status)?result.score:a.score,result.correct,result.total,Number(result.ranking_invalid),note,a.id);
   db.prepare('INSERT INTO score_adjustments(attempt_id,question_id,question_version,previous_score,new_score,reason,created_at) VALUES(?,?,?,?,?,?,?)').run(a.id,id,version,a.score,result.score,reason,now);
  }
  db.prepare("UPDATE content_reports SET status='resolved_void' WHERE question_id=? AND question_version=?").run(id,version);
  return {question_id:id,version,affected_attempts:affected.length};
 })();
}
