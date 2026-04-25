# Accessibility — WOW Section Library

WCAG 2.1 AA standards for every WOW section. These are not suggestions — every section must comply, and `npm run a11y-check` runs them automatically against `sections/free/**` and `sections/pro/**`.

A section that fails any of these rules is broken and cannot ship to `main`.

---

## 1. HTML structure

### 1.1 Section landmark

Every `<section>` must declare an accessible name with `aria-label`. The merchant's heading is the natural source — fall back to a sensible default and always escape.

```liquid
<section
  id="wow-{{ section.id }}"
  class="wow_hero"
  aria-label="{{ section.settings.heading | default: 'Hero' | escape }}"
>
  ...
</section>
```

Pattern: `aria-label="{{ section.settings.heading | default: '[Section name]' | escape }}"`.

### 1.2 Lists — Safari VoiceOver bug fix

Safari + VoiceOver strips the implicit `list` role from `<ul>` elements styled with `list-style: none`. The result: screen reader users hear an unordered group of items rather than "list, 4 items". The fix is explicit roles.

```html
<ul role="list" class="wow_features__list">
  <li role="listitem" class="wow_features__item">...</li>
  <li role="listitem" class="wow_features__item">...</li>
</ul>
```

Every `<ul>` must carry `role="list"`. Every `<li>` inside it must carry `role="listitem"`.

### 1.3 Decorative elements

Anything that exists purely for visual flourish (dividers, decorative shapes, ornamental SVGs) must be hidden from assistive tech:

```html
<div class="wow_hero__divider" aria-hidden="true"></div>
<svg aria-hidden="true" focusable="false">...</svg>
```

### 1.4 SVG icons

Every SVG must declare `aria-hidden="true"` and `focusable="false"`. The `focusable="false"` is required because IE/Edge legacy makes SVGs focusable by default — the attribute removes them from the tab order.

```html
<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
  <path d="..."/>
</svg>
```

### 1.5 Interactive SVG buttons

When an SVG is itself the interactive element (a logo link, a play button), promote it to an image with a name:

```html
<a href="/" class="wow_logo">
  <svg role="img" aria-label="Acme home" viewBox="0 0 100 24">
    <title>Acme home</title>
    <path d="..."/>
  </svg>
</a>
```

---

## 2. Images

### 2.1 alt parameter is mandatory

Every `image_tag` filter call must include the `alt:` parameter. The Shopify image renderer does not auto-generate it.

```liquid
{{ section.settings.image
  | image_url: width: 1200
  | image_tag:
    alt: section.settings.image_alt | default: section.settings.heading,
    loading: 'lazy',
    class: 'wow_hero__image'
}}
```

### 2.2 Alt text source — schema, never hardcoded

Alt text always comes from a paired `[id]_alt` schema setting so the merchant can tailor it to their content (and translate it). Never hardcode an English string in the Liquid template.

```json
{ "type": "image_picker", "id": "image", "label": "Image" },
{ "type": "text", "id": "image_alt", "label": "Image alt text", "default": "Hero background" }
```

### 2.3 Decorative images

If the image conveys no information (decorative pattern, ornamental graphic), pass an empty alt — but still pass it explicitly:

```liquid
{{ image | image_url: width: 800 | image_tag: alt: '', class: 'wow_hero__pattern' }}
```

### 2.4 CSS background images

Background images set in CSS don't take an alt — but the section that uses them still needs an `aria-label` per §1.1 so the landmark conveys meaning.

---

## 3. Buttons and links

### 3.1 Buttons need a name

Every `<button>` must have either visible text content **or** an `aria-label`. A button with only an icon child (e.g. an SVG with `aria-hidden="true"`) has no accessible name and fails.

```liquid
<!-- ✅ visible text -->
<button class="wow_hero__cta">{{ section.settings.cta_label }}</button>

<!-- ✅ icon-only with aria-label -->
<button class="wow_announcement__close" aria-label="Dismiss announcement">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- ❌ icon-only, no aria-label — broken -->
<button class="wow_announcement__close">
  <svg aria-hidden="true">...</svg>
</button>
```

### 3.2 Links need descriptive text

