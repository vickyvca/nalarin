import express from 'express';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installFeatures } from './features.mjs';
import { readyPackages, BLUEPRINT_VERSION, SCORING_VERSION } from './packages.mjs';
import {installContentTables,correctAnswer,voidedQuestions,calculateScore} from './content-review.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const contentDir = process.env.TKA_CONTENT_DIR || path.join(__dirname, 'content');
const dbPath = process.env.TKA_DB_PATH || path.join(__dirname, 'data', 'tka.sqlite');
const port = Number(process.env.PORT || 18186);
const sessionDays = Number(process.env.TKA_SESSION_DAYS || 30);
const allowDemoAuth = process.env.ALLOW_DEMO_AUTH === 'true';
const frontendUrl = process.env.TKA_FRONTEND_URL || 'http://127.0.0.1:5173';
const sessionCookieSecure = process.env.NODE_ENV === 'production';
const tutorPersona = process.env.TKA_TUTOR_PERSONA || 'Kak Nara';

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    email TEXT,
    display_name TEXT,
    username TEXT,
    password_salt TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'learner',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(provider, provider_subject)
  );
  CREATE TABLE IF NOT EXISTS learners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    grade INTEGER,
    school TEXT,
    school_key TEXT,
    city TEXT,
    ranking_opt_in INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    learner_id INTEGER REFERENCES learners(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS oauth_states (
    state_hash TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    learner_id INTEGER NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK(mode IN ('daily', 'ranked')),
    subject TEXT NOT NULL,
    grade INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'submitted', 'expired', 'cancelled')),
    idempotency_key TEXT,
    week_start TEXT NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT,
    submitted_at TEXT,
    score REAL,
    correct_count INTEGER,
    total_count INTEGER,
    created_at TEXT NOT NULL,
    UNIQUE(learner_id, idempotency_key)
  );
  CREATE TABLE IF NOT EXISTS attempt_questions (
    attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    question_version INTEGER NOT NULL,
    PRIMARY KEY(attempt_id, position),
    UNIQUE(attempt_id, question_id)
  );
  CREATE TABLE IF NOT EXISTS responses (
    attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer_json TEXT NOT NULL,
    flagged INTEGER NOT NULL DEFAULT 0,
    saved_at TEXT NOT NULL,
    PRIMARY KEY(attempt_id, question_id)
  );
