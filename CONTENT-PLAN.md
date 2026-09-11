# Peta konten dan rencana bank

## Status content — 11 September 2026

Bank saat ini berisi **496 soal**: 360 soal ranking, 96 soal latihan harian sebelumnya, dan 40 soal pilot prediksi official-pattern v1. Per jalur tersedia 128 Matematika kelas 6, 128 Matematika kelas 9, 120 Bahasa Indonesia kelas 6, dan 120 Bahasa Indonesia kelas 9. Semua jalur ranking tetap memiliki 90 soal yang sudah direview untuk tiga paket simulasi 30 soal. Empat puluh soal baru hanya berada di pool harian dan tetap `ranked_eligible=false`.

Tambahan harian SMP dan SD tetap dicatat di [SMP-DAILY-V2.md](bank/SMP-DAILY-V2.md), [SD-DAILY-V2.md](bank/SD-DAILY-V2.md), dan [DAILY-V2-RELEASE.md](bank/DAILY-V2-RELEASE.md). Soal tidak diklaim sebagai salinan arsip ujian atau bocoran. Kekurangan visual, genre, dan kalibrasi tingkat kesulitan masih menjadi pekerjaan berikutnya.

Batch baru yang benar-benar memakai pola contoh resmi dicatat di [bank/OFFICIAL-PREDICTION-BATCH-20260911.md](bank/OFFICIAL-PREDICTION-BATCH-20260911.md). Batch ini menambah stimulus denah, peta koordinat, bacaan fiksi, dan dua teks informasi; seluruh butir masih menunggu review editorial dan review independen Mitsuko.

Pemeliharaan: `python scripts/add-smp-daily-v2.py` menambahkan batch secara idempoten tanpa menimpa soal yang ada. Setelah generator/rebuild lain, jalankan kembali penambah ini sebelum validasi dan sync-content. Jika item dengan ID sama berbeda, skrip berhenti agar perubahan harus melalui versi baru secara eksplisit.

## 1. Ringkasan acuan

Mapel kelas 6/9 adalah Matematika dan Bahasa Indonesia. Tiga bentuk respons: satu pilihan, beberapa pilihan benar, dan kategori per pernyataan. Latihan menekankan memahami, menerapkan, dan bernalar. Bacaan informasi/fiksi dipakai pada kedua jenjang dengan kompleksitas meningkat. Rujukan: S1–S14 pada [SOURCES.md](SOURCES.md).

Contoh resmi yang tampil di laman Pusmendik dipakai sebagai kalibrasi bentuk dan gaya, bukan untuk menyalin isi atau mengklaim kuota ujian. Profil 30 butir yang teramati adalah SD Matematika 18/3/9, SD Bahasa Indonesia 16/6/8, SMP Matematika 16/7/7, dan SMP Bahasa Indonesia 13/10/7 (PG/PGK-MCMA/PGK-Kategori). Rincian, pola stimulus, dan aturan provenance ada di [bank/OFFICIAL-TKA-CALIBRATION.md](bank/OFFICIAL-TKA-CALIBRATION.md). Validator hanya melaporkan jarak bank terhadap profil tersebut; paket ranking tetap mengikuti konfigurasi editorial sampai batch baru selesai ditinjau.

Panjang stimulus ranking orisinal saat ini: SD 151–153 kata dengan kalimat 3–7 kata, SMP 203–205 kata dengan kalimat 5–9 kata. Empat stimulus batch prediksi baru berada pada rentang 150–200 kata untuk SD dan 200–250 kata untuk SMP; warning kalimatnya masih menunggu penyuntingan. Rentang ini mengikuti batas indikatif kerangka membaca TKA. Stimulus awal harian tetap dipertahankan sebagai pool `pilot_daily`. Konteks sekolah, perpustakaan desa, kebun, dan kantin familier untuk anak; semua informasi yang dibutuhkan tersedia dalam soal. Anak tidak perlu pengetahuan tempat tertentu di Jawa Tengah untuk menjawab.

## 2. Paket ranking dan seed awal

Bank ranking v1 sudah ditambahkan: 360 soal baru, 90 per jalur (kelas 6/9 ×
Matematika/Bahasa Indonesia), tiga paket × 30 soal per jalur. Seluruh butir
ranking lulus review Luna; `difficulty_calibrated` tetap `false` sampai ada
data respons murid.

