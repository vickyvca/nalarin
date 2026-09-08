"""Build original pilot content; no network or external packages."""
import json
import random
import sys
from fractions import Fraction as F
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / 'bank'
BANK.mkdir(exist_ok=True)
if (BANK/'questions.json').exists() and '--reset-pilot' not in sys.argv:
    existing=json.loads((BANK/'questions.json').read_text(encoding='utf-8'))
    if any(q.get('review',{}).get('reviewed_at') for q in existing):
        raise SystemExit('Bank sudah direview. Generator pilot dihentikan agar hasil review tidak tertimpa. --reset-pilot hanya untuk reset yang disengaja.')
QUESTIONS = []

def write(name, value):
    (BANK / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def val(x):
    return str(F(x))

def add(grade, family, topic, module, level, kind, stem, options, answer,
        concept, steps, reasons, verification=None, stimulus=None, evidence=None):
    subject = 'bahasa_indonesia' if stimulus else 'matematika'
    prefix = f'{grade}-' + ('bi' if stimulus else 'mtk')
    n = 1 + sum(q['id'].startswith(prefix+'-') for q in QUESTIONS)
    qid = f'{prefix}-{n:03d}'
    labels = list('ABCDEFGH')[:len(options)]
    opts = [{'id': k, 'text': t} for k, t in zip(labels, options)]
    key = answer
    why = dict(zip(labels, reasons))
    if kind != 'PGK_CATEGORY':
        correct = [labels[i] for i in answer]
        # Re-label AFTER shuffle so neither visible letters nor option IDs reveal the key.
        random.Random(qid).shuffle(opts)
        mapping = {o['id']: labels[i] for i,o in enumerate(opts)}
        opts = [{'id': mapping[o['id']], 'text': o['text']} for o in opts]
        key = [mapping[c] for c in correct]
        why = {mapping[c]: reason for c,reason in why.items()}
        if verification is not None:
            verification = dict(verification, authored_to_presented_ids=mapping)
    QUESTIONS.append({
        'id': qid, 'version': 1, 'grade': grade, 'subject': subject,
        'family_id': family, 'competency': topic, 'module_id': module,
        'cognitive_level': level, 'difficulty_editorial': 'sedang' if level != 'pemahaman' else 'mudah',
        'difficulty_calibrated': False, 'type': kind, 'stem': stem,
        'stimulus_id': stimulus, 'options': opts, 'category_labels': ['Benar', 'Salah'] if kind == 'PGK_CATEGORY' else None,
        'answer': key, 'explanation': {'concept': concept, 'steps': steps, 'option_reasons': why,
        'evidence': evidence or [], 'next_action': 'Buka modul terkait, lalu coba soal baru dengan konsep yang sama.'},
        'source': {'kind': 'original', 'exam_year': None, 'framework_ref': ('S3' if grade == 6 else 'S4') if stimulus else ('S1' if grade == 6 else 'S2')},
        'review': {'status': 'pilot_ai_authored', 'human_review_required': False,
                   'semantic_review': 'author_review_only', 'independent_mitsuko_review': 'pending'},
        'pool': 'pilot_daily', 'ranked_eligible': False, 'verification': verification,
    })

def pg(g, fam, topic, mod, level, stem, nums, unit, concept, steps, reasons, verification):
    add(g, fam, topic, mod, level, 'PG', stem,
        [f'{x}{unit}' for x in nums], [0], concept, steps, reasons,
        dict(verification, option_values=[val(x) for x in nums]))

for k in range(2):
    # SD: ten distinct families, two parameter variants each.
    a,b,c,d = [(1,2,1,4),(2,3,1,6)][k]
    result = F(a,b)+F(c,d)
    nums = [result,F(a+c,b+d),F(a+c,b),F(a,b)*F(c,d)]
    pg(6,'sd-pecahan-jumlah','bilangan','sd-pecahan','aplikasi',
       f'Ibu mempunyai {a}/{b} kg tepung. Ibu membeli lagi {c}/{d} kg. Berapa kilogram tepung Ibu sekarang?',
       nums,' kg','Pecahan dijumlahkan setelah ukuran bagiannya sama.',
       [f'Samakan penyebut {b} dan {d} menjadi {d}.', f'{a}/{b} = {a*(d//b)}/{d}.', f'Jumlahnya {a*(d//b)}/{d} + {c}/{d} = {result} kg.'],
       ['Pembilang dijumlahkan setelah penyebut disamakan.','Menjumlahkan penyebut mengubah ukuran bagian.','Pilihan ini tidak sama dengan hasil penjumlahan. Samakan penyebut kedua pecahan, lalu jumlahkan pembilangnya.','Perkalian pecahan tidak sesuai dengan kegiatan menambah tepung.'],
       {'rule':'fraction_sum','inputs':[a,b,c,d]})
    n,a,b = [(3,2,5),(4,3,8)][k]
    nums=[F(n*a,b),F(n+a,b),F(a,n*b),F(n*a,n*b)]
    pg(6,'sd-pecahan-kali','bilangan','sd-pecahan','aplikasi',
       f'Setiap hiasan membutuhkan pita {a}/{b} meter. Rani membuat {n} hiasan. Berapa meter pita yang dibutuhkan?',nums,' meter',
       'Perkalian bilangan asli dengan pecahan berarti penjumlahan pecahan yang sama berulang kali.',
       [f'Ada {n} potong, masing-masing {a}/{b} meter.',f'Jumlah panjang = {n} × {a}/{b} = {F(n*a,b)} meter.'],
       ['Jumlah potongan dikalikan panjang satu potong.','Jumlah potongan tidak ditambahkan ke pembilang.','Membesarkan penyebut justru membuat satu bagian lebih kecil.','Mengalikan pembilang dan penyebut sama besar hanya menghasilkan pecahan senilai panjang satu potong.'],
       {'rule':'fraction_product','inputs':[n,a,b]})
    a,b=[(3,4),(2,5)][k]
    fractions=[F(2*a,2*b),F(3*a,3*b),F(a,2*b),F(b,a)]
    add(6,'sd-pecahan-senilai','bilangan','sd-pecahan','pemahaman','PGK_MCMA',
        f'Pilih semua pecahan yang senilai dengan {a}/{b}. Jawaban benar lebih dari satu.',
        [f'{2*a}/{2*b}',f'{3*a}/{3*b}',f'{a}/{2*b}',f'{b}/{a}'],[0,1],
        'Pecahan senilai diperoleh dengan mengalikan pembilang dan penyebut dengan bilangan yang sama.',
        [f'Kalikan pembilang dan penyebut {a}/{b} dengan 2 atau 3.', 'Perbandingan nilainya tetap, walaupun jumlah bagian berubah.'],
        ['Kedua bagian dikalikan 2.','Kedua bagian dikalikan 3.','Hanya penyebut yang dikalikan 2; nilainya menjadi separuh.','Pembilang dan penyebut dibalik; nilainya berubah.'],
        {'rule':'equivalent','inputs':[a,b],'option_values':[str(x) for x in fractions]})
    x,y,g=[(24,36,12),(30,45,15)][k]
    nums=[g,g//3,g*2,x+y]
    pg(6,'sd-fpb-paket','bilangan','sd-faktor','penalaran',
       f'Ada {x} pensil dan {y} penghapus. Semuanya dibagi menjadi paket sebanyak mungkin. Setiap paket mempunyai jumlah pensil yang sama dan jumlah penghapus yang sama. Berapa paket yang dapat dibuat?',nums,' paket',
       'Jumlah paket harus membagi kedua jumlah barang tanpa sisa. Cari faktor persekutuan terbesar.',
       [f'{x} ÷ {g} = {x//g} pensil per paket.',f'{y} ÷ {g} = {y//g} penghapus per paket.',f'{g} adalah pembagi bersama terbesar, jadi dapat dibuat {g} paket.'],
       ['Membagi kedua jumlah tanpa sisa dan menghasilkan paket terbanyak.','Paket dapat dibuat, tetapi jumlahnya belum paling banyak.','Angka ini tidak membagi kedua jumlah barang tanpa sisa.','Menjumlahkan barang tidak menentukan banyak paket dengan isi seragam.'],
       {'rule':'gcd','inputs':[x,y]})
    x,y,l=[(6,8,24),(8,12,24)][k]
    nums=[l,x+y,abs(x-y),x*y]
    pg(6,'sd-kpk-jadwal','bilangan','sd-faktor','aplikasi',
       f'Dua lampu menyala berkala. Lampu merah menyala setiap {x} menit dan lampu biru setiap {y} menit. Keduanya menyala bersama sekarang. Berapa menit lagi keduanya pertama kali menyala bersama?',nums,' menit',
       'Waktu bertemu kembali adalah kelipatan persekutuan terkecil dari kedua selang.',
       [f'Kelipatan {x}: '+', '.join(str(x*i) for i in range(1,l//x+1))+'.',f'Kelipatan {y}: '+', '.join(str(y*i) for i in range(1,l//y+1))+'.',f'Pertemuan positif paling awal adalah {l} menit.'],
       ['Ini kelipatan positif bersama yang paling kecil.','Menjumlahkan selang tidak memastikan kedua lampu menyala.','Selisih selang bukan waktu pertemuan.','Hasil kali adalah kelipatan bersama, tetapi bukan yang pertama.'],
       {'rule':'lcm','inputs':[x,y]})
    p,l=[(12,8),(15,6)][k]
    nums=[p*l,2*(p+l),p+l,p*p]
    pg(6,'sd-luas-persegi-panjang','geometri_pengukuran','sd-bangun','aplikasi',
       f'Kebun berbentuk persegi panjang berukuran {p} m × {l} m. Berapa luas kebun itu?',nums,' m²',
       'Luas menghitung banyak satuan persegi yang menutupi permukaan.',
       [f'Setiap baris sepanjang {p} m.',f'Ada lebar {l} m, sehingga luas = {p} × {l} = {p*l} m².'],
       ['Panjang dikali lebar menghasilkan luas.','Ini angka keliling; satuannya meter, bukan meter persegi.','Panjang ditambah lebar belum menghitung luas.','Kebun bukan persegi dengan kedua sisi sama panjang.'],
       {'rule':'area','inputs':[p,l]})
    p,l,t=[(12,5,4),(10,6,5)][k]
    v=p*l*t
    add(6,'sd-volume-balok','geometri_pengukuran','sd-ukuran','aplikasi','PGK_CATEGORY',
        f'Sebuah wadah berbentuk balok mempunyai ukuran bagian dalam {p} cm × {l} cm × {t} cm. Tentukan Benar atau Salah.',
        [f'Volume wadah adalah {v} cm³.',f'Wadah dapat menampung {v} liter.',f'Jika tingginya menjadi dua kali semula, volumenya menjadi {2*v} cm³.'],
        {'A':'Benar','B':'Salah','C':'Benar'},'Volume balok adalah panjang × lebar × tinggi; 1 liter = 1.000 cm³.',
        [f'Volume = {p} × {l} × {t} = {v} cm³.',f'Dalam liter, {v}/1.000 = {v/1000:g} liter.',f'Menggandakan tinggi menggandakan volume menjadi {2*v} cm³.'],
        ['Hasil perkalian ketiga ukuran tepat.','Bilangan cm³ harus dibagi 1.000 untuk menjadi liter.','Dua ukuran lain tetap sehingga volume menjadi dua kali semula.'],
        {'rule':'volume_category','inputs':[p,l,t],'assertions':[v,v,2*v]})
    h,m,dh,dm=[(7,35,1,45),(8,40,2,35)][k]
    total=h*60+m+dh*60+dm
    nums=[total,total-60,total+20,total+60]
    displays=[f'{z//60:02d}.{z%60:02d}' for z in nums]
    add(6,'sd-waktu-selesai','geometri_pengukuran','sd-ukuran','aplikasi','PG',
        f'Latihan tari dimulai pukul {h:02d}.{m:02d}. Latihan berlangsung {dh} jam {dm} menit. Pukul berapa latihan selesai?',displays,[0],
        'Setiap 60 menit diubah menjadi satu jam.',
        [f'Tambahkan {dh} jam: pukul {h+dh:02d}.{m:02d}.',f'Tambahkan lagi {dm} menit. Total menit {m+dm}, sehingga selesai pukul {displays[0]}.'],
        ['Penambahan jam dan pengubahan menit tepat.','Ada satu jam yang belum dihitung.','Penambahan menit tidak sesuai durasi yang diberikan.','Ada satu jam tambahan yang tidak termasuk durasi.'],
        {'rule':'time','inputs':[h,m,dh,dm],'option_values':[str(z) for z in nums]})
    data=[12,18,15,9] if k==0 else [16,24,20,12]
    a,b,c,d=data
    add(6,'sd-data-peminjaman','data','sd-data','aplikasi','PGK_MCMA',
        f'Peminjaman buku: Senin {a}, Selasa {b}, Rabu {c}, Kamis {d}. Pilih semua pernyataan benar.',
        [f'Total peminjaman empat hari adalah {sum(data)} buku.','Selasa memiliki peminjaman terbanyak.','Peminjaman Senin lebih banyak daripada Rabu.','Peminjaman Kamis lebih banyak daripada Selasa.'],[0,1],
        'Baca label hari dan nilainya sebelum membandingkan atau menjumlahkan data.',
        [f'Jumlah = {a} + {b} + {c} + {d} = {sum(data)}.',f'Nilai terbesar {b} ada pada Selasa.',f'Senin {a} < Rabu {c}, dan Kamis {d} < Selasa {b}.'],
        ['Seluruh nilai empat hari sudah dijumlahkan.','Nilainya lebih tinggi daripada tiga hari lainnya.','Angka Senin justru lebih kecil daripada Rabu.','Angka Kamis justru lebih kecil daripada Selasa.'],
        {'rule':'data_mcma','inputs':data,'total_claim':sum(data)})
    p,l=[(16,9),(14,8)][k]
    add(6,'sd-luas-keliling','geometri_pengukuran','sd-bangun','penalaran','PGK_CATEGORY',
        f'Lapangan berbentuk persegi panjang memiliki panjang {p} m dan lebar {l} m. Tentukan Benar atau Salah.',
        [f'Kelilingnya {2*(p+l)} m.',f'Luasnya {p*l+1} m².',f'Panjangnya {p-l} m lebih besar daripada lebarnya.'],
        {'A':'Benar','B':'Salah','C':'Benar'},'Keliling mengukur tepi, sedangkan luas mengukur permukaan.',
        [f'Keliling = {p} + {l} + {p} + {l} = {2*(p+l)} m.',f'Luas = {p} × {l} = {p*l} m².',f'Selisih sisi = {p} − {l} = {p-l} m.'],
        ['Keempat sisi sudah dijumlahkan.','Luas yang benar kurang satu dari pernyataan ini.','Pengurangan panjang dan lebar sesuai.'],
        {'rule':'rectangle_category','inputs':[p,l],'assertions':[2*(p+l),p*l+1,p-l]})

for k in range(2):
    workers,days,new=[(6,12,8),(10,12,15)][k]
    correct=workers*days//new
    nums=[correct,days,days*new//workers,correct+1]
    pg(9,'smp-rasio-pekerja','bilangan','smp-bilangan','aplikasi',
       f'Suatu pekerjaan selesai oleh {workers} pekerja dalam {days} hari. Jika dikerjakan {new} pekerja dengan kemampuan sama, berapa hari yang dibutuhkan? Anggap jam kerja per hari tetap.',nums,' hari',
       'Untuk pekerjaan tetap, banyak pekerja dan waktu berbanding terbalik.',
       [f'Beban kerja = {workers} × {days} = {workers*days} hari-orang.',f'Waktu baru = {workers*days} ÷ {new} = {correct} hari.'],
       ['Hasil kali jumlah pekerja dan hari tetap.','Waktu berkurang karena pekerja bertambah.','Ini memperlakukan hubungan sebagai perbandingan senilai.','Satu hari tambahan membuat beban kerja melewati kebutuhan.'],
       {'rule':'inverse_ratio','inputs':[workers,days,new]})
    price,pct=[(150000,20),(200000,15)][k]
    result=price*(100-pct)//100
    nums=[result,price*pct//100,price,price+price*pct//100]
    pg(9,'smp-persen-diskon','bilangan','smp-bilangan','aplikasi',
       f'Harga tas Rp{price:,} mendapat diskon {pct}%. Berapa harga yang dibayar tanpa biaya tambahan?'.replace(',','.'),nums,' rupiah',
       'Harga akhir diperoleh dengan mengurangi harga awal sebesar nilai diskonnya.',
       [f'Diskon = {pct}/100 × {price} = {price*pct//100} rupiah.',f'Harga akhir = {price} − {price*pct//100} = {result} rupiah.'],
       ['Ini harga setelah diskon dikurangi.','Ini besar potongan, bukan harga akhir.','Ini harga sebelum mendapat potongan.','Diskon mengurangi, bukan menambah harga.'],
       {'rule':'discount','inputs':[price,pct]})
    a,b,c,x=[(3,7,31,8),(5,4,49,9)][k]
    nums=[x,F(c+b,a),c-b,c]
    pg(9,'smp-persamaan-linear','aljabar','smp-aljabar','pemahaman',
       f'Nilai x yang memenuhi {a}x + {b} = {c} adalah ...',nums,'',
       'Operasi yang sama pada kedua ruas menjaga persamaan tetap setara.',
       [f'Kurangi kedua ruas dengan {b}: {a}x = {c-b}.',f'Bagi kedua ruas dengan {a}: x = {x}.',f'Cek: {a} × {x} + {b} = {c}.'],
       ['Substitusi menghasilkan persamaan benar.','Konstanta seharusnya dikurangkan dari ruas kanan.','Hasil ini masih harus dibagi koefisien x.','Ruas kanan bukan otomatis nilai x.'],
       {'rule':'linear','inputs':[a,b,c]})
    pen,book=[(3000,5000),(4000,6000)][k]
    u,v=2*pen+book,pen+2*book
    target=3*pen+2*book
    nums=[target,u+v,pen+book,3*book+2*pen]
    pg(9,'smp-spldv-belanja','aljabar','smp-aljabar','penalaran',
       f'Dua pulpen dan satu buku berharga {u} rupiah. Satu pulpen dan dua buku berharga {v} rupiah. Berapa harga tiga pulpen dan dua buku?',nums,' rupiah',
       'Dua informasi harga dapat diubah menjadi dua persamaan dengan dua variabel.',
       [f'Misalkan p harga pulpen dan b harga buku: 2p+b={u}, p+2b={v}.',f'Kalikan persamaan pertama dengan 2 lalu kurangi persamaan kedua: 3p={2*u-v}, jadi p={pen}.',f'b={u}−2×{pen}={book}.',f'3p+2b=3×{pen}+2×{book}={target}.'],
       ['Jumlah setiap barang dikalikan harga satuannya.','Menjumlah kedua paket menghasilkan tiga pulpen dan tiga buku.','Ini hanya harga satu pulpen dan satu buku.','Banyak buku dan pulpen tertukar.'],
       {'rule':'spldv','inputs':[u,v]})
    a,d,n=[(5,3,10),(4,5,8)][k]
    result=a+(n-1)*d
    nums=[result,a+n*d,n*d,a+(n-2)*d]
    pg(9,'smp-barisan-aritmetika','aljabar','smp-aljabar','aplikasi',
       f'Barisan mempunyai beda tetap: {a}, {a+d}, {a+2*d}, .... Berapa suku ke-{n}?',nums,'',
       'Dari suku pertama ke suku ke-n terdapat n−1 langkah penambahan.',
       [f'Suku pertama {a}, beda {d}.',f'U{n}={a}+({n}−1)×{d}={result}.'],
       ['Jumlah langkah dari suku pertama sudah tepat.','Menggunakan n langkah menghasilkan satu suku terlalu jauh.','Suku pertama belum diperhitungkan dengan tepat.','Ini suku sebelum yang diminta.'],
       {'rule':'sequence','inputs':[a,d,n]})
    a,b,h=[(5,12,13),(8,15,17)][k]
    nums=[h,a+b,b-a,a*a+b*b]
    pg(9,'smp-pythagoras','geometri_pengukuran','smp-geometri','aplikasi',
       f'Segitiga siku-siku memiliki dua sisi yang saling tegak lurus sepanjang {a} cm dan {b} cm. Berapa panjang sisi miringnya?',nums,' cm',
       'Kuadrat sisi miring sama dengan jumlah kuadrat kedua sisi siku-siku.',
       [f'c²={a}²+{b}²={a*a}+{b*b}={h*h}.',f'Panjang positif c=√{h*h}={h} cm.'],
       ['Kuadrat angka ini sama dengan jumlah kuadrat kedua sisi.','Panjang sisi miring bukan jumlah dua sisi lainnya.','Selisih panjang bukan rumus Pythagoras.','Ini kuadrat panjang sisi miring; masih perlu akar kuadrat.'],
       {'rule':'pythagoras','inputs':[a,b]})
    data,mean=[([6,8,10],9),([7,9,11],10)][k]
    result=mean*4-sum(data)
    nums=[result,mean,sum(data),mean*4]
    pg(9,'smp-rata-rata-hilang','data_peluang','smp-data','penalaran',
       f'Rata-rata empat bilangan adalah {mean}. Tiga bilangannya {data[0]}, {data[1]}, dan {data[2]}. Berapa bilangan keempat?',nums,'',
       'Jumlah seluruh data sama dengan rata-rata dikali banyak data.',
       [f'Jumlah empat data={mean}×4={mean*4}.',f'Jumlah tiga data={sum(data)}.',f'Data keempat={mean*4}−{sum(data)}={result}.'],
       ['Data ini melengkapi jumlah agar rata-ratanya sesuai.','Rata-rata tidak harus sama dengan salah satu data.','Ini jumlah tiga data yang sudah diketahui.','Ini jumlah semua data, bukan data keempat.'],
       {'rule':'missing_mean','inputs':data+[mean]})
    red,blue,green=[(3,2,1),(4,3,1)][k]
    total=red+blue+green
    claims=[F(red,total),F(blue,total),F(2*green,total),F(red+green,total)]
    add(9,'smp-peluang-bola','data_peluang','smp-data','aplikasi','PGK_MCMA',
        f'Kantong berisi {red} bola merah, {blue} biru, dan {green} hijau. Satu bola diambil secara acak; setiap bola memiliki peluang terambil sama. Pilih semua pernyataan benar.',
        [f'Peluang merah adalah {claims[0]}.',f'Peluang biru adalah {claims[1]}.',f'Peluang hijau adalah {claims[2]}.',f'Peluang bukan merah adalah {claims[3]}.'],[0,1],
        'Peluang adalah banyak hasil yang diinginkan dibagi semua hasil yang sama mungkin.',
        [f'Total bola={total}.',f'Peluang merah={red}/{total}, biru={blue}/{total}, hijau={green}/{total}.',f'Bukan merah berarti biru atau hijau: {blue+green}/{total}.'],
        ['Pembilang menghitung bola merah.','Pembilang menghitung bola biru.','Jumlah bola hijau pada pembilang seharusnya tidak digandakan.','Bukan merah mencakup biru dan hijau, bukan merah dan hijau.'],
        {'rule':'probability','inputs':[red,blue,green],'claims':[str(x) for x in claims]})
    x,y,dx,dy=[(2,-3,4,5),(-1,4,3,-2)][k]
    add(9,'smp-transformasi','geometri_pengukuran','smp-geometri','pemahaman','PGK_CATEGORY',
        f'Titik P({x}, {y}) ditranslasi dengan vektor ({dx}, {dy}). Pernyataan pencerminan di bawah merujuk titik P semula. Tentukan Benar atau Salah.',
        [f'Koordinat x hasil translasi adalah {x+dx}.',f'Koordinat y hasil translasi adalah {y-dy}.',f'Pencerminan P semula terhadap sumbu x menghasilkan ({x}, {-y}).'],
        {'A':'Benar','B':'Salah','C':'Benar'},'Translasi menambahkan vektor; pencerminan terhadap sumbu x mengubah tanda koordinat y.',
        [f'Translasi P menghasilkan ({x}+({dx}), {y}+({dy}))=({x+dx}, {y+dy}).',f'Pencerminan P semula terhadap sumbu x: ({x}, {-y}).'],
        ['Komponen x dijumlahkan dengan perpindahan x.','Perpindahan y harus ditambahkan, bukan dikurangkan.','Koordinat x tetap dan y berubah tanda.'],
        {'rule':'transform_category','inputs':[x,y,dx,dy],'assertions':[x+dx,y-dy,[x,-y]]})
    a,b,c,bound=[(2,3,15,6),(3,2,23,7)][k]
    xs=[bound-1,bound,bound+1,bound+2]
    add(9,'smp-pertidaksamaan','aljabar','smp-aljabar','pemahaman','PGK_MCMA',
        f'Pilih semua nilai x yang memenuhi {a}x + {b} ≤ {c}. Jawaban benar lebih dari satu.',[f'x = {x}' for x in xs],[0,1],
        'Tanda ≤ berarti kurang dari atau sama dengan. Membagi dengan bilangan positif tidak membalik tanda.',
        [f'{a}x ≤ {c-b}.',f'x ≤ {bound}.',f'Dari pilihan yang ada, {xs[0]} dan {xs[1]} memenuhi.'],
        [f'Substitusi menghasilkan {a*xs[0]+b}, kurang dari {c}.',f'Substitusi menghasilkan {c}, tepat sama sehingga masih memenuhi.',f'Substitusi menghasilkan {a*xs[2]+b}, melebihi {c}.',f'Substitusi menghasilkan {a*xs[3]+b}, melebihi {c}.'],
        {'rule':'inequality','inputs':[a,b,c],'option_values':[str(x) for x in xs]})

# Hand-authored reading content and modules live in separate source files.
reading = json.loads((ROOT / 'content/reading.json').read_text(encoding='utf-8'))
for passage in reading:
    for q in passage['questions']:
        add(passage['grade'], passage['id'], q['competency'], f"{passage['grade']}-bi-{q['competency']}",
            q['level'], q['type'], q['stem'], q['options'], q['answer'],
            q['concept'], q['steps'], q['reasons'], stimulus=passage['id'], evidence=q['evidence'])

passages = [{k:v for k,v in p.items() if k != 'questions'} for p in reading]
modules = json.loads((ROOT / 'content/modules.json').read_text(encoding='utf-8'))
write('questions.json', QUESTIONS)
write('passages.json', passages)
write('modules.json', modules)

by_passage={p['id']:p for p in passages}
lines=['# Bank soal awal TKA MDC', '', 'Konten orisinal untuk pilot latihan. Bukan soal ujian pemerintah. Semua butir belum terkalibrasi dan belum memenuhi gerbang bank leaderboard.', '', f'Total: {len(QUESTIONS)} soal. Kunci dalam dokumen ini hanya untuk persiapan/admin.', '']
seen=set()
for q in QUESTIONS:
    sid=q['stimulus_id']
    if sid and sid not in seen:
        p=by_passage[sid]
        lines += [f"## Bacaan {sid}: {p['title']}", '', p['text'], '']
        seen.add(sid)
    lines += [f"### {q['id']} — Kelas {q['grade']} — {q['type']}", '', q['stem'], '']
    lines += [f"- {o['id']}. {o['text']}" for o in q['options']]
    lines += ['', '**Kunci:** '+json.dumps(q['answer'],ensure_ascii=False), '', '**Konsep:** '+q['explanation']['concept'], '']
    lines += [f'{i}. {s}' for i,s in enumerate(q['explanation']['steps'],1)]
    lines += ['', '**Alasan pilihan/pernyataan:**', '']+[f'- {key}: {reason}' for key,reason in q['explanation']['option_reasons'].items()]
    if q['explanation']['evidence']:
        lines += ['', '**Bukti bacaan:**']+['- '+e for e in q['explanation']['evidence']]
    lines += ['', f"Modul: `{q['module_id']}`. Keluarga soal: `{q['family_id']}`.", '']
(BANK/'BANK-SOAL.md').write_text('\n'.join(lines),encoding='utf-8')
mlines=['# Modul singkat TKA MDC', '', 'Buka sesuai kebutuhan. Perkiraan 3–5 menit mencakup membaca, mencoba contoh, dan memeriksa ulang.', '']
for m in modules:
    mlines += [f"## {m['id']} — {m['title']}", '', '**Tujuan:** '+m['objective'], '']
    mlines += ['- '+s for s in m['key_points']]
    mlines += ['', '**Contoh:** '+m['example']['question'], '']+[f'{i}. {s}' for i,s in enumerate(m['example']['steps'],1)]
    mlines += ['', '**Sering keliru:** '+m['common_mistake'], '', '**Lanjut:** '+m['next_action'], '']
(BANK/'MODUL.md').write_text('\n'.join(mlines),encoding='utf-8')
print(json.dumps({'questions':len(QUESTIONS),'passages':len(passages),'modules':len(modules)},ensure_ascii=False))
