# Nalarin API

API v1 untuk paket latihan, autosave jawaban, penilaian deterministik, progres, dan leaderboard. Kunci jawaban hanya dibaca server dan baru dikirim setelah sesi dikumpulkan. Anak masuk dengan username dan kode 6 angka; orang tua cukup membantu menyimpan keduanya. Jika tutor AI diaktifkan, Mitsuko menjadi mesin backend dengan persona produk Kak Nara.

Jalankan lokal:

```powershell
npm run sync-content
npm run api
```

Endpoint health: `GET /api/health`.

Untuk smoke test lokal, demo session masih aktif secara default. Set `ALLOW_DEMO_AUTH=false` pada server publik; login lokal tetap aktif. Ketersediaan paket ranking dapat diperiksa dengan `npm run check-ranked`. Leaderboard sengaja tetap berstatus belum tersedia sampai setiap kombinasi kelas/mapel mempunyai minimal 30 soal yang lolos review editorial.
