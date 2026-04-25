# Schema Designer — Liquid Lab

Rules for designing Theme Editor settings (the `{% schema %}` block) on every Liquid Lab section.

---

## 0. Preset category — MANDATORY

Every preset must include `"category": "Liquid Lab"`. Shopify groups sections in the Theme Editor's "Add section" picker by this category, so this is how merchants find Liquid Lab sections as a distinct group rather than scattered among the theme's native sections.

```json
"presets": [
  {
    "name": "🧪 [Short name]",
    "category": "Liquid Lab"
  }
]
```

The Theme Editor's left-rail (already-added sections) cannot have custom groups — that tree is hard-coded to Header/Template/Footer. The `🧪` in the `name` field is the only distinguishing marker there. But the "Add section" picker respects `category`, so that's where this rule applies.

---

## 1. Settings group order — MANDATORY

Settings must always be grouped in this order:

1. **Content** — text, headings, links, copy
2. **Typography** — sizes, weights, colors, letter spacing, line height of every text element
3. **Media** — images, videos, icons
4. **Layout** — alignment, columns, mobile behavior, visibility, section width
5. **Appearance** — color scheme, section background, cards, buttons, borders, shadows
6. **Animation** — transitions, scroll effects
7. **Spacing** — padding, margins
8. **Custom CSS** — escape hatch `custom_css` textarea (always last, immediately before `presets`)

Each group is introduced with a `header` setting:

```json
{ "type": "header", "content": "Content" }
```

---

## 2. Content group rules

- **Every text setting must have a `default` value.** Merchants never see empty fields in the editor.
- **Every button is a pair**: `label` (`type: text`) **and** `url` (`type: url`). Never one without the other.

```json
{
  "type": "text",
  "id": "heading",
  "label": "Heading",
  "default": "Welcome to our store"
},
{
  "type": "text",
  "id": "cta_label",
  "label": "Button label",
  "default": "Shop now"
},
{
  "type": "url",
  "id": "cta_url",
  "label": "Button link"
}
```

---

## 3. Typography group rules

- Holds the typography controls for every text element in the section (heading, subheading, body text, label, badge).
- The exact settings required per text element are defined in **§8 UI Element Settings Standard → Text elements**.

---

## 4. Media group rules

- **Every `image_picker` is paired with a separate text field for alt text.**
- Every image element must also carry the image settings defined in **§8 UI Element Settings Standard → Image elements** (border radius, overlay, object fit, aspect ratio).

```json
{
  "type": "image_picker",
  "id": "image",
  "label": "Image"
},
{
  "type": "text",
  "id": "image_alt",
  "label": "Image alt text",
  "default": "Decorative image"
}
```

---

## 5. Layout group rules

- Must include `content_alignment` (select: `left` / `center` / `right`).
- Sections that contain images must also include `mobile_layout` (select: `stack` / `reverse`).
- The additional layout settings defined in **§8.8 Layout & Alignment elements** (`content_position`, `content_max_width`, `items_gap`, `items_align`) are mandatory whenever the section type triggers their rule — all of them live in the Layout group.

```json
{
  "type": "select",
  "id": "content_alignment",
  "label": "Content alignment",
  "options": [
    { "value": "left", "label": "Left" },
    { "value": "center", "label": "Center" },
    { "value": "right", "label": "Right" }
  ],
  "default": "center"
},
{
  "type": "select",
  "id": "mobile_layout",
  "label": "Mobile layout",
  "options": [
    { "value": "stack", "label": "Stack (image first)" },
    { "value": "reverse", "label": "Reverse (text first)" }
  ],
  "default": "stack"
}
```

---

## 6. Appearance group rules

