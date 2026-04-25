# CLAUDE.md — Liquid Lab

## What the project is

**Liquid Lab** — Shopify Liquid sections, developer-first, MCP-compatible.

Shopify Liquid section library that:
- Developers can pull via Claude Code MCP
- Merchants can install via copy-paste

## Folder layout

Sections are organized by **tier** (free/pro), then by **category**:

- `sections/free/[category]/liquid-lab-[name].liquid` — free-tier sections
- `sections/pro/[category]/liquid-lab-[name].liquid` — pro-tier sections
- `snippets/` — shared Liquid snippets reusable across sections
- `scripts/lab/` — standalone vanilla JS modules (loaded only when a section needs them)
- `effects/` — standalone CSS effect files (animations, transitions, visual flourishes)
- `registry/sections/free/` and `registry/sections/pro/` — metadata JSON mirroring the tier split

Categories in use: `hero`, `features`, `social-proof`, `collections`, `conversion`, `navigation`, `content`, `contact`. The same category slugs exist under both `free/` and `pro/`.

## Key skill files to always read

Always read these before generating or modifying any section:

- [.claude/skills/SKILL.md](.claude/skills/SKILL.md) — Liquid Lab conventions (naming, CSS scoping, schema structure)
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
shopify theme check --path .    # Lint/validate all sections across tiers
shopify theme dev               # Start local dev server with live reload
shopify theme push              # Push current theme to connected store
```

## Git branch strategy

- `main` — finished, reviewed sections only
- `feat/liquid-lab-[name]` — new section development (e.g. `feat/liquid-lab-hero-basic`)

Branch per section. Merge to `main` only after passing validation and manual review.

## Hard rules

These are non-negotiable. Violating any of them means the section is broken.

### Pipeline
- Read [.claude/skills/SKILL.md](.claude/skills/SKILL.md), [.claude/skills/shopify-liquid.md](.claude/skills/shopify-liquid.md), and [.claude/skills/shadcn-extraction.md](.claude/skills/shadcn-extraction.md) before generating or editing any section.
- Never generate a section without following all 7 pipeline steps: Extract → Schema Design → Generate → Performance → Compatibility → Validate → Registry.
- Run `shopify theme check --path .` before marking any section complete.
- Create the registry JSON file and update `registry/index.json` after every new section.
- After generating or editing any section, run `npm run sync` to copy the section into `../dawn-dev/sections/` and push it to the live dev store. The PostToolUse hook triggers this automatically on any `.liquid` edit under `sections/`, but the command must also be runnable manually from the project root.
- After every section generation, run `npm run validate-all` (theme check + mobile check + accessibility check). Fix all FAILs before committing. WARNs must be manually verified on mobile preview at 375px viewport width. See [.claude/skills/mobile-check.md](.claude/skills/mobile-check.md).
- Every section must pass `npm run a11y-check` with 0 FAILs before committing. Read [.claude/skills/accessibility.md](.claude/skills/accessibility.md) before generating any section.

### CSS
- Never use `!important`.
- Never use max-width media queries — mobile-first `min-width` only.
- Never hardcode colors — CSS variables only (no hex, no `rgb()`, no `hsl()`).
- Never use `display: none` — use Liquid `{% if %}` to skip rendering instead.
- Scope every CSS selector inside `#shopify-section-{{ section.id }}`.
- Prefix every CSS class with `lab_`.

### JavaScript
- No external JavaScript libraries in sections — vanilla JS only.

### Schema
- Every section includes `padding_top` and `padding_bottom` settings.
- Every section includes a `color_scheme` setting.
- Every section includes a `presets` block.
- Every `image_picker` is paired with an `image_alt` text setting.
- Every button label is paired with a button url setting.

### Commits
- Format: `feat: liquid-lab-[name] — [one line description]` for new sections.
- Prefix every commit with one of: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
