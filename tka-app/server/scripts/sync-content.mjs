import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '../../..');
const sourceDir = path.join(projectDir, 'bank');
const targetDir = path.resolve(__dirname, '../content');

fs.mkdirSync(targetDir, { recursive: true });
for (const fileName of ['questions.json', 'passages.json', 'modules.json']) {
  const sourcePath = path.join(sourceDir, fileName);
  const targetPath = path.join(targetDir, fileName);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing bank file: ${sourcePath}`);
  fs.copyFileSync(sourcePath, targetPath);
}

const questions = JSON.parse(fs.readFileSync(path.join(targetDir, 'questions.json'), 'utf8'));
const modules = JSON.parse(fs.readFileSync(path.join(targetDir, 'modules.json'), 'utf8'));
console.log(JSON.stringify({ questions: questions.length, modules: modules.length, target: targetDir }));
