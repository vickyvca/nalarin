"""Build a deterministic ranking candidate bank.

The seed is intentionally separate from the 80-question daily pilot. Math values
are varied by seed; reading uses new stimuli. Luna reviews this candidate bank
before it is merged into the live bank.
"""
import json, math, random
from fractions import Fraction
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BANK=ROOT/'bank'
daily=json.loads((BANK/'questions.json').read_text(encoding='utf-8'))
modules=json.loads((BANK/'modules.json').read_text(encoding='utf-8'))
rank_q=[];rank_p=[]

def fmt(x):
    if isinstance(x,Fraction): return str(x.numerator) if x.denominator==1 else f'{x.numerator}/{x.denominator}'
    if isinstance(x,float):
        if x.is_integer(): return str(int(x))
        return f'{x:.2f}'.replace('.',',').rstrip('0').rstrip(',')
    return str(x)

def money(x):
    return f'Rp{x:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')

def list_id(values):
    values=[fmt(value) for value in values]
    if len(values)==1: return values[0]
    return ', '.join(values[:-1])+', dan '+values[-1]

def module_for(grade,subject,comp):
    if subject=='bahasa_indonesia': return f'{grade}-bi-{"tekstual" if comp=="tekstual" else "inferensial" if comp=="inferensial" else "evaluasi"}'
    return {6:{'bilangan':'sd-pecahan','geometri':'sd-bangun','data':'sd-data'},9:{'bilangan':'smp-bilangan','aljabar':'smp-aljabar','geometri':'smp-geometri','data_peluang':'smp-data'}}[grade][comp]

def review_pending():
    return {'status':'ranking_luna_pending','human_review_required':False,'independent_mitsuko_review':'pending'}

def add_question(*,grade,subject,pack,n,comp,typ,cognitive,difficulty,stem,options,answer,concept,steps,reasons,evidence=None,stimulus=None,verification=None,family=None):
    qid=f'r{grade}-{"mtk" if subject=="matematika" else "bi"}-{pack}-{n:02d}'
    old=list(options); new=old[:]; random.Random(qid).shuffle(new); labels=[chr(65+i) for i in range(len(old))]; remap=dict(zip(new,labels))
    options={remap[k]:options[k] for k in old}; reasons={remap[k]:v for k,v in reasons.items()}
    if isinstance(answer,list): answer=[remap[k] for k in answer]
    else: answer={remap[k]:v for k,v in answer.items()}
    rank_q.append({'id':qid,'version':1,'grade':grade,'subject':subject,'family_id':family or qid,'competency':comp,'module_id':module_for(grade,subject,comp),'cognitive_level':cognitive,'difficulty_editorial':difficulty,'difficulty_calibrated':False,'type':typ,'stem':stem,'stimulus_id':stimulus,'options':[{'id':k,'text':v} for k,v in options.items()],'category_labels':['Benar','Salah'] if typ=='PGK_CATEGORY' else None,'answer':answer,'explanation':{'concept':concept,'steps':steps,'option_reasons':reasons,'evidence':evidence or [],'next_action':'Buka modul terkait, lalu coba soal lain dengan konsep yang sama.'},'source':{'kind':'original','exam_year':None,'framework_ref':('S1' if grade==6 else 'S2') if subject=='matematika' else ('S3' if grade==6 else 'S4')},'review':review_pending(),'pool':'ranking_candidate','ranked_eligible':False,'pack_id':f'r{grade}-{"mtk" if subject=="matematika" else "bi"}-{pack}','verification':verification})

