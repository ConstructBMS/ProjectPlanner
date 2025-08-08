import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roadmapPath = path.join(__dirname, '..', 'ROADMAP.md');
const status = process.argv[2]; // e.g., 'Completed'
const item = process.argv.slice(3).join(' ');

if (!status || !item) {
  console.log('❌ Provide both status and item name.');
  process.exit(1);
}

const entry = `- [${status}] ${item}\n`;

fs.appendFileSync(roadmapPath, entry, 'utf8');
console.log('✅ ROADMAP.md updated.');
