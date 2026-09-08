from pathlib import Path
p=Path(__file__).resolve().parents[1]/'tka-app/src/app.js'
s=p.read_text(encoding='utf-8')
old='`<div class="ranking-list">${l.rows.map'
new='`${podium(l.rows)}<div class="ranking-list">${l.rows.map'
assert old in s;s=s.replace(old,new)
s+='''\nfunction podium(rows){return `<div class="podium" aria-label="Tiga peserta teratas">${rows.slice(0,3).map((r,i)=>`<article class="podium-card place-${i+1} ${r.mine?'is-me':''}"><span class="podium-medal" aria-label="Peringkat ${r.rank}">${r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:r.rank}</span><span class="podium-avatar">${e(r.nickname.slice(0,1).toUpperCase())}</span><h3>${e(r.nickname)}${r.mine?' · kamu':''}</h3><b>${score(r.score)}<small> poin</small></b><span class="podium-step">#${r.rank}</span></article>`).join('')}</div>`;}\n'''
p.write_text(s,encoding='utf-8')