- Must always include `color_scheme` (`type: color_scheme`, default `scheme-1`).
- Holds the section background, every card/container, every button, and every divider/border.
- The exact settings required per element are defined in **§8 UI Element Settings Standard**.

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```

---

## 7. Animation group rules

Animation settings must always be exactly these three, in this order, with `visible_if` conditions:

```json
{
  "type": "checkbox",
  "id": "animation_enabled",
  "label": "Enable animation",
  "default": false
},
{
  "type": "select",
  "id": "animation_type",
  "label": "Animation type",
  "options": [
    { "value": "fade", "label": "Fade" },
    { "value": "slide", "label": "Slide" },
    { "value": "zoom", "label": "Zoom" }
  ],
  "default": "fade",
  "visible_if": "{{ section.settings.animation_enabled }}"
},
{
  "type": "range",
  "id": "animation_delay",
  "label": "Animation delay",
  "min": 0,
  "max": 500,
  "step": 50,
  "unit": "ms",
  "default": 0,
  "visible_if": "{{ section.settings.animation_enabled }}"
}
```

---

## 8. UI Element Settings Standard — MANDATORY

This standard defines exactly which settings are required for each UI element type.

**When a section contains any of these elements, ALL listed settings for that element MUST be included in the schema — no exceptions.**

### 8.1 Global rules

These rules apply to every element group below:

1. **Hover settings are grouped together immediately after the base settings of the same element.** Never mix hover and non-hover settings. Finish all base (non-hover) settings first, then list every hover setting as a contiguous block.
2. **Every color setting must have a matching opacity setting directly below it.** A `*_color` setting is never allowed to stand alone — it must be followed by a `*_color_opacity` range (min `0`, max `100`, step `5`, default `100`). This rule applies to text colors, border colors, overlay colors, gradient colors — every color on every element.
3. **Element settings live in the relevant group from §1**:
   - Text element settings → **Typography** group
   - Card / container element settings → **Appearance** group
   - Button element settings → **Appearance** group
   - Divider / border element settings → **Appearance** group
   - Section background settings → **Appearance** group
   - Image element settings → **Media** group
   - Layout & alignment settings (§8.8) → **Layout** group
   - Visibility + section width settings (§8.9) → **Layout** group
   - `custom_css` (§8.9) → **Custom CSS** group (always last, immediately before `presets`)

`[id]` in every template below is the element's identifier slug (e.g. `heading`, `subheading`, `cta`, `secondary_cta`, `testimonial_card`, `hero_image`). Use `snake_case` and a consistent slug across all settings for the same element.

---

### 8.2 Text elements

Apply to every **heading, subheading, body text, label, badge** in the section. Settings go in the **Typography** group.

```json
{
  "type": "range",
  "id": "[id]_size",
  "label": "[Element] size",
  "min": 12,
  "max": 80,
  "step": 1,
  "unit": "px",
  "default": 16
},
{
  "type": "select",
  "id": "[id]_weight",
  "label": "[Element] weight",
  "options": [
    { "value": "300", "label": "Thin" },
    { "value": "400", "label": "Regular" },
    { "value": "500", "label": "Medium" },
    { "value": "600", "label": "Semibold" },
    { "value": "700", "label": "Bold" }
  ],
  "default": "400"
},
{
  "type": "select",
  "id": "[id]_transform",
  "label": "[Element] text transform",
  "options": [
    { "value": "none", "label": "None" },
    { "value": "uppercase", "label": "Uppercase" },
    { "value": "capitalize", "label": "Capitalize" }
  ],
  "default": "none"
},
{
  "type": "select",
  "id": "[id]_text_align",
  "label": "[Element] text alignment",
  "options": [
    { "value": "left", "label": "Left" },
    { "value": "center", "label": "Center" },
    { "value": "right", "label": "Right" }
  ],
  "default": "left"
},
{
  "type": "color",
  "id": "[id]_color",
  "label": "[Element] color"
},
{
  "type": "range",
  "id": "[id]_color_opacity",
  "label": "[Element] color opacity",
  "min": 0,
  "max": 100,
  "step": 5,
  "unit": "%",
  "default": 100
},
{
  "type": "range",
  "id": "[id]_letter_spacing",
  "label": "[Element] letter spacing",
  "min": -5,
  "max": 20,
  "step": 1,
  "unit": "em",
  "default": 0,
  "info": "Displayed as 1/100em (0 = 0em, 10 = 0.1em)"
},
{
  "type": "range",
  "id": "[id]_line_height",
  "label": "[Element] line height",
  "min": 10,
  "max": 30,
  "step": 1,
  "default": 15,
  "info": "Displayed as 1/10 (15 = 1.5)"
}
```

Render with `calc()` in CSS to convert the integer merchant input into the real unit:

```css
letter-spacing: calc({{ section.settings.[id]_letter_spacing }} / 100 * 1em);
line-height: calc({{ section.settings.[id]_line_height }} / 10);
```

---

### 8.3 Button elements

Apply to every **CTA button** (primary, secondary, tertiary — every button gets the full set). Settings go in the **Appearance** group.

Base settings (list all before any hover setting):

```json
{
  "type": "color",
  "id": "[id]_bg_color",
  "label": "[Button] background color"
},
{
  "type": "range",
  "id": "[id]_bg_color_opacity",
  "label": "[Button] background color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "color",
  "id": "[id]_text_color",
  "label": "[Button] text color"
},
{
  "type": "range",
  "id": "[id]_text_color_opacity",
  "label": "[Button] text color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "color",
  "id": "[id]_border_color",
  "label": "[Button] border color"
},
{
  "type": "range",
  "id": "[id]_border_color_opacity",
  "label": "[Button] border color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "range",
  "id": "[id]_border_width",
  "label": "[Button] border width",
  "min": 0, "max": 6, "step": 1, "unit": "px", "default": 1
},
{
  "type": "range",
  "id": "[id]_border_radius",
  "label": "[Button] border radius",
  "min": 0, "max": 50, "step": 2, "unit": "px", "default": 4
},
{
  "type": "range",
  "id": "[id]_padding_x",
  "label": "[Button] horizontal padding",
  "min": 8, "max": 80, "step": 2, "unit": "px", "default": 24
},
{
  "type": "range",
  "id": "[id]_padding_y",
  "label": "[Button] vertical padding",
  "min": 4, "max": 40, "step": 2, "unit": "px", "default": 12
}
```

Hover settings (contiguous block, right after base). The `[id]_hover_effect` select comes first, then the individual hover colors:

```json
{
  "type": "select",
  "id": "[id]_hover_effect",
  "label": "[Button] hover effect",
  "options": [
    { "value": "none", "label": "None" },
    { "value": "fill", "label": "Fill" },
    { "value": "darken", "label": "Darken" },
    { "value": "lift", "label": "Lift" },
    { "value": "outline", "label": "Outline" },
    { "value": "glow", "label": "Glow" }
  ],
  "default": "darken"
},
{
  "type": "color",
  "id": "[id]_hover_bg_color",
  "label": "[Button] hover background color"
},
{
  "type": "range",
  "id": "[id]_hover_bg_color_opacity",
  "label": "[Button] hover background color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "color",
  "id": "[id]_hover_text_color",
  "label": "[Button] hover text color"
},
{
  "type": "range",
  "id": "[id]_hover_text_color_opacity",
  "label": "[Button] hover text color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "color",
  "id": "[id]_hover_border_color",
  "label": "[Button] hover border color"
},
{
  "type": "range",
  "id": "[id]_hover_border_color_opacity",
  "label": "[Button] hover border color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
}
```

---

### 8.4 Card / container elements

Apply to every **card, panel, box** rendered inside the section (testimonial card, feature card, product card, pricing panel). Settings go in the **Appearance** group.

Base settings (list all before any hover setting):

```json
{
  "type": "color",
  "id": "[id]_bg_color",
  "label": "[Card] background color"
},
{
  "type": "range",
  "id": "[id]_bg_color_opacity",
  "label": "[Card] background color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "color",
  "id": "[id]_border_color",
  "label": "[Card] border color"
},
{
  "type": "range",
  "id": "[id]_border_color_opacity",
  "label": "[Card] border color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "range",
  "id": "[id]_border_width",
  "label": "[Card] border width",
  "min": 0, "max": 6, "step": 1, "unit": "px", "default": 1
},
{
  "type": "range",
  "id": "[id]_border_radius",
  "label": "[Card] border radius",
  "min": 0, "max": 48, "step": 2, "unit": "px", "default": 8
},
{
  "type": "select",
  "id": "[id]_shadow",
  "label": "[Card] shadow",
  "options": [
    { "value": "none", "label": "None" },
    { "value": "soft", "label": "Soft" },
    { "value": "medium", "label": "Medium" },
    { "value": "strong", "label": "Strong" }
  ],
  "default": "none"
},
{
  "type": "range",
  "id": "[id]_padding",
  "label": "[Card] padding",
  "min": 8, "max": 80, "step": 4, "unit": "px", "default": 24
}
```

Hover settings (contiguous block, right after base):

```json
{
  "type": "color",
  "id": "[id]_hover_bg_color",
  "label": "[Card] hover background color"
},
{
  "type": "range",
  "id": "[id]_hover_bg_color_opacity",
  "label": "[Card] hover background color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "color",
  "id": "[id]_hover_border_color",
  "label": "[Card] hover border color"
},
{
  "type": "range",
  "id": "[id]_hover_border_color_opacity",
  "label": "[Card] hover border color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "select",
  "id": "[id]_hover_shadow",
  "label": "[Card] hover shadow",
  "options": [
    { "value": "none", "label": "None" },
    { "value": "soft", "label": "Soft" },
    { "value": "medium", "label": "Medium" },
    { "value": "strong", "label": "Strong" }
  ],
  "default": "none"
},
{
  "type": "select",
  "id": "[id]_hover_transform",
  "label": "[Card] hover effect",
  "options": [
    { "value": "none", "label": "None" },
    { "value": "lift", "label": "Lift" },
    { "value": "scale", "label": "Scale" },
    { "value": "border", "label": "Border highlight" },
    { "value": "glow", "label": "Glow" }
  ],
  "default": "none"
}
```

---

### 8.5 Image elements

Apply to every image rendered by the section (hero image, feature icon, product image). Settings go in the **Media** group, immediately after the `image_picker` + `image_alt` pair for that image.

```json
{
  "type": "range",
  "id": "[id]_border_radius",
  "label": "[Image] border radius",
  "min": 0, "max": 48, "step": 2, "unit": "px", "default": 0
},
{
  "type": "color",
  "id": "[id]_overlay_color",
  "label": "[Image] overlay color",
  "default": "#000000"
},
{
  "type": "range",
  "id": "[id]_overlay_color_opacity",
  "label": "[Image] overlay color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "range",
  "id": "[id]_overlay_opacity",
  "label": "[Image] overlay opacity",
  "min": 0, "max": 90, "step": 5, "unit": "%", "default": 0
},
{
  "type": "select",
  "id": "[id]_object_fit",
  "label": "[Image] object fit",
  "options": [
    { "value": "cover", "label": "Cover" },
    { "value": "contain", "label": "Contain" },
    { "value": "fill", "label": "Fill" }
  ],
  "default": "cover"
},
{
  "type": "select",
  "id": "[id]_aspect_ratio",
  "label": "[Image] aspect ratio",
  "options": [
    { "value": "natural", "label": "Natural" },
    { "value": "1-1", "label": "1:1" },
    { "value": "4-3", "label": "4:3" },
    { "value": "16-9", "label": "16:9" },
    { "value": "3-2", "label": "3:2" },
    { "value": "2-3", "label": "2:3" }
  ],
  "default": "natural"
}
```

Note: `[id]_overlay_color` requires its matching `[id]_overlay_color_opacity` per the global color+opacity rule. `[id]_overlay_opacity` is a separate control that governs the whole overlay layer's transparency — both settings co-exist.

---

### 8.6 Section background

Exactly one section background block per section. Settings go in the **Appearance** group, immediately after `color_scheme`.

```json
{
  "type": "color",
  "id": "bg_color",
  "label": "Background color"
},
{
  "type": "range",
  "id": "bg_opacity",
  "label": "Background opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "checkbox",
  "id": "bg_gradient",
  "label": "Enable gradient background",
  "default": false
},
{
  "type": "color",
  "id": "bg_gradient_color",
  "label": "Gradient second color",
  "visible_if": "{{ section.settings.bg_gradient }}"
},
{
  "type": "range",
  "id": "bg_gradient_color_opacity",
  "label": "Gradient second color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100,
  "visible_if": "{{ section.settings.bg_gradient }}"
},
{
  "type": "select",
  "id": "bg_gradient_direction",
  "label": "Gradient direction",
  "options": [
    { "value": "to bottom", "label": "To bottom" },
    { "value": "to right", "label": "To right" },
    { "value": "to bottom right", "label": "To bottom right" },
    { "value": "to bottom left", "label": "To bottom left" }
  ],
  "default": "to bottom",
  "visible_if": "{{ section.settings.bg_gradient }}"
}
```

Note: `bg_opacity` acts as the opacity pairing for `bg_color` — the `*_color_opacity` rule is satisfied by `bg_opacity` in this block. `bg_gradient_color` still gets its own matching `bg_gradient_color_opacity`.

---

### 8.7 Divider / border elements

Apply to every **divider line, separator, decorative border**. Settings go in the **Appearance** group.

```json
{
  "type": "color",
  "id": "[id]_color",
  "label": "[Divider] color"
},
{
  "type": "range",
  "id": "[id]_color_opacity",
  "label": "[Divider] color opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
},
{
  "type": "range",
  "id": "[id]_width",
  "label": "[Divider] width",
  "min": 1, "max": 8, "step": 1, "unit": "px", "default": 1
},
{
  "type": "select",
  "id": "[id]_style",
  "label": "[Divider] style",
  "options": [
    { "value": "solid", "label": "Solid" },
    { "value": "dashed", "label": "Dashed" },
    { "value": "dotted", "label": "Dotted" }
  ],
  "default": "solid"
},
{
  "type": "range",
  "id": "[id]_opacity",
  "label": "[Divider] opacity",
  "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100
}
```

---

### 8.8 Layout & Alignment elements

Applies to every section that has positionable content, a grid/flex container, or a centered content block. Settings go in the **Layout** group.

**Section-wide rules**

1. **`content_position`** is mandatory for **hero, banner, and full-width image sections**. For these sections, the CSS must use absolute positioning on the content wrapper with `top` / `bottom` / `left` / `right` values derived from the setting value.
2. **`[id]_text_align`** is a mandatory setting in §8.2 Text elements, placed after `[id]_transform`. Every text element in the Typography group already carries it.
3. **`items_gap`** replaces hardcoded gap values in grid/flex CSS — always use `{{ section.settings.items_gap }}px` (never a literal `gap: 16px` or a `clamp()` call). This rule applies wherever the section renders a grid or flex list of repeating items.

---

**Content position** — mandatory for hero, banner, and full-width image sections (content wrapper is absolutely positioned against the section root):

```json
{
  "type": "select",
  "id": "content_position",
  "label": "Content position",
  "options": [
    { "value": "top-left", "label": "Top left" },
    { "value": "top-center", "label": "Top center" },
    { "value": "top-right", "label": "Top right" },
    { "value": "center-left", "label": "Middle left" },
    { "value": "center", "label": "Middle center" },
    { "value": "center-right", "label": "Middle right" },
    { "value": "bottom-left", "label": "Bottom left" },
    { "value": "bottom-center", "label": "Bottom center" },
    { "value": "bottom-right", "label": "Bottom right" }
  ],
  "default": "center"
}
```

CSS pattern (one class per value, toggled on the section root):

```css
#shopify-section-{{ section.id }} .lab_[name]__content {
  position: absolute;
}
#shopify-section-{{ section.id }} .lab_[name]--pos-top-left .lab_[name]__content    { top: 0; left: 0; }
#shopify-section-{{ section.id }} .lab_[name]--pos-top-center .lab_[name]__content  { top: 0; left: 50%; transform: translateX(-50%); }
#shopify-section-{{ section.id }} .lab_[name]--pos-top-right .lab_[name]__content   { top: 0; right: 0; }
#shopify-section-{{ section.id }} .lab_[name]--pos-center-left .lab_[name]__content { top: 50%; left: 0; transform: translateY(-50%); }
#shopify-section-{{ section.id }} .lab_[name]--pos-center .lab_[name]__content      { top: 50%; left: 50%; transform: translate(-50%, -50%); }
#shopify-section-{{ section.id }} .lab_[name]--pos-center-right .lab_[name]__content{ top: 50%; right: 0; transform: translateY(-50%); }
#shopify-section-{{ section.id }} .lab_[name]--pos-bottom-left .lab_[name]__content { bottom: 0; left: 0; }
#shopify-section-{{ section.id }} .lab_[name]--pos-bottom-center .lab_[name]__content { bottom: 0; left: 50%; transform: translateX(-50%); }
#shopify-section-{{ section.id }} .lab_[name]--pos-bottom-right .lab_[name]__content { bottom: 0; right: 0; }
```

---

**Content max width** — for sections with a centered content block:

```json
{
  "type": "range",
  "id": "content_max_width",
  "label": "Content max width",
  "min": 400,
  "max": 1400,
  "step": 50,
  "unit": "px",
  "default": 800
}
```

---

**Items gap** — for every section that renders a grid or flex list (features, products, testimonials, columns). Replaces any hardcoded gap value:

```json
{
  "type": "range",
  "id": "items_gap",
  "label": "Gap between items",
  "min": 0,
  "max": 80,
  "step": 4,
  "unit": "px",
  "default": 24
}
```

CSS pattern:

```css
#shopify-section-{{ section.id }} .lab_[name]__grid {
  display: grid;
  gap: {{ section.settings.items_gap }}px;
}
```

---

**Items alignment** — for flex/grid containers where items can align to the cross axis (top / center / bottom / stretch):

```json
{
  "type": "select",
  "id": "items_align",
  "label": "Items alignment",
  "options": [
    { "value": "start", "label": "Top" },
    { "value": "center", "label": "Center" },
    { "value": "end", "label": "Bottom" },
    { "value": "stretch", "label": "Stretch" }
  ],
  "default": "start"
}
```

CSS pattern:

```css
#shopify-section-{{ section.id }} .lab_[name]__grid {
  align-items: {{ section.settings.items_align }};
}
```

---

### 8.9 Universal Section Settings — MANDATORY on every section

These settings apply to **every Liquid Lab section without exception**. No exceptions.

**Rules**

1. **§8.9 settings are mandatory on every section. No exceptions.** Every schema must include `hide_on_mobile`, `hide_on_desktop`, `section_width`, and `custom_css`, regardless of section type.
2. **`hide_on_mobile` and `hide_on_desktop` use `max-width: 749px` / `min-width: 750px` breakpoints consistently across all sections.** Do not vary these breakpoints per section — the values above are the single source of truth.
3. **`section_width` always controls the `__inner` wrapper, never the section root element itself.** The section root keeps its full-bleed box (so the background-color / gradient / color-scheme wrapper still spans the viewport edge-to-edge); only the inner wrapper width changes.
4. **Custom CSS field always comes last, immediately before `presets`, in its own `Custom CSS` header group** — after the Spacing group.

---

**Visibility** — goes in the **Layout** group:

```json
{
  "type": "checkbox",
  "id": "hide_on_mobile",
  "label": "Hide on mobile",
  "default": false
},
{
  "type": "checkbox",
  "id": "hide_on_desktop",
  "label": "Hide on desktop",
  "default": false
}
```

CSS implementation:

```liquid
{% if section.settings.hide_on_mobile %}
  @media (max-width: 749px) {
    #shopify-section-{{ section.id }} { display: none; }
  }
{% endif %}
{% if section.settings.hide_on_desktop %}
  @media (min-width: 750px) {
    #shopify-section-{{ section.id }} { display: none; }
  }
{% endif %}
```

**Note:** this is the **one allowed exception** to the "no `display: none` in CSS" rule — because it applies to the entire section wrapper, not to individual elements inside it. The `display: none` applied to the whole `#shopify-section-…` node still hides the DOM at the section boundary, which is what the merchant asked for.

