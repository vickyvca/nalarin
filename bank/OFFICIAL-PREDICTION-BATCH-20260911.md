# Batch prediksi official-pattern v1 — 11 September 2026

Batch ini adalah **40 soal orisinal baru** yang dibuat dari pola kompetensi,
stimulus, dan bentuk respons yang terlihat pada contoh resmi TKA. Batch ini
belum menjadi soal resmi dan tidak menjanjikan bocoran atau prediksi nomor
ujian.

## Status rilis

- 10 soal SD Matematika.
- 10 soal SD Bahasa Indonesia.
- 10 soal SMP Matematika.
- 10 soal SMP Bahasa Indonesia.
- 4 stimulus baru: dua stimulus matematika dan dua bacaan Bahasa Indonesia.
- Semua butir berada di pool `pilot_daily`, dengan `ranked_eligible: false`.
- Status review semua butir: `prediction_editorial_pending`; review manusia dan
  review independen Mitsuko belum diselesaikan.
- Bank canonical setelah batch: **496 soal** (360 ranking, 96 latihan harian
  sebelumnya, dan 40 butir pilot baru).

Ranking tidak berubah oleh batch ini. Butir baru hanya boleh dipindahkan ke
`ranked_v1` setelah kunci, bahasa, pembahasan, bukti bacaan, dan kecocokan
indikator ditinjau ulang.

## Dasar resmi

Rujukan yang dipakai untuk menulis spesifikasi, bukan untuk menyalin isi:

- [Contoh TKA Matematika SD](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/sd)
- [Contoh TKA Bahasa Indonesia SD](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/sd/bahasa-indonesia)
- [Contoh TKA Matematika SMP](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/smp)
- [Contoh TKA Bahasa Indonesia SMP](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/smp/Bahasa-Indonesia)
- [Kerangka Asesmen TKA SD dan SMP](https://pusmendik.kemendikdasmen.go.id/tka/page/download_file/700298_47)
- [FAQ resmi TKA](https://pusatinformasi.ult.kemendikdasmen.go.id/hc/id/articles/52001769236249-FAQ-Tes-Kemampuan-Akademik-TKA)

Keempat laman contoh masing-masing menampilkan 30 contoh. Profil yang
teramati adalah SD Matematika 18 PG/3 MCMA/9 kategori, SD Bahasa Indonesia
16/6/8, SMP Matematika 16/7/7, dan SMP Bahasa Indonesia 13/10/7. Angka itu
adalah pembanding editorial, bukan kuota resmi yang dipaksakan ke bank.

## Yang dibuat

| Jalur | Fokus prediksi | Stimulus | Bentuk soal |
|---|---|---:|---|
| SD Matematika | tabel, piktogram, pecahan/desimal, persentase, pengukuran, kecukupan, kewajaran hasil | 1 denah kebun | 4 PG, 4 MCMA, 2 kategori |
| SD Bahasa Indonesia | tujuan, urutan, makna kata, masalah, simpulan, nilai cerita | 1 bacaan fiksi 158 kata | 6 PG, 2 MCMA, 2 kategori |
| SMP Matematika | fungsi dari tabel, refleksi, persamaan/pertidaksamaan, statistik, Pythagoras, peluang, barisan | 1 peta koordinat | 4 PG, 4 MCMA, 2 kategori |
| SMP Bahasa Indonesia | perbandingan bukti, topik, rujukan, klaim, rekomendasi, batas simpulan | 2 teks informasi (214 kata isi; 218 termasuk label teks) | 4 PG, 4 MCMA, 2 kategori |

Konteks dipilih dekat dengan murid: kebun sekolah, kompos, pameran, dan taman
resapan. Bahasa dibuat singkat dan jawaban dapat ditelusuri dari hitungan atau
bukti bacaan. Beberapa soal matematika memakai stimulus teks sebagai pengantar
koordinat atau denah; batch berikutnya perlu menambah aset tabel/grafik/diagram
yang benar-benar dirender sebagai visual di layar.

Setiap butir baru memuat `subcompetency`, `indicator`, `stimulus_kind`,
`source_basis: official-framework-pattern`, dan `provenance: original`.
Nama, angka, bacaan, opsi, dan pembahasan ditulis baru; tidak ada salinan dari
contoh resmi.

## Gerbang kualitas

Pemeriksaan otomatis pada 11 September 2026:

- `python scripts/validate_bank.py` — **PASS**.
- 496 soal dan 4 stimulus baru terbaca.
- Kunci matematika terhitung ulang oleh validator; bukti bacaan dicocokkan
  dengan teks sumber.
- Verifikasi matematika memakai data yang sama dengan stem: tabel fungsi,
  pembagian, pembulatan gulungan, statistik, peluang, dan perbandingan data.
- Warning panjang kalimat pada empat stimulus masih terbuka untuk review
  editorial. Warning ini tidak disembunyikan sebagai lulus pedagogis.

AI boleh membantu membuat variasi dan pembahasan, tetapi kunci tidak dianggap
terjamin hanya karena dibuat AI. Review Mitsuko independen dan pemeriksaan
editorial harus selesai sebelum batch dapat dipakai untuk ranking.

## Cara mengulang

Dari root repository:

```powershell
python scripts/add-official-prediction-batch.py
python scripts/validate_bank.py
node tka-app/server/scripts/sync-content.mjs
```

Generator idempoten. Jika batch sudah ada, skrip berhenti tanpa menambah
duplikasi. `bank/questions.json` dan `bank/passages.json` adalah sumber
authoring; salinan runtime berada di `tka-app/server/content/`.
