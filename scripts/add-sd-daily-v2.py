"""Append eight original SD daily questions; preserve existing IDs and versions."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
rows=[]
def add(slug,domain,module,stem,values,unit,key,concept,steps,reasons,rule,inputs):
    rows.append(dict(id='6-daily-v2-'+slug,version=1,grade=6,subject='matematika',
        family_id='sd-daily-v2-'+slug,competency=domain,module_id=module,
        cognitive_level='aplikasi',difficulty_editorial='sedang',difficulty_calibrated=False,
        type='PG',stem=stem,stimulus_id=None,category_labels=None,
        options=[dict(id=chr(65+i),text=str(v)+' '+unit) for i,v in enumerate(values)],answer=[key],
        explanation=dict(concept=concept,steps=steps,option_reasons=dict(zip('ABCD',reasons)),
            evidence=[],next_action='Coba jelaskan kembali langkahmu, lalu periksa satuan dan hasilnya.'),
        source=dict(kind='original',exam_year=None,framework_ref='S1'),
        review=dict(status='author_checked',independent_review='pending',method='author solution and numeric recomputation'),
        pool='pilot_daily',ranked_eligible=False,
        verification=dict(rule=rule,inputs=inputs,option_values=[str(v) for v in values])))

add('ribbon-sum','bilangan','sd-pecahan',
    'Sinta menyambung pita sepanjang 3/4 meter dan 2/3 meter. Tidak ada bagian pita yang bertumpuk atau terpotong. Berapa panjang pita setelah disambung?',
    ['5/7','17/12','5/12','1/12'],'meter','B',
    'Pecahan dijumlahkan setelah ukuran bagiannya disamakan.',
    ['Samakan penyebut menjadi 12: 3/4 = 9/12 dan 2/3 = 8/12.',
     'Jumlahkan pembilang: 9/12 + 8/12 = 17/12 meter.',
     '17/12 meter sama dengan 1 5/12 meter. Panjangnya lebih dari satu meter.'],
    ['5/7 berasal dari menjumlahkan pembilang dan penyebut langsung; ukuran bagiannya belum disamakan.',
     '17/12 adalah jumlah 9/12 dan 8/12.',
     '5/12 memakai penyebut baru, tetapi pembilangnya belum disesuaikan.',
     '1/12 adalah selisih kedua pita, bukan jumlah panjangnya.'],
    'fraction_sum',[3,4,2,3])

add('recipe-batches','bilangan','sd-pecahan',
    'Satu adonan kue memerlukan 3/5 kg tepung. Ibu membuat empat adonan dengan resep yang sama. Berapa kilogram tepung yang diperlukan?',
    ['7/5','3/20','12/5','12/20'],'kg','C',
    'Bahan untuk beberapa adonan dihitung dengan mengalikan kebutuhan satu adonan.',
    ['Setiap adonan memerlukan 3/5 kg tepung.',
     'Empat adonan memerlukan 3/5 + 3/5 + 3/5 + 3/5 = 12/5 kg.',
     '12/5 kg sama dengan 2 2/5 kg.'],
    ['7/5 berasal dari menambahkan 4 ke pembilang, bukan mengalikan kebutuhan.',
     '3/20 membagi kebutuhan satu adonan menjadi empat bagian.',
     '12/5 adalah empat kali kebutuhan tepung satu adonan.',
     '12/20 sama dengan 3/5, sehingga masih hanya cukup untuk satu adonan.'],
    'fraction_product',[4,3,5])

add('gift-packs','bilangan','sd-faktor',
    'Panitia memiliki 42 pensil dan 30 penghapus. Semua barang akan dibagi ke dalam paket hadiah. Setiap paket berisi jumlah pensil yang sama dan jumlah penghapus yang sama. Berapa paket paling banyak yang dapat dibuat?',
    [5,7,12,6],'paket','D',
    'Jumlah paket harus membagi habis kedua jenis barang. Jumlah terbanyak adalah FPB.',
    ['Faktor 42 adalah 1, 2, 3, 6, 7, 14, 21, dan 42.',
     'Faktor 30 adalah 1, 2, 3, 5, 6, 10, 15, dan 30. Faktor bersama terbesar adalah 6.',
     'Enam paket masing-masing berisi 7 pensil dan 5 penghapus, tanpa sisa.'],
    ['5 tidak membagi habis 42 pensil.',
     '7 membagi habis pensil, tetapi tidak membagi habis 30 penghapus.',
     '12 adalah selisih jumlah barang, bukan pembagi keduanya.',
     '6 membagi habis kedua jumlah dan merupakan pembagi bersama terbesar.'],
    'gcd',[42,30])

add('bus-cycle','bilangan','sd-faktor',
    'Dua bus berangkat bersama dari terminal. Bus A berangkat setiap 12 menit, sedangkan bus B setiap 18 menit. Berapa menit lagi kedua bus akan berangkat bersama untuk pertama kalinya?',
    [36,6,30,72],'menit','A',
    'Kejadian berulang bertemu kembali pada kelipatan bersama terkecil.',
    ['Keberangkatan bus A berikutnya terjadi pada menit ke-12, 24, 36, dan seterusnya.',
     'Keberangkatan bus B berikutnya terjadi pada menit ke-18, 36, 54, dan seterusnya.',
     'Kelipatan bersama pertama adalah 36, jadi keduanya berangkat bersama lagi setelah 36 menit.'],
    ['36 adalah waktu pertemuan pertama kedua jadwal.',
     '6 adalah FPB interval, bukan waktu pertemuan jadwal.',
     '30 menjumlahkan interval; pada menit itu kedua jadwal tidak bertemu.',
     '72 juga kelipatan bersama, tetapi pertemuan sudah terjadi pada menit ke-36.'],
    'lcm',[12,18])

add('garden-border','geometri','sd-bangun',
    'Kebun berbentuk persegi panjang berukuran 14 m × 9 m. Pagar dipasang mengelilingi kebun, kecuali bukaan pintu sepanjang 2 m. Berapa panjang pagar yang diperlukan?',
    [46,44,126,42],'m','B',
    'Pagar mengikuti keliling. Bagian pintu yang tidak dipagari dikurangi dari keliling.',
    ['Keliling kebun = 14 + 9 + 14 + 9 = 46 m.',
     'Bukaan pintu sepanjang 2 m tidak diberi pagar.',
     'Panjang pagar = 46 − 2 = 44 m.'],
    ['46 adalah keliling penuh, belum mengurangi bukaan pintu.',
     '44 adalah keliling setelah dikurangi satu bukaan sepanjang 2 m.',
     '126 adalah luas kebun dalam m², bukan panjang pagar.',
     '42 mengurangi bukaan pintu dua kali, padahal hanya ada satu bukaan.'],
    'daily_fence',[14,9,2])

add('juice-portions','geometri','sd-ukuran',
    'Tersedia 3 liter jus. Jus dituangkan ke gelas yang masing-masing diisi 250 mililiter. Berapa gelas yang dapat diisi jika seluruh jus digunakan tanpa tumpah?',
    [8,10,12,15],'gelas','C',
    'Samakan satuan volume sebelum membagi ke beberapa wadah.',
    ['Satu liter sama dengan 1.000 mililiter. Jadi 3 liter = 3.000 mililiter.',
     'Banyak gelas = 3.000 : 250 = 12.',
     'Periksa: 12 × 250 = 3.000 mililiter, tepat sebanyak jus yang tersedia.'],
    ['8 gelas hanya memakai 2.000 mililiter dan menyisakan satu liter.',
     '10 gelas hanya memakai 2.500 mililiter, sehingga masih ada jus.',
     '12 gelas memakai tepat 3.000 mililiter.',
     '15 gelas memerlukan 3.750 mililiter, melebihi jumlah jus.'],
    'daily_portions',[3,250])

add('library-total','data','sd-data',
    'Buku yang dipinjam dari perpustakaan pada Senin sebanyak 18, Selasa 24, Rabu 15, dan Kamis 23. Berapa jumlah buku yang dipinjam selama empat hari tersebut?',
    [42,62,81,80],'buku','D',
    'Jumlah seluruh data diperoleh dengan menjumlahkan setiap kelompok tepat satu kali.',
    ['Jumlah Senin dan Selasa = 18 + 24 = 42 buku.',
     'Jumlah Rabu dan Kamis = 15 + 23 = 38 buku.',
     'Total empat hari = 42 + 38 = 80 buku.'],
    ['42 hanya menjumlahkan Senin dan Selasa.',
     '62 melewatkan data Senin sebanyak 18 buku.',
     '81 dapat muncul jika data Kamis terbaca 24, padahal tertulis 23.',
     '80 menjumlahkan keempat hari tepat satu kali.'],
    'daily_sum',[18,24,15,23])

add('floor-tiles','geometri','sd-bangun',
    'Lantai berbentuk persegi panjang berukuran 4 m × 3 m. Lantai ditutup penuh dengan ubin persegi bersisi 50 cm. Ubin dipasang tanpa celah dan tanpa dipotong. Berapa ubin yang diperlukan?',
    [48,24,12,96],'ubin','A',
    'Hitung banyak ubin sepanjang dan selebar lantai setelah menyamakan satuan.',
    ['Ukuran lantai = 400 cm × 300 cm.',
     'Sepanjang lantai terdapat 400 : 50 = 8 ubin. Selebar lantai terdapat 300 : 50 = 6 ubin.',
     'Jumlah ubin = 8 × 6 = 48.'],
    ['48 adalah delapan baris yang masing-masing berisi enam ubin.',
     '24 dapat muncul jika luas lantai dibagi panjang sisi ubin, bukan luas ubin.',
     '12 adalah luas lantai dalam m²; luas satu ubin bukan 1 m².',
     '96 menghitung jumlah ubin dua kali.'],
    'daily_tiles',[400,300,50])

if __name__=='__main__':
    target=ROOT/'bank/questions.json'
    existing=json.loads(target.read_text(encoding='utf-8')); by_id={q['id']:q for q in existing}
    for q in rows:
        if q['id'] in by_id and by_id[q['id']]!=q:
            raise SystemExit('Version existing item explicitly: '+q['id'])
    added=[q for q in rows if q['id'] not in by_id]
    target.write_text(json.dumps(existing+added,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    doc=['# Tambahan latihan harian Matematika SD','',
         'Delapan keluarga soal orisinal; pemeriksaan penulis dan hitungan otomatis. Review independen menunggu. Tidak masuk ranking.','']
    for q in rows:
        doc += ['## '+q['id'],'',q['stem'],'']+[o['id']+'. '+o['text'] for o in q['options']]
        doc += ['', 'Kunci: '+q['answer'][0],'',q['explanation']['concept'],'']+q['explanation']['steps']
        doc += ['',*[k+': '+v for k,v in q['explanation']['option_reasons'].items()],'']
    (ROOT/'bank/SD-DAILY-V2.md').write_text('\n'.join(doc).rstrip()+'\n',encoding='utf-8')
    print(json.dumps(dict(added=len(added),total=len(existing)+len(added))))
