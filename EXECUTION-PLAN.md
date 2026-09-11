# Rencana eksekusi Nalarin

Status ini menggantikan rencana tahap awal. Snapshot terakhir: **11 September 2026**, setelah batch prediksi official-pattern v1.

## Kondisi sekarang

Nalarin sudah menjadi aplikasi web yang bisa dipakai di [tka.mdc.web.id](https://tka.mdc.web.id/). Stack tetap sederhana: frontend Vite, API Express, SQLite, content JSON, dan satu adapter tutor AI di server.

Yang sudah berjalan:

- akun murid dan guru dibuat sendiri dengan username + PIN 6 angka;
- kelas 6 SD dan kelas 9 SMP, masing-masing Matematika dan Bahasa Indonesia;
- latihan harian 10 soal yang bebas diulang;
- simulasi 30 soal / 75 menit dengan batas tiga sesi per minggu;
- scoring server-side, autosave, lanjutkan sesi, pembahasan, laporan soal, dan progres;
- ranking mingguan dari sesi simulasi;
- dashboard guru berdasarkan nama sekolah yang dinormalisasi;
- 15 modul dengan alur Pahami → Contoh → Coba soal;
- Kak Nara berbasis adapter Mitsuko dengan fallback pembahasan dasar;
- onboarding, PWA install prompt, landing preview, dan UI mobile;
- bank 496 soal di repository (360 ranking, 96 harian yang berjalan, 40 pilot prediksi), validator lokal, CI, health check, backup, dan rollback.

## Gerbang yang sudah dilewati

- `npm test` lulus untuk auth, isolasi sekolah, scoring kosong/sebagian/sempurna, resume, modul, idempotensi, kuota, ranking, pergantian minggu, expiry, CSRF, dan 50 learner serentak.
- `npm run build` lulus untuk bundle frontend produksi.
- Validator bank lulus untuk 496 soal, 15 modul, hitungan Matematika, dan bukti bacaan. Empat puluh soal pilot tetap ditahan di `pilot_daily` sampai review selesai.
- Deploy live diverifikasi lewat health API, service systemd, backup timer, asset bundle, dan content server.

## Langkah berikutnya

1. Selesaikan review editorial dan review independen Mitsuko untuk batch prediksi official-pattern.
2. Tambahkan 104 soal yang sudah ditinjau menuju target 600: 26 soal tambahan untuk setiap jalur kelas/mapel.
3. Isi celah materi dan stimulus visual yang masih tercatat di [CONTENT-PLAN.md](CONTENT-PLAN.md).
4. Jalankan pilot murid nyata; kumpulkan waktu pengerjaan, jawaban, laporan soal, dan pertanyaan ke Nara.
5. Kalibrasi kesulitan berdasarkan respons yang dianonimkan. Jangan mengubah label hanya karena soal terlihat panjang.
6. Review penggunaan tutor Mitsuko secara berkala: akurasi, bahasa anak, timeout, kuota, dan biaya.
7. Tambahkan ringkasan topik dan filter yang membantu guru menentukan materi yang perlu diulang.
8. Tambahkan monitor operasional untuk health API, backup, error rate, kapasitas disk, dan umur release.

Daftar tugas dengan status lengkap ada di [TODO.md](TODO.md). Riwayat perubahan ada di [CHANGELOG.md](CHANGELOG.md).

## Perluasan setelah MVP stabil

- kelas 4, 5, 7, 8, dan SMA;
- mapel tambahan setelah alur konten dan evaluasinya siap;
- stimulus gambar dan genre bacaan yang lebih beragam;
- ekspor laporan guru dengan privasi antar sekolah;
- workflow kontribusi bank soal yang lebih mudah untuk komunitas.

## Batas operasional

- Nalarin tidak mengambil atau menyalin arsip ujian TKA.
- Nilai aplikasi adalah nilai latihan, bukan nilai resmi.
- Jawaban benar tidak dikirim ke browser sebelum sesi selesai.
- Tutor AI tidak diberi tools operasional; pembahasan tersimpan tetap menjadi acuan ketika AI gagal.
- Deployment hanya memakai folder, database, service, dan backup Nalarin; tidak menyentuh ERP atau private server lain.
