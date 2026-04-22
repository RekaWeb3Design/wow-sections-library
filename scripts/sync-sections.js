const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const sourceRoots = [
  path.join(projectRoot, 'sections', 'free'),
  path.join(projectRoot, 'sections', 'pro'),
];
const targetDir = path.resolve(projectRoot, '..', 'dawn-dev', 'sections');

function collectLiquidFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectLiquidFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.liquid')) {
      files.push(full);
    }
  }
  return files;
}

fs.mkdirSync(targetDir, { recursive: true });

let copied = 0;
for (const root of sourceRoots) {
  for (const src of collectLiquidFiles(root)) {
    const name = path.basename(src);
    fs.copyFileSync(src, path.join(targetDir, name));
    console.log(`✅ Copied: ${name}`);
    copied++;
  }
}

console.log(`Sync complete — ${copied} sections copied to dawn-dev/`);
