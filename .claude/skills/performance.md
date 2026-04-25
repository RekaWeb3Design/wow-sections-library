# Performance — Liquid Lab

Performance rules for every Liquid Lab section. These are not suggestions — every section must comply.

---

## 1. Images

- **LCP loading**: when `section.index <= 2`, use `loading="eager"` and `fetchpriority="high"`. Otherwise `loading="lazy"`, `fetchpriority="auto"`.
- **Always set explicit `width` and `height`** on `<img>` to prevent CLS.
- **Use `widths` parameter** for srcset: `'400, 800, 1200, 1600'`.
- **Never request a wider image than the layout needs** — cap `width` at the largest container size in the design.

```liquid
{% if section.index <= 2 %}
  {% assign image_loading = 'eager' %}
  {% assign image_fetchpriority = 'high' %}
{% else %}
  {% assign image_loading = 'lazy' %}
  {% assign image_fetchpriority = 'auto' %}
{% endif %}

{{ section.settings.image | image_url: width: 1600 | image_tag:
  alt: section.settings.image_alt,
  loading: image_loading,
  fetchpriority: image_fetchpriority,
  width: 1600,
  height: 900,
  widths: '400, 800, 1200, 1600',
  sizes: '100vw',
  class: 'lab_hero__image'
}}
```

---

## 2. CSS

- **Max 15KB per section** (uncompressed). If you exceed it, simplify.
- **No duplicate properties** in the same selector.
- **Never use `display: none` in CSS** to conditionally hide content. Use Liquid `{% if %}` to skip rendering instead — saves DOM nodes and bytes.
- **`will-change` only on actually animated elements**, never blanket-applied. Remove it after the animation finishes when possible.

```liquid
{% comment %} ✅ HELYES — don't render at all {% endcomment %}
{% if section.settings.show_subheading %}
  <p class="lab_hero__subheading">{{ section.settings.subheading }}</p>
{% endif %}

{% comment %} ❌ TILOS — DOM weight + CSS bytes for nothing {% endcomment %}
<p class="lab_hero__subheading" style="display: none;">...</p>
```

---

## 3. JavaScript

- **Avoid JS if CSS solves the problem.** Hover effects, transitions, accordions (`<details>`), tabs (radio + `:checked`) — all CSS-only.
- **If JS is required:**
  - Wrap in an **IIFE**.
  - **Scope to `section.id`** (`document.getElementById('lab-{{ section.id }}')`) — never select by class.
  - **No external libraries.** Vanilla JS only.
  - Use **`IntersectionObserver`** for scroll-triggered animations (never `scroll` event listeners).
  - **Always clean up event listeners** — store references, remove on `disconnect` or section unload (Theme Editor re-renders sections).

```javascript
(function() {
  const section = document.getElementById('lab-{{ section.id }}');
  if (!section) return;

  const target = section.querySelector('.lab_hero__image');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(target);

  // Theme Editor sends this when the section is removed/re-rendered
  document.addEventListener('shopify:section:unload', function handler(e) {
    if (e.target !== section) return;
    observer.disconnect();
    document.removeEventListener('shopify:section:unload', handler);
  });
})();
```

---

## 4. Liquid

- Use the `{% liquid %}` tag for multiple consecutive assignments — fewer tag delimiters, easier to read.
- **No nested loops deeper than 2 levels.** If you need 3, restructure the data.

```liquid
{% liquid
  assign section_id = section.id
  assign heading = section.settings.heading
  assign cta_label = section.settings.cta_label | default: 'Shop now'
  assign image = section.settings.image
%}
```

---

## 5. Validation checklist

Before marking a section as performance-compliant, verify every box:

- [ ] LCP image: `eager` + `fetchpriority="high"` only when `section.index <= 2`
- [ ] Every `<img>` has explicit `width` and `height` attributes
- [ ] `widths: '400, 800, 1200, 1600'` used on responsive images
- [ ] No image requested wider than the layout needs
- [ ] CSS for the section is under 15KB uncompressed
- [ ] No duplicate properties in any CSS selector
- [ ] No `display: none` in CSS — Liquid `{% if %}` used instead
- [ ] `will-change` applied only to actually animated elements
- [ ] No JS used where CSS would suffice
- [ ] All JS wrapped in an IIFE
- [ ] All JS scoped to `section.id`, never to a class selector
- [ ] No external JS libraries imported
- [ ] Scroll animations use `IntersectionObserver`, not `scroll` events
- [ ] Event listeners and observers are cleaned up on `shopify:section:unload`
- [ ] Multiple Liquid `assign`s grouped in a `{% liquid %}` block
- [ ] No nested Liquid loops deeper than 2 levels
