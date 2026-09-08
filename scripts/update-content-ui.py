from pathlib import Path
p=Path(__file__).resolve().parents[1]/'tka-app/src/app.js'
s=p.read_text(encoding='utf-8')
def replace(a,b):
 global s
 assert a in s, a[:70]
 s=s.replace(a,b)
replace('profile:false,recovery:false,','profile:false,recovery:false,report:null,reportMessage:"",')
replace("+(state.recovery?recoveryDialog():'')", "+(state.recovery?recoveryDialog():'')+(state.report?reportDialog():'')")
replace("if(action==='close-dialog'){if(state.module)","if(action==='close-dialog'){if(state.report)state.report=null;else if(state.module)")
replace("if(action==='profile')state.profile=true;", "if(action==='profile')state.profile=true;\n  if(action==='report'){state.report={question_id:id,attempt_id:state.review.id};state.reportMessage='';}")
replace("  if(form.id==='profile-form')", "  if(form.id==='report-form'){state.reportMessage=(await api(`/attempts/${state.report.attempt_id}/report`,{...data,question_id:state.report.question_id})).message;state.report=null;}\n  if(form.id==='profile-form')")
replace("${button('Buka materi terkait','module',`data-id=\"${e(r.question.module_id)}\"`,'secondary')}", "${r.void_reason?`<p class=\"module-tip\">Soal dibatalkan: ${e(r.void_reason)}. Tidak dihitung dalam nilai.</p>`:''}${button('Buka materi terkait','module',`data-id=\"${e(r.question.module_id)}\"`,'secondary')}${button('Laporkan soal','report',`data-id=\"${r.question.id}\"`,'secondary')}")
replace("${state.tutor?.enabled?`<div class=\"nara-box\">", "${state.tutor?.enabled&&!r.void_reason?`<div class=\"nara-box\">")
replace('<h2>Pelan-pelan, kita pahami.</h2>', '<h2>Pelan-pelan, kita pahami.</h2>${state.reportMessage?`<p class="module-tip" role="status">${e(state.reportMessage)}</p>`:""}${a.correction_note?`<p class="module-tip">${e(a.correction_note)}</p>`:""}')
replace("${r.correct?'Tepat':'Mari dipelajari'}", "${r.void_reason?'Dibatalkan':r.correct?'Tepat':'Mari dipelajari'}")
replace('<p>Hasilmu tersimpan. Lihat pembahasan', '${a.correction_note?`<p class="module-tip">${e(a.correction_note)}</p>`:""}<p>Hasilmu tersimpan. Lihat pembahasan')
replace('30 soal · 75 menit · nilai terbaik masuk peringkat kelas ${learnerProfile().grade}.</p>', '30 soal · 75 menit · nilai terbaik masuk peringkat kelas ${learnerProfile().grade}.</p><p class="league-note">Liga latihan Nalarin. Kesulitan masih perkiraan; nilai ini bukan nilai resmi TKA.</p>')
replace("l?.available?'Mulai sesi liga':'Segera hadir','ranked',!l?.available?'disabled':''", "l?.available?'Mulai sesi liga':'Segera hadir','ranked',!l?.available||l.remaining===0?'disabled':''")
replace("state.progressMode&&(state.progressSubject", "state.progressMode&&(state.progressMode!=='daily'||!a.module_id)&&(state.progressSubject")
# Keep module drills distinct from mixed daily practice in charts.
replace("a.mode===state.progressMode&&", "(state.progressMode==='module'?Boolean(a.module_id):a.mode===state.progressMode)&&")
replace("[['daily','Latihan harian'],['ranked','Sesi liga']]", "[['daily','Latihan harian'],['module','Latihan materi'],['ranked','Sesi liga']]")
replace("<small>${date(a.submitted_at)} · ${a.correct_count}/${a.total_count} benar</small>", "<small>${date(a.submitted_at)} · ${a.correct_count}/${a.total_count} benar${a.correction_note?' · ada koreksi':''}</small>")
s+='''\nfunction reportDialog(){return dialog(`<h2>Laporkan soal</h2><p>Pilih bagian yang perlu diperiksa. Jangan tulis data pribadi.</p><form id="report-form" class="auth-card plain-form"><label>Bagian yang perlu diperiksa<select name="reason" required><option value="answer">Jawaban terasa tidak sesuai</option><option value="unclear">Soal kurang jelas</option><option value="explanation">Pembahasan kurang sesuai</option><option value="display">Tampilan sulit dibaca</option></select></label><label>Catatan singkat (opsional)<textarea name="note" maxlength="500" rows="3"></textarea></label><button type="submit" class="button button-primary">Simpan laporan</button></form>`);}\n'''
p.write_text(s,encoding='utf-8')