---

**Section max width** — goes in the **Layout** group:

```json
{
  "type": "select",
  "id": "section_width",
  "label": "Section width",
  "options": [
    { "value": "full", "label": "Full width" },
    { "value": "boxed", "label": "Boxed (theme width)" },
    { "value": "narrow", "label": "Narrow" }
  ],
  "default": "boxed"
}
```

CSS implementation (always on `.lab_[name]__inner`, never on the section root):

```liquid
#shopify-section-{{ section.id }} .lab_[name]__inner {
  width: 100%;
  max-width: {% if section.settings.section_width == 'full' %}100%{% elsif section.settings.section_width == 'narrow' %}860px{% else %}var(--page-width, 1200px){% endif %};
  margin-inline: auto;
  padding-inline: {% if section.settings.section_width == 'full' %}0{% else %}clamp(1rem, 4vw, 2rem){% endif %};
}
```

---

**Custom CSS field** — goes at the very end of the schema, after the Spacing group and before `presets`:

```json
{
  "type": "header",
  "content": "Custom CSS"
},
{
  "type": "textarea",
  "id": "custom_css",
  "label": "Custom CSS",
  "info": "Advanced: add custom CSS that applies only to this section. Wrap selectors in #shopify-section-{{ section.id }} for proper scoping."
}
```

