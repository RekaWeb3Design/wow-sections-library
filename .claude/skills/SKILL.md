# WOW Section Library — Claude Code Master Skill

Ez a fájl automatikusan betöltődik minden Claude Code session elején.
**Olvasd el teljes egészében mielőtt bármilyen szekciót generálsz vagy módosítasz.**

---

## 1. Projekt áttekintés

A WOW Section Library egy Shopify Liquid section könyvtár, amelyet:
- **Fejlesztők** Claude Code MCP-n keresztül pull-olhatnak
- **Kereskedők** copy-paste-szel telepíthetnek

Minden generált szekció a **WOW konvenciók** szerint készül — ezek nem opcionálisak.

---

## 2. Repo struktúra

```
wow-sections-library/
├── sections/                  # Kész .liquid fájlok
│   ├── wow-hero-basic.liquid
│   ├── wow-features-icons.liquid
│   └── ...
├── registry/                  # Metadata JSON fájlok
│   ├── wow-hero-basic.json
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

## 3. WOW konvenciók — KÖTELEZŐ

### 3.1 Fájlnév

```
wow-[funkcio-neve].liquid
```

Példák: `wow-hero-basic.liquid`, `wow-testimonials-grid.liquid`

### 3.2 CSS prefix

**MINDEN** CSS class `wow_` prefixszel kezdődik. Kivétel nincs.

```css
/* ✅ HELYES */
.wow_hero { }
.wow_hero__title { }
.wow_hero__cta-button { }

/* ❌ TILOS */
.hero { }
.title { }
.section-wrapper { }
```

### 3.3 Section ID scope — szivárgás megelőzése

**MINDEN** CSS szelektor `#shopify-section-{{ section.id }}` scope-ba kerül.

```css
/* ✅ HELYES */
#shopify-section-{{ section.id }} .wow_hero { }
#shopify-section-{{ section.id }} .wow_hero__title { }

/* ❌ TILOS — globálisan szennyezi a témát */
.wow_hero { }
```

### 3.4 Responsive layout — vw és clamp()

Px-alapú breakpointok helyett `clamp()` és `vw` egységek.

```css
/* ✅ HELYES */
.wow_hero__title {
  font-size: clamp(1.75rem, 4vw, 3.5rem);
  padding: clamp(2rem, 5vw, 5rem) clamp(1rem, 3vw, 2rem);
  gap: clamp(1rem, 2vw, 2rem);
}

/* ❌ TILOS */
.wow_hero__title {
  font-size: 48px;
}
@media (max-width: 768px) {
  .wow_hero__title { font-size: 28px; }
}
```

### 3.5 CSS változók — dark mode és theming

Hardcoded hex helyett CSS változók a theme-kompatibilitáshoz.

```css
/* ✅ HELYES */
.wow_hero {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border-color: var(--color-border);
}

/* ❌ TILOS */
.wow_hero {
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
<section id="wow-{{ section_id }}" class="wow_[nev] wow_section">
  <!-- tartalom -->
</section>

{% comment %} 3. CSS — section scope-olva {% endcomment %}
<style>
  #shopify-section-{{ section.id }} .wow_[nev] {
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

### 4.1 Alap schema template

```json
{
  "name": "WOW [Szekció neve]",
  "tag": "section",
  "class": "wow_section",
  "disabled_on": {
    "groups": ["header", "footer"]
  },
  "settings": [],
  "blocks": [],
  "presets": [
    {
      "name": "WOW [Szekció neve]"
    }
  ]
}
```

### 4.2 Settings sorrend — KÖTELEZŐ

A settings-eket mindig ebben a sorrendben add meg:

1. **Content** — szövegek, gombok, linkek
2. **Typography** — betűméret, betűstílus
3. **Media** — képek, videók
4. **Layout** — elrendezés, oszlopok
5. **Appearance** — színek, háttér
6. **Animation** — átmenetek, animációk
7. **Spacing** — padding, margin

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
#shopify-section-{{ section.id }} .wow_[nev] {
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
  class: 'wow_hero__image'
}}

<!-- Gombok: aria-label ha nincs látható szöveg -->
<button class="wow_hero__cta" aria-label="{{ section.settings.cta_label }}">
  {{ section.settings.cta_label }}
</button>

<!-- Szekciók: landmark role -->
<section class="wow_hero" aria-label="{{ section.settings.heading }}">
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
  const section = document.getElementById('wow-{{ section.id }}');
  if (!section) return;

  // logika itt
})();

// ❌ TILOS — globális változók, document.querySelector class alapján
const hero = document.querySelector('.wow_hero');
window.myVar = 'something';
```

---

## 7. Generálás előtti checklist

Mielőtt bármilyen szekciót generálsz, ellenőrizd:

- [ ] Fájlnév: `wow-[nev].liquid` formátum
- [ ] Minden CSS class: `wow_` prefix
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
  "name": "wow-hero-basic",
  "display_name": "WOW Hero — Basic",
  "category": "hero",
  "tags": ["hero", "cta", "image", "free"],
  "tier": "free",
  "version": "1.0.0",
  "description": "Egyszerű hero szekció: cím, alcím, CTA gomb, háttérkép",
  "preview_url": "",
  "screenshot": "",
  "liquid_file": "sections/wow-hero-basic.liquid",
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
- `document.querySelector('.wow_...')` — mindig section ID alapján
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
