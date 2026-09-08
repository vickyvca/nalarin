import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.TKA_CONTENT_DIR || path.resolve(here, '..', 'content');
const questions = JSON.parse(fs.readFileSync(path.join(contentDir, 'questions.json'), 'utf8'));
const targets = [
  [6, 'matematika'],
  [6, 'bahasa_indonesia'],
  [9, 'matematika'],
  [9, 'bahasa_indonesia'],
];
const report = targets.map(([grade, subject]) => {
  const rows = questions.filter((question) => question.grade === grade && question.subject === subject && question.ranked_eligible);
  const groups = new Set(rows.map((question) => question.stimulus_id || question.family_id));
  return { grade, subject, required: 30, available: rows.length, missing: Math.max(0, 30 - rows.length), distinct_groups: groups.size, status: rows.length >= 30 ? 'ready_for_editor_review' : 'blocked' };
});
console.log(JSON.stringify({ generated_at: new Date().toISOString(), total_ranked_eligible: questions.filter((question) => question.ranked_eligible).length, report }, null, 2));
