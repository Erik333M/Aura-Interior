# Why isn't it animating?

**Exit animation never runs**

- Child isn't a _direct_ child of `AnimatePresence`, or has no stable `key`.
- The `AnimatePresence` itself unmounts at the same time as the child. Hoist it up.
- Conditional returns `null` above the `AnimatePresence` in the same component.
- Next.js App Router: exit on route change needs a `key={pathname}` wrapper; nested layouts can swallow it.

**"You're importing a component that needs useState / createContext" (Next.js)**

- Missing `"use client"` in the file that imports `motion`.

**Nothing animates at all**

- Mixed imports from `motion/react` and `framer-motion` in the same tree.
- Component wrapped with `motion(X)` doesn't forward its ref to a DOM node.
- `prefers-reduced-motion` is on in the OS and `MotionConfig reducedMotion="user"` is stripping transforms — expected.

**Animation restarts constantly / flickers**

- The animated component is defined inside another component's render → remounted every render. Move it to module scope.
- The `variants`/`transition`/`animate` object is recreated inline with new values each render and something is keying off it. Hoist constants to module scope.
- Unstable `key` (index in a reordering list, `Math.random()`).

**Layout animation distorts children (stretched text/images)**

- Add `layout` to the child too, or use `layout="position"` on the parent, or give the child a fixed size.
- Border-radius warps: put `borderRadius` in `style`, not in a CSS class, so Motion can correct it.

**Janky / low FPS**

- Animating `width`, `height`, `top`, `left`, `margin`, `padding`, `filter`, `box-shadow`. Use transforms or `layout`.
- Too many simultaneous animations — stagger, or animate a single parent.
- Heavy re-renders during the animation: drive it with motion values + `style`, not React state.
- Large blurred/shadowed elements being transformed — reduce blur radius or size.

**whileInView never fires**

- An ancestor has `overflow: hidden` / is the scroll container: pass `viewport={{ root: scrollRef }}`.
- `amount` too high for a tall element — use `amount: "some"` or a smaller number.
- Element already in view on mount with `once: true` and an `initial` that matches — it "already ran".

**Drag does nothing**

- Missing `dragConstraints`, or a parent with `touch-action` interfering. Set `dragMomentum={false}` for precise control.
- Using `LazyMotion` with `domAnimation` — drag/layout need `domMax`.

**Hydration mismatch / flash of unstyled motion**

- SSR renders the `initial` state. Either accept it, or use `initial={false}` and animate from an effect.
