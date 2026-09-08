# Pembelajaran modul v2

Aktif pada rilis 20260908-174238. Total tetap 15 modul dan 456 soal.

Tujuh modul Matematika diperluas: sd-bangun, sd-ukuran, sd-data, smp-bilangan, smp-aljabar, smp-geometri, smp-data. ID modul dipertahankan agar tautan pembahasan dan latihan tetap bekerja. Setiap modul memuat empat konsep ringkas, contoh tiga langkah, dan kesalahan umum. Modul lain tetap tersedia; pembaruan ini tidak mengklaim semua kompetensi TKA sudah lengkap.

Antarmuka yang sudah ada menampilkan konsep → contoh → tombol Coba soal materi ini. Tidak ada perubahan frontend pada rilis ini.

Verifikasi: validator bank dan npm test lulus; sebelum pemasangan konten live dibandingkan dengan baseline. API publik mengembalikan konsep dan contoh terbaru untuk tujuh modul. Latihan tiap modul diuji sampai submit/pembahasan: sd-data berisi 3 soal, enam modul lainnya 5 soal. Semua soal memiliki module_id yang sesuai. Dua akun QA beserta sesinya sudah dihapus.

Pemeriksaan visual browser baru belum dilakukan. Review independen 16 soal tambahan masih menunggu; semuanya tetap harian, bukan ranking.

Pemeliharaan: jalankan `python scripts/expand-modules-v2.py` setelah generator bank, lalu validator dan sync-content. Skrip persiapan daily-v2 lama mengunci modul baseline rilis sebelumnya; jangan digunakan untuk membangun rilis modul ini karena guard-nya memang akan menolak perubahan modul.

Temuan database sebelumnya: satu profil guru dan satu sesi tidak memiliki akun induk. Setelah backup SQLite online terverifikasi, hanya dua baris yatim tersebut dibersihkan; foreign_key_check kini bersih. Penyebab historis penghapusan akun tidak ditentukan. Operasi cleanup harus selalu mengaktifkan foreign_keys dan menggunakan transaksi.
