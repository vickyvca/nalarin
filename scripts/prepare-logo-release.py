from pathlib import Path
import hashlib, shutil
ROOT=Path(__file__).resolve().parents[1];work=ROOT/'work/logo-release';release=work/'release'
(release/'assets').mkdir(parents=True,exist_ok=True)
old='<span class="brand-mark">✦</span><span>Nalarin</span>'
new='<img class="nalarin-logo" src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778" fetchpriority="high">'
css='\n.brand .nalarin-logo{display:block;width:180px;height:auto;max-width:100%}.auth-brand .nalarin-logo{display:block;width:244px;height:auto;max-width:100%}.mobile-header .brand .nalarin-logo{width:142px}.brand:has(.nalarin-logo),.auth-brand:has(.nalarin-logo){gap:0}@media(max-width:600px){.auth-brand .nalarin-logo{width:200px}}\n'
icons='    <link rel="icon" type="image/png" href="/brand/nalarin-icon-v1.png">\n    <link rel="apple-touch-icon" href="/brand/nalarin-icon-v1.png">\n'
src=ROOT/'tka-app/src/ui.js';s=src.read_text(encoding='utf8');assert s.count(old)==4;s=s.replace(old,new);src.write_text(s,encoding='utf8')
style=ROOT/'tka-app/src/styles.css'
with style.open('a',encoding='utf8') as f:f.write(css)
html=ROOT/'tka-app/index.html';s=html.read_text(encoding='utf8').replace('  </head>',icons+'  </head>');html.write_text(s,encoding='utf8')
js=(work/'live.js').read_text(encoding='utf8');assert js.count(old)==4;js=js.replace(old,new)
style=(work/'live.css').read_text(encoding='utf8')+css
jn='logo-'+hashlib.sha256(js.encode()).hexdigest()[:12]+'.js';cn='logo-'+hashlib.sha256(style.encode()).hexdigest()[:12]+'.css'
(release/'assets'/jn).write_text(js,encoding='utf8');(release/'assets'/cn).write_text(style,encoding='utf8')
s=(work/'live.html').read_text(encoding='utf8').replace('diagram-7b3b9daca498.js',jn).replace('diagram-657df22bf24d.css',cn).replace('  </head>',icons+'  </head>')
(release/'index.html').write_text(s,encoding='utf8')
shutil.copytree(ROOT/'tka-app/public/brand',release/'brand',dirs_exist_ok=True)
(release/'previous.sha256').write_text(hashlib.sha256((work/'live.html').read_bytes()).hexdigest())
print(jn,cn)
