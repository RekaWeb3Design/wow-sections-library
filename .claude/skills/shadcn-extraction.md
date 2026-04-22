# shadcn → Liquid extraction

Reference for converting shadcn/ui React components into Shopify Liquid sections.
Read this before running the extract/generate pipeline or hand-converting any shadcn block.

---

## 1. React props → Shopify schema settings

Every React prop becomes a merchant-editable setting. Map by prop type:

| React prop type           | Example                                | Shopify setting type | Notes                                                 |
|---------------------------|----------------------------------------|----------------------|-------------------------------------------------------|
| `string`                  | `title: string`                        | `text`               | Use `textarea` if multi-line copy expected            |
| `boolean`                 | `showIcon: boolean`                    | `checkbox`           | `default` mirrors React default                       |
| Union of string literals  | `align: "left" \| "center" \| "right"` | `select`             | Each literal → one `options[]` entry                  |
| `number`                  | `columns: number`                      | `range`              | Requires `min`, `max`, `step`, `unit`                 |
| Image source              | `image: string` (src)                  | `image_picker`       | Never use `text` for images — always `image_picker`   |
| URL / link                | `href: string`                         | `url`                | Accepts internal + external links in the theme editor |

### Conversion checklist

- Setting `id` = prop name in `snake_case` (e.g. `showIcon` → `show_icon`)
- Setting `label` = human-readable version of the prop name
- Setting `default` = React `defaultProps` or destructured default
- For `select`: preserve the literal strings as `options[].value`, title-case them as `options[].label`

---

## 2. Tailwind classes → CSS variables

shadcn uses Tailwind utility classes that reference CSS variables. Map them to the theme's color tokens (Dawn-compatible):

| Tailwind class          | CSS property         | CSS variable                 |
|-------------------------|----------------------|------------------------------|
| `bg-background`         | `background-color`   | `var(--color-background)`    |
| `text-foreground`       | `color`              | `var(--color-foreground)`    |
| `text-muted-foreground` | `color`              | `var(--color-foreground-75)` |
| `border-border`         | `border-color`       | `var(--color-border)`        |
| `bg-primary`            | `background-color`   | `var(--color-button)`        |
| `text-primary-foreground` | `color`            | `var(--color-button-text)`   |

Rule: never emit hardcoded hex values. If shadcn inlines a color (e.g. `bg-[#0f172a]`), map it to the nearest scheme token or promote it to a color-scheme setting.

Layout/spacing utilities (`flex`, `gap-4`, `p-8`) translate directly to normal CSS — but values must use `clamp()` / `vw` per SKILL.md §3.4, not raw `px` breakpoints.

---

## 3. What NOT to convert

shadcn source files contain React-only constructs that have no Liquid equivalent. Strip them entirely.

- **React imports** — `import React from 'react'`, `import { ... } from '@/components/ui/...'`. Delete all import statements.
- **State hooks** — `useState`, `useEffect`, `useReducer`, `useRef`. Any interactivity must be re-implemented from scratch in a vanilla-JS IIFE (see SKILL.md §6). Do not attempt to preserve React state logic.
- **Class utilities** — `cn()`, `clsx()`, `twMerge()`. Replace with plain string class lists. If conditional classes are needed, use Liquid `{% if %}` inside the `class="..."` attribute.
- **Next.js components** — `<Link>`, `<Image>`, `<Script>`. Replace:
  - `<Link href="...">` → `<a href="{{ setting | default: '#' }}">`
  - `<Image src="..." />` → Shopify `image_url | image_tag` pipeline (see shopify-liquid.md §1)
  - `<Script>` → inline `<script>` IIFE inside the section file

### Also skip

- TypeScript type annotations and interfaces — Liquid is untyped
- `forwardRef` wrappers — no ref equivalent in Liquid
- Storybook / test files — not part of the section output
- Tailwind `dark:` variants — Dawn color schemes handle dark mode via CSS variables, not utility prefixes
