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

Run the pipeline in this order:

```bash
npm run extract    # Scrape source (shadcn/ui, etc.)
npm run generate   # Generate Liquid sections from extracted data
npm run validate   # Run shopify theme check on sections/
npm run registry   # Regenerate registry/index.json
```

Or run all at once:

```bash
npm run pipeline
```

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
