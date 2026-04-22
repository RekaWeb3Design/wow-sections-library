const fs = require('fs');
const path = require('path');

const registryDir = path.join(__dirname, '..', '..', 'registry');
const sectionsDir = path.join(registryDir, 'sections');
const indexPath = path.join(registryDir, 'index.json');
const tiers = ['free', 'pro'];

const sections = [];
for (const tier of tiers) {
  const tierDir = path.join(sectionsDir, tier);
  if (!fs.existsSync(tierDir)) continue;
  const files = fs.readdirSync(tierDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(tierDir, f), 'utf8'));
    sections.push({ ...data, tier: data.tier || tier });
  }
}

const index = {
  version: '1.0.0',
  last_updated: new Date().toISOString().split('T')[0],
  total_sections: sections.length,
  sections,
};
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`Index updated — ${sections.length} sections`);