| Jenjang/mapel | Soal awal | Kelompok bahan | Modul |
|---|---:|---|---:|
| SD Matematika | 20 | 10 keluarga soal, masing-masing 2 varian | 5 |
| SMP Matematika | 20 | 10 keluarga soal, masing-masing 2 varian | 4 |
| SD Bahasa Indonesia | 20 | 4 bacaan orisinal × 5 butir | 3 |
| SMP Bahasa Indonesia | 20 | 4 bacaan orisinal × 5 butir | 3 |
| Total | 80 | 20 keluarga matematika + 8 kelompok bacaan | 15 |

Jenis respons: 50 PG, 16 PGK MCMA, 14 PGK kategori. Semua mempunyai konsep, langkah, alasan opsi/pernyataan, modul, dan versi. Keempat bacaan SD terdiri dari dua cerita dan dua informasi; SMP dua cerita, satu informasi tunggal, satu informasi jamak.

Seed awal 80 soal tetap berada di pool `pilot_daily`, `ranked_eligible=false`. Pool
ranking berisi 360 soal `ranked_v1`, `ranked_eligible=true` setelah pemeriksaan
matematika otomatis, validasi struktur, dan review Luna per batch. Belum ada
kalibrasi menggunakan data murid. Review AI tidak boleh diberi label terjamin
100% benar.

## 3. Peta materi awal dan bagian yang belum tertutup

Berikut kelompok editorial aplikasi, bukan salinan lengkap matriks resmi. Setiap materi lanjut harus dipetakan ke butir kerangka saat penulisan.

| Jalur | Sudah ada contoh | Perlu ditambahkan untuk cakupan persiapan lebih utuh |
|---|---|---|
| SD bilangan | Pecahan senilai, tambah/kali pecahan, FPB, KPK | Urutan/desimal/persen, pembagian dan operasi campuran, representasi visual |
| SD geometri/pengukuran | Luas/keliling persegi panjang, balok, waktu | Bentuk dan visualisasi bangun, sudut, bangun gabungan, variasi satuan dan penaksiran |
| SD data | Perbandingan dan total data berlabel | Piktogram, diagram batang, tabel visual yang lebih bervariasi |
| SMP bilangan | Diskon, perbandingan berbalik nilai | Bilangan real, pangkat/akar, estimasi, skala dan rasio, faktor prima |
| SMP aljabar | Persamaan, SPLDV, pertidaksamaan, barisan | Operasi bentuk aljabar, relasi/fungsi, deret, representasi grafik |
| SMP geometri | Pythagoras, translasi, refleksi | Hubungan sudut, kesebangunan/kekongruenan, jaring-jaring, rotasi/dilatasi, luas/volume |
| SMP data/peluang | Rata-rata dan peluang sederhana | Median/modus/rentang, frekuensi relatif, interpretasi grafik |
| SD membaca | Informasi tersurat, makna konteks, simpulan, perasaan, penilaian | Ikhtisar/bagan, puisi, ragam kosakata serta stimulus visual |
| SMP membaca | Informasi/klarifikasi, kilas balik, simpulan sebab, evaluasi bukti, dua teks | Ragam sastra dan citraan, bagan kerangka teks, penilaian bahasa, stimulus visual |

## 4. Blueprint aplikasi v1, usulan untuk uji coba

Semua angka berikut adalah komposisi editorial aplikasi; tidak diklaim sebagai proporsi resmi TKA. Simpan dalam konfigurasi berversi agar bisa diperbaiki berdasarkan panduan dan hasil pilot.

| Paket | Topik/kompetensi | Bentuk butir | Kesulitan editorial |
|---|---|---|---|
| SD matematika 30 | Bilangan 12; geometri/pengukuran 12; data 6 | PG 18; MCMA 6; kategori 6 | Mudah 9; sedang 15; menantang 6 |
| SMP matematika 30 | Bilangan 8; aljabar 8; geometri/pengukuran 8; data/peluang 6 | PG 18; MCMA 6; kategori 6 | Mudah 9; sedang 15; menantang 6 |
| Membaca tiap jenjang 30 | Tekstual 10; inferensial 12; evaluasi/apresiasi 8 | PG 18; MCMA 6; kategori 6 | Mudah 12; sedang 12; menantang 6 |

Matematika juga menargetkan pemahaman 6, aplikasi 15, penalaran 9; tingkat kognitif berbeda dari kesulitan. Untuk membaca: paket dibangun dari enam kelompok stimulus berisi lima butir; total tiga kelompok fiksi dan tiga informasi (termasuk informasi jamak pada SMP bila sesuai). Distribusi kompetensi antarkelompok diatur agar total tercapai, bukan memaksakan semua kelompok identik. Puisi dapat dimasukkan sebagai satu kelompok fiksi pada perluasan.

