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
  // Regular expression to match backdrop-blur classes
  const regex = /backdrop-blur(?:-\w+)?/g;
  if (regex.test(content)) {
    content = content.replace(regex, '');
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
    console.log(`Removed blur from: ${file}`);
  }
});

console.log(`Done! Removed blur from ${updatedFiles} files.`);
