// Offline authoring/review only. Run on the host with its existing private model environment.
// Outputs are quarantined until both blind solving and explanation review pass.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.env.NALARIN_CONTENT_WORK||'/opt/nalarin-content-work';
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const write=(n,x)=>fs.writeFileSync(path.join(root,n),JSON.stringify(x,null,2)+'\n');
fs.mkdirSync(path.join(root,'results'),{recursive:true});fs.mkdirSync(path.join(root,'audit'),{recursive:true});
const seed=read('questions.json'),passages=read('passages.json');
const tasks=[];const types=['PG','PG','PG','PG','PG','PG','PGK_MCMA','PGK_MCMA','PGK_CATEGORY','PGK_CATEGORY'];
const difficulties=['mudah','sedang','sedang','mudah','menantang','sedang','sedang','menantang','mudah','sedang'];
const cognitive=['pemahaman','aplikasi','aplikasi','pemahaman','penalaran','aplikasi','aplikasi','penalaran','aplikasi','penalaran'];
const mathThemes6=['kebutuhan bahan dapur dan sisa persediaan','rancangan kebun dengan jalur masuk','data pengumpulan barang bekas','pengukuran lintasan olahraga','rencana belanja hemat kelompok','mengatur jadwal kegiatan desa','mengisi wadah dengan batas kapasitas','membandingkan hasil panen','pola susunan ubin dan pagar','menaksir kebutuhan perjalanan','membaca ukuran kemasan','pembagian tugas pameran','membandingkan data kehadiran'];
const mathThemes9=['memilih tarif layanan berdasarkan pemakaian','rancangan denah dan skala','data survei yang memiliki keterbatasan','pertumbuhan pola susunan benda','rute koordinat dan perpindahan','membandingkan skema pengeluaran','pengukuran bayangan dan kesebangunan','menyusun aturan produksi sederhana','eksperimen peluang dan frekuensi','perbandingan laju aliran','menilai klaim statistik','mengukur bangun gabungan','membandingkan notasi ilmiah'];
const readingThemes=['memperbaiki alat musik bersama','percobaan penyaring air sederhana','menemani teman mengikuti lomba','pencatatan suhu halaman sekolah','kejujuran dalam pameran karya','aturan peminjaman peralatan olahraga','mencari jalan saat penunjuk rusak','pengamatan serangga di kebun','belajar menerima kritik lukisan','uji bahan pembungkus makanan','membagi peran pertunjukan boneka','perbandingan dua cara menjemur','memahami kekhawatiran tetangga','cara membaca label pangan','mengubah rencana mendaki bukit','data perjalanan naik sepeda','belajar dari kegagalan membuat layang-layang','dua laporan tentang penghematan listrik','menolong teman yang kehilangan catatan','mengenal daur ulang kertas','meminta maaf setelah salah menilai','cara menjaga telinga saat memakai headphone','menemukan keberanian bercerita','membandingkan cara menyimpan buah','saling menghargai permainan tradisional','catatan pengamatan bayangan matahari'];
for(const grade of [6,9]){
 for(let b=0;b<13;b++){
  const ranked=b<9,pack=Math.floor(b/3)+1,j=b%3;
  const domains=grade===6?['bilangan','geometri','data','bilangan','geometri','bilangan','geometri','data','bilangan','geometri']:
   (j===0?['bilangan','aljabar','data_peluang','geometri','bilangan','aljabar','geometri','data_peluang','bilangan','aljabar']:j===1?['geometri','bilangan','aljabar','data_peluang','geometri','bilangan','aljabar','data_peluang','geometri','bilangan']:['aljabar','geometri','bilangan','data_peluang','aljabar','geometri','bilangan','data_peluang','aljabar','geometri']);
  const id=`${grade}-math-${b}`;
  tasks.push({id,grade,subject:'matematika',ranked,pack_id:ranked?`r${grade}-mtk-${pack}`:null,theme:(grade===6?mathThemes6:mathThemes9)[b],slots:domains.map((competency,i)=>({id:`n${grade}-mtk-${String(b*10+i+1).padStart(3,'0')}`,competency,type:types[(i+b)%10],difficulty_editorial:difficulties[(i+b)%10],cognitive_level:cognitive[(i+b)%10]}))});
 }
 for(let b=0;b<26;b++){
  const ranked=b<18,pack=Math.floor(b/6)+1,j=b%6;
  const competencies=j<4?['tekstual','inferensial','inferensial','evaluasi','tekstual']:['tekstual','inferensial','inferensial','evaluasi','evaluasi'];
  tasks.push({id:`${grade}-reading-${b}`,grade,subject:'bahasa_indonesia',ranked,pack_id:ranked?`r${grade}-bi-${pack}`:null,passage_id:`n${grade}-bacaan-${b+1}`,genre:b%2?'informasi':'fiksi',theme:readingThemes[b],slots:competencies.map((competency,i)=>({id:`n${grade}-bi-${String(b*5+i+1).padStart(3,'0')}`,competency,type:['PG','PG','PG','PGK_MCMA','PGK_CATEGORY'][i],difficulty_editorial:(j%2?['mudah','sedang','mudah','sedang','menantang']:['mudah','sedang','sedang','sedang','menantang'])[i],cognitive_level:competency==='tekstual'?'pemahaman':competency==='inferensial'?'aplikasi':'penalaran'}))});
 }
}
// Review original daily content as well, preserving its IDs and versions.
for(const grade of [6,9]){
 const math=seed.filter(q=>q.grade===grade&&q.subject==='matematika');
 for(let i=0;i<math.length;i+=10)tasks.push({id:`pilot-${grade}-math-${i}`,grade,subject:'matematika',existing:math.slice(i,i+10)});
 for(const p of passages.filter(p=>p.grade===grade))tasks.push({id:`pilot-${p.id}`,grade,subject:'bahasa_indonesia',existing:seed.filter(q=>q.stimulus_id===p.id),existingPassage:p});
}
// Small math batches keep individual model calls bounded.
for(let i=tasks.length-1;i>=0;i--){const t=tasks[i];if(t.slots?.length===10){tasks.splice(i,1,...[0,1].map(j=>({...t,id:t.id+'-part'+j,slots:t.slots.slice(j*5,j*5+5)})));}}
if(process.env.NALARIN_TASK)tasks.splice(0,tasks.length,...tasks.filter(t=>t.id===process.env.NALARIN_TASK));
// Interleave groups so every track receives progress, with at most three network calls at once.
tasks.sort((a,b)=>a.id.localeCompare(b.id));write('tasks.json',tasks);
let calls=0;
async function model(system,payload,label,max=6500){
 if(++calls>420)throw Error('call_budget_exhausted');
 const start=Date.now();
 const r=await fetch(process.env.MITSUKO_BASE_URL.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MITSUKO_API_KEY}`},body:JSON.stringify({model:process.env.MITSUKO_MODEL||'mitsuko',messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(payload)}],reasoning_effort:'low',max_tokens:max,stream:false}),signal:AbortSignal.timeout(180000)});
 if(!r.ok)throw Error(`upstream_${r.status}`);
 const d=await r.json();let text=d.choices?.[0]?.message?.content||'';
 fs.writeFileSync(path.join(root,'audit',label+'.txt'),text);
 text=text.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'').trim();
 const result=JSON.parse(text);console.log(JSON.stringify({event:'model',label,ms:Date.now()-start}));return result;
}
const author=`Tulis soal latihan TKA orisinal berbahasa Indonesia untuk kelas yang ditentukan. Kembalikan JSON saja {passage:null atau {id,title,text,genre},questions:[...]}. Tiap question: {id,stem,options:[{id:"A",text:"..."},...],answer:["B"] atau {A:"Benar",B:"Salah",C:"Benar"},semantic_family:"slug-relasi-matematis-dan-struktur-masalah",explanation:{concept,steps:[minimal 3 langkah bernalar],option_reasons:{A:"alasan spesifik",...},evidence:[kutipan persis bacaan],next_action}}. Ikuti slots type/kompetensi/kognitif/kesulitan secara nyata. PG 4 opsi tepat satu benar; MCMA 4 opsi dengan 2 atau 3 benar, tulis pilih semua jawaban benar; CATEGORY 3 pernyataan independen Benar/Salah dengan kombinasi benar/salah. Jangan bergantung jawaban butir lain. Semua data ada dalam soal, tidak membutuhkan gambar yang tidak disertakan. Gunakan teks biasa dan Unicode sederhana, tanpa HTML/LaTeX atau rumus dengan dolar. Jangan memberi bocoran kunci di stem. Pastikan satuan dan pembulatan eksplisit. Tidak ada opsi identik atau ekuivalen. Penalaran memerlukan evaluasi/strategi dan bukan sekadar hitungan rutin. Soal mudah tetap bermanfaat, bukan jebakan bahasa. Kelas 6: bilangan bulat positif, pecahan/desimal/persen/operasi campuran, geometri/pengukuran, interpretasi tabel/data; bukan aljabar formal atau peluang. Kelas 9: real/pangkat/akar/rasio, aljabar linear/fungsi/barisan, geometri/sudut/kesebangunan/transformasi, data/peluang. Hindari klon numerik dari contoh terlarang. Tiap soal matematika punya struktur penalaran berbeda. Bacaan BI: satu teks orisinal yang koheren (kelas 6 155-190 kata; kelas 9 210-240 kata), fiksi berupa cerita dengan perubahan/perasaan, informasi faktual lengkap dengan batas bukti. Lima pertanyaan berbeda atas bacaan yang sama; inferensi logis bukan spekulasi; bukti harus kutipan persis, semua opsi dijelaskan. Jika tema eksperimen, angka dan hasil harus dinyatakan sebagai percobaan tokoh dalam teks, jangan membuat klaim ilmiah mutlak. Jangan menyalin sumber resmi.`;
const solver=`Anda reviewer soal TKA. Pecahkan independen TANPA kunci penulis. Kembalikan JSON {solutions:[{id,answer:["A"] atau {A:"Benar",B:"Salah",C:"Benar"},reason:"langkah hitung atau bukti teks",issues:[]}]} untuk semua butir. Teliti setiap opsi. Jangan memilih jika soal ambigu; jelaskan masalah di issues. Periksa kecukupan data, padanan opsi, tingkat kelas, dan inferensi berlebihan. CATEGORY evaluasi semua pernyataan. MCMA pilih seluruh opsi benar. Jangan membuat asumsi yang tidak dinyatakan. Perbedaan gaya bukan masalah fatal, tetapi fakta/kunci/bacaan ambigu adalah masalah.`;
const critic=`Audit akhir soal TKA beserta kunci, hasil pemecahan independen, dan pembahasan. Kembalikan JSON {reviews:[{id,approved:true atau false,issues:[]}]} lengkap. Setujui hanya bila jawaban independen cocok, soal dapat dijawab tanpa asumsi tersembunyi, setiap opsi dijelaskan BENAR sesuai teks/hitungan, tidak ada fakta atau angka kontradiktif, tidak membocorkan jawaban antarbutir, sesuai kelas dan kompetensi. Perhatikan label difficulty/kognitif adalah perkiraan editorial. Jangan menolak hanya karena pilihan kata/gaya atau karena belum ada data murid. Jangan menyatakan verifikasi empiris. Jika jawaban berbeda hanya urutan array, itu sama.`;
const same=(a,b)=>JSON.stringify(Array.isArray(a)?[...a].sort():Object.fromEntries(Object.entries(a||{}).sort()))===JSON.stringify(Array.isArray(b)?[...b].sort():Object.fromEntries(Object.entries(b||{}).sort()));
function check(t,data){
 const problems=[],qs=data.questions||[];
 if(qs.length!==(t.existing?.length||t.slots.length))problems.push('question count mismatch');
 if(t.subject==='bahasa_indonesia'){
  const wc=data.passage?.text?.trim().split(/\s+/).length||0;
  if(wc<(t.grade===6?150:200)||wc>(t.grade===6?200:250))problems.push(`passage length ${wc}`);
 }
 for(const [i,q] of qs.entries()){
  const slot=t.existing?.[i]||t.slots[i];if(!slot)continue;
  if(q.id!==slot.id)problems.push(`wrong ID ${q.id}`);
  const ids=(q.options||[]).map(o=>o.id);
  if(ids.join('')!==(slot.type==='PGK_CATEGORY'?'ABC':'ABCD'))problems.push(`${q.id} invalid options`);
  if(new Set(q.options?.map(o=>o.text.trim())).size!==ids.length)problems.push(`${q.id} duplicate options`);
  if(slot.type==='PGK_CATEGORY'){if(Array.isArray(q.answer)||Object.keys(q.answer||{}).sort().join('')!==ids.join('')||Object.values(q.answer||{}).some(v=>!['Benar','Salah'].includes(v)))problems.push(`${q.id} category answer`);}
  else if(!Array.isArray(q.answer)||new Set(q.answer).size!==q.answer.length||q.answer.some(k=>!ids.includes(k))||(slot.type==='PG'?q.answer.length!==1:q.answer.length<2||q.answer.length>3))problems.push(`${q.id} invalid key`);
  if(!q.explanation?.concept||q.explanation.steps?.length<2||ids.some(id=>!q.explanation.option_reasons?.[id]))problems.push(`${q.id} explanation incomplete`);
  if(t.subject==='bahasa_indonesia'&&(!q.explanation?.evidence?.length||q.explanation.evidence.some(e=>!data.passage?.text.includes(e))))problems.push(`${q.id} invalid evidence quote`);
 }
 return problems;
}
async function run(t){
 const dest=`results/${t.id}.json`;if(fs.existsSync(path.join(root,dest)))return;
 let data=t.existing?{questions:t.existing,passage:t.existingPassage||null}:null,issues=[];
 for(let round=0;round<4;round++){
  try{
   if(!data||issues.length){
    data=await model(author,{task:t,forbidden_seed_stems:seed.filter(q=>q.grade===t.grade&&q.subject===t.subject).map(q=>q.stem),previous:data,fix_these:issues},`${t.id}-${round}-author`);
   }
   issues=check(t,data);if(issues.length)continue;
   const solved=await model(solver,{grade:t.grade,passage:data.passage,questions:data.questions.map((q,i)=>({id:q.id,stem:q.stem,type:(t.existing?.[i]||t.slots[i]).type,options:q.options}))},`${t.id}-${round}-blind`,7000);
   issues=data.questions.flatMap(q=>{const s=solved.solutions?.find(s=>s.id===q.id);return !s?[`${q.id} missing independent solution`]:[...(!same(q.answer,s.answer)?[`${q.id}: independent answer ${JSON.stringify(s.answer)} reason ${s.reason}`]:[]),...(s.issues||[]).map(x=>`${q.id}: ${x}`)];});
   if(issues.length)continue;
   const checked=await model(critic,{grade:t.grade,passage:data.passage,questions:data.questions,independent:solved.solutions},`${t.id}-${round}-editor`,4000);
   issues=data.questions.flatMap(q=>{const c=checked.reviews?.find(r=>r.id===q.id);return c?.approved===true?[]:[`${q.id}: ${JSON.stringify(c?.issues||'review missing')}`];});
   if(issues.length)continue;
   const auditId=crypto.createHash('sha256').update(JSON.stringify({data,solved,checked})).digest('hex');
   const result={task:t.id,pack_id:t.pack_id||null,grade:t.grade,subject:t.subject,ranked:Boolean(t.ranked),passage:data.passage?{...data.passage,id:t.existingPassage?.id||t.passage_id,grade:t.grade,source_kind:'original',genre:t.existingPassage?.genre||t.genre}:null,questions:data.questions.map((q,i)=>{
    const slot=t.existing?.[i]||t.slots[i];
    const prefix=t.grade===6?'sd':'smp';
    return {...(t.existing?.[i]||{}),...q,id:slot.id,version:t.existing?(same(q,t.existing[i])?slot.version:slot.version+1):1,grade:t.grade,subject:t.subject,family_id:t.existing?.[i]?.family_id|| (t.subject==='bahasa_indonesia'?t.passage_id:slot.id),competency:slot.competency,cognitive_level:slot.cognitive_level,difficulty_editorial:slot.difficulty_editorial,difficulty_calibrated:false,type:slot.type,category_labels:slot.type==='PGK_CATEGORY'?['Benar','Salah']:null,stimulus_id:t.existing?.[i]?.stimulus_id||t.passage_id||null,module_id:t.existing?.[i]?.module_id||(t.subject==='bahasa_indonesia'?`${t.grade}-bi-${slot.competency}`:`${prefix}-review-${slot.competency}`),source:{kind:'original',exam_year:null,framework_ref:t.subject==='matematika'?(t.grade===6?'S1':'S2'):(t.grade===6?'S3':'S4')},pool:t.ranked?'ranked_v1':'pilot_daily',ranked_eligible:Boolean(t.ranked),pack_id:t.pack_id||null,review:{status:'ai_reviewed',human_review_required:false,independent_mitsuko_review:'passed',blind_solution:solved.solutions.find(s=>s.id===q.id),explanation_review:checked.reviews.find(r=>r.id===q.id),review_id:auditId,reviewed_at:new Date().toISOString(),review_method:'separate blind solve then explanation audit; same model family may share errors'},verification:t.existing?.[i]?.verification||null};
   })};
   write(dest,result);console.log(JSON.stringify({event:'approved',task:t.id,count:data.questions.length,round}));return;
  }catch(e){issues=[String(e.message).slice(0,160)];console.log(JSON.stringify({event:'retry',task:t.id,round,error:issues[0]}));await new Promise(r=>setTimeout(r,1500));}
 }
 write(`audit/${t.id}-quarantine.json`,{issues,data});console.log(JSON.stringify({event:'quarantined',task:t.id,issues}));
}
let cursor=0;await Promise.all(Array.from({length:Number(process.env.NALARIN_WORKERS||3)},async()=>{while(cursor<tasks.length)await run(tasks[cursor++]);}));
const done=tasks.filter(t=>fs.existsSync(path.join(root,`results/${t.id}.json`)));
write('status.json',{total:tasks.length,approved:done.length,missing:tasks.filter(t=>!done.includes(t)).map(t=>t.id),calls});console.log(JSON.stringify(read('status.json')));
