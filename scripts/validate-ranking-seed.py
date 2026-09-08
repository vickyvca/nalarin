import json,collections,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
q=json.loads((root/'bank/ranking-candidates.json').read_text(encoding='utf-8'));p={x['id']:x for x in json.loads((root/'bank/ranking-passages.json').read_text(encoding='utf-8'))};errors=[]
for x in q:
 ids=[o['id'] for o in x['options']]
 if len(ids)!=len(set(ids)) or set(x['explanation']['option_reasons'])!=set(ids):errors.append((x['id'],'options/reasons'))
 if x['type']=='PG' and (not isinstance(x['answer'],list) or len(x['answer'])!=1):errors.append((x['id'],'pg'))
 if x['type']=='PGK_MCMA' and (not isinstance(x['answer'],list) or len(x['answer']) not in (2,3)):errors.append((x['id'],'mcma'))
 if x['type']=='PGK_CATEGORY' and set(x['answer'])!=set(ids):errors.append((x['id'],'category'))
 if any(k not in ids for k in (x['answer'] if isinstance(x['answer'],list) else x['answer'])):errors.append((x['id'],'key ids'))
 if x['subject']=='matematika' and x['type']=='PG' and x['options'][ids.index(x['answer'][0])]['text']!=x['verification']['value']:errors.append((x['id'],'formula key'))
 if x['stimulus_id'] and any(e not in p[x['stimulus_id']]['text'] for e in x['explanation']['evidence']):errors.append((x['id'],'evidence'))
 texts=[x['stem']]+[o['text'] for o in x['options']]+x['explanation']['steps']+list(x['explanation']['option_reasons'].values())+x['explanation'].get('evidence',[])
 joined=' '.join(texts)
 if len({o['text'] for o in x['options']})!=len(x['options']):errors.append((x['id'],'duplicate option text'))
 if any(marker in joined for marker in ('Dalam konteks','pada variasi','antar kelas','Image','TODO','Lorem','120,000','[10,','  ')):errors.append((x['id'],'editorial artifact'))
 if x['subject']=='matematika' and re.search(r'\b\d+\.\d+\b',joined):errors.append((x['id'],'dot decimal'))
 if x['subject']=='bahasa_indonesia' and x['stimulus_id'] and x['stimulus_id'] not in p:errors.append((x['id'],'missing passage'))
for passage in p.values():
 low,high=(3,7) if passage['grade']==6 else (5,9)
 for sentence in re.split(r'(?<=[.!?])\s+',passage['text']):
  words=len(sentence.split())
  if not low<=words<=high:errors.append((passage['id'],f'sentence length {words}'))
for pack in sorted(set(x['pack_id'] for x in q)):
 a=[x for x in q if x['pack_id']==pack]
 if len(a)!=30 or collections.Counter(x['type'] for x in a)!={'PG':18,'PGK_MCMA':6,'PGK_CATEGORY':6}:errors.append((pack,'package composition'))
 if a[0]['subject']=='matematika' and len(set(x['family_id'] for x in a))!=30:errors.append((pack,'repeated family'))
 if a[0]['subject']=='matematika' and collections.Counter(x['competency'] for x in a) not in ({'bilangan':12,'geometri':12,'data':6},{'bilangan':8,'aljabar':8,'geometri':8,'data_peluang':6}):errors.append((pack,'math competency'))
 if a[0]['subject']=='bahasa_indonesia':
  groups=collections.Counter(x['stimulus_id'] for x in a)
  if len(groups)!=6 or set(groups.values())!={5}:errors.append((pack,'reading groups'))
print(json.dumps({'questions':len(q),'passages':len(p),'duplicate_stems':len(q)-len(set(x['stem'] for x in q)),'errors':errors[:20],'error_count':len(errors)},ensure_ascii=False))
raise SystemExit(1 if errors else 0)