def math_base(grade,comp,seed):
    k=seed%4
    if grade==6 and comp=='bilangan':
        if k==0:
            a=1+seed%5; b=2+(seed//3)%2*2; c=1+(seed//5)%5; d=4; val=Fraction(a,b)+Fraction(c,d)
            return (f'Rani memiliki {a}/{b} kg tepung dan menambah {c}/{d} kg. Berapa kg tepung sekarang?',val,[val+Fraction(1,4),val-Fraction(1,4),Fraction(a+c,b+d)],'Menjumlahkan pecahan','Samakan penyebutnya.','Tambahkan pembilang setelah penyebut sama.')
        if k==1:
            total=200+(seed%8)*40; pct=10+(seed//3%5)*5; val=total*pct//100
            return (f'Sebuah koperasi memiliki {total} buku. Sebanyak {pct}% dipinjam. Berapa buku yang dipinjam?',val,[val+10,val-10,total-pct,pct], 'Persentase dari jumlah','Ubah persentase menjadi pecahan per seratus.','Kalikan pecahan persentase dengan jumlah awal.')
        if k==2:
            a=12+(seed%7)*6; b=18+(seed//3%8)*6; val=math.gcd(a,b)
            return (f'{a} roti dan {b} kotak susu akan dibagi ke paket yang sama banyak tanpa sisa. Paket terbanyak berjumlah berapa?',val,[val+1,val-1,a//2,b//2],'FPB untuk pembagian sama banyak','Cari faktor yang membagi kedua jumlah tanpa sisa.','Pilih faktor bersama yang paling besar.')
        a=1.2+(seed%8)*.1; b=.35+(seed//3%6)*.05; val=round(a+b,2)
        return (f'Sebuah botol berisi {fmt(a)} liter lalu ditambah {fmt(b)} liter. Berapa liter isinya?',val,[round(val+.1,2),round(val-.1,2),round(a*b,2)],'Operasi desimal','Samakan tempat desimal.','Jumlahkan nilai sesuai tempat desimal.')
    if grade==6 and comp=='geometri':
        if k==0:
            p=8+(seed%8); l=4+(seed//3%6); val=p*l
            return (f'Kebun berbentuk persegi panjang memiliki panjang {p} m dan lebar {l} m. Berapa luasnya?',val,[2*(p+l),p+l,val+2],'Luas persegi panjang','Luas dihitung dengan panjang kali lebar.',f'Kalikan {p} dengan {l}.')
        if k==1:
            a=3+(seed%6); b=4+(seed//3%7); c=2+(seed//5%6); val=a*b*c
            return (f'Kotak berbentuk balok berukuran {a} dm × {b} dm × {c} dm. Berapa volumenya?',val,[a*b,a+c,b*c],'Volume balok','Volume memuat tiga ukuran.','Kalikan panjang, lebar, dan tinggi.')
        if k==2:
            h=1+(seed%3); m=20+(seed%3)*10; val=h*60+m
            return (f'Sebuah kegiatan berlangsung {h} jam {m} menit. Berapa menit seluruhnya?',val,[h*60-m,h*60+m-10,h+m],'Konversi waktu','Satu jam sama dengan 60 menit.','Kalikan jam dengan 60 lalu tambahkan menit.')
        s=5+(seed%10); val=4*s
        return (f'Sisi sebuah persegi {s} cm. Berapa kelilingnya?',val,[s*s,2*s,s+4],'Keliling persegi','Persegi memiliki empat sisi sama panjang.','Kalikan panjang sisi dengan empat.')
    if grade==6 and comp=='data':
        a=12+(seed%9); b=18+(seed//3%8); c=20+(seed//5%9)
        if k==0:
            val=a+b+c; return (f'Tabel mencatat {a}, {b}, dan {c} buku terkumpul pada tiga hari. Berapa jumlah seluruhnya?',val,val-2,val+3,a+b-c,'Menjumlahkan data','Data tiap hari digabungkan.','Tambahkan ketiga nilai.')
        if k==1:
            val=Fraction(a+b+c,3); return (f'Jumlah pengunjung selama tiga hari adalah {a}, {b}, dan {c}. Berapa rata-ratanya?',val,val+1,val-1,a+b+c,'Rata-rata','Rata-rata adalah jumlah data dibagi banyak data.','Jumlahkan lalu bagi tiga.')
        val=max(a,b,c)-min(a,b,c); return (f'Data jumlah bibit yang ditanam adalah {a}, {b}, dan {c}. Berapa selisih terbesar dan terkecil?',val,val+2,val-2,max(a,b,c)+min(a,b,c),'Membandingkan data','Selisih dicari dari nilai terbesar dikurangi terkecil.','Identifikasi dua nilai ujung lalu kurangkan.')
    if grade==9 and comp=='bilangan':
        if k==0:
            price=120000+(seed%8)*20000; pct=10+(seed//3%5)*5; val=price*(100-pct)//100
            return (f'Harga sebuah tas adalah {money(price)}. Toko memberi diskon {pct}%. Berapa harga setelah diskon?',val,[price*pct//100,price-(pct*100),price+pct*1000], 'Persentase dan diskon','Hitung nilai diskon dari harga awal.','Kurangkan diskon dari harga awal.')
        if k==1:
            ratio=2+(seed%5); parts=5+(seed//3%6); total=(ratio+3)*parts; val=parts*ratio
            return (f'Perbandingan buku fiksi dan nonfiksi adalah {ratio}:3. Jika jumlahnya {total}, berapa buku fiksi?',val,[total//2,total//(ratio+3),val+3],'Rasio dan proporsi','Jumlah bagian perbandingan adalah rasio yang dijumlahkan.','Cari nilai satu bagian lalu kalikan bagian fiksi.')
        if k==2:
            n=2+(seed%5); m=3+(seed//3%4); val=n+m; d1=n*m
            if d1 in (val,val+1): d1=val+2
            return (f'Sederhanakan 2^{n} × 2^{m}. Hasilnya ditulis sebagai 2 berpangkat berapa?',val,[d1,val+1,m-n],'Pangkat dengan basis sama','Pangkat dijumlahkan ketika basis sama dan dikalikan.','Jumlahkan kedua pangkat.')
        root=6+(seed%10); val=root; return (f'Nilai positif x memenuhi x² = {root*root}. Berapakah x?',val,[-root,root+1,root*2],'Akar kuadrat','Kuadrat bilangan positif menghasilkan bilangan yang diketahui.','Pilih akar positifnya.')
    if grade==9 and comp=='aljabar':
        if k==0:
            a=2+(seed%6); x=4+(seed//3%7); b=3+(seed//5%8); c=a*x+b
            return (f'Jika {a}x + {b} = {c}, nilai x adalah ...',x,[x+1,x-1,x+2],'Persamaan linear','Pindahkan konstanta lalu bagi koefisien x.',f'Kurangi {b}, kemudian bagi {a}.')
        if k==1:
            a=3+(seed%6); bound=4+(seed//3%8); val=bound-1; return (f'Pertidaksamaan x + {a} < {bound+a}. Nilai terbesar x bilangan bulat yang memenuhi adalah ...',val,bound,bound+1,bound-2,'Pertidaksamaan linear','Kurangi konstanta pada kedua ruas.','Karena x lebih kecil dari batas, bilangan bulat terbesar adalah satu kurang dari batas.')
        if k==2:
            first=3+(seed%7); diff=2+(seed//3%5); n=5+(seed//5%6); val=first+(n-1)*diff
            return (f'Barisan aritmetika dimulai {first} dan memiliki beda {diff}. Suku ke-{n} adalah ...',val,[val+diff,val-diff,val+2],'Barisan aritmetika','Suku ke-n diperoleh dari suku awal ditambah n−1 kali beda.','Gunakan a + (n−1)b.')
        x=2+(seed%6); y=3+(seed//3%6); return (f'Sistem persamaan x + y = {x+y} dan x − y = {x-y} memiliki penyelesaian (x, y). Nilai x adalah ...',x,[y,x+y,x-y],'SPLDV','Jumlahkan kedua persamaan agar y hilang.','Diperoleh 2x = jumlah kedua ruas kanan, lalu bagi dua.')
    if grade==9 and comp=='geometri':
        if k==0:
            a,b,val=[(6,8,10),(9,12,15),(5,12,13),(8,15,17),(7,24,25),(9,40,41)][seed%6]; return (f'Segitiga siku-siku memiliki sisi siku-siku {a} cm dan {b} cm. Hipotenusanya ...',val,[a+b,abs(b-a),val+2],'Teorema Pythagoras','Kuadrat hipotenusa adalah jumlah kuadrat sisi siku-siku.','Hitung akar dari jumlah kuadrat.')
        if k==1:
            a=[40,45,50,55,60,65][seed%6]; val=180-2*a; return (f'Sebuah segitiga sama kaki memiliki dua sudut masing-masing {a}°. Sudut ketiganya ...',val,[a,180-a,2*a],'Jumlah sudut segitiga','Jumlah sudut segitiga adalah 180°.','Kurangi dua sudut yang diketahui dari 180°.')
        if k==2:
            small=4+(seed%7); scale=2+(seed//3%3); val=small*scale; return (f'Dua bangun sebangun. Sisi bangun kecil {small} cm dan faktor skala ke bangun besar {scale}. Sisi bersesuaian bangun besar ...',val,[small+scale,small*scale+1,small*2],'Kesebangunan','Sisi bersesuaian dikalikan faktor skala.','Kalikan ukuran kecil dengan faktor skala.')
        x=2+(seed%8); y=-3+(seed//3%7); dx=3+(seed%6); dy=-2+(seed//5%6); return (f'Titik P({x},{y}) ditranslasi oleh ({dx},{dy}). Koordinat P’ adalah ...',f'({x+dx},{y+dy})',[f'({x-dx},{y-dy})',f'({x+dx},{y-dy})',f'({x},{y})'],'Translasi koordinat','Translasi menambah komponen x dan y sesuai vektor.','Tambahkan dx pada x dan dy pada y.')
    if k==0:
        vals=[12+(seed%4),15+(seed%5),18+(seed%3)]; val=Fraction(sum(vals),3); return (f'Tiga hasil pengukuran adalah {list_id(vals)}. Nilai rata-ratanya ...',val,val+1,val-1,max(vals),'Rata-rata data','Jumlahkan data lalu bagi tiga.','Bagi jumlah tiga data dengan tiga.')
    if k==1:
        red=2+(seed%3); blue=3+(seed%4); val=Fraction(red,red+blue); return (f'Dalam kotak ada {red} kartu merah dan {blue} kartu biru. Peluang mengambil kartu merah adalah ...',val,Fraction(blue,red+blue),Fraction(1,red+blue),Fraction(red,blue),'Peluang sederhana','Peluang adalah banyak kejadian dibagi banyak seluruh kemungkinan.','Bagi kartu merah dengan jumlah kartu.')
    if k==2:
        vals=[8+(seed%4),12+(seed%5),20+(seed%3),25+(seed%4)]; val=max(vals)-min(vals); return (f'Data waktu tempuh (dalam menit) adalah {list_id(vals)}. Rentangnya ... menit.',val,max(vals)+min(vals),val+2,val-1,'Rentang data','Rentang adalah nilai terbesar dikurangi terkecil.','Kurangkan nilai minimum dari maksimum.')
    total=40+(seed%5)*5; part=8+(seed%4)*2; val=Fraction(part,total); return (f'Dalam survei terhadap {total} responden, {part} memilih kegiatan A. Berapa frekuensi relatif pemilih kegiatan A?',val,Fraction(total-part,total),Fraction(part,total+10),Fraction(part+4,total),'Frekuensi relatif','Frekuensi relatif adalah banyak pemilih dibagi seluruh responden.','Bagi banyak pemilih dengan jumlah seluruh responden.')

def add_math(grade,pack,i,comp,typ,cognitive,difficulty):
    # Use a seed that changes across packs and question positions. The old
    # pack*100 stride was divisible by most template moduli, which accidentally
    # repeated the same displayed numbers in every pack.
    seed=grade*1000+pack*37+i; base=math_base(grade,comp,seed)
    if len(base)==6:
        stem,val,distractors,concept,step1,step2=base; d1,d2,d3=distractors[:3]
    else:
        stem,val,d1,d2,d3,concept,step1,step2=base
    # The pack/seed is metadata only. It must never appear in the learner-facing
    # stem because official TKA items use a clean, self-contained prompt.
    stem=stem.replace('...', '…')
    # Keep every distractor distinct from the key and from one another. A
    # duplicate option makes a multiple-choice item ambiguous even when the
    # calculation itself is correct.
    adjusted=[]; used_values={fmt(val)}
    for offset, distractor in enumerate([d1,d2,d3], start=1):
        candidate=distractor
        if not isinstance(candidate,str):
            while fmt(candidate) in used_values:
                candidate=candidate+offset+1
        elif fmt(candidate) in used_values:
            candidate=f'{candidate} (alternatif {offset})'
        adjusted.append(candidate); used_values.add(fmt(candidate))
    d1,d2,d3=adjusted
    def display(value):
        return money(int(value)) if concept=='Persentase dan diskon' and isinstance(value,(int,float)) else fmt(value)
    correct=display(val); opts={'A':correct,'B':display(d1),'C':display(d2),'D':display(d3)}
    if typ=='PG':
        answer=['A']; reasons={'A':'Hasil ini mengikuti langkah pada pembahasan.','B':'Hasil ini memakai operasi atau nilai yang tidak sesuai.','C':'Hasil ini tidak mengikuti operasi atau informasi yang diberikan.','D':'Hasil ini bukan hasil perhitungan yang diminta.'}
    elif typ=='PGK_MCMA':
        labels={
            'Menjumlahkan pecahan':'jumlah tepung', 'Persentase dari jumlah':'jumlah buku',
            'FPB untuk pembagian sama banyak':'jumlah paket', 'Operasi desimal':'isi botol',
            'Luas persegi panjang':'luas kebun', 'Volume balok':'volume kotak',
            'Konversi waktu':'jumlah menit', 'Keliling persegi':'keliling persegi',
            'Menjumlahkan data':'jumlah data', 'Rata-rata':'rata-rata data',
            'Membandingkan data':'selisih data', 'Persentase dan diskon':'harga setelah diskon',
            'Rasio dan proporsi':'jumlah buku fiksi', 'Pangkat dengan basis sama':'pangkat hasil',
            'Akar kuadrat':'nilai x', 'Persamaan linear':'nilai x',
            'Pertidaksamaan linear':'nilai x terbesar', 'Barisan aritmetika':'suku ke-n',
            'SPLDV':'nilai x', 'Teorema Pythagoras':'hipotenusa',
            'Jumlah sudut segitiga':'sudut ketiga', 'Kesebangunan':'sisi bersesuaian',
            'Translasi koordinat':'koordinat hasil', 'Rata-rata data':'rata-rata',
            'Peluang sederhana':'peluang', 'Rentang data':'rentang',
            'Frekuensi relatif':'frekuensi relatif'
        }
        label=labels.get(concept,'hasil perhitungan')
        pretty=label[0].upper()+label[1:]
        if isinstance(val,str):
            try:
                coord_x,coord_y=(int(part) for part in val.strip('()').split(','))
                ctext=f'Komponen x pada koordinat hasil adalah {coord_x}.'
                dtext=f'Komponen y pada koordinat hasil adalah {coord_y+1}.'
            except ValueError:
                ctext='Komponen hasil mengikuti operasi pada soal.'
                dtext='Hasil tidak dapat dibandingkan sebagai satu bilangan.'
        else:
            ctext=f'Jika {label} ditambah 1, hasilnya {display(val+1)}.'
            dtext=f'{pretty} sama dengan {display(val+1)}.'
        opts={'A':f'{pretty} adalah {correct}.','B':f'{pretty} adalah {display(d1)}.','C':ctext,'D':dtext};answer=['A','C'];reasons={'A':'Sesuai hasil hitung.','B':'Angka ini adalah pengecoh, bukan hasil hitung.','C':f'Pernyataan ini benar karena {label} mengikuti pembahasan.','D':'Pernyataan ini tidak sesuai dengan nilai yang diperoleh.'}
        stem=f'{stem} Pilih semua jawaban yang benar! Jawaban benar lebih dari satu.'
    else:
        stem=f'{stem} Tentukan Benar atau Salah untuk setiap pernyataan berikut.'
        opts={'A':f'Hasil perhitungan adalah {correct}.','B':f'Hasil perhitungan lebih kecil dari {correct}.','C':f'Langkah utama memakai konsep {concept.lower()}.','D':'Hasilnya selalu sama dengan 0.'};answer={'A':'Benar','B':'Salah','C':'Benar','D':'Salah'};reasons={'A':'Nilai cocok dengan perhitungan.','B':'Nilai tidak lebih kecil dari hasil yang diperoleh.','C':'Konsep ini memang digunakan.','D':'Tidak ada alasan hasil selalu nol.'}
    if typ=='PGK_MCMA':
        closing=(f'Koordinat hasil adalah {correct}. Periksa komponen koordinat pada setiap pernyataan.' if isinstance(val,str)
                 else f'Nilai yang dicari adalah {correct}. Jika nilai itu ditambah 1, hasilnya {display(val+1)}. Pilih semua pernyataan yang sesuai.')
    else:
        closing=f'Jadi, jawaban yang tepat adalah {correct}.'
    add_question(grade=grade,subject='matematika',pack=pack,n=i+1,comp=comp,typ=typ,cognitive=cognitive,difficulty=difficulty,stem=stem,options=opts,answer=answer,concept=concept,steps=[step1,step2,closing],reasons=reasons,verification={'kind':'formula_seed','seed':seed,'value':correct})

themes6=['perawatan kebun sekolah','penataan pojok baca','pameran karya','pengelolaan bank sampah','perawatan kebun obat','perpustakaan keliling','latihan tari','pasar kelas','pembuatan kompos','penyusunan papan informasi','lomba kebersihan','penanaman','teater kecil','pencatatan cuaca','perbaikan lapangan','klub sains','pembuatan peta lingkungan','pembuatan kotak berbagi']
themes9=['audit energi sekolah','rancangan taman kota','jurnal kualitas air','pameran teknologi','survei transportasi','perubahan jadwal pasar','proyek suara lingkungan','komunitas baca','uji kemasan pangan','pengamatan lalu lintas','koperasi siswa','peta risiko banjir','kampanye hemat air','studio podcast','eksperimen cahaya','festival budaya','data kebugaran','rencana jalur sepeda']
names=['Naya','Bima','Salsa','Dito','Rara','Fikri','Maya','Arga','Tari','Nino','Lala','Raka','Sinta','Gilang','Ayu','Reno','Kirana','Bagas']
places=['kelas','balai warga','taman sekolah','perpustakaan','lapangan','ruang serbaguna']
def passage(grade,pack,slot):
    idx=(pack-1)*6+slot; theme=(themes6 if grade==6 else themes9)[idx]; person=names[idx]; place=places[idx%len(places)]; n1=12+idx*3; n2=5+idx%5; result=n1-n2
    if grade==6:
        theme_label=theme
        opening=f'{person} mengikuti kegiatan {theme_label}.'
        used=f'Sebanyak {n2} benda dipakai pada tahap pertama.'
        change='Kelompok mencatat perubahan di papan pengumuman.'
        review=['Catatan membantu memeriksa kegiatan.','Kelompok merencanakan tindak lanjut.']
        sentences=[
            opening,
            f'Kegiatan itu berlangsung di {place}.',
            f'{person} bekerja bersama teman-temannya.',
            'Ia ingin menyelesaikan tugas kelompok.',
            'Guru menjelaskan tujuan kegiatan.',
            'Guru membuka kegiatan dengan contoh.',
            'Teman-teman bertanya sebelum mulai.',
            'Kelompok belajar melalui tindakan nyata.',
            'Mereka membaca petunjuk sebelum bekerja.',
            f'Panitia menyediakan {n1} benda.',
            used,
            'Sisanya disimpan untuk tahap berikutnya.',
            'Teman-teman memeriksa jumlah bahan.',
            'Mereka membuat jadwal sederhana.',
            'Setiap anggota mendapat giliran.',
            'Mereka mengukur bahan secara bergantian.',
            'Setiap catatan diberi nama.',
            change,
            f'{person} membawa catatan kelompok.',
            f'{person} menyampaikan hasil kegiatan.',
            'Kelompok membandingkan catatan awal.',
            'Catatan membantu memeriksa kegiatan.',
            'Mereka menemukan satu langkah lambat.',
            'Guru meminta pemeriksaan ulang.',
            'Keputusan harus disertai alasan.',
            'Kelompok memperbaiki rencana bersama.',
            'Hasil kegiatan menjadi lebih teratur.',
            'Kelompok merencanakan tindak lanjut.',
            'Mereka merapikan alat setelah bekerja.',
            'Kelompok menyimpan catatan tersebut.',
            'Catatan itu membantu kelompok lain.',
            'Kegiatan berakhir dengan pembagian tugas.',
            'Tugas berikutnya dimulai pekan depan.'
        ]
    else:
        theme_label=theme.removeprefix('proyek ')
        opening=f'Semester ini, {person} mengikuti proyek {theme_label}.'
        used=f'Kelompok menggunakan {n2} unit pada tahap awal.'
        change='Kelompok mencatat semua perubahan bersama waktu dan kondisi.'
        review=['Kelompok memeriksa catatan sebelum menyimpulkan.','Proyek ditutup dengan rencana perbaikan.']
        sentences=[
            opening,
            f'Proyek itu berlangsung di {place}.',
            'Proyek tersebut melatih peserta membaca data.',
            'Peserta juga menguji alasan dan kesimpulan.',
            'Guru meminta pertanyaan berdasarkan pengamatan.',
            'Kelompok mencatat tujuan sejak awal.',
            f'Panitia menyiapkan {n1} unit bahan.',
            used,
            f'Mereka menyisakan {result} unit untuk tahap berikutnya.',
            change,
            f'{person} membandingkan catatan lapangan dengan rencana awal.',
            'Satu hasil terlihat berbeda pada pengukuran awal.',
            'Pengukuran itu dilakukan pada waktu berbeda.',
            'Kelompok memilih waktu pengukuran yang konsisten.',
            'Mereka menyimpan hasil awal sebagai pembanding.',
            'Rapat kedua membahas penjelasan yang mungkin.',
            'Anggota mencatat data yang masih diperlukan.',
            *review,
            'Mereka memilih kesimpulan yang lebih terbatas.',
            'Kesimpulan itu sesuai dengan data.',
            'Kelompok menjelaskan cara kerja mereka.',
            'Data tersebut dibahas bersama anggota.',
            'Catatan proyek disimpan di perpustakaan sekolah.',
            'Kelompok berikutnya dapat mengulang pengamatan.',
            f'{person} menilai data sebelum mengambil keputusan.',
            'Keputusan yang baik membutuhkan bukti.',
            'Pengamatan juga membutuhkan waktu yang jelas.',
            'Kelompok berani mengakui keterbatasan data.',
            'Anggota membandingkan catatan sebelum rapat.',
            'Guru meminta alasan ditulis dengan jelas.',
            'Semua peserta mengikuti aturan pengamatan.',
            'Anggota membandingkan hasil antarhari dengan tabel.',
            'Mereka menyimpan catatan mentah untuk pemeriksaan.',
            'Catatan lengkap membantu pembaca memahami proses.'
        ]
    text=' '.join(sentences)
    facts={'person':person,'place':place,'n1':n1,'n2':n2,'result':result,'theme':theme,'theme_label':theme_label,'opening':opening,'used':used,'change':change,'review':review}
    return {'id':f'r{grade}-passage-{idx+1:02d}','grade':grade,'genre':'fiksi' if idx%2==0 else 'informasi','title':theme.title(),'source_kind':'original','text':text},facts

def add_reading(grade,pack,slot,meta,pattern):
    p,facts=passage(grade,pack,slot); person=facts['person']; place=facts['place']; n1=facts['n1']; n2=facts['n2']; result=facts['result']; theme=facts['theme']; theme_label=facts['theme_label']; rank_p.append(p)
    comps=['tekstual','tekstual','inferensial','inferensial','evaluasi'] if pattern=='X' else ['tekstual','inferensial','inferensial','evaluasi','evaluasi']
    types=['PG','PG','PG','PGK_MCMA','PGK_CATEGORY']
    for j,(comp,typ) in enumerate(zip(comps,types)):
        n=slot*5+j+1; common={'evidence':[], 'stimulus':p['id'], 'family':p['id']}
        if j==0:
            stem=f'Kegiatan apa yang diikuti {person}?';opts={'A':theme_label,'B':'permainan antarkelas','C':'perjalanan wisata','D':'ujian olahraga'};ans=['A'];steps=['Cari kalimat pembuka yang menyebut kegiatan.','Nama kegiatan itu adalah informasi tersurat.']
        elif j==1:
            stem=f'Berapa benda yang dipakai pada tahap pertama?';opts={'A':str(n1),'B':str(n2),'C':str(result),'D':str(n1+n2)};ans=['B'];steps=['Pertanyaan meminta jumlah benda yang dipakai.','Pilih angka untuk tahap pertama.']
        elif j==2:
            if grade==6:
                stem='Apa yang dilakukan kelompok ketika ada perubahan?';opts={'A':'Mencatat perubahan di papan pengumuman.','B':'Menghentikan semua kegiatan.','C':'Menambah jumlah bahan setiap saat.','D':'Menghapus catatan awal.'};steps=['Cari kalimat yang menjelaskan tindakan kelompok saat ada perubahan.','Pilih tindakan yang disebutkan secara langsung dalam bacaan.']
            else:
                stem='Apa yang dicatat kelompok bersama waktu dan kondisi kegiatan?';opts={'A':'Semua perubahan.','B':'Hanya hasil yang paling menguntungkan.','C':'Perkiraan tanpa waktu pengamatan.','D':'Data dari kelompok lain saja.'};steps=['Cari kalimat tentang pencatatan perubahan, waktu, dan kondisi.','Pilih informasi yang disebutkan secara langsung dalam bacaan.']
            ans=['A']
        elif j==3:
            stem='Pilih semua informasi yang sesuai dengan bacaan.'
            used_text=f'{n2} benda dipakai pada tahap pertama.' if grade==6 else f'Kelompok menggunakan {n2} unit pada tahap awal.'
            opts={'A':f'{person} terlibat dalam kegiatan {theme_label}.','B':used_text,'C':'Guru melarang kelompok mencatat perubahan.','D':'Semua kesimpulan dianggap pasti tanpa pemeriksaan.'};ans=['A','B'];steps=['Cocokkan setiap pernyataan dengan bacaan.','Pilih pernyataan yang memiliki bukti.']
        else:
            stem='Tentukan Benar atau Salah berdasarkan bacaan.'
            if grade==6:
                opts={'A':'Catatan membantu memeriksa kegiatan.','B':'Satu hasil pasti membuktikan sebab.','C':'Kelompok merencanakan tindak lanjut.'}
            else:
                opts={'A':'Kelompok memeriksa catatan sebelum menyimpulkan.','B':'Satu hasil pasti membuktikan sebab.','C':'Proyek ditutup dengan rencana perbaikan.'}
            ans={'A':'Benar','B':'Salah','C':'Benar'};steps=['Cocokkan setiap pernyataan dengan bacaan.','Perhatikan bukti dan batas kesimpulannya.']
        stem=f"Berdasarkan bacaan tersebut, {stem[0].lower()+stem[1:]}"
        if j==1:
            initial_reason=f'Bacaan menyebut angka {n1} sebagai jumlah awal, tetapi yang ditanyakan adalah jumlah yang dipakai pada tahap pertama.'
            remainder_reason=(f'Angka {result} dapat dihitung sebagai sisa setelah tahap pertama, tetapi yang ditanyakan adalah jumlah yang dipakai pada tahap pertama.' if grade==6 else f'Bacaan menyebut angka {result} sebagai sisa, tetapi yang ditanyakan adalah jumlah yang dipakai pada tahap pertama.')
            reasons={'A':initial_reason,
                     'B':'Didukung langsung oleh bacaan sebagai jumlah yang dipakai pada tahap pertama.',
                     'C':remainder_reason,
                     'D':f'Angka {n1+n2} bukan jumlah yang dipakai pada tahap pertama.'}
        else:
            reasons={k:('Didukung langsung oleh bacaan.' if (isinstance(ans,list) and k in ans) or (isinstance(ans,dict) and ans.get(k)=='Benar') else 'Tidak didukung atau bertentangan dengan bacaan.') for k in opts}
        if j==0: evidence=[facts['opening']]
        elif j==1: evidence=[facts['used']]
        elif j==2: evidence=[facts['change']]
        elif j==3: evidence=[facts['opening'], facts['used']]
        else: evidence=facts['review']
        add_question(grade=grade,subject='bahasa_indonesia',pack=pack,n=n,comp=comp,typ=typ,cognitive='pemahaman' if comp=='tekstual' else 'aplikasi' if comp=='inferensial' else 'penalaran',difficulty='mudah' if j<2 else 'sedang' if j<4 else 'menantang',stem=stem,options=opts,answer=ans,concept='Membaca informasi, menyimpulkan alasan, dan memeriksa bukti.',steps=steps+[f'Gunakan bukti dari bacaan untuk memilih jawaban.'],reasons=reasons,evidence=evidence,stimulus=p['id'],family=p['id'])

for grade in (6,9):
    for pack in (1,2,3):
        domains=(['bilangan']*12+['geometri']*12+['data']*6) if grade==6 else (['bilangan']*8+['aljabar']*8+['geometri']*8+['data_peluang']*6)
        for i,comp in enumerate(domains):
            typ='PG' if i<18 else 'PGK_MCMA' if i<24 else 'PGK_CATEGORY'; cog='pemahaman' if i<6 else 'aplikasi' if i<21 else 'penalaran'; diff='mudah' if i<9 else 'sedang' if i<24 else 'menantang';add_math(grade,pack,i,comp,typ,cog,diff)
        for slot in range(6):add_reading(grade,pack,slot,None,'X' if slot<4 else 'Y')

for p in rank_p:
    wc=len(p['text'].split()); low,high=(150,200) if p['grade']==6 else (200,250)
    assert low<=wc<=high,(p['id'],wc)
assert len(rank_q)==360 and len(rank_p)==36
(BANK/'ranking-candidates.json').write_text(json.dumps(rank_q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(BANK/'ranking-passages.json').write_text(json.dumps(rank_p,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'questions':len(rank_q),'passages':len(rank_p),'tracks':{'6/matematika':90,'6/bahasa_indonesia':90,'9/matematika':90,'9/bahasa_indonesia':90}},ensure_ascii=False))
