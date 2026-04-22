# Validator — WOW Section Library

Final QA pass before a section is marked validated and merged to `main`. Two stages: (1) `shopify theme check`, then (2) the WOW custom checklist.

---

## 1. Run `shopify theme check`

Run from the project root with the `--path` flag:

```bash
shopify theme check --path .
```

**Target result: 0 errors, 0 warnings.**

### Known acceptable noise

`locales/` ENOENT messages are expected — this repository is a section library, not a full theme, so it has no `locales/` folder. These messages are **not** real errors. Any other warning or error must be fixed before continuing.

---

## 2. WOW custom validation checklist

After `shopify theme check` passes, walk through this checklist for the section. **Every box must be ticked** before the section is marked validated.

- [ ] All CSS classes use the `wow_` prefix
- [ ] Every CSS selector is scoped under `#shopify-section-{{ section.id }}`
- [ ] No hardcoded hex colors (`#fff`, `rgb(...)`, `hsl(...)`) — CSS variables only
- [ ] No `!important` declarations anywhere
- [ ] No `max-width` media queries — mobile-first `min-width` only
- [ ] `padding_top` setting present (range 0–120, step 4, default 60)
- [ ] `padding_bottom` setting present (range 0–120, step 4, default 60)
- [ ] `color_scheme` setting present (default `scheme-1`)
- [ ] Schema includes a `presets` block
- [ ] Schema name is 25 characters or fewer (Shopify hard limit)
- [ ] Every image has alt text handled (paired `image_alt` setting + `alt:` on `image_tag`)
- [ ] Every button has both label **and** url settings, with blank checks before rendering the link
- [ ] If the section has JavaScript, it is wrapped in an IIFE and scoped to `section.id`

### Button blank check pattern

```liquid
{% if section.settings.cta_url != blank and section.settings.cta_label != blank %}
  <a href="{{ section.settings.cta_url }}" class="wow_hero__cta">
    {{ section.settings.cta_label }}
  </a>
{% endif %}
```

---

## 3. Marking a section as validated

A section is **validated** only when:

1. `shopify theme check --path .` returns 0 errors, 0 warnings (locales/ ENOENT excepted), AND
2. Every item on the WOW checklist above is confirmed.

If any item fails, fix the section and re-run both stages from the top. Do not mark validated until the full checklist passes in a single pass.
