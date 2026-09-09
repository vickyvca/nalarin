# Changelog Nalarin

Catatan ini mengikuti commit di branch `main`. Angka bank dan status di bawah adalah kondisi repository saat catatan dibuat, bukan klaim sebagai soal resmi atau bocoran TKA.

## 2026-09-09 — Kak Nara menjadi presenter landing page

Commit [`b836ad8`](https://github.com/vickyvca/nalarin/commit/b836ad8)

- Menampilkan artwork Kak Nara langsung di bagian paling atas landing page.
- Menambahkan balon bicara yang menjelaskan peran Nara sebagai teman belajar.
- Menampilkan label karakter dan memprioritaskan presenter di layar HP sebelum headline.
- Menjaga gambar tetap punya alt text dan layout tidak melebar di mobile.

## 2026-09-09 — copy sederhana dan preview landing

Commit [`5849836`](https://github.com/vickyvca/nalarin/commit/5849836)

- Menyederhanakan judul, tujuan, langkah contoh, kesalahan umum, dan ajakan belajar pada 15 modul.
- Menyamakan copy modul di `bank`, `content`, dan content yang dibaca API.
- Menambahkan preview tampilan latihan, materi + Kak Nara, pembahasan, progres, dan ranking di landing page.
- Menambahkan loading lazy untuk avatar Nara yang muncul di bawah hero.
- Memperjelas copy untuk anak kelas 6 SD dan kelas 9 SMP.

## 2026-09-09 — guided learning dan tanya Kak Nara

Commit [`ca3594a`](https://github.com/vickyvca/nalarin/commit/ca3594a)

- Mengubah materi menjadi alur tiga tahap: **Pahami → Contoh → Coba soal**.
- Tombol materi memulai lima soal yang masih satu topik.
- Pembahasan tetap menampilkan langkah, alasan pilihan, dan materi terkait.
- Menambahkan pertanyaan cepat dan pertanyaan bebas untuk Kak Nara di dalam modul.
- Menambahkan endpoint tutor modul berbasis adapter Mitsuko dengan batas pemakaian dan fallback aman.
- Menambahkan uji endpoint ketika tutor sedang tidak tersedia.

## 2026-09-09 — artwork Kak Nara

Commit [`4cd61f5`](https://github.com/vickyvca/nalarin/commit/4cd61f5)

- Mengganti avatar placeholder dengan artwork karakter Kak Nara.
- Memakai karakter yang sama di hero, onboarding, beranda, materi, dan pembahasan.

## 2026-09-09 — panduan pertama dan jalur masuk berdasarkan peran

Commit [`4398d0f`](https://github.com/vickyvca/nalarin/commit/4398d0f)

- Menambahkan panduan penggunaan untuk pengguna baru.
- Menambahkan tombol masuk murid, masuk guru, dan pasang aplikasi dengan tampilan berbeda.
- Menambahkan panduan publik sebelum pengguna membuat akun.

## 2026-09-09 — onboarding Nara dan normalisasi sekolah

Commit [`1b3b9c9`](https://github.com/vickyvca/nalarin/commit/1b3b9c9)

- Menambahkan persona visual dan komponen avatar Kak Nara.
- Menormalkan nama sekolah supaya guru dan murid dapat terhubung tanpa undangan manual.
- Memperbarui pengujian isolasi sekolah dan alur akun.

## 2026-09-08 — modul materi versi kedua

Commit [`d20c0af`](https://github.com/vickyvca/nalarin/commit/d20c0af)

- Memperluas tujuh kelompok materi dan memperbarui contoh serta pembahasannya.
- Menambahkan pemeriksaan dan catatan rollout modul.
- Menyiapkan content modul untuk kelas 6 dan kelas 9.

## 2026-09-08 — bank 456 soal aktif di live

Commit [`1edc6d7`](https://github.com/vickyvca/nalarin/commit/1edc6d7)

- Mencatat aktivasi live bank soal 456 butir.
- Menyimpan bukti release dan pemeriksaan kesehatan setelah deploy.

## 2026-09-08 — tambahan latihan harian SD

Commit [`a9834a2`](https://github.com/vickyvca/nalarin/commit/a9834a2)

- Menambahkan batch latihan harian SD.
- Menyiapkan release content harian v2 dan validator idempoten.
- Memperbarui hasil QA bank dan sinkronisasi content API.

## 2026-09-08 — tambahan latihan harian SMP

Commit [`0868622`](https://github.com/vickyvca/nalarin/commit/0868622)

- Menambahkan delapan soal Matematika harian SMP dengan keluarga soal baru.
- Menambahkan skrip penambahan idempoten dan validasi hitungan, satuan, serta struktur.

## 2026-09-08 — dokumentasi runtime dan kontribusi

Commits [`f30d6dc`](https://github.com/vickyvca/nalarin/commit/f30d6dc), [`5b879fd`](https://github.com/vickyvca/nalarin/commit/5b879fd), dan [`2d2ca09`](https://github.com/vickyvca/nalarin/commit/2d2ca09)

- Merapikan README, panduan kontribusi, dan penjelasan pemisahan bank authoring dari content runtime.
- Menegaskan bahwa kunci dan pembahasan tidak dikirim ke browser sebelum sesi selesai.
- Menyinkronkan baseline repository dengan remote.

## 2026-09-08 — rilis open-source awal

Commit [`49b062b`](https://github.com/vickyvca/nalarin/commit/49b062b)

- Merilis Nalarin sebagai aplikasi web Vite + Express + SQLite.
- Menambahkan PRD, rencana konten, keamanan, sumber acuan, panduan kontribusi, dan CI.
- Menambahkan bank soal orisinal, bacaan, modul, diagram, validator, dan blueprint ranking.
- Menambahkan login lokal, latihan, scoring server-side, pembahasan, progres, ranking, teacher overview, dan adapter tutor.
- Menyiapkan PWA, deployment files, health check, backup, dan rollback.

## 2026-09-08 — repository seed

Commit [`0f6571e`](https://github.com/vickyvca/nalarin/commit/0f6571e)

- Menambahkan lisensi repository.
