function safeLabel(value) {
  return String(value || 'Kak Nara').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

const naraPoses = {
  welcome: '/brand/nara-character-v2.png',
  wave: '/brand/nara-poses/nara-character-wave-v1.webp',
  explain: '/brand/nara-poses/nara-character-explain-tip-v1.webp',
  cheer: '/brand/nara-poses/nara-character-celebrate-v1.webp',
  think: '/brand/nara-poses/nara-character-think-v1.webp',
  encourage: '/brand/nara-poses/nara-character-encourage-v1.webp',
  invite: '/brand/nara-poses/nara-character-invite-v1.webp',
  support: '/brand/nara-poses/nara-character-support-v1.webp',
};

export function naraAvatar(size = 160, className = 'nara-avatar', label = 'Kak Nara', loading = 'eager', pose = 'welcome') {
  const dimension = Math.max(72, Number(size) || 160);
  const selectedPose = naraPoses[pose] ? pose : 'welcome';
  const classes = className === 'nara-avatar' ? 'nara-avatar' : ['nara-avatar', className].filter(Boolean).join(' ');
  return `<img class="${classes}" src="${naraPoses[selectedPose]}" width="${dimension}" height="${dimension}" data-pose="${selectedPose}" role="img" aria-label="${safeLabel(label)}" alt="${safeLabel(label)}" loading="${loading === 'lazy' ? 'lazy' : 'eager'}" decoding="async" draggable="false">`;
}
