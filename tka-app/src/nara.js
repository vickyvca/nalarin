function safeLabel(value) {
  return String(value || 'Kak Nara').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

export function naraAvatar(size = 160, className = 'nara-avatar', label = 'Kak Nara') {
  const dimension = Math.max(72, Number(size) || 160);
  return `<svg class="${className}" width="${dimension}" height="${dimension}" viewBox="0 0 180 180" role="img" aria-label="${safeLabel(label)}" xmlns="http://www.w3.org/2000/svg">
    <title>${safeLabel(label)}</title>
    <defs>
      <linearGradient id="nara-scarf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff927a"/><stop offset="1" stop-color="#ffb39f"/></linearGradient>
      <linearGradient id="nara-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4161f5"/><stop offset="1" stop-color="#7189ff"/></linearGradient>
    </defs>
    <circle cx="90" cy="90" r="82" fill="#fff7d7"/>
    <path d="M38 151c4-28 22-42 52-42s48 14 52 42" fill="url(#nara-scarf)" stroke="#202b45" stroke-width="4"/>
    <path d="M56 135c8-13 21-20 34-20s26 7 34 20" fill="#fff" opacity=".84"/>
    <path d="M47 72c0-31 18-49 44-49 25 0 43 18 43 49v31c0 22-19 39-43 39s-44-17-44-39V72Z" fill="#ffd9bd" stroke="#202b45" stroke-width="4"/>
    <path d="M45 78c-7-35 13-58 47-58 27 0 46 17 46 46-8-7-15-18-18-30-12 15-32 24-58 25-4 9-8 15-17 17Z" fill="url(#nara-hair)" stroke="#202b45" stroke-width="4" stroke-linejoin="round"/>
    <path d="M46 80c2 17 5 26 11 32" fill="none" stroke="#202b45" stroke-width="4" stroke-linecap="round"/>
    <path d="M134 79c-1 16-5 27-11 34" fill="none" stroke="#202b45" stroke-width="4" stroke-linecap="round"/>
    <circle cx="72" cy="85" r="4" fill="#202b45"/><circle cx="108" cy="85" r="4" fill="#202b45"/>
    <path d="M77 103c8 7 18 7 26 0" fill="none" stroke="#202b45" stroke-width="4" stroke-linecap="round"/>
    <path d="M68 120c6 7 13 10 22 10s16-3 22-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <path d="M34 143c9-6 19-9 29-9" fill="none" stroke="#202b45" stroke-width="4" stroke-linecap="round"/>
    <path d="M146 143c-9-6-19-9-29-9" fill="none" stroke="#202b45" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 139h28v22H30z" fill="#4161f5" stroke="#202b45" stroke-width="4" stroke-linejoin="round"/>
    <path d="M122 139h28v22h-28z" fill="#4161f5" stroke="#202b45" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 148h60" stroke="#202b45" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
