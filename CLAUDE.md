# CLAUDE.md — WOW Section Library

## What the project is

**WOW Section Library** — Shopify Liquid sections, developer-first, MCP-compatible.

Shopify Liquid section library that:
- Developers can pull via Claude Code MCP
- Merchants can install via copy-paste

## Key skill files to always read

Always read these before generating or modifying any section:

- [.claude/skills/SKILL.md](.claude/skills/SKILL.md) — WOW conventions (naming, CSS scoping, schema structure)
- [.claude/skills/shopify-liquid.md](.claude/skills/shopify-liquid.md) — Liquid patterns (image rendering, LCP, color schemes, padding)
- [.claude/skills/shadcn-extraction.md](.claude/skills/shadcn-extraction.md) — shadcn → Liquid conversion (props mapping, Tailwind → CSS vars)

## Workflow

Available MCP servers for section generation:

- **shadcn MCP** — direct shadcn/ui component access (search, view, get items)
- **reactbits MCP** — React component inspiration source
- **magic-ui MCP** — additional UI component source
- **firecrawl MCP** — web scraping for shadcnblocks.com and shadcncraft.com
- **cloudflare MCP** — deployment for preview site

Pipeline workflow (no scraping scripts needed):

1. Use **shadcn** or **reactbits** or **firecrawl** MCP to get source component
2. **Schema Designer** — design Theme Editor settings
3. **Generator** — write Liquid code following [SKILL.md](.claude/skills/SKILL.md) conventions
4. **Performance check** — follow [performance.md](.claude/skills/performance.md) rules
5. **Compatibility check** — follow [compatibility.md](.claude/skills/compatibility.md) rules
6. **Validator** — run `shopify theme check`
7. **Registry** — create JSON metadata, update index

## Shopify CLI commands

```bash
shopify theme check sections/   # Lint/validate sections
shopify theme dev               # Start local dev server with live reload
shopify theme push              # Push current theme to connected store
```

## Git branch strategy

- `main` — finished, reviewed sections only
- `feat/wow-[name]` — new section development (e.g. `feat/wow-hero-basic`)

Branch per section. Merge to `main` only after passing validation and manual review.

## Hard rules

These are non-negotiable. Violating any of them means the section is broken.

### Pipeline
- Read [.claude/skills/SKILL.md](.claude/skills/SKILL.md), [.claude/skills/shopify-liquid.md](.claude/skills/shopify-liquid.md), and [.claude/skills/shadcn-extraction.md](.claude/skills/shadcn-extraction.md) before generating or editing any section.
- Never generate a section without following all 7 pipeline steps: Extract → Schema Design → Generate → Performance → Compatibility → Validate → Registry.
- Run `shopify theme check --path .` before marking any section complete.
- Create the registry JSON file and update `registry/index.json` after every new section.

### CSS
- Never use `!important`.
- Never use max-width media queries — mobile-first `min-width` only.
- Never hardcode colors — CSS variables only (no hex, no `rgb()`, no `hsl()`).
- Never use `display: none` — use Liquid `{% if %}` to skip rendering instead.
- Scope every CSS selector inside `#shopify-section-{{ section.id }}`.
- Prefix every CSS class with `wow_`.

### JavaScript
- No external JavaScript libraries in sections — vanilla JS only.

### Schema
- Every section includes `padding_top` and `padding_bottom` settings.
- Every section includes a `color_scheme` setting.
- Every section includes a `presets` block.
- Every `image_picker` is paired with an `image_alt` text setting.
- Every button label is paired with a button url setting.

### Commits
- Format: `feat: wow-[name] — [one line description]` for new sections.
- Prefix every commit with `feat:`, `fix:`, or `docs:`.
