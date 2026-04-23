const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const frontendDir = path.join(__dirname, 'my-ecommerce-frontend');
const dirsToScan = [
  path.join(frontendDir, 'app'),
  path.join(frontendDir, 'components')
];

let files = [];
dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = files.concat(walk(dir));
  }
});

let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/bg-brand-bg\/(80|90)/g, 'bg-brand-bg');
  content = content.replace(/bg-white\/80 dark:bg-\[\#0A0A0A\]\/80/g, 'bg-white dark:bg-[#0A0A0A]');
  content = content.replace(/bg-white\/60 dark:bg-black\/40/g, 'bg-white dark:bg-black');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Done! Replaced transparency with solid backgrounds in ${updatedFiles} files.`);
