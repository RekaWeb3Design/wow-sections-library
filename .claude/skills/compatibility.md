# Compatibility — Liquid Lab

Rules to ensure every Liquid Lab section drops cleanly into any modern Shopify Online Store 2.0 theme.

---

## 1. Target themes

Every section must work on:

- **Dawn** (Shopify reference theme)
- **Sense**
- **Craft**
- **Debut**
- **Horizon**

All five are OS 2.0 themes. If a feature isn't supported across all five, don't use it.

---

## 2. CSS scope rules

- **Never target `body`, `html`, or `:root`** in section CSS. These are theme-owned.
- **Every selector** must live under `#shopify-section-{{ section.id }}`.

```css
/* ❌ TILOS — pollutes the theme */
body { ... }
html { ... }
:root { --color-primary: red; }

/* ✅ HELYES */
#shopify-section-{{ section.id }} .lab_hero { ... }
```

---

## 3. Color scheme integration (Dawn-compatible)

Apply the merchant's chosen color scheme to the section root using Dawn's class naming convention:

```liquid
<section
  id="lab-{{ section.id }}"
  class="lab_hero lab_section color-{{ section.settings.color_scheme }} gradient"
>
  ...
</section>
```

This activates the theme's CSS variables (`--color-background`, `--color-foreground`, `--color-button`, etc.) inside the section. Reference these variables in your CSS rather than hardcoded hex values.

---

## 4. Schema requirements

Every section's `{% schema %}` block must include:

```json
{
  "name": "Liquid Lab [Name]",
  "tag": "section",
  "class": "lab_section",
  "disabled_on": {
    "groups": ["header", "footer"]
  },
  "settings": [ ... ],
  "presets": [
    { "name": "Liquid Lab [Name]" }
  ]
}
```

- `"tag": "section"` — semantic HTML wrapper.
- `"class": "lab_section"` — namespacing hook so themes can target Liquid Lab sections in bulk if needed.
- `"disabled_on": { "groups": ["header","footer"] }` — sections were never designed to live in those groups.
- A `presets` block — without it, merchants cannot add the section from the editor.

---

## 5. Standard Shopify settings types only

Use **only** types documented in the official Shopify schema reference. No custom or undocumented types.

Allowed (non-exhaustive): `text`, `textarea`, `richtext`, `inline_richtext`, `number`, `range`, `checkbox`, `radio`, `select`, `color`, `color_scheme`, `color_scheme_group`, `image_picker`, `video`, `video_url`, `url`, `link_list`, `font_picker`, `collection`, `collection_list`, `product`, `product_list`, `blog`, `page`, `article`, `header`, `paragraph`.

If an experimental type isn't in the docs, don't use it — it may not exist on every theme version.

---

## 6. Sections everywhere (OS 2.0)

Sections must work on **any page template**, not just the homepage:

- Don't assume `template == 'index'`.
- Don't reference homepage-only objects.
- Don't rely on global theme settings that may not exist on every theme.

Test the section by adding it to a product page, collection page, and a custom page. If it breaks, it's not OS 2.0-compatible.

---

## 7. Locales-safe — no hardcoded display strings

**Never hardcode user-visible strings in Liquid.** Every label, button text, heading, or description must come from a schema setting so the merchant can edit (and translate) it.

```liquid
{% comment %} ❌ TILOS — merchant can't change "Shop now" {% endcomment %}
<a href="{{ section.settings.cta_url }}" class="lab_hero__cta">Shop now</a>

{% comment %} ✅ HELYES — comes from schema, merchant editable, locale-safe {% endcomment %}
<a href="{{ section.settings.cta_url }}" class="lab_hero__cta">
  {{ section.settings.cta_label }}
</a>
```

The single allowed exception is **placeholder fallbacks via `default`** — and even then, the default belongs in the schema setting (`"default": "Shop now"`), not in the Liquid template.
