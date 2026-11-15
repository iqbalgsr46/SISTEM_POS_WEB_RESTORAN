import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routeSource = readFileSync(new URL('../src/app/api/upload/route.js', import.meta.url), 'utf8');
const menuPageSource = readFileSync(new URL('../src/app/admin/menu/page.jsx', import.meta.url), 'utf8');

test('upload route enforces origin protection and admin authorization', () => {
  assert.match(routeSource, /request\.headers\.get\('origin'\)/);
  assert.match(routeSource, /getServerSession\(authOptions\)/);
  assert.match(routeSource, /canAccess\(session\.user\?\.account,\s*\['admin'\]\)/);
  assert.match(routeSource, /MAX_SIZE = 5 \* 1024 \* 1024/);
  assert.match(routeSource, /path\.join\(process\.cwd\(\),\s*'public',\s*'images',\s*'menu'\)/);
});

test('menu admin page integrates file upload and preview components', () => {
  assert.match(menuPageSource, /handleFileUpload/);
  assert.match(menuPageSource, /fetch\('\/api\/upload'/);
  assert.match(menuPageSource, /type="file"/);
  assert.match(menuPageSource, /Ganti/);
  assert.match(menuPageSource, /Hapus/);
  assert.match(menuPageSource, /Unggah foto menu/);
});
