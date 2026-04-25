#!/usr/bin/env node
/**
 * mobile-check.js — mobile-first validation for WOW sections.
 *
 * Scans every .liquid file under sections/free/** and sections/pro/**, and
 * runs the WOW mobile-first checklist (see .claude/skills/mobile-check.md).
 *
 * Per check, output is one of:
 *   ✅  PASS     — rule satisfied
 *   ⚠️   WARN    — likely issue, needs manual verification
 *   ❌  FAIL    — hard violation
 *
 * A file's overall result is FAIL if any check is FAIL, WARN if any check is
 * WARN (and none FAIL), otherwise PASS. Exit code is non-zero only when at
 * least one file FAILs — warnings do not break CI.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SECTION_ROOTS = [
  path.join(ROOT, 'sections', 'free'),
  path.join(ROOT, 'sections', 'pro'),
];

// ---------- helpers ----------

function walkLiquid(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkLiquid(full, out);
    else if (entry.isFile() && entry.name.endsWith('.liquid')) out.push(full);
  }
  return out;
}

function relativeToRoot(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function extractStyleBlock(source) {
  const m = source.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : '';
}

function extractSchemaBlock(source) {
  const m = source.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  return m ? m[1] : '';
}

// ---------- individual checks ----------

function checkClamp(source) {
  return /\bclamp\s*\(/.test(source)
    ? { status: 'pass', message: 'clamp() used' }
    : { status: 'warn', message: 'No clamp() found — check responsive font sizes and spacing' };
}

function checkNoMaxWidthMedia(source) {
  // §8.9 visibility (hide_on_mobile) is the documented exception. The
  // canonical pattern is wrapped in a `{% if section.settings.hide_on_mobile %}`
  // block, so strip that whole conditional before checking.
  let stripped = source.replace(
    /{%\s*if\s+section\.settings\.hide_on_mobile\s*%}[\s\S]*?{%\s*endif\s*%}/g,
    ''
  );
  stripped = stripped.replace(
    /{%\s*if\s+section\.settings\.hide_on_desktop\s*%}[\s\S]*?{%\s*endif\s*%}/g,
    ''
  );
  if (/@media[^{]*max-width\s*:/i.test(stripped)) {
    return { status: 'fail', message: 'max-width media query found — use min-width only (mobile-first)' };
  }
  return { status: 'pass', message: 'No max-width media queries' };
}

function checkNoHardcodedFontPx(styleSource) {
  // Allow:
  //  - clamp(...)             — fluid sizing
  //  - {{ liquid }}px          — merchant-driven schema setting
  //  - var(--name, Npx)        — px is a fallback only; real value is a CSS var
  //  - rem / em / % units      — relative
  // WARN only on literal `font-size: <N>px;` declarations.
  const lines = styleSource.split('\n');
  const hardcoded = [];
  for (const line of lines) {
    const fontSizeRegex = /font-size\s*:\s*([^;]+);/gi;
    let m;
    while ((m = fontSizeRegex.exec(line)) !== null) {
      const value = m[1].trim();
      if (/\bclamp\s*\(/.test(value)) continue;
      if (/\bvar\s*\(/.test(value)) continue;
      if (/{{[^}]+}}/.test(value)) continue;
      if (/\d+px\b/.test(value)) hardcoded.push(value);
    }
  }
  if (hardcoded.length === 0) {
    return { status: 'pass', message: 'No hardcoded px font-sizes' };
  }
  return {
    status: 'warn',
    message: `Hardcoded px font-size found (${hardcoded.length}) — consider clamp()`,
  };
}

function checkTouchTargets(source) {
  const hasInteractive = /<button\b|<a\b/.test(source);
  if (!hasInteractive) {
    return { status: 'pass', message: 'No buttons/links to check' };
  }
  // Look for any height ≥ 44px (literal or merchant-driven via min/max ranges
  // that allow ≥ 44px) declared on min-height / height somewhere in the file.
  const heightHits = [...source.matchAll(/(min-height|height)\s*:\s*([^;]+);/gi)];
  let satisfied = false;
  for (const [, , raw] of heightHits) {
    const value = raw.trim();
    // Literal px ≥ 44
    const litMatch = value.match(/(\d+(?:\.\d+)?)\s*px/);
    if (litMatch && parseFloat(litMatch[1]) >= 44) {
      satisfied = true;
      break;
    }
    // Liquid-driven min-height where the schema range minimum is ≥ 44 — too
    // expensive to fully resolve here. If the value has clamp/calc/var with a
    // px floor ≥ 44, accept it.
    const clampMin = value.match(/clamp\(\s*(\d+(?:\.\d+)?)\s*px/);
    if (clampMin && parseFloat(clampMin[1]) >= 44) {
      satisfied = true;
      break;
    }
    // rem floor ≥ 2.75rem (= 44px @ 16px root)
    const remMatch = value.match(/(\d+(?:\.\d+)?)\s*rem/);
    if (remMatch && parseFloat(remMatch[1]) * 16 >= 44) {
      satisfied = true;
      break;
    }
  }
  if (satisfied) {
    return { status: 'pass', message: 'Touch target ≥ 44px present' };
  }
  return {
    status: 'warn',
    message: 'Button/link found — verify 44px minimum touch target',
  };
}

function checkImageDimensions(source) {
  const calls = [...source.matchAll(/\bimage_tag\s*:[\s\S]*?(?=}}|\|\s*\w)/g)];
  // Fallback: also pick up multi-line `| image_tag:` blocks — search inside
  // every image_url → image_tag pipeline for `width:` and `height:` args.
  const pipelines = [...source.matchAll(/\|\s*image_tag\s*:([\s\S]*?)(?=}}|%})/g)];
  if (pipelines.length === 0) {
    return { status: 'pass', message: 'No image_tag calls' };
  }
  const missing = pipelines.filter((m) => {
    const args = m[1];
    return !/\bwidth\s*:/i.test(args) || !/\bheight\s*:/i.test(args);
  });
  if (missing.length === 0) {
    return { status: 'pass', message: 'image_tag has width/height' };
  }
  return {
    status: 'warn',
    message: `image_tag missing explicit width/height (${missing.length}) — may cause CLS on mobile`,
  };
}

function checkNoFixedContainerWidths(styleSource) {
  // Look for `width: <N>px` / `min-width: <N>px` / `max-width: <N>px` on
  // selectors that look like wrappers. A "wrapper" selector is one whose last
  // class token contains __inner, __wrap, __container, __grid, __row, or
  // __header (the typical WOW container slugs). Avoid matching on small
  // elements like __icon, __badge, __star, __avatar.
  const lines = styleSource.split('\n');
  const offenders = [];
  for (let i = 0; i < lines.length; i++) {
    const decl = lines[i].match(/^\s*(min-width|max-width|width)\s*:\s*([^;]+);/i);
    if (!decl) continue;
    const value = decl[2];
    // Allow Liquid-driven and var-based values
    if (/{{[^}]+}}/.test(value) || /\bvar\(/.test(value)) continue;
    if (/100\s*%/.test(value) || /\bauto\b/.test(value)) continue;
    if (!/(\d+(?:\.\d+)?)\s*px/.test(value)) continue;
    // Walk back to find the most recent selector line
    let selectorLine = '';
    for (let j = i - 1; j >= 0; j--) {
      const l = lines[j].trim();
      if (l.endsWith('{')) {
        selectorLine = l;
        break;
      }
      if (l === '' || l.startsWith('}')) continue;
    }
    if (!selectorLine) continue;
    if (/__(inner|wrap|container|grid|row|header|outer|content)\b/.test(selectorLine)) {
      offenders.push(`${selectorLine.replace(/\s*\{$/, '')} → ${decl[1]}: ${value.trim()}`);
    }
  }
  if (offenders.length === 0) {
    return { status: 'pass', message: 'No fixed container widths' };
  }
  return {
    status: 'warn',
    message: `Fixed px width on container (${offenders.length}) — may break on mobile`,
  };
}

// ---------- per-file runner ----------

const STATUS_ICON = { pass: '✅', warn: '⚠️ ', fail: '❌' };

function runFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  // Strip the schema block before pattern checks — schema JSON often contains
  // string literals like "max-width" or "44px" that would create false hits.
  const schema = extractSchemaBlock(source);
  const sourceMinusSchema = schema ? source.replace(schema, '') : source;
  const styleSource = extractStyleBlock(sourceMinusSchema);

  const results = {
    'clamp() usage': checkClamp(styleSource || sourceMinusSchema),
    'No max-width media queries': checkNoMaxWidthMedia(sourceMinusSchema),
    'No hardcoded px font-sizes': checkNoHardcodedFontPx(styleSource),
    'Touch targets ≥ 44px': checkTouchTargets(sourceMinusSchema),
    'image_tag width/height': checkImageDimensions(sourceMinusSchema),
    'No fixed container widths': checkNoFixedContainerWidths(styleSource),
  };

  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const r of Object.values(results)) counts[r.status]++;

  const overall = counts.fail > 0 ? 'FAIL' : counts.warn > 0 ? `PASS (${counts.warn} warning${counts.warn === 1 ? '' : 's'})` : 'PASS';

  return { results, counts, overall };
}

// ---------- main ----------

function main() {
  const files = SECTION_ROOTS.flatMap((d) => walkLiquid(d));
  if (files.length === 0) {
    console.log('No section files found under sections/free/** or sections/pro/**.');
    process.exit(0);
  }

  const summary = { pass: 0, warn: 0, fail: 0 };
  for (const file of files) {
    const rel = relativeToRoot(file);
    console.log(`\n📱 Mobile Check: ${rel}`);
    const { results, counts, overall } = runFile(file);
    for (const [name, r] of Object.entries(results)) {
      console.log(`${STATUS_ICON[r.status]} ${name}: ${r.message}`);
    }
    console.log(`Result: ${overall}`);
    if (counts.fail > 0) summary.fail++;
    else if (counts.warn > 0) summary.warn++;
    else summary.pass++;
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`📱 Mobile-first summary across ${files.length} section${files.length === 1 ? '' : 's'}`);
  console.log(`   ✅ Passed (clean):      ${summary.pass}`);
  console.log(`   ⚠️  Passed (warnings):  ${summary.warn}`);
  console.log(`   ❌ Failed:              ${summary.fail}`);
  console.log('─'.repeat(60));

  process.exit(summary.fail > 0 ? 1 : 0);
}

main();
