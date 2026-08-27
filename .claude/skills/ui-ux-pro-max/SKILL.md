---
name: ui-ux-pro-max
description: Design and build production-grade UI. Use when creating or refining any user-facing interface — pages, sections, components, layouts, forms, navigation, empty states, dashboards — or when the user says the UI feels "off", "cheap", "generic", "unpolished", or asks to make something look better, more premium, or more modern. Enforces a spacing/type/color system, real interaction states, accessibility, and a final polish pass.
---

# UI/UX Pro Max

Ship interfaces that look considered, not generated. Default output is production-grade, not a wireframe.

## 0. Before writing any UI

1. Look at what already exists — read 2-3 neighboring components, the global CSS / Tailwind config, and any design tokens. **Match the codebase's existing system.** Never introduce a second spacing scale, a second button style, or a competing color palette.
2. If nothing exists yet, establish the system first (see §1) and write it into the config/tokens file, then build against it.
3. Identify the one thing the screen is for. Everything else is subordinate to it.

## 1. The system (non-negotiable)

**Spacing** — one scale, 4px-based: `4 8 12 16 24 32 48 64 96 128`. No arbitrary `padding: 13px`. Related elements sit close; unrelated elements sit far. Gaps between groups should be at least 2x the gaps within a group.

**Type** — max 2 families, 4-5 sizes, 3 weights. Ratio ~1.25 (12/14/16/20/25/31/39/49). Body 16px minimum. Line-height: 1.5-1.65 body, 1.1-1.25 headings. Measure 60-75ch for prose. Tighten letter-spacing on large headings (`-0.02em`), never on small text.

**Color** — one accent, one neutral ramp (9-11 steps), semantic states (success/warn/danger). Backgrounds are near-neutral, not pure `#fff`/`#000`. Text sits on the ramp, not on hardcoded hexes. Contrast: 4.5:1 body, 3:1 large text and UI borders — verify, don't estimate.

**Radius & elevation** — pick one radius scale and stay in it. Shadows are layered and low-opacity (`0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`), never a single hard `0 4px 8px black`. Prefer borders + subtle shadow over heavy drop shadows.

## 2. Hierarchy

- Establish size, weight, and color contrast _between_ levels — if two elements look equally important, one is wrong.
- One primary action per view. Secondary actions are ghost/outline. Destructive is not a red primary button unless it's the point of the screen.
- Use weight and color to demote, not just gray-on-gray. Muted text is a ramp step (e.g. neutral-500), never `opacity: .5` on top of a colored parent.
- Alignment: pick a grid and hold it. Optical alignment beats mathematical alignment for icons and glyphs.

## 3. States — build all of them, always

Every interactive element needs: `default → hover → active → focus-visible → disabled → loading`. Every data surface needs: `loading (skeleton, not a spinner) → empty → error → partial → full`.

- `:focus-visible` must be a visible ring with offset. Never `outline: none` without a replacement.
- Empty states get an explanation and the action that fills them — not just "No results".
- Errors say what happened and what to do next. Inline, next to the field, not only a toast.
- Buttons keep their width while loading (don't reflow the layout).
- Touch targets ≥ 44x44px.

## 4. Motion

Motion clarifies cause and effect; it is not decoration. Durations 150-250ms for UI feedback, 300-500ms for entrances/layout. Ease out for entering, ease in for exiting. Animate `transform` and `opacity` only. Respect `prefers-reduced-motion`.
**If this project uses Framer Motion / Motion, use the `framer-motion` skill for implementation.**

## 5. Responsive

Design the narrow layout first, then let it breathe. Breakpoints come from where the content breaks, not from device names. Use fluid type/space (`clamp()`) instead of stacking breakpoint overrides. Test at 360px, 768px, 1280px, 1920px. Nothing overflows horizontally; long strings and unbounded user content get `min-w-0` / `truncate` / `break-words`.

## 6. Accessibility (checked, not assumed)

Semantic elements first (`button`, `nav`, `main`, `h1..h6` in order). Labels tied to inputs. `alt` text that describes purpose. Keyboard: full tab order, escape closes overlays, focus trapped in modals and restored on close. `aria-*` only when semantics can't carry it. Never convey meaning by color alone.

## 7. Polish pass — run before calling it done

- [ ] Every value comes from the spacing/type/color scale
- [ ] Optical alignment checked at 200% zoom
- [ ] All 6 interaction states + all 5 data states exist
- [ ] Contrast verified on text, borders, and icons
- [ ] Keyboard-only walkthrough completes the main task
- [ ] Layout holds at 360px and 1920px; no horizontal scroll
- [ ] Dark mode (if present) redefines tokens, not one-off colors
- [ ] Loading is skeletons; no layout shift when data arrives
- [ ] Copy is specific — no "Lorem ipsum", no "Click here", no "Something went wrong"
- [ ] Nothing is centered-everything; there's a clear reading path

## Reference files

- `references/patterns.md` — component-level recipes (nav, hero, cards, forms, modals, tables, pricing)
- `references/aesthetics.md` — how to hit a specific visual direction (premium/editorial, brutalist, soft SaaS, dark technical)
