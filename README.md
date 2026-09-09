# Nalarin

Target awal: kelas 6 SD dan kelas 9 SMP; web demo tersedia di `tka.mdc.web.id`. Nalarin adalah proyek open-source yang bisa diperluas ke kelas lain, SMA, mapel tambahan, dan modul baru melalui kontribusi bank soal serta pengembangan aplikasi.

## Status produk

Nalarin saat ini live di [tka.mdc.web.id](https://tka.mdc.web.id/) dengan **456 soal**: 360 soal untuk simulasi ranking dan 96 soal latihan harian. Komposisinya 228 soal kelas 6 SD dan 228 soal kelas 9 SMP. Detail pemeriksaan bank ada di [DAILY-V2-RELEASE.md](bank/DAILY-V2-RELEASE.md) dan [QA-REPORT.json](bank/QA-REPORT.json).

Jalur utama memakai username + PIN 6 angka. Orang tua atau murid dapat membuat akun sendiri; admin tidak perlu membuatkan akun satu per satu. Nalarin tidak bergantung pada Google OAuth.

## Fitur yang sudah aktif

- **Belajar mandiri:** pendaftaran murid dan guru, kode pemulihan, profil kelas 6/9, dan panduan pertama bersama Kak Nara.
- **Latihan harian:** 10 soal per sesi, dapat diulang, dengan soal yang berganti dari bank latihan.
- **Simulasi mingguan:** 30 soal dalam 75 menit; maksimal tiga sesi per murid per minggu. Hanya sesi ini yang masuk ranking.
- **Bentuk soal:** pilihan ganda, pilihan ganda kompleks, kategori per pernyataan, bacaan, tabel, dan diagram lokal.
- **Pembahasan:** nilai, langkah pengerjaan, alasan setiap pilihan, materi terkait, laporan soal, dan ajakan mencoba lagi.
- **Materi singkat:** 15 modul dengan alur **Pahami → Contoh → Coba soal** dan lima soal yang masih satu topik.
- **Kak Nara:** pertanyaan bebas di materi dan pembahasan melalui adapter Mitsuko, dengan batas pemakaian dan fallback pembahasan dasar.
- **Progres murid:** riwayat sesi, nilai rata-rata, materi yang sudah dicoba, dan perkembangan per mapel.
- **Ruang guru:** ringkasan murid, sesi selesai, rata-rata, nilai terbaik, dan aktivitas terakhir berdasarkan nama sekolah yang dinormalisasi.
- **Ranking:** podium umum dan filter sekolah dengan nama panggilan; data hanya berasal dari simulasi mingguan.
- **Landing dan aplikasi:** landing page berisi presenter Kak Nara 3D low-poly dengan animasi idle ringan, fallback artwork 2D, preview latihan, materi, pembahasan, progres, ranking, tombol masuk berdasarkan peran, serta pasang aplikasi PWA.
- **Operasional:** scoring di server, autosave, lanjutkan sesi, SQLite, health check, backup, rollback release, CI, dan validator bank lokal.

## Batas produk saat ini

- Nalarin hanya mencakup kelas 6 SD dan kelas 9 SMP.
- Nilai Nalarin adalah nilai latihan, bukan nilai resmi TKA.
- Tingkat kesulitan belum dikalibrasi dari respons murid.
- Soal dibuat orisinal berdasarkan kompetensi dan bentuk tugas TKA; bukan salinan arsip atau bocoran ujian.

## Berkas

1. [PRD.md](PRD.md): perilaku aplikasi, aturan penilaian, akses, dan penerimaan.
2. [CONTENT-PLAN.md](CONTENT-PLAN.md): cakupan materi, rencana paket, dan perluasan bank.
3. [SOURCES.md](SOURCES.md): rujukan resmi dan batas verifikasi.
4. `bank/questions.json`: bank soal orisinal beserta kunci dan pembahasan.
5. `bank/passages.json`: bacaan orisinal yang dirujuk soal.
6. `bank/modules.json`: modul ringkas dengan contoh.
7. `bank/BANK-SOAL.md`: versi bank yang mudah dibaca manusia; memuat kunci, untuk persiapan/admin.
8. `bank/QA-REPORT.json`: hasil validasi konten otomatis.
9. `bank/RANKING-BLUEPRINT.md`: kuota dan checklist pembukaan bank ranking.
10. [EXECUTION-PLAN.md](EXECUTION-PLAN.md): urutan pengerjaan dan gerbang peluncuran.
11. [CHANGELOG.md](CHANGELOG.md): riwayat perubahan dari repository seed sampai versi live sekarang.
12. [TODO.md](TODO.md): pekerjaan berikutnya, target konten, dan batas produk.
13. `tka-app/`: aplikasi Vite dan API Express/SQLite.

Bank saat ini berisi 456 soal: 96 soal latihan harian dan 360 soal ranking yang sudah diaudit Luna (90 per jalur: kelas 6/9 × Matematika/Bahasa Indonesia). Masing-masing jalur punya tiga paket editorial berisi 30 soal untuk rotasi sesi resmi. Audit editorial menstandarkan ejaan, instruksi PGK, format rupiah/desimal, bukti bacaan, serta panjang stimulus agar mengikuti rentang indikatif panduan TKA. Angka matematika dibuat bervariasi dengan `family_id` berbeda; variasi angka tetap bukan pengganti kalibrasi empiris. Tingkat kesulitan masih editorial dan belum dikalibrasi dari respons murid. Soal tidak diklaim sebagai arsip ujian TKA atau bocoran.

Live UI: <https://tka.mdc.web.id/>. Health API: <https://tka.mdc.web.id/api/health>.

## Untuk kontributor

Repo ini sengaja memisahkan bahan authoring bank soal dari content yang dibaca API. Kunci dan pembahasan tidak dikirim ke browser sebelum sesi selesai. Detail cara menjalankan, menulis soal, menambah materi, dan mengirim pull request ada di [CONTRIBUTING.md](CONTRIBUTING.md).

Arsitektur awalnya sederhana: frontend Vite, API Express, SQLite untuk progres, content JSON berversi, dan adapter AI di server. Struktur content memakai `grade`, `subject`, `competency`, `module_id`, dan `version`, sehingga penambahan kelas 4, kelas 5, SMA, atau mapel baru dapat dilakukan tanpa mengganti alur sesi inti.

Roadmap aktif ada di [TODO.md](TODO.md). Prioritas terdekat adalah menambah 144 soal menuju target 600, mengisi celah materi dan stimulus visual, menjalankan pilot murid nyata, lalu mengkalibrasi tingkat kesulitan dari data respons yang dianonimkan.

Untuk aturan kontribusi dan pelaporan keamanan, baca [CONTRIBUTING.md](CONTRIBUTING.md) dan [SECURITY.md](SECURITY.md).

## Menghasilkan ulang dan memeriksa bank

Jalankan dari folder ini:

```powershell
python scripts/build_bank.py
python scripts/validate_bank.py
python scripts/validate-ranking-seed.py
```

Generator menggunakan pustaka standar Python dan tidak menghubungi AI atau server. Jangan menyajikan direktori `bank` secara langsung dari frontend/runtime: kunci dan pembahasan hanya dikirim setelah sesi selesai. Berkas ini tidak berisi kredensial.
