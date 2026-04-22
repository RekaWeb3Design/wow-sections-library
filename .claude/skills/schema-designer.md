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
2. **Media** — images, videos, icons
3. **Layout** — alignment, columns, mobile behavior
4. **Appearance** — color scheme, backgrounds, borders
5. **Animation** — transitions, scroll effects
6. **Spacing** — padding, margins

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

## 3. Media group rules

- **Every `image_picker` is paired with a separate text field for alt text.**

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

## 4. Layout group rules

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

## 5. Appearance group rules

- Must always include `color_scheme` (`type: color_scheme`, default `scheme-1`).

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```

---

## 6. Animation group rules

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

## 7. Spacing group rules

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

## 8. Complete annotated example — Hero section

```json
{% schema %}
{
  "name": "WOW Hero — Basic",
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

    { "type": "header", "content": "Media" },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Background image"
    },
    {
      "type": "text",
      "id": "image_alt",
      "label": "Image alt text",
      "default": "Hero background"
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
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },

    { "type": "header", "content": "Animation" },
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
    },

    { "type": "header", "content": "Spacing" },
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
  ],
  "presets": [
    {
      "name": "WOW Hero — Basic"
    }
  ]
}
{% endschema %}
```
