# Nalarin

Web app persiapan TKA untuk kelas 6 SD dan kelas 9 SMP. Anak bisa daftar dengan username + kode masuk 6 angka, menjalankan latihan harian, melihat pembahasan setelah submit, dan menyimpan progres di SQLite. Tampilan responsif untuk HP dan desktop. Brand produk: **Nalarin**; persona tutor: **Kak Nara**; pembahasan AI memakai adapter server.

Live demo: https://tka.mdc.web.id/.

## Run

```powershell
npm install
npm run api
```

Di terminal kedua (Vite meneruskan `/api` ke port 18186):

```powershell
npm run dev
```

Build verification:

```powershell
npm run build
npm test
```

Prepare and run the API locally:

```powershell
npm run sync-content
npm run api
```

Login memakai username dan kode 6 angka; pemulihan mandiri memakai kode pemulihan yang disimpan saat daftar. API memakai SQLite, penilaian di server, sesi liga bebas dikerjakan, snapshot soal, dan pembahasan setelah submit. Ranking menunggu bank `ranked_eligible` yang memenuhi blueprint. Kak Nara memakai adapter AI server dengan konteks soal saja dan tanpa tools operasional. Konfigurasi dan kunci hanya ada di server. Progres berasal dari sesi nyata; gangguan API menampilkan pesan untuk mencoba lagi.

Production deployment files are kept outside the public source package. Use the example environment file as a starting point and keep real credentials on the server.
