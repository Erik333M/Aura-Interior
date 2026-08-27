# Component patterns

## Navigation

- Sticky header: `h-16` desktop / `h-14` mobile, backdrop blur + 1px bottom border that only appears after scroll (not always-on).
- Logo left, links center or left-adjacent, one CTA right. Max 5-7 top-level links.
- Mobile: full-screen sheet or drawer, not a cramped dropdown. Close on route change and on Escape.
- Active link gets weight + color change, not just an underline you can barely see.

## Hero

- One headline (2 lines max at desktop), one sub (1-2 lines, ~60ch), one primary CTA + at most one secondary.
- Headline `clamp(2.5rem, 6vw, 5rem)`, `leading-[1.05]`, `tracking-[-0.03em]`.
- Don't center everything by default — a left-aligned hero with an asymmetric visual reads more confident.
- Give the hero real vertical space (`py-24 md:py-40`), not `min-h-screen` with dead air.

## Cards

- One elevation level per surface. Cards on a card = flatten one of them.
- Padding ≥ 20px; image bleeds to the card edge (`-m-x` trick or image-first layout), never floats with uneven insets.
- Whole card is the click target when it links somewhere; keep one real `<a>` for the accessible name.
- Hover: subtle lift (`translateY(-2px)`) + border/shadow change. No scale-up on large cards.

## Forms

- Single column. Labels above inputs, always visible (no placeholder-as-label).
- Input height 40-48px, clear border, distinct focus ring, generous internal padding.
- Group related fields; use fieldset/legend semantics.
- Validate on blur, re-validate on change once errored. Error text sits under the field in the danger color with an icon.
- Submit button reflects state: idle → loading (spinner + "Saving...") → success. Disable only while in-flight.
- Autocomplete/inputmode/type attributes set correctly (`type="email"`, `inputmode="numeric"`).

## Modals / dialogs / sheets

- Overlay `rgba(0,0,0,.4-.6)` + blur optional. Panel max-w 480-640 for forms.
- Focus moves into the panel on open, trapped inside, returns to the trigger on close.
- Escape + overlay click close (unless destructive/unsaved — then confirm).
- Scroll-lock the body; the panel scrolls internally with a sticky header/footer.
- On mobile, prefer a bottom sheet over a centered modal.

## Tables / lists

- Right-align numbers, tabular-nums for figures. Left-align text.
- Sticky header row. Zebra striping OR row borders, never both.
- Row hover highlight; row actions revealed on hover but always reachable by keyboard.
- Mobile: collapse to stacked cards rather than horizontal scroll where possible.

## Pricing / feature sections

- 3 tiers max, the recommended one visually elevated (border + badge), not just bigger.
- Same number of rows in every column; align feature lists so eyes scan horizontally.
- Price is the largest type in the card; billing period is muted and adjacent.

## Testimonials / social proof

- Real names, roles, and photos or nothing. Avoid 5-star icon walls.
- Quote type larger and lighter weight than body; attribution small and muted.

## Footer

- 3-5 columns of links, then a baseline row with legal + socials. Muted text, tight but not cramped.
