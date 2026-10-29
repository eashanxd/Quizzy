<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quizzy Frontend Guidelines & Agent Instructions

Frontend instructions and standards for Quizzy, built with Next.js App Router and Tailwind CSS v4.

---

## 1. Stack & Architecture
- **Framework:** Next.js 16 (App Router, Turbopack, React Compiler enabled)
- **Language & Runtime:** React 19, TypeScript (strict mode enabled in `tsconfig.json`)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css` in `src/app/globals.css`)
- **UI Components:** shadcn/ui (`base-nova` style built on `@base-ui/react` primitives)
- **Icons:** Lucide React (`lucide-react`)
- **Animations:** Motion for React (`motion`)
- **Module Aliases:** Path alias `@/*` maps to `./src/*` (`@/components`, `@/lib/utils`, `@/hooks`, etc.)

---

## 2. Design Identity
- **Palette:** Forest Green primary (`oklch` deep emerald/forest tones) paired with vibrant Lime accents (`chart-1`/accent tones), supported by crisp neutrals.
- **Aesthetic:** Clean academic aesthetic — scholarly, focused, legible, and distraction-free.
- **Typography:** Inter / Geist Sans (`--font-sans`) for body and headings, with Geist Mono (`--font-mono`) for numerical readouts, code snippets, and metrics.
- **Hierarchy & Spacing:** Consistent vertical rhythm, intentional whitespace using standard Tailwind spacing (`gap-*`, `p-*`, `py-*`), and restrained border radii (`var(--radius)`: `0.625rem`).

---

## 3. Theming
- **Mode Support:** Light and dark modes supported via the `.dark` class on the root document.
- **Theme Toggle:** Ensure theme switching modifies the `.dark` class cleanly and persists user preference.
- **Semantic Tokens:** Use the semantic design tokens defined in `src/app/globals.css`:
  - Backgrounds: `--background`, `--card`, `--popover`, `--sidebar`
  - Foreground & Text: `--foreground`, `--card-foreground`, `--muted-foreground`
  - Brand & Accents: `--primary` (Forest Green), `--primary-foreground`, `--accent`, `--secondary`
  - Borders & Controls: `--border`, `--input`, `--ring`
- **Rule:** Never use hardcoded colors (e.g. `#ffffff`, arbitrary RGB values) for core interface elements; always use semantic utility classes (`bg-background`, `text-foreground`, `border-border`, etc.).

---

## 4. Components & Motion
- **Component Reuse:** Prefer accessible, reusable shadcn/ui components located in `src/components/ui/` (`button.tsx`, `card.tsx`, `badge.tsx`, `progress.tsx`).
- **Icons:** Use `lucide-react` icons with consistent sizing (`size-4`, `size-5`) and stroke widths.
- **Motion:** Use `motion` for purposeful, restrained micro-interactions (e.g., subtle card hovers, view transitions, progress feedback). Avoid gratuitous, slow, or layout-shifting animations.

---

## 5. Code Quality
- **Strict TypeScript:** No `any`. Explicitly type all props, component state, event handlers, and data models.
- **Clear Component Structure:**
  - `src/components/ui/`: Base UI primitives.
  - `src/components/`: Domain/feature-specific components (e.g., Quiz views, Flashcards, Question forms).
  - `src/lib/`: Shared utilities (`utils.ts`) and API client functions.
  - `src/hooks/`: Custom React hooks.
- **Responsive Layouts:** Mobile-first, fully responsive layouts using Tailwind breakpoints (`sm:`, `md:`, `lg:`).
- **No Unnecessary Dependencies:** Leverage existing packages (`@base-ui/react`, `motion`, `lucide-react`, `class-variance-authority`, `cn`) before proposing any additions.

---

## 6. API Integration
- **Backend Service:** Communicate with the future Flask backend via configurable `NEXT_PUBLIC_API_URL` (defaulting gracefully to `process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"`).
- **Environment Safety:** Never expose secrets, private keys, or backend credentials in `NEXT_PUBLIC_*` variables.
- **Client Organization:** Centralize network requests in typed service/fetcher modules under `src/lib/api/` with robust error and status code handling.

---

## 7. Deployment & Resilience
- **Vercel Compatibility:** Maintain compatibility with standard Vercel Next.js deployments.
- **Directives:** Mark interactive components requiring state or browser APIs explicitly with `"use client"`.
- **States:** Gracefully handle all UI states for asynchronous views:
  - **Loading:** Display skeletons or Next.js `loading.tsx` loaders.
  - **Empty:** Provide informative empty states with clear actions.
  - **Error:** Catch runtime and fetch issues with Next.js `error.tsx` or inline error banners.

---

## 8. Verification Checks
Run available verification checks after making meaningful changes:
- `npm run lint` — Validate ESLint rules.
- `npm run build` — Verify production build and strict TypeScript compilation.
- `npm run dev` — Run Turbopack local dev server for manual verification.

---

## 9. Safety & Workflow
- **Inspect First:** Always inspect existing code and file dependencies before editing.
- **Preserve Boundaries:** Avoid modifying unrelated files or reconfiguring build tools (`next.config.ts`, `components.json`, `tsconfig.json`) without explicit approval.
- **Preserve Agent Rules:** Always keep the top `<!-- BEGIN:nextjs-agent-rules -->` block intact in this file.
