# TODO dan roadmap Nalarin

Status terakhir: **9 September 2026**, branch `main`, commit `5849836`.

## Sudah selesai

- [x] Web live di `https://tka.mdc.web.id/`.
- [x] Pendaftaran mandiri murid dan guru dengan username + PIN 6 angka.
- [x] Kode pemulihan akun tanpa admin membuat akun satu per satu.
- [x] Kelas 6 SD dan kelas 9 SMP.
- [x] Matematika dan Bahasa Indonesia.
- [x] Latihan harian 10 soal yang dapat diulang.
- [x] Simulasi mingguan 30 soal / 75 menit.
- [x] Batas tiga sesi simulasi per murid per minggu.
- [x] Leaderboard berdasarkan sesi simulasi.
- [x] Soal PG, pilihan ganda kompleks, dan kategori per pernyataan.
- [x] Soal dengan bacaan, tabel, dan diagram lokal.
- [x] Autosave, lanjutkan sesi, scoring server-side, dan pembahasan setelah submit.
- [x] Laporan soal bermasalah.
- [x] Progres murid dan ringkasan evaluasi guru berdasarkan sekolah.
- [x] Lima belas modul materi dengan contoh dan pembahasan.
- [x] Alur belajar **Pahami → Contoh → Coba soal**.
- [x] Tanya Kak Nara di materi dan pembahasan melalui adapter Mitsuko.
- [x] Fallback pembahasan dasar ketika AI lambat atau tidak tersedia.
- [x] Onboarding pertama, artwork Kak Nara, PWA install prompt, dan UI responsif.
- [x] Landing page dengan presenter Kak Nara, beberapa pose, animasi idle ringan, serta preview latihan, materi, pembahasan, progres, dan ranking.
- [x] Bank 456 soal: 360 soal ranking dan 96 soal latihan harian.
- [x] Validator bank, test API, CI, backup, health check, dan rollback release.

## Prioritas berikutnya

- [ ] Tambah 144 soal supaya mencapai target 600 butir: 36 soal per jalur untuk empat jalur kelas/mapel.
- [ ] Isi celah materi yang masih tersisa: visualisasi bangun SD, operasi aljabar SMP, grafik/data, puisi, dan stimulus visual Bahasa Indonesia.
- [ ] Jalankan pilot bersama murid nyata dan kumpulkan waktu pengerjaan, jawaban, laporan soal, serta bagian yang membingungkan.
- [ ] Kalibrasi kesulitan berdasarkan respons murid yang dianonimkan; label sulit saat ini masih bersifat editorial.
- [ ] Review berkala percakapan Kak Nara: akurasi, bahasa anak, batas konteks, timeout, dan biaya pemakaian.
- [ ] Tambahkan filter topik dan ringkasan materi yang perlu diulang pada dashboard guru.
- [ ] Tambahkan uji aksesibilitas dan uji viewport HP untuk setiap fitur baru.
- [ ] Tambahkan monitor operasional live untuk health API, backup, error rate, dan kapasitas disk.

## Setelah target awal stabil

- [ ] Perluas kelas 4, 5, 7, 8, dan SMA dengan bank serta modul yang sesuai.
- [ ] Tambahkan mapel lain hanya setelah alur soal, pembahasan, progres, dan evaluasinya siap.
- [ ] Tambahkan ekspor laporan guru yang tetap menjaga privasi antar sekolah.
- [ ] Tambahkan kontribusi komunitas dengan template soal, validator lokal, dan review pull request yang jelas.
- [ ] Tambahkan variasi stimulus gambar yang lebih banyak dan diuji keterbacaannya di HP.

## Batas yang sengaja dipertahankan

- Nalarin tidak menyalin arsip ujian TKA dan tidak menjanjikan bocoran soal.
- Nilai Nalarin adalah nilai latihan, bukan nilai resmi TKA.
- Ranking hanya memakai sesi simulasi; latihan harian tidak mengurangi jatah ranking.
- Tutor AI membantu menjelaskan, tetapi pembahasan dasar yang tersimpan tetap menjadi acuan utama.
- Guru memantau progres berdasarkan sekolah; murid tidak perlu menerima undangan manual.
