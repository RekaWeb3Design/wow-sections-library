# Liquid Lab — Claude Code Master Skill

Ez a fájl automatikusan betöltődik minden Claude Code session elején.
**Olvasd el teljes egészében mielőtt bármilyen szekciót generálsz vagy módosítasz.**

---

## 1. Projekt áttekintés

A Liquid Lab egy Shopify Liquid section könyvtár, amelyet:
- **Fejlesztők** Claude Code MCP-n keresztül pull-olhatnak
- **Kereskedők** copy-paste-szel telepíthetnek

Minden generált szekció a **Liquid Lab konvenciók** szerint készül — ezek nem opcionálisak.

---

## 2. Repo struktúra

```
liquid-lab-sections/
├── sections/                  # Kész .liquid fájlok
│   ├── liquid-lab-hero-basic.liquid
│   ├── liquid-lab-features-icons.liquid
│   └── ...
├── registry/                  # Metadata JSON fájlok
│   ├── liquid-lab-hero-basic.json
│   └── index.json             # Az összes szekció indexe
├── scripts/                   # Pipeline scriptek
│   ├── extract.js             # Forrás scraping
│   ├── generate.js            # Liquid generálás
│   └── validate.js            # QA ellenőrzés
├── preview/                   # Preview weboldal
└── .claude/
    └── skills/
        └── SKILL.md           # Ez a fájl
```

---

## 3. Liquid Lab konvenciók — KÖTELEZŐ

### 3.1 Fájlnév

```
liquid-lab-[funkcio-neve].liquid
```

Példák: `liquid-lab-hero-basic.liquid`, `liquid-lab-testimonials-grid.liquid`

### 3.2 CSS prefix

**MINDEN** CSS class `lab_` prefixszel kezdődik. Kivétel nincs.

```css
/* ✅ HELYES */
.lab_hero { }
.lab_hero__title { }
.lab_hero__cta-button { }

/* ❌ TILOS */
.hero { }
.title { }
.section-wrapper { }
```

### 3.3 Section ID scope — szivárgás megelőzése

**MINDEN** CSS szelektor `#shopify-section-{{ section.id }}` scope-ba kerül.

```css
/* ✅ HELYES */
#shopify-section-{{ section.id }} .lab_hero { }
#shopify-section-{{ section.id }} .lab_hero__title { }

/* ❌ TILOS — globálisan szennyezi a témát */
.lab_hero { }
```

### 3.4 Responsive layout — vw és clamp()

Px-alapú breakpointok helyett `clamp()` és `vw` egységek.

```css
/* ✅ HELYES */
.lab_hero__title {
  font-size: clamp(1.75rem, 4vw, 3.5rem);
  padding: clamp(2rem, 5vw, 5rem) clamp(1rem, 3vw, 2rem);
  gap: clamp(1rem, 2vw, 2rem);
}

/* ❌ TILOS */
.lab_hero__title {
  font-size: 48px;
}
@media (max-width: 768px) {
  .lab_hero__title { font-size: 28px; }
}
```

### 3.5 CSS változók — dark mode és theming

Hardcoded hex helyett CSS változók a theme-kompatibilitáshoz.

```css
/* ✅ HELYES */
.lab_hero {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border-color: var(--color-border);
}

/* ❌ TILOS */
.lab_hero {
  background-color: #ffffff;
  color: #1a1a1a;
}
```

### 3.6 Fájlstruktúra — belső sorrend

Minden `.liquid` fájl ebben a sorrendben épül fel:

```liquid
{% comment %} 1. Schema beolvasás {% endcomment %}
{% assign section_id = section.id %}

{% comment %} 2. HTML struktúra {% endcomment %}
<section id="lab-{{ section_id }}" class="lab_[nev] lab_section">
  <!-- tartalom -->
</section>

{% comment %} 3. CSS — section scope-olva {% endcomment %}
<style>
  #shopify-section-{{ section.id }} .lab_[nev] {
    /* stílusok */
  }
</style>

{% comment %} 4. JavaScript — csak ha szükséges {% endcomment %}
<script>
  (function() {
    /* önállóan futó IIFE */
  })();
</script>

{% comment %} 5. Schema — mindig utolsó {% endcomment %}
{% schema %}
{ ... }
{% endschema %}
```

