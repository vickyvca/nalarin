"""Build a content-only release with hashes; never include DB or secrets."""
import hashlib
import io
import json
import subprocess
import tarfile
from pathlib import Path

root=Path(__file__).resolve().parents[1]
output=root/'work/daily-content-v2'
output.mkdir(parents=True,exist_ok=True)
baseline=json.loads(subprocess.check_output(['git','show','5b879fd:bank/questions.json'],cwd=root))
questions=json.loads((root/'bank/questions.json').read_text(encoding='utf-8'))
current={q['id']:q for q in questions}
assert len(current)==len(questions), 'Duplicate question IDs'
assert all(current.get(q['id'])==q for q in baseline), 'Existing question changed or disappeared'
assert len(questions)==456, 'Unexpected bank size: update release expectations explicitly'
added=[q for q in questions if q['id'] not in {b['id'] for b in baseline}]
assert len(added)==16 and all(q['pool']=='pilot_daily' and not q['ranked_eligible'] for q in added)
assert sum(q['ranked_eligible'] for q in questions)==360
files={}
archive=output/'nalarin-daily-v2-456.tar.gz'
with tarfile.open(archive,'w:gz') as tar:
    for name in ['questions.json','passages.json','modules.json']:
        source=(root/'bank'/name).read_bytes()
        runtime=(root/'tka-app/server/content'/name).read_bytes()
        assert source==runtime, 'Runtime content differs: '+name
        if name!='questions.json':
            old=json.loads(subprocess.check_output(['git','show','5b879fd:bank/'+name],cwd=root))
            assert json.loads(source)==old, 'Unexpected passage/module change'
        info=tarfile.TarInfo(name); info.size=len(source); info.mode=0o644
        tar.addfile(info,io.BytesIO(source))
        files[name]=hashlib.sha256(source).hexdigest()
with tarfile.open(archive) as tar:
    assert sorted(tar.getnames())==sorted(files)
    for name,digest in files.items():
        assert hashlib.sha256(tar.extractfile(name).read()).hexdigest()==digest
manifest=dict(status='prepared_not_deployed',total=456,ranked=360,daily=96,
    baseline='5b879fd',existing_questions_preserved=len(baseline),
    added_ids=[q['id'] for q in added],independent_review='pending for 16 new daily items',
    files_sha256=files,archive_sha256=hashlib.sha256(archive.read_bytes()).hexdigest())
(output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(archive=str(archive),**manifest),indent=2))
