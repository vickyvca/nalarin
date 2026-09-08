"""Merge the Luna-reviewed ranking candidate pool into the canonical bank.

The merge is deliberately fail-closed: a missing or rejected review leaves the
existing daily bank untouched.  Numeric and package checks remain in
validate-ranking-seed.py; this script handles review provenance and the atomic
content merge only.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "bank"
candidate_path = BANK / "ranking-candidates.json"
passage_path = BANK / "ranking-passages.json"
review_dir = BANK / "ranking-reviews"

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

def atomic_write(path, value):
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)

candidates = read(candidate_path)
candidate_passages = read(passage_path)
reviews = {}
review_files = sorted(review_dir.glob("*.json")) if review_dir.exists() else []
for path in review_files:
    payload = read(path)
    for item in payload.get("reviews", []):
        ident = item.get("id")
        if ident:
            reviews[ident] = {
                "approved": bool(item.get("approved")),
                "issues": item.get("issues") or [],
                "file": path.name,
                "reviewed_at": payload.get("reviewed_at"),
                "model": payload.get("model", "mitsuko->gpt-5.6-luna(max)"),
            }

ids = [q["id"] for q in candidates]
missing = [ident for ident in ids if ident not in reviews]
rejected = [
    {"id": ident, **reviews[ident]}
    for ident in ids
    if ident in reviews and not reviews[ident]["approved"]
]
if missing or rejected:
    print(json.dumps({"status": "BLOCKED", "candidate_questions": len(candidates),
                      "review_files": len(review_files), "missing": missing[:20],
                      "missing_count": len(missing), "rejected": rejected[:20],
                      "rejected_count": len(rejected)}, ensure_ascii=False, indent=2))
    raise SystemExit(2)

existing_questions = read(BANK / "questions.json")
existing_passages = read(BANK / "passages.json")
existing_qids = {q["id"] for q in existing_questions}
existing_pids = {p["id"] for p in existing_passages}
colliding_qids = sorted(existing_qids.intersection(ids))
colliding_pids = sorted(existing_pids.intersection(p["id"] for p in candidate_passages))
replaceable_qids = [ident for ident in colliding_qids if next(q for q in existing_questions if q["id"] == ident).get("pool") == "ranked_v1"]
replaceable_pids = [ident for ident in colliding_pids if next(p for p in existing_passages if p["id"] == ident).get("source_kind") == "original"]
unexpected_qids = sorted(set(colliding_qids) - set(replaceable_qids))
unexpected_pids = sorted(set(colliding_pids) - set(replaceable_pids))
if unexpected_qids or unexpected_pids:
    print(json.dumps({"status": "BLOCKED", "colliding_question_ids": colliding_qids,
                      "colliding_passage_ids": colliding_pids,
                      "unexpected_question_collisions": unexpected_qids,
                      "unexpected_passage_collisions": unexpected_pids}, ensure_ascii=False, indent=2))
    raise SystemExit(3)

# A refreshed ranking release replaces only the prior generated ranking pool.
# The 80-question daily pilot remains untouched.
existing_questions = [q for q in existing_questions if q["id"] not in replaceable_qids]
existing_passages = [p for p in existing_passages if p["id"] not in replaceable_pids]

reviewed_at = datetime.now(timezone.utc).isoformat()
merged_candidates = []
for q in candidates:
    r = reviews[q["id"]]
    q = dict(q)
    q["pool"] = "ranked_v1"
    q["ranked_eligible"] = True
    review_record_sha256 = hashlib.sha256(json.dumps(r, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    q["review"] = {
        "status": "ai_reviewed",
        "human_review_required": False,
        "independent_mitsuko_review": "passed",
        "review_id": review_record_sha256,
        "model": r["model"],
        "reviewed_at": r["reviewed_at"] or reviewed_at,
        "review_file": r["file"],
        "review_method": "Luna blind audit: TKA type, competency, key, arithmetic, language, option reasons, explanation, and reading evidence",
        "review_record_sha256": review_record_sha256,
    }
    merged_candidates.append(q)

atomic_write(BANK / "questions.json", existing_questions + merged_candidates)
atomic_write(BANK / "passages.json", existing_passages + candidate_passages)
summary = {
    "status": "PASS",
    "reviewed_at": reviewed_at,
    "model": "mitsuko->gpt-5.6-luna(max)",
    "candidate_questions": len(candidates),
    "candidate_passages": len(candidate_passages),
    "approved_questions": len(merged_candidates),
    "review_files": len(review_files),
    "packs": sorted({q["pack_id"] for q in merged_candidates}),
    "difficulty_calibrated": False,
    "limitations": ["Editorial difficulty has not been calibrated from learner response data."],
}
atomic_write(BANK / "RANKING-REVIEW.json", summary)
print(json.dumps(summary, ensure_ascii=False, indent=2))