---

## 4. Schema konvenciók

- **All schema labels, default text values, info fields, option labels, and preset names must be in English — no exceptions. This library targets the international market.**
- **Before designing any schema, read schema-designer.md § UI Element Settings Standard and apply ALL relevant element rules.**
- **Layout & alignment settings (schema-designer.md §8.8) are mandatory**: add `[id]_text_align` to every text element (after `[id]_transform`); add `content_position` to every hero / banner / full-width image section; use `items_gap` and `items_align` in every grid/flex container (never hardcode the gap); add `content_max_width` to every section with a centered content block.
- **Universal section settings (schema-designer.md §8.9) are mandatory on EVERY section**: `hide_on_mobile` + `hide_on_desktop` (Layout group, 749/750px breakpoints), `section_width` (Layout group, always controls `.__inner` wrapper — never the section root), and a `custom_css` textarea inside its own `Custom CSS` header group placed last, immediately before `presets`, after the Spacing group. The liquid-output `{{ section.settings.custom_css }}` line belongs at the very end of the `<style>` block.

### 4.1 Alap schema template

```json
{
  "name": "🧪 [Short name]",
  "tag": "section",
  "class": "lab_section",
  "disabled_on": {
    "groups": ["header", "footer"]
  },
  "settings": [],
  "blocks": [],
  "presets": [
    {
      "name": "🧪 [Short name]",
      "category": "Liquid Lab"
    }
  ]
}
```

**Schema name: max 25 chars — use format `"🧪 [Short name]"` (the 🧪 emoji is the Liquid Lab brand marker).** Shopify hard-limits `schema.name` to 25 characters; sections exceeding this fail to load in the Theme Editor. The `presets[].name` must match the schema `name`.

**Preset category: always `"category": "Liquid Lab"`.** This groups Liquid Lab sections together in the Theme Editor's "Add section" picker so merchants can find them as a distinct set. The left-rail (already-added sections) uses Shopify's hard-coded Header/Template/Footer tree and cannot be customized — the `🧪` prefix in `name` is the only differentiator there.

### 4.2 Settings sorrend — KÖTELEZŐ

Minden Liquid Lab szekció ezt a sorrendet követi a stabil merchant UX érdekében.
A `<<INCLUDE: ...>>` markereket a build script (`scripts/build-section-schemas.js`)
oldja fel a `schema-fragments/` mappából:

1. **Color scheme** — `<<INCLUDE: color-scheme-selector>>`
2. **Content** — szöveges/médiamezők (heading, subheading, image, link, …)
3. **Heading typography** — `<<INCLUDE: typography-heading>>`
4. **Subheading typography** — `<<INCLUDE: typography-subheading>>`
5. **Button** — gomb-szövegek, majd `<<INCLUDE: button-styles>>` (a button color override is ebben van)
6. **Layout** — szekció-specifikus elrendezés (oszlopok, layout style, …)
7. **Section background** — `<<INCLUDE: section-background>>` (color override + image overlay)
8. **Animation** — szekció-specifikus animáció (entrance, transition, …)
9. **Spacing + Visibility + Custom CSS** — `<<INCLUDE: universal>>` (három header egyetlen fragmentben)

### 4.2.1 Color override naming convention — KÖTELEZŐ

Minden color override label-jében benne van a kontextus, hogy a Theme Editorban
egyértelmű legyen mit szabályoz amikor több override stack-elődik:

- ✅ "Heading color override"
- ✅ "Subheading color override"
- ✅ "Button background color"
- ✅ "Section background color override"
- ❌ "Color override" (nem egyértelmű)
- ❌ "Color" (nem specifikus)

A setting `id`-ket NE változtasd meg fragment refactor során — csak a `label`-eket.
A szekció liquid fájlok az `id`-re hivatkoznak, label-re nem.

### 4.3 Kötelező settings minden szekcióban

```json
{
  "type": "header",
  "content": "Spacing"
},
{
  "type": "range",
  "id": "padding_top",
  "label": "Padding top",
  "min": 0,
  "max": 120,
  "step": 4,
  "unit": "px",
  "default": 60
},
{
  "type": "range",
  "id": "padding_bottom",
  "label": "Padding bottom",
  "min": 0,
  "max": 120,
  "step": 4,
  "unit": "px",
  "default": 60
}
```

