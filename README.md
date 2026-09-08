# Nalarin

Target awal: kelas 6 SD dan kelas 9 SMP; web demo tersedia di `tka.mdc.web.id`. Nalarin adalah proyek open-source yang bisa diperluas ke kelas lain, SMA, mapel tambahan, dan modul baru melalui kontribusi bank soal serta pengembangan aplikasi.

## Keputusan produk

- Pendaftaran mandiri, cepat; admin tidak membuatkan akun satu per satu. Jalur utama username + kode masuk 6 angka; tidak bergantung Google OAuth.
- Latihan harian dapat diulang bebas: simulasi singkat 10 soal per mapel, tanpa batas waktu ketat.
- Sesi penilaian aplikasi: 30 soal / 75 menit per mapel; maksimal 3 sesi per murid per minggu, total lintas mapel. Hanya sesi ini masuk leaderboard.
- Modul singkat opsional muncul sesuai kebutuhan; anak tidak diwajibkan menyelesaikan kursus panjang.
- Pembahasan tersedia setelah sesi, mencakup cara berpikir, alasan pilihan, dan latihan lanjutan.
- AI tutor memakai adapter server dengan persona Kak Nara dan konteks soal tanpa tools operasional. Pembahasan dasar tetap tersedia ketika AI gagal.

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
11. `tka-app/`: aplikasi Vite dan API Express/SQLite.

Bank saat ini berisi 440 soal: 80 soal latihan harian dan 360 soal ranking yang sudah diaudit Luna (90 per jalur: kelas 6/9 × Matematika/Bahasa Indonesia). Masing-masing jalur punya tiga paket editorial berisi 30 soal untuk rotasi sesi resmi. Audit editorial kedua menstandarkan ejaan, instruksi PGK, format rupiah/desimal, bukti bacaan, serta panjang stimulus agar mengikuti rentang indikatif panduan TKA. Angka matematika dibuat bervariasi dengan `family_id` berbeda; variasi angka tetap bukan pengganti kalibrasi empiris. Tingkat kesulitan masih editorial dan belum dikalibrasi dari respons murid. Soal tidak diklaim sebagai arsip ujian TKA atau bocoran.

Live UI: <https://tka.mdc.web.id/>. Health API: <https://tka.mdc.web.id/api/health>.

## Untuk kontributor

Repo ini sengaja memisahkan bahan authoring bank soal dari content yang dibaca API. Kunci dan pembahasan tidak dikirim ke browser sebelum sesi selesai. Detail cara menjalankan, menulis soal, menambah materi, dan mengirim pull request ada di [CONTRIBUTING.md](CONTRIBUTING.md).

Arsitektur awalnya sederhana: frontend Vite, API Express, SQLite untuk progres, content JSON berversi, dan adapter AI di server. Struktur content memakai `grade`, `subject`, `competency`, `module_id`, dan `version`, sehingga penambahan kelas 4, kelas 5, SMA, atau mapel baru dapat dilakukan tanpa mengganti alur sesi inti.

Roadmap terbuka:

- memperluas bank soal harian dan materi untuk kelas 4–12;
- menambah kompetensi dan stimulus visual yang teruji di HP;
- kalibrasi tingkat kesulitan dari respons murid yang dianonimkan;
- memperkaya evaluasi guru tanpa membuka data pribadi antar sekolah;
- meningkatkan aksesibilitas, dokumentasi, dan terjemahan.

Untuk aturan kontribusi dan pelaporan keamanan, baca [CONTRIBUTING.md](CONTRIBUTING.md) dan [SECURITY.md](SECURITY.md).

## Menghasilkan ulang dan memeriksa bank

Jalankan dari folder ini:

```powershell
python scripts/build_bank.py
python scripts/validate_bank.py
python scripts/validate-ranking-seed.py
```

Generator menggunakan pustaka standar Python dan tidak menghubungi AI atau server. Jangan menyajikan direktori `bank` secara langsung dari frontend/runtime: kunci dan pembahasan hanya dikirim setelah sesi selesai. Berkas ini tidak berisi kredensial.