Every `<a>` must carry descriptive text — never `Click here`, `Read more`, or `Learn more` alone. Screen reader users navigate by link list; isolated generic phrases give no context.

```liquid
<!-- ✅ descriptive -->
<a href="{{ section.settings.cta_url }}">Read the full story on shipping</a>

<!-- ❌ generic — fails -->
<a href="{{ section.settings.cta_url }}">Read more</a>
```

If the merchant's chosen label is generic, surround it with context via `aria-label`:

```liquid
<a href="{{ section.settings.cta_url }}"
   aria-label="{{ section.settings.cta_label }} — {{ section.settings.heading }}">
  {{ section.settings.cta_label }}
</a>
```

### 3.3 Icon-only buttons

`aria-label` is mandatory. The label describes the *action*, not the icon: `aria-label="Open menu"` (not `aria-label="Hamburger"`).

### 3.4 Close buttons

Use a clear verb: `aria-label="Close"`, `aria-label="Dismiss announcement"`, `aria-label="Close dialog"`.

---

## 4. Focus management

### 4.1 Never strip focus without a replacement

Removing the browser's default focus outline is the single most common a11y regression. Keyboard users cannot see where focus is and the page becomes unusable.

```css
/* ❌ broken — keyboard users lose all focus indication */
#shopify-section-{{ section.id }} .wow_hero__cta:focus {
  outline: none;
}

/* ✅ replacement focus style provided */
#shopify-section-{{ section.id }} .wow_hero__cta:focus-visible {
  outline: 2px solid var(--color-foreground);
  outline-offset: 2px;
}
```

### 4.2 Use `:focus-visible`, not `:focus`

`:focus` triggers on every focus event including mouse clicks, which produces an outline on every click — visually noisy and unwelcome. `:focus-visible` only triggers on keyboard focus, which is what users actually need.

### 4.3 Every interactive element needs a focus style

Buttons, links, summary elements, form fields — anything tabbable. Include a `:focus-visible` rule in the section's CSS for each interactive element class.

---

## 5. Color and contrast

### 5.1 Never rely on color alone

Information conveyed only through color (e.g. red = error) is invisible to colour-blind users. Pair colour with an icon, text label, underline, weight, or shape.

### 5.2 Default contrast must pass AA

Merchants control colours via the color settings — but the *defaults* shipped with each preset must clear WCAG 2.1 AA:

- Normal text (< 18 px regular, < 14 px bold): contrast ratio **≥ 4.5 : 1**
- Large text (≥ 18 px regular, ≥ 14 px bold): contrast ratio **≥ 3 : 1**
- UI components & graphical objects: contrast ratio **≥ 3 : 1**

Use the theme's `color_scheme` variables (`--color-foreground` on `--color-background`) — Dawn schemes are designed to clear AA. Override only when the design demands it, and verify the override passes.

---

## 6. Animation

Every CSS transition, keyframe animation, and JS-driven motion must respect the user's reduced-motion preference. Some users get vertigo, nausea, or migraines from in-page motion; the OS-level `prefers-reduced-motion: reduce` setting is how they opt out.

### 6.1 The required block

Every section that contains any animation, transition, or `@keyframes` must include this block in its scoped `<style>`:

```css
@media (prefers-reduced-motion: reduce) {
  #shopify-section-{{ section.id }} *,
  #shopify-section-{{ section.id }} *::before,
  #shopify-section-{{ section.id }} *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Note: `!important` is generally banned (CLAUDE.md hard rules) — this block is the documented exception, because user preference must override every section-level transition.

### 6.2 JS-driven animation

Motion triggered from JavaScript (IntersectionObserver reveal, parallax, autoplay carousels) must check the same media query and skip the motion when reduced motion is preferred:

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  // attach the animation
}
```

---

## 7. Heading hierarchy

### 7.1 Section heading is `<h2>`

The page's `<h1>` belongs to the theme template (collection title, product title, page title). A section dropped onto that page is a sub-region — its main heading is `<h2>`.

```liquid
<h2 class="wow_hero__heading">{{ section.settings.heading }}</h2>
```

### 7.2 Card and block headings are `<h3>`

