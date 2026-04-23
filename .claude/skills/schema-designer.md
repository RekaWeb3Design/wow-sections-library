# Schema Designer — WOW Section Library

Rules for designing Theme Editor settings (the `{% schema %}` block) on every WOW section.

---

## 0. Preset category — MANDATORY

Every preset must include `"category": "WOW Sections"`. Shopify groups sections in the Theme Editor's "Add section" picker by this category, so this is how merchants find WOW sections as a distinct group rather than scattered among the theme's native sections.

```json
"presets": [
  {
    "name": "⚡ [Short name]",
    "category": "WOW Sections"
  }
]
```

The Theme Editor's left-rail (already-added sections) cannot have custom groups — that tree is hard-coded to Header/Template/Footer. The `⚡` in the `name` field is the only distinguishing marker there. But the "Add section" picker respects `category`, so that's where this rule applies.

---

## 1. Settings group order — MANDATORY

Settings must always be grouped in this order:

1. **Content** — text, headings, links, copy
2. **Typography** — sizes, weights, colors, letter spacing, line height of every text element
3. **Media** — images, videos, icons
4. **Layout** — alignment, columns, mobile behavior
5. **Appearance** — color scheme, section background, cards, buttons, borders, shadows
6. **Animation** — transitions, scroll effects
7. **Spacing** — padding, margins

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
  "name": "⚡ Hero — Basic",
  "tag": "section",
  "class": "wow_section",
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
      "id": "mobile_layout",
      "label": "Mobile layout",
      "options": [
        { "value": "stack", "label": "Stack (image first)" },
        { "value": "reverse", "label": "Reverse (text first)" }
      ],
      "default": "stack"
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
    { "type": "range", "id": "padding_bottom", "label": "Padding bottom", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 60 }
  ],
  "presets": [
    {
      "name": "⚡ Hero — Basic",
      "category": "WOW Sections"
    }
  ]
}
{% endschema %}
```
