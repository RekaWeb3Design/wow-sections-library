#!/usr/bin/env node

/**
 * Liquid Lab — Section Schema Build Script
 *
 * Scans sections/ for files containing <<INCLUDE: fragment-name>> markers,
 * resolves them with content from schema-fragments/, and writes the built
 * sections to a build cache. The actual section files in sections/ are
 * the SOURCE — the build script lifts them into dawn-dev/sections/ with
 * the includes resolved.
 *
 * Workflow:
 *   1. Author writes section with <<INCLUDE>> markers in sections/
 *   2. Run: npm run build-schemas (or it runs as part of npm run sync)
 *   3. Built section appears in dawn-dev/sections/ ready to use
 */

const fs = require('fs');
const path = require('path');

const SECTIONS_SRC = path.join(__dirname, '..', 'sections');
const SECTIONS_OUT = path.join(__dirname, '..', '..', 'dawn-dev', 'sections');
const FRAGMENTS_DIR = path.join(__dirname, '..', 'schema-fragments');

function loadFragments() {
  const fragments = {};
  if (!fs.existsSync(FRAGMENTS_DIR)) return fragments;

  fs.readdirSync(FRAGMENTS_DIR).forEach(file => {
    if (file.endsWith('.json')) {
      const name = path.basename(file, '.json');
      const raw = fs.readFileSync(path.join(FRAGMENTS_DIR, file), 'utf8');
      fragments[name] = JSON.parse(raw);
    }
  });

  return fragments;
}

function resolveIncludes(content, fragments) {
  const includeRegex = /<<INCLUDE:\s*([\w-]+)\s*>>/g;

  return content.replace(includeRegex, (match, fragmentName) => {
    if (!fragments[fragmentName]) {
      throw new Error(`Unknown fragment: ${fragmentName}`);
    }
    const json = JSON.stringify(fragments[fragmentName], null, 2);
    return json.slice(1, -1).trim();
  });
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.liquid')) {
      callback(filePath);
    }
  });
}

function main() {
  console.log('Liquid Lab — Building section schemas with fragments...\n');

  const fragments = loadFragments();
  console.log(`Loaded ${Object.keys(fragments).length} schema fragments.`);

  if (!fs.existsSync(SECTIONS_OUT)) {
    fs.mkdirSync(SECTIONS_OUT, { recursive: true });
  }

  let processedCount = 0;
  let resolvedCount = 0;

  walkDir(SECTIONS_SRC, (srcPath) => {
    const relPath = path.relative(SECTIONS_SRC, srcPath);
    const filename = path.basename(srcPath);
    const outPath = path.join(SECTIONS_OUT, filename);

    let content = fs.readFileSync(srcPath, 'utf8');
    const hadIncludes = content.includes('<<INCLUDE:');

    if (hadIncludes) {
      try {
        content = resolveIncludes(content, fragments);
        resolvedCount++;
      } catch (err) {
        console.error(`Error in ${relPath}: ${err.message}`);
        process.exit(1);
      }
    }

    fs.writeFileSync(outPath, content);
    processedCount++;
  });

  console.log(`\nProcessed ${processedCount} sections, ${resolvedCount} with includes.`);
  console.log(`Output: ${SECTIONS_OUT}`);
}

main();