Headings inside repeated cards or blocks (testimonial author name, feature title, pricing tier name) are children of the section heading — use `<h3>`.

### 7.3 Never skip levels

`<h2>` → `<h3>` is correct. `<h2>` → `<h4>` is broken — screen readers use heading levels to build a navigable outline.

### 7.4 Headings are semantic, not decorative

Never reach for an `<h1>`–`<h6>` because it happens to be the right size. If the design needs large bold text that isn't a heading, use a `<p>` or `<span>` and style it via CSS.

---

## 8. Star ratings

Star rating displays are visual — the underlying meaning ("4 out of 5") must be exposed to screen readers.

```html
<div class="wow_testimonial__stars" role="img" aria-label="4 out of 5 stars">
  <svg class="wow_testimonial__star" aria-hidden="true" focusable="false">...</svg>
  <svg class="wow_testimonial__star" aria-hidden="true" focusable="false">...</svg>
  <svg class="wow_testimonial__star" aria-hidden="true" focusable="false">...</svg>
  <svg class="wow_testimonial__star" aria-hidden="true" focusable="false">...</svg>
  <svg class="wow_testimonial__star wow_testimonial__star--empty" aria-hidden="true" focusable="false">...</svg>
</div>
```

- Container: `role="img"` plus `aria-label="X out of 5 stars"` — pulls the rating into a single announcement.
- Each star SVG: `aria-hidden="true"` plus `focusable="false"` — they're already covered by the container label.

---

## 9. The automated check

```bash
npm run a11y-check        # accessibility only
npm run validate-all      # shopify theme check + mobile + accessibility
```

`accessibility-check.js` reports per file in the same format as `mobile-check.js`. Exit code is non-zero only when there's a `FAIL` — `WARN`s do not break CI but must be manually verified before commit.

---

## 10. WOW Accessibility Checklist

Walk through every box before marking a section validated.

### HTML structure
- [ ] `<section>` has `aria-label="{{ heading | default: '[Section name]' | escape }}"`
- [ ] Every `<ul>` has `role="list"`
- [ ] Every `<li>` inside a `role="list"` ul has `role="listitem"`
- [ ] Decorative dividers and visual-only elements have `aria-hidden="true"`
- [ ] Every SVG icon has `aria-hidden="true"` and `focusable="false"`
- [ ] Interactive SVG elements (logo links, icon buttons) have `role="img"` and `aria-label="..."`

### Images
- [ ] Every `image_tag` filter call includes `alt:`
- [ ] Alt text comes from a paired `[id]_alt` schema setting — never hardcoded
- [ ] Decorative images use `alt: ''`
- [ ] Sections relying on CSS background images carry an `aria-label` on the section root

### Buttons and links
- [ ] Every `<button>` has visible text content **or** `aria-label`
- [ ] Every `<a>` has descriptive text — no bare "Click here" / "Read more"
- [ ] Icon-only buttons carry `aria-label` describing the action
- [ ] Close buttons use `aria-label="Close"` or `aria-label="Dismiss …"`

### Focus management
- [ ] No `outline: none` / `outline: 0` without a replacement focus style
- [ ] Every interactive element has a `:focus-visible` rule
- [ ] Focus styles use `:focus-visible`, not `:focus`

### Color and contrast
- [ ] No information is conveyed by colour alone
- [ ] Default scheme passes WCAG AA (4.5:1 normal text, 3:1 large text)

### Animation
- [ ] Every section with animation/transition includes `@media (prefers-reduced-motion: reduce)` reset
- [ ] JS-driven motion checks `matchMedia('(prefers-reduced-motion: reduce)')` before running

### Heading hierarchy
- [ ] Section main heading is `<h2>` (never `<h1>`)
- [ ] Card / block headings are `<h3>`
- [ ] No skipped levels (`<h2>` followed by `<h4>`)
- [ ] Headings used for semantics, not visual styling

### Star ratings
- [ ] Star rating container has `role="img"` and `aria-label="X out of 5 stars"`
- [ ] Individual star SVGs carry `aria-hidden="true"` and `focusable="false"`

### Automated check
- [ ] `npm run a11y-check` reports 0 FAILs across the section
- [ ] Every WARN was manually verified
