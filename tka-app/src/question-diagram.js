// Render only original, versioned local images. SVG files never contain keys.
export function questionDiagram(q) {
  const d=q?.diagram;
  if (!d || !/^\/question-diagrams\/[a-zA-Z0-9_-]+\.svg$/.test(d.src)) return '';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<figure class="question-diagram"><img src="${d.src}" alt="${esc(d.alt)}" width="400" height="250"><figcaption>${esc(d.caption)}</figcaption></figure>`;
}
