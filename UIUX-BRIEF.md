# UI/UX yang dikerjakan

User mempersempit eksekusi pada 6 September 2026: **sampai UI/UX dulu**. Backend dan deployment tidak dilanjutkan. Pemeriksaan server sebelum koreksi hanya read-only; tidak ada perubahan server.

## Arah visual

Liga belajar dengan warna cobalt, kuning, coral dan mint, kartu membulat, avatar ilustrasi, podium yang menonjol, serta peringkat pribadi yang mudah dicari. Tidak kekanak-kanakan untuk kelas 9. Tampilan latihan lebih tenang dibandingkan liga.

## Alur yang harus dapat ditinjau

1. Masuk/daftar singkat dan profil kelas 6/9.
2. Beranda dengan latihan hari ini dan posisi liga.
3. Pilih mapel/latihan campuran atau materi.
4. Contoh pengerjaan PG, MCMA, dan kategori.
5. Hasil dan pembahasan langkah demi langkah; contoh panel Mitsuko.
6. Modul pendek sesuai kesalahan.
7. Progres per mapel dengan pemisahan latihan/penilaian.
8. Liga mingguan: podium, daftar peserta, posisi sendiri, filter mapel/jenjang/sekolah, dan akses sesi tanpa kuota.

Nama, sekolah, nilai, streak, grafik, dan ranking pada prototype adalah data contoh. Interaksi memakai state lokal di draft. Tidak ada autentikasi, penyimpanan hasil, server timer, atau permintaan AI yang benar-benar berjalan.

## Penekanan liga

Posisi yang dikejar mudah terlihat. Hadiah visual berupa badge/selebrasi singkat, bukan hadiah uang. Nilai terbaik dari sesi penilaian menentukan ranking; latihan bebas tidak memberi poin liga. Skor sama berbagi peringkat. Anak yang belum ikut melihat ajakan mulai, bukan posisi terbawah fiktif. Liga tetap mengarahkan anak ke latihan harian agar kebiasaan belajar berlanjut.

## Kriteria review desain

- Tampilan desktop dan HP terbaca tanpa scroll mendatar.
- Aksi utama jelas, kartu tidak semuanya bersaing meminta perhatian.
- Leaderboard menyenangkan, dengan angka/ranking yang konsisten.
- Pembahasan bisa dibaca dan memahami alasan jawaban, bukan hanya warna hijau/merah.
- Murid paham perbedaan latihan bebas dan sesi penilaian liga yang bisa diulang kapan saja.
- Prototipe menyatakan data contoh; tidak mengaku fungsi backend sudah jadi.
- Preview dapat ditinjau sebelum implementasi aplikasi berikutnya.
