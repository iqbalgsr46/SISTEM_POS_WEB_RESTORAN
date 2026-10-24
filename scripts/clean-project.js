const fs = require('fs');
const path = require('path');

function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getAllFiles(full));
      }
    } else {
      results.push(full);
    }
  });
  return results;
}

// 1. Gather all codebase text to protect used assets
const srcFiles = getAllFiles('src');
let allCodeText = '';
srcFiles.forEach(f => { allCodeText += ' ' + fs.readFileSync(f, 'utf8'); });
['PROJECT_MASTER_BLUEPRINT.md', 'README.md', 'docs'].forEach(f => {
  if (fs.existsSync(f)) {
    if (fs.statSync(f).isDirectory()) {
      getAllFiles(f).forEach(sub => { allCodeText += ' ' + fs.readFileSync(sub, 'utf8'); });
    } else {
      allCodeText += ' ' + fs.readFileSync(f, 'utf8');
    }
  }
});
['public/docs.html'].forEach(f => {
  if (fs.existsSync(f)) allCodeText += ' ' + fs.readFileSync(f, 'utf8');
});

console.log('--- ENTERPRISE CLEANUP & RESTRUCTURING ---');

let freedBytes = 0;
let deletedFilesCount = 0;

// 2. Delete root temporary images
const rootJunk = ['20260927_002514.png', '20260927_003233.png', '20260927_003834.png', 'ffoto-gacoan-favorite.png'];
rootJunk.forEach(f => {
  if (fs.existsSync(f)) {
    const size = fs.statSync(f).size;
    fs.unlinkSync(f);
    freedBytes += size;
    deletedFilesCount++;
    console.log('[DELETED ROOT IMAGE]:', f, '(' + (size / 1024 / 1024).toFixed(2) + ' MB)');
  }
});

// 3. Delete unreferenced files in public/
const publicFiles = getAllFiles('public');
publicFiles.forEach(f => {
  const rel = f.replace(/\\/g, '/').replace(/^public\//, '');
  const basename = path.basename(f);
  const isUsed = allCodeText.includes(rel) || allCodeText.includes('/' + rel) || allCodeText.includes(basename);
  if (!isUsed) {
    const size = fs.statSync(f).size;
    fs.unlinkSync(f);
    freedBytes += size;
    deletedFilesCount++;
  }
});
console.log('[DELETED UNUSED PUBLIC ASSETS]:', deletedFilesCount - rootJunk.length, 'files');

// 4. Remove root scratch/ folder
function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = path.join(dirPath, file);
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        freedBytes += fs.statSync(curPath).size;
        deletedFilesCount++;
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

if (fs.existsSync('scratch')) {
  deleteFolderRecursive('scratch');
  console.log('[REMOVED TEMPORARY SCRATCH DIRECTORY]');
}

// 5. Clean empty subdirectories in public/
function cleanEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      cleanEmptyDirs(full);
      if (fs.readdirSync(full).length === 0) {
        fs.rmdirSync(full);
        console.log('[REMOVED EMPTY DIR]:', full);
      }
    }
  });
}
cleanEmptyDirs('public');

console.log('------------------------------------------');
console.log('TOTAL FILES CLEANED:', deletedFilesCount);
console.log('TOTAL DISK SPACE FREED:', (freedBytes / 1024 / 1024).toFixed(2), 'MB');
console.log('CLEANUP COMPLETED SUCCESSFULLY!');
