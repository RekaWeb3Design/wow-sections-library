# Shopify Liquid — Dawn-compatible patterns

Reference for Dawn-compatible Liquid patterns used across all Liquid Lab sections.
Read this before generating any Liquid output that renders images, buttons, products, or uses color schemes.

---

## 1. Image rendering

Always use `image_url` + `image_tag` filters. Never hardcode `<img>` tags.

```liquid
{{ section.settings.image
  | image_url: width: 1200
  | image_tag:
    alt: section.settings.image_alt | default: section.settings.heading,
    loading: 'lazy',
    class: 'lab_hero__image'
}}
```

- `width:` caps the output width (Shopify generates responsive srcset automatically)
- `alt:` always falls back to a meaningful string — never empty unless decorative
- `class:` follows `lab_` prefix convention

---

## 2. LCP optimization — eager vs lazy

First two sections on the page are likely above-the-fold. Load eagerly.

```liquid
{% if section.index <= 2 %}
  {% assign image_loading = 'eager' %}
  {% assign image_fetchpriority = 'high' %}
{% else %}
  {% assign image_loading = 'lazy' %}
  {% assign image_fetchpriority = 'auto' %}
{% endif %}

{{ section.settings.image
  | image_url: width: 1600
  | image_tag:
    alt: section.settings.image_alt,
    loading: image_loading,
    fetchpriority: image_fetchpriority,
    class: 'lab_hero__image'
}}
```

---

## 3. Button rendering with blank check

Render the button only if the label is present. Link is optional — fall back to `#`.

```liquid
{% if section.settings.cta_label != blank %}
  <a
    href="{{ section.settings.cta_url | default: '#' }}"
    class="lab_hero__cta"
    aria-label="{{ section.settings.cta_label }}"
  >
    {{ section.settings.cta_label }}
  </a>
{% endif %}
```

---

## 4. Collection product loop with limit

Loop over a selected collection, respect a merchant-defined limit.

```liquid
{% assign product_limit = section.settings.product_limit | default: 4 %}

{% if section.settings.collection != blank %}
  <div class="lab_products__grid">
    {% for product in section.settings.collection.products limit: product_limit %}
      <a href="{{ product.url }}" class="lab_products__card">
        {{ product.featured_image
          | image_url: width: 600
          | image_tag:
            alt: product.featured_image.alt | default: product.title,
            loading: 'lazy',
            class: 'lab_products__image'
        }}
        <h3 class="lab_products__title">{{ product.title }}</h3>
        <span class="lab_products__price">{{ product.price | money }}</span>
      </a>
    {% endfor %}
  </div>
{% endif %}
```

---

## 5. Color scheme wrapper

Dawn uses color scheme classes on a wrapping div to apply theme colors. Always wrap the section's visual root with this class.

```liquid
<div class="color-{{ section.settings.color_scheme }} gradient">
  <section id="lab-{{ section.id }}" class="lab_hero lab_section">
    {% comment %} content {% endcomment %}
  </section>
</div>
```

The `color-{{ scheme_id }}` class sets CSS variables like `--color-background`, `--color-foreground`. The `gradient` class applies the scheme's background gradient if defined.

---

## 6. Color scheme setting — schema JSON

Add this to every section's schema `settings` array (under the **Appearance** group):

```json
{
  "type": "header",
  "content": "Appearance"
},
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```

---

## 7. Standard padding application

Spacing values come from the required `padding_top` / `padding_bottom` settings (see SKILL.md §4.3). Apply inside the section's scoped CSS block:

```liquid
<style>
  #shopify-section-{{ section.id }} .lab_hero {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
</style>
```

For responsive scaling, combine with `clamp()` on inner spacing (gap, inner padding) — but `padding_top` / `padding_bottom` stay as-is, merchant-controlled in px.
