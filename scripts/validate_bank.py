"""Validate referential integrity, original passage evidence, and recompute math keys."""
import json
import re
from collections import Counter
from fractions import Fraction as F
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BANK=ROOT/'bank'
def read(name): return json.loads((BANK/name).read_text(encoding='utf-8'))
qs,ps,ms=read('questions.json'),read('passages.json'),read('modules.json')
errors=[]
warnings=[]
OFFICIAL_SAMPLE_PROFILES={
    'SD/matematika': {'PG':18,'PGK_MCMA':3,'PGK_CATEGORY':9},
    'SD/bahasa_indonesia': {'PG':16,'PGK_MCMA':6,'PGK_CATEGORY':8},
    'SMP/matematika': {'PG':16,'PGK_MCMA':7,'PGK_CATEGORY':7},
    'SMP/bahasa_indonesia': {'PG':13,'PGK_MCMA':10,'PGK_CATEGORY':7},
}
def require(ok,msg):
    if not ok: errors.append(msg)
passages={p['id']:p for p in ps}
modules={m['id']:m for m in ms}
require(len({q['id'] for q in qs})==len(qs),'Duplicate question IDs')
require(len(passages)==len(ps),'Duplicate passage IDs')
require(len(modules)==len(ms),'Duplicate module IDs')
# Reading groups must not reuse a stem inside the same stimulus. Standalone
# mathematics items may legitimately share a template across different packs.
reading_qs=[q for q in qs if q.get('stimulus_id')]
require(len({(q['stem'],q['stimulus_id']) for q in reading_qs})==len(reading_qs),'Duplicate stems with same stimulus')
word_counts={}
for p in ps:
    text=re.sub(r'Teks [AB]\n','',p['text'])
    wc=len(text.split()); word_counts[p['id']]=wc
    low,high=(150,200) if p['grade']==6 else (200,250)
    require(low<=wc<=high,f"{p['id']} passage length {wc}, expected {low}–{high}")
    require(p['source_kind']=='original',f"{p['id']} source")
    # Sentence-length deviations are visible editorial warnings, not silently certified.
    sentences=[s.strip() for s in re.split(r'[.!?]+\s*',text) if s.strip()]
    slo,shi=(3,7) if p['grade']==6 else (5,9)
    out=[len(s.split()) for s in sentences if not slo<=len(s.split())<=shi]
    if out: warnings.append(f"{p['id']}: {len(out)}/{len(sentences)} sentences outside framework indicative {slo}–{shi} words; pilot editorial review needed")

