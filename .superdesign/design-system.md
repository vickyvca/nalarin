# TKA MDC — Liga Belajar

## Scope and source

UI/UX design ONLY. No backend, real authentication, deployment, server mutations, or real personal data. A responsive interactive design prototype for Indonesian grade 6 and grade 9 students and their parents. The user wants fun and strong leaderboard motivation without a heavy learning app. Primary style source: Superdesign library `playful` (Playful Geometric), adapted below to a focused study product. Do not mix other style sources.

## Visual direction

Bright, tactile learning club with a sports-league sense of achievement. Suitable for ages around 11–15, not preschool. Organized card grid, confident rounded headings, subtle paper textures, small geometric sticker illustrations. Warm off-white canvas and cobalt action buttons. Generous quiet whitespace inside questions. Competition pages are expressive; exam pages are calm. No corporate analytics template, no neon gaming UI, no generic purple-gradient dashboard, no wall of emoji. No stock people photos. Existing brand assets: NONE. Working wordmark: TKA MDC in bold Outfit; small original geometric star mark permitted.

## Tokens

- Canvas #F8F9FD; paper #FFFFFF; warm paper #FFFDF5.
- Ink #202B45; secondary ink #56627A; border #E5E9F3.
- Primary cobalt #4161F5; dark cobalt #2948D3; pale blue #EDF1FF.
- League yellow #FFD75A; pale yellow #FFF7D7; ochre text #7A5200.
- Coral #FF927A; pale coral #FFF0EA; coral ink #8D3524.
- Mint #B7EBD6; pale mint #ECFAF3; dark green #207356.
- Purple only as small accent #A697E7; pale lilac #F3EFFF; never primary backgrounds/gradients.
- Body Plus Jakarta Sans 400/500/600; headings Outfit 600/700/800. Fallback system-ui.
- Body 15–16px, secondary 13px; quiz body 18px desktop / 16px mobile, line height 1.75. Heading 32–40 desktop / 26–30 mobile.
- Radii: controls 12–16px, cards 22–28px, badges pill. Buttons ≥48px high, ≥44px touch targets.
- Spacing increments 4/8/12/16/20/24/32/40. Max content 1200px. Desktop shell sidebar 220px and header; mobile bottom nav.
- Border 1.5px subtle by default. Selective tactile shadow 0 4px 0 #D7DFF9 on primary/featured controls; small soft shadow on floating cards. Do not put heavy black borders or rotated hover on every surface.

## Illustration and avatars

One friendly yellow shooting-star / small space explorer mascot as a simple original SVG or CSS illustration on hero/welcome only, with geometric orbit and blue flag. No existing copyrighted mascot. Keep mascot out of reading/answer area.

Avatars: simple graphic animal/space badges with varied background colors; avoid a leaderboard of only initials. Accessible name text alongside avatars. Podium numbers must be readable. Flat vector trophy/crown/medal accents with a small offset shadow, no huge emoji trophies.

## IA and user flows

Four main tabs: Beranda, Latihan, Liga Mingguan, Progresku. Materi accessible contextually from Latihan / review, not a separate mandatory curriculum. Mobile bottom tabs show icon AND text. A persistent small `Pratinjau · data contoh` badge distinguishes simulated data outside the product flow.

Prototype screens to connect: entry/login → profile → home → practice selection → quiz → result/explanation → optional module → progress; league page → rules/start confirmation → quiz. No actual login/network auth. Google button simulates onboarding and is visibly prototype-only. Existing demo learner: Alya, kelas 6, SD Nusantara, Kabupaten Banjarnegara; all fictional. Grade switch to 9 changes subjects' examples and leaderboard cohort. No real school claims.

## Product rules

- Daily: 10 questions of one subject, unlimited repeats, no strict timer, no league score.
- Optional remediation: 5 questions after a 3–5-minute module.
- Ranked: one subject, 30 questions, 75 minutes, maximum THREE attempts per learner per week TOTAL across both subjects. Label `2 dari 3 kesempatan tersisa` in demo.
- Weekly league splits grade and subject; best score, not XP, enters ranking. Same scores share rank. Do not invent scores from answering faster. No XP-to-ranking confusion, no streak guilt, no loss warnings or manipulative engagement copy.
- Week reset Monday WIB; label next reset as relative illustrative time `Mulai lagi Senin` rather than invent a live countdown.
- Explanations after submission; no Mitsuko hints in active ranked session. During daily quiz use after-submit explanations too.
- Progress separates latihan and penilaian. Use sample data clearly. Badge/stars celebrate completing practice and learning, not payment.
- Prototype may run a SHORT 3-question sample with `Contoh alur · 3 soal` clearly stated. It must not pretend to be a complete 30-question exam. Show full-session rules on start panel.

## Leaderboard composition (hero feature)

Title `Liga Mingguan` and encouraging subtitle `Belajar bareng. Naik peringkat bareng.` Segmented Math / Bahasa tabs, grade selector and Semua sekolah / Sekolahku filter. Large bright yellow league spotlight card with trophy art, remaining attempts, start CTA; white podium with second/first/third placements 2–1–3, color-coded avatar medallions and score. Below is readable ranking list with position, avatar, nickname, score, small previous-week change ONLY clearly illustrative if present.

My-position card pinned visibly: `Posisimu #5`, `80,0`, `Selisih 3,3 poin ke peringkat 4`, calm reminder `Latihan dulu, lalu coba lagi.` Strong CTA `Ikut sesi penilaian` plus secondary `Latihan dulu`. Arithmetic and listed scores must agree. Example: Dimas 96.7, Naya 93.3, Bima 90.0, Rara 83.3, Alya 80.0, Fajar 76.7. 3.3 is the one-decimal displayed gap. Never claim no-tie if scores equal. A rules drawer explains best score and three total attempts.

## Other screens

Home: greeting `Hai, Alya! Siap naik level?`, 3-day practice streak (no guilt), one primary daily activity, Math and Bahasa cards, small league position card and next recommended module.

Practice: two subject cards; `Latihan campuran` 10, `Materi yang perlu diulang` 5; optional module. Show progress count as illustrative.

Quiz: compact progress `Soal 1 dari 3 · contoh alur`; back/next, mark ragu-ragu, clear multiple-answer instructions; PG single, MCMA checkboxes, category rows. Clear chosen/focus states. No answer key before submit. Confirm submission and show unanswered count. Exit/resume modal. Mobile stimulus collapsible/reopenable and readable.

Results: specific correct/incorrect/blank count, explicit `Nilai latihan, tidak masuk liga`; review each question with answer, steps, distractor reason. `Jelaskan lebih sederhana` opens a Mitsuko explanation panel labeled example, no actual request. `Coba materi ini` opens a short lesson and sample worked problem. Result animations brief only.

Progress: subject tabs, small 4-week line chart or bars, values and dates, mastery rows with number of evidence questions; data limited state; clear separate Latihan / Penilaian selection. No fake official TKA prediction.

## Motion and accessibility

160–220ms button/card feedback, 300ms panel entry. Podium can animate once on entry; subtle 600ms confetti only after completing a sample session, never continuous. Honor prefers-reduced-motion. No ticking countdown pressure in practice. Visible keyboard focus; text alternatives; feedback with icon + text, not color only. Dialogs close, navigation works, mobile 390px and desktop 1440px without horizontal overflow.

## Writing

Natural Indonesian, short and clear, not baby talk. Use `Latihan dulu`, `Coba lagi`, `Lihat pembahasan`, `Kamu makin paham!`. Avoid slang overload and English implementation jargon. Keep technical disclaimers in a small prototype badge/help sheet rather than throughout children's screens.
