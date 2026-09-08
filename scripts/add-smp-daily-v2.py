"""Append original daily items without rebuilding or overwriting existing bank items."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = []

def add(slug, domain, module, stem, values, unit, answer, concept, steps, reasons, rule, inputs):
    rows.append(dict(
        id='9-daily-v2-' + slug, version=1, grade=9, subject='matematika',
        family_id='smp-daily-v2-' + slug, competency=domain, module_id=module,
        cognitive_level='aplikasi', difficulty_editorial='sedang', difficulty_calibrated=False,
        type='PG', stem=stem, stimulus_id=None,
        options=[dict(id=chr(65+i), text=str(v) + (' '+unit if unit else '')) for i,v in enumerate(values)],
        category_labels=None, answer=[answer],
        explanation=dict(concept=concept, steps=steps,
            option_reasons=dict(zip('ABCD', reasons)), evidence=[],
            next_action='Coba jelaskan kembali alasan memilih operasi, lalu periksa satuan dan hasilnya.'),
        source=dict(kind='original', exam_year=None, framework_ref='S2'),
        review=dict(status='author_checked', independent_review='pending',
                    method='authored explanation and independently implemented numeric validator'),
        pool='pilot_daily', ranked_eligible=False,
        verification=dict(rule=rule, inputs=inputs, option_values=[str(v) for v in values])))

add('median', 'data_peluang', 'smp-data',
    'Lama perjalanan delapan murid ke sekolah adalah 12, 18, 15, 20, 14, 16, 25, dan 16 menit. Berapa median lama perjalanan tersebut?',
    [15,16,17,20], 'menit', 'B',
    'Median adalah nilai tengah setelah data diurutkan. Untuk banyak data genap, gunakan rata-rata dua nilai tengah.',
    ['Urutkan data: 12, 14, 15, 16, 16, 18, 20, 25.',
     'Ada delapan data. Dua nilai tengah berada pada urutan ke-4 dan ke-5, keduanya 16.',
     'Median = (16 + 16) : 2 = 16 menit.'],
    ['15 adalah data urutan ke-3, belum berada di tengah.',
     '16 adalah rata-rata data urutan ke-4 dan ke-5 setelah diurutkan.',
     '17 diperoleh jika merata-ratakan 20 dan 14 pada daftar awal yang belum diurutkan.',
     '20 bukan nilai tengah pada daftar yang sudah diurutkan.'],
    'daily_median', [12,18,15,20,14,16,25,16])

add('mean-frequency', 'data_peluang', 'smp-data',
    'Dalam satu minggu, 4 murid membaca masing-masing 1 buku, 3 murid membaca masing-masing 2 buku, dan 3 murid membaca masing-masing 4 buku. Berapa rata-rata banyak buku yang dibaca per murid?',
    ['7/3','22/3','11/5','10/3'], 'buku', 'C',
    'Rata-rata memperhitungkan banyak murid pada setiap kelompok, bukan hanya merata-ratakan tiga jenis jumlah buku.',
    ['Jumlah murid = 4 + 3 + 3 = 10.',
     'Jumlah buku = (4 × 1) + (3 × 2) + (3 × 4) = 22.',
     'Rata-rata = 22 : 10 = 11/5 buku, atau 2,2 buku per murid.'],
    ['7/3 merata-ratakan 1, 2, dan 4 tanpa memperhitungkan jumlah murid tiap kelompok.',
     '22/3 membagi total buku dengan banyak kelompok, bukan banyak murid.',
     '11/5 diperoleh dengan membagi 22 buku oleh 10 murid.',
     '10/3 adalah rata-rata jumlah murid per kelompok, bukan buku per murid.'],
    'daily_weighted_mean', [[1,4],[2,3],[4,3]])

add('scale-area', 'geometri', 'smp-geometri',
    'Sebuah taman berbentuk persegi panjang digambar pada denah berskala 1 : 200. Panjang dan lebarnya pada denah adalah 6 cm dan 4 cm. Berapa luas taman sebenarnya?',
    [24,48,4800,96], 'm²', 'D',
    'Skala panjang diterapkan pada kedua sisi sebelum menghitung luas.',
    ['Panjang sebenarnya = 6 × 200 = 1.200 cm = 12 m.',
     'Lebar sebenarnya = 4 × 200 = 800 cm = 8 m.',
     'Luas taman = 12 × 8 = 96 m².'],
    ['24 adalah hasil perkalian ukuran pada denah, dengan satuan cm².',
     '48 dapat muncul jika hanya salah satu sisi diubah menjadi ukuran sebenarnya.',
     '4800 berasal dari luas denah dikali 200. Faktor skala luas harus diterapkan dua kali dan satuannya diubah.',
     '96 adalah luas dari ukuran sebenarnya 12 m dan 8 m.'],
    'daily_scaled_area', [6,4,200])

add('tank-refill', 'geometri', 'smp-geometri',
    'Bak berbentuk balok memiliki ukuran bagian dalam 80 cm × 50 cm × 60 cm. Air mula-mula setinggi 20 cm. Air ditambahkan dengan debit tetap 10 liter per menit tanpa kebocoran. Berapa menit diperlukan agar tinggi air mencapai 50 cm?',
    [12,20,24,30], 'menit', 'A',
    'Waktu pengisian ditentukan oleh volume air tambahan, bukan seluruh volume bak.',
    ['Kenaikan tinggi air = 50 − 20 = 30 cm.',
     'Volume tambahan = 80 × 50 × 30 = 120.000 cm³ = 120 liter.',
     'Waktu = 120 : 10 = 12 menit. Tinggi akhir 50 cm masih di bawah tinggi bak 60 cm.'],
    ['12 menit cukup untuk menambahkan 120 liter.',
     '20 menit menghitung pengisian dari kosong hingga 50 cm, padahal sudah ada air.',
     '24 menit menghitung kapasitas penuh bak dari keadaan kosong.',
     '30 adalah kenaikan tinggi dalam cm; tinggi tidak langsung menjadi waktu.'],
    'daily_fill_time', [80,50,20,50,10])

add('function-table', 'aljabar', 'smp-aljabar',
    'Biaya sewa sepeda terdiri atas biaya awal dan biaya per jam yang tetap. Sewa 2 jam berbiaya Rp19.000,00, sedangkan 5 jam berbiaya Rp40.000,00. Berapa biaya sewa selama 4 jam?',
    [28000,33000,38000,40000], 'rupiah', 'B',
    'Selisih biaya dibagi selisih waktu menghasilkan tarif per jam; biaya awal dibayar satu kali.',
    ['Selisih biaya = 40.000 − 19.000 = 21.000 rupiah untuk tambahan 3 jam.',
     'Tarif per jam = 21.000 : 3 = 7.000 rupiah. Biaya awal = 19.000 − 2 × 7.000 = 5.000 rupiah.',
     'Biaya 4 jam = 5.000 + 4 × 7.000 = 33.000 rupiah.'],
    ['28.000 hanya menghitung empat jam pemakaian, tanpa biaya awal.',
     '33.000 mencakup biaya awal sekali dan empat jam pemakaian.',
     '38.000 menggandakan biaya dua jam sehingga biaya awal ikut terhitung dua kali.',
     '40.000 adalah biaya lima jam, bukan empat jam.'],
    'daily_affine_cost', [2,19000,5,40000,4])

add('budget-capacity', 'aljabar', 'smp-aljabar',
    'Panitia memiliki anggaran Rp250.000,00 untuk menyewa alat. Biaya pengiriman Rp40.000,00 dan sewa setiap alat Rp18.000,00. Berapa alat paling banyak yang dapat disewa tanpa melebihi anggaran?',
    [10,12,11,13], 'alat', 'C',
    'Jumlah barang harus berupa bilangan bulat yang masih memenuhi batas anggaran.',
    ['Dana setelah pengiriman = 250.000 − 40.000 = 210.000 rupiah.',
     'Sebelas alat memerlukan 11 × 18.000 = 198.000 rupiah; dua belas alat memerlukan 216.000 rupiah.',
     'Total untuk sebelas alat = 238.000 rupiah. Total untuk dua belas alat = 256.000 rupiah, melebihi anggaran. Jadi maksimum 11 alat.'],
    ['10 alat dapat disewa, tetapi belum jumlah maksimum karena 11 alat masih terjangkau.',
     '12 alat menyebabkan total biaya 256.000 rupiah, melewati anggaran.',
     '11 alat memenuhi batas, sedangkan tambahan satu alat tidak lagi terjangkau.',
     '13 alat mengabaikan sebagian kebutuhan biaya pengiriman.'],
    'daily_budget', [250000,40000,18000])

add('power-growth', 'bilangan', 'smp-bilangan',
    'Dalam sebuah model pertumbuhan, jumlah sel mula-mula 75. Jumlahnya menjadi dua kali lipat setiap 20 menit. Jika pola ini tetap, berapa jumlah sel setelah 1 jam?',
    [150,225,450,600], 'sel', 'D',
    'Pelipatan berulang memakai perkalian pada setiap periode, bukan penambahan jumlah awal.',
    ['Satu jam = 60 menit, sehingga ada 60 : 20 = 3 periode pelipatan.',
     'Setelah 20 menit ada 150 sel; setelah 40 menit ada 300 sel; setelah 60 menit ada 600 sel.',
     'Perhitungan ringkasnya 75 × 2³ = 600 sel.'],
    ['150 hanya menghitung satu periode pelipatan.',
     '225 berasal dari 75 × 3, memperlakukan pertumbuhan sebagai penambahan tetap.',
     '450 berasal dari 75 × 2 × 3, bukan tiga perkalian dengan 2.',
     '600 adalah hasil pelipatan sebanyak tiga kali.'],
    'daily_growth', [75,20,60])

add('relative-frequency', 'data_peluang', 'smp-data',
    'Sebuah pemutar berwarna diuji 80 kali. Penunjuk berhenti pada merah 28 kali, biru 32 kali, dan kuning 20 kali. Berdasarkan frekuensi relatif hasil percobaan, berapa perkiraan banyak kemunculan kuning dalam 200 putaran berikutnya?',
    [50,20,40,80], 'kali', 'A',
    'Frekuensi relatif dapat dipakai untuk memperkirakan hasil percobaan berikutnya; hasil sebenarnya tidak harus sama dengan perkiraan.',
    ['Frekuensi relatif kuning = 20 : 80 = 1/4.',
     'Perkiraan pada 200 putaran = 1/4 × 200 = 50 kali.',
     'Angka 50 adalah perkiraan dari data, bukan kepastian hasil setiap rangkaian putaran.'],
    ['50 diperoleh dari frekuensi relatif kuning dikalikan banyak putaran baru.',
     '20 adalah hasil percobaan lama dengan jumlah putaran yang berbeda.',
     '40 dapat muncul jika 20 kemunculan keliru dianggap sebagai 20 persen.',
     '80 adalah banyak putaran awal, bukan perkiraan kemunculan kuning.'],
    'daily_frequency', [20,80,200])

if __name__ == '__main__':
    target = ROOT/'bank/questions.json'
    existing = json.loads(target.read_text(encoding='utf-8'))
    by_id = {q['id']:q for q in existing}
    for row in rows:
        if row['id'] in by_id and by_id[row['id']] != row:
            raise SystemExit('Existing item differs; version it explicitly: '+row['id'])
    added = [q for q in rows if q['id'] not in by_id]
    target.write_text(json.dumps(existing+added, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    doc = ['# Tambahan latihan harian Matematika SMP', '',
           '8 keluarga soal orisinal. Pemeriksaan penulis dan hitungan otomatis; review independen masih menunggu. Tidak masuk ranking.', '']
    for q in rows:
        doc += ['## '+q['id'], '', q['stem'], '']
        doc += [o['id']+'. '+o['text'] for o in q['options']]
        doc += ['', 'Kunci: '+q['answer'][0], '', q['explanation']['concept'], '']
        doc += q['explanation']['steps']
        doc += ['', *[k+': '+v for k,v in q['explanation']['option_reasons'].items()], '']
    (ROOT/'bank/SMP-DAILY-V2.md').write_text('\n'.join(doc).rstrip()+'\n', encoding='utf-8')
    print(json.dumps(dict(added=len(added), total=len(existing)+len(added))))