math_checked=0
evidence_checked=0
for q in qs:
    ident=q['id']; ids={o['id'] for o in q['options']}
    pool=q.get('pool','pilot_daily')
    require(q['module_id'] in modules,f'{ident} missing module')
    if q['module_id'] in modules:
        require(modules[q['module_id']]['grade']==q['grade'],f'{ident} module grade')
    require(len(ids)==len(q['options']),f'{ident} duplicate option ID')
    require(len({o['text'] for o in q['options']})==len(q['options']),f'{ident} duplicate option text')
    require(set(q['explanation']['option_reasons'])==ids,f'{ident} incomplete option reasons')
    require(len(q['explanation']['steps'])>=2,f'{ident} incomplete explanation')
    require(q['source']['kind']=='original' and q['source']['exam_year'] is None,f'{ident} incorrect source label')
    if pool=='pilot_daily':
        require(q['ranked_eligible'] is False,f'{ident} pilot must not enter ranked pool')
    elif pool=='ranked_v1':
        require(q['ranked_eligible'] is True,f'{ident} ranked item must be eligible')
        require(q.get('review',{}).get('status')=='ai_reviewed',f'{ident} missing passed AI review')
    else:
        errors.append(f'{ident} unknown pool {pool}')
    if q['type']=='PGK_CATEGORY':
        require(set(q['answer'])==ids,f'{ident} incomplete category key')
        require(set(q['answer'].values())<={'Benar','Salah'},f'{ident} category value')
    else:
        require(set(q['answer'])<=ids and len(set(q['answer']))==len(q['answer']),f'{ident} invalid option key')
        require(len(q['answer'])==1 if q['type']=='PG' else 1<len(q['answer'])<len(ids),f'{ident} incorrect answer cardinality')
    if q['stimulus_id']:
        p=passages.get(q['stimulus_id'])
        require(p is not None,f'{ident} missing passage')
        require(bool(q['explanation']['evidence']),f'{ident} missing text evidence')
        if p:
            require(q['grade']==p['grade'],f'{ident} passage grade')
            for e in q['explanation']['evidence']:
                require(e in p['text'],f'{ident} evidence not in passage: {e}')
                evidence_checked+=1
        continue
    # Ranking mathematics uses the compact formula_seed provenance and is
    # recomputed by validate-ranking-seed.py.  The legacy pilot validator below
    # expects the older rule/inputs shape, so keep that path separate.
    if pool=='ranked_v1':
        require(q['subject']=='matematika',f'{ident} ranked no-stimulus item must be mathematics')
        require(q.get('verification',{}).get('kind')=='formula_seed',f'{ident} missing formula seed')
        math_checked+=1
        continue
    v=q['verification']; rule=v['rule']; x=v['inputs']; expected=None
    mapping=v.get('authored_to_presented_ids',{i:i for i in ids})
    require(set(mapping)==ids and set(mapping.values())==ids,f'{ident} invalid option permutation')
    def presented(keys): return {mapping[c] for c in keys}
    # Recompute from raw inputs. Several rules enumerate possibilities instead of
    # repeating the algebraic method used in the learner-facing explanation.
    if rule=='daily_fence': expected=sum([x[0],x[1],x[0],x[1]])-x[2]
    elif rule=='daily_portions': expected=F(x[0]*1000,x[1])
    elif rule=='daily_sum': expected=sum(x)
    elif rule=='division':
        dividend, divisor = x
        require(divisor>0 and dividend%divisor==0,f'{ident} division must be exact and positive')
        expected=dividend//divisor
    elif rule=='daily_tiles':
        require(x[0]%x[2]==0 and x[1]%x[2]==0,f'{ident} tile edges must divide exactly')
        expected=sum(1 for _ in range(0,x[0],x[2]) for _ in range(0,x[1],x[2]))
    elif rule=='daily_median':
        ordered=sorted(x); mid=len(x)//2
        expected=F(ordered[mid-1]+ordered[mid],2) if len(x)%2==0 else F(ordered[mid])
    elif rule=='daily_weighted_mean':
        expanded=[value for value,count in x for _ in range(count)]
        expected=F(sum(expanded),len(expanded))
    elif rule=='daily_scaled_area': expected=F(x[0]*x[1]*x[2]**2,10000)
    elif rule=='daily_fill_time': expected=F(x[0]*x[1]*(x[3]-x[2]),1000*x[4])
    elif rule=='daily_affine_cost':
        h1,c1,h2,c2,h=x
        expected=F(c1)+F((c2-c1)*(h-h1),h2-h1)
    elif rule=='ceiling_units':
        amount, unit = x
        require(amount>=0 and unit>0,f'{ident} ceiling inputs must be nonnegative and positive')
        expected=(amount+unit-1)//unit
    elif rule=='daily_budget':
        budget,delivery,unit=x
        expected=max(n for n in range(budget//unit+1) if delivery+n*unit<=budget)
    elif rule=='daily_growth':
        initial,interval,elapsed=x
        require(elapsed%interval==0,f'{ident} partial growth period')
        expected=initial
        for _ in range(elapsed//interval): expected+=expected
    elif rule=='daily_frequency': expected=F(x[0]*x[2],x[1])
    elif rule=='fraction_sum': expected=F(x[0],x[1])+F(x[2],x[3])
    elif rule=='fraction_product': expected=sum([F(x[1],x[2]) for _ in range(x[0])])
    elif rule=='gcd': expected=max(n for n in range(1,min(x)+1) if all(z%n==0 for z in x))
    elif rule=='lcm': expected=next(n for n in range(1,x[0]*x[1]+1) if all(n%z==0 for z in x))
    elif rule=='area': expected=sum(x[0] for _ in range(x[1]))
    elif rule=='time':
        h,m,dh,dm=x
        for _ in range(dh*60+dm):
            m+=1
            if m==60: h+=1; m=0
        expected=h*60+m
    elif rule=='inverse_ratio':
        w,d,n=x; expected=next(F(t) for t in range(1,1000) if n*t==w*d)
    elif rule=='discount': expected=F(x[0])-F(x[0])*F(x[1],100)
    elif rule=='linear': expected=next(F(n) for n in range(-1000,1001) if x[0]*n+x[1]==x[2])
    elif rule=='linear_table':
        pairs, target = x[:-1], x[-1]
        require(len(pairs)>=2,f'{ident} linear table needs two pairs')
        slopes=[]
        for (x1,y1),(x2,y2) in zip(pairs,pairs[1:]):
            require(x2!=x1,f'{ident} linear table has repeated x')
            slopes.append(F(y2-y1,x2-x1))
        require(len(set(slopes))==1,f'{ident} linear table slopes disagree')
        slope=slopes[0]
        intercept=F(pairs[0][1])-slope*pairs[0][0]
        expected=slope*target+intercept
    elif rule=='spldv':
        u,vv=x
        candidates=[]
        for p in range(0,u//2+1):
            b=u-2*p
            if p+2*b==vv: candidates.append((p,b))
        require(len(candidates)==1,f'{ident} SPLDV nonunique')
        p,b=candidates[0]; expected=3*p+2*b
    elif rule=='sequence':
        a,d,n=x; seq=[a]
        while len(seq)<n: seq.append(seq[-1]+d)
        expected=seq[-1]
    elif rule=='pythagoras': expected=next(n for n in range(1,sum(x)+1) if n*n==sum(z*z for z in x))
    elif rule=='missing_mean': expected=next(n for n in range(-100,101) if F(sum(x[:3])+n,4)==x[3])
    elif rule=='equivalent':
        correct=[chr(65+i) for i,n in enumerate(v['option_values']) if F(n)==F(*x)]
        require(presented(correct)==set(q['answer']),f'{ident} equivalent key mismatch')
    elif rule=='inequality':
        correct=[chr(65+i) for i,n in enumerate(v['option_values']) if x[0]*F(n)+x[1]<=x[2]]
        require(presented(correct)==set(q['answer']),f'{ident} inequality key mismatch')
    elif rule=='probability':
        allballs=['red']*x[0]+['blue']*x[1]+['green']*x[2]
        actual=[F(allballs.count('red'),len(allballs)),F(allballs.count('blue'),len(allballs)),F(allballs.count('green'),len(allballs)),F(sum(c!='red' for c in allballs),len(allballs))]
        correct=[chr(65+i) for i,(claim,a) in enumerate(zip(v['claims'],actual)) if F(claim)==a]
        require(presented(correct)==set(q['answer']),f'{ident} probability key mismatch')
    elif rule=='data_mcma':
        predicates=[sum(x)==v['total_claim'], x[1]>max(x[0],x[2],x[3]),x[0]>x[2],x[3]>x[1]]
        require(presented([chr(65+i) for i,t in enumerate(predicates) if t])==set(q['answer']),f'{ident} data key mismatch')
    elif rule=='data_summary_mcma':
        predicates=[sum(x)<v['total_less_than'], x[1]==max(x), x[1]>x[2], len(x)==v['day_count_claim']]
        require(presented([chr(65+i) for i,t in enumerate(predicates) if t])==set(q['answer']),f'{ident} data summary key mismatch')
    elif rule=='stats_mcma':
        ordered=sorted(x)
        mid=len(ordered)//2
        median=F(ordered[mid-1]+ordered[mid],2) if len(ordered)%2==0 else F(ordered[mid])
        mean=F(sum(ordered),len(ordered))
        counts=Counter(ordered)
        mode=max(counts, key=counts.get)
        actual=[median, max(ordered)-min(ordered), mean, F(mode)]
        correct=[chr(65+i) for i,claim in enumerate(v['claims']) if F(claim)==actual[i]]
        require(presented(correct)==set(q['answer']),f'{ident} statistics key mismatch')
    elif rule=='volume_category':
        cubes=sum(1 for _ in range(x[0]) for _ in range(x[1]) for _ in range(x[2]))
        expected_cat=[v['assertions'][0]==cubes,F(v['assertions'][1])==F(cubes,1000),v['assertions'][2]==2*cubes]
    elif rule=='rectangle_category':
        p,l=x; assertions=v['assertions']
        expected_cat=[assertions[0]==sum([p,l,p,l]),assertions[1]==sum(p for _ in range(l)),assertions[2]+l==p]
    elif rule=='transform_category':
        px,py,dx,dy=x; claims=v['assertions']
        expected_cat=[claims[0]-px==dx,claims[1]-py==dy,claims[2][0]==px and claims[2][1]+py==0]
    else: errors.append(f'{ident} unknown verification rule {rule}')
    if expected is not None:
        correct=[chr(65+i) for i,n in enumerate(v['option_values']) if F(n)==expected]
        require(len(correct)==1 and presented(correct)==set(q['answer']),f'{ident} calculated key mismatch: {expected}')
        # Check displayed numeric values independently of option IDs for numeric PGs.
        if rule!='time':
            for o in q['options']:
                shown=o['text'].split()[0]
                original_id=next(k for k,val in mapping.items() if val==o['id'])
                require(F(shown)==F(v['option_values'][ord(original_id)-65]),f'{ident} displayed value mismatch')
    if rule.endswith('_category'):
        actual={chr(65+i):'Benar' if yes else 'Salah' for i,yes in enumerate(expected_cat)}
        require(actual==q['answer'],f'{ident} category mathematical mismatch')
    math_checked+=1

for m in ms:
    require(len(m['key_points'])>=3 and len(m['example']['steps'])>=3,f"{m['id']} incomplete module")
    require(any(q['module_id']==m['id'] for q in qs),f"{m['id']} no question link")

ranked_count=sum(1 for q in qs if q.get('pool')=='ranked_v1')
official_profile_report={}
for profile, observed in OFFICIAL_SAMPLE_PROFILES.items():
    grade, subject=profile.split('/',1)
    current=Counter(q['type'] for q in qs if str(q['grade'])==('6' if grade=='SD' else '9') and q['subject']==subject)
    current_counts={kind:current.get(kind,0) for kind in observed}
    official_profile_report[profile]={
        'observed_sample': observed,
        'sample_total': sum(observed.values()),
        'bank_current': current_counts,
        'bank_total': sum(current_counts.values()),
        'delta_vs_sample': {kind:current_counts[kind]-observed[kind] for kind in observed},
        'interpretation':'Informational editorial comparison; this does not enforce a quota or fail validation.'
    }
report={'status':'PASS' if not errors else 'FAIL','questions':len(qs),
        'counts_by_grade_subject':dict(Counter(f"{q['grade']}/{q['subject']}" for q in qs)),
        'counts_by_type':dict(Counter(q['type'] for q in qs)),
        'pg_key_distribution':dict(Counter(q['answer'][0] for q in qs if q['type']=='PG')),
        'math_keys_recomputed':math_checked,'text_evidence_spans_checked':evidence_checked,
        'passage_word_counts':word_counts,'modules':len(ms),'errors':errors,'warnings':warnings,
        'official_sample_profiles':official_profile_report,
        'limitations':['Automated checks do not establish pedagogical quality or calibrated difficulty.',
                      'Evidence existence is not proof of entailment; see RANKING-REVIEW.json and INDEPENDENT-REVIEW.json for per-question AI review coverage.',
                      f'Ranked pool contains {ranked_count} AI-reviewed questions; difficulty is not calibrated from learner response data.']}
(BANK/'QA-REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(1 if errors else 0)
