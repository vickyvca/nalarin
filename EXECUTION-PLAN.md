# Rencana eksekusi

> Catatan tahap awal di bawah merupakan riwayat rencana 6 September. Status rilis terbaru 7 September ada di [RELEASE-CHECKS.md](RELEASE-CHECKS.md): SQLite ditetapkan, fallback demo dihapus, pemulihan memakai kode, dan tutor menggunakan model gateway Mitsuko tanpa tools. Pekerjaan berikutnya adalah bank ranking dan uji konten; bukan mengulangi pembangunan aplikasi.

## Paket persiapan dan aplikasi v1

- PRD dengan latihan bebas, sesi penilaian 3×/minggu, modul opsional, laporan dan ranking per mapel.
- Rujukan resmi dan batas verifikasi tercatat.
- Bank pilot 80 soal orisinal, 8 bacaan, 15 modul; generator serta validator lokal.
- Rancangan Mitsuko tutor dan bukti live endpoint terlindungi; integrasi belum diuji terautentikasi.
- UI responsif dan API Express/SQLite sudah dideploy ke `https://tka.mdc.web.id/`.
- Login lokal username + kode 6 angka, profil kelas 6/9, sesi cookie, latihan harian 10 soal, autosave, scoring server-side, pembahasan, progres, dan gate leaderboard sudah terpasang.
- Smoke test publik sudah melewati daftar → login → latihan → submit → pembahasan; akun uji dibersihkan setelah verifikasi.

## Tahap 1 — preview dan satu alur belajar

Alur preview sudah diwujudkan sebagai UI responsif untuk daftar/login, beranda dua mapel, bentuk PG/MCMA/kategori, hasil, pembahasan, modul opsional, liga, dan progres. UI sekarang mengambil sesi latihan dari API ketika akun masuk; fallback pratinjau hanya dipakai bila API tidak tersedia.

Hasil diterima ketika Kak bisa menilai kenyamanan alur dan isi; tidak menganggap gambar mockup sebagai aplikasi berfungsi.

## Tahap 2 — aplikasi sederhana

Satu aplikasi web, satu backend, satu database aplikasi sendiri. Pilihan database final mengikuti stack DevServer dan uji konkurensi; jangan mencampur data latihan dengan ERP. Karena pendaftaran terbuka bisa dipakai beberapa sekolah, pertimbangkan database relasional server yang sudah dikelola jika cocok. Satu layanan tetap cukup; tidak perlu mikroservis.

Entitas inti: account, learner, guardian_link, school_directory, module, stimulus, question_version, blueprint_version, attempt, attempt_question, response, content_report, ai_usage. Ranking dan laporan berasal dari attempt/response; tidak perlu gudang data terpisah. Jawaban benar tidak tersimpan di frontend.

Urutan: login mandiri → profil → bank/import → sesi/autosave → penilaian → pembahasan/modul → laporan → quota/ranking. Kode email dan pemulihan mandiri memakai layanan pengiriman yang dikonfigurasi saat implementasi. OAuth, DNS, secrets, dan email adalah pekerjaan teknis implementasi, bukan tugas registrasi manual pemilik.

## Tahap 3 — perluasan konten dan Mitsuko

Perluas bank ke target awal 600, dengan prioritas subkompetensi yang masih kosong. Jalankan review AI independen tanpa kunci, validasi angka/teks, serta pembentukan paket 30 yang memenuhi seluruh batas secara bersamaan. Aktifkan pembahasan tambahan Mitsuko hanya setelah mode tutor terpisah lulus uji. Tidak perlu menunggu jumlah 600 untuk menguji alur harian dengan keluarga; perlu menunggu gerbang paket sebelum membuka sesi penilaian produksi.

## Tahap 4 — uji fungsional yang penting

1. PG/MCMA/kategori, termasuk sebagian benar dan jawaban kosong.
2. Kuota tiga total mapel, klik ganda, dua tab, pergantian minggu WIB, sesi dimulai sebelum pergantian minggu.
3. Putus koneksi, refresh, timer habis, submit ulang, restore sesi.
4. Skor seri, pembulatan, per-mapel, opt-out ranking, dan koreksi soal lintas peserta.
5. Otorisasi akun orang tua/anak, pelajar lain, API pembahasan sesi aktif, serta sumber kunci tidak diunduh sebelum selesai.
6. Bank tidak cukup, template serupa, bocoran family dari latihan ke ranking, dan stimulus terpotong.
7. Mitsuko gagal/lambat, batas penggunaan, respons menyimpang, serta pemisahan tools/data.
8. Uji awal 50 peserta serentak dengan autosave; lihat latensi, error, resource, dan kapasitas AI. Tambah kapasitas sesuai bukti jika sekolah masuk lebih banyak.

## Tahap 5 — deploy DevServer (selesai untuk v1)

Inventarisasi server dengan akses yang tersedia; tentukan port bebas, kapasitas disk, proses aplikasi, dan jalur routing subdomain. Siapkan folder/release aplikasi sendiri, secret di server, database/volume sendiri, health check, backup rutin, dan rollback. Pasang `tka.mdc.web.id` pada routing yang sudah digunakan server. Verifikasi HTTPS, login callback, sesi belajar nyata, pembahasan dan laporan dengan akun uji. Jangan hanya melaporkan HTTP 200 sebagai penerimaan aplikasi.

Deployment menggunakan service dan folder aplikasi sendiri; tidak menyentuh data ERP atau private server lain. Health publik: `https://tka.mdc.web.id/api/health`.

## Checkpoint untuk melanjutkan

Mulai berikutnya dengan membaca README, PRD, QA-REPORT, CONTENT-PLAN, dan `bank/RANKING-BLUEPRINT.md`. Angka bank yang selesai: 80 soal pilot latihan, bukan target ranking 120 soal. Mitsuko: endpoint memberi 401 tanpa kredensial, belum completion berhasil. Fokus berikutnya adalah menyusun dan mereview bank ranking, lalu mengaktifkan paket 30 soal per kelas/mapel secara bertahap.
