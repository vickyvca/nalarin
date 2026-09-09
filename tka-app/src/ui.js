import { state, subjects, learnerProfile, displayName } from './app.js';
import { naraAvatar } from './nara.js';
function icon(name, size = 20) {
  const paths = {
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    pencil: '<path d="m4 16-1 4 4-1L19 7l-3-3L4 16Z"/><path d="m14 5 3 3"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/>',
    chart: '<path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/>',
    flame: '<path d="M12 21c4 0 7-2.5 7-6.4 0-2.7-1.3-4.8-3.8-6.8.1 2.2-.7 3.4-1.8 4.1.3-3.8-1.4-6.6-4.7-9C8.8 7.3 5 9.8 5 14.6 5 18.5 8 21 12 21Z"/>',
    spark: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 3v11M7 10l5 5 5-5M4 20h16"/>',
  };
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.spark}</svg>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function subjectPill(subject, compact = false) {
  const item = subjects[subject];
  return `<span class="subject-pill ${item.tone}"><b>${item.icon}</b>${compact ? item.short : item.label}</span>`;
}

function navItem(id, label, iconName) {
  const active = state.page === id ? 'active' : '';
  return `<button class="nav-item ${active}" data-action="navigate" data-page="${id}" aria-current="${active ? 'page' : 'false'}">${icon(iconName, 19)}<span>${label}</span></button>`;
}

function shell(content) {
  const learner = learnerProfile();
  const name = displayName();
  const gradeLabel = learner?.grade ? `Kelas ${learner.grade}${learner.school ? ` · ${escapeHtml(learner.school)}` : ''}` : 'Ruang belajar';
  const initial = escapeHtml(name.slice(0, 1).toUpperCase());
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><img class="nalarin-logo" src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778" fetchpriority="high"></div>
        <nav class="desktop-nav" aria-label="Navigasi utama">
          ${navItem('home', 'Beranda', 'home')}
          ${navItem('practice', 'Latihan', 'pencil')}
          ${navItem('league', 'Liga Mingguan', 'trophy')}
          ${navItem('progress', 'Progresku', 'chart')}
        </nav>
        <div class="sidebar-profile"><span class="avatar avatar-yellow">${initial}</span><span><b>${escapeHtml(name)}</b><small>${gradeLabel}</small></span><button class="logout-mini" data-action="profile" aria-label="Profil dan pengaturan">↗</button></div>
      </aside>
      <main class="main-column">
        ${state.apiError ? `<div class="api-alert" role="alert">${escapeHtml(state.apiError)}<button data-action="dismiss-error" aria-label="Tutup">×</button></div>` : ''}
        <header class="mobile-header"><div class="brand"><img class="nalarin-logo" src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778" fetchpriority="high"></div><button class="avatar avatar-yellow profile-button" data-action="profile" aria-label="Profil dan pengaturan">${initial}</button></header>
        ${content}
      </main>
      <nav class="mobile-nav" aria-label="Navigasi mobile">
        ${navItem('home', 'Beranda', 'home')}
        ${navItem('practice', 'Latihan', 'pencil')}
        ${navItem('league', 'Liga', 'trophy')}
        ${navItem('progress', 'Progres', 'chart')}
      </nav>
    </div>`;
}

function pageTitle(title, subtitle, action = '') {
  return `<div class="page-title"><div><p class="eyebrow">RUANG BELAJAR ${escapeHtml(displayName()).toUpperCase()}</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}

function authLoadingPage() {
  return `<div class="auth-page auth-loading"><div class="auth-brand"><img class="nalarin-logo" src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778" fetchpriority="high"></div><div class="auth-card"><div class="loading-orb">✦</div><h1>Menyiapkan ruang belajar…</h1><p>Sinkronkan akun dan progresmu sebentar.</p></div></div>`;
}

function publicRankLabel(subject) {
  return subject === 'matematika' ? 'Matematika' : 'Bahasa Indonesia';
}

