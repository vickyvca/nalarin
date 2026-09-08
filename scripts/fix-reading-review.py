import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'bank/questions.json';qs=json.loads(p.read_text(encoding='utf-8'))
for q in qs:
 if q['id']=='6-bi-004':
  q['explanation']['steps']=['Temukan bagian penyerahan payung kepada Bu Sari dan janji sebelum pulang.','Menyerahkan payung temuan dan berjanji mengembalikan payung pinjaman keduanya dinyatakan dalam bacaan. Pilih kedua tindakan tersebut.']
 if q['id']=='6-bi-005' and 'Kuserahkan payung itu kepada beliau.' not in q['explanation']['evidence']:
  q['explanation']['evidence'].insert(0,'Kuserahkan payung itu kepada beliau.')
 if q['id'] in ['6-bi-004','6-bi-005'] and q['version']==1:
  q['version']=2;q['review']['status']='pilot_ai_authored';q['review']['independent_mitsuko_review']='pending'
  q['review']['revision_reason']='Pembahasan tidak lagi merujuk posisi opsi sebelum pengacakan; kutipan pendukung dilengkapi. Kunci tidak berubah.'
p.write_text(json.dumps(qs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Keep the readable bank consistent; generation is intentionally protected after review.
p=root/'bank/BANK-SOAL.md';s=p.read_text(encoding='utf-8').replace('Keduanya menunjukkan tindakan pada dua pilihan pertama.','Menyerahkan payung temuan dan berjanji mengembalikan payung pinjaman keduanya dinyatakan dalam bacaan. Pilih kedua tindakan tersebut.');p.write_text(s,encoding='utf-8')
