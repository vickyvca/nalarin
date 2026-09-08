# Blueprint bank ranking Nalarin

Bank ranking v1 sudah siap untuk empat jalur. Setiap jalur memiliki 90 soal
yang dibagi menjadi tiga paket editorial berisi 30 soal; satu sesi resmi
mengambil 30 soal dan hanya sesi resmi yang masuk leaderboard.

| Jalur | Total | Paket | Komposisi tiap paket |
| --- | ---: | ---: | --- |
| Kelas 6 · Matematika | 90 | 3 × 30 | 18 PG, 6 MCMA, 6 Benar/Salah |
| Kelas 6 · Bahasa Indonesia | 90 | 3 × 30 | 18 PG, 6 MCMA, 6 Benar/Salah |
| Kelas 9 · Matematika | 90 | 3 × 30 | 18 PG, 6 MCMA, 6 Benar/Salah |
| Kelas 9 · Bahasa Indonesia | 90 | 3 × 30 | 18 PG, 6 MCMA, 6 Benar/Salah |

Semua 360 butir ranking memiliki kunci, pembahasan, alasan tiap opsi,
`family_id`, dan review Luna melalui gateway Mitsuko. Soal matematika memakai
parameter angka yang bervariasi, tetapi setiap keluarga tetap dibedakan dari
stem, solusi, atau konteks; mengganti angka saja tidak dihitung sebagai
keluarga baru. Bacaan memakai 36 stimulus orisinal baru. Audit bahasa kedua
memeriksa ejaan, instruksi bentuk respons, bukti bacaan, format angka, dan
rentang panjang indikatif TKA: SD 150–200 kata dengan kalimat 3–7 kata, SMP
200–250 kata dengan kalimat 5–9 kata. Ini adalah bank prediksi berbasis
kerangka resmi, bukan naskah atau bocoran ujian.

Checklist yang sudah dilewati:

1. `python scripts/validate-ranking-seed.py` — struktur, kunci PG, bukti bacaan,
   keluarga, dan komposisi paket.
2. `python scripts/import-ranking-review.py` — merge fail-closed; 360/360 ID
   memiliki review Luna dan tidak ada yang ditolak.
3. `python scripts/validate_bank.py` — bank gabungan 440 soal, 36 bacaan baru,
   15 modul, dan referensi modul lulus.

Keterbatasan yang tetap dicatat: `difficulty_calibrated` masih `false`, jadi
label mudah/sedang/menantang adalah editorial sampai ada data respons murid.
Sesi resmi tetap dibatasi maksimal tiga kali per murid per minggu; latihan
harian berada di pool `pilot_daily` dan tidak memengaruhi leaderboard.
