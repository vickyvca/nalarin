# Audit cakupan 8 September 2026

53 butir yang sudah ada mendapat ilustrasi SVG orisinal; jumlah bank tetap
440. Kelas 6: 33 gambar, kelas 9: 20 gambar. Enam bentuk: persegi panjang,
persegi, balok, segitiga siku-siku, segitiga sama kaki, bangun sebangun.
Teks, opsi dan kunci tidak berubah. Versi 53 butir dinaikkan; sesi lama
mempertahankan snapshot. Gambar memuat informasi yang diketahui saja dan
diberi keterangan tidak berskala. Gambar ini belum menambah cakupan kompetensi
baru; pembacaan diagram/grafik sebagai sumber data utama masih perlu ditulis.

## Bobot kelas asal materi

BELUM DIIMPLEMENTASIKAN. `grade: 6/9` berarti jenjang peserta, bukan kelas
asal materi. Tidak ada metadata terverifikasi kelas 4/5/6 atau 7/8/9 pada
setiap soal dan tidak ada kuota berdasarkan kelas asal pada pemilih paket.
Dalam kerangka resmi yang diperiksa, bobot per kelas tidak ditemukan.
Jangan menyebut angka 20/30/50 atau 30/30/40 sebagai komposisi resmi TKA.
Pemetaan perlu mempertimbangkan buku/kurikulum karena materi dapat lintas kelas.

Komposisi editorial bank ranking Matematika (90 per jenjang):
- SD: bilangan 36 (40%), geometri/pengukuran 36 (40%), data 18 (20%).
- SMP: bilangan 24, aljabar 24, geometri/pengukuran 24 (masing-masing 26,67%),
  data/peluang 18 (20%). Ini stok bank, bukan bukti tiap sesi live memakai bobot sama.

## Penilaian jujur untuk SMP

Bank dapat digunakan sebagai latihan awal, belum sebagai cakupan TKA lengkap.
Audit AI dan hitungan benar tidak membuktikan variasi pedagogis memadai.
Generator hanya memakai empat pola tiap domain Matematika dengan variasi angka.
Label penalaran tidak menjamin soal menuntut penalaran tingkat tinggi.
Soal Bahasa Indonesia berulang pada aktivitas kelompok; sebagian meminta
informasi tersurat meskipun metadata menyebut inferensial. Genre yang ditandai
fiksi juga perlu pemeriksaan substansi. Pembahasan pengecoh masih sering umum.

Prioritas berikutnya: ganti pola bacaan berulang dengan bacaan beragam dan
inferensi nyata; soal geometri multi-langkah, jaring-jaring, grafik fungsi,
rotasi/dilatasi, tabel/piktogram/diagram data sebagai stimulus. Tidak perlu
menambah angka jumlah soal sebelum pola dan pembahasannya lebih bermutu.

## Bukti dan pemeliharaan

- `scripts/test-diagram-ui.cjs`: semua 53 gambar dimuat pada lebar 320/390 px,
  tampil di pembahasan, tanpa overflow horizontal atau error JS; fixture UI.
- `python scripts/validate_bank.py`, `npm test`, `npm run build`: lulus.
- Enam bentuk diperiksa visual pada tangkapan layar.
- Live release `20260908-082853`: browser publik kelas 6 dan 9 masing-masing
  berhasil membuka sesi ranking 30 soal, memuat SVG, menampilkan gambar di kuis,
  lalu submit dengan metadata gambar pada pembahasan. Dua akun QA dan sesi
  terkait dihapus dengan foreign keys aktif. Service aktif; health 440/360.
- Setelah impor ulang bank, jalankan `python scripts/add-geometry-diagrams.py`
  lalu sync-content. Selalu sertakan `public/question-diagrams` ke build/deploy.
  Aset memakai hash dan harus dipertahankan untuk snapshot sesi lama.
- Patch live dibuat dari source/asset live yang ditarik lebih dahulu, hanya
  penambahan field diagram dan renderer; perubahan lokal lain tidak ikut rilis.

Rujukan resmi diperiksa 8 September 2026:
- https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/sd/matematika
- https://pusmendik.kemendikdasmen.go.id/tka/tka/view/mata-pelajaran-wajib/smp
- https://bbpmpjateng.kemendikdasmen.go.id/perbandingan-kurikulum-2013-dan-kurikulum-merdeka/

Pembukaan langsung beberapa sumber gagal; matriks dan contoh dibaca dari
indeks pencarian resmi. Tidak mengklaim pemeriksaan PDF lengkap.