Liquid implementation — add this at the **end of every section's `<style>` block**:

```liquid
{% if section.settings.custom_css != blank %}
  #shopify-section-{{ section.id }} {
    {{ section.settings.custom_css }}
  }
{% endif %}
```

---

## 9. Spacing group rules

- The Spacing group must always **end** with `padding_top` and `padding_bottom`.
- Both: `range`, min `0`, max `120`, step `4`, unit `px`, default `60`.

```json
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

---

## 10. Complete annotated example — Hero section

```json
{% schema %}
{
  "name": "🧪 Hero — Basic",
  "tag": "section",
  "class": "lab_section",
  "disabled_on": {
    "groups": ["header", "footer"]
  },
  "settings": [
    { "type": "header", "content": "Content" },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Build something people remember"
    },
    {
      "type": "textarea",
      "id": "subheading",
      "label": "Subheading",
      "default": "A short supporting line that explains the value."
    },
    {
      "type": "text",
      "id": "cta_label",
      "label": "Button label",
      "default": "Shop now"
    },
    {
      "type": "url",
      "id": "cta_url",
      "label": "Button link"
    },

    { "type": "header", "content": "Typography" },
    { "type": "range", "id": "heading_size", "label": "Heading size", "min": 12, "max": 80, "step": 1, "unit": "px", "default": 48 },
    {
      "type": "select",
      "id": "heading_weight",
      "label": "Heading weight",
      "options": [
        { "value": "300", "label": "Thin" },
        { "value": "400", "label": "Regular" },
        { "value": "500", "label": "Medium" },
        { "value": "600", "label": "Semibold" },
        { "value": "700", "label": "Bold" }
      ],
      "default": "700"
    },
    {
      "type": "select",
      "id": "heading_transform",
      "label": "Heading transform",
      "options": [
        { "value": "none", "label": "None" },
        { "value": "uppercase", "label": "Uppercase" },
        { "value": "capitalize", "label": "Capitalize" }
      ],
      "default": "none"
    },
    {
      "type": "select",
      "id": "heading_text_align",
      "label": "Heading text alignment",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ],
      "default": "center"
    },
    { "type": "color", "id": "heading_color", "label": "Heading color" },
    { "type": "range", "id": "heading_color_opacity", "label": "Heading color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "range", "id": "heading_letter_spacing", "label": "Heading letter spacing", "min": -5, "max": 20, "step": 1, "unit": "em", "default": 0, "info": "1/100em" },
    { "type": "range", "id": "heading_line_height", "label": "Heading line height", "min": 10, "max": 30, "step": 1, "default": 12, "info": "1/10 (15 = 1.5)" },

    { "type": "range", "id": "subheading_size", "label": "Subheading size", "min": 12, "max": 80, "step": 1, "unit": "px", "default": 18 },
    {
      "type": "select",
      "id": "subheading_weight",
      "label": "Subheading weight",
      "options": [
        { "value": "300", "label": "Thin" },
        { "value": "400", "label": "Regular" },
        { "value": "500", "label": "Medium" },
        { "value": "600", "label": "Semibold" },
        { "value": "700", "label": "Bold" }
      ],
      "default": "400"
    },
    {
      "type": "select",
      "id": "subheading_transform",
      "label": "Subheading transform",
      "options": [
        { "value": "none", "label": "None" },
        { "value": "uppercase", "label": "Uppercase" },
        { "value": "capitalize", "label": "Capitalize" }
      ],
      "default": "none"
    },
    {
      "type": "select",
      "id": "subheading_text_align",
      "label": "Subheading text alignment",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ],
      "default": "center"
    },
    { "type": "color", "id": "subheading_color", "label": "Subheading color" },
    { "type": "range", "id": "subheading_color_opacity", "label": "Subheading color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "range", "id": "subheading_letter_spacing", "label": "Subheading letter spacing", "min": -5, "max": 20, "step": 1, "unit": "em", "default": 0 },
    { "type": "range", "id": "subheading_line_height", "label": "Subheading line height", "min": 10, "max": 30, "step": 1, "default": 15 },

    { "type": "header", "content": "Media" },
    { "type": "image_picker", "id": "image", "label": "Background image" },
    { "type": "text", "id": "image_alt", "label": "Image alt text", "default": "Hero background" },
    { "type": "range", "id": "image_border_radius", "label": "Image border radius", "min": 0, "max": 48, "step": 2, "unit": "px", "default": 0 },
    { "type": "color", "id": "image_overlay_color", "label": "Image overlay color", "default": "#000000" },
    { "type": "range", "id": "image_overlay_color_opacity", "label": "Image overlay color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "range", "id": "image_overlay_opacity", "label": "Image overlay opacity", "min": 0, "max": 90, "step": 5, "unit": "%", "default": 0 },
    {
      "type": "select",
      "id": "image_object_fit",
      "label": "Image object fit",
      "options": [
        { "value": "cover", "label": "Cover" },
        { "value": "contain", "label": "Contain" },
        { "value": "fill", "label": "Fill" }
      ],
      "default": "cover"
    },
    {
      "type": "select",
      "id": "image_aspect_ratio",
      "label": "Image aspect ratio",
      "options": [
        { "value": "natural", "label": "Natural" },
        { "value": "1-1", "label": "1:1" },
        { "value": "4-3", "label": "4:3" },
        { "value": "16-9", "label": "16:9" },
        { "value": "3-2", "label": "3:2" },
        { "value": "2-3", "label": "2:3" }
      ],
      "default": "16-9"
    },

    { "type": "header", "content": "Layout" },
    {
      "type": "select",
      "id": "content_alignment",
      "label": "Content alignment",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ],
      "default": "center"
    },
    {
      "type": "select",
      "id": "content_position",
      "label": "Content position",
      "options": [
        { "value": "top-left", "label": "Top left" },
        { "value": "top-center", "label": "Top center" },
        { "value": "top-right", "label": "Top right" },
        { "value": "center-left", "label": "Middle left" },
        { "value": "center", "label": "Middle center" },
        { "value": "center-right", "label": "Middle right" },
        { "value": "bottom-left", "label": "Bottom left" },
        { "value": "bottom-center", "label": "Bottom center" },
        { "value": "bottom-right", "label": "Bottom right" }
      ],
      "default": "center"
    },
    { "type": "range", "id": "content_max_width", "label": "Content max width", "min": 400, "max": 1400, "step": 50, "unit": "px", "default": 800 },
    {
      "type": "select",
      "id": "mobile_layout",
      "label": "Mobile layout",
      "options": [
        { "value": "stack", "label": "Stack (image first)" },
        { "value": "reverse", "label": "Reverse (text first)" }
      ],
      "default": "stack"
    },
    { "type": "checkbox", "id": "hide_on_mobile", "label": "Hide on mobile", "default": false },
    { "type": "checkbox", "id": "hide_on_desktop", "label": "Hide on desktop", "default": false },
    {
      "type": "select",
      "id": "section_width",
      "label": "Section width",
      "options": [
        { "value": "full", "label": "Full width" },
        { "value": "boxed", "label": "Boxed (theme width)" },
        { "value": "narrow", "label": "Narrow" }
      ],
      "default": "boxed"
    },

    { "type": "header", "content": "Appearance" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },

    { "type": "color", "id": "bg_color", "label": "Background color" },
    { "type": "range", "id": "bg_opacity", "label": "Background opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "checkbox", "id": "bg_gradient", "label": "Enable gradient background", "default": false },
    { "type": "color", "id": "bg_gradient_color", "label": "Gradient second color", "visible_if": "{{ section.settings.bg_gradient }}" },
    { "type": "range", "id": "bg_gradient_color_opacity", "label": "Gradient second color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100, "visible_if": "{{ section.settings.bg_gradient }}" },
    {
      "type": "select",
      "id": "bg_gradient_direction",
      "label": "Gradient direction",
      "options": [
        { "value": "to bottom", "label": "To bottom" },
        { "value": "to right", "label": "To right" },
        { "value": "to bottom right", "label": "To bottom right" },
        { "value": "to bottom left", "label": "To bottom left" }
      ],
      "default": "to bottom",
      "visible_if": "{{ section.settings.bg_gradient }}"
    },

    { "type": "color", "id": "cta_bg_color", "label": "Button background color" },
    { "type": "range", "id": "cta_bg_color_opacity", "label": "Button background color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "color", "id": "cta_text_color", "label": "Button text color" },
    { "type": "range", "id": "cta_text_color_opacity", "label": "Button text color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "color", "id": "cta_border_color", "label": "Button border color" },
    { "type": "range", "id": "cta_border_color_opacity", "label": "Button border color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "range", "id": "cta_border_width", "label": "Button border width", "min": 0, "max": 6, "step": 1, "unit": "px", "default": 1 },
    { "type": "range", "id": "cta_border_radius", "label": "Button border radius", "min": 0, "max": 50, "step": 2, "unit": "px", "default": 4 },
    { "type": "range", "id": "cta_padding_x", "label": "Button horizontal padding", "min": 8, "max": 80, "step": 2, "unit": "px", "default": 24 },
    { "type": "range", "id": "cta_padding_y", "label": "Button vertical padding", "min": 4, "max": 40, "step": 2, "unit": "px", "default": 12 },
    {
      "type": "select",
      "id": "cta_hover_effect",
      "label": "Button hover effect",
      "options": [
        { "value": "none", "label": "None" },
        { "value": "fill", "label": "Fill" },
        { "value": "darken", "label": "Darken" },
        { "value": "lift", "label": "Lift" },
        { "value": "outline", "label": "Outline" },
        { "value": "glow", "label": "Glow" }
      ],
      "default": "darken"
    },
    { "type": "color", "id": "cta_hover_bg_color", "label": "Button hover background color" },
    { "type": "range", "id": "cta_hover_bg_color_opacity", "label": "Button hover background color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "color", "id": "cta_hover_text_color", "label": "Button hover text color" },
    { "type": "range", "id": "cta_hover_text_color_opacity", "label": "Button hover text color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },
    { "type": "color", "id": "cta_hover_border_color", "label": "Button hover border color" },
    { "type": "range", "id": "cta_hover_border_color_opacity", "label": "Button hover border color opacity", "min": 0, "max": 100, "step": 5, "unit": "%", "default": 100 },

    { "type": "header", "content": "Animation" },
    { "type": "checkbox", "id": "animation_enabled", "label": "Enable animation", "default": false },
    {
      "type": "select",
      "id": "animation_type",
      "label": "Animation type",
      "options": [
        { "value": "fade", "label": "Fade" },
        { "value": "slide", "label": "Slide" },
        { "value": "zoom", "label": "Zoom" }
      ],
      "default": "fade",
      "visible_if": "{{ section.settings.animation_enabled }}"
    },
    {
      "type": "range",
      "id": "animation_delay",
      "label": "Animation delay",
      "min": 0, "max": 500, "step": 50, "unit": "ms", "default": 0,
      "visible_if": "{{ section.settings.animation_enabled }}"
    },

    { "type": "header", "content": "Spacing" },
    { "type": "range", "id": "padding_top", "label": "Padding top", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 60 },
    { "type": "range", "id": "padding_bottom", "label": "Padding bottom", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 60 },

    { "type": "header", "content": "Custom CSS" },
    {
      "type": "textarea",
      "id": "custom_css",
      "label": "Custom CSS",
      "info": "Advanced: add custom CSS that applies only to this section. Wrap selectors in #shopify-section-{{ section.id }} for proper scoping."
    }
  ],
  "presets": [
    {
      "name": "🧪 Hero — Basic",
      "category": "Liquid Lab"
    }
  ]
}
{% endschema %}
```

---

## 11. Multiple Presets Standard — MANDATORY

Every Liquid Lab section must ship **exactly three presets** in its `presets` array. The three presets give merchants three distinct visual starting points that each correspond to a recognised design language. Merchants pick the one closest to their brand and tweak from there — this dramatically reduces the "blank section" friction.

### 11.1 The three preset styles

Every section must implement these three styles, in this order:

#### 1. Minimal — clean, stripped back, lots of whitespace

For brands with a quiet, editorial, or utility-first aesthetic. Keep ornament near zero.

- Card / button `border_width`: `0` (or `1` if a hairline border is the only definition)
- Card `shadow`: `"none"`
- Card `border_radius`: `0` or `4` (square or near-square)
- Card `padding`: smaller end of the range (`16`–`24`)
- Heading `weight`: `"300"` or `"400"`
- Heading `transform`: `"none"`
- Hover `transform`: `"none"`
- `animation_enabled`: `false`
- `bg_gradient`: `false`

#### 2. Bold — strong, high contrast, impactful

For brands that want to grab attention and project confidence. Heavy weight, sharp shadow, motion.

- Card `border_width`: `0` (preferred) or `2`
- Card `shadow`: `"strong"`
- Card `border_radius`: medium (`16`–`24`)
- Card `padding`: larger (`28`–`40`)
- Heading `weight`: `"700"`
- Heading `transform`: `"uppercase"`
- Hover `transform`: `"lift"` or `"scale"`
- `animation_enabled`: `true`
- `animation_type`: `"slide"`

#### 3. Soft — rounded, gentle, approachable

For wellness, beauty, lifestyle, kids, and feminine-coded brands. Round everything, lean on light shadow and gentle motion.

- Card `border_width`: `0` or `1`
- Card `shadow`: `"soft"`
- Card `border_radius`: maximum (`32`–`48`)
- Card `padding`: comfortable (`28`–`36`)
- Heading `weight`: `"400"` or `"500"`
- Heading `transform`: `"none"`
- Hover `transform`: `"scale"` or `"glow"`
- `animation_enabled`: `true`
- `animation_type`: `"fade"`

### 11.2 Preset rules

1. **Naming format**: `"🧪 [Section short name] — [Style]"` — e.g. `"🧪 Testimonials — Minimal"`, `"🧪 Hero — Bold"`, `"🧪 Features — Soft"`. The "short name" is the same one used in the schema `name` (everything after `🧪 ` and before any other em-dash). The `🧪` and the style suffix are mandatory.
2. **Category**: every preset must include `"category": "Liquid Lab"`. No exceptions.
3. **Order**: presets must appear in this exact order — Minimal first, then Bold, then Soft. Minimal is the primary preset shown first in the picker.
4. **Settings: only override what differs from defaults.** Do not repeat every setting in every preset. If a preset's value matches the schema `default`, omit it. The presets exist to *deviate*, not to restate.
5. **Blocks: when the section supports blocks, every preset must seed a representative `blocks` array** with realistic content. Do not ship an empty block list — merchants need to see what "good" looks like for each style. Tailor the seeded copy to the style where it makes sense (a Bold preset can have shorter, punchier copy than a Soft one).
6. **No forbidden settings**: never reference setting IDs that don't exist in the section's schema. The Theme Editor will silently drop unknown IDs, and `theme check` will not flag this — so the preset would silently degrade.

### 11.3 Template

```json
"presets": [
  {
    "name": "🧪 [Short name] — Minimal",
    "category": "Liquid Lab",
    "settings": {
      "[card]_border_width": 1,
      "[card]_border_radius": 8,
      "[card]_shadow": "none",
      "[card]_padding": 20,
      "[card]_hover_transform": "none",
      "heading_weight": "300",
      "animation_enabled": false
    },
    "blocks": [
      { "type": "[block]", "settings": { "...": "..." } }
    ]
  },
  {
    "name": "🧪 [Short name] — Bold",
    "category": "Liquid Lab",
    "settings": {
      "[card]_border_width": 0,
      "[card]_border_radius": 20,
      "[card]_shadow": "strong",
      "[card]_padding": 32,
      "[card]_hover_transform": "lift",
      "heading_weight": "700",
      "heading_transform": "uppercase",
      "animation_enabled": true,
      "animation_type": "slide"
    },
    "blocks": [
      { "type": "[block]", "settings": { "...": "..." } }
    ]
  },
  {
    "name": "🧪 [Short name] — Soft",
    "category": "Liquid Lab",
    "settings": {
      "[card]_border_width": 0,
      "[card]_border_radius": 48,
      "[card]_shadow": "soft",
      "[card]_padding": 32,
      "[card]_hover_transform": "scale",
      "heading_weight": "400",
      "animation_enabled": true,
      "animation_type": "fade"
    },
    "blocks": [
      { "type": "[block]", "settings": { "...": "..." } }
    ]
  }
]
```
