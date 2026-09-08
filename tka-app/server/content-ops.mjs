// Host-only maintenance; no public admin endpoint and no separate dashboard required.
import Database from 'better-sqlite3';
import {installContentTables,voidQuestion} from './content-review.mjs';
const db=new Database(process.env.TKA_DB_PATH||'/var/lib/tka-mdc/tka.sqlite');db.pragma('foreign_keys=ON');installContentTables(db);
const [action,id,version,...reason]=process.argv.slice(2);
if(action==='reports')console.log(JSON.stringify(db.prepare("SELECT question_id,question_version,reason,COUNT(*) AS count FROM content_reports WHERE status='open' GROUP BY question_id,question_version,reason").all(),null,2));
else if(action==='void'&&id&&Number.isInteger(Number(version)))console.log(JSON.stringify(voidQuestion(db,id,Number(version),reason.join(' '))));
else throw Error('Usage: content-ops.mjs reports | void QUESTION_ID VERSION "reviewed correction reason"');
db.close();