Harian campuran: 10 soal, satu mapel. Matematika mencakup setidaknya dua domain; membaca menggunakan dua stimulus berbeda lengkap dengan masing-masing lima soal. Tidak wajib semua domain muncul dalam satu hari, tetapi rotasi mingguan harus menutup cakupan. Latihan perbaikan dapat mengambil subset butir satu bacaan dengan stimulus tetap utuh.

Kesulitan awal bersifat perkiraan. Setelah pilot, periksa proporsi benar pada respons pertama, opsi yang dipilih, waktu baca, dan laporan soal bermasalah. Koreksi soal ambigu sebelum mengubah label sulit. Jangan menyamakan banyaknya kalimat atau perhitungan panjang dengan kemampuan bernalar.

## 5. Target sebelum mengaktifkan sesi penilaian

Target jangka menengah tetap 600 butir yang telah ditinjau AI dan divalidasi:
150 per jalur, terdiri dari 60 harian + 90 peringkat. Saat ini 90 soal ranking
per jalur sudah tersedia dan total bank mencapai 496; masih perlu 104 soal
harian untuk mencapai target 600. Empat puluh soal pilot official-pattern
belum dihitung sebagai soal yang telah ditinjau.

- Pool peringkat cukup untuk membentuk tiga paket 30 sesuai blueprint pada setiap jalur tanpa mengulang butir selama satu minggu. Masing-masing paket matematika harus mempunyai 30 keluarga berbeda; variasi parameter tidak menambah hitungan keluarga.
- Pool harian dan peringkat tidak berbagi family/stimulus; menukar nama tokoh atau angka saja tidak cukup untuk memisahkannya.
- Sediakan pemeriksaan bahwa distribusi TOPIK × bentuk × kognitif × kesulitan dapat dipenuhi bersamaan; jumlah total 90 saja belum membuktikan paket dapat dibentuk.
- Cadangan konten dan rotasi berkala tetap diperlukan; 600 bukan janji bank tidak pernah habis. Latihan harian dapat mengulang dengan jarak waktu ketika perlu.
- Soal gambar harus punya aset lokal, alt text, dan ukuran yang terbaca pada HP. Diagram tidak diasumsikan berskala kecuali dinyatakan.
- Jangan mengaktifkan peringkat dengan 20 soal per jalur atau menambal kekurangan menggunakan generasi AI spontan saat ujian.

## 6. Proses penulisan dan penerbitan tanpa guru manusia

1. Tetapkan kompetensi, tujuan, bentuk jawaban, kesulitan perkiraan, serta sumber acuan.
2. Tulis stimulus/soal orisinal dan kunci; bangun pengecoh dari pola salah yang masuk akal.
3. Tulis pembahasan dan contoh materi. Setiap opsi harus punya alasan; jangan hanya menuliskan 'salah'.
4. Jalankan pemeriksaan struktur, pilihan ganda, angka, satuan, bukti bacaan, dan rentang panjang.
5. Reviewer AI memecahkan soal tanpa melihat kunci awal; setelah jawaban independen terkumpul, bandingkan dengan kunci. Evaluasi ulang jika bertentangan. Model yang sama dapat berkorelasi kesalahannya; jangan menganggap dua panggilan sebagai jaminan kebenaran.
6. Soal ambigu atau tidak disepakati tetap `quarantined`. Pemilik tidak diwajibkan memperbaiki kontennya; proses konten yang menindaklanjuti.
7. Publikasikan versi terkunci ke pool yang sesuai. Catat review_id, tanggal, validator, dan perubahan kunci.
8. Laporan 'soal bermasalah' membuat tiket konten. Validasi dulu sebelum menonaktifkan agar spam tidak menghilangkan seluruh bank. Koreksi hasil mengikuti PRD.

## 7. Batas verifikasi seed

Validator memeriksa kunci matematika dengan hitungan ulang, termasuk pencarian solusi/pembagi pada beberapa jenis soal; kutipan bukti harus ditemukan persis pada bacaan. Seluruh referensi modul dan opsi diperiksa. Pemeriksaan ini tidak menguji UI, server, nilai resmi TKA, maupun perkembangan belajar anak.

Bank seed dan modul tersedia sebagai JSON dan Markdown. Data kunci adalah bahan server/admin; jangan memasukkannya ke bundle frontend.
