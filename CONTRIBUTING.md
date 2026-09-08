# Berkontribusi ke Nalarin

Terima kasih sudah membantu membuat latihan belajar yang lebih jelas untuk murid. Nalarin dimulai dari kelas 6 SD dan kelas 9 SMP, lalu dirancang supaya cakupannya bisa diperluas ke kelas lain dan SMA melalui bank soal serta modul yang terversi.

## Sebelum mulai

1. Baca [README.md](README.md), [PRD.md](PRD.md), dan [CONTENT-PLAN.md](CONTENT-PLAN.md).
2. Buat branch dari `main` dengan nama yang menjelaskan perubahan, misalnya `content/smp-geometri` atau `fix/mobile-review`.
3. Jangan commit `.env`, database SQLite, token, data murid, arsip deployment, atau catatan server pribadi.

## Menjalankan aplikasi

```powershell
cd tka-app
npm install
npm test
npm run build
```

Untuk menjalankan API dan UI secara lokal, buka dua terminal:

```powershell
cd tka-app
npm run api
```

```powershell
cd tka-app
npm run dev
```

## Menambah soal atau materi

- Gunakan `bank/` untuk bahan authoring dan `tka-app/server/content/` untuk content yang dibaca aplikasi.
- Setiap soal harus punya kelas, mapel, kompetensi, tipe respons, kunci, pembahasan langkah, alasan pilihan, dan versi.
- Soal matematika yang memakai angka bervariasi tetap perlu `family_id` yang jelas.
- Bacaan bersama soal perlu `stimulus_id` dan teks yang utuh.
- Gambar harus berupa aset lokal, punya `alt` atau caption yang membantu, dan tetap terbaca di layar HP.
- Jangan menyalin soal resmi atau mengklaim soal latihan sebagai soal pemerintah. Gunakan acuan kompetensi yang tercantum di [SOURCES.md](SOURCES.md).

Jalankan validasi bank sebelum membuat pull request:

```powershell
python scripts/validate_bank.py
python scripts/validate-ranking-seed.py
```

## Pull request

Jelaskan masalah yang diselesaikan, jalur kelas/mapel yang terdampak, dan perintah validasi yang sudah dijalankan. Untuk perubahan UI, sertakan ukuran layar yang diperiksa. Untuk perubahan soal, sertakan alasan kunci dan pembahasan dapat diverifikasi dari informasi di soal.

Perubahan yang menyentuh aturan skor, leaderboard, privasi, login, atau data anak perlu dibahas lebih dulu di issue supaya dampaknya bisa ditinjau bersama.