function landingPage() {
  const rows = state.publicRanking?.rows || [];
  const rankingRows = rows.slice(0, 5).map((row) => `<div class="public-rank-row"><span class="public-rank-number">${row.rank}</span><span class="public-rank-avatar">${escapeHtml(String(row.nickname || '?').slice(0, 1).toUpperCase())}</span><span class="public-rank-name"><b>${escapeHtml(row.nickname)}</b><small>${escapeHtml(row.school)} · Kelas ${escapeHtml(row.grade)}</small></span><strong>${Number(row.score || 0).toLocaleString('id-ID', { maximumFractionDigits: 1 })}</strong></div>`).join('');
  return `<div class="public-page">
    <header class="landing-nav"><a class="landing-brand" href="/" aria-label="Nalarin, beranda"><img src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778"><span>Teman belajar TKA</span></a><nav aria-label="Navigasi halaman"><a href="#cara-kerja">Cara kerja</a><a href="#materi">Materi</a><a href="#ranking">Ranking</a></nav><div class="landing-nav-actions"><button class="button button-role-teacher compact" data-action="public-auth" data-mode="teacher-login">Masuk guru</button><button class="button button-install compact" data-action="install-app">Pasang app</button><button class="button button-role-student compact" data-action="public-auth" data-mode="login">Masuk murid</button></div>${state.installMessage?`<span class="landing-install-message" role="status">${escapeHtml(state.installMessage)}</span>`:''}</header>
    <main>
      <section class="landing-hero"><div class="landing-hero-copy"><span class="landing-kicker">BELAJAR TKA DENGAN CARA YANG MASUK AKAL</span><h1>Latihan yang bikin <span>paham</span>, bukan cuma hafal.</h1><p>Nalarin membantu anak kelas 6 SD dan kelas 9 SMP mempersiapkan TKA lewat soal yang terarah, materi singkat, dan pembahasan langkah demi langkah.</p><div class="landing-hero-actions"><button class="button button-primary landing-cta" data-action="public-auth" data-mode="register">Buat akun gratis ${icon('arrow', 17)}</button><a class="button button-secondary landing-cta" href="#cara-kerja">Lihat cara kerja</a></div><div class="landing-trust"><span>${icon('check', 16)} Latihan harian bebas diulang</span><span>${icon('check', 16)} Sesi resmi maksimal 3x/minggu</span></div></div><div class="landing-hero-art" aria-hidden="true"><div class="hero-orbit hero-orbit-a"></div><div class="hero-orbit hero-orbit-b"></div><div class="hero-mascot">${naraAvatar(214, 'hero-nara', 'Kak Nara')}</div><div class="hero-float-card hero-float-card-one"><b>87</b><small>nilai latihan</small></div><div class="hero-float-card hero-float-card-two"><span class="hero-check">✓</span><small>paham konsep</small></div></div></section>
      <section class="landing-section" id="cara-kerja"><div class="landing-section-heading"><span class="landing-kicker">TIGA LANGKAH SEDERHANA</span><h2>Mulai dari soal, lanjut sampai ngerti.</h2><p>Semua dibuat ringan supaya anak bisa belajar mandiri, sementara orang tua dan guru tetap bisa melihat progresnya.</p></div><div class="landing-feature-grid"><article class="landing-feature"><span class="feature-number">01</span><div class="feature-icon blue">${icon('pencil', 22)}</div><h3>Latihan harian</h3><p>10 soal per sesi, berganti dari bank soal yang luas. Bisa dicoba setiap hari tanpa mengurangi jatah sesi resmi.</p></article><article class="landing-feature"><span class="feature-number">02</span><div class="feature-icon coral">${icon('trophy', 22)}</div><h3>Simulasi resmi</h3><p>30 soal dengan waktu dan aturan yang konsisten. Nilai terbaik dari maksimal tiga sesi per minggu masuk leaderboard.</p></article><article class="landing-feature"><span class="feature-number">03</span><div class="feature-icon mint">${icon('book', 22)}</div><h3>Pembahasan yang mengajar</h3><p>Setelah selesai, anak melihat konsep, langkah, alasan tiap pilihan, dan materi terkait. Kak Nara membantu bila perlu.</p></article></div></section>
      <section class="landing-section landing-material-section" id="materi"><div class="landing-section-heading"><span class="landing-kicker">MATERI TERARAH</span><h2>Yang dipelajari jelas sejak awal.</h2><p>Bank soal dikelompokkan berdasarkan kelas, mapel, dan kompetensi supaya anak tahu harus memperkuat bagian mana.</p></div><div class="landing-material-grid"><article class="material-showcase math"><div class="material-showcase-top"><span class="material-badge">Kelas 6 &amp; 9</span><span class="material-symbol">∑</span></div><h3>Matematika</h3><p>Bilangan, aljabar, geometri, pengukuran, data, dan peluang melalui soal konteks sehari-hari.</p><div class="material-tags"><span>Bilangan</span><span>Geometri</span><span>Data</span></div></article><article class="material-showcase language"><div class="material-showcase-top"><span class="material-badge">Kelas 6 &amp; 9</span><span class="material-symbol">Aa</span></div><h3>Bahasa Indonesia</h3><p>Bacaan informatif dan sastra, ide pokok, simpulan, makna kata, bukti teks, dan evaluasi informasi.</p><div class="material-tags"><span>Bacaan</span><span>Simpulan</span><span>Bukti teks</span></div></article><aside class="material-note"><div class="feature-icon yellow">${icon('spark', 22)}</div><h3>Butuh penguatan?</h3><p>Setiap pembahasan terhubung ke modul singkat. Anak bisa membaca contoh, mencoba lagi, lalu melihat progresnya.</p><button class="text-button" data-action="public-auth" data-mode="register">Lihat ruang belajar ${icon('arrow', 15)}</button></aside></div></section>
      <section class="landing-section how-section"><div class="how-copy"><span class="landing-kicker">DIBUAT DENGAN HATI-HATI</span><h2>Soalnya dari mana?</h2><p>Nalarin menyusun soal latihan orisinal dengan acuan kompetensi dan bentuk tugas TKA. Setiap butir diberi level, topik, jawaban, serta pembahasan agar latihan punya tujuan.</p><div class="how-points"><div><span>${icon('check', 17)}</span><p><b>Bahasa soal dibuat ramah anak</b><small>Instruksi singkat, pilihan jawaban jelas, dan konteks dekat dengan keseharian.</small></p></div><div><span>${icon('check', 17)}</span><p><b>Gambar dan bacaan ikut dipakai</b><small>Soal dapat memuat diagram, tabel, atau teks stimulus seperti latihan TKA.</small></p></div><div><span>${icon('check', 17)}</span><p><b>AI menjadi teman menjelaskan</b><small>Kak Nara, asisten AI, membantu menjelaskan dengan bahasa yang lebih sederhana.</small></p></div></div></div><div class="how-card"><div class="how-card-head"><span class="live-dot"></span><span>alur satu sesi</span></div><div class="how-step"><b>1</b><span><strong>Pilih mapel</strong><small>Matematika atau Bahasa Indonesia</small></span></div><div class="how-line"></div><div class="how-step"><b>2</b><span><strong>Kerjakan soal</strong><small>Latihan harian atau simulasi resmi</small></span></div><div class="how-line"></div><div class="how-step"><b>3</b><span><strong>Pahami hasil</strong><small>Nilai, pembahasan, dan materi berikutnya</small></span></div></div></section>
      <section class="landing-section ranking-section" id="ranking"><div class="landing-section-heading split-heading"><div><span class="landing-kicker">RANKING UMUM MINGGU INI</span><h2>Belajar bareng, saling menyemangati.</h2><p>Leaderboard publik menampilkan nama panggilan saja. Nilai yang masuk berasal dari sesi resmi dan pilihan tampil di ranking.</p></div><button class="button button-secondary" data-action="public-auth" data-mode="register">Ikut ranking ${icon('arrow', 16)}</button></div><div class="public-ranking-card">${rankingRows || `<div class="public-ranking-empty"><div class="feature-icon blue">${icon('trophy', 22)}</div><h3>Podium masih menunggu</h3><p>Daftar dan selesaikan sesi resmi untuk menjadi yang pertama minggu ini.</p></div>`}</div><p class="public-ranking-footnote">${state.publicRanking?.participants ? `${state.publicRanking.participants} peserta` : 'Belum ada peserta'} · diperbarui otomatis setiap sesi resmi</p></section>
      <section class="landing-teacher"><div><span class="landing-kicker">UNTUK GURU</span><h2>Pantau kelas tanpa spreadsheet tambahan.</h2><p>Guru bisa masuk dengan akun sendiri untuk melihat jumlah murid, sesi selesai, rata-rata, nilai terbaik, dan aktivitas terakhir berdasarkan sekolah. Murid tidak perlu menerima undangan; cukup pilih nama sekolah yang sama saat daftar.</p></div><button class="button button-dark" data-action="public-auth" data-mode="teacher-register">Daftar sebagai guru ${icon('arrow', 17)}</button></section>
    </main><footer class="landing-footer"><div class="landing-footer-brand"><img src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778"><span>Teman belajar TKA untuk kelas 6 dan 9.</span></div><div><button class="text-button" data-action="public-auth" data-mode="login">Sudah punya akun? Masuk</button></div></footer>
  </div>`;
}

