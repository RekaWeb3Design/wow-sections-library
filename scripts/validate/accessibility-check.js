#!/usr/bin/env node
/**
 * accessibility-check.js — WCAG 2.1 AA validation for Liquid Lab sections.
 *
 * Scans every .liquid file under sections/free/** and sections/pro/**, and
 * runs the Liquid Lab accessibility checklist (see .claude/skills/accessibility.md).
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

function checkSectionAriaLabel(source) {
  // The section root may be any HTML5 landmark — section, aside, header, nav,
  // main, footer, article — provided it carries an accessible name. We accept
  // any of these tags as the root; FAIL if none has aria-label.
  const landmarks = [...source.matchAll(/<(section|aside|header|nav|main|footer|article)\b([^>]*)>/gi)];
  if (landmarks.length === 0) {
    return { status: 'fail', message: 'No landmark root (section/aside/header/nav/main/footer/article) found' };
  }
  const labelled = landmarks.filter((m) => /\baria-label(?:ledby)?\s*=/.test(m[2]));
  if (labelled.length === 0) {
    return { status: 'fail', message: 'Landmark root missing aria-label' };
  }
  return { status: 'pass', message: 'Landmark root has aria-label' };
}

function checkSvgAriaHidden(source) {
  const svgs = [...source.matchAll(/<svg\b([^>]*)>/gi)];
  if (svgs.length === 0) {
    return { status: 'pass', message: 'No <svg> elements' };
  }
  // An interactive SVG (role="img" with aria-label) is the documented exception.
  const missing = svgs.filter((m) => {
    const attrs = m[1];
    if (/\baria-hidden\s*=\s*["']true["']/i.test(attrs)) return false;
    if (/\brole\s*=\s*["']img["']/i.test(attrs) && /\baria-label\s*=/i.test(attrs)) return false;
    return true;
  });
  if (missing.length > 0) {
    return { status: 'warn', message: `<svg> missing aria-hidden="true" (${missing.length}) — add unless interactive (role="img" + aria-label)` };
  }
  return { status: 'pass', message: 'All <svg> hidden from a11y tree' };
}

function checkSvgFocusable(source) {
  const svgs = [...source.matchAll(/<svg\b([^>]*)>/gi)];
  if (svgs.length === 0) {
    return { status: 'pass', message: 'No <svg> elements' };
  }
  const missing = svgs.filter((m) => !/\bfocusable\s*=\s*["']false["']/i.test(m[1]));
  if (missing.length > 0) {
    return { status: 'warn', message: `<svg> missing focusable="false" (${missing.length})` };
  }
  return { status: 'pass', message: 'All <svg> have focusable="false"' };
}

function checkButtonAccessibleName(source) {
  // Look at every <button> ... </button>. Pass if it has aria-label OR if its
  // inner content contains any non-whitespace text outside of <svg>...</svg>
  // and outside of HTML attributes.
  const buttons = [...source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
  if (buttons.length === 0) {
    return { status: 'pass', message: 'No <button> elements' };
  }
  const missing = [];
  for (const [, attrs, inner] of buttons) {
    if (/\baria-label\s*=/i.test(attrs)) continue;
    if (/\baria-labelledby\s*=/i.test(attrs)) continue;
    // Strip nested SVGs and Liquid comments before checking inner text.
    let innerText = inner
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
      .replace(/{%\s*comment\s*%}[\s\S]*?{%\s*endcomment\s*%}/g, '')
      .replace(/<[^>]+>/g, '');
    innerText = innerText.replace(/\s+/g, '').trim();
    if (innerText.length === 0) {
      missing.push(true);
    }
  }
  if (missing.length > 0) {
    return { status: 'fail', message: `<button> without text or aria-label (${missing.length})` };
  }
  return { status: 'pass', message: 'All <button> have accessible name' };
}

function checkImageAlt(source) {
  // Match every `| image_tag:` pipeline and confirm `alt:` is one of its args.
  const pipelines = [...source.matchAll(/\|\s*image_tag\s*:([\s\S]*?)(?=}}|%})/g)];
  if (pipelines.length === 0) {
    return { status: 'pass', message: 'No image_tag calls' };
  }
  const missing = pipelines.filter((m) => !/\balt\s*:/i.test(m[1]));
  if (missing.length > 0) {
    return { status: 'fail', message: `image_tag missing alt: parameter (${missing.length})` };
  }
  return { status: 'pass', message: 'All image_tag calls include alt:' };
}

function checkOutlineNone(styleSource) {
  const hasOutlineNone = /\boutline\s*:\s*(none|0)\b/i.test(styleSource);
  if (!hasOutlineNone) {
    return { status: 'pass', message: 'No outline: none / 0' };
  }
  return {
    status: 'warn',
    message: 'outline: none/0 found — verify a custom :focus-visible style replaces the default',
  };
}

function checkUlRoleList(source) {
  const uls = [...source.matchAll(/<ul\b([^>]*)>/gi)];
  if (uls.length === 0) {
    return { status: 'pass', message: 'No <ul> elements' };
  }
  const missing = uls.filter((m) => !/\brole\s*=\s*["']list["']/i.test(m[1]));
  if (missing.length > 0) {
    return { status: 'warn', message: `<ul> missing role="list" (${missing.length}) — Safari VoiceOver fix` };
  }
  return { status: 'pass', message: 'All <ul> have role="list"' };
}

function checkReducedMotion(styleSource, source) {
  const hasAnimations = /@keyframes\b/.test(styleSource) || /\banimation\s*:/i.test(styleSource) || /\btransition\s*:/i.test(styleSource);
  const hasReducedMotion = /prefers-reduced-motion\s*:\s*reduce/.test(styleSource) || /prefers-reduced-motion/.test(source);
  if (!hasAnimations) {
    return { status: 'pass', message: 'No animations/transitions to gate' };
  }
  if (!hasReducedMotion) {
    return { status: 'fail', message: 'Animations/transitions present but no @media (prefers-reduced-motion: reduce) block' };
  }
  return { status: 'pass', message: 'prefers-reduced-motion respected' };
}

function checkHeadingHierarchy(source) {
  const h1s = [...source.matchAll(/<h1\b/gi)];
  if (h1s.length > 0) {
    return { status: 'fail', message: `<h1> used (${h1s.length}) — section headings must be <h2>; h1 belongs to the theme` };
  }
  return { status: 'pass', message: 'No <h1> in section' };
}

function checkStarRating(source) {
  // Trigger only when the file references a star class (lab_*__star or similar).
  const hasStarClass = /\blab_[a-z0-9_-]*__star\b/i.test(source) || /\bclass\s*=\s*["'][^"']*\bstar\b[^"']*["']/i.test(source);
  if (!hasStarClass) {
    return { status: 'pass', message: 'No star rating element' };
  }
  // Look for a star container with role="img" and aria-label.
  const containerMatches = [...source.matchAll(/<[a-z]+\b([^>]*\bclass\s*=\s*["'][^"']*\b(?:stars|__stars|lab_[a-z0-9_-]*__stars)\b[^"']*["'][^>]*)>/gi)];
  if (containerMatches.length === 0) {
    // Fall back to the first element whose class contains 'star' but not 'stars'
    return { status: 'warn', message: 'Star elements present — verify container has role="img" and aria-label="X out of 5 stars"' };
  }
  const missing = containerMatches.filter((m) => {
    const attrs = m[1];
    return !(/\brole\s*=\s*["']img["']/i.test(attrs) && /\baria-label\s*=/i.test(attrs));
  });
  if (missing.length > 0) {
    return { status: 'warn', message: `Star rating container missing role="img" + aria-label (${missing.length})` };
  }
  return { status: 'pass', message: 'Star rating container has role="img" + aria-label' };
}

// ---------- per-file runner ----------

const STATUS_ICON = { pass: '✅', warn: '⚠️ ', fail: '❌' };

function runFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  // Strip the schema block before pattern checks — schema JSON often contains
  // string literals that would create false hits (e.g. "h1" in info text).
  const schema = extractSchemaBlock(source);
  const sourceMinusSchema = schema ? source.replace(schema, '') : source;
  const styleSource = extractStyleBlock(sourceMinusSchema);

  const results = {
    'Section aria-label': checkSectionAriaLabel(sourceMinusSchema),
    'SVG aria-hidden': checkSvgAriaHidden(sourceMinusSchema),
    'SVG focusable="false"': checkSvgFocusable(sourceMinusSchema),
    'Button accessible name': checkButtonAccessibleName(sourceMinusSchema),
    'Image alt parameter': checkImageAlt(sourceMinusSchema),
    'No outline:none without replacement': checkOutlineNone(styleSource),
    'ul role="list"': checkUlRoleList(sourceMinusSchema),
    'prefers-reduced-motion': checkReducedMotion(styleSource, sourceMinusSchema),
    'Heading hierarchy (no h1)': checkHeadingHierarchy(sourceMinusSchema),
    'Star rating accessibility': checkStarRating(sourceMinusSchema),
  };

  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const r of Object.values(results)) counts[r.status]++;

  const overall =
    counts.fail > 0
      ? 'FAIL'
      : counts.warn > 0
        ? `PASS (${counts.warn} warning${counts.warn === 1 ? '' : 's'})`
        : 'PASS';

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
    console.log(`\n♿ Accessibility Check: ${rel}`);
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
  console.log(`♿ Accessibility summary across ${files.length} section${files.length === 1 ? '' : 's'}`);
  console.log(`   ✅ Passed (clean):      ${summary.pass}`);
  console.log(`   ⚠️  Passed (warnings):  ${summary.warn}`);
  console.log(`   ❌ Failed:              ${summary.fail}`);
  console.log('─'.repeat(60));

  process.exit(summary.fail > 0 ? 1 : 0);
}

main();
