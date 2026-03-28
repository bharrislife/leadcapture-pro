# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured yet.

## Tech Stack

- **Next.js 16** (App Router, RSC enabled) with **TypeScript**
- **Tailwind CSS v4** — configured via CSS imports (`@import "tailwindcss"`) in `globals.css`, not `tailwind.config.js`
- **shadcn/ui** (new-york style, neutral base color) — components live in `src/components/ui/`, add new ones with `npx shadcn@latest add <component>`
- **Radix UI** imported directly from the `radix-ui` package (not `@radix-ui/*` scoped packages)
- **Supabase** (`@supabase/supabase-js`) and **Stripe** (`stripe` + `@stripe/stripe-js`) are installed but not yet wired up

## Architecture

This is an early-stage SaaS landing page for a trade show lead capture product ($599/year, targeting Asian exhibitors).

- `src/app/` — Next.js App Router pages and layouts
- `src/components/ui/` — shadcn/ui primitives
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

Design tokens (colors, radius) are defined as CSS custom properties in `globals.css` using `oklch()` values and mapped into Tailwind via `@theme inline`.

## Persona & Product Context

See `BETTY_STYLE.md` for the product's voice and tone guidelines (used for copy/marketing content, not code style).