function authPage() {
  const teacher = state.authMode.startsWith('teacher');
  const register = state.authMode === 'register' || state.authMode === 'teacher-register';
  const loginMode = teacher ? 'teacher-login' : 'login';
  const registerMode = teacher ? 'teacher-register' : 'register';
  const title = teacher ? (register ? 'Buat akun guru' : 'Masuk sebagai guru') : (register ? 'Buat akun belajar' : 'Selamat datang lagi');
  const helper = teacher ? (register ? 'Isi nama, sekolah, username, dan PIN 6 angka.' : 'Pantau evaluasi murid dari sekolahmu.') : (register ? 'Cukup nama panggilan, username, dan kode 6 angka.' : 'Masukkan username dan kode masukmu.');
  return `<div class="auth-page"><div class="auth-brand"><button class="landing-back" data-action="back-landing" aria-label="Kembali ke beranda">${icon('arrow', 16)} Beranda</button><img class="nalarin-logo" src="/brand/nalarin-logo-v1.png" alt="Nalarin" width="2020" height="778" fetchpriority="high"></div><div class="auth-grid"><div class="auth-intro"><span class="auth-kicker">${teacher ? 'RUANG GURU NALARIN' : 'TEMAN BELAJAR TKA'}</span><h1>${teacher ? 'Lihat kelas,<br><span>bantu tumbuh.</span>' : 'Latihan kecil,<br><span>paham besar.</span>'}</h1><p>${teacher ? 'Ringkasan evaluasi murid yang praktis untuk melihat siapa yang aktif, materi apa yang perlu diperkuat, dan progres kelas dari waktu ke waktu.' : 'Soal Matematika dan Bahasa Indonesia untuk kelas 6 dan 9. Daftar cepat, langsung mulai.'}</p><div class="auth-perks"><span>✦ ${teacher ? 'Evaluasi berdasarkan sekolah' : 'Pembahasan setelah sesi'}</span><span>✦ ${teacher ? 'Ringkasan rata-rata kelas' : 'Latihan harian bebas diulang'}</span><span>✦ ${teacher ? 'Tanpa mengubah nilai murid' : 'Liga mingguan untuk sesi resmi'}</span></div></div><form class="auth-card ${teacher ? 'teacher-auth-card' : 'student-auth-card'}" id="auth-form"><div class="auth-switch"><button type="button" class="${!register ? 'selected' : ''}" data-action="auth-mode" data-mode="${loginMode}">${teacher ? 'Masuk guru' : 'Masuk'}</button><button type="button" class="${register ? 'selected' : ''}" data-action="auth-mode" data-mode="${registerMode}">${teacher ? 'Daftar guru' : 'Daftar'}</button></div><h2>${title}</h2><p class="auth-helper">${helper}</p>${state.authError ? `<div class="auth-error" role="alert">${escapeHtml(state.authError)}</div>` : ''}${register ? `<label>Nama ${teacher ? 'guru' : 'panggilan'}<input name="nickname" autocomplete="nickname" maxlength="60" required placeholder="contoh: ${teacher ? 'Bu Rani' : 'Naya'}"></label>` : ''}<label>Username<input name="username" autocomplete="username" minlength="4" maxlength="24" required placeholder="contoh: ${teacher ? 'rani.guru' : 'naya06'}" autocapitalize="none" spellcheck="false"></label><label>PIN masuk 6 angka<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="${register ? 'new-password' : 'current-password'}" required placeholder="••••••"></label>${register && teacher ? `<label>Nama sekolah<input name="school" maxlength="120" required placeholder="contoh: SMP Negeri 1 Magelang" autocomplete="organization"></label><p class="field-hint">Tidak perlu kode undangan. Murid akan terhubung otomatis dari nama sekolah yang sama.</p><label>Kota <span class="field-optional">opsional</span><input name="city" maxlength="80" placeholder="contoh: Banjarnegara"></label>` : ''}${register && !teacher ? `<label>Kelas<select name="grade" required><option value="6">Kelas 6 SD</option><option value="9">Kelas 9 SMP</option></select></label><div class="auth-optional"><label>Sekolah <span>opsional</span><input name="school" maxlength="120" placeholder="contoh: SMP Negeri 1 Magelang" autocomplete="organization"></label><label>Kota <span>opsional</span><input name="city" maxlength="80" placeholder="contoh: Banjarnegara"></label></div>` : ''}<button class="button ${teacher ? 'button-teacher' : 'button-primary'} full auth-submit" type="submit">${register ? (teacher ? 'Buat akun guru' : 'Buat akun & mulai') : (teacher ? 'Masuk ke evaluasi' : 'Masuk ke ruang belajar')} ${icon('arrow', 17)}</button>${!teacher ? `<button type="button" class="text-button" data-action="recover">Lupa PIN masuk?</button>` : ''}<button type="button" class="text-button auth-role-link" data-action="auth-mode" data-mode="${teacher ? 'login' : 'teacher-login'}">${teacher ? 'Saya murid / orang tua' : 'Saya guru'}</button><p class="auth-note">${teacher ? 'Nama sekolah dirapikan otomatis agar progres murid mudah ditemukan. Murid cukup menulis nama sekolah yang sama; tidak perlu menerima undangan.' : 'Jangan pakai nama lengkap atau data sensitif. Simpan username dan PIN bersama orang tua.'}</p></form></div></div>`;
}


export { icon, escapeHtml, subjectPill, shell, pageTitle, authLoadingPage, authPage, landingPage };
