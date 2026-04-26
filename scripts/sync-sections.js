const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const dawnRoot = path.resolve(projectRoot, '..', 'dawn-dev');

const syncTargets = [
  {
    label: 'sections',
    sourceRoots: [
      path.join(projectRoot, 'sections', 'free'),
      path.join(projectRoot, 'sections', 'pro'),
    ],
    targetDir: path.join(dawnRoot, 'sections'),
    extensions: ['.liquid'],
  },
  {
    label: 'snippets',
    sourceRoots: [path.join(projectRoot, 'snippets')],
    targetDir: path.join(dawnRoot, 'snippets'),
    extensions: ['.liquid'],
  },
  {
    label: 'assets',
    sourceRoots: [path.join(projectRoot, 'assets')],
    targetDir: path.join(dawnRoot, 'assets'),
    extensions: ['.css', '.js', '.svg'],
  },
];

function collectFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full, extensions));
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

let totalCopied = 0;
for (const target of syncTargets) {
  fs.mkdirSync(target.targetDir, { recursive: true });
  let copied = 0;
  for (const root of target.sourceRoots) {
    for (const src of collectFiles(root, target.extensions)) {
      const name = path.basename(src);
      fs.copyFileSync(src, path.join(target.targetDir, name));
      console.log(`✅ Copied (${target.label}): ${name}`);
      copied++;
    }
  }
  console.log(`— ${copied} ${target.label} synced`);
  totalCopied += copied;
}

console.log(`Sync complete — ${totalCopied} files copied to dawn-dev/`);