### 4.4 Spacing alkalmazása CSS-ben

```css
#shopify-section-{{ section.id }} .lab_[nev] {
  padding-top: {{ section.settings.padding_top }}px;
  padding-bottom: {{ section.settings.padding_bottom }}px;
}
```

---

## 5. Accessibility — kötelező minimum

```html
<!-- Képek: mindig alt text -->
{{ section.settings.image | image_url: width: 1200 | image_tag:
  alt: section.settings.image_alt | default: section.settings.heading,
  loading: 'lazy',
  class: 'lab_hero__image'
}}

<!-- Gombok: aria-label ha nincs látható szöveg -->
<button class="lab_hero__cta" aria-label="{{ section.settings.cta_label }}">
  {{ section.settings.cta_label }}
</button>

<!-- Szekciók: landmark role -->
<section class="lab_hero" aria-label="{{ section.settings.heading }}">
```

### LCP optimalizálás

```liquid
{% if section.index <= 2 %}
  {% assign image_loading = 'eager' %}
  {% assign image_fetchpriority = 'high' %}
{% else %}
  {% assign image_loading = 'lazy' %}
  {% assign image_fetchpriority = 'auto' %}
{% endif %}
```

---

## 6. JavaScript szabályok

```javascript
// ✅ HELYES — IIFE, section-specifikus selector
(function() {
  const section = document.getElementById('lab-{{ section.id }}');
  if (!section) return;

  // logika itt
})();

// ❌ TILOS — globális változók, document.querySelector class alapján
const hero = document.querySelector('.lab_hero');
window.myVar = 'something';
```

---

## 7. Generálás előtti checklist

Mielőtt bármilyen szekciót generálsz, ellenőrizd:

- [ ] Fájlnév: `liquid-lab-[nev].liquid` formátum
- [ ] Minden CSS class: `lab_` prefix
- [ ] Minden CSS szelektor: `#shopify-section-{{ section.id }}` scope
- [ ] Responsive: `clamp()` és/vagy `vw` egységek — nincs px breakpoint
- [ ] CSS változók: nincs hardcoded szín hex
- [ ] Settings sorrend: Content → Typography → Media → Layout → Appearance → Animation → Spacing
- [ ] Spacing settings: `padding_top` és `padding_bottom` mindig szerepel
- [ ] Accessibility: alt text képeken, aria-label gombokon
- [ ] JavaScript: IIFE-be csomagolva, section ID alapján szelektálva
- [ ] Schema: valid JSON, van `presets` blokk

---

## 8. Metadata JSON — minden szekcióhoz

A `registry/` mappában minden szekcióhoz létre kell hozni egy JSON fájlt:

```json
{
  "name": "liquid-lab-hero-basic",
  "display_name": "Liquid Lab Hero — Basic",
  "category": "hero",
  "tags": ["hero", "cta", "image", "free"],
  "tier": "free",
  "version": "1.0.0",
  "description": "Egyszerű hero szekció: cím, alcím, CTA gomb, háttérkép",
  "preview_url": "",
  "screenshot": "",
  "liquid_file": "sections/liquid-lab-hero-basic.liquid",
  "compatible_themes": ["dawn", "sense", "debut"],
  "shopify_version": "2.0",
  "settings_count": 0,
  "blocks_supported": false,
  "created_at": "2026-04-22",
  "source": "original"
}
```

---

## 9. Amit TILOS csinálni

- `!important` használata CSS-ben
- `max-width` media query (csak `min-width` / mobile-first)
- Globális CSS osztályok scope nélkül
- Inline style attribútumok HTML-ben (`style="..."`)
- Hardcoded színek (`#fff`, `rgb(...)`)
- `document.querySelector('.lab_...')` — mindig section ID alapján
- Több mint egy `<style>` blokk per szekció
- Schema-ban duplikált `id` értékek
- `height="auto"` HTML attribútum (invalid)

---

## 10. Gyors referencia — section index frissítése

Minden új szekció után frissítsd a `registry/index.json` fájlt:

```bash
node scripts/generate-index.js
```

Ez automatikusan beolvassa az összes `registry/*.json` fájlt és frissíti az indexet.
