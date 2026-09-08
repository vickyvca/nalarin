"""Apply the narrow diagram renderer change to verified live assets and source."""
from pathlib import Path
import hashlib, json, shutil
ROOT=Path(__file__).resolve().parents[1]
work=ROOT/'work/diagram-release'
def replace_once(s,old,new):
    assert s.count(old)==1,(old,s.count(old))
    return s.replace(old,new)

# Keep source reproducible without shipping other unpublished local features.
app=ROOT/'tka-app/src/app.js'
s=app.read_text(encoding='utf8')
if "import {questionDiagram}" not in s:
    s="import {questionDiagram} from './question-diagram.js';\n"+s
    s=replace_once(s,'<h1>${e(q.prompt)}</h1>','<h1>${e(q.prompt)}</h1>${questionDiagram(q)}')
    s=replace_once(s,'<h3>${e(r.question.prompt)}</h3>','<h3>${e(r.question.prompt)}</h3>${questionDiagram(r.question)}')
    app.write_text(s,encoding='utf8')
css='\n.question-diagram{margin:18px 0;padding:12px;border:1px solid #dce4ff;border-radius:16px;background:#fff;break-inside:avoid}.question-diagram img{display:block;width:100%;max-width:440px;height:auto;margin:0 auto}.question-diagram figcaption{margin-top:8px;color:#56627a;font-size:12px;line-height:1.5;text-align:center}\n'
style=ROOT/'tka-app/src/styles.css'
if '.question-diagram{' not in style.read_text(encoding='utf8'):
    with style.open('a',encoding='utf8') as f:f.write(css)
api=ROOT/'tka-app/server/index.mjs'
s=api.read_text(encoding='utf8')
if 'diagram: question.diagram || null,' not in s:
    s=replace_once(s,'    prompt: question.stem,','    prompt: question.stem,\n    diagram: question.diagram || null,')
    api.write_text(s,encoding='utf8')

release=work/'release'; (release/'assets').mkdir(parents=True,exist_ok=True)
live=(work/'live-index.mjs').read_text(encoding='utf8')
live=replace_once(live,'    prompt: question.stem,','    prompt: question.stem,\n    diagram: question.diagram || null,')
(release/'index.mjs').write_text(live,encoding='utf8')
renderer=(ROOT/'tka-app/src/question-diagram.js').read_text(encoding='utf8').replace('export function questionDiagram','function nalarinQuestionDiagram')
js=(work/'live-app.js').read_text(encoding='utf8')
js=replace_once(js,'<h1>${r(t.prompt)}</h1>','<h1>${r(t.prompt)}</h1>${nalarinQuestionDiagram(t)}')
js=replace_once(js,'<h3>${r(t.question.prompt)}</h3>','<h3>${r(t.question.prompt)}</h3>${nalarinQuestionDiagram(t.question)}')
js=renderer+'\n'+js
style=(work/'live-style.css').read_text(encoding='utf8')+css
jsname='diagram-'+hashlib.sha256(js.encode()).hexdigest()[:12]+'.js'
cssname='diagram-'+hashlib.sha256(style.encode()).hexdigest()[:12]+'.css'
(release/'assets'/jsname).write_text(js,encoding='utf8')
(release/'assets'/cssname).write_text(style,encoding='utf8')
html=(work/'live-index.html').read_text(encoding='utf8').replace('index-CFyKGAnN.js',jsname).replace('index-AGpPch_E.css',cssname)
(release/'index.html').write_text(html,encoding='utf8')
shutil.copytree(ROOT/'tka-app/public/question-diagrams',release/'question-diagrams',dirs_exist_ok=True)
shutil.copyfile(ROOT/'bank/questions.json',release/'questions.json')
guards={n:hashlib.sha256((work/n).read_bytes()).hexdigest() for n in ['live-index.mjs','live-questions.json','live-index.html']}
(release/'guards.json').write_text(json.dumps(guards),encoding='utf8')
print(json.dumps({'release':str(release),'js':jsname,'css':cssname}))
