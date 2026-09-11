# PRD Nalarin v0.1

Status: spesifikasi dan rilis aplikasi v1, 7 September 2026. Keputusan dari percakapan ditandai tetap; angka editorial di bawah adalah default eksekusi yang dapat dikonfigurasi.

## 1. Tujuan

Membantu murid kelas 6 dan 9 meningkatkan pemahaman Matematika dan Bahasa Indonesia melalui latihan, penjelasan kesalahan, pengulangan dengan soal baru, serta simulasi. Pengguna awal keluarga/teman di Jawa Tengah, pendaftaran terbuka untuk murid sekolah lain. Pengelolaan harian tidak bergantung pada pemilik membuat akun, mereset password, atau menulis soal.

Ukuran manfaat: perkembangan pada soal baru dengan kompetensi yang sama; tren skor simulasi yang sebanding; penyelesaian latihan; berkurangnya kesalahan berulang. Jumlah klik atau ranking bukan satu-satunya ukuran belajar.

## 2. Pengalaman ringkas

Navigasi murid: Beranda, Latihan, Sesi Penilaian, Perkembanganku. Modul dan pembahasan dibuka dari alur ini. Leaderboard berada di hasil sesi dan Perkembanganku; tidak menambah navigasi utama.

Beranda: dua kartu mapel, tombol Latihan Hari Ini, satu saran materi, dan pintasan sesi liga. Bahasa Indonesia sederhana; HP menjadi perangkat utama. Satu stimulus panjang mempunyai area baca yang tetap dapat diakses saat memilih jawaban. Semua kontrol bisa dipakai keyboard dan status benar/salah tidak bergantung pada warna.

## 3. Mode belajar

| Mode | Ukuran default | Waktu | Batas | Peringkat |
|---|---|---|---|---|
| Cek awal | 10 soal tiap mapel; dua sesi terpisah | Tanpa timer paksa | Sekali; dapat dilewati | Tidak |
| Latihan Harian | 10 soal satu mapel | Perkiraan 15–25 menit | Bebas setiap hari, dapat diulang | Tidak |
| Latihan materi/perbaikan | 5 soal satu materi | Tanpa timer paksa | Bebas | Tidak |
| Sesi Penilaian | 30 soal satu mapel | 75 menit, waktu server | Bebas; maksimal satu sesi aktif | Ya |

Latihan Harian adalah simulasi singkat pola TKA. Anak memilih campuran materi atau mengikuti saran. Tidak perlu tombol simulasi tambahan dengan aturan yang membingungkan. Modul opsional 3–5 menit dapat dibuka sebelum latihan/perbaikan. Jawaban dan pembahasan muncul setelah sesi dikumpulkan; sesi penilaian tidak menyediakan tutor, petunjuk, atau kunci saat berjalan.

Istilah sesi penilaian berarti sesi resmi dalam aplikasi, bukan ujian resmi pemerintah. Pengukuran akademik 30/75 mengikuti acuan pelaksanaan 2026 (S6/S7 di SOURCES.md). Survei karakter/lingkungan tidak menjadi konten simulasi akademik.

## 4. Akun dan profil

Rilis awal memakai username dan kode masuk 6 angka supaya murid dapat daftar dari HP tanpa OAuth atau email. Profil sekali isi: nama panggilan, kelas 6/9, sekolah opsional, dan kota/kabupaten opsional. Orang tua dapat membantu membuat dan menyimpan kredensial; rilis awal tidak membutuhkan pemilik membuat akun satu per satu.

Sekolah adalah atribut pengelompokan. Nama sekolah yang diketik tidak memberi akses ke laporan orang lain. Nama sekolah baru dapat diusulkan otomatis dengan normalisasi nama/kota; tidak memblokir latihan. Tidak ada peran guru yang langsung memperoleh akses luas dari pilihan saat daftar.

Persetujuan wali dan pengaturan privasi masuk alur ringkas yang dikerjakan wali, tidak membutuhkan approval admin per akun. Persyaratan yang berlaku untuk layanan anak perlu ditinjau sebelum pendaftaran publik; dokumen ini bukan pendapat hukum. Jangan meminta KTP/NIK/NISN, alamat rumah rinci, atau foto dokumen untuk kebutuhan latihan.

Pisahkan identitas login dari learner_id. Riwayat dan leaderboard mengikuti learner_id. Laporan privat hanya untuk akun yang sedang masuk. Pemulihan mandiri memakai kode pemulihan sekali pakai yang diberikan saat daftar dan dapat dibuat ulang dari profil dengan kode masuk saat ini. Pemulihan membatalkan sesi lama dan memberikan kode pemulihan baru. Email dan guardian link belum tersedia; jangan meminta NIK/NISN, alamat rumah rinci, atau foto dokumen.

