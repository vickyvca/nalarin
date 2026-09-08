# Paket konten harian SD dan SMP

Status: dipersiapkan untuk deploy, belum diaktifkan di server live.

- 456 soal: 228 SD dan 228 SMP; masing-masing 118 Matematika dan 110 Bahasa Indonesia.
- 96 soal harian dan 360 ranking. Tambahan 16 soal semuanya Matematika PG harian: 8 SD dan 8 SMP.
- Pembahasan memuat konsep, langkah, alasan setiap opsi, dan arahan belajar.
- Label review tambahan: author_checked; review independen masih menunggu. Bukan klaim soal resmi atau kesulitan terkalibrasi.
- Soal lama, kunci, versi, modul, bacaan, dan diagram tidak diubah oleh paket ini.

## Pemeriksaan dan persiapan

Jalankan dari root repo:

```sh
python scripts/add-smp-daily-v2.py
python scripts/add-sd-daily-v2.py
python scripts/validate_bank.py
python scripts/validate-ranking-seed.py
node tka-app/server/scripts/sync-content.mjs
python scripts/prepare-daily-content.py
```

Tes aplikasi: jalankan `npm test` di `tka-app`.

Arsip dan manifest SHA-256 dibuat di `work/daily-content-v2/` (diabaikan Git). Arsip hanya berisi tiga JSON konten. Pengecekan memastikan 440 soal rilis awal masih identik, 16 tambahan hanya harian, source sama dengan konten runtime, dan hasil pembacaan arsip cocok dengan hash.

## Urutan aktivasi di server

1. Bandingkan konten live terbaru dengan baseline paket agar perubahan konten lain tidak tertimpa. Jika berbeda, gabungkan terlebih dahulu dan validasi ulang.
2. Simpan backup direktori konten live. Gunakan prosedur content-release internal; jangan sertakan atau mengganti database, environment, frontend, atau aset diagram.
3. Pasang tiga JSON, restart API, periksa health: 456 soal, 15 modul, 360 ranking.
4. Uji sesi harian kelas 6 dan 9 sampai pembahasan; periksa sesi lama tetap memakai snapshot dan ranking tetap tiga paket per jalur.
5. Jika pemeriksaan gagal, kembalikan direktori konten dari backup lalu restart API. Jangan memulihkan database untuk rollback konten.

## Materi tambahan SD

Pecahan sambungan pita, bahan beberapa adonan, FPB paket hadiah, KPK jadwal bus, keliling dengan pintu, liter ke gelas, penjumlahan data harian, dan penutupan lantai dengan ubin. Rincian: [SD-DAILY-V2.md](SD-DAILY-V2.md). Batch SMP: [SMP-DAILY-V2.md](SMP-DAILY-V2.md).
