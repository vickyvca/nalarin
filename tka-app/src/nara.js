function safeLabel(value) {
  return String(value || 'Kak Nara').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

export function naraAvatar(size = 160, className = 'nara-avatar', label = 'Kak Nara') {
  const dimension = Math.max(72, Number(size) || 160);
  return `<img class="${className}" src="/brand/nara-character-v2.png" width="${dimension}" height="${dimension}" role="img" aria-label="${safeLabel(label)}" alt="${safeLabel(label)}" loading="eager" decoding="async" draggable="false">`;
}
