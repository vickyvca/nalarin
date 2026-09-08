// Versioned editorial packages. These checks are shared by import, runtime, and tests.
export const BLUEPRINT_VERSION='nalarin-2026.1';
export const SCORING_VERSION='exact-match-1';
const count=(rows,key)=>rows.reduce((out,q)=>(out[q[key]]=(out[q[key]]||0)+1,out),{});
const matches=(a,b)=>Object.keys({...a,...b}).every(k=>(a[k]||0)===(b[k]||0));
export function inspectPackage(rows,passages){
 const errors=[];const first=rows[0];if(!first)return ['empty'];
 if(rows.length!==30)errors.push('30 questions required');
 if(new Set(rows.map(q=>q.id)).size!==rows.length)errors.push('duplicate question');
 if(rows.some(q=>q.grade!==first.grade||q.subject!==first.subject||q.pack_id!==first.pack_id))errors.push('mixed package');
 if(rows.some(q=>!q.ranked_eligible||q.pool!=='ranked_v1'||q.review?.status!=='ai_reviewed'||q.review?.independent_mitsuko_review!=='passed'||!q.review?.review_id))errors.push('unreviewed content');
 if(!matches(count(rows,'type'),{PG:18,PGK_MCMA:6,PGK_CATEGORY:6}))errors.push('response type distribution');
 const difficultyTarget=first.subject==='bahasa_indonesia'?{mudah:12,sedang:12,menantang:6}:{mudah:9,sedang:15,menantang:6};
 if(!matches(count(rows,'difficulty_editorial'),difficultyTarget))errors.push('editorial difficulty distribution');
 const domains=first.subject==='bahasa_indonesia'?{tekstual:10,inferensial:12,evaluasi:8}:first.grade===6?{bilangan:12,geometri:12,data:6}:{bilangan:8,aljabar:8,geometri:8,data_peluang:6};
 if(!matches(count(rows,'competency'),domains))errors.push('competency distribution');
 if(first.subject==='matematika'){
  if(new Set(rows.map(q=>q.family_id)).size!==30)errors.push('repeated math family');
  if(!matches(count(rows,'cognitive_level'),{pemahaman:6,aplikasi:15,penalaran:9}))errors.push('cognitive distribution');
 }else{
  const groups=count(rows,'stimulus_id');const ps=Object.keys(groups).map(id=>passages.find(p=>p.id===id));
  if(ps.length!==6||Object.values(groups).some(n=>n!==5)||ps.some(p=>!p||p.grade!==first.grade))errors.push('six complete passage groups required');
  else if(!matches(count(ps,'genre'),{fiksi:3,informasi:3}))errors.push('passage genre distribution');
 }
 return errors;
}
export function packageCatalog(questions,passages){
 const groups=new Map();for(const q of questions.filter(q=>q.ranked_eligible)){if(!groups.has(q.pack_id))groups.set(q.pack_id,[]);groups.get(q.pack_id).push(q);}
 const dailyFamilies=new Set(questions.filter(q=>!q.ranked_eligible).map(q=>q.stimulus_id||q.family_id));
 return [...groups].map(([id,rows])=>({id,grade:rows[0].grade,subject:rows[0].subject,rows,errors:[...inspectPackage(rows,passages),...(rows.some(q=>dailyFamilies.has(q.stimulus_id||q.family_id))?['family shared with daily']:[])]}));
}
export function readyPackages(questions,passages,grade,subject){
 const candidates=packageCatalog(questions,passages).filter(p=>p.grade===grade&&p.subject===subject&&!p.errors.length);
 const families=new Set();
 for(const p of candidates){const local=new Set(p.rows.map(q=>q.stimulus_id||q.family_id));if([...local].some(id=>families.has(id)))return [];for(const id of local)families.add(id);}
 return candidates.length>=3?candidates:[];
}