## 5. Aturan sesi

- Minggu: Senin 00.00 WIB sampai Senin berikutnya 00.00 WIB, interval akhir eksklusif. Simpan timestamp UTC dan week_start Asia/Jakarta.
- Sesi penilaian liga bebas dikerjakan setiap saat. Satu sesi = satu mapel; semua sesi valid disimpan untuk progres.
- Maksimal satu sesi penilaian aktif per learner. Memulai ulang mengembalikan sesi yang sama; idempotency key wajib.
- Timer 75 menit dihitung server sejak started_at. Menutup browser tidak menghentikan waktu. Gangguan koneksi bisa melanjutkan selama sisa waktu masih ada.
- Jawaban autosave dan penanda ragu-ragu tersimpan. Reload tidak meroll soal, urutan opsi, atau kunci.
- Minggu mengikuti waktu MULAI sesi; hasil dan peringkat juga masuk minggu itu. Penutupan minggu final setelah toleransi maksimal durasi sesi terakhir (75 menit). UI boleh menandai peringkat sementara.
- Submit ulang tidak membuat nilai ganda. Jawaban setelah submitted/expired ditolak.
- Gangguan teknis server yang terverifikasi dapat membatalkan sesi dengan audit agar sesi itu tidak memengaruhi peringkat. Menutup browser sendiri tidak membatalkan sesi.
- Jangan mengurangi jumlah soal jika bank kurang. Tampilkan sesi penilaian belum tersedia; latihan harian tetap ada.

## 6. Penyusunan paket

Paket memakai blueprint versi tertentu: jenjang, mapel, topik/kompetensi, tipe butir, tingkat kognitif, dan kesulitan editorial. Blueprint adalah rancangan aplikasi, bukan bobot resmi. Semua varian satu template mempunyai family_id; bacaan bersama mempunyai stimulus_id. Untuk matematika, satu family maksimal sekali per paket. Untuk membaca, family adalah kelompok bacaan: beberapa butir berbeda dari bacaan yang sama memang diambil sebagai satu kelompok; kelompok yang sama tidak diambil dua kali. Bacaan dan pertanyaannya harus utuh dan urutan antarpertanyaan tidak membocorkan jawaban.

Pool harian dan pool peringkat terpisah sampai tingkat family/stimulus. Membaca kunci latihan tidak boleh membocorkan soal yang sama atau sekadar varian angka dalam pool ranking minggu berjalan. Jangan mengacak opsi yang bergantung urutan atau merusak rujukan. Simpan question_version dan scoring_version pada sesi.

Prioritaskan soal/family belum dilihat murid; randomisasi terbatas pada blueprint. Jika pool harian habis, gunakan pengulangan berjarak dan label latihan ulang. Tidak ada janji semua soal selalu unik selamanya. Paket ranking memakai topik/kesulitan sebanding; belum mengklaim setara secara psikometrik sampai uji coba tersedia.

## 7. Skor aplikasi v1

Nilai per butir = 1 jika seluruh respons butir tepat, 0 jika salah/tidak lengkap/kosong. PG memerlukan satu opsi benar; MCMA himpunan pilihan harus persis sama dengan kunci; kategori seluruh baris harus tepat. Tidak ada pengurangan nilai. Setiap butir bernilai sama walau jumlah pernyataannya berbeda.

Skor sesi = 100 × total butir benar / total butir. Simpan pecahan/angka mentah; tampilan satu desimal. Ini skor latihan aplikasi, bukan rekonstruksi penskoran resmi TKA. Kategori boleh menampilkan '2 dari 3 pernyataan tepat' sebagai umpan balik walau skor butir 0. Penilaian memakai kode deterministik, bukan output AI.

Jika soal dibatalkan, keluarkan dari pembilang/penyebut untuk seluruh peserta terdampak, hitung ulang, simpan jejak revisi, serta beri pemberitahuan di hasil. Jika lebih dari 10% butir paket dibatalkan, keluarkan sesi dari ranking dengan alasan teknis tercatat; tetap simpan laporan pembelajaran. Ambang 10% adalah kebijakan aplikasi.

## 8. Leaderboard

Mingguan per jenjang DAN mapel, opsional filter sekolah. Hanya sesi penilaian valid. Nilai terbaik dari sesi liga yang selesai menjadi nilai per mapel; sesi mapel lain tidak dijumlahkan. Jika belum mengambil mapel tertentu, tidak mendapat peringkat pada mapel itu.

