const fs = require('fs');
const path = require('path');
const registryDir = path.join(__dirname, '..', '..', 'registry');
const sectionsDir = path.join(registryDir, 'sections');
const indexPath = path.join(registryDir, 'index.json');
const files = fs.existsSync(sectionsDir)
  ? fs.readdirSync(sectionsDir).filter(f => f.endsWith('.json'))
  : [];
const sections = files.map(f => JSON.parse(fs.readFileSync(path.join(sectionsDir, f), 'utf8')));
const index = { version: '1.0.0', last_updated: new Date().toISOString().split('T')[0], total_sections: sections.length, sections };
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`Index updated — ${sections.length} sections`);
