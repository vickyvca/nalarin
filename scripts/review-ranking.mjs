import fs from 'node:fs';
const root=process.env.RANKING_WORK||'/opt/nalarin-ranking-work';
const questions=JSON.parse(fs.readFileSync(`${root}/ranking-candidates.json`,'utf8'));
const passages=JSON.parse(fs.readFileSync(`${root}/ranking-passages.json`,'utf8'));
fs.mkdirSync(`${root}/reviews`,{recursive:true});
const groups=[];for(const grade of [6,9])for(const subject of ['matematika','bahasa_indonesia']){const all=questions.filter(q=>q.grade===grade&&q.subject===subject);const chunkSize=subject==='bahasa_indonesia'?2:5;for(let i=0;i<all.length;i+=chunkSize)groups.push({grade,subject,part:i/chunkSize+1,questions:all.slice(i,i+chunkSize)});}
function parse(s){
 const cleaned=s.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'').trim();
 try{return JSON.parse(cleaned)}catch{
  const start=cleaned.indexOf('{'); let depth=0,inString=false,escaped=false;
  for(let i=start;i<cleaned.length;i++){
   const ch=cleaned[i];
   if(inString){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue;}
   if(ch==='"'){inString=true;continue;}
   if(ch==='{')depth++;
   else if(ch==='}'&&--depth===0)return JSON.parse(cleaned.slice(start,i+1));
  }
  throw new Error('review response was not JSON');
 }
}
async function review(g){
 const file=`${root}/reviews/${g.grade}-${g.subject}-${g.part}.json`;
 if(fs.existsSync(file))return;
 const prompt=`Kamu Luna, reviewer editorial dan akademik soal persiapan TKA SD/SMP 2026. Audit SEMUA id yang diberikan secara mandiri dan ringkas. Kembalikan JSON tepat {"reviews":[{"id":"...","approved":true,"issues":[]}]} satu baris per id, tanpa teks lain. Setujui hanya jika kunci benar, stem cukup untuk menjawab, semua alasan opsi benar-benar cocok, pembahasan langkahnya tidak menyesatkan, tipe PG/MCMA/kategori sesuai, dan bukti Bahasa Indonesia adalah kutipan utuh yang ada di bacaan. Untuk Matematika hitung ulang angka dari stem dan pastikan elemennya sesuai jenjang: bilangan, aljabar, geometri-pengukuran, atau data-peluang. Untuk Bahasa Indonesia, cek jawaban terhadap bacaan serta kompetensi tekstual, inferensial, atau evaluasi. Periksa juga bahasa Indonesia baku yang ramah murid: kalimat jelas, pilihan paralel, tanda baca wajar, angka memakai koma desimal dan titik ribuan bila relevan, tanpa teks internal seperti ID paket/variasi, tanpa artefak encoding, dan panjang bacaan/sentence sesuai jenjang (SD sekitar 150-200 kata dengan kalimat 3-7 kata; SMP sekitar 200-250 kata dengan kalimat 5-9 kata). Jangan menolak hanya karena konteks latihan atau prompt yang berulang antar stimulus; jika ada isu nyata, approved false dan tulis issue singkat. Jangan ubah kunci.`;
 const compact=g.questions.map(q=>({id:q.id,type:q.type,stimulus_id:q.stimulus_id,stem:q.stem,options:q.options,answer:q.answer,concept:q.explanation.concept,steps:q.explanation.steps,reasons:q.explanation.option_reasons,evidence:q.explanation.evidence}));
 const passageMap=Object.fromEntries([...new Set(g.questions.map(q=>q.stimulus_id).filter(Boolean))].map(id=>[id,passages.find(p=>p.id===id)?.text]));
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const response=await fetch(process.env.MITSUKO_BASE_URL.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MITSUKO_API_KEY}`},body:JSON.stringify({model:'mitsuko',messages:[{role:'system',content:prompt},{role:'user',content:JSON.stringify({grade:g.grade,subject:g.subject,passages:passageMap,questions:compact})}],max_tokens:2400,reasoning_effort:'low',stream:false}),signal:AbortSignal.timeout(300000)});
   if(!response.ok)throw Error(`${g.grade}-${g.subject} HTTP ${response.status}`);
   const data=parse((await response.json()).choices?.[0]?.message?.content||'');
   const ids=new Set(g.questions.map(q=>q.id));const got=new Set((data.reviews||[]).map(x=>x.id));
   if(got.size!==ids.size||[...ids].some(id=>!got.has(id)))throw Error(`${g.grade}-${g.subject} incomplete review ${got.size}/${ids.size}`);
   fs.writeFileSync(file,JSON.stringify({model:'mitsuko->gpt-5.6-luna(max)',reviewed_at:new Date().toISOString(),reviews:data.reviews},null,2));
   console.log(JSON.stringify({grade:g.grade,subject:g.subject,part:g.part,total:data.reviews.length,approved:data.reviews.filter(x=>x.approved).length,rejected:data.reviews.filter(x=>!x.approved).slice(0,5)}));
   return;
  }catch(error){
   if(attempt===3)throw error;
   await new Promise(resolve=>setTimeout(resolve,1500*attempt));
  }
 }
}
let i=0;await Promise.all(Array.from({length:4},async()=>{while(i<groups.length){const g=groups[i++];try{await review(g)}catch(e){console.log(JSON.stringify({error:e.message}));}}}));
