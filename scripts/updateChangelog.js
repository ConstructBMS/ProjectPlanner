import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const logEntry = process.argv.slice(2).join(' ');

if (!logEntry) {
  console.log('❌ No changelog entry provided.');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

const entry = `\n### ${timestamp}\n- ${logEntry}\n`;

fs.appendFileSync(changelogPath, entry, 'utf8');
console.log('✅ CHANGELOG.md updated.');
