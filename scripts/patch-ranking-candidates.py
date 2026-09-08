"""Apply small editorial fixes identified during the live Luna audit."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
bank = ROOT / "bank"
qs = json.loads((bank / "ranking-candidates.json").read_text(encoding="utf-8"))
passages = {p["id"]: p["text"] for p in json.loads((bank / "ranking-passages.json").read_text(encoding="utf-8"))}

for q in qs:
    if q["id"] == "r6-mtk-1-17":
        for key in q["explanation"]["option_reasons"]:
            if key != q["answer"][0]:
                q["explanation"]["option_reasons"][key] = "Nilai ini bukan hasil perhitungan yang diminta."
    if q["subject"] != "bahasa_indonesia" or "berapa benda yang dipakai" not in q["stem"]:
        if q["subject"] == "bahasa_indonesia":
            text = passages[q["stimulus_id"]]
            stem_lower = q["stem"].lower()
            if "mengapa kelompok mencatat perubahan" in stem_lower:
                correct_id = q["answer"][0]
                other_ids = [o["id"] for o in q["options"] if o["id"] != correct_id]
                if q["grade"] == 6:
                    correct_text = "Menuliskannya di papan pengumuman."
                    other_texts = ["Menghentikan semua kegiatan.", "Menambah jumlah bahan setiap saat.", "Menghapus catatan awal."]
                    question = "apa yang dilakukan kelompok ketika ada perubahan?"
                else:
                    correct_text = "Semua perubahan."
                    other_texts = ["Hanya hasil yang paling menguntungkan.", "Perkiraan tanpa waktu pengamatan.", "Data dari kelompok lain saja."]
                    question = "apa yang dicatat kelompok bersama waktu dan kondisi kegiatan?"
                q["stem"] = q["stem"].split(", ", 1)[0] + ", " + question
                by_id = {correct_id: correct_text}
                for ident, value in zip(other_ids, other_texts):
                    by_id[ident] = value
                for option in q["options"]:
                    option["text"] = by_id[option["id"]]
                q["explanation"]["steps"] = ["Cari kalimat yang menjelaskan tindakan atau pencatatan kelompok.", "Pilih informasi yang disebutkan secara langsung dalam bacaan.", "Gunakan bukti dari bacaan untuk memilih jawaban."]
                q["explanation"]["option_reasons"] = {o["id"]: ("Didukung langsung oleh bacaan." if o["id"] == correct_id else "Tidak didukung atau bertentangan dengan bacaan.") for o in q["options"]}
            elif "pilih semua informasi" in stem_lower:
                used = int(re.search(r"(?:Sebanyak|menggunakan) (\d+) (?:benda dipakai|unit)", text).group(1))
                if q["grade"] == 6:
                    for option in q["options"]:
                        if option["text"].startswith("Kelompok menggunakan"):
                            option["text"] = f"{used} benda dipakai pada tahap pertama."
                    opening = re.search(r"Pada awal bulan, [^.]+\.", text).group(0)
                    used_sentence = re.search(rf"Sebanyak {used} benda dipakai[^.]+\.", text).group(0)
                else:
                    opening = re.search(r"Pada semester ini, [^.]+\.", text).group(0)
                    used_sentence = re.search(rf"Kelompok menggunakan {used} unit[^.]+\.", text).group(0)
                q["explanation"]["evidence"] = [opening, used_sentence]
            elif "tentukan benar atau salah" in stem_lower:
                if q["grade"] == 6:
                    q["explanation"]["evidence"] = [re.search(r"Guru memuji cara mereka mencatat[^.]+\.", text).group(0), re.search(r"Pada pertemuan berikutnya[^.]+\.", text).group(0)]
                else:
                    q["explanation"]["evidence"] = [re.search(r"Kelompok kemudian memilih waktu[^.]+\.", text).group(0), re.search(r"Guru mengingatkan[^.]+\.", text).group(0), re.search(r"Proyek ditutup[^.]+\.", text).group(0)]
        continue
    text = passages[q["stimulus_id"]]
    initial = int(re.search(r"menyiapkan (\d+)", text).group(1))
    used_match = re.search(r"(?:Sebanyak|menggunakan) (\d+) (?:benda dipakai|unit)", text)
    used = int(used_match.group(1))
    if "sisanya" in text:
        remainder = initial - used
    else:
        remainder = int(re.search(r"menyisakan (\d+) unit", text).group(1))
    reasons = {}
    for option in q["options"]:
        value = int(option["text"])
        if value == used:
            reasons[option["id"]] = "Didukung langsung oleh bacaan sebagai jumlah yang dipakai pada tahap pertama."
        elif value == initial:
            reasons[option["id"]] = f"Bacaan menyebut angka {initial} sebagai jumlah awal, tetapi yang ditanyakan adalah jumlah yang dipakai pada tahap pertama."
        elif value == remainder:
            reasons[option["id"]] = (f"Angka {remainder} dapat dihitung sebagai sisa setelah tahap pertama, tetapi yang ditanyakan adalah jumlah yang dipakai pada tahap pertama." if q["grade"] == 6 else f"Bacaan menyebut angka {remainder} sebagai sisa, tetapi yang ditanyakan adalah jumlah yang dipakai pada tahap pertama.")
        else:
            reasons[option["id"]] = f"Angka {value} bukan jumlah yang dipakai pada tahap pertama."
    q["explanation"]["option_reasons"] = reasons

(bank / "ranking-candidates.json").write_text(json.dumps(qs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"questions": len(qs), "patched_reading_count": sum(1 for q in qs if q["subject"] == "bahasa_indonesia" and "berapa benda yang dipakai" in q["stem"]), "patched_math": "r6-mtk-1-17"}, ensure_ascii=False))