Bandingkan skor mentah (jangan memakai pembulatan tampilan untuk memecah seri). Skor sama mendapat peringkat sama, pola 1, 1, 3. Waktu pengerjaan tidak memecah seri. Tampilkan nama panggilan/avatar; keikutsertaan dapat dimatikan tanpa menghapus hasil pribadi. Ranking hanya setelah login. Tidak ada klaim pengawasan antikecurangan setara ujian; ini motivasi belajar.

## 9. Pembahasan dan modul

Untuk semua soal: jawaban anak/kunci, tujuan soal, konsep, langkah, alasan setiap opsi/pernyataan, kemungkinan pola salah (bukan diagnosis pasti), rujukan modul, dan latihan berikut. Bahasa Indonesia wajib mempunyai bukti teks yang benar-benar ada di stimulus. Matematika mengutamakan satuan, langkah, dan pengecekan hasil.

Modul: satu tujuan, 3–5 poin konsep, satu contoh selesai, satu kesalahan umum, tautan latihan 5 soal. Tidak ada syarat menyelesaikan seluruh modul untuk mulai latihan. Modul boleh lebih singkat dari waktu perkiraan jika anak sudah paham.

Kak Nara (persona di atas mesin Mitsuko): Jelaskan lebih sederhana / Beri contoh lain / Tanya tentang soal ini. Maksimal 5 respons tambahan per soal per learner per hari, batas harian awal 20 respons per learner; batas global ditentukan setelah uji biaya. Pembahasan dasar disimpan dan tidak membutuhkan AI real-time. Respons dipatok pada materi anak dan tidak diberi akses data murid lain.

## 10. Laporan dan rekomendasi

Pisahkan grafik simulasi, latihan campuran, dan latihan materi. Tampilkan nilai, waktu, salah/kosong, jumlah sesi, dan tanggal. Progres per mapel/kompetensi mencantumkan jumlah soal baru yang menjadi bukti.

Default rekomendasi sederhana: untuk satu kompetensi, ambil maksimal 20 respons pertama atas materi soal baru selama 30 hari. Matematika menghitung satu respons pertama per family; membaca menghitung setiap butir berbeda pada perjumpaan pertama dengan kelompok stimulus, tetapi tidak menghitung ulang kelompok yang jawabannya sudah dilihat. Sebelum 10 butir dari minimal 2 sesi, label data masih terbatas. Akurasi <60%: Pelajari lagi; 60–79%: Perlu latihan; >=80%: Sudah cukup baik. Label adalah sinyal latihan, bukan sertifikasi penguasaan. Jawaban ulang sesudah melihat kunci ditampilkan terpisah. Rekomendasikan maksimum dua materi, bukan daftar panjang kekurangan.

Orang tua melihat profil anak yang tertaut. Admin melihat kesehatan konten/layanan dan laporan yang memang diperlukan; tidak memerlukan workflow guru atau dashboard sekolah pada rilis awal.

## 11. Penerimaan minimum

1. Daftar sendiri dari HP, mengisi profil, lalu mulai latihan tanpa bantuan pemilik.
2. Harian bisa diulang dan tidak masuk ranking liga.
3. Sesi liga berikutnya dapat dimulai setelah sesi sebelumnya selesai; dua tab/perangkat tetap menerima sesi aktif yang sama.
4. Refresh/offline singkat memulihkan jawaban dan timer tanpa mengganti paket.
5. Semua PG/MCMA/kategori dinilai sesuai aturan; nilai tidak berubah karena AI.
6. Kunci/penjelasan sesi aktif tidak ada di payload klien; API review/tutor memeriksa hak akses dan status sesi.
7. Profil berbeda tidak saling melihat laporan, termasuk jika mengganti learner_id di request.
8. Semua soal aktif punya kunci, pembahasan, asal, versi, dan modul yang valid.
9. Kegagalan Mitsuko tetap menyisakan pembahasan dasar dan latihan yang berfungsi.
10. Uji 50 peserta serentak dengan jawaban autosave sebelum pilot yang diperluas; angka kapasitas final mengikuti bukti, bukan janji DevServer otomatis cukup.

## 12. Di luar rilis awal

Pembayaran, langganan, video panjang, rapor sekolah, guru wajib reviewer, proctoring kamera, aplikasi native, integrasi Dapodik, serta ranking nasional tersertifikasi. Fokus pembangunan berikutnya adalah memperluas dan mereview bank soal ranking, lalu mengaktifkan sesi resmi bertahap.
