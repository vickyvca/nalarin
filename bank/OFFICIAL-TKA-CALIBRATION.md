# Kalibrasi dari contoh resmi TKA

Dokumen ini mencatat pola yang terlihat pada halaman contoh soal resmi TKA dan dipakai sebagai pagar editorial untuk bank Nalarin. Angka di bawah adalah **hasil pengamatan pada paket contoh yang ditampilkan laman**, bukan kuota resmi yang menjamin komposisi tes pada tahun berikutnya.

## Sumber yang diperiksa

- [Daya serap dan contoh TKA](https://tka.kemendikdasmen.go.id/hasiltka/daya-serap)
- [Contoh TKA Matematika SD](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/sd)
- [Contoh TKA Bahasa Indonesia SD](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/sd/bahasa-indonesia)
- [Contoh TKA Matematika SMP](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/smp)
- [Contoh TKA Bahasa Indonesia SMP](https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/smp/Bahasa-Indonesia)
- [Kerangka resmi TKA, dokumen 047/H/AN/2025](https://pusmendik.kemendikdasmen.go.id/tka/page/download_file/700298_47)

Halaman contoh dipakai untuk membaca bentuk stimulus, instruksi, dan variasi tuntutan berpikir. Kerangka dan FAQ resmi tetap menjadi rujukan kebijakan. Contoh yang tersedia tidak boleh diperlakukan sebagai kisi-kisi lengkap atau prediksi pasti nomor dan kuota soal.

## Profil bentuk soal yang teramati

Setiap halaman contoh yang diperiksa berisi 30 butir. Komposisi yang terlihat:

| Jenjang dan mapel | PG | PGK-MCMA | PGK-Kategori | Total |
|---|---:|---:|---:|---:|
| SD Matematika | 18 | 3 | 9 | 30 |
| SD Bahasa Indonesia | 16 | 6 | 8 | 30 |
| SMP Matematika | 16 | 7 | 7 | 30 |
| SMP Bahasa Indonesia | 13 | 10 | 7 | 30 |

PGK-MCMA adalah pilihan ganda kompleks dengan lebih dari satu jawaban benar. PGK-Kategori meminta murid menilai beberapa pernyataan ke dalam kategori yang tersedia. Komposisi ini menjadi profil pembanding untuk review paket 30 soal; validator hanya melaporkan selisihnya dan tidak menggagalkan bank yang lebih besar atau paket latihan harian.

## Pola stimulus dan kompetensi

### SD Matematika

- Angka dan situasi dibuat dekat dengan pengalaman murid: bilangan, operasi, pengukuran, bangun, data, dan pola.
- Tabel, gambar bidang, ukuran, atau representasi sederhana dipakai ketika informasi visual memang harus dibaca untuk menjawab.
- Tuntutan berpikir bergerak dari memahami informasi dan menerapkan prosedur ke menalar hubungan atau memilih strategi.
- Bahasa instruksi harus singkat. Satuan, batasan, dan apa yang ditanyakan ditulis eksplisit agar kesulitan datang dari konsep, bukan kalimat yang berbelit.

### SMP Matematika

- Stimulus lebih sering menggabungkan beberapa informasi: tabel/grafik, perubahan nilai, hubungan aljabar, geometri, peluang, dan perbandingan.
- Soal harus meminta murid membaca model, memilih langkah, memeriksa kewajaran hasil, atau membandingkan beberapa pernyataan; hitungan rutin saja tidak cukup untuk mewakili pola contoh.
- Notasi dan istilah dijaga konsisten. Setiap soal bergambar harus memiliki label dan ukuran yang benar-benar digunakan dalam penalaran.

### SD Bahasa Indonesia

- Bacaan informasi dan fiksi menjadi stimulus utama, dengan pertanyaan tentang informasi tersurat, simpulan sederhana, makna kata dalam konteks, urutan, tujuan, serta respons terhadap isi.
- Jawaban benar harus dapat ditunjukkan dari bukti teks atau hubungan langsung antarkalimat.
- Pengecoh dibuat dari kekeliruan yang masuk akal, misalnya mengambil detail yang benar tetapi tidak menjawab pertanyaan atau membuat simpulan yang terlalu luas.

### SMP Bahasa Indonesia

- Bacaan informasi dan fiksi lebih kompleks, termasuk hubungan gagasan, sudut pandang, tujuan penulis, evaluasi alasan, dan makna implisit.
- Pertanyaan boleh meminta murid menggabungkan dua bagian bacaan atau menilai apakah bukti mendukung suatu pernyataan.
- Pembahasan harus menyebutkan bukti atau bagian bacaan yang menjadi dasar; jangan cukup menulis “sesuai teks”.

## Aturan provenance dan penulisan ulang

Contoh resmi dipakai sebagai referensi pola, bukan sumber untuk menyalin. Jangan menyalin stem, bacaan, angka, pilihan jawaban, ilustrasi, atau pembahasan ke repo. Soal Nalarin harus memiliki stimulus, angka, konteks, dan penjelasan orisinal dengan `source.kind: "original"` dan `source.exam_year: null`.

Boleh mengambil pelajaran dari bentuk kompetensi, cara instruksi ditulis, kebutuhan stimulus, dan jenis kesalahan yang perlu dibahas. Jika sebuah butir terinspirasi oleh pola tertentu, tulis ulang dari masalah baru dan cek kembali bahwa jawabannya tidak bergantung pada detail contoh resmi.

## Checklist sebelum bank atau paket baru dirilis

- [ ] Jenjang dan mapel sesuai kerangka resmi yang dirujuk.
- [ ] Bentuk butir diberi label `PG`, `PGK_MCMA`, atau `PGK_CATEGORY` secara benar.
- [ ] Paket 30 soal ditinjau dengan profil contoh di atas sebagai pembanding, bukan sebagai kuota wajib.
- [ ] Ada variasi stimulus: teks, tabel/grafik, atau gambar hanya bila dibutuhkan untuk bernalar.
- [ ] Instruksi satu makna, bahasa sesuai jenjang, satuan dan label gambar konsisten.
- [ ] Jawaban dan pembahasan diverifikasi; pembahasan menjelaskan langkah dan alasan, bukan kunci saja.
- [ ] Pengecoh mewakili miskonsepsi yang bisa dijelaskan.
- [ ] Seluruh konten baru tetap orisinal dan tidak diberi tahun ujian resmi fiktif.
- [ ] `python scripts/validate_bank.py` lulus. Laporan profil resmi dibaca sebagai sinyal editorial, bukan pengganti review manusia.
