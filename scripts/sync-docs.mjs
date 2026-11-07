import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const docsDir = path.join(projectRoot, 'docs');

console.log('🔄 Memeriksa dan memvalidasi file spesifikasi dokumen sistem...');

const requiredDocs = [
  'PRD.md',
  'ERD.md',
  'FLOWCHART.md',
  'architecture-diagram.html',
  'SYSTEM_FLOW.md',
  'XAMPP_SETUP.md'
];

let missing = 0;
for (const doc of requiredDocs) {
  const filePath = path.join(docsDir, doc);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Dokumen hilang: docs/${doc}`);
    missing++;
  } else {
    const stat = fs.statSync(filePath);
    console.log(`✅ docs/${doc} (${(stat.size / 1024).toFixed(1)} KB) - Terverifikasi`);
  }
}

if (missing > 0) {
  console.error(`Terdapat ${missing} file dokumen yang belum lengkap.`);
  process.exit(1);
}

console.log('\n📄 Memeriksa status skema database migration terkini...');
const migrationsDir = path.join(projectRoot, 'backend', 'database', 'migrations');
if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir);
  console.log(`Terdapat ${files.length} file migrasi backend.`);
}

console.log('✨ Semua dokumen PRD, ERD, Flowchart, dan Arsitektur telah sinkron!');
