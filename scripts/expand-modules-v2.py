"""Expand existing module lessons without changing IDs or question links."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
updates={
'sd-bangun':('Luas, keliling, dan ubin',
 ['Keliling mengikuti tepi bangun; luas menutupi bagian dalamnya.',
  'Pagar dengan bukaan pintu: hitung seluruh keliling, lalu kurangi panjang bukaan satu kali.',
  'Banyak ubin = luas lantai dibagi luas satu ubin. Samakan satuan panjang sebelum menghitung luas.',
  'Untuk susunan persegi yang pas, hitung ubin per baris dan jumlah baris, lalu kalikan.'],
 'Lantai 300 cm × 200 cm ditutup ubin persegi bersisi 50 cm. Berapa ubin yang diperlukan?',
 ['Sepanjang lantai muat 300 : 50 = 6 ubin.', 'Selebar lantai muat 200 : 50 = 4 ubin.',
  'Totalnya 6 × 4 = 24 ubin. Periksa luas: 24 × 2.500 = 60.000 cm², sama dengan luas lantai.'],
 'Jangan membagi luas lantai dengan panjang sisi ubin. Pembaginya harus luas ubin.'),
'sd-ukuran':('Volume, satuan, dan waktu',
 ['Satu liter sama dengan 1.000 mililiter dan 1.000 cm³.',
  'Banyak gelas = volume minuman dibagi isi tiap gelas, dengan satuan yang sama.',
  'Volume balok = panjang × lebar × tinggi. Gunakan ukuran bagian dalam jika menghitung kapasitas wadah.',
  'Untuk waktu, satu jam = 60 menit. Ubah semuanya ke menit sebelum menjumlahkan durasi.'],
 'Ada 2 liter minuman. Tiap gelas diisi 200 mililiter. Berapa gelas dapat diisi?',
 ['Ubah 2 liter menjadi 2.000 mililiter.', 'Bagi volume minuman: 2.000 : 200 = 10 gelas.',
  'Periksa kembali: 10 × 200 mililiter = 2.000 mililiter, sehingga tidak ada sisa.'],
 'Jangan langsung membagi 2 dengan 200; angka itu masih memakai satuan yang berbeda.'),
'sd-data':('Baca data, lalu hitung',
 ['Baca nama kelompok, waktu, dan satuan data sebelum menghitung.',
  'Jumlah keseluruhan berarti menjumlahkan semua kelompok yang diminta, masing-masing satu kali.',
  'Selisih berarti mengurangi nilai yang lebih besar dengan yang lebih kecil.',
  'Pada piktogram, satu gambar bisa mewakili beberapa benda. Gunakan keterangan nilai tiap gambar.'],
 'Piktogram menunjukkan Senin 3 gambar buku dan Selasa 5 gambar buku. Satu gambar mewakili 4 buku. Berapa total buku?',
 ['Baca keterangan: setiap gambar mewakili 4 buku.', 'Senin: 3 × 4 = 12 buku; Selasa: 5 × 4 = 20 buku.',
  'Totalnya 12 + 20 = 32 buku. Cara lain: (3 + 5) × 4 = 32 buku.'],
 'Delapan adalah banyak gambar, bukan banyak buku. Perhatikan nilai tiap gambar.'),
'smp-bilangan':('Rasio, persen, dan pertumbuhan',
 ['Persen berarti per seratus. Besar diskon dihitung dari harga awal yang disebutkan.',
  'Perbandingan senilai membuat kedua besaran berubah dengan faktor yang sama; perbandingan berbalik nilai mempertahankan hasil kali.',
  'Pertumbuhan dua kali lipat setiap periode berarti mengalikan jumlah sebelumnya dengan 2.',
  'Hitung banyak periode terlebih dahulu. Jangan mengganti pelipatan dengan penambahan jumlah awal.'],
 'Suatu model memiliki 40 sel dan berlipat dua setiap 15 menit. Berapa sel setelah 45 menit?',
 ['Banyak periode = 45 : 15 = 3.', 'Urutannya: 40 menjadi 80, lalu 160, lalu 320.',
  'Jadi ada 320 sel. Bentuk pangkatnya 40 × 2³. Model ini menganggap pola pertumbuhan tetap.'],
 '40 × 2 × 3 bukan tiga kali pelipatan. Tiga periode berarti 40 × 2 × 2 × 2.'),
'smp-aljabar':('Tarif, persamaan, dan batas anggaran',
 ['Tentukan arti variabel, misalnya x untuk jumlah jam atau barang.',
  'Tarif dengan biaya awal mengikuti biaya total = biaya awal + tarif per unit × jumlah unit.',
  'Dari dua pasangan waktu dan biaya, tarif per jam = selisih biaya dibagi selisih jam.',
  'Untuk batas anggaran, periksa bilangan bulat terbesar yang masih terjangkau. Membulatkan ke atas bisa melampaui anggaran.'],
 'Sewa 1 jam berbiaya 12.000 rupiah dan 3 jam berbiaya 26.000 rupiah. Berapa biaya 4 jam jika tarif per jam tetap?',
 ['Tambahan 2 jam menaikkan biaya 14.000 rupiah, jadi tarifnya 7.000 rupiah per jam.',
  'Biaya awal = 12.000 − 7.000 = 5.000 rupiah.',
  'Biaya 4 jam = 5.000 + 4 × 7.000 = 33.000 rupiah. Periksa model pada 3 jam: 5.000 + 21.000 = 26.000.'],
 'Biaya awal dibayar satu kali. Menggandakan biaya satu jam ikut menggandakan biaya awal.'),
'smp-geometri':('Ukuran, skala, dan perubahan posisi',
 ['Pythagoras berlaku pada segitiga siku-siku: kuadrat sisi miring sama dengan jumlah kuadrat kedua sisi lainnya.',
  'Skala 1 : n mengalikan setiap panjang pada denah dengan n. Rasio luas menggunakan n².',
  'Volume air tambahan = luas alas × kenaikan tinggi air. Waktu pengisian = volume tambahan dibagi debit.',
  'Translasi menambahkan perpindahan pada koordinat; refleksi terhadap sumbu-x mempertahankan x dan membalik tanda y.'],
 'Bak beralas 60 cm × 40 cm berisi air setinggi 10 cm. Debit 6 liter per menit. Berapa menit agar air mencapai 35 cm jika bak cukup tinggi?',
 ['Kenaikan tinggi = 35 − 10 = 25 cm.', 'Volume tambahan = 60 × 40 × 25 = 60.000 cm³ = 60 liter.',
  'Waktu = 60 : 6 = 10 menit. Gunakan volume tambahan, bukan volume dari dasar hingga 35 cm.'],
 'Skala panjang tidak langsung menjadi skala luas; semua dimensi yang membentuk luas harus ikut berubah.'),
'smp-data':('Rata-rata, median, dan peluang',
 ['Rata-rata = total nilai dibagi banyak data. Jika ada frekuensi, kalikan tiap nilai dengan frekuensinya sebelum menjumlahkan.',
  'Median adalah nilai tengah setelah diurutkan. Untuk banyak data genap, rata-ratakan dua nilai tengah.',
  'Peluang pada hasil yang sama mungkin = banyak hasil yang diinginkan dibagi seluruh hasil yang mungkin.',
  'Frekuensi relatif = banyak kemunculan dibagi banyak percobaan. Perkiraan pada percobaan baru tidak menjamin hasil sebenarnya.'],
 'Data lama perjalanan adalah 9, 5, 7, 11, 7, dan 15 menit. Tentukan median dan rata-ratanya.',
 ['Urutkan: 5, 7, 7, 9, 11, 15. Ada enam data.', 'Median = (7 + 9) : 2 = 8 menit.',
  'Jumlah data = 54, sehingga rata-rata = 54 : 6 = 9 menit. Median dan rata-rata dapat berbeda.'],
 'Jangan mencari median dari daftar yang belum diurutkan atau membagi total nilai dengan jumlah kelompok frekuensi.')}

if __name__=='__main__':
 path=root/'bank/modules.json'; modules=json.loads(path.read_text(encoding='utf-8'))
 for m in modules:
  if m['id'] not in updates: continue
  title,points,question,steps,mistake=updates[m['id']]
  m.update(title=title,objective='Pahami konsep, ikuti contoh, lalu coba latihan terkait.',key_points=points,
           example=dict(question=question,steps=steps),common_mistake=mistake,
           next_action='Coba soal materi ini. Setelah selesai, baca alasan setiap pilihan jawaban.',version=2)
 path.write_text(json.dumps(modules,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 doc=['# Modul Nalarin','']
 for m in modules:
  doc += ['## '+m['id']+' — '+m['title'],'',m['objective'],'']+['- '+x for x in m['key_points']]
  doc += ['',m['example']['question'],'']+[str(i+1)+'. '+x for i,x in enumerate(m['example']['steps'])]
  doc += ['',m['common_mistake'],'',m['next_action'],'']
 (root/'bank/MODUL.md').write_text('\n'.join(doc).rstrip()+'\n',encoding='utf-8')
 print('Expanded 7 existing modules; total',len(modules))
