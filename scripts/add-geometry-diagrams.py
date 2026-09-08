"""Add versioned, original SVG illustrations using only givens in question stems.

Run after content import. Existing attempts retain their stored question snapshot.
No answer, unknown length, or solution is encoded in the public SVG.
"""
import json, re, hashlib
from pathlib import Path
from html import escape
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'tka-app/public/question-diagrams'
ASSETS.mkdir(parents=True, exist_ok=True)
questions = json.loads((ROOT / 'bank/questions.json').read_text(encoding='utf-8'))

def text(x,y,value):
    return f'<text x="{x}" y="{y}" text-anchor="middle">{escape(str(value))}</text>'

def illustration(q):
    s=q['stem']; dims=re.findall(r'\d+',s)
    unit='dm' if ' dm' in s else 'cm' if ' cm' in s else 'm'
    if 'persegi panjang' in s and len(dims)>=2:
        a,b=dims[:2]; kind='rectangle'
        shape='<rect x="78" y="52" width="230" height="120" rx="1"/>'
        labels=text(193,205,f'{a} {unit}')+text(43,118,f'{b} {unit}')
        alt=f'Persegi panjang dengan panjang {a} {unit} dan lebar {b} {unit}.'
    elif 'balok' in s and len(dims)>=3:
        a,b,c=dims[:3]; kind='cuboid'
        shape='<path d="M80 88H265V178H80Z M80 88L130 48H315V138L265 178 M265 88L315 48 M130 48V138H315 M80 178L130 138"/>'
        labels=text(168,207,f'{a} {unit}')+text(310,180,f'{b} {unit}')+text(45,140,f'{c} {unit}')
        alt=f'Balok dengan panjang {a} {unit}, lebar {b} {unit}, dan tinggi {c} {unit}.'
    elif re.search(r'Sisi sebuah persegi (\d+) cm',s):
        a=re.search(r'Sisi sebuah persegi (\d+) cm',s)[1]; kind='square'
        shape='<rect x="125" y="45" width="145" height="145"/>'
        labels=text(197,220,f'{a} cm')
        alt=f'Persegi dengan panjang setiap sisi {a} cm.'
    elif 'siku-siku' in s and len(dims)>=2:
        a,b=dims[:2]; kind='right-triangle'
        shape='<path d="M100 50V180H300Z"/><path d="M100 164H116V180" fill="none"/>'
        labels=text(66,120,f'{a} cm')+text(205,213,f'{b} cm')+text(221,100,'?')
        alt=f'Segitiga siku-siku dengan dua sisi tegak lurus {a} cm dan {b} cm. Panjang sisi miring ditanyakan.'
    elif 'segitiga sama kaki' in s and dims:
        a=dims[0]; kind='isosceles'
        shape='<path d="M75 190L200 45L325 190Z"/><path d="M126 120L140 131 M260 131L274 120"/>'
        labels=text(128,178,f'{a}°')+text(272,178,f'{a}°')+text(200,85,'?')
        alt=f'Segitiga sama kaki dengan kedua sudut alas {a} derajat. Sudut puncak ditanyakan.'
    elif 'Dua bangun sebangun.' in s and len(dims)>=2:
        a,b=dims[:2]; kind='similarity'
        shape='<rect x="30" y="125" width="95" height="60"/><rect x="185" y="75" width="190" height="120"/>'
        labels=text(78,220,f'{a} cm')+text(280,225,'?')+text(200,34,f'Faktor skala = {b}')
        alt=f'Dua persegi panjang sebangun. Sisi bawah bangun kecil {a} cm. Faktor skala ke bangun besar {b}. Sisi bawah bangun besar ditanyakan.'
    else:
        return None
    caption='Sketsa tidak berskala. Gunakan ukuran yang tertulis pada soal.'
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" role="img"><title>{escape(alt)}</title><rect width="400" height="250" fill="white"/><g fill="#edf1ff" stroke="#334eb5" stroke-width="2.5" stroke-linejoin="round">{shape}</g><g fill="#172746" font-family="Arial,sans-serif" font-size="18" font-weight="600">{labels}</g></svg>'
    digest=hashlib.sha256(svg.encode()).hexdigest()[:12]
    name=f'{q["id"]}-{digest}.svg'
    (ASSETS/name).write_text(svg,encoding='utf-8')
    return dict(src=f'/question-diagrams/{name}',alt=alt,caption=caption,kind=kind)

counts=Counter()
for q in questions:
    if q['subject']!='matematika': continue
    d=illustration(q)
    if not d: continue
    if q.get('diagram')!=d:
        q['version']+=1
        q['diagram']=d
        q['visual_review']={'method':'deterministic labels from given dimensions; no answer encoded','revision':'geometry-2026-09-08','original_text_and_key_unchanged':True}
    counts[f'{q["grade"]}/{d["kind"]}']+=1
(ROOT/'bank/questions.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'illustrated_questions':sum(counts.values()),'by_grade_and_kind':dict(counts),'new_question_ids':0,'text_and_keys_changed':False,'grade_origin_weights':'not implemented; no official percentage confirmed','smp_coverage':'partial: reading repetition and inference labels need revision; graphs, nets, rotations and dilations still missing'}
(ROOT/'bank/VISUAL-COVERAGE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
