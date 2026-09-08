import json, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bank=root/'bank'
questions=json.loads((bank/'questions.json').read_text(encoding='utf-8'))
records={}
for file in sorted((bank/'review-evidence').glob('*.json')):
 data=json.loads(file.read_text(encoding='utf-8'))
 for r in data['results']:
  records[r['id']]={**r,'reviewed_at':data['reviewed_at'],'evidence_file':file.name}
for q in questions:
 r=records.get(q['id'])
 if r and q['type']=='PGK_MCMA' and isinstance(r.get('blind',{}).get('answer'),dict):
  a=r['blind']['answer']
  if set(a.values())<={'Benar','Salah'} and set(a)=={o['id'] for o in q['options']}:
   r['blind']['raw_answer']=a
   r['blind']['answer']=[k for k,v in a.items() if v=='Benar']
   r['match']=set(r['blind']['answer'])==set(q['answer'])
   r['passed']=r['match'] and not r['blind'].get('issues') and r.get('editorial',{}).get('approved') is True and not r['editorial'].get('issues')
 if r and r['version']==q['version'] and r['passed']:
  q['review'].update(status='pilot_ai_reviewed',semantic_review='blind_solution_and_explanation_audit',independent_mitsuko_review='passed',review_id=hashlib.sha256(json.dumps(r,sort_keys=True).encode()).hexdigest(),reviewed_at=r['reviewed_at'])
report={'questions':len(questions),'passed':sum(q['review']['independent_mitsuko_review']=='passed' for q in questions),'needs_review':[q['id'] for q in questions if q['review']['independent_mitsuko_review']!='passed'],'findings':[r for r in records.values() if not r['passed']],'method':'Mitsuko gateway with response model gpt-5.6-luna(max): separate blind solution and explanation audit. Same model family can share errors; no empirical difficulty calibration.','ranked_eligible':0}
(bank/'questions.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(bank/'INDEPENDENT-REVIEW.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
