import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'bank/questions.json';qs=json.loads(p.read_text(encoding='utf-8'))
for q in qs:
 if q['id'] in ['6-mtk-001','6-mtk-011'] and q['version']==1:
  for k,reason in q['explanation']['option_reasons'].items():
   if reason=='Pecahan kedua belum diubah ke penyebut yang sama.':
    q['explanation']['option_reasons'][k]='Pilihan ini tidak sama dengan hasil penjumlahan. Samakan penyebut kedua pecahan, lalu jumlahkan pembilangnya.'
  q['version']=2;q['review']['independent_mitsuko_review']='pending';q['review']['status']='pilot_ai_authored'
  q['review']['revision_reason']='Memperbaiki alasan pengecoh yang keliru menyebut pecahan kedua; kunci dan angka tidak berubah.'
p.write_text(json.dumps(qs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
g=root/'scripts/build_bank.py';s=g.read_text(encoding='utf-8').replace('Pecahan kedua belum diubah ke penyebut yang sama.','Pilihan ini tidak sama dengan hasil penjumlahan. Samakan penyebut kedua pecahan, lalu jumlahkan pembilangnya.')
g.write_text(s,encoding='utf-8')