`);
for (const statement of [
  'ALTER TABLE accounts ADD COLUMN username TEXT',
  'ALTER TABLE accounts ADD COLUMN password_salt TEXT',
  'ALTER TABLE accounts ADD COLUMN password_hash TEXT',
  'ALTER TABLE accounts ADD COLUMN recovery_hash TEXT',
  'ALTER TABLE accounts ADD COLUMN role TEXT NOT NULL DEFAULT \'learner\'',
  'ALTER TABLE learners ADD COLUMN school_key TEXT',
  'ALTER TABLE attempts ADD COLUMN module_id TEXT',
  'ALTER TABLE attempt_questions ADD COLUMN snapshot_json TEXT',
  'ALTER TABLE attempts ADD COLUMN pack_id TEXT',
  'ALTER TABLE attempts ADD COLUMN blueprint_version TEXT',
  'ALTER TABLE attempts ADD COLUMN scoring_version TEXT',
  'ALTER TABLE attempts ADD COLUMN ranking_invalid INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE attempts ADD COLUMN correction_note TEXT',
]) {
  try { db.exec(statement); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
}
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS accounts_username_unique ON accounts(username) WHERE username IS NOT NULL');
db.exec(`CREATE TABLE IF NOT EXISTS teacher_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  school TEXT NOT NULL,
  school_key TEXT,
  city TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`);
try { db.exec('ALTER TABLE teacher_profiles ADD COLUMN school_key TEXT'); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
db.exec('CREATE INDEX IF NOT EXISTS learners_school_key_idx ON learners(school_key)');

function readJson(fileName, fallback) {
  const filePath = path.join(contentDir, fileName);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const questions = readJson('questions.json', []);
const passages = readJson('passages.json', []);
const modules = readJson('modules.json', []);
const passageById = new Map(passages.map((passage) => [passage.id, passage]));
const questionById = new Map(questions.map((question) => [question.id, question]));
for (const row of db.prepare('SELECT attempt_id,question_id FROM attempt_questions WHERE snapshot_json IS NULL').all()) {
  const question=questionById.get(row.question_id);
  if(question) db.prepare('UPDATE attempt_questions SET snapshot_json=? WHERE attempt_id=? AND question_id=?').run(JSON.stringify({...question,passage_snapshot:passageById.get(question.stimulus_id)||null}),row.attempt_id,row.question_id);
}

function nowIso() {
  return new Date().toISOString();
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
    const index = chunk.indexOf('=');
    return index < 0 ? [chunk, ''] : [chunk.slice(0, index), decodeURIComponent(chunk.slice(index + 1))];
  }));
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.secure) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0, secure: sessionCookieSecure });
}

function normalizeGrade(value) {
  const grade = Number(value);
  return grade === 6 || grade === 9 ? grade : null;
}

function normalizeSchoolLabel(value) {
  const label = String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, 120);
  if (!label) return null;
  return label.replace(/\b(sdn|sd|smp|sma|smk|mtsn|mts|mi|man|ma)\b/gi, (prefix) => {
    const upper = prefix.toLowerCase();
    return { sdn: 'SDN', sd: 'SD', smp: 'SMP', sma: 'SMA', smk: 'SMK', mtsn: 'MTsN', mts: 'MTs', mi: 'MI', man: 'MAN', ma: 'MA' }[upper] || prefix;
  });
}

function normalizeSchoolKey(value) {
  const source = normalizeSchoolLabel(value);
  if (!source) return null;
  return source.toLocaleUpperCase('id-ID')
    .replace(/\bSEKOLAH DASAR\b/g, 'SD')
    .replace(/\bSEKOLAH MENENGAH PERTAMA\b/g, 'SMP')
    .replace(/\bSEKOLAH MENENGAH ATAS\b/g, 'SMA')
    .replace(/\bSEKOLAH MENENGAH KEJURUAN\b/g, 'SMK')
    .replace(/\bMADRASAH TSANAWIYAH\b/g, 'MTS')
    .replace(/\bMADRASAH IBTIDAIYAH\b/g, 'MI')
    .replace(/\bSD\s+NEGERI\b/g, 'SDN')
    .replace(/\bSMP\s+NEGERI\b/g, 'SMPN')
    .replace(/\bSMA\s+NEGERI\b/g, 'SMAN')
    .replace(/\bSMK\s+NEGERI\b/g, 'SMKN')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const school of db.prepare('SELECT id, school FROM learners WHERE school IS NOT NULL').all()) {
  const label = normalizeSchoolLabel(school.school);
  db.prepare('UPDATE learners SET school = ?, school_key = ? WHERE id = ?').run(label, normalizeSchoolKey(label), school.id);
}
for (const school of db.prepare('SELECT id, school FROM teacher_profiles WHERE school IS NOT NULL').all()) {
  const label = normalizeSchoolLabel(school.school);
  db.prepare('UPDATE teacher_profiles SET school = ?, school_key = ? WHERE id = ?').run(label, normalizeSchoolKey(label), school.id);
}

function normalizeUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{3,23}$/.test(username) ? username : null;
}

function normalizePin(value) {
  const pin = String(value || '').trim();
  return /^\d{6}$/.test(pin) ? pin : null;
}

function passwordDigest(pin, salt) {
  return crypto.scryptSync(pin, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }).toString('hex');
}

function passwordMatches(pin, salt, digest) {
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, 'hex');
  const actual = Buffer.from(passwordDigest(pin, salt), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const loginFailures = new Map();
function loginRateKey(req, username) {
  return `${req.ip || req.socket.remoteAddress || 'unknown'}:${username}`;
}

function loginBlocked(req, username) {
  const row = loginFailures.get(loginRateKey(req, username));
  if (!row) return false;
  if (Date.now() >= row.resetAt) {
    loginFailures.delete(loginRateKey(req, username));
    return false;
  }
  return row.count >= 5;
}

function recordLoginFailure(req, username) {
  const key = loginRateKey(req, username);
  const row = loginFailures.get(key);
  const next = row && Date.now() < row.resetAt ? row : { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  next.count += 1;
  loginFailures.set(key, next);
}

function clearLoginFailures(req, username) {
  loginFailures.delete(loginRateKey(req, username));
}

function normalizeSubject(value) {
  if (value === 'math' || value === 'matematika') return 'matematika';
  if (value === 'bahasa' || value === 'bahasa_indonesia' || value === 'Bahasa Indonesia') return 'bahasa_indonesia';
  return null;
}

function slug(value) {
  return String(value || 'demo').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'demo';
}

function weekStartWib(date = new Date()) {
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  shifted.setUTCHours(0, 0, 0, 0);
  const mondayOffset = (shifted.getUTCDay() + 6) % 7;
  shifted.setUTCDate(shifted.getUTCDate() - mondayOffset);
  return shifted.toISOString().slice(0, 10);
}

function accountRow(accountId) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
}

function learnerRow(learnerId) {
  return learnerId ? db.prepare('SELECT * FROM learners WHERE id = ?').get(learnerId) : null;
}

function teacherRow(accountId) {
  return accountId ? db.prepare('SELECT * FROM teacher_profiles WHERE account_id = ?').get(accountId) : null;
}

function publicUser(account, learner, teacher = null) {
  return {
    id: account?.id,
    provider: account?.provider,
    username: account?.username || null,
    email: account?.email || null,
    display_name: account?.display_name || null,
    role: account?.role || (teacher ? 'teacher' : 'learner'),
    learner: learner ? {
      id: learner.id,
      nickname: learner.nickname,
      grade: learner.grade,
      school: learner.school,
      city: learner.city,
      ranking_opt_in: Boolean(learner.ranking_opt_in),
    } : null,
    teacher: teacher ? {
      id: teacher.id,
      nickname: teacher.nickname,
      school: teacher.school,
      city: teacher.city,
    } : null,
    needs_profile: teacher ? false : !learner || !learner.grade || !learner.nickname,
  };
}

function createAccount(provider, providerSubject, profile = {}) {
  const timestamp = nowIso();
  const existing = db.prepare('SELECT * FROM accounts WHERE provider = ? AND provider_subject = ?').get(provider, providerSubject);
  if (existing) {
    db.prepare('UPDATE accounts SET email = ?, display_name = ?, updated_at = ? WHERE id = ?').run(profile.email || existing.email, profile.display_name || existing.display_name, timestamp, existing.id);
    return accountRow(existing.id);
  }
  const result = db.prepare('INSERT INTO accounts(provider, provider_subject, email, display_name, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?)').run(provider, providerSubject, profile.email || null, profile.display_name || null, timestamp, timestamp);
  return accountRow(result.lastInsertRowid);
}

function createLocalAccount(username, pin, profile = {}) {
  const timestamp = nowIso();
  const salt = randomToken();
  const digest = passwordDigest(pin, salt);
  const result = db.prepare('INSERT INTO accounts(provider, provider_subject, email, display_name, username, password_salt, password_hash, role, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run('local', username, null, profile.display_name || profile.nickname || username, username, salt, digest, profile.role || 'learner', timestamp, timestamp);
  return accountRow(result.lastInsertRowid);
}

function createLearner(accountId, profile) {
  const timestamp = nowIso();
  const school = normalizeSchoolLabel(profile.school);
  const result = db.prepare('INSERT INTO learners(account_id, nickname, grade, school, school_key, city, ranking_opt_in, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)').run(accountId, profile.nickname, normalizeGrade(profile.grade), school, normalizeSchoolKey(school), profile.city || null, profile.ranking_opt_in === false ? 0 : 1, timestamp, timestamp);
  return learnerRow(result.lastInsertRowid);
}

function createTeacherProfile(accountId, profile) {
  const timestamp = nowIso();
  const school = normalizeSchoolLabel(profile.school);
  db.prepare('INSERT INTO teacher_profiles(account_id, nickname, school, school_key, city, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?)').run(accountId, profile.nickname, school, normalizeSchoolKey(school), profile.city || null, timestamp, timestamp);
  return teacherRow(accountId);
}

function getSession(req) {
  const token = parseCookies(req.headers.cookie).tka_session;
  if (!token) return null;
  const session = db.prepare('SELECT * FROM sessions WHERE token_hash = ?').get(hash(token));
  if (!session) return null;
  if (new Date(session.expires_at) <= new Date()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(session.token_hash);
    return null;
  }
  return { ...session, account: accountRow(session.account_id), learner: learnerRow(session.learner_id) };
}

function setSession(res, accountId, learnerId = null) {
  const token = randomToken();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + sessionDays * 24 * 60 * 60 * 1000);
  db.prepare('INSERT INTO sessions(token_hash, account_id, learner_id, created_at, expires_at) VALUES(?, ?, ?, ?, ?)').run(hash(token), accountId, learnerId, createdAt.toISOString(), expiresAt.toISOString());
  setCookie(res, 'tka_session', token, { maxAge: sessionDays * 24 * 60 * 60, secure: sessionCookieSecure });
}

function requireSession(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'auth_required', message: 'Silakan masuk terlebih dahulu.' });
  req.session = session;
  next();
}

function requireTeacher(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'auth_required', message: 'Silakan masuk terlebih dahulu.' });
  if (session.account?.role !== 'teacher' || !teacherRow(session.account_id)) return res.status(403).json({ error: 'teacher_only', message: 'Halaman ini khusus akun guru.' });
  req.session = session;
  req.session.teacher = teacherRow(session.account_id);
  next();
}

function requireLearner(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'auth_required', message: 'Silakan masuk terlebih dahulu.' });
  if (session.account?.role === 'teacher') return res.status(403).json({ error: 'learner_only', message: 'Fitur ini khusus akun murid.' });
  if (!session.learner || !session.learner.grade) return res.status(409).json({ error: 'profile_incomplete', message: 'Lengkapi kelas dan nama panggilan sebelum mulai belajar.' });
  req.session = session;
  next();
}

function shuffle(items) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = crypto.randomInt(index + 1);
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}

function safeQuestion(question) {
  const passage = question.passage_snapshot || (question.stimulus_id ? passageById.get(question.stimulus_id) : null);
  return {
    id: question.id,
    version: question.version,
    grade: question.grade,
    subject: question.subject,
    type: question.type === 'PGK_MCMA' ? 'MCMA' : question.type === 'PGK_CATEGORY' ? 'CATEGORY' : 'PG',
    topic: question.competency,
    module_id: question.module_id,
    prompt: question.stem,
    diagram: question.diagram || null,
    options: question.options,
    category_labels: question.category_labels,
    passage: passage ? { id: passage.id, title: passage.title, text: passage.text } : null,
  };
}

function availableQuestions() {
  const excluded=new Set(db.prepare("SELECT question_id||':'||question_version AS key FROM content_decisions WHERE status='void'").all().map(r=>r.key));
  return questions.filter(q=>!excluded.has(`${q.id}:${q.version}`));
}

function selectPackage(grade, subject, mode, learnerId, moduleId = null) {
  const total = mode === 'ranked' ? 30 : moduleId ? 5 : 10;
  const available=availableQuestions();
  const pool = available.filter((question) => question.grade === grade && question.subject === subject && (!moduleId || question.module_id === moduleId) && (mode === 'ranked' ? question.ranked_eligible : question.pool === 'pilot_daily'));
  if(mode==='ranked'){
    const packs=readyPackages(available,passages,grade,subject);
    const used=new Set(db.prepare("SELECT pack_id FROM attempts WHERE learner_id=? AND mode='ranked' AND week_start=? AND ranking_invalid=0").all(learnerId,weekStartWib()).map(a=>a.pack_id));
    // Use each package once per week when possible, then rotate through the
    // full package set so ranked sessions remain available without a quota.
    const freshPacks=packs.filter(p=>!used.has(p.id));
    const candidates=shuffle(freshPacks.length ? freshPacks : packs);
    const last=new Map(db.prepare("SELECT pack_id,MAX(started_at) AS last FROM attempts WHERE learner_id=? AND mode='ranked' GROUP BY pack_id").all(learnerId).map(a=>[a.pack_id,a.last]));
    candidates.sort((a,b)=>(last.get(a.id)||'').localeCompare(last.get(b.id)||''));
    const chosen=candidates[0];
    if(!chosen)return {poolSize:pool.length,total,selected:[]};
    let selected;
    if(subject==='matematika')selected=shuffle(chosen.rows);
    else {const ids=shuffle([...new Set(chosen.rows.map(q=>q.stimulus_id))]);selected=ids.flatMap(id=>chosen.rows.filter(q=>q.stimulus_id===id));}
    return {poolSize:pool.length,total,selected,pack_id:chosen.id};
  }
  const seenRows = db.prepare(`SELECT aq.question_id FROM attempt_questions aq JOIN attempts a ON a.id = aq.attempt_id WHERE a.learner_id = ? AND a.status IN ('submitted', 'expired') AND a.subject = ?`).all(learnerId, subject);
  const seen = new Set(seenRows.map((row) => row.question_id));
  const groups = new Map();
  for (const question of pool) {
    const groupKey = question.stimulus_id || question.family_id;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(question);
  }
  const freshGroups = shuffle([...groups.values()].filter((group) => group.some((question) => !seen.has(question.id))));
  const oldGroups = shuffle([...groups.values()].filter((group) => group.every((question) => seen.has(question.id))));
  const result = [];
  for (const group of [...freshGroups, ...oldGroups]) {
    const ordered = shuffle(group.filter((question) => !seen.has(question.id))).concat(shuffle(group.filter((question) => seen.has(question.id))));
    for (const question of ordered) {
      result.push(question);
      if(subject==='matematika'&&!moduleId)break;
      if (result.length === total) break;
    }
    if (result.length === total) break;
  }
  return { poolSize: pool.length, selected: result, total: moduleId && mode !== 'ranked' ? Math.min(total, pool.length) : total };
}

function responseValue(question, value) {
  if (question.type === 'PG' || question.type === 'PGK_MCMA') {
    if (!Array.isArray(value)) return null;
    const options = new Set(question.options.map((option) => option.id));
    const unique = [...new Set(value.map((item) => String(item)))];
    if (unique.some((item) => !options.has(item))) return null;
    if (question.type === 'PG' && unique.length > 1) return null;
    return unique;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const labels = new Set(question.category_labels || []);
  const keys = question.options.map((option) => option.id);
  if (Object.keys(value).some((key) => !keys.includes(key) || !labels.has(value[key]))) return null;
  return Object.fromEntries(keys.filter((key) => value[key] !== undefined).map((key) => [key, String(value[key])]));
}

function isCorrect(question, response) {
  return correctAnswer(question,response);
}

function attemptRow(attemptId, learnerId) {
  return db.prepare('SELECT * FROM attempts WHERE id = ? AND learner_id = ?').get(attemptId, learnerId);
}

function attemptQuestions(attemptId) {
  return db.prepare('SELECT * FROM attempt_questions WHERE attempt_id = ? ORDER BY position').all(attemptId).map((row) => ({ ...row, question: row.snapshot_json ? JSON.parse(row.snapshot_json) : questionById.get(row.question_id) })).filter((row) => row.question);
}

function attemptResponses(attemptId) {
  return new Map(db.prepare('SELECT * FROM responses WHERE attempt_id = ?').all(attemptId).map((row) => [row.question_id, { value: JSON.parse(row.answer_json), flagged: Boolean(row.flagged), saved_at: row.saved_at }]));
}

function scoreAttempt(attempt) {
  const items = attemptQuestions(attempt.id);
  const responses = attemptResponses(attempt.id);
  return calculateScore(items,responses,voidedQuestions(db));
}

function reviewAttempt(attempt) {
  const responses = attemptResponses(attempt.id);
  const voided=voidedQuestions(db);
  return attemptQuestions(attempt.id).map((item) => {
    const response = responses.get(item.question_id);
    const voidReason=voided.get(`${item.question.id}:${item.question.version}`)||null;
    return {
      question: safeQuestion(item.question),
      response: response?.value || null,
      flagged: response?.flagged || false,
      correct_answer: item.question.answer,
      correct: isCorrect(item.question, response?.value),
      void_reason: voidReason,
      explanation: item.question.explanation,
    };
  });
}

function publicAttempt(attempt, includeReview = false) {
  const items = attemptQuestions(attempt.id);
  const responses = attemptResponses(attempt.id);
  const expired = attempt.status === 'active' && attempt.expires_at && new Date(attempt.expires_at) <= new Date();
  return {
    id: attempt.id,
    mode: attempt.mode,
    module_id: attempt.module_id,
    blueprint_version: attempt.blueprint_version,
    scoring_version: attempt.scoring_version,
    ranking_invalid: Boolean(attempt.ranking_invalid),
    correction_note: attempt.correction_note || null,
    subject: attempt.subject,
    grade: attempt.grade,
    status: expired ? 'expired' : attempt.status,
    started_at: attempt.started_at,
    expires_at: attempt.expires_at,
    submitted_at: attempt.submitted_at,
    score: attempt.score,
    correct_count: attempt.correct_count,
    total_count: attempt.total_count || items.length,
    questions: items.map((item, index) => ({ position: index + 1, ...safeQuestion(item.question), response: responses.get(item.question_id)?.value || null, flagged: responses.get(item.question_id)?.flagged || false })),
    review: includeReview ? reviewAttempt(attempt) : undefined,
  };
}

function finalizeAttempt(attempt, status = 'submitted') {
  const result = scoreAttempt(attempt);
  const submittedAt = nowIso();
  db.prepare('UPDATE attempts SET status = ?, submitted_at = ?, score = ?, correct_count = ?, total_count = ? WHERE id = ?').run(status, submittedAt, result.score, result.correct, result.total, attempt.id);
  if(result.voided)db.prepare('UPDATE attempts SET ranking_invalid=?,correction_note=? WHERE id=?').run(Number(result.ranking_invalid),`${result.voided} soal dibatalkan. Nilai dihitung dari ${result.total} soal.${result.ranking_invalid&&attempt.mode==='ranked'?' Sesi dikeluarkan dari peringkat.':''}`,attempt.id);
  return db.prepare('SELECT * FROM attempts WHERE id = ?').get(attempt.id);
}

function expireIfNeeded(attempt) {
  if (attempt.status === 'active' && attempt.expires_at && new Date(attempt.expires_at) <= new Date()) return finalizeAttempt(attempt, 'expired');
  return attempt;
}

function rankedCount(learnerId, weekStart) {
  return db.prepare("SELECT COUNT(*) AS count FROM attempts WHERE learner_id = ? AND mode = 'ranked' AND ranking_invalid=0 AND week_start = ? AND status IN ('active', 'submitted', 'expired')").get(learnerId, weekStart).count;
}

const app = express();
installContentTables(db);
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && req.headers.origin !== new URL(frontendUrl).origin && req.headers.origin !== process.env.TKA_CORS_ORIGIN) return res.status(403).json({ message: 'Permintaan harus berasal dari Nalarin.' });
  if (process.env.TKA_CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', process.env.TKA_CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});

installFeatures({ app, db, questions, passages, availableQuestions, modules, requireLearner, requireSession, publicAttempt, expireIfNeeded, attemptRow, attemptQuestions, attemptResponses, isCorrect, weekStartWib, rankedCount, normalizeUsername, normalizePin, passwordDigest, passwordMatches, randomToken, hash, nowIso, setSession, publicUser, learnerRow, accountRow });

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'tka-mdc-api', content_questions: questions.length, content_modules: modules.length, ranked_questions: questions.filter((question) => question.ranked_eligible).length, demo_auth: allowDemoAuth }));

app.get('/api/auth/config', (_req, res) => res.json({ local_enabled: true, google_enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI), demo_enabled: allowDemoAuth }));

app.post('/api/auth/register', (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const pin = normalizePin(req.body?.pin);
  const nickname = String(req.body?.nickname || '').trim().slice(0, 60);
  const grade = normalizeGrade(req.body?.grade);
  if (!username) return res.status(400).json({ error: 'invalid_username', message: 'Username 4–24 karakter: huruf kecil, angka, titik, strip, atau garis bawah.' });
  if (!pin) return res.status(400).json({ error: 'invalid_pin', message: 'Kode masuk harus tepat 6 angka.' });
  if (nickname.length < 2) return res.status(400).json({ error: 'invalid_nickname', message: 'Nama panggilan minimal 2 karakter.' });
  if (!grade) return res.status(400).json({ error: 'invalid_grade', message: 'Pilih kelas 6 atau kelas 9.' });
  const exists = db.prepare('SELECT id FROM accounts WHERE username = ?').get(username);
  if (exists) return res.status(409).json({ error: 'username_taken', message: 'Username itu sudah dipakai. Coba nama lain.' });
  try {
    const create = db.transaction(() => {
      const account = createLocalAccount(username, pin, { display_name: nickname });
      const learner = createLearner(account.id, {
        nickname,
        grade,
        school: normalizeSchoolLabel(req.body?.school),
        city: String(req.body?.city || '').trim().slice(0, 80) || null,
      });
      return { account, learner };
    });
    const { account, learner } = create();
    setSession(res, account.id, learner.id);
    res.status(201).json({ user: publicUser(accountRow(account.id), learner) });
  } catch (error) {
    if (String(error?.code || '').includes('SQLITE_CONSTRAINT') || String(error?.message || '').includes('UNIQUE constraint failed: accounts.username')) {
      return res.status(409).json({ error: 'username_taken', message: 'Username itu sudah dipakai. Coba nama lain.' });
    }
    throw error;
  }
});

app.post('/api/auth/teacher/register', (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const pin = normalizePin(req.body?.pin);
  const nickname = String(req.body?.nickname || '').trim().slice(0, 60);
  const school = normalizeSchoolLabel(req.body?.school) || '';
  const city = String(req.body?.city || '').trim().slice(0, 80) || null;
  if (!username) return res.status(400).json({ error: 'invalid_username', message: 'Username 4–24 karakter: huruf kecil, angka, titik, strip, atau garis bawah.' });
  if (!pin) return res.status(400).json({ error: 'invalid_pin', message: 'Kode masuk harus tepat 6 angka.' });
  if (nickname.length < 2) return res.status(400).json({ error: 'invalid_nickname', message: 'Nama panggilan minimal 2 karakter.' });
  if (school.length < 2) return res.status(400).json({ error: 'invalid_school', message: 'Nama sekolah wajib diisi.' });
  if (db.prepare('SELECT id FROM accounts WHERE username = ?').get(username)) return res.status(409).json({ error: 'username_taken', message: 'Username itu sudah dipakai. Coba nama lain.' });
  try {
    const create = db.transaction(() => {
      const account = createLocalAccount(username, pin, { display_name: nickname, role: 'teacher' });
      const teacher = createTeacherProfile(account.id, { nickname, school, city });
      return { account, teacher };
    });
    const { account, teacher } = create();
    setSession(res, account.id, null);
    res.status(201).json({ user: publicUser(accountRow(account.id), null, teacher) });
  } catch (error) {
    if (String(error?.code || '').includes('SQLITE_CONSTRAINT') || String(error?.message || '').includes('UNIQUE constraint failed: accounts.username')) return res.status(409).json({ error: 'username_taken', message: 'Username itu sudah dipakai. Coba nama lain.' });
    throw error;
  }
});

app.post('/api/auth/login', (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const pin = normalizePin(req.body?.pin);
  if (!username || !pin) return res.status(400).json({ error: 'invalid_login', message: 'Isi username dan kode masuk 6 angka.' });
  if (loginBlocked(req, username)) return res.status(429).json({ error: 'too_many_attempts', message: 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.' });
  const account = db.prepare('SELECT * FROM accounts WHERE provider = \'local\' AND username = ?').get(username);
  if (!account || !passwordMatches(pin, account.password_salt, account.password_hash)) {
    recordLoginFailure(req, username);
    return res.status(401).json({ error: 'invalid_login', message: 'Username atau kode masuk belum cocok.' });
  }
  clearLoginFailures(req, username);
  const learner = account.role === 'teacher' ? null : db.prepare('SELECT * FROM learners WHERE account_id = ? ORDER BY id LIMIT 1').get(account.id);
  const teacher = account.role === 'teacher' ? teacherRow(account.id) : null;
  if (account.role === 'teacher' && !teacher) return res.status(403).json({ error: 'teacher_profile_missing', message: 'Profil guru belum lengkap.' });
  setSession(res, account.id, learner?.id || null);
  res.json({ user: publicUser(account, learner, teacher) });
});

app.get('/api/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) return res.status(503).json({ error: 'google_not_configured', message: 'Login Google belum dikonfigurasi di server.' });
  const state = randomToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO oauth_states(state_hash, created_at, expires_at) VALUES(?, ?, ?)').run(hash(state), nowIso(), expiresAt);
  setCookie(res, 'tka_oauth_state', state, { maxAge: 600, secure: sessionCookieSecure });
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: process.env.GOOGLE_REDIRECT_URI, response_type: 'code', scope: 'openid email profile', access_type: 'online', state, prompt: 'select_account' });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get('/api/auth/google/callback', async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) return res.status(503).send('Google OAuth belum dikonfigurasi.');
  const state = String(req.query.state || '');
  const stateCookie = parseCookies(req.headers.cookie).tka_oauth_state;
  const stateRow = db.prepare('SELECT * FROM oauth_states WHERE state_hash = ? AND expires_at > ?').get(hash(state), nowIso());
  db.prepare('DELETE FROM oauth_states WHERE state_hash = ?').run(hash(state));
  if (!state || !stateCookie || state !== stateCookie || !stateRow) return res.status(400).send('Sesi login tidak valid atau sudah kedaluwarsa.');
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: String(req.query.code || ''), client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.GOOGLE_REDIRECT_URI, grant_type: 'authorization_code' }) });
    if (!tokenResponse.ok) throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
    const token = await tokenResponse.json();
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!profileResponse.ok) throw new Error(`Google userinfo failed: ${profileResponse.status}`);
    const profile = await profileResponse.json();
    const account = createAccount('google', profile.sub, { email: profile.email, display_name: profile.name || profile.email });
    const learner = db.prepare('SELECT * FROM learners WHERE account_id = ? ORDER BY id LIMIT 1').get(account.id);
    setSession(res, account.id, learner?.id || null);
    clearCookie(res, 'tka_oauth_state');
    return res.redirect(`${frontendUrl}/?auth=success${learner ? '' : '&profile=required'}`);
  } catch (error) {
    console.error(error);
    return res.status(502).send('Login Google gagal diproses.');
  }
});

app.post('/api/dev/session', (req, res) => {
  if (!allowDemoAuth) return res.status(404).json({ error: 'not_found' });
  const nickname = String(req.body?.nickname || 'Alya').trim().slice(0, 60) || 'Alya';
  const grade = normalizeGrade(req.body?.grade || 6) || 6;
  const subject = slug(`${nickname}-${grade}`);
  const account = createAccount('demo', subject, { email: `${subject}@demo.tka.mdc.web.id`, display_name: nickname });
  let learner = db.prepare('SELECT * FROM learners WHERE account_id = ? ORDER BY id LIMIT 1').get(account.id);
  if (!learner) learner = createLearner(account.id, { nickname, grade, school: req.body?.school || 'Demo School', city: req.body?.city || 'Jawa Tengah' });
  setSession(res, account.id, learner.id);
  res.json({ user: publicUser(accountRow(account.id), learner) });
});

app.get('/api/me', requireSession, (req, res) => res.json({ user: publicUser(req.session.account, req.session.learner, req.session.account?.role === 'teacher' ? teacherRow(req.session.account_id) : null) }));

app.post('/api/auth/logout', requireSession, (req, res) => {
  const token = parseCookies(req.headers.cookie).tka_session;
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hash(token));
  clearCookie(res, 'tka_session');
  res.status(204).end();
});

app.put('/api/me/learner', requireSession, (req, res) => {
  if (req.session.account?.role === 'teacher') return res.status(403).json({ error: 'learner_only', message: 'Profil ini khusus akun murid.' });
  const nickname = String(req.body?.nickname || '').trim().slice(0, 60);
  const grade = normalizeGrade(req.body?.grade);
  if (req.session.learner?.grade && grade !== req.session.learner.grade) return res.status(409).json({message:'Kelas akun tetap selama periode latihan ini.'});
  if (!nickname || !grade) return res.status(400).json({ error: 'invalid_profile', message: 'Nama panggilan dan kelas 6 atau 9 wajib diisi.' });
  const timestamp = nowIso();
  let learner = req.session.learner;
  if (!learner) learner = createLearner(req.session.account_id, { nickname, grade, school: req.body?.school, city: req.body?.city, ranking_opt_in: req.body?.ranking_opt_in });
  else {
    const school = normalizeSchoolLabel(req.body?.school);
    db.prepare('UPDATE learners SET nickname = ?, grade = ?, school = ?, school_key = ?, city = ?, ranking_opt_in = ?, updated_at = ? WHERE id = ?').run(nickname, grade, school, normalizeSchoolKey(school), String(req.body?.city||'').trim().slice(0,80)||null, req.body?.ranking_opt_in === false ? 0 : 1, timestamp, learner.id);
    learner = learnerRow(learner.id);
  }
  db.prepare('UPDATE sessions SET learner_id = ? WHERE token_hash = ?').run(learner.id, req.session.token_hash);
  res.json({ user: publicUser(accountRow(req.session.account_id), learner) });
});

app.get('/api/modules', requireLearner, (req, res) => {
  const grade = normalizeGrade(req.query.grade) || req.session.learner.grade;
  const subject = normalizeSubject(req.query.subject);
  const result = modules.filter((module) => module.grade === grade && (!subject || module.subject === subject)).map(({ id, grade: moduleGrade, subject: moduleSubject, title, objective, key_points, example, common_mistake, next_action }) => ({ id, grade: moduleGrade, subject: moduleSubject, title, objective, key_points, example, common_mistake, next_action }));
  res.json({ modules: result });
});

app.get('/api/practice', requireLearner, (req, res) => {
  const grade = normalizeGrade(req.query.grade) || req.session.learner.grade;
  const subject = normalizeSubject(req.query.subject) || 'matematika';
  const selected = selectPackage(grade, subject, 'daily', req.session.learner.id).selected;
  res.json({ grade, subject, available: selected.length > 0, questions: selected.map(safeQuestion), count: selected.length });
});

app.post('/api/attempts', requireLearner, (req, res) => {
  const mode = req.body?.mode === 'ranked' ? 'ranked' : 'daily';
  const subject = normalizeSubject(req.body?.subject);
  if (!subject) return res.status(400).json({ error: 'invalid_subject' });
  const idempotencyKey = String(req.body?.idempotency_key || '').trim().slice(0, 120) || null;
  if (idempotencyKey) {
    const existing = db.prepare('SELECT * FROM attempts WHERE learner_id = ? AND idempotency_key = ?').get(req.session.learner.id, idempotencyKey);
    if (existing) return res.json({ attempt: publicAttempt(expireIfNeeded(existing), false) });
  }
  const weekStart = weekStartWib();
  const active = db.prepare("SELECT * FROM attempts WHERE learner_id = ? AND status = 'active' ORDER BY started_at DESC").all(req.session.learner.id).map(expireIfNeeded).find(a => a.status === 'active');
  if (active) return res.json({ attempt: publicAttempt(active) });
  const moduleId = mode === 'daily' ? String(req.body?.module_id || '') || null : null;
  const packageData = selectPackage(req.session.learner.grade, subject, mode, req.session.learner.id, moduleId);
  if (!packageData.total) return res.status(409).json({ message: 'Soal materi ini belum tersedia.' });
  if (packageData.selected.length < packageData.total) return res.status(409).json({ error: mode === 'ranked' ? 'ranked_unavailable' : 'content_insufficient', message: mode === 'ranked' ? 'Sesi penilaian belum tersedia untuk mapel ini.' : 'Soal latihan belum cukup untuk paket ini.', available: packageData.selected.length, requested: packageData.total });
  const attemptId = crypto.randomUUID();
  const startedAt = new Date();
  const expiresAt = mode === 'ranked' ? addMinutes(startedAt, 75) : null;
  const insert = db.transaction(() => {
    db.prepare('INSERT INTO attempts(id, learner_id, mode, subject, grade, status, idempotency_key, week_start, started_at, expires_at, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(attemptId, req.session.learner.id, mode, subject, req.session.learner.grade, 'active', idempotencyKey, weekStart, startedAt.toISOString(), expiresAt, startedAt.toISOString());
    db.prepare('UPDATE attempts SET module_id = ? WHERE id = ?').run(moduleId, attemptId);
    db.prepare('UPDATE attempts SET pack_id=?,blueprint_version=?,scoring_version=? WHERE id=?').run(packageData.pack_id||null,BLUEPRINT_VERSION,SCORING_VERSION,attemptId);
    const statement = db.prepare('INSERT INTO attempt_questions(attempt_id, position, question_id, question_version, snapshot_json) VALUES(?, ?, ?, ?, ?)');
    packageData.selected.forEach((question, index) => statement.run(attemptId, index + 1, question.id, question.version, JSON.stringify({...question, passage_snapshot:passageById.get(question.stimulus_id)||null})));
  });
  insert();
  res.status(201).json({ attempt: publicAttempt(db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId), false) });
});

app.get('/api/attempts/:id', requireLearner, (req, res) => {
  let attempt = attemptRow(req.params.id, req.session.learner.id);
  if (!attempt) return res.status(404).json({ error: 'attempt_not_found' });
  attempt = expireIfNeeded(attempt);
  res.json({ attempt: publicAttempt(attempt, attempt.status === 'submitted' || attempt.status === 'expired') });
});

app.put('/api/attempts/:id/responses/:questionId', requireLearner, (req, res) => {
  let attempt = attemptRow(req.params.id, req.session.learner.id);
  if (!attempt) return res.status(404).json({ error: 'attempt_not_found' });
  attempt = expireIfNeeded(attempt);
  if (attempt.status !== 'active') return res.status(409).json({ error: 'attempt_closed', message: 'Sesi ini sudah selesai.' });
  const item = attemptQuestions(attempt.id).find((row) => row.question_id === req.params.questionId);
  if (!item) return res.status(404).json({ error: 'question_not_in_attempt' });
  const value = responseValue(item.question, req.body?.answer);
  if (value === null) return res.status(400).json({ error: 'invalid_answer' });
  db.prepare('INSERT INTO responses(attempt_id, question_id, answer_json, flagged, saved_at) VALUES(?, ?, ?, ?, ?) ON CONFLICT(attempt_id, question_id) DO UPDATE SET answer_json = excluded.answer_json, flagged = excluded.flagged, saved_at = excluded.saved_at').run(attempt.id, item.question_id, JSON.stringify(value), req.body?.flagged ? 1 : 0, nowIso());
  res.json({ saved: true, question_id: item.question_id });
});

app.post('/api/attempts/:id/submit', requireLearner, (req, res) => {
  let attempt = attemptRow(req.params.id, req.session.learner.id);
  if (!attempt) return res.status(404).json({ error: 'attempt_not_found' });
  attempt = expireIfNeeded(attempt);
  if (attempt.status === 'active') attempt = finalizeAttempt(attempt, 'submitted');
  res.json({ attempt: publicAttempt(attempt, true) });
});

app.get('/api/progress', requireLearner, (req, res) => {
  const attempts = db.prepare("SELECT id, mode, subject, status, started_at, submitted_at, score, correct_count, total_count FROM attempts WHERE learner_id = ? AND status IN ('submitted', 'expired') ORDER BY COALESCE(submitted_at, started_at) DESC LIMIT 30").all(req.session.learner.id);
  const recent = attempts.map((attempt) => ({ ...attempt, score: attempt.score === null ? null : Number(attempt.score.toFixed(1)) }));
  const avg = recent.filter((attempt) => attempt.score !== null);
  res.json({ average_score: avg.length ? Number((avg.reduce((sum, attempt) => sum + attempt.score, 0) / avg.length).toFixed(1)) : null, attempts: recent, limited_data: recent.length < 10 });
});

app.get('/api/public/leaderboard', (_req, res) => {
  const rows = db.prepare(`SELECT l.id AS learner_id, l.nickname, l.school, MAX(a.grade) AS grade, MAX(a.score) AS score
    FROM attempts a JOIN learners l ON l.id = a.learner_id
    WHERE a.mode = 'ranked' AND a.status IN ('submitted', 'expired') AND a.week_start = ? AND l.ranking_opt_in = 1
    GROUP BY l.id ORDER BY score DESC, l.id ASC LIMIT 12`).all(weekStartWib()).map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname,
    school: row.school || 'Sekolah belum diisi',
    grade: row.grade,
    score: Number(Number(row.score).toFixed(1)),
  }));
  res.json({ week_start: weekStartWib(), participants: rows.length, rows });
});

app.get('/api/teacher/overview', requireTeacher, (req, res) => {
  const teacher = req.session.teacher;
  const students = db.prepare(`SELECT l.id, l.nickname, l.grade,
      COUNT(DISTINCT CASE WHEN a.status IN ('submitted','expired') THEN a.id END) AS sessions,
      ROUND(AVG(CASE WHEN a.status IN ('submitted','expired') THEN a.score END), 1) AS average_score,
      MAX(CASE WHEN a.status IN ('submitted','expired') THEN a.score END) AS best_score,
      MAX(CASE WHEN a.status IN ('submitted','expired') THEN a.submitted_at END) AS last_activity
    FROM learners l LEFT JOIN attempts a ON a.learner_id = l.id
    WHERE l.school_key IS NOT NULL AND l.school_key = ?
    GROUP BY l.id ORDER BY l.grade ASC, average_score DESC, l.nickname ASC`).all(teacher.school_key || normalizeSchoolKey(teacher.school)).map((student) => ({
      ...student,
      sessions: Number(student.sessions || 0),
      average_score: student.average_score === null ? null : Number(student.average_score),
      best_score: student.best_score === null ? null : Number(Number(student.best_score).toFixed(1)),
    }));
  const summary = {
    students: students.length,
    active_students: students.filter((student) => student.sessions > 0).length,
    sessions: students.reduce((sum, student) => sum + student.sessions, 0),
    average_score: students.filter((student) => student.average_score !== null).length ? Number((students.filter((student) => student.average_score !== null).reduce((sum, student) => sum + student.average_score, 0) / students.filter((student) => student.average_score !== null).length).toFixed(1)) : null,
  };
  res.json({ teacher: { nickname: teacher.nickname, school: teacher.school, city: teacher.city }, summary, students });
});

app.get('/api/leaderboard', requireLearner, (req, res) => {
  const grade = normalizeGrade(req.query.grade) || req.session.learner.grade;
  const subject = normalizeSubject(req.query.subject) || 'matematika';
  const rows = db.prepare("SELECT l.id AS learner_id, l.nickname, l.school, MAX(a.score) AS score FROM attempts a JOIN learners l ON l.id = a.learner_id WHERE a.mode = 'ranked' AND a.status IN ('submitted', 'expired') AND a.grade = ? AND a.subject = ? AND a.week_start = ? AND l.ranking_opt_in = 1 GROUP BY l.id ORDER BY score DESC, l.id ASC LIMIT 100").all(grade, subject, weekStartWib()).map((row, index) => ({ rank: index + 1, nickname: row.nickname, school: row.school, score: Number(Number(row.score).toFixed(1)), mine: row.learner_id === req.session.learner.id }));
  res.json({ available: questions.some((question) => question.grade === grade && question.subject === subject && question.ranked_eligible), grade, subject, week_start: weekStartWib(), rows });
});

app.get('/api/tutor/status', requireLearner, (_req, res) => res.json({ enabled: Boolean(process.env.MITSUKO_BASE_URL && process.env.MITSUKO_API_KEY), engine: 'Mitsuko', persona: tutorPersona, display_name: tutorPersona, style: 'Teman belajar yang sabar, jelas, dan menyemangati tanpa menghakimi.', daily_limit: 20, per_question_limit: 5, fallback: 'Pembahasan dasar tetap tersedia tanpa AI.' }));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'internal_error', message: 'Terjadi kendala sementara.' });
});

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`TKA API listening on 127.0.0.1:${port}`);
  console.log(`Loaded ${questions.length} questions, ${modules.length} modules`);
});

function close() {
  server.close(() => db.close());
}

process.on('SIGTERM', close);
process.on('SIGINT', close);
