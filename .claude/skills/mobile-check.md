# Mobile-first — WOW Section Library

Mobile-first rules for every WOW section. These are not suggestions — every section must comply, and `npm run mobile-check` runs them automatically against `sections/free/**` and `sections/pro/**`.

The smallest viewport WOW supports is **375px wide** (iPhone SE). Every section must look correct and remain usable at that width before it's allowed on `main`.

---

## 1. The seven mobile-first rules

These are the rules `mobile-check.js` enforces. A `FAIL` blocks merge. A `WARN` requires a manual mobile-preview check before merge.

| # | Rule | Severity if violated |
|---|------|----------------------|
| 1 | Use `clamp()` for fluid font sizes and spacing — not hardcoded `px` | WARN |
| 2 | Mobile-first only — `min-width` media queries, **never** `max-width` (the §8.9 visibility toggle is the one allowed exception) | FAIL |
| 3 | Don't hardcode literal `font-size: <N>px` — use `clamp()` or merchant-driven Liquid values | WARN |
| 4 | Every interactive element (`<button>`, `<a>`) must have a touch target ≥ **44 × 44 px** — set via `min-height`, `height`, or padding that adds up | WARN |
| 5 | Every `image_tag` filter call must include explicit `width:` and `height:` arguments — prevents CLS on slow mobile networks | WARN |
| 6 | No fixed `px` widths on container/wrapper elements (`__inner`, `__wrap`, `__container`, `__grid`, `__row`, `__header`, `__content`) — they collapse on narrow screens | WARN |
| 7 | Always test at **375 px** viewport width (iPhone SE) before marking a section validated | Manual |

---

## 2. Why these rules

- **`clamp()` over breakpoints**: a single `clamp(min, fluid, max)` call replaces a stack of px breakpoints, scales smoothly between every viewport size, and avoids the abrupt jumps merchants notice on tablets. It's also fewer bytes.
- **`min-width` only**: mobile-first CSS starts from the smallest viewport and adds rules as the viewport grows. `max-width` queries invert that — they ship desktop styles to phones, then override them. Every WOW section is read by phones first; build for them first.
- **44px touch targets**: Apple HIG, Google Material, and WCAG 2.5.5 all converge on 44 px as the minimum. Anything smaller is a tap-error tax — especially for thumbs on the bottom half of the screen.
- **Explicit image dimensions**: without `width` and `height` on `<img>`, the browser doesn't know the aspect ratio until the image starts decoding. On a 4G/3G connection, that's hundreds of milliseconds of layout shift after the section has already painted. Setting both attributes lets the browser reserve the box on the first paint, which fixes CLS at the source.
- **No fixed container widths**: a wrapper with `width: 1200px` on a 375 px screen overflows the viewport, triggers horizontal scroll, and breaks the design. Use `max-width` paired with `width: 100%`, or use `var(--page-width, 1200px)` so the theme can override.

---

## 3. The automated check

```bash
npm run mobile-check        # mobile-first only
npm run validate-all        # shopify theme check + mobile-first
```

`mobile-check.js` reports per file:

```
📱 Mobile Check: sections/free/hero/wow-hero-basic.liquid
✅ clamp() usage: clamp() used
✅ No max-width media queries
✅ No hardcoded px font-sizes
⚠️  Touch targets ≥ 44px: Button/link found — verify 44px minimum touch target
✅ image_tag width/height
✅ No fixed container widths
Result: PASS (1 warning)
```

Plus a final summary across every section. The script's exit code is non-zero only if there's a `FAIL` — `WARN`s do not break CI, but they must be manually verified at 375 px before commit.

---

## 4. Manual mobile preview — the 375 px test

After the automated check passes, every section must be eyeballed on a real mobile preview at 375 px. The fastest path:

1. `npm run sync` to push to the dev store (the PostToolUse hook also runs this on save).
2. Open the dev store on the connected device or in DevTools → device emulation → iPhone SE (375 × 667).
3. Add the section to a test page and confirm:
   - No horizontal scrolling
   - Text is legible (≥ 16 px effective font-size for body copy)
   - Every button is tappable without overlapping a neighbour
   - Images render at sane aspect ratios (no squashing or cropping)
   - Content stack order is correct (hero image first, text below — or `mobile_layout: "reverse"` if the merchant flips it)

---

## 5. Workflow integration

After generating or editing any section:

1. `npm run validate-all` — runs both `shopify theme check` and `mobile-check`.
2. **Fix every `FAIL`** before committing — they are blockers.
3. **Manually verify every `WARN`** at 375 px viewport width.
4. Only then commit.

The `.claude/hooks/check-liquid.sh` PostToolUse hook also runs both checks automatically on every Write/Edit to a `.liquid` file under `sections/`, so missing FAILs in local dev is hard.
