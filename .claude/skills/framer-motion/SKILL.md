---
name: framer-motion
description: Implement animation and motion with Framer Motion / Motion for React. Use when adding or fixing any animation — entrances, scroll reveals, page or route transitions, hover/tap feedback, layout and shared-element transitions, drag, parallax, staggered lists, modal/accordion enter-exit — or when animations feel janky, laggy, abrupt, or fail to run. Covers the motion component API, AnimatePresence, variants, layout animations, motion values, scroll hooks, performance, and reduced motion.
---

# Framer Motion / Motion for React

## 0. First: which package?

Check `package.json` before importing.

- `motion` (v12+, current) → `import { motion, AnimatePresence } from "motion/react"`
- `framer-motion` (v11 and earlier, still fine) → `import { motion, AnimatePresence } from "framer-motion"`

Same API in both. Never mix imports from both in one file. If neither is installed, install `motion` and use `motion/react`.

**Next.js App Router:** any file using `motion` needs `"use client"` at the top.

## 1. Core API

```jsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -12 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.98 }}
/>
```

- Any HTML/SVG element: `motion.section`, `motion.li`, `motion.path`.
- Wrap your own component with `motion.create(MyComponent)` (v12) / `motion(MyComponent)` (v11) — it must forward the ref.
- `initial={false}` skips the mount animation and starts at the `animate` state.

**Transitions**

```js
{ type: "spring", stiffness: 400, damping: 30 }      // physical, interruptible — default for UI feedback
{ type: "spring", duration: 0.5, bounce: 0.2 }        // spring with a duration you control
{ type: "tween", duration: 0.4, ease: "easeOut" }     // deterministic — for fades and long entrances
{ duration: 0.6, delay: 0.1, repeat: Infinity, repeatType: "reverse" }
```

Per-property transitions: `transition={{ y: { type: "spring" }, opacity: { duration: 0.2 } }}`.

## 2. Variants (use these for anything with children)

Variants propagate from parent to children automatically — children don't need their own `initial`/`animate` props.

```jsx
const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

<motion.ul variants={list} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i.id} variants={item}>{i.label}</motion.li>)}
</motion.ul>
```

Also: `staggerDirection: -1`, `when: "beforeChildren" | "afterChildren"`.

## 3. Exit animations — AnimatePresence

```jsx
<AnimatePresence mode="wait">
  {open && <motion.div key="panel" initial={...} animate={...} exit={...} />}
</AnimatePresence>
```

Rules that break it if ignored:

- The child must be a **direct** child of `AnimatePresence` and have a stable, unique `key`.
- `AnimatePresence` must not itself unmount when the child does.
- `mode="wait"` (out then in) for tab/route swaps, `"popLayout"` when removed items should let siblings reflow smoothly, `"sync"` (default) otherwise.
- `initial={false}` on `AnimatePresence` suppresses the first-mount animation.

## 4. Layout & shared element transitions

```jsx
<motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
```

- `layout` animates position/size changes (reorder, expand/collapse, list filtering) using transforms — cheap and smooth.
- `layout="position"` animates position only (use it when the content shouldn't stretch/squash).
- `layoutId="card-1"` on two elements in different trees = shared element / magic-move transition.
- Wrap sibling groups in `<LayoutGroup>` so they animate against each other.
- Direct children of a `layout` parent that shouldn't distort need `layout` too, or a fixed size.
- `<Reorder.Group>` / `<Reorder.Item>` for drag-to-reorder lists.

## 5. Scroll

```jsx
// Reveal on scroll — this is the default for section entrances
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
/>

// Parallax / scroll-linked
const ref = useRef(null)
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
const smoothY = useSpring(y, { stiffness: 100, damping: 30 })
<motion.img ref={ref} style={{ y: smoothY }} />
```

Always set `viewport={{ once: true }}` for content reveals — re-animating on every scroll-by is annoying.

## 6. Motion values & imperative control

```jsx
const x = useMotionValue(0);
const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
const bg = useMotionTemplate`linear-gradient(${x}deg, #000, #fff)`;
useMotionValueEvent(scrollY, 'change', (v) => setHidden(v > 100));

const [scope, animate] = useAnimate();
await animate(scope.current, { opacity: 1 });
animate([
  ['.a', { x: 100 }],
  ['.b', { y: 50 }, { at: '-0.2' }],
]); // sequence
```

Motion values update outside React render — driving `style` with them never triggers a re-render. Use them for anything continuous (scroll, drag, pointer).

## 7. Performance

- Animate **`transform` (x/y/scale/rotate) and `opacity` only.** Animating `width`, `height`, `top`, `left`, `margin`, `filter`, or `box-shadow` causes layout/paint every frame — use `layout` or `scale` instead.
- Prefer `layout` over animating width/height directly.
- Cut bundle size: `<LazyMotion features={domAnimation} strict>` + use `m.div` instead of `motion.div` (~5kb vs ~34kb). `domMax` if you need drag/layout.
- Don't animate hundreds of elements at once; stagger and cap, or animate a parent.
- Avoid remounting animated subtrees on every parent render (inline component definitions, unstable keys) — it restarts animations and looks like jank.
- Long lists: virtualize, and skip `layout` on off-screen rows.

## 8. Reduced motion (required)

```jsx
<MotionConfig reducedMotion="user">   // app root — degrades transforms to opacity-only
```

or per-component:

```jsx
const reduce = useReducedMotion()
<motion.div animate={{ y: reduce ? 0 : -20, opacity: 1 }} />
```

## 9. Taste defaults

| Use                     | Transition                                      |
| ----------------------- | ----------------------------------------------- |
| Hover / tap feedback    | `spring, stiffness 400, damping 30`             |
| Modal / dropdown in     | `duration 0.2, easeOut` + scale 0.96→1          |
| Modal / dropdown out    | `duration 0.15, easeIn`                         |
| Section scroll reveal   | `duration 0.6, ease [0.22, 1, 0.36, 1]`, y 40→0 |
| Stagger between items   | `0.06 - 0.1s`                                   |
| Layout / shared element | `spring, stiffness 500, damping 40`             |
| Page transition         | `duration 0.3-0.4`, `mode="wait"`               |

Move things a short distance (16-40px). Fade + small translate beats scale + rotate. If an animation delays the user seeing content by more than ~600ms, it's too slow.

## Reference files

- `references/recipes.md` — copy-paste implementations (page transitions, modal, accordion, marquee, magnetic button, text reveal, drawer, image reveal)
- `references/troubleshooting.md` — why an animation isn't running
